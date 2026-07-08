import { Router } from "express";
import { createAudit, getAudits, ingestAuditSubmission } from "../controllers/auditController.js";

const router = Router();

router.post("/create", createAudit);
router.get("/", getAudits);
router.post("/ingest", ingestAuditSubmission);

export default router;
