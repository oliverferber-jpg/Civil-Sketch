import jwt from "jsonwebtoken";

const secret = process.env.AUTH_JWT_SECRET;

if (!secret) {
  throw new Error("AUTH_JWT_SECRET is required for signing sessions");
}

export type SessionClaims = {
  sub: string;
  email: string;
};

export function signSessionToken(user: SessionClaims): string {
  return jwt.sign({ sub: user.sub, email: user.email }, secret, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionClaims | null {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !decoded.sub || !decoded.email) {
      return null;
    }

    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}
