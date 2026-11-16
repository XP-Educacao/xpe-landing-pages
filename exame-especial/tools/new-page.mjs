/**
 * npm run new -- <slug>
 *
 * Cria <slug>/page.config.mjs a partir do modelo e roda o build.
 * O slug vira o final da URL: só minúsculas, números e hífens.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { cliArgs, displayPath, PAGE_CONFIG_NAME, PROJECT_DIR, slugProblem } from './lib/project.mjs';
import { printIssues } from './lib/report.mjs';
import { generateSite, publicUrl, writeSite } from './lib/site.mjs';

const [slug] = cliArgs().positional;
const problem = slugProblem(slug);
if (problem) {
  console.log(`✘ ${problem}`);
  process.exit(1);
}
const dir = join(PROJECT_DIR, slug);
if (existsSync(dir)) {
  console.log(`✘ Já existe a pasta ${displayPath(dir)}/. Escolha outro nome ou use npm run rename.`);
  process.exit(1);
}

mkdirSync(dir);
const configFile = join(dir, PAGE_CONFIG_NAME);
copyFileSync(join(PROJECT_DIR, 'tools', 'templates', PAGE_CONFIG_NAME), configFile);
console.log(`✔ Criado ${displayPath(configFile)}`);

const site = await generateSite();
if (!site.ok) {
  printIssues(site.issues, { only: 'erro' });
  console.log('\n✘ A página foi criada, mas o build parou por causa dos erros acima.');
  process.exit(1);
}
writeSite(site);
console.log(`✔ Gerado ${slug}/index.html (com textos provisórios)\n`);
console.log('Próximos passos:');
console.log(`  1. Abra ${displayPath(configFile)} e preencha bootcamp.name e form.embedUrl`);
console.log('  2. npm run build');
console.log('  3. npm run check:strict');
console.log(`  4. Depois do push, a página fica em ${publicUrl(site.baseUrl, slug)}`);
