import { createClient } from "redis";
import { env } from "./env";

const redis = createClient({
  url: env.redisUrl,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export { redis };