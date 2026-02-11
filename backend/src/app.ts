import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000", // Next frontend
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRoutes);

  return app;
}
