import prisma from "../config/database.js";

// ─── Cliente Físico ───

export async function listClientesFisicos(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.clienteFisico.findMany({ skip, take: limit, orderBy: { nombre: "asc" } }),
    prisma.clienteFisico.count(),
  ]);
  return { data, total, page, limit };
}

export async function getClienteFisico(id: string) {
  return prisma.clienteFisico.findUnique({ where: { id } });
}

export async function createClienteFisico(data: {
  cedula: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  telefonoPrimario: string;
  telefonoSecundario?: string | null;
  email?: string | null;
  domicilio: string;
  plan: string;
  sectorial: string;
  tipoAP: string;
  routerId: number;
  poeId: number;
}) {
  return prisma.clienteFisico.create({ data });
}

export async function updateClienteFisico(
  id: string,
  data: Partial<{
    nombre: string;
    apellido1: string;
    apellido2: string;
    cedula: string;
    telefonoPrimario: string;
    telefonoSecundario: string | null;
    email: string | null;
    domicilio: string;
    plan: string;
    sectorial: string;
    tipoAP: string;
    routerId: number;
    poeId: number;
  }>,
) {
  return prisma.clienteFisico.update({ where: { id }, data });
}

export async function deleteClienteFisico(id: string) {
  // Según ERS: al borrar un cliente, liberar sus equipos asociados
  const cliente = await prisma.clienteFisico.findUnique({ where: { id } });
  if (!cliente) return null;

  // Eliminar mantenimientos asociados
  await prisma.mantenimientoFisico.deleteMany({ where: { clienteFisicoId: id } });

  // Eliminar facturas asociadas
  await prisma.factura.deleteMany({ where: { clienteFisicoId: id } });

  // Eliminar el cliente
  return prisma.clienteFisico.delete({ where: { id } });
}

export async function searchClientesFisicos(filters: {
  nombre?: string;
  cedula?: string;
  sectorial?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.nombre) where.nombre = { contains: filters.nombre, mode: "insensitive" };
  if (filters.cedula) where.cedula = { contains: filters.cedula };
  if (filters.sectorial) where.sectorial = filters.sectorial;

  return prisma.clienteFisico.findMany({
    where,
    take: 50,
    orderBy: { nombre: "asc" },
  });
}

// ─── Cliente Jurídico ───

export async function listClientesJuridicos(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.clienteJuridico.findMany({ skip, take: limit, orderBy: { nombreEmpresa: "asc" } }),
    prisma.clienteJuridico.count(),
  ]);
  return { data, total, page, limit };
}

export async function getClienteJuridico(id: string) {
  return prisma.clienteJuridico.findUnique({ where: { id } });
}

export async function createClienteJuridico(data: {
  cedulaJuridica: string;
  nombreEmpresa: string;
  telefonoPrimario: string;
  telefonoSecundario?: string | null;
  domicilio: string;
  email?: string | null;
  plan: string;
  sectorial: string;
  tipoAP: string;
  routerId: number;
  poeId: number;
}) {
  return prisma.clienteJuridico.create({ data });
}

export async function updateClienteJuridico(
  id: string,
  data: Partial<{
    cedulaJuridica: string;
    nombreEmpresa: string;
    telefonoPrimario: string;
    telefonoSecundario: string | null;
    domicilio: string;
    email: string | null;
    plan: string;
    sectorial: string;
    tipoAP: string;
    routerId: number;
    poeId: number;
  }>,
) {
  return prisma.clienteJuridico.update({ where: { id }, data });
}

export async function deleteClienteJuridico(id: string) {
  const cliente = await prisma.clienteJuridico.findUnique({ where: { id } });
  if (!cliente) return null;

  await prisma.mantenimientoJuridico.deleteMany({ where: { clienteJuridicoId: id } });
  await prisma.factura.deleteMany({ where: { clienteJuridicoId: id } });

  return prisma.clienteJuridico.delete({ where: { id } });
}

export async function searchClientesJuridicos(filters: {
  nombreEmpresa?: string;
  cedulaJuridica?: string;
  sectorial?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters.nombreEmpresa) where.nombreEmpresa = { contains: filters.nombreEmpresa, mode: "insensitive" };
  if (filters.cedulaJuridica) where.cedulaJuridica = { contains: filters.cedulaJuridica };
  if (filters.sectorial) where.sectorial = filters.sectorial;

  return prisma.clienteJuridico.findMany({
    where,
    take: 50,
    orderBy: { nombreEmpresa: "asc" },
  });
}
