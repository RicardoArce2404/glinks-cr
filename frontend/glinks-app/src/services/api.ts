import type { Cliente, Factura, Mantenimiento, Producto } from "@/models";
import { storage, uid } from "./storage";
import { seedClientes, seedFacturas, seedMantenimientos, seedProductos } from "./mockData";

const KEYS = {
  clientes: "erp_clientes",
  mantenimientos: "erp_mantenimientos",
  productos: "erp_productos",
  facturas: "erp_facturas",
  pendingSync: "erp_pending_sync",
};

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(KEYS.clientes)) storage.set(KEYS.clientes, seedClientes);
  if (!localStorage.getItem(KEYS.mantenimientos)) storage.set(KEYS.mantenimientos, seedMantenimientos);
  if (!localStorage.getItem(KEYS.productos)) storage.set(KEYS.productos, seedProductos);
  if (!localStorage.getItem(KEYS.facturas)) storage.set(KEYS.facturas, seedFacturas);
}

// Clientes
export const clientesApi = {
  list(): Cliente[] {
    ensureSeeded();
    return storage.get<Cliente[]>(KEYS.clientes, []);
  },
  create(data: Omit<Cliente, "id" | "createdAt">): Cliente {
    const list = this.list();
    const nuevo: Cliente = { ...data, id: uid(), createdAt: new Date().toISOString() };
    storage.set(KEYS.clientes, [nuevo, ...list]);
    return nuevo;
  },
  update(id: string, data: Partial<Cliente>) {
    const list = this.list().map((c) => (c.id === id ? { ...c, ...data } : c));
    storage.set(KEYS.clientes, list);
  },
  remove(id: string) {
    storage.set(KEYS.clientes, this.list().filter((c) => c.id !== id));
  },
  get(id: string) {
    return this.list().find((c) => c.id === id);
  },
};

// Mantenimiento
export const mantenimientoApi = {
  list(): Mantenimiento[] {
    ensureSeeded();
    return storage.get<Mantenimiento[]>(KEYS.mantenimientos, []);
  },
  create(data: Omit<Mantenimiento, "id">): Mantenimiento {
    const nuevo: Mantenimiento = { ...data, id: uid() };
    storage.set(KEYS.mantenimientos, [nuevo, ...this.list()]);
    return nuevo;
  },
  byCliente(clienteId: string) {
    return this.list().filter((m) => m.clienteId === clienteId);
  },
};

// Inventario
export const productosApi = {
  list(): Producto[] {
    ensureSeeded();
    return storage.get<Producto[]>(KEYS.productos, []);
  },
  create(data: Omit<Producto, "id">, offline = false): Producto {
    const nuevo: Producto = { ...data, id: uid() };
    if (offline) {
      const pending = storage.get<Array<{ type: string; payload: unknown }>>(KEYS.pendingSync, []);
      pending.push({ type: "producto_create", payload: nuevo });
      storage.set(KEYS.pendingSync, pending);
    } else {
      storage.set(KEYS.productos, [nuevo, ...this.list()]);
    }
    return nuevo;
  },
  update(id: string, data: Partial<Producto>, offline = false) {
    if (offline) {
      const pending = storage.get<Array<{ type: string; payload: unknown }>>(KEYS.pendingSync, []);
      pending.push({ type: "producto_update", payload: { id, data } });
      storage.set(KEYS.pendingSync, pending);
      return;
    }
    storage.set(
      KEYS.productos,
      this.list().map((p) => (p.id === id ? { ...p, ...data } : p)),
    );
  },
  pendingCount() {
    return storage.get<unknown[]>(KEYS.pendingSync, []).length;
  },
  sync() {
    const pending = storage.get<Array<{ type: string; payload: any }>>(KEYS.pendingSync, []);
    let list = this.list();
    for (const op of pending) {
      if (op.type === "producto_create") list = [op.payload, ...list];
      if (op.type === "producto_update") list = list.map((p) => (p.id === op.payload.id ? { ...p, ...op.payload.data } : p));
    }
    storage.set(KEYS.productos, list);
    storage.set(KEYS.pendingSync, []);
    return pending.length;
  },
};

// Facturación
export const facturasApi = {
  list(): Factura[] {
    ensureSeeded();
    return storage.get<Factura[]>(KEYS.facturas, []);
  },
  create(data: Omit<Factura, "id" | "numero">): Factura {
    const all = this.list();
    const numero = `FAC-${(all.length + 1).toString().padStart(4, "0")}`;
    const nueva: Factura = { ...data, id: uid(), numero };
    storage.set(KEYS.facturas, [nueva, ...all]);
    return nueva;
  },
  anular(id: string) {
    storage.set(
      KEYS.facturas,
      this.list().map((f) => (f.id === id ? { ...f, estado: "anulada" as const } : f)),
    );
  },
  get(id: string) {
    return this.list().find((f) => f.id === id);
  },
};
