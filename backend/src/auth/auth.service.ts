import bcrypt from "bcrypt";
import { users } from "./users";
import { signAccessToken } from "../config/jwt";

export async function login(username: string, password: string) {
  const user = users.find((u) => u.username === username);
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const token = await signAccessToken({
    sub: user.id,
    username: user.username,
  });

  return { token };
}
