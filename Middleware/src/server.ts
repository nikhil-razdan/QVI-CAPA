import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import auditRouter from './routes/auditRoutes.js';
import companyRouter from './routes/companyRoutes.js';
import auditorRouter from './routes/auditorRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auditors', auditorRouter);
app.use('/api/audits', auditRouter);
app.use('/api/companies', companyRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'backend up' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal error' });
});

app.listen(4000, '127.0.0.1', () => {
  console.log('Backend on http://127.0.0.1:4000');
});
