import { Router } from "express";
import { login } from "./auth.service";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const result = await login(username, password);
  if (!result) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.cookie("access_token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // تو prod وقتی HTTPS داشتی اینو true می‌کنی
    maxAge: 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

export default router;

