import prisma from "../config/database.js";

interface FacturaItemInput {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface CreateFacturaInput {
  items: FacturaItemInput[];
  clienteFisicoId?: string;
  clienteJuridicoId?: string;
}

export async function listFacturas(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.factura.findMany({
      skip,
      take: limit,
      orderBy: { fecha: "desc" },
      include: {
        items: true,
        clienteFisico: { select: { id: true, nombre: true } },
        clienteJuridico: { select: { id: true, nombreEmpresa: true } },
      },
    }),
    prisma.factura.count(),
  ]);
  return { data, total, page, limit };
}

export async function getFactura(id: string) {
  return prisma.factura.findUnique({
    where: { id },
    include: {
      items: true,
      clienteFisico: { select: { id: true, nombre: true, cedula: true } },
      clienteJuridico: { select: { id: true, nombreEmpresa: true, cedulaJuridica: true } },
    },
  });
}

export async function createFactura(input: CreateFacturaInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
  const impuestos = subtotal * 0.13; // 13% IVA
  const total = subtotal + impuestos;

  // Generar número de factura secuencial
  const count = await prisma.factura.count();
  const numero = `FAC-${(count + 1).toString().padStart(4, "0")}`;

  return prisma.factura.create({
    data: {
      numero,
      subtotal,
      impuestos,
      total,
      estado: "activa",
      clienteFisicoId: input.clienteFisicoId ?? null,
      clienteJuridicoId: input.clienteJuridicoId ?? null,
      items: {
        create: input.items.map((item) => ({
          productoId: item.productoId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
      },
    },
    include: { items: true },
  });
}

export async function anularFactura(id: string) {
  return prisma.factura.update({
    where: { id },
    data: { estado: "anulada" },
  });
}
