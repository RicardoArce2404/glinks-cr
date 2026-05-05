import { z } from "zod";

const facturaItemSchema = z.object({
  productoId: z.string().uuid(),
  nombre: z.string().min(1).max(255),
  cantidad: z.number().int().positive(),
  precio: z.number().positive(),
});

export const createFacturaFisicoSchema = z.object({
  clienteFisicoId: z.string().uuid(),
  items: z.array(facturaItemSchema).min(1, "La factura debe tener al menos un producto"),
});

export const createFacturaJuridicoSchema = z.object({
  clienteJuridicoId: z.string().uuid(),
  items: z.array(facturaItemSchema).min(1, "La factura debe tener al menos un producto"),
});

export const anularFacturaSchema = z.object({
  motivo: z.string().min(1).max(255).optional(),
});
