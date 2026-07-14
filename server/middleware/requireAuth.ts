import type { NextFunction, Request, Response } from "express";
import { verifySessionToken } from "../auth/session";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session;
  const claims = typeof token === "string" ? verifySessionToken(token) : null;

  if (!claims) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  req.user = { id: claims.sub, email: claims.email };
  next();
}
