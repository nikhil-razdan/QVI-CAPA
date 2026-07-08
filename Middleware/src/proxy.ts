import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

app.post('/webhooks/zoho-audit', upload.any(), (req, res) => {
  const secret = req.headers['x-zoho-webhook-secret'];
  if (secret !== process.env.ZOHO_WEBHOOK_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const fields = req.body;
  const files = (req.files as Express.Multer.File[] ?? []).map(f => ({
    fieldname: f.fieldname,
    originalname: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
    buffer: f.buffer.toString('base64'),
  }));

  fetch('http://127.0.0.1:4000/api/audits/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, files }),
  }).then(() => res.status(200).send('ok'))
    .catch(err => {
      console.error('Ingest forward failed:', err.message);
      res.status(502).json({ error: 'Ingest failed' });
    });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'proxy up' });
});

app.use('/api', createProxyMiddleware({ target: 'http://127.0.0.1:4000/api', changeOrigin: true}));

app.listen(5000, () => {
  console.log('Proxy on http://localhost:5000');
});
