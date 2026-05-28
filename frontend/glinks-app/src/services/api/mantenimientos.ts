import { http } from "../httpClient";
import type { Maintenance, PaginatedResponse } from "@/models";

// ─── Tipos ─────────────────────────────────────────

export interface CreateMaintenanceProductInput {
  amount: number;
  productId: string;
}

export interface CreateMaintenanceInput {
  description: string;
  physicalClientId?: string;
  legalClientId?: string;
  maintenanceProducts: CreateMaintenanceProductInput[];
}

// ─── API ───────────────────────────────────────────

export const mantenimientosApi = {
  /** Mantenimientos de clientes físicos */
  listPhysical(page = 1, limit = 50) {
    return http.get<PaginatedResponse<Maintenance>>(
      `/mantenimientos/fisicos?page=${page}&limit=${limit}`,
    );
  },

  createPhysical(data: Omit<CreateMaintenanceInput, "legalClientId">) {
    return http.post<Maintenance>("/mantenimientos/fisicos", {
      description: data.description,
      physicalClientId: data.physicalClientId,
      maintenanceProducts: data.maintenanceProducts,
    });
  },

  /** Mantenimientos de clientes jurídicos */
  listLegal(page = 1, limit = 50) {
    return http.get<PaginatedResponse<Maintenance>>(
      `/mantenimientos/juridicos?page=${page}&limit=${limit}`,
    );
  },

  createLegal(data: Omit<CreateMaintenanceInput, "physicalClientId">) {
    return http.post<Maintenance>("/mantenimientos/juridicos", {
      description: data.description,
      legalClientId: data.legalClientId,
      maintenanceProducts: data.maintenanceProducts,
    });
  },
};

// ─── Helpers para lista unificada ──────────────────

export async function fetchAllMaintenances(
  page = 1,
  limit = 50,
): Promise<{ data: Maintenance[]; total: number; page: number; limit: number }> {
  const [physical, legal] = await Promise.all([
    mantenimientosApi.listPhysical(page, limit),
    mantenimientosApi.listLegal(page, limit),
  ]);

  const all = [...physical.data, ...legal.data];

  // Ordenar por fecha descendente
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    data: all,
    total: physical.total + legal.total,
    page,
    limit,
  };
}