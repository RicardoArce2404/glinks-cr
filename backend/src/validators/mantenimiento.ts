import { z } from "zod";

export const createMantenimientoFisicoSchema = z.object({
  clienteFisicoId: z.string().uuid(),
  descripcion: z.string().min(1).max(255),
});

export const createMantenimientoJuridicoSchema = z.object({
  clienteJuridicoId: z.string().uuid(),
  descripcion: z.string().min(1).max(255),
});
