import { Router } from 'express';
import { createSession, getSessions } from '../controllers/sessionController.js';

const router = Router();
router.post('/create', createSession);
router.get('/', getSessions);

export default router;
