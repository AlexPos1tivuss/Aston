import type { Request, Response, NextFunction } from "express";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!ADMIN_SECRET) {
    console.error("ADMIN_SECRET environment variable is not set. Admin endpoints are disabled.");
    res.status(503).json({
      error: "service_unavailable",
      message: "Административные функции не настроены",
    });
    return;
  }

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
