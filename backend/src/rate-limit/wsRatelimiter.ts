import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { env } from "../config/env";

const redisClient = new Redis(env.redisUrl);

export const wsMessageRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:ws:msg",
  points: 5,
  duration: 10,
});

export const wsPingRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl:ws:ping",
  points: 5,
  duration: 10,
});
