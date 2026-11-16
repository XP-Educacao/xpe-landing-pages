/**
 * Geração do HTML das páginas, dos assets compartilhados e das páginas de redirecionamento.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FORM_EMBED_URL_PATTERN, SUPPORT_URL_PATTERN } from '../../src/scripts/rules.mjs';
import renderDocument from '../../src/template/document.mjs';
import { computeTokens } from './config.mjs';
import { deriveDate } from './dates.mjs';
import { REDIRECT_MARKER, SRC_DIR } from './project.mjs';
import { escapeAttr, escapeHtml, renderAttr, renderPlain, renderText } from './text.mjs';

export const ASSET_NAMES = { css: 'exame-especial.css', js: 'exame-especial.js' };

const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const version = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);

/** Fontes disponíveis em src/fonts/ (só .woff2). */
export function availableFonts() {
  const dir = join(SRC_DIR, 'fonts');
  return existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.woff2')).sort() : [];
}

/**
 * Junta src/styles/*.css (em ordem de nome) e monta o JS com as regras de URL.
 * Fontes citadas no CSS como url(<nome>.woff2) são copiadas de src/fonts/ para assets/ e
 * ganham ?v=<hash>, como o CSS e o JS.
 */
export function buildAssets() {
  const stylesDir = join(SRC_DIR, 'styles');
  const styleFiles = readdirSync(stylesDir)
    .filter((file) => file.endsWith('.css'))
    .sort()
    .map((name) => ({ name, content: read(join(stylesDir, name)) }));

  const fontNames = availableFonts();
  const fonts = new Map();
  const withFontVersions = styleFiles.map(({ name, content }) =>
    content.replace(/url\(\s*(['"]?)([^'")\s]+\.woff2)\1\s*\)/g, (match, quote, fontName) => {
      if (/[:/\\]/.test(fontName)) {
        throw new Error(
          `src/styles/${name} usa url(${fontName}): a fonte precisa estar no projeto (sem Google Fonts, CDN ou pastas). ` +
            'Coloque o arquivo .woff2 em src/fonts/ e use url(<nome>.woff2).',
        );
      }
      if (!fontNames.includes(fontName)) {
        throw new Error(
          `src/styles/${name} usa url(${fontName}), mas não existe src/fonts/${fontName}. ` +
            `Fontes disponíveis: ${fontNames.join(', ') || 'nenhuma'}.`,
        );
      }
      if (!fonts.has(fontName)) {
        const content = readFileSync(join(SRC_DIR, 'fonts', fontName));
        fonts.set(fontName, { name: fontName, content, version: version(content) });
      }
      return `url(${quote}${fontName}?v=${fonts.get(fontName).version}${quote})`;
    }),
  );
  const css = '/* GERADO por tools/build — não editar; edite src/styles/ */\n' + withFontVersions.join('\n');

  const template = read(join(SRC_DIR, 'scripts', 'page.js'));
  const swaps = {
    '= __FORM_EMBED_URL_PATTERN__;': `= ${FORM_EMBED_URL_PATTERN};`,
    '= __SUPPORT_URL_PATTERN__;': `= ${SUPPORT_URL_PATTERN};`,
  };
  let js = template;
  for (const [token, value] of Object.entries(swaps)) {
    if (js.split(token).length !== 2) throw new Error(`src/scripts/page.js precisa ter "${token}" exatamente uma vez.`);
    js = js.replace(token, () => value);
  }
  js = `/* GERADO por tools/build — não editar; edite src/scripts/ */\n${js}`;

  return {
    css: { name: ASSET_NAMES.css, content: css, version: version(css) },
    js: { name: ASSET_NAMES.js, content: js, version: version(js) },
    fonts: [...fonts.values()],
    styleFiles,
  };
}

const svgCache = new Map();

/** Conteúdo interno de src/icons/<nome>.svg, sem comentários nem espaços entre as tags. */
function svgInner(name) {
  if (!svgCache.has(name)) {
    const source = read(join(SRC_DIR, 'icons', `${name}.svg`)).replace(/<!--[\s\S]*?-->/g, '');
    const inner = source.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)?.[1];
    if (inner === undefined) throw new Error(`src/icons/${name}.svg não tem <svg>…</svg>.`);
    svgCache.set(name, inner.replace(/>\s+</g, '><').trim());
  }
  return svgCache.get(name);
}

/** HTML completo de uma página a partir da config final (já validada). */
export function renderPage(config, assets) {
  const tokens = computeTokens(config);
  const c = {
    cfg: config,
    date: deriveDate(config.exam.date),
    text: (value) => renderText(value, tokens),
    plain: (value) => renderPlain(value, tokens),
    attr: (value) => renderAttr(value, tokens),
    url: (value) => escapeAttr(value),
    svg: (name, attrs, values = {}) => {
      const inner = svgInner(name).replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (!(key in values)) throw new Error(`src/icons/${name}.svg usa {{${key}}}, que o template não preenche.`);
        return escapeHtml(values[key]);
      });
      return `<svg ${attrs}>${inner}</svg>`;
    },
    assets: {
      css: `../assets/${assets.css.name}?v=${assets.css.version}`,
      js: `../assets/${assets.js.name}?v=${assets.js.version}`,
    },
  };
  return renderDocument(c);
}

/** Página deixada na pasta antiga por `npm run rename -- … --redirect`. */
export function renderRedirect(targetSlug) {
  const target = `../${targetSlug}/`;
  return [
    `<!-- ${REDIRECT_MARKER} — esta página mudou para ${target} -->\n`,
    '<!doctype html>\n',
    '<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    `<meta http-equiv="refresh" content="0; url=${target}">`,
    '<title>Página movida | XP Educação</title>\n',
    `<script>location.replace(${JSON.stringify(target)} + location.search + location.hash);</script>\n`,
    '</head><body>\n',
    `<p>Esta página mudou de endereço. <a href="${target}">Continuar para a página do Exame Especial</a>.</p>\n`,
    '</body></html>\n',
  ].join('');
}

/** Situação dos links de uma página, para o README e o `npm run list`. */
export function pageStatus(config) {
  const url = config.form.embedUrl;
  const form = url === '' ? 'pendente' : /[?&]embedded=true(?:&|#|$)/i.test(url) ? 'ok' : 'conferir';
  const support = config.support.url === '' ? 'pendente' : 'ok';
  return { form, support };
}
