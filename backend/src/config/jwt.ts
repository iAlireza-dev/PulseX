import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

const secret = new TextEncoder().encode(env.jwtSecret);
const alg = "HS256";

export async function signAccessToken(payload: {
  sub: string;
  username: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  return jwtVerify(token, secret);
}
