import { z } from "zod";

export const createProductoSchema = z.object({
  nombre: z.string().min(1).max(255),
  tipo: z.enum(["Router", "PoE", "Tubo metálico", "Antena AP", "Cable", "Otro"]),
  serial: z.string().min(1).max(255),
  stock: z.number().int().min(1).max(255),
  precio: z.number().positive(),
});

export const updateProductoSchema = createProductoSchema.partial();
