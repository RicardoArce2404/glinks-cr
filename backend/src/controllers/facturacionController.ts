import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import {
  createFacturaFisicoSchema,
  createFacturaJuridicoSchema,
} from "../validators/facturacion.js";
import * as facturacionService from "../services/facturacionService.js";
import { ZodError } from "zod";
import { toInt, paramStr } from "../lib/utils.js";

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 50)));
    const result = await facturacionService.listFacturas(page, limit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const factura = await facturacionService.getFactura(paramStr(req.params.id));
    if (!factura) {
      res.status(404).json({ success: false, error: "Factura no encontrada" });
      return;
    }
    res.json({ success: true, data: factura });
  } catch (err) {
    next(err);
  }
}

export async function createFisico(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createFacturaFisicoSchema.parse(req.body);
    const factura = await facturacionService.createFactura({
      items: data.items,
      clienteFisicoId: data.clienteFisicoId,
    });
    res.status(201).json({ success: true, data: factura });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function createJuridico(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createFacturaJuridicoSchema.parse(req.body);
    const factura = await facturacionService.createFactura({
      items: data.items,
      clienteJuridicoId: data.clienteJuridicoId,
    });
    res.status(201).json({ success: true, data: factura });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function anular(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const factura = await facturacionService.anularFactura(paramStr(req.params.id));
    res.json({ success: true, data: factura });
  } catch (err) {
    next(err);
  }
}
