import { Router } from "express";
import * as clienteController from "../controllers/clienteController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", clienteController.listFisicos);
router.get("/search", clienteController.searchFisicos);
router.get("/:id", clienteController.getFisico);
router.post("/", clienteController.createFisico);
router.put("/:id", clienteController.updateFisico);
router.delete("/:id", clienteController.deleteFisico);

export default router;
