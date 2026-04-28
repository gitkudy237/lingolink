import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyJwt<{ id: string; email: string; preferredLanguage?: string }>(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      preferredLanguage: payload.preferredLanguage,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
