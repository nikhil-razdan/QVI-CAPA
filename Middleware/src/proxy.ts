import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));

app.get('/health', (_req, res) => {
  res.json({ status: 'proxy up' });
});

app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:4000',
  changeOrigin: true,
  on: {
    error: (err, req, res: any) => {
      console.error('Proxy error:', err.message);
      res.status(502).json({ error: 'Proxy error', detail: err.message });
    },
    proxyReq: (proxyReq, req) => {
      console.log(`Forwarding: ${req.method} ${req.url} → ${proxyReq.path}`);
    }
  }
}));

app.listen(5000, () => {
  console.log('Proxy on http://localhost:5000');
});
