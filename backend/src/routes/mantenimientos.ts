import { Router } from "express";
import * as mantenimientoController from "../controllers/mantenimientoController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Mantenimientos a clientes físicos
router.get("/fisicos", mantenimientoController.listFisicos);
router.post("/fisicos", mantenimientoController.createFisico);

// Mantenimientos a clientes jurídicos
router.get("/juridicos", mantenimientoController.listJuridicos);
router.post("/juridicos", mantenimientoController.createJuridico);

export default router;
