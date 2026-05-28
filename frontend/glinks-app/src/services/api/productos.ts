import { http } from "../httpClient";
import type { Product, PaginatedResponse } from "@/models";

// ─── Tipos ─────────────────────────────────────────

export type CreateProductInput = {
  name: string;
  type: string;
  description: string;
  unit_price: number;
  billable: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

// ─── API ───────────────────────────────────────────

export const productosApi = {
  list(page = 1, limit = 50) {
    return http.get<PaginatedResponse<Product>>(
      `/productos?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string) {
    return http.get<Product>(`/productos/${id}`);
  },

  create(data: CreateProductInput) {
    return http.post<Product>("/productos", data);
  },

  update(id: string, data: UpdateProductInput) {
    return http.put<Product>(`/productos/${id}`, data);
  },

  remove(id: string) {
    return http.delete<{ message: string }>(`/productos/${id}`);
  },
};