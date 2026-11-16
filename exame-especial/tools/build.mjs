/**
 * npm run build
 *
 * Gera, a partir das configs: <slug>/index.html de cada página, assets/ (CSS, JS e fontes
 * compartilhados), a tabela de páginas do README e a pasta dist/ (o que o deploy publica).
 * Se houver ERRO em alguma config, nada é gravado.
 */
import { countIssues, printIssues, uniqueIssues } from './lib/report.mjs';
import { displayPath } from './lib/project.mjs';
import { generateSite, writeSite } from './lib/site.mjs';

const STATUS = { ok: '✔ ok', pendente: '⚠ pendente', conferir: '⚠ conferir' };

const site = await generateSite();
const issues = uniqueIssues(site.issues);

if (!site.ok) {
  printIssues(issues, { only: 'erro' });
  console.log('\n✘ Build interrompido: corrija os erros acima e rode de novo. Nenhum arquivo foi alterado.');
  process.exit(1);
}

const { changed, removed } = writeSite(site);

console.log(`✔ assets/${site.assets.css.name}  (v=${site.assets.css.version})`);
console.log(`✔ assets/${site.assets.js.name}   (v=${site.assets.js.version})`);
if (site.assets.fonts.length > 0) console.log(`✔ assets/ fontes: ${site.assets.fonts.map((f) => f.name).join(', ')}`);
for (const page of site.pages) {
  console.log(
    `✔ ${page.slug}/index.html  ·  ${page.config.bootcamp.name}  ·  formulário ${STATUS[page.status.form]}  ·  suporte ${STATUS[page.status.support]}`,
  );
}
for (const r of site.redirects) console.log(`↪ ${r.slug}/ redireciona para ${r.target}/`);
console.log(
  `✔ dist/ pronta para publicação (${site.pages.length} página(s), ${site.redirects.length} redirecionamento(s)).`,
);
console.log(
  changed.length === 0
    ? '  Nenhum arquivo mudou.'
    : `  Atualizados: ${changed.map((o) => displayPath(o.file)).join(', ')}`,
);
if (removed.length > 0) console.log(`  Removidas (fontes sem uso): ${removed.map(displayPath).join(', ')}`);

const { warnings } = countIssues(issues);
if (warnings > 0) console.log(`\n⚠ ${warnings} aviso(s)/pendência(s). Para ver: npm run check`);
