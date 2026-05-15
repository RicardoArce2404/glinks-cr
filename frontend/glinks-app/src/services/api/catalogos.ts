import { http } from "../httpClient";
import type { CatalogoItem } from "@/models";

// ─── Sectoriales ─────────────────────────────────────

export const sectorialesApi = {
  list() {
    return http.get<CatalogoItem[]>("/catalogos/sectoriales");
  },

  create(nombre: string) {
    return http.post<CatalogoItem>("/catalogos/sectoriales", { nombre });
  },

  update(id: string, nombre: string) {
    return http.put<CatalogoItem>(`/catalogos/sectoriales/${id}`, { nombre });
  },

  remove(id: string) {
    return http.delete<{ message: string }>(`/catalogos/sectoriales/${id}`);
  },
};

// ─── Tipos de AP ─────────────────────────────────────

export const tiposAPApi = {
  list() {
    return http.get<CatalogoItem[]>("/catalogos/tipos-ap");
  },

  create(nombre: string) {
    return http.post<CatalogoItem>("/catalogos/tipos-ap", { nombre });
  },

  update(id: string, nombre: string) {
    return http.put<CatalogoItem>(`/catalogos/tipos-ap/${id}`, { nombre });
  },

  remove(id: string) {
    return http.delete<{ message: string }>(`/catalogos/tipos-ap/${id}`);
  },
};
