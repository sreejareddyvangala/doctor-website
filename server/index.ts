/**
 * Standalone production server.
 *
 * Serves the built SPA from `dist/` and the area-analysis API from the same
 * origin. Runs directly on Node 22.18+ (TypeScript is stripped natively):
 *
 *   npm run build
 *   npm start            # http://localhost:8787
 *
 * Configuration comes from the environment, with `.env.local` and `.env` as
 * fallbacks. See `.env.example`.
 */

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp, isApiPath } from './app.ts';
import { loadEnvFiles } from './env-files.ts';
import { createNodeRequestListener } from './node-adapter.ts';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

const app = createApp({ ...(await loadEnvFiles(rootDir, ['.env', '.env.local'])), ...process.env });
const api = createNodeRequestListener(app.handler);

const server = createServer((req, res) => {
  const work = isApiPath(req.url, app.basePath) ? api(req, res) : serveStatic(req, res);

  work.catch((error: unknown) => {
    console.error(`[server] ${req.method} ${req.url} failed:`, error);
    if (!res.headersSent) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  });
});

server.listen(app.env.port, () => {
  console.log(
    `Area Finder listening on http://localhost:${app.env.port} (data source: ${app.env.dataSource})`,
  );
});

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function serveStatic(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    res.end();
    return;
  }

  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  let filePath = path.normalize(path.join(distDir, pathname));
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end();
    return;
  }

  let info = await stat(filePath).catch(() => null);
  if (!info || info.isDirectory()) {
    // SPA fallback: every route that is not a file is rendered by index.html.
    filePath = path.join(distDir, 'index.html');
    info = await stat(filePath).catch(() => null);
    if (!info) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('dist/ not found. Run "npm run build" first.');
      return;
    }
  }

  const extension = path.extname(filePath).toLowerCase();
  // Vite fingerprints everything under dist/assets, so it can be cached forever.
  const isHashedAsset = path.relative(distDir, filePath).split(path.sep)[0] === 'assets';

  res.writeHead(200, {
    'content-type': MIME_TYPES[extension] ?? 'application/octet-stream',
    'content-length': info.size,
    'cache-control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    createReadStream(filePath).on('error', reject).on('end', resolve).pipe(res);
  });
}
