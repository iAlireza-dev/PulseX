import { Router } from "express";
import { login } from "./auth.service";
import { loginRateLimiter } from "../rate-limit/loginRateLimiter";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";

  const key = `${username}:${ip}`;

  try {
    await loginRateLimiter.consume(key);
  } catch (err: any) {
    if (err?.msBeforeNext) {
      return res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        retryAfter: err.msBeforeNext,
      });
    }

    return res.status(500).json({
      error: "Rate limiter error",
    });
  }

  const result = await login(username, password);
  if (!result) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.cookie("access_token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

export default router;
