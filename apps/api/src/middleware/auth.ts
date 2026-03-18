import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { queryOne } from "../db/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "admin" | "client";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

export async function requireClientOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  requireAuth(req, res, async () => {
    const user = req.user!;
    const dbUser = await queryOne<{ id: string; is_active: boolean }>(
      "SELECT id, is_active FROM users WHERE id = $1",
      [user.userId]
    );
    if (!dbUser || !dbUser.is_active) {
      return res.status(403).json({ error: "Account is inactive" });
    }
    next();
  });
}
