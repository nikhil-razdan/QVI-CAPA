import { Router } from "express";
import { createAuditor, getAuditors, updateAuditor, deleteAuditor } from "../controllers/auditorController.js";

const router = Router({ mergeParams: true });

router.post("/create", createAuditor);
router.get("/", getAuditors);
router.put("/:id", updateAuditor);
router.delete("/:id", deleteAuditor);

export default router;
