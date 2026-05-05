import prisma from "../config/database.js";

export async function listProductos(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.producto.findMany({ skip, take: limit, orderBy: { nombre: "asc" } }),
    prisma.producto.count(),
  ]);
  return { data, total, page, limit };
}

export async function getProducto(id: string) {
  return prisma.producto.findUnique({ where: { id } });
}

export async function createProducto(data: {
  nombre: string;
  tipo: string;
  serial: string;
  stock: number;
  precio: number;
}) {
  return prisma.producto.create({
    data: { ...data, estado: "disponible" },
  });
}

export async function updateProducto(
  id: string,
  data: Partial<{
    nombre: string;
    tipo: string;
    serial: string;
    stock: number;
    precio: number;
    estado: string;
  }>,
) {
  return prisma.producto.update({ where: { id }, data });
}

export async function deleteProducto(id: string) {
  return prisma.producto.delete({ where: { id } });
}

/**
 * Dar de baja unidades de un producto por daño.
 * Registra la pérdida reduciendo el stock total.
 */
export async function darBajaProducto(id: string, cantidad: number, _motivo: string) {
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) throw new Error("Producto no encontrado");
  if (producto.stock < cantidad) throw new Error("Cantidad insuficiente en stock");

  return prisma.producto.update({
    where: { id },
    data: { stock: { decrement: cantidad } },
  });
}

/**
 * Obtener resumen del inventario: totales y desglose por tipo y estado.
 */
export async function obtenerResumen() {
  const productos = await prisma.producto.findMany();

  const resumen = productos.reduce(
    (acc, p) => {
      if (p.tipo === "Router") {
        acc.routers.total += p.stock;
        if (p.estado === "disponible") acc.routers.disponible += p.stock;
        if (p.estado === "en_uso") acc.routers.enUso += p.stock;
      }
      if (p.tipo === "PoE") {
        acc.poes.total += p.stock;
        if (p.estado === "disponible") acc.poes.disponible += p.stock;
        if (p.estado === "en_uso") acc.poes.enUso += p.stock;
      }
      return acc;
    },
    {
      routers: { total: 0, disponible: 0, enUso: 0 },
      poes: { total: 0, disponible: 0, enUso: 0 },
    },
  );

  return resumen;
}
