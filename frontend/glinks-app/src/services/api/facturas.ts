import { http } from "../httpClient";
import type { Invoice, PaginatedResponse } from "@/models";

// ─── Tipos ─────────────────────────────────────────

export interface ServiceProductItemInput {
  productId: string;
  startDate: Date;
  endDate: Date;
}

export interface PhysicalProductItemInput {
  productId: string;
  amount: number;
}

export interface CreatePhysicalInvoiceInput {
  physicalClientId: string;
  physicalProductItems: PhysicalProductItemInput[];
  serviceProductItems: ServiceProductItemInput[];
}

export interface CreateLegalInvoiceInput {
  legalClientId: string;
  physicalProductItems: PhysicalProductItemInput[];
  serviceProductItems: ServiceProductItemInput[];
}

// ─── API ───────────────────────────────────────────

export const facturasApi = {
  list(page = 1, limit = 50) {
    return http.get<PaginatedResponse<Invoice>>(
      `/facturas?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string) {
    return http.get<Invoice>(`/facturas/${id}`);
  },

  createPhysical(data: CreatePhysicalInvoiceInput) {
    return http.post<Invoice>("/facturas/fisicos", data);
  },

  createLegal(data: CreateLegalInvoiceInput) {
    return http.post<Invoice>("/facturas/juridicos", data);
  },
};

// ─── Helper para calcular totales ──────────────────

export function calculateInvoiceTotals(invoice: Invoice): {
  subtotal: number;
  total: number;
} {
  let subtotal = 0;

  // Productos físicos
  for (const item of invoice.physicalProductItems) {
    if (item.product) {
      subtotal += item.product.unit_price * item.amount;
    }
  }

  // Servicios (se factura el período completo)
  for (const item of invoice.serviceProductItems) {
    if (item.product) {
      subtotal += item.product.unit_price;
    }
  }

  // Nota: El backend puede calcular impuestos según exoneración del cliente
  // Por ahora solo retornamos subtotal, el total puede incluir impuestos
  return { subtotal, total: subtotal };
}