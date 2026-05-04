export type Role = "admin" | "tecnico";

export interface User {
  username: string;
  role: Role;
  name: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  contacto: string;
  domicilio: string;
  plan: string;
  sectorial: string;
  tipoAP: string;
  createdAt: string;
}

export interface Mantenimiento {
  id: string;
  clienteId: string;
  descripcion: string;
  responsable: string;
  fecha: string;
}

export type ProductoTipo = "Router" | "PoE" | "Tubo metálico" | "Antena AP" | "Cable" | "Otro";
export type ProductoEstado = "disponible" | "en_uso";

export interface Producto {
  id: string;
  nombre: string;
  tipo: ProductoTipo;
  serial: string;
  estado: ProductoEstado;
  stock: number;
  precio: number;
}

export interface FacturaItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export type FacturaEstado = "activa" | "anulada";

export interface Factura {
  id: string;
  numero: string;
  clienteId: string;
  fecha: string;
  items: FacturaItem[];
  subtotal: number;
  impuestos: number;
  total: number;
  estado: FacturaEstado;
}
