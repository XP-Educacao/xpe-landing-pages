/**
 * npm run build — gera a pasta dist/, que é a publicada no GitHub Pages.
 *
 * Se a config tiver erro, nada é gerado (e, no GitHub, a versão anterior continua no ar).
 * Outra config, para teste:  node tools/build.mjs --config tools/fixtures/demo.config.mjs
 */
import { configArg, DIST_DIR, displayPath } from './lib/project.mjs';
import { printIssues, summary } from './lib/report.mjs';
import { generateSite, writeDist } from './lib/site.mjs';

const configFile = configArg();
const site = await generateSite({ configFile });
const { errors } = printIssues(site.issues, displayPath(configFile));

if (!site.ok) {
  console.log(`\n✘ Build cancelado: ${errors} erro(s) em ${displayPath(configFile)}. Nada foi gerado.`);
  process.exit(1);
}

writeDist(site.files);
console.log(`\n✔ ${displayPath(DIST_DIR)}/ pronta · ${summary(site.data)}`);
