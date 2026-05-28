import { http } from "../httpClient";
import type {
  PhysicalClient,
  LegalClient,
  UnifiedClient,
  PaginatedResponse,
} from "@/models";

// ─── Tipos para creación/actualización ─────────────

export type CreatePhysicalClientInput = {
  nationalId: string;
  name: string;
  lastName1: string;
  lastName2: string;
  primaryPhone: string;
  secondaryPhone?: string | null;
  email?: string | null;
  address: string;
  exonerated: boolean;
};

export type UpdatePhysicalClientInput = Partial<CreatePhysicalClientInput>;

export type CreateLegalClientInput = {
  legalId: string;
  name: string;
  primaryPhone: string;
  secondaryPhone?: string | null;
  email?: string | null;
  address: string;
  exonerated: boolean;
};

export type UpdateLegalClientInput = Partial<CreateLegalClientInput>;

// ─── Físicos ───────────────────────────────────────

export const physicalClientsApi = {
  list(page = 1, limit = 50) {
    return http.get<PaginatedResponse<PhysicalClient>>(
      `/clientes-fisicos?page=${page}&limit=${limit}`,
    );
  },

  search(nationalId?: string, name?: string, page = 1, limit = 50) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (nationalId) params.set("nationalId", nationalId);
    if (name) params.set("name", name);
    return http.get<PaginatedResponse<PhysicalClient>>(
      `/clientes-fisicos/search?${params.toString()}`,
    );
  },

  getById(id: string) {
    return http.get<PhysicalClient>(`/clientes-fisicos/${id}`);
  },

  create(data: CreatePhysicalClientInput) {
    return http.post<PhysicalClient>("/clientes-fisicos", data);
  },

  update(id: string, data: UpdatePhysicalClientInput) {
    return http.put<PhysicalClient>(`/clientes-fisicos/${id}`, data);
  },

  remove(id: string) {
    return http.delete<{ message: string }>(`/clientes-fisicos/${id}`);
  },
};

// ─── Jurídicos ─────────────────────────────────────

export const legalClientsApi = {
  list(page = 1, limit = 50) {
    return http.get<PaginatedResponse<LegalClient>>(
      `/clientes-juridicos?page=${page}&limit=${limit}`,
    );
  },

  search(legalId?: string, name?: string, page = 1, limit = 50) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (legalId) params.set("legalId", legalId);
    if (name) params.set("name", name);
    return http.get<PaginatedResponse<LegalClient>>(
      `/clientes-juridicos/search?${params.toString()}`,
    );
  },

  getById(id: string) {
    return http.get<LegalClient>(`/clientes-juridicos/${id}`);
  },

  create(data: CreateLegalClientInput) {
    return http.post<LegalClient>("/clientes-juridicos", data);
  },

  update(id: string, data: UpdateLegalClientInput) {
    return http.put<LegalClient>(`/clientes-juridicos/${id}`, data);
  },

  remove(id: string) {
    return http.delete<{ message: string }>(`/clientes-juridicos/${id}`);
  },
};

// ─── Helpers para lista unificada ──────────────────

export async function fetchAllClients(): Promise<UnifiedClient[]> {
  const [physical, legal] = await Promise.all([
    physicalClientsApi.list(1, 1000),
    legalClientsApi.list(1, 1000),
  ]);

  return [
    ...physical.data.map(
      (c): UnifiedClient => ({
        ...c,
        tipo: "fisico",
      }),
    ),
    ...legal.data.map(
      (c): UnifiedClient => ({
        ...c,
        tipo: "juridico",
      }),
    ),
  ];
}