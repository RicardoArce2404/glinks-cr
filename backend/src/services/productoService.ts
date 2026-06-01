import prisma from "../config/database.js";


export async function listProducts(page: number, limit: number) {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  return { products, total };
}


export async function searchProducts(
  searchTerm: string | undefined,
  page: number,
  limit: number,
) {
  const where = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" as const } },
          { type: { contains: searchTerm, mode: "insensitive" as const } },
          { description: { contains: searchTerm, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}


export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error("Producto no encontrado");
  }
  return product;
}


export async function createProduct(data: {
  name: string;
  type: string;
  description?: string;
  unit_price: number;
  billable: boolean;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description ?? "",
      unit_price: data.unit_price,
      billable: data.billable,
    },
  });
}


export async function updateProduct(
  id: string,
  data: {
    name?: string;
    type?: string;
    description?: string;
    unit_price?: number;
    billable?: boolean;
  },
) {
  await getProductById(id);

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.unit_price !== undefined && { unit_price: data.unit_price }),
      ...(data.billable !== undefined && { billable: data.billable }),
    },
  });
}


export async function deleteProduct(id: string) {
  await getProductById(id);

  return prisma.product.delete({ where: { id } });
}


export async function getInventorySummary() {
  const products = await prisma.product.findMany();
  
  const routers = products.filter(p => p.type === "Router");
  const poes = products.filter(p => p.type === "PoE");
  
  return {
    routers: {
      total: routers.length,
      disponible: routers.filter(p => p.billable === true).length,
      enUso: routers.filter(p => p.billable === false).length,
    },
    poes: {
      total: poes.length,
      disponible: poes.filter(p => p.billable === true).length,
      enUso: poes.filter(p => p.billable === false).length,
    },
  };
}