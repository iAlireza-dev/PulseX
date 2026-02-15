export const env = {
  port: Number(process.env.PORT) || 3001,
  frontendOrigin: process.env.FRONTEND_ORIGIN as string,
  jwtSecret: process.env.JWT_SECRET as string,
  redisUrl: process.env.REDIS_URL as string,
};