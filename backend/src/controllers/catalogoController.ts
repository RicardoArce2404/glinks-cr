import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { createCatalogoSchema, updateCatalogoSchema } from "../validators/catalogo.js";
import * as catalogoService from "../services/catalogoService.js";
import { ZodError } from "zod";
import { paramStr } from "../lib/utils.js";

// ─── Sectoriales ─────────────────────────────────────

export async function listSectoriales(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await catalogoService.listSectoriales();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSectorial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await catalogoService.getSectorial(paramStr(req.params.id));
    if (!data) {
      res.status(404).json({ success: false, error: "Sectorial no encontrada" });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createSectorial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { nombre } = createCatalogoSchema.parse(req.body);
    const data = await catalogoService.createSectorial(nombre);
    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function updateSectorial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { nombre } = updateCatalogoSchema.parse(req.body);
    const data = await catalogoService.updateSectorial(paramStr(req.params.id), nombre);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function deleteSectorial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await catalogoService.deleteSectorial(paramStr(req.params.id));
    res.json({ success: true, message: "Sectorial eliminada correctamente" });
  } catch (err) {
    next(err);
  }
}

// ─── Tipos de AP ─────────────────────────────────────

export async function listTiposAP(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await catalogoService.listTiposAP();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTipoAP(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await catalogoService.getTipoAP(paramStr(req.params.id));
    if (!data) {
      res.status(404).json({ success: false, error: "Tipo de AP no encontrado" });
      return;
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createTipoAP(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { nombre } = createCatalogoSchema.parse(req.body);
    const data = await catalogoService.createTipoAP(nombre);
    res.status(201).json({ success: true, data });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function updateTipoAP(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { nombre } = updateCatalogoSchema.parse(req.body);
    const data = await catalogoService.updateTipoAP(paramStr(req.params.id), nombre);
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: "Datos inválidos", data: err.errors });
      return;
    }
    next(err);
  }
}

export async function deleteTipoAP(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await catalogoService.deleteTipoAP(paramStr(req.params.id));
    res.json({ success: true, message: "Tipo de AP eliminado correctamente" });
  } catch (err) {
    next(err);
  }
}
