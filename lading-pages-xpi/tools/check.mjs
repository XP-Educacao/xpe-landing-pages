/**
 * npm run check          → confere a config e a página gerada. Pendências (time sem home) só avisam.
 * npm run check:strict   → falha também com avisos. Rode antes de divulgar o link.
 *
 * Erros sempre falham (exit 1). No GitHub isso impede a publicação e a versão anterior continua no ar.
 */
import { configArg, displayPath } from './lib/project.mjs';
import { printIssues, summary } from './lib/report.mjs';
import { generateSite } from './lib/site.mjs';

const strict = process.argv.includes('--strict');
const configFile = configArg();
const site = await generateSite({ configFile });
const issues = [...site.issues];

/** Guardas do HTML gerado (protegem contra mudanças futuras no template). */
function scanHtml(html) {
  const found = [];
  const add = (message, fix) => found.push({ level: 'erro', file: 'página gerada (index.html)', message, fix });
  const template = 'Ajuste o template em tools/lib/render.mjs.';

  if (/<script\b(?![^>]*\ssrc=)[^>]*>/i.test(html)) add('Tem <script> embutido.', `${template} Comportamento fica em src/hub.js.`);
  if (/\son[a-z]+\s*=/i.test(html)) add('Tem atributo de evento (onclick=…).', `${template} Comportamento fica em src/hub.js.`);
  if (/javascript:/i.test(html)) add('Tem link javascript:.', template);
  if (/\sstyle\s*=/i.test(html)) add('Tem style="…", que a Content-Security-Policy bloqueia.', 'Coloque o estilo em src/estilos.css.');
  if (/<iframe\b/i.test(html)) add('Tem <iframe>. O hub só direciona; não embute outras páginas.', template);
  for (const [match] of html.matchAll(/\s(?:href|src)="\/(?!\/)[^"]*"/g)) {
    add(`Caminho absoluto ${match.trim()} quebra no GitHub Pages (o site fica numa subpasta).`, 'Use caminho relativo.');
  }
  for (const [tag] of html.matchAll(/<(?:link|script|img)\b[^>]*\s(?:href|src)="(?:https?:)?\/\/[^"]*"[^>]*>/gi)) {
    add(`Recurso externo: ${tag}. O hub não carrega nada de fora (sem CDN, fontes ou rastreadores).`, 'Coloque o arquivo na pasta do projeto.');
  }
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(tag)) add(`Link de nova aba sem rel="noopener noreferrer": ${tag}`, template);
  }
  return found;
}

if (site.ok) issues.push(...scanHtml(site.html));

const { errors, warnings } = printIssues(issues, displayPath(configFile));
const failed = errors > 0 || (strict && warnings > 0);

if (issues.length > 0) console.log('');
if (errors > 0) {
  console.log(`✘ ${errors} erro(s). Corrija antes de publicar: com erro, o deploy para e a versão anterior continua no ar.`);
} else if (strict && warnings > 0) {
  console.log(`✘ ${warnings} aviso(s) no modo estrito. Resolva as pendências antes de divulgar o link.`);
} else {
  const note = warnings > 0 ? ` (${warnings} aviso(s): o hub publica, mas vale resolver)` : '';
  console.log(`✔ Config ok · ${summary(site.data)}${note}`);
}
process.exit(failed ? 1 : 0);
