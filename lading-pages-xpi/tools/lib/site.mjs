/**
 * Monta o site em memória (config → validação → HTML + arquivos). Usado pelo build, pelo
 * check, pelo preview e pelos testes, para que todos vejam exatamente a mesma página.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { loadConfig, validateConfig } from './config.mjs';
import { CONFIG_FILE, DIST_DIR, SRC_DIR } from './project.mjs';
import { renderPage } from './render.mjs';

/** Versão curta do conteúdo, usada em ?v= para o navegador não ficar com arquivo velho. */
const version = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);

/** Hash aceito pela Content-Security-Policy para liberar o <style> embutido. */
const cspHash = (text) => `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`;

/** Tira comentários e linhas em branco do CSS (o arquivo-fonte continua comentado). */
export function compactCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * @returns {Promise<{ok: boolean, issues: object[], data?: object, html?: string, files?: Map<string, string|Buffer>}>}
 *   `files` mapeia o caminho publicado (index.html, assets/…) para o conteúdo.
 */
export async function generateSite({ configFile = CONFIG_FILE } = {}) {
  const loaded = await loadConfig(configFile);
  if (!loaded.ok) return { ok: false, issues: [loaded.issue] };

  /* As imagens ficam na pasta imagens/ ao lado da config (na raiz do projeto, para a config real). */
  const imagesDir = join(dirname(configFile), 'imagens');
  const { data, issues } = validateConfig(loaded.config, { imagesDir });
  if (!data || issues.some((issue) => issue.level === 'erro')) return { ok: false, issues };

  const css = compactCss(readFileSync(join(SRC_DIR, 'estilos.css'), 'utf8'));
  const files = new Map();

  let script = '';
  if (data.busca.ativa) {
    const js = readFileSync(join(SRC_DIR, 'hub.js'));
    files.set('assets/hub.js', js);
    script = `assets/hub.js?v=${version(js)}`;
  }

  /* Logos: copiados para assets/img/ e referenciados com ?v= (troca de arquivo = navegador baixa de novo). */
  function addImage(file) {
    if (!file) return '';
    const bytes = readFileSync(join(imagesDir, file));
    files.set(`assets/img/${file}`, bytes);
    return `assets/img/${file}?v=${version(bytes)}`;
  }
  data.marca.logoSrc = addImage(data.marca.logo);
  for (const team of data.times) team.logoSrc = addImage(team.logo);

  const html = renderPage({ data, css, cssHash: cspHash(css), script });
  files.set('index.html', html);
  return { ok: true, issues, data, html, files };
}

/** Grava os arquivos em dist/ (apaga a versão anterior antes). */
export function writeDist(files, dir = DIST_DIR) {
  rmSync(dir, { recursive: true, force: true });
  for (const [path, content] of files) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}
