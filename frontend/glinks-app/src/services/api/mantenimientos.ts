import { http } from "../httpClient";
import type { Maintenance } from "@/models";

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

function getUserIdFromToken(): string | null {
  const token =
    localStorage.getItem("erp_token") ?? sessionStorage.getItem("erp_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

export const mantenimientosApi = {
  async listPhysical(page = 1, limit = 50) {
    const response = await http.get<BackendListResponse<Maintenance>>(
      `/mantenimientos/fisicos?page=${page}&limit=${limit}`
    );
    return {
      data: response?.data ?? [],
      total: response?.pagination?.total ?? 0,
      page: response?.pagination?.page ?? page,
      limit: response?.pagination?.limit ?? limit,
    };
  },

  async createPhysical(data: Omit<CreateMaintenanceInput, "legalClientId">) {
    const responsibleId = getUserIdFromToken();
    if (!responsibleId) throw new Error("No se pudo identificar el usuario responsable");

    return http.post<Maintenance>("/mantenimientos/fisicos", {
      date: new Date(),
      description: data.description,
      physicalClientId: data.physicalClientId,
      responsibleId,
      maintenanceProducts: data.maintenanceProducts,
    });
  },

  async listLegal(page = 1, limit = 50) {
    const response = await http.get<BackendListResponse<Maintenance>>(
      `/mantenimientos/juridicos?page=${page}&limit=${limit}`
    );
    return {
      data: response?.data ?? [],
      total: response?.pagination?.total ?? 0,
      page: response?.pagination?.page ?? page,
      limit: response?.pagination?.limit ?? limit,
    };
  },

  async createLegal(data: Omit<CreateMaintenanceInput, "physicalClientId">) {
    const responsibleId = getUserIdFromToken();
    if (!responsibleId) throw new Error("No se pudo identificar el usuario responsable");

    return http.post<Maintenance>("/mantenimientos/juridicos", {
      date: new Date(),
      description: data.description,
      legalClientId: data.legalClientId,
      responsibleId,
      maintenanceProducts: data.maintenanceProducts,
    });
  },
};

export async function fetchAllMaintenances(
  page = 1,
  limit = 50
): Promise<{ data: Maintenance[]; total: number; page: number; limit: number }> {
  const [physical, legal] = await Promise.all([
    mantenimientosApi.listPhysical(page, limit),
    mantenimientosApi.listLegal(page, limit),
  ]);

  const all = [...(physical?.data ?? []), ...(legal?.data ?? [])];
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    data: all,
    total: (physical?.total ?? 0) + (legal?.total ?? 0),
    page,
    limit,
  };
}

export async function checkProductInMaintenances(productId: string): Promise<boolean> {
  const [physical, legal] = await Promise.all([
    mantenimientosApi.listPhysical(1, 1000),
    mantenimientosApi.listLegal(1, 1000),
  ]);
  const all = [...(physical?.data ?? []), ...(legal?.data ?? [])];
  return all.some((m) => m.maintenanceProducts?.some((mp) => mp.product_id === productId));
}

export async function getMaintenancesByProduct(productId: string): Promise<Maintenance[]> {
  const [physical, legal] = await Promise.all([
    mantenimientosApi.listPhysical(1, 1000),
    mantenimientosApi.listLegal(1, 1000),
  ]);
  const all = [...(physical?.data ?? []), ...(legal?.data ?? [])];
  return all.filter((m) => m.maintenanceProducts?.some((mp) => mp.product_id === productId));
}