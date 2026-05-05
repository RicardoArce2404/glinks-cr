import { Router } from "express";
import * as inventarioController from "../controllers/inventarioController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/resumen", inventarioController.resumen);
router.get("/", inventarioController.list);
router.get("/:id", inventarioController.get);
router.post("/", inventarioController.create);
router.put("/:id", inventarioController.update);
router.delete("/:id", inventarioController.remove);
router.patch("/:id/baja", inventarioController.darBaja);

export default router;
