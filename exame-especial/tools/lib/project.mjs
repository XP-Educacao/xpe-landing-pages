/**
 * Caminhos do projeto e descoberta de páginas.
 *
 * Uma PÁGINA é qualquer pasta direta de exame-especial/ que tenha page.config.mjs.
 * O nome da pasta é o slug (o final da URL). Nenhum outro arquivo guarda o slug.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PROJECT_NAME = basename(PROJECT_DIR);
export const REPO_DIR = dirname(PROJECT_DIR);

export const GLOBAL_CONFIG_FILE = join(PROJECT_DIR, 'config', 'global.config.mjs');
export const PAGE_CONFIG_NAME = 'page.config.mjs';
export const PAGE_HTML_NAME = 'index.html';
export const ASSETS_DIR = join(PROJECT_DIR, 'assets');
export const DIST_DIR = join(PROJECT_DIR, 'dist');
export const SRC_DIR = join(PROJECT_DIR, 'src');
export const README_FILE = join(PROJECT_DIR, 'README.md');
export const REFERENCE_FILE = join(PROJECT_DIR, 'reference', 'original.html');

/** Pastas do projeto que nunca são páginas (e não podem virar slug). */
export const RESERVED_NAMES = new Set([
  'assets',
  'config',
  'dist',
  'node_modules',
  'reference',
  'src',
  'tools',
]);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Marca que identifica um index.html de redirecionamento deixado pelo `npm run rename`. */
export const REDIRECT_MARKER = 'REDIRECIONAMENTO gerado por tools/rename-page';

/** Caminho amigável para mensagens: "exame-especial/pg-1/page.config.mjs". */
export function displayPath(path) {
  return relative(REPO_DIR, path).split(sep).join('/');
}

/** Devolve a mensagem de erro do slug, ou null se estiver ok. */
export function slugProblem(slug) {
  if (!slug) return 'Informe o nome da página (slug). Ex.: npm run new -- pg-5';
  if (!SLUG_PATTERN.test(slug)) {
    return `"${slug}" não serve como endereço. Use só minúsculas, números e hífens, sem acento nem espaço (ex.: "bootcamp-dados").`;
  }
  if (RESERVED_NAMES.has(slug)) return `"${slug}" é uma pasta interna do projeto. Escolha outro nome.`;
  return null;
}

const byName = (a, b) => a.localeCompare(b, 'pt-BR', { numeric: true });

function subfolders() {
  return readdirSync(PROJECT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !RESERVED_NAMES.has(entry.name))
    .map((entry) => entry.name)
    .sort(byName);
}

/** Páginas: [{ slug, dir, configFile, htmlFile }], em ordem natural (pg-2 antes de pg-10). */
export function findPages() {
  return subfolders()
    .filter((name) => existsSync(join(PROJECT_DIR, name, PAGE_CONFIG_NAME)))
    .map((slug) => ({
      slug,
      dir: join(PROJECT_DIR, slug),
      configFile: join(PROJECT_DIR, slug, PAGE_CONFIG_NAME),
      htmlFile: join(PROJECT_DIR, slug, PAGE_HTML_NAME),
    }));
}

/** Lê o destino de um index.html de redirecionamento (ou null se não for um). */
export function readRedirectTarget(htmlFile) {
  if (!existsSync(htmlFile)) return null;
  const html = readFileSync(htmlFile, 'utf8');
  if (!html.includes(REDIRECT_MARKER)) return null;
  return html.match(/<meta http-equiv="refresh" content="0; url=\.\.\/([a-z0-9-]+)\/"/)?.[1] ?? '';
}

/** Redirecionamentos: [{ slug, dir, htmlFile, target }]. */
export function findRedirects() {
  return subfolders()
    .filter((name) => !existsSync(join(PROJECT_DIR, name, PAGE_CONFIG_NAME)))
    .map((slug) => ({ slug, dir: join(PROJECT_DIR, slug), htmlFile: join(PROJECT_DIR, slug, PAGE_HTML_NAME) }))
    .map((entry) => ({ ...entry, target: readRedirectTarget(entry.htmlFile) }))
    .filter((entry) => entry.target !== null);
}

/** Pastas que não são página, redirecionamento nem pasta interna (provável engano). */
export function findStrayFolders() {
  const known = new Set([...findPages().map((p) => p.slug), ...findRedirects().map((r) => r.slug)]);
  return subfolders().filter((name) => !known.has(name));
}

/** Lê os valores da linha de comando aceitando "--flag" ou npm_config_flag (PowerShell às vezes come o "--"). */
export function cliArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2)));
  const has = (flag) => flags.has(flag) || process.env[`npm_config_${flag}`] === 'true';
  return { positional: args.filter((a) => !a.startsWith('--')), has };
}
