/**
 * npm run rename -- <slug-atual> <slug-novo> [--redirect]
 *
 * Renomeia a pasta da página (= muda a URL) e roda o build, que atualiza a tabela do README.
 * Com --redirect, a pasta antiga fica com um index.html que leva para a nova URL
 * (o GitHub Pages não tem redirecionamento de servidor e a URL antiga pode estar no D2L).
 */
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  cliArgs,
  displayPath,
  findRedirects,
  PAGE_CONFIG_NAME,
  PAGE_HTML_NAME,
  PROJECT_DIR,
  readRedirectTarget,
  slugProblem,
} from './lib/project.mjs';
import { renderRedirect } from './lib/render.mjs';
import { printIssues } from './lib/report.mjs';
import { generateSite, publicUrl, writeSite } from './lib/site.mjs';

const fail = (message) => {
  console.log(`✘ ${message}`);
  process.exit(1);
};

const { positional, has } = cliArgs();
const [from, to] = positional;
const redirect = has('redirect');
if (!from || !to) fail('Uso: npm run rename -- <slug-atual> <slug-novo> [--redirect]   (ex.: npm run rename -- pg-1 bootcamp-dados --redirect)');

const fromDir = join(PROJECT_DIR, from);
const toDir = join(PROJECT_DIR, to);
if (!existsSync(join(fromDir, PAGE_CONFIG_NAME))) fail(`"${from}" não é uma página (falta ${from}/${PAGE_CONFIG_NAME}). Veja as páginas com: npm run list`);
const problem = slugProblem(to);
if (problem) fail(problem);
if (from === to) fail('O nome novo é igual ao atual.');

if (existsSync(toDir)) {
  // Desfazer um rename anterior: a pasta de destino é só o redirecionamento que aponta para cá.
  if (readRedirectTarget(join(toDir, PAGE_HTML_NAME)) === from) {
    rmSync(toDir, { recursive: true, force: true });
  } else {
    fail(`Já existe a pasta ${displayPath(toDir)}/. Escolha outro nome.`);
  }
}

try {
  renameSync(fromDir, toDir);
} catch (error) {
  if (['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) {
    fail(`O Windows não deixou renomear ${from}/ (${error.code}). Feche o Explorador de Arquivos, o VS Code ou o terminal que estejam nessa pasta e tente de novo.`);
  }
  throw error;
}
console.log(`✔ Pasta renomeada: ${from}/ → ${to}/`);

// Redirecionamentos antigos que apontavam para o slug antigo passam a apontar para o novo.
for (const r of findRedirects()) {
  if (r.target === from) {
    writeFileSync(r.htmlFile, renderRedirect(to), 'utf8');
    console.log(`✔ ${r.slug}/ agora redireciona para ${to}/`);
  }
}

if (redirect) {
  mkdirSync(fromDir, { recursive: true });
  writeFileSync(join(fromDir, PAGE_HTML_NAME), renderRedirect(to), 'utf8');
  console.log(`✔ ${from}/index.html criado: quem abrir a URL antiga vai para a nova.`);
}

const site = await generateSite();
if (!site.ok) {
  printIssues(site.issues, { only: 'erro' });
  fail('A pasta foi renomeada, mas o build parou por causa dos erros acima.');
}
writeSite(site);
console.log('✔ Build feito e tabela do README atualizada.\n');
console.log(`URL antiga: ${publicUrl(site.baseUrl, from)}${redirect ? '  (redireciona)' : '  (vai dar 404)'}`);
console.log(`URL nova:   ${publicUrl(site.baseUrl, to)}`);
if (!redirect) console.log('\n⚠ Sem --redirect: atualize o link no D2L antes de publicar, ou a URL antiga dará 404.');
console.log('\nPara publicar: git add -A . ; git commit -m "chore(exame-especial): renomear página" ; git push');
