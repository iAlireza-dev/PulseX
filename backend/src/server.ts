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

// 🔐 WebSocket auth middleware
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

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 PulseX backend running on http://localhost:${PORT}`);
});
