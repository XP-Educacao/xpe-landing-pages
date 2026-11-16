/**
 * npm run preview — servidor local SÓ para conferência (nada é publicado).
 *
 * Serve a pasta dist/ no mesmo caminho do GitHub Pages, para testar os caminhos relativos:
 *   http://localhost:4173/xpe-landing-pages/exame-especial/pg-1/
 * E simula a página dentro de um iframe, como na Home do D2L:
 *   http://localhost:4173/__d2l/?p=pg-1
 * Pare com Ctrl+C.
 */
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

import { loadGlobal } from './lib/config.mjs';
import { DIST_DIR, PROJECT_NAME } from './lib/project.mjs';
import { escapeAttr } from './lib/text.mjs';

const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

if (!existsSync(DIST_DIR)) {
  console.log('✘ A pasta dist/ não existe. Rode antes: npm run build');
  process.exit(1);
}
const global = await loadGlobal();
const repoPath = global.config ? new URL(global.config.site.publicBaseUrl).pathname : '/';
const prefix = `${repoPath}${PROJECT_NAME}/`;

function d2lPage(slug) {
  const src = escapeAttr(`${prefix}${slug}/`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Simulação D2L</title>
<style>body{margin:0;font:14px system-ui;background:#e9ecef}header{background:#3a3f44;color:#fff;padding:10px 16px}
iframe{display:block;width:min(100%,1100px);height:85vh;margin:16px auto;border:1px solid #ccc;background:#fff}</style></head>
<body><header>Simulação da Home do D2L · iframe com ${src}</header><iframe src="${src}" title="Exame Especial"></iframe></body></html>`;
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__d2l/' || url.pathname === '/__d2l') {
    const requested = url.searchParams.get('p') ?? '';
    const slug = /^[a-z0-9-]+$/.test(requested) ? requested : 'pg-1';
    res.writeHead(200, { 'content-type': TYPES['.html'] }).end(d2lPage(slug));
    return;
  }
  if (!url.pathname.startsWith(prefix)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end(`404 — as páginas ficam em ${prefix}<slug>/`);
    return;
  }
  const relativePath = decodeURIComponent(url.pathname.slice(prefix.length));
  let file = resolve(DIST_DIR, relativePath);
  if (file !== DIST_DIR && !file.startsWith(DIST_DIR + sep)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      // Igual ao GitHub Pages: pasta sem barra final redireciona para a versão com barra.
      res.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    file = join(file, 'index.html');
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 — não encontrado');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  createReadStream(file).pipe(res);
});

server.on('error', (error) => {
  console.log(error.code === 'EADDRINUSE' ? `✘ A porta ${PORT} está em uso. Feche o outro preview ou use: $env:PORT=4174; npm run preview` : error.message);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  const slugs = readdirSync(DIST_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'assets')
    .map((entry) => entry.name);
  console.log('Preview local (Ctrl+C para parar):');
  for (const slug of slugs) {
    console.log(`  ${slug.padEnd(12)} http://localhost:${PORT}${prefix}${slug}/   no "D2L": http://localhost:${PORT}/__d2l/?p=${slug}`);
  }
});
