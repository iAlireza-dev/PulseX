import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "../config/env";

export async function attachRedisAdapter(io: any) {
  const pubClient = createClient({ url: env.redisUrl });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  return async () => {
    await subClient.disconnect();
    await pubClient.disconnect();
    await pubClient.disconnect();
  };
}