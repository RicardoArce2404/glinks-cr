import { Router } from "express";
import * as catalogoController from "../controllers/catalogoController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Sectoriales
router.get("/sectoriales", catalogoController.listSectoriales);
router.get("/sectoriales/:id", catalogoController.getSectorial);
router.post("/sectoriales", catalogoController.createSectorial);
router.put("/sectoriales/:id", catalogoController.updateSectorial);
router.delete("/sectoriales/:id", catalogoController.deleteSectorial);

// Tipos de AP
router.get("/tipos-ap", catalogoController.listTiposAP);
router.get("/tipos-ap/:id", catalogoController.getTipoAP);
router.post("/tipos-ap", catalogoController.createTipoAP);
router.put("/tipos-ap/:id", catalogoController.updateTipoAP);
router.delete("/tipos-ap/:id", catalogoController.deleteTipoAP);

export default router;
