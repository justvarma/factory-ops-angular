import express from 'express';
import next from 'next';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function bootstrap() {
  await app.prepare();
  const server = express();

  // Next.js API Routes handler
  server.all('/api/*', (req, res) => {
    return handle(req, res);
  });

  // Handle Next.js static assets
  server.all('/_next/*', (req, res) => {
    return handle(req, res);
  });

  // Serve Angular application files from disk
  // Standard application builder output is in dist/browser
  const angularDistBase = path.join(process.cwd(), 'dist');
  const angularDist = fs.existsSync(path.join(angularDistBase, 'browser'))
    ? path.join(angularDistBase, 'browser')
    : angularDistBase;
    
  server.use(express.static(angularDist));

  // Catch-all route for Angular SPA (must be after /api and /_next)
  server.get('*', (req, res) => {
    // If it's a file request that didn't match express.static, let it fall through or send index
    if (req.url.includes('.') && !req.url.endsWith('.html')) {
        res.status(404).end();
        return;
    }
    const indexPath = path.join(angularDist, 'index.html');
    
    // Safety check for index.html existence
    if (!fs.existsSync(indexPath)) {
      console.error(`index.html not found at ${indexPath}`);
      return res.status(503).send('Angular application build in progress or failed. Please refresh in a few seconds.');
    }

    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading the application.');
      }
    });
  });

  const port = 3000;
  server.listen(port, () => {
    console.log(`> Hybrid Server Ready on http://localhost:${port}`);
    console.log(`> UI: Angular | Backend: Next.js API Routes`);
  });
}

bootstrap().catch(err => {
  console.error('Error starting server', err);
  process.exit(1);
});
