import type { Cliente, Factura, Mantenimiento, Producto } from "@/models";

export const seedClientes: Cliente[] = [
  {
    id: "c1",
    nombre: "Juan Pérez Solano",
    cedula: "7-0123-0456",
    contacto: "8712-3456",
    domicilio: "Matama centro, 200m sur de la pulpería",
    plan: "Plan Hogar 20 Mbps",
    sectorial: "Sectorial Matama Norte",
    tipoAP: "AP exterior LiteBeam",
    createdAt: new Date().toISOString(),
  },
  {
    id: "c2",
    nombre: "María Gómez Ureña",
    cedula: "7-0234-0567",
    contacto: "8623-7890",
    domicilio: "Bananito Sur, finca La Esperanza",
    plan: "Plan Hogar 30 Mbps",
    sectorial: "Sectorial Bananito",
    tipoAP: "AP exterior NanoStation",
    createdAt: new Date().toISOString(),
  },
  {
    id: "c3",
    nombre: "Carlos Rodríguez Mora",
    cedula: "7-0345-0678",
    contacto: "8501-1212",
    domicilio: "Westfalia, entrada al río",
    plan: "Plan Negocio 50 Mbps",
    sectorial: "Sectorial Westfalia",
    tipoAP: "AP exterior CPE610",
    createdAt: new Date().toISOString(),
  },
];

export const seedMantenimientos: Mantenimiento[] = [
  {
    id: "m1",
    clienteId: "c1",
    descripcion: "Cambio de cable de red exterior",
    responsable: "Técnico 1",
    fecha: new Date().toISOString(),
  },
  {
    id: "m2",
    clienteId: "c2",
    descripcion: "Reconfiguración de antena",
    responsable: "Técnico 2",
    fecha: new Date().toISOString(),
  },
];

export const seedProductos: Producto[] = [
  { id: "p1", nombre: "Mikrotik hAP ac²", tipo: "Router", serial: "MK-001", estado: "disponible", stock: 12, precio: 95 },
  { id: "p2", nombre: "Ubiquiti LiteBeam AP", tipo: "Antena AP", serial: "UB-002", estado: "en_uso", stock: 5, precio: 80 },
  { id: "p3", nombre: "Inyector PoE 24V", tipo: "PoE", serial: "PE-003", estado: "disponible", stock: 30, precio: 12 },
  { id: "p4", nombre: "Inyector PoE 48V", tipo: "PoE", serial: "PE-004", estado: "en_uso", stock: 18, precio: 18 },
  { id: "p5", nombre: "Tubo metálico galvanizado 2m", tipo: "Tubo metálico", serial: "TM-005", estado: "disponible", stock: 25, precio: 22 },
  { id: "p6", nombre: "Cable UTP exterior CAT6 (m)", tipo: "Cable", serial: "CB-006", estado: "disponible", stock: 500, precio: 0.8 },
];

export const seedFacturas: Factura[] = [
  {
    id: "f1",
    numero: "FAC-0001",
    clienteId: "c1",
    fecha: new Date().toISOString(),
    items: [{ productoId: "p1", nombre: "Mikrotik hAP ac²", cantidad: 1, precio: 95 }],
    subtotal: 95,
    impuestos: 11.4,
    total: 106.4,
    estado: "activa",
  },
];
