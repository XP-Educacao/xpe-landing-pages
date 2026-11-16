/**
 * npm run check            → só avisa (não falha por pendências)
 * npm run check:strict     → falha se houver qualquer aviso. Rode antes de divulgar as URLs.
 *
 * Confere: configs, pendências ("[INSERIR…", links vazios), arquivos gerados desatualizados,
 * âncoras quebradas, caminhos absolutos, recursos externos e HTML/JS inseguro.
 * Erros sempre falham (exit 1).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ASSETS_DIR, cliArgs, SRC_DIR } from './lib/project.mjs';
import { ASSET_NAMES, availableFonts } from './lib/render.mjs';
import { printIssues } from './lib/report.mjs';
import { generateSite, staleOutputs } from './lib/site.mjs';

const strict = cliArgs().has('strict');
const site = await generateSite();
const issues = [...site.issues];
const add = (level, file, message, fix) => issues.push({ level, file, path: '', message, fix, sentence: true });

/** Âncoras e ids que precisam existir (o D2L pode apontar para elas). */
const REQUIRED_IDS = ['polo', 'formulario', 'googleFormContainer', 'suporteLink', 'faq'];

function scanHtml(html, file) {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const id of REQUIRED_IDS) {
    if (!ids.has(id)) add('erro', file, `Falta o elemento com id="${id}".`, 'Ele vem do template em src/template/; não remova o id.');
  }
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(anchor)) add('erro', file, `O link #${anchor} não leva a lugar nenhum (falta id="${anchor}").`, 'Confira o href no template.');
  }
  for (const [match] of html.matchAll(/\s(?:href|src|action)="\/[^"]*"/g)) {
    add('erro', file, `Caminho absoluto ${match.trim()} quebra no GitHub Pages (o site fica em /xpe-landing-pages/).`, 'Use caminho relativo, ex.: ../assets/arquivo.css');
  }
  for (const [match] of html.matchAll(/\s(?:href|src)="(?:https?:)?\/\/[^"]*"/g)) {
    if (/<(?:link|script|img)\b[^>]*$/.test(html.slice(0, html.indexOf(match)))) {
      add('erro', file, `Recurso externo ${match.trim()}: a página não carrega nada de fora (sem CDN, fontes ou bibliotecas).`, 'Coloque o arquivo em src/ e gere com npm run build.');
    }
  }
  const unsafe = [
    [/<script(?![^>]*\ssrc=)[^>]*>/i, 'script inline'],
    [/\son[a-z]+\s*=/i, 'atributo de evento (onclick=…)'],
    [/javascript:/i, 'link javascript:'],
    [/<iframe\b/i, '<iframe> fixo no HTML (o do formulário é criado pelo script, só com URL válida)'],
    [/<base\b/i, '<base> (muda todos os caminhos relativos)'],
  ];
  for (const [pattern, label] of unsafe) {
    if (pattern.test(html)) add('erro', file, `HTML inseguro: ${label}.`, 'Remova do template; comportamento fica em src/scripts/.');
  }
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*noreferrer[^"]*"/.test(tag)) {
      add('erro', file, `Link que abre nova aba sem rel="noopener noreferrer": ${tag}`, 'Inclua rel="noopener noreferrer".');
    }
  }
}

function scanAssets(assets) {
  const cssFile = join(ASSETS_DIR, ASSET_NAMES.css);
  if (/url\(\s*['"]?\//.test(assets.css.content) || /@import/.test(assets.css.content)) {
    add('erro', cssFile, 'O CSS usa url(/…) ou @import.', 'Use caminhos relativos e não importe arquivos externos.');
  }
  const fontNames = new Set(assets.fonts.map((font) => font.name));
  for (const [, target] of assets.css.content.matchAll(/url\(\s*['"]?([^'")\s]+)/g)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) {
      add('erro', cssFile, `O CSS carrega url(${target}) de fora: a página não carrega nada de fora (sem CDN nem Google Fonts).`, 'Coloque a fonte em src/fonts/ e use url(<nome>.woff2).');
    } else if (!fontNames.has(target.split('?')[0])) {
      add('erro', cssFile, `O CSS aponta para url(${target}), que o build não gera em assets/.`, 'Use url(<nome>.woff2) com um arquivo que exista em src/fonts/.');
    }
  }
  for (const name of availableFonts()) {
    if (!fontNames.has(name)) add('aviso', join(SRC_DIR, 'fonts', name), `Fonte sem uso: nenhum CSS em src/styles/ usa url(${name}).`, 'Apague o arquivo ou use-o num @font-face.');
  }
  const jsFile = join(ASSETS_DIR, ASSET_NAMES.js);
  const forbidden = [
    [/\bwindow\.top\b|\btop\.location\b|\bparent\.location\b|\bwindow\.parent\b|\bself\s*!==?\s*top\b/, 'acesso a window.top/parent (a página roda em iframe no D2L)'],
    [/\beval\s*\(|new Function\s*\(/, 'eval/new Function'],
    [/\.innerHTML\s*=|insertAdjacentHTML|document\.write/, 'inserção de HTML cru'],
    [/https?:\/\/(?!docs\.google\.com)/, 'endereço externo fixo no script'],
  ];
  for (const [pattern, label] of forbidden) {
    if (pattern.test(assets.js.content)) add('erro', jsFile, `Script inseguro: ${label}.`, 'Ajuste src/scripts/page.js.');
  }
  const known = new Set([...Object.values(ASSET_NAMES), ...fontNames]);
  for (const name of readdirSync(ASSETS_DIR)) {
    if (!known.has(name)) add('aviso', join(ASSETS_DIR, name), `Arquivo que o build não gera: assets/${name}.`, 'Apague se não for usado.');
  }
}

if (site.ok) {
  for (const page of site.pages) scanHtml(page.html, page.htmlFile);
  for (const r of site.redirects) {
    const html = readFileSync(r.htmlFile, 'utf8');
    if (/\s(?:href|src)="\//.test(html) || /url=\//.test(html)) add('erro', r.htmlFile, 'O redirecionamento usa caminho absoluto.', 'Recrie com npm run rename -- … --redirect.');
  }
  scanAssets(site.assets);
  for (const output of staleOutputs(site.outputs)) {
    add(
      'aviso',
      output.file,
      'Arquivo gerado desatualizado: as configs ou src/ mudaram depois do último build, ou ele foi editado à mão.',
      'Rode npm run build e faça o commit dos arquivos gerados.',
    );
  }
}

console.log(`Conferindo ${site.pages.length} página(s)${strict ? ' em modo rigoroso (--strict)' : ''}…\n`);
const { errors, warnings } = printIssues(issues);
console.log(`\n${errors} erro(s), ${warnings} aviso(s).`);

if (errors > 0) {
  console.log('✘ Corrija os erros: o deploy de TODO o repositório para enquanto houver erro aqui.');
  process.exit(1);
}
if (strict && warnings > 0) {
  console.log('✘ Modo rigoroso: resolva as pendências antes de divulgar as URLs.');
  process.exit(1);
}
console.log(warnings > 0 ? '✔ Sem erros. As pendências acima não impedem o deploy.' : '✔ Tudo certo.');
