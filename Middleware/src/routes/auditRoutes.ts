import { Router } from 'express';
import { createAudit, getAudits, ingestAuditSubmission, scheduleAudit } from '../controllers/auditController.js';

const router = Router();

router.post('/create', createAudit);
router.get('/', getAudits);
router.post('/ingest', ingestAuditSubmission);
router.post('/schedule', scheduleAudit);

export default router;
