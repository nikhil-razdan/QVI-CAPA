import { Router } from 'express';
import {
  scheduleAuditSession,
  createManualAuditSession,
  processLoopHandshake,
  verifyGateCheckpoint,
  getCalendarFeed,
} from '../controllers/auditController.js';

const router = Router();

router.post('/schedule', scheduleAuditSession);
router.post('/create', createManualAuditSession);
router.get('/loop-handshake', processLoopHandshake);
router.get('/verify-checkpoint', verifyGateCheckpoint);
router.get('/calendar', getCalendarFeed);

export default router;
