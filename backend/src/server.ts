import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { verifyAccessToken } from "./config/jwt";
import { env } from "./config/env";
import { redis } from "./config/redis";
import { wsMessageRateLimiter, wsPingRateLimiter } from "./rate-limit/wsRatelimiter";
import { attachRedisAdapter } from "./ws/redisAdapter";

const app = createApp();
const httpServer = http.createServer(app);

function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    cookies[key] = decodeURIComponent(rest.join("="));
  });

  return cookies;
}

const io = new Server(httpServer, {
  cors: {
    origin: env.frontendOrigin,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const cookies = parseCookies(socket.request.headers.cookie);
    const token = cookies["access_token"];

    if (!token) {
      return next(new Error("Unauthorized: no token"));
    }

    const { payload } = await verifyAccessToken(token);

    socket.data.user = {
      id: payload.sub,
      username: (payload as any).username,
    };

    next();
  } catch {
    return next(new Error("Unauthorized: invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🔌 socket connected:", socket.id, "user:", socket.data.user);

  socket.emit("server:welcome", {
    message: "Welcome to PulseX",
    user: socket.data.user,
    connectedAt: new Date().toISOString(),
  });

  socket.on("client:ping", async () => {
    const userId = socket.data.user?.id;
    if (!userId) return;

    try {
      await wsPingRateLimiter.consume(String(userId));
    } catch (err: any) {
      if (err?.msBeforeNext) {
        socket.emit("server:rateLimited", {
          scope: "ping",
          retryAfter: err.msBeforeNext,
        });
      }
      return;
    }

    socket.emit("server:pong", {
      ts: new Date().toISOString(),
    });
  });

  socket.on("client:joinRoom", (data: { room: string }) => {
    const room = data?.room?.trim();
    if (!room) return;

    const previous = socket.data.room as string | undefined;
    if (previous) {
      socket.leave(previous);
    }

    socket.join(room);
    socket.data.room = room;

    socket.emit("server:roomJoined", {
      room,
    });
  });

  socket.on("client:leaveRoom", () => {
    const room = socket.data.room as string | undefined;
    if (!room) return;

    socket.leave(room);
    socket.data.room = undefined;

    socket.emit("server:roomLeft", {});
  });

  socket.on("client:roomMessage", async (data: { text: string }) => {
    const userId = socket.data.user?.id;
    if (!userId) return;

    const room = socket.data.room as string | undefined;
    const text = data?.text?.trim();
    if (!room || !text) return;

    try {
      await wsMessageRateLimiter.consume(String(userId));
    } catch (err: any) {
      if (err?.msBeforeNext) {
        socket.emit("server:rateLimited", {
          scope: "roomMessage",
          retryAfter: err.msBeforeNext,
        });
      }
      return;
    }

    io.to(room).emit("server:roomMessage", {
      room,
      user: socket.data.user,
      text,
      ts: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected:", socket.id);
  });
});

async function start() {
  await redis.connect();
  const detachAdapter = await attachRedisAdapter(io);

  httpServer.listen(env.port, () => {
    console.log(`🚀 PulseX backend running on http://localhost:${env.port}`);
  });

  process.on("SIGINT", async () => {
    await detachAdapter();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await detachAdapter();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});