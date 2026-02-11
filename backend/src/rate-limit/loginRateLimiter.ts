import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { env } from "../config/env";

const redisClient = new Redis(env.redisUrl);

export const loginRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:login",
  points: 5,
  duration: 60,
});