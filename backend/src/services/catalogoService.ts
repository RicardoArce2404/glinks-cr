import prisma from "../config/database.js";

// ─── Sectoriales ─────────────────────────────────────

export async function listSectoriales() {
  return prisma.sectorial.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getSectorial(id: string) {
  return prisma.sectorial.findUnique({ where: { id } });
}

export async function createSectorial(nombre: string) {
  return prisma.sectorial.create({ data: { nombre } });
}

export async function updateSectorial(id: string, nombre: string) {
  return prisma.sectorial.update({ where: { id }, data: { nombre } });
}

export async function deleteSectorial(id: string) {
  return prisma.sectorial.delete({ where: { id } });
}

// ─── Tipos de AP ─────────────────────────────────────

export async function listTiposAP() {
  return prisma.tipoAP.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getTipoAP(id: string) {
  return prisma.tipoAP.findUnique({ where: { id } });
}

export async function createTipoAP(nombre: string) {
  return prisma.tipoAP.create({ data: { nombre } });
}

export async function updateTipoAP(id: string, nombre: string) {
  return prisma.tipoAP.update({ where: { id }, data: { nombre } });
}

export async function deleteTipoAP(id: string) {
  return prisma.tipoAP.delete({ where: { id } });
}
