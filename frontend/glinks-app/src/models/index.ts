

export type Role = "admin" | "tecnico";

export interface User {
  id: string;
  username: string;
  role: Role;
  name?: string; 
  createdAt: string;
}

// ─── Clientes ──────────────────────────────────────

export interface PhysicalClient {
  id: string;
  national_id: string;
  name: string;
  last_name_1: string;
  last_name_2: string;
  primary_phone: string;
  secondary_phone: string | null;
  email: string | null;
  address: string;
  exonerated: boolean;
  createdAt: string;
}

export interface LegalClient {
  id: string;
  legal_id: string;
  name: string;
  primary_phone: string;
  secondary_phone: string | null;
  email: string | null;
  address: string;
  exonerated: boolean;
  createdAt: string;
}

/** Cliente unificado para mostrar ambas clases en una misma lista */
export type UnifiedClient =
  | (PhysicalClient & { tipo: "fisico" })
  | (LegalClient & { tipo: "juridico" });



// ─── Mantenimientos ────────────────────────────────

export interface MaintenanceProduct {
  id: string;
  amount: number;
  product_id: string;
  product?: Product;
}

export interface Maintenance {
  id: string;
  date: string;
  description: string;
  physical_client_id: string | null;
  legal_client_id: string | null;
  responsible_id: string;
  responsible?: {
    id: string;
    username: string;
    role: Role;
  };
  physical_client?: PhysicalClient | null;
  legal_client?: LegalClient | null;
  maintenanceProducts: MaintenanceProduct[];
}

// ─── Facturación ───────────────────────────────────

export interface ServiceProductItem {
  id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  product?: Product;
}

export interface PhysicalProductItem {
  id: string;
  product_id: string;
  amount: number;
  product?: Product;
}

export type InvoiceStatus = "active" | "cancelled";

export interface Invoice {
  id: string;
  date: string;
  physical_client_id: string | null;
  legal_client_id: string | null;
  physicalClient?: PhysicalClient | null;
  legalClient?: LegalClient | null;
  serviceProductItems: ServiceProductItem[];
  physicalProductItems: PhysicalProductItem[];
}


export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Asegurar que ProductType esté definido
export type ProductType = 
  | "Router"
  | "PoE"
  | "Tubo metálico"
  | "Antena AP"
  | "Cable"
  | "Otro";

export interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  unit_price: number;
  billable: boolean;
  createdAt: string;
}