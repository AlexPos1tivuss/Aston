import type { Request, Response, NextFunction } from "express";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "aston-admin-2026";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["x-admin-token"];
  if (token === ADMIN_SECRET) {
    next();
    return;
  }

  res.status(403).json({
    error: "forbidden",
    message: "Доступ запрещен",
  });
}
