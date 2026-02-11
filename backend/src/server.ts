import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";

const PORT = process.env.PORT || 3001;

const app = createApp();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Next frontend
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 PulseX backend running on http://localhost:${PORT}`);
});
