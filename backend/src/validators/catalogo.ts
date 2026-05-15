import { z } from "zod";

export const createCatalogoSchema = z.object({
  nombre: z.string().min(1).max(255),
});

export const updateCatalogoSchema = z.object({
  nombre: z.string().min(1).max(255),
});
