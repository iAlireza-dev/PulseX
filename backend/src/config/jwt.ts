import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "pulsex-dev-secret"
);

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

