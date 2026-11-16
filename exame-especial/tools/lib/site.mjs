/**
 * Orquestra tudo: carrega e valida as configs, gera o HTML de cada página, os assets e a
 * tabela do README. Usado por build, check, list e pelo teste.
 *
 * Nada é gravado aqui: generateSite() devolve a lista de arquivos (outputs) e quem chama decide.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { loadGlobal, resolvePage } from './config.mjs';
import { intlProblem, todayIso } from './dates.mjs';
import {
  ASSETS_DIR,
  DIST_DIR,
  findPages,
  findRedirects,
  findStrayFolders,
  PAGE_CONFIG_NAME,
  PAGE_HTML_NAME,
  PROJECT_DIR,
  PROJECT_NAME,
  README_FILE,
  slugProblem,
} from './project.mjs';
import { buildAssets, pageStatus, renderPage } from './render.mjs';

export const README_START = '<!-- PAGINAS:INICIO (gerado por npm run build — não edite entre estas linhas) -->';
export const README_END = '<!-- PAGINAS:FIM -->';

const hasErrors = (issues) => issues.some((issue) => issue.level === 'erro');

export function publicUrl(baseUrl, slug) {
  return `${baseUrl}${PROJECT_NAME}/${slug}/`;
}

const STATUS_LABEL = { ok: '✔ ok', pendente: '⚠ pendente', conferir: '⚠ conferir' };

function renderReadmeTable(pages, redirects, baseUrl) {
  const cell = (value) => String(value).replaceAll('|', '\\|');
  const rows = pages.map((page) => {
    const status = pageStatus(page.config);
    return `| \`${page.slug}\` | ${cell(page.config.bootcamp.name)} | ${STATUS_LABEL[status.form]} | ${STATUS_LABEL[status.support]} | ${publicUrl(baseUrl, page.slug)} |`;
  });
  const redirectRows = redirects.map(
    (r) => `| \`${r.slug}\` | ↪ redireciona para \`${r.target}\` | | | ${publicUrl(baseUrl, r.slug)} |`,
  );
  return [
    README_START,
    '| Pasta (slug) | Bootcamp | Formulário | Suporte | URL publicada |',
    '|---|---|---|---|---|',
    ...rows,
    ...redirectRows,
    README_END,
  ].join('\n');
}

/**
 * Gera o site em memória.
 * Devolve { ok, issues, pages, redirects, assets, outputs: [{ file, content }] }.
 */
