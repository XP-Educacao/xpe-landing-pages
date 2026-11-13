/**
 * Caminhos do projeto. Tudo é calculado a partir desta pasta, então os comandos funcionam
 * de qualquer lugar e a pasta pode ser renomeada sem mexer no código.
 */
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PROJECT_NAME = basename(PROJECT_DIR);
export const CONFIG_FILE = join(PROJECT_DIR, 'times.config.mjs');
export const SRC_DIR = join(PROJECT_DIR, 'src');
export const IMAGES_DIR = join(PROJECT_DIR, 'imagens');
export const DIST_DIR = join(PROJECT_DIR, 'dist');

/** Caminho curto para as mensagens (relativo à pasta do projeto, com barras normais). */
export function displayPath(file) {
  const rel = relative(PROJECT_DIR, file);
  return (rel && !rel.startsWith('..') ? rel : file).replaceAll('\\', '/');
}

/** `--config <arquivo>` troca a config (testes e demonstração). Padrão: times.config.mjs. */
export function configArg(argv = process.argv.slice(2)) {
  const index = argv.indexOf('--config');
  if (index === -1) return CONFIG_FILE;
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    console.log('✘ Informe o arquivo depois de --config. Exemplo: --config tools/fixtures/demo.config.mjs');
    process.exit(1);
  }
  return resolve(process.cwd(), value);
}
