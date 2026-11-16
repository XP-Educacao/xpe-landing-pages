/**
 * npm run list — tabela com as páginas, a situação dos links e a URL publicada.
 */
import { printIssues } from './lib/report.mjs';
import { generateSite, publicUrl } from './lib/site.mjs';

const site = await generateSite();
if (!site.ok) {
  printIssues(site.issues, { only: 'erro' });
  console.log('\n✘ Corrija os erros acima para listar as páginas.');
  process.exit(1);
}

const LABEL = { ok: 'ok', pendente: 'PENDENTE', conferir: 'CONFERIR' };
const rows = [
  ['slug', 'bootcamp', 'formulário ok?', 'suporte ok?', 'URL final'],
  ...site.pages.map((page) => [
    page.slug,
    page.config.bootcamp.name,
    LABEL[page.status.form],
    LABEL[page.status.support],
    publicUrl(site.baseUrl, page.slug),
  ]),
  ...site.redirects.map((r) => [r.slug, `↪ redireciona para ${r.target}`, '-', '-', publicUrl(site.baseUrl, r.slug)]),
];
const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => row[col].length)));
const line = (row) => row.map((value, col) => value.padEnd(widths[col])).join(' | ');

console.log(line(rows[0]));
console.log(widths.map((w) => '-'.repeat(w)).join('-|-'));
for (const row of rows.slice(1)) console.log(line(row));
console.log(`\n${site.pages.length} página(s). CONFERIR = link do formulário sem "embedded=true". Detalhes: npm run check`);
