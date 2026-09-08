/**
 * Bridges Node's `http` request/response objects to the standard
 * Request/Response pair the handler speaks. Used by both the Vite middleware
 * and the standalone server.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FetchHandler } from './area-analysis/handler.ts';

/** Largest request body accepted. Analysis requests are tiny JSON objects. */
export const MAX_BODY_BYTES = 16 * 1024;

export type NodeRequestListener = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function createNodeRequestListener(
  handler: FetchHandler,
  options: { maxBodyBytes?: number } = {},
): NodeRequestListener {
  const maxBodyBytes = options.maxBodyBytes ?? MAX_BODY_BYTES;

  return async (req, res) => {
    let body: string | undefined;
    try {
      body = await readBody(req, maxBodyBytes);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) {
        sendJson(res, 413, {
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request body must be under ${maxBodyBytes} bytes.`,
          },
        });
        return;
      }
      throw error;
    }

    const response = await handler(toWebRequest(req, body));
    await sendWebResponse(res, response);
  };
}

class PayloadTooLargeError extends Error {
  constructor() {
    super('Request body too large.');
    this.name = 'PayloadTooLargeError';
  }
}

async function readBody(req: IncomingMessage, maxBytes: number): Promise<string | undefined> {
  // A Request may not carry a body for these methods.
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    size += buffer.length;
    if (size > maxBytes) throw new PayloadTooLargeError();
    chunks.push(buffer);
  }

  return chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined;
}

function toWebRequest(req: IncomingMessage, body: string | undefined): Request {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (typeof value === 'string') {
      headers.set(name, value);
    }
  }

  return new Request(url, { method: req.method, headers, body });
}

async function sendWebResponse(res: ServerResponse, response: Response): Promise<void> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, name) => {
    headers[name] = value;
  });

  const body = Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, headers);
  res.end(body);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
