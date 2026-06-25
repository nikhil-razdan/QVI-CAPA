import { Router } from "express";
import { createAudit, getAudits } from "../controllers/auditController.js";

const router = Router();

router.post("/create", createAudit);
router.get("/", getAudits);

export default router;
