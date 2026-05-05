import prisma from "../config/database.js";

// ─── Mantenimiento a clientes físicos ───

export async function listMantenimientosFisicos(clienteId?: string, page = 1, limit = 50) {
  const where = clienteId ? { clienteFisicoId: clienteId } : {};
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.mantenimientoFisico.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fecha: "desc" },
      include: { responsable: { select: { id: true, name: true, username: true } } },
    }),
    prisma.mantenimientoFisico.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function createMantenimientoFisico(data: {
  clienteFisicoId: string;
  descripcion: string;
  responsableId: string;
}) {
  return prisma.mantenimientoFisico.create({
    data,
    include: { responsable: { select: { id: true, name: true, username: true } } },
  });
}

// ─── Mantenimiento a clientes jurídicos ───

export async function listMantenimientosJuridicos(clienteId?: string, page = 1, limit = 50) {
  const where = clienteId ? { clienteJuridicoId: clienteId } : {};
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.mantenimientoJuridico.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fecha: "desc" },
      include: { responsable: { select: { id: true, name: true, username: true } } },
    }),
    prisma.mantenimientoJuridico.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function createMantenimientoJuridico(data: {
  clienteJuridicoId: string;
  descripcion: string;
  responsableId: string;
}) {
  return prisma.mantenimientoJuridico.create({
    data,
    include: { responsable: { select: { id: true, name: true, username: true } } },
  });
}
