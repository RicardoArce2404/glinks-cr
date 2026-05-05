import { Router } from "express";
import * as clienteController from "../controllers/clienteController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", clienteController.listJuridicos);
router.get("/search", clienteController.searchJuridicos);
router.get("/:id", clienteController.getJuridico);
router.post("/", clienteController.createJuridico);
router.put("/:id", clienteController.updateJuridico);
router.delete("/:id", clienteController.deleteJuridico);

export default router;
