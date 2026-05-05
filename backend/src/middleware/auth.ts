import { type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, JwtPayload } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";

/**
 * Middleware que verifica el token JWT y extrae la información del usuario.
 * Ambos roles (admin, tecnico) tienen acceso total por ahora.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Token de acceso requerido" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Validar que sea un rol válido
    if (payload.role !== "admin" && payload.role !== "tecnico") {
      res.status(403).json({ success: false, error: "Rol de usuario no válido" });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Token inválido o expirado" });
  }
}
