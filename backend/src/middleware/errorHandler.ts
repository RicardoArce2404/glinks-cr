import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
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
  console.error("[Stack]", err.stack);

  // Errores de validación de Zod
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    const response: ApiResponse = {
      success: false,
      error: errors[0]?.message || "Error de validación",
      errors: errors,
    };

    res.status(400).json(response);
    return;
  }

  // Errores de Prisma (unique constraint, foreign key, etc.)
  if (err.message?.includes("Unique constraint")) {
    const response: ApiResponse = {
      success: false,
      error: "El registro ya existe con ese identificador",
    };
    res.status(409).json(response);
    return;
  }

  // Errores conocidos de la aplicación
  if (err.message?.includes("Credenciales inválidas")) {
    const response: ApiResponse = {
      success: false,
      error: "Credenciales inválidas",
    };
    res.status(401).json(response);
    return;
  }

  if (err.message?.includes("El nombre de usuario ya está en uso")) {
    const response: ApiResponse = {
      success: false,
      error: "El nombre de usuario ya está en uso",
    };
    res.status(409).json(response);
    return;
  }

  // Error por defecto
  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message,
  };

  res.status(500).json(response);
}