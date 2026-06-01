import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  unit_price: z.number().min(0),
  billable: z.boolean(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
  id: z.string().uuid(),
});