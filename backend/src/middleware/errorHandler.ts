import { type Request, type Response, type NextFunction } from "express";
import type { ApiResponse } from "../types/index.js";

/**
 * Middleware global de manejo de errores.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("[Error]", err.message);

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message,
  };

  res.status(500).json(response);
}
