import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { createProductoSchema, updateProductoSchema } from "../validators/inventario.js";
import * as inventarioService from "../services/inventarioService.js";
import { ZodError } from "zod";
import { toInt, paramStr } from "../lib/utils.js";

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 50)));
    const result = await inventarioService.listProductos(page, limit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const producto = await inventarioService.getProducto(paramStr(req.params.id));
    if (!producto) {
      res.status(404).json({ success: false, error: "Producto no encontrado" });
      return;
    }
    res.json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createProductoSchema.parse(req.body);
    const producto = await inventarioService.createProducto(data);
    res.status(201).json({ success: true, data: producto });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateProductoSchema.parse(req.body);
    const producto = await inventarioService.updateProducto(paramStr(req.params.id), data);
    res.json({ success: true, data: producto });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await inventarioService.deleteProducto(paramStr(req.params.id));
    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
}

export async function darBaja(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { cantidad, motivo } = req.body;
    if (!cantidad || cantidad < 1) {
      res.status(400).json({ success: false, error: "Cantidad inválida" });
      return;
    }
    const producto = await inventarioService.darBajaProducto(paramStr(req.params.id), cantidad, motivo ?? "");
    res.json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
}

export async function resumen(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await inventarioService.obtenerResumen();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
