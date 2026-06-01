import { Router } from "express";
import * as controller from "../controllers/productosController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Rutas principales
router.get("/", controller.list);
router.get("/search", controller.search);
router.get("/resumen", controller.summary);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;