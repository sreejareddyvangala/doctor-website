/**
 * Serves the area-analysis API from the Vite dev server (`npm run dev`) and
 * the preview server (`npm run preview`), so the UI can call
 * `/api/area-analysis` on the same origin with no proxy or second process.
 *
 * Production deployments use `server/index.ts`, or any thin adapter around
 * the same handler.
 */

import { loadEnv, type Plugin, type PreviewServer, type ViteDevServer } from 'vite';
import { createApp, isApiPath } from './app.ts';
import { createNodeRequestListener } from './node-adapter.ts';

export function areaAnalysisApi(): Plugin {
  return {
    name: 'area-finder:api',
    configureServer(server) {
      mount(server);
    },
    configurePreviewServer(server) {
      mount(server);
    },
  };
}

function mount(server: ViteDevServer | PreviewServer): void {
  const { config } = server;

  // An empty prefix loads every variable from .env / .env.local, including the
  // server-only ones the browser bundle never sees. Real environment
  // variables take precedence over the files.
  const fileEnv = loadEnv(config.mode, config.envDir, '');
  const app = createApp(
    { ...fileEnv, ...process.env },
    {
      logger: {
        info: (message) => config.logger.info(message),
        warn: (message) => config.logger.warn(message),
        error: (message) => config.logger.error(message),
      },
    },
  );
  const listener = createNodeRequestListener(app.handler);

  server.middlewares.use((req, res, next) => {
    if (!isApiPath(req.url, app.basePath)) {
      next();
      return;
    }
    listener(req, res).catch(next);
  });
}
