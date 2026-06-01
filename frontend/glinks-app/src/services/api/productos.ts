import { http } from "../httpClient";
import type { Product, PaginatedResponse } from "@/models";


export type CreateProductInput = {
  name: string;
  type: string;
  description?: string;
  unit_price: number;
  billable: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

interface BackendPagination {
  take: number;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BackendListResponse<T> {
  success: boolean;
  data: T[];
  pagination: BackendPagination;
}

interface BackendSingleResponse<T> {
  success: boolean;
  data: T;
}


export const productosApi = {
  async list(page = 1, limit = 50) {
    
    const response = await http.get<BackendListResponse<Product>>(
      `/productos?page=${page}&limit=${limit}`
    );
    
    
    return {
      data: response?.data ?? [],
      total: response?.pagination?.total ?? 0,
      page: response?.pagination?.page ?? page,
      limit: response?.pagination?.limit ?? limit,
    };
  },

  async search(searchTerm: string, page = 1, limit = 50) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (searchTerm) params.set("q", searchTerm);
    
    const response = await http.get<BackendListResponse<Product>>(
      `/productos/search?${params.toString()}`
    );
    
    return {
      data: response?.data ?? [],
      total: response?.pagination?.total ?? 0,
      page: response?.pagination?.page ?? page,
      limit: response?.pagination?.limit ?? limit,
    };
  },

  async getById(id: string) {
    const response = await http.get<BackendSingleResponse<Product>>(
      `/productos/${id}`
    );
    return response?.data;
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

  async getSummary() {
    const response = await http.get<BackendSingleResponse<{
      routers: { total: number; disponible: number; enUso: number };
      poes: { total: number; disponible: number; enUso: number };
    }>>("/productos/resumen");
    return response?.data;
  },
};