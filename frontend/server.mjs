import { createServer } from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import { renderPage } from './src/page.mjs';

const publicDir = new URL('./public/', import.meta.url);
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const apiOrigin = process.env.API_ORIGIN || 'http://127.0.0.1:8000';
const maxBodyBytes = 16 * 1024;

const assetNames = await readdir(new URL('assets/', publicDir));
const files = new Map([
  ['/styles.css', 'text/css; charset=utf-8'],
  ['/site.js', 'text/javascript; charset=utf-8'],
  ...assetNames.map(name => ['/assets/' + name, 'image/webp']),
]);
const page = renderPage();

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

async function proxy(req, res, path) {
  let body;
  if (req.method === 'POST') {
    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      req.resume();
      return json(res, 415, { detail: '请求格式须为 JSON' });
    }
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      bytes += chunk.length;
      if (bytes > maxBodyBytes) {
        req.resume();
        return json(res, 413, { detail: '需求内容超出长度限制' });
      }
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }

  try {
    const response = await fetch(new URL(path, apiOrigin), {
      method: req.method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
      signal: AbortSignal.timeout(5000),
    });
    const payload = await response.json();
    json(res, response.status, payload);
  } catch {
    json(res, 502, { detail: '咨询服务暂时不可用，请稍后重试' });
  }
}

createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if ((path === '/api/inquiries' && req.method === 'POST') ||
        (path === '/api/health' && req.method === 'GET')) {
      return await proxy(req, res, path);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return json(res, 405, { detail: '请求方法不受支持' });
    }
    if (path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(req.method === 'HEAD' ? undefined : page);
    }
    if (files.has(path)) {
      const contents = await readFile(new URL(path.slice(1), publicDir));
      res.writeHead(200, { 'Content-Type': files.get(path), 'Content-Length': contents.length });
      return res.end(req.method === 'HEAD' ? undefined : contents);
    }
    json(res, 404, { detail: '页面不存在' });
  } catch {
    if (!res.headersSent) json(res, 500, { detail: '服务暂时不可用' });
    else res.end();
  }
}).listen(port, host, () => {
  console.log('迈谷科技官网 http://' + host + ':' + port);
});