export async function generateSite() {
  const issues = [];
  const intl = intlProblem();
  if (intl) {
    issues.push({ level: 'erro', file: null, path: '', message: intl, sentence: true });
    return { ok: false, issues, pages: [], redirects: [], outputs: [] };
  }

  const global = await loadGlobal();
  issues.push(...global.issues);
  if (hasErrors(global.issues)) return { ok: false, issues, pages: [], redirects: [], outputs: [] };

  const pages = [];
  for (const page of findPages()) {
    const problem = slugProblem(page.slug);
    if (problem) issues.push({ level: 'erro', file: page.dir, path: '', message: problem, sentence: true });
    const resolved = await resolvePage(page, global.config);
    issues.push(...resolved.issues);
    pages.push({ ...page, config: resolved.config });
    if (resolved.config && !hasErrors(resolved.issues) && resolved.config.exam.date < todayIso()) {
      issues.push({
        level: 'aviso',
        file: page.configFile,
        path: 'exam.date',
        message: `tem uma data que já passou (${resolved.config.exam.date}).`,
        fix: 'Atualize exam.date em config/global.config.mjs (ou em overrides da página).',
      });
    }
    const extras = readdirSync(page.dir).filter((name) => ![PAGE_CONFIG_NAME, PAGE_HTML_NAME].includes(name));
    if (extras.length > 0) {
      issues.push({
        level: 'aviso',
        file: page.dir,
        path: '',
        message: `A pasta da página deveria ter só ${PAGE_CONFIG_NAME} e ${PAGE_HTML_NAME}, mas tem também: ${extras.join(', ')}.`,
        fix: 'Mova ou apague esses arquivos (eles não são publicados).',
        sentence: true,
      });
    }
  }
  if (pages.length === 0) {
    issues.push({
      level: 'erro',
      file: PROJECT_DIR,
      path: '',
      message: 'Nenhuma página encontrada (pasta com page.config.mjs).',
      fix: 'Crie uma com: npm run new -- pg-1',
      sentence: true,
    });
  }

  const slugs = new Set(pages.map((p) => p.slug));
  const redirects = findRedirects();
  for (const r of redirects) {
    if (!slugs.has(r.target)) {
      issues.push({
        level: 'erro',
        file: r.htmlFile,
        path: '',
        message: `A pasta "${r.slug}" redireciona para "${r.target}", que não existe mais.`,
        fix: `Apague a pasta ${r.slug}/ ou rode de novo: npm run rename -- ${r.target || '<antigo>'} <novo> --redirect`,
        sentence: true,
      });
    }
  }
  for (const name of findStrayFolders()) {
    issues.push({
      level: 'aviso',
      file: join(PROJECT_DIR, name),
      path: '',
      message: `A pasta "${name}" não é página (falta ${PAGE_CONFIG_NAME}) nem redirecionamento; ela não é publicada.`,
      fix: 'Apague a pasta ou crie a página com npm run new.',
      sentence: true,
    });
  }

  if (hasErrors(issues)) return { ok: false, issues, pages, redirects, outputs: [] };

  let assets;
  try {
    assets = buildAssets();
  } catch (error) {
    issues.push({ level: 'erro', file: null, path: '', message: error.message, fix: 'Ajuste o arquivo citado em src/ e rode de novo.', sentence: true });
    return { ok: false, issues, pages, redirects, outputs: [] };
  }
  const outputs = [
    { file: join(ASSETS_DIR, assets.css.name), content: assets.css.content },
    { file: join(ASSETS_DIR, assets.js.name), content: assets.js.content },
    ...assets.fonts.map((font) => ({ file: join(ASSETS_DIR, font.name), content: font.content })),
  ];
  for (const page of pages) {
    page.html = renderPage(page.config, assets);
    page.status = pageStatus(page.config);
    outputs.push({ file: page.htmlFile, content: page.html });
  }

  const baseUrl = global.config.site.publicBaseUrl;
  if (existsSync(README_FILE)) {
    const readme = readFileSync(README_FILE, 'utf8');
    const start = readme.indexOf(README_START);
    const end = readme.indexOf(README_END);
    if (start !== -1 && end > start) {
      const updated = readme.slice(0, start) + renderReadmeTable(pages, redirects, baseUrl) + readme.slice(end + README_END.length);
      outputs.push({ file: README_FILE, content: updated });
    } else {
      issues.push({
        level: 'aviso',
        file: README_FILE,
        path: '',
        message: 'Não achei as marcas da tabela de páginas, então ela não foi atualizada.',
        fix: `Recoloque as linhas ${README_START} e ${README_END} no README.`,
        sentence: true,
      });
    }
  }

  return { ok: true, issues, pages, redirects, assets, outputs, baseUrl };
}

/** Compara os arquivos gerados com o que está no disco. Devolve a lista dos diferentes. */
export function staleOutputs(outputs) {
  return outputs.filter((o) => {
    if (!existsSync(o.file)) return true;
    if (Buffer.isBuffer(o.content)) return !readFileSync(o.file).equals(o.content);
    return readFileSync(o.file, 'utf8').replace(/\r\n/g, '\n') !== o.content;
  });
}

/** Fontes em assets/ que o build não gera mais (ex.: removidas de src/fonts/ ou do CSS). */
export function leftoverFonts(site) {
  if (!existsSync(ASSETS_DIR)) return [];
  const generated = new Set(site.assets.fonts.map((font) => font.name));
  return readdirSync(ASSETS_DIR)
    .filter((name) => name.endsWith('.woff2') && !generated.has(name))
    .map((name) => join(ASSETS_DIR, name));
}

/**
 * Grava os arquivos gerados (só os que mudaram), apaga de assets/ as fontes que não são mais
 * usadas e remonta a pasta dist/ publicada pelo deploy.
 */
export function writeSite(site) {
  const changed = staleOutputs(site.outputs);
  for (const output of changed) {
    mkdirSync(dirname(output.file), { recursive: true });
    writeFileSync(output.file, output.content);
  }
  const removed = leftoverFonts(site);
  for (const file of removed) rmSync(file);

  rmSync(DIST_DIR, { recursive: true, force: true });
  mkdirSync(join(DIST_DIR, 'assets'), { recursive: true });
  for (const asset of [site.assets.css, site.assets.js, ...site.assets.fonts]) {
    writeFileSync(join(DIST_DIR, 'assets', asset.name), asset.content);
  }
  for (const page of site.pages) {
    mkdirSync(join(DIST_DIR, page.slug), { recursive: true });
    writeFileSync(join(DIST_DIR, page.slug, PAGE_HTML_NAME), page.html, 'utf8');
  }
  for (const r of site.redirects) {
    cpSync(r.htmlFile, join(DIST_DIR, r.slug, PAGE_HTML_NAME));
  }
  return { changed, removed };
}
