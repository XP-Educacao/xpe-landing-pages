/**
 * npm run preview — servidor local SÓ para conferência (nada é publicado).
 *
 *   http://localhost:4180/                       → abre o hub no mesmo caminho do GitHub Pages
 *   http://localhost:4180/__d2l/                 → o hub dentro de um iframe, como no D2L
 *   http://localhost:4180/__d2l/?largura=800&altura=640   → quadro com outro tamanho
 *
 * A página é gerada de novo a cada F5: edite times.config.mjs, imagens/ ou src/ e atualize o
 * navegador. Se a config tiver erro, a própria página mostra a lista. Pare com Ctrl+C.
 * Se o código das ferramentas (tools/) mudar com o preview aberto, a página avisa para reiniciar.
 *
 * Demonstração com links ativos:  npm run preview -- --config tools/fixtures/demo.config.mjs
 */
import { readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { configArg, displayPath, PROJECT_DIR, PROJECT_NAME } from './lib/project.mjs';
import { summary } from './lib/report.mjs';
import { generateSite } from './lib/site.mjs';
import { escapeAttr, escapeHtml } from './lib/text.mjs';

const PORT = Number(process.env.PORT) || 4180;
const PREFIX = `/${basename(dirname(PROJECT_DIR))}/${PROJECT_NAME}/`;
const configFile = configArg();
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

/*
 * A config, o CSS, o JS da busca e as imagens são relidos a cada F5. O código das ferramentas
 * (tools/lib e este arquivo) só é carregado quando o preview abre: se ele mudar, a página
 * mostraria regras antigas. Por isso o preview compara a "impressão digital" desses arquivos.
 */
const THIS_FILE = fileURLToPath(import.meta.url);
const LIB_DIR = join(dirname(THIS_FILE), 'lib');

function codeStamp() {
  const files = [THIS_FILE, ...readdirSync(LIB_DIR).filter((name) => name.endsWith('.mjs')).map((name) => join(LIB_DIR, name))];
  return files
    .map((file) => {
      try {
        const stats = statSync(file);
        return `${file}:${stats.size}:${stats.mtimeMs}`;
      } catch {
        return `${file}:-`;
      }
    })
    .join('|');
}

const startupStamp = codeStamp();
let staleWarned = false;

function stalePage() {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Reinicie o preview</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:720px;margin:56px auto;padding:0 16px}code{background:#f0f0f0;padding:2px 6px}</style></head>
<body><h1>Reinicie o preview</h1>
<p>O código do hub foi atualizado depois que este preview foi aberto, então ele mostraria regras antigas.</p>
<p>No terminal onde o preview está rodando, aperte <b>Ctrl+C</b> e rode de novo <code>npm run preview</code>. Depois, aperte F5 aqui.</p></body></html>`;
}

function sizeParam(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 280 && number <= 2400 ? number : fallback;
}

function d2lPage(width, height) {
  const frameWidth = width ? `${width}px` : '100%';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Simulação · D2L</title>
<style>
body{margin:0;font:14px/1.4 system-ui,sans-serif;background:#f1f3f5;color:#202122}
.barra{display:flex;align-items:center;gap:12px;height:56px;padding:0 24px;background:#fff;border-bottom:1px solid #d3d9e3}
.nav{height:42px;background:#494c4e}
.conteudo{max-width:1280px;margin:24px auto;padding:0 16px}
.widget{width:${frameWidth};max-width:100%;margin:0 auto;background:#fff;border:1px solid #d3d9e3;border-radius:6px;overflow:hidden}
.widget h2{margin:0;padding:12px 16px;font-size:16px;border-bottom:1px solid #d3d9e3}
iframe{display:block;width:100%;height:${height}px;border:0}
.nota{color:#5f6568;margin:10px 0 0;text-align:center}
</style></head><body>
<div class="barra"><b>Simulação do D2L</b><span>só local · o hub abaixo está num iframe, como ficará no Brightspace</span></div>
<div class="nav"></div>
<div class="conteudo"><div class="widget"><h2>Times da XP Inc.</h2>
<iframe src="${escapeAttr(PREFIX)}" title="Hub de times"></iframe></div>
<p class="nota">Quadro: ${width ? `${width}px` : 'largura total'} × ${height}px · teste outros tamanhos com ?largura=800&amp;altura=640</p></div>
</body></html>`;
}

function errorPage(issues) {
  const items = issues
    .map(
      (issue) =>
        `<li><b>${issue.level === 'erro' ? 'ERRO' : 'AVISO'}</b> · ${escapeHtml(issue.field || displayPath(configFile))}<br>${escapeHtml(issue.message)}${
          issue.fix ? `<br><i>Como corrigir: ${escapeHtml(issue.fix)}</i>` : ''
        }</li>`,
    )
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Erro na config</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 16px}li{margin:0 0 14px}</style></head>
<body><h1>A config tem problemas</h1><p>Corrija <code>${escapeHtml(displayPath(configFile))}</code> e aperte F5.</p><ul>${items}</ul></body></html>`;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.pathname === '/') {
      response.writeHead(302, { location: PREFIX }).end();
      return;
    }
    if (url.pathname === '/__d2l' || url.pathname === '/__d2l/') {
      const width = sizeParam(url.searchParams.get('largura'), 0);
      const height = sizeParam(url.searchParams.get('altura'), 760);
      response.writeHead(200, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' }).end(d2lPage(width, height));
      return;
    }
    if (!url.pathname.startsWith(PREFIX)) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end(`404 · o hub fica em ${PREFIX}`);
      return;
    }

    const path = decodeURIComponent(url.pathname.slice(PREFIX.length)) || 'index.html';
    if (codeStamp() !== startupStamp) {
      if (!staleWarned) {
        staleWarned = true;
        console.log('\n⚠ O código do hub mudou desde que o preview abriu. Aperte Ctrl+C e rode npm run preview de novo.');
      }
      response.writeHead(503, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' }).end(stalePage());
      return;
    }
    const site = await generateSite({ configFile });
    if (!site.ok) {
      response.writeHead(500, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' }).end(errorPage(site.issues));
      return;
    }
    const content = site.files.get(path);
    if (content === undefined) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 · arquivo não encontrado');
      return;
    }
    response
      .writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
      .end(content);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(String(error?.stack ?? error));
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`✘ A porta ${PORT} já está em uso. Feche o outro preview ou rode com outra porta: $env:PORT=4181; npm run preview`);
  } else console.log(`✘ ${error.message}`);
  process.exit(1);
});

server.listen(PORT, async () => {
  const site = await generateSite({ configFile });
  console.log(`Config: ${displayPath(configFile)}${site.ok ? ` · ${summary(site.data)}` : ' · COM ERROS (a página mostra a lista)'}`);
  console.log(`\n  Hub:            http://localhost:${PORT}${PREFIX}`);
  console.log(`  Dentro do D2L:  http://localhost:${PORT}/__d2l/`);
  console.log('\nEdite a config e aperte F5 no navegador. Pare com Ctrl+C.');
});
