import { Router } from "express";
import * as facturacionController from "../controllers/facturacionController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", facturacionController.list);
router.get("/:id", facturacionController.get);
router.post("/fisicos", facturacionController.createFisico);
router.post("/juridicos", facturacionController.createJuridico);
router.patch("/:id/anular", facturacionController.anular);

export default router;
