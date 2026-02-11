import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { verifyAccessToken } from "./config/jwt";

const PORT = process.env.PORT || 3001;

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
    origin: "http://localhost:3000",
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
  } catch (err) {
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

  socket.on("client:ping", () => {
    console.log("📡 ping from", socket.data.user);
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

  socket.on("client:roomMessage", (data: { text: string }) => {
    const room = socket.data.room as string | undefined;
    const text = data?.text?.trim();
    if (!room || !text) return;

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

httpServer.listen(PORT, () => {
  console.log(`🚀 PulseX backend running on http://localhost:${PORT}`);
});