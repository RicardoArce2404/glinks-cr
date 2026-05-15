import { z } from "zod";

// Expresiones regulares según ERS
const cedulaRegex = /^[1-9][0-9]{6}$/;
const cedulaJuridicaRegex = /^[1-9][0-9]{9}$/;
const telefonoRegex = /^[2-8][0-9]{7}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const planes = ["4-4", "6-6", "8-8"] as const;

// ─── Cliente Físico ───

export const createClienteFisicoSchema = z.object({
  cedula: z.string().regex(cedulaRegex, "Cédula debe tener 7 dígitos, no iniciar con 0"),
  nombre: z.string().min(1).max(50),
  apellido1: z.string().min(1).max(50),
  apellido2: z.string().min(1).max(50),
  telefonoPrimario: z.string().regex(telefonoRegex, "Teléfono debe tener 8 dígitos"),
  telefonoSecundario: z.string().regex(telefonoRegex, "Teléfono debe tener 8 dígitos").optional().nullable(),
  email: z.string().regex(emailRegex, "Correo electrónico inválido").optional().nullable(),
  domicilio: z.string().min(1).max(255),
  plan: z.enum(planes),
  sectorialId: z.string().uuid("Sectorial debe ser un ID válido"),
  tipoAPId: z.string().uuid("Tipo de AP debe ser un ID válido"),
  routerId: z.number().int().positive(),
  poeId: z.number().int().positive(),
});

export const updateClienteFisicoSchema = createClienteFisicoSchema.partial();

// ─── Cliente Jurídico ───

export const createClienteJuridicoSchema = z.object({
  cedulaJuridica: z.string().regex(cedulaJuridicaRegex, "Cédula jurídica debe tener 10 dígitos"),
  nombreEmpresa: z.string().min(1).max(255),
  telefonoPrimario: z.string().regex(telefonoRegex, "Teléfono debe tener 8 dígitos"),
  telefonoSecundario: z.string().regex(telefonoRegex, "Teléfono debe tener 8 dígitos").optional().nullable(),
  domicilio: z.string().min(1).max(255),
  email: z.string().regex(emailRegex, "Correo electrónico inválido").optional().nullable(),
  plan: z.enum(planes),
  sectorialId: z.string().uuid("Sectorial debe ser un ID válido"),
  tipoAPId: z.string().uuid("Tipo de AP debe ser un ID válido"),
  routerId: z.number().int().positive(),
  poeId: z.number().int().positive(),
});

export const updateClienteJuridicoSchema = createClienteJuridicoSchema.partial();
