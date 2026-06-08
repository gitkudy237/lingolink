import jwt, { Secret, SignOptions } from "jsonwebtoken";

const jwtSecret: Secret = process.env.JWT_SECRET || "change-this-secret";
const jwtExpiry = process.env.JWT_EXPIRES_IN || "30d";

export function signJwt(payload: string | object | Buffer): string {
  const options: SignOptions = { expiresIn: jwtExpiry as SignOptions["expiresIn"] };
  return jwt.sign(payload, jwtSecret, options);
}

export function verifyJwt<T = Record<string, unknown>>(token: string): T {
  return jwt.verify(token, jwtSecret) as T;
}
