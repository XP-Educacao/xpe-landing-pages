/**
 * Carrega, mescla e valida as configurações.
 *
 *   config final da página = global  ←  overrides  ←  { bootcamp, form, support }  (+ seleção de polos)
 *
 * Mescla profunda: blocos { } se combinam campo a campo; listas [ ] são SUBSTITUÍDAS inteiras.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { deriveDate } from './dates.mjs';
import { GLOBAL_CONFIG_FILE, SRC_DIR } from './project.mjs';
import { isPlainObject, SCHEMA, validateConfig } from './schema.mjs';
import { closest } from './text.mjs';

/** Ilustrações em src/icons/ que não servem como ícone de dica. */
const ILLUSTRATIONS = new Set(['calendario']);

export function availableIcons() {
  return readdirSync(join(SRC_DIR, 'icons'))
    .filter((file) => file.endsWith('.svg'))
    .map((file) => file.slice(0, -4))
    .filter((name) => !ILLUSTRATIONS.has(name))
    .sort();
}

/** Campos que a página pode definir fora de `overrides`. */
const PAGE_SHORTCUTS = ['bootcamp', 'form', 'support'];
const PAGE_KEYS = [...PAGE_SHORTCUTS, 'polos', 'overrides'];

const clone = (value) => (value === undefined ? undefined : structuredClone(value));

/** Mescla profunda: objetos mesclam, listas e valores simples substituem. */
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return clone(override);
  const out = clone(base);
  for (const [key, value] of Object.entries(override)) {
    out[key] = isPlainObject(value) && isPlainObject(out[key]) ? deepMerge(out[key], value) : clone(value);
  }
  return out;
}

/** Caminhos das folhas de um objeto ("form.embedUrl", "polos"). Listas contam como folha. */
function leafPaths(value, base = '') {
  if (!isPlainObject(value)) return base ? [base] : [];
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, base ? `${base}.${key}` : key));
}

const segments = (path) => path.split(/[.[\]]+/).filter(Boolean);
const isPrefix = (a, b) => a.every((part, index) => b[index] === part);

/** Importa um .mjs e devolve { value } ou { problem } com mensagem amigável. */
export async function loadModule(file) {
  try {
    const module = await import(`${pathToFileURL(file).href}?v=${Date.now()}`);
    if (!('default' in module)) {
      return { problem: { message: 'não tem "export default { … }".', fix: 'A primeira linha de código precisa ser: export default {' } };
    }
    return { value: module.default };
  } catch (error) {
    // O import não informa a linha do erro; `node --check` informa ("arquivo:LINHA" na 1ª linha).
    const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    const line = (checked.stderr ?? '').split('\n')[0].match(/:(\d+)\s*$/)?.[1];
    const where = line ? ` (linha ${line})` : '';
    return {
      problem: {
        message: `tem um erro de digitação${where}: ${error.message}`,
        fix: 'Confira a vírgula no fim da linha anterior, as aspas (abre e fecha) e as chaves { }.',
      },
    };
  }
}

export async function loadGlobal() {
  const file = GLOBAL_CONFIG_FILE;
  const loaded = await loadModule(file);
  if (loaded.problem) return { config: null, issues: [{ level: 'erro', file, path: '', ...loaded.problem }] };
  const issues = validateConfig(loaded.value, { mode: 'global', icons: availableIcons() }).map((issue) => ({ ...issue, file }));
  return { config: loaded.value, issues };
}

/**
 * bootcamp/form/support da página, como serão mesclados.
 * support.url vazio ('') na página = herda o link da config global.
 */
function effectiveShortcuts(raw) {
  const out = {};
  for (const key of PAGE_SHORTCUTS) {
    if (!isPlainObject(raw[key])) continue;
    out[key] = clone(raw[key]);
  }
  if (out.support?.url === '') delete out.support.url;
  if (out.support && Object.keys(out.support).length === 0) delete out.support;
  return out;
}

/** Confere o formato do page.config.mjs antes de mesclar. */
function checkPageShape(raw, globalConfig) {
  const issues = [];
  const add = (path, message, fix) => issues.push({ level: 'erro', path, message, fix });
  if (!isPlainObject(raw)) {
    add('', 'deveria exportar um bloco { … }.', 'Use o modelo: npm run new -- <slug> cria um arquivo pronto.');
    return issues;
  }
  for (const key of Object.keys(raw)) {
    if (PAGE_KEYS.includes(key)) continue;
    if (key in SCHEMA.fields) {
      add(key, 'precisa ficar dentro de overrides.', `Escreva: overrides: { ${key}: { … } },`);
    } else {
      const guess = closest(key, PAGE_KEYS);
      add(key, 'não é um campo conhecido.', guess ? `Você quis dizer "${guess}"?` : `Campos aceitos: ${PAGE_KEYS.join(', ')}.`);
    }
  }
  for (const key of [...PAGE_SHORTCUTS, 'overrides']) {
    if (raw[key] !== undefined && !isPlainObject(raw[key])) add(key, 'deveria ser um bloco { … }.', 'Confira as chaves { }.');
  }
  if (!isPlainObject(raw.bootcamp) || raw.bootcamp.name === undefined) {
    add('bootcamp.name', 'é obrigatório em toda página.', "Escreva: bootcamp: { name: 'Nome do Bootcamp' },");
  }
  if (!isPlainObject(raw.form) || raw.form.embedUrl === undefined) {
    add('form.embedUrl', 'é obrigatório em toda página (pode ficar vazio enquanto o formulário não existe).', "Escreva: form: { embedUrl: '' },");
  }
  if (raw.polos !== undefined) {
    const catalog = (raw.overrides?.polos ?? globalConfig.polos ?? []).map((p) => p?.id);
    if (!Array.isArray(raw.polos) || raw.polos.some((id) => typeof id !== 'string')) {
      add('polos', 'deveria ser uma lista de ids entre aspas.', "Ex.: polos: ['sao-paulo', 'curitiba'],");
    } else if (raw.polos.length === 0) {
      add('polos', 'está vazia.', 'Apague a linha para mostrar todos os polos, ou liste ao menos um id.');
    } else {
      const seen = new Set();
      for (const id of raw.polos) {
        if (seen.has(id)) add('polos', `repete o id "${id}".`, 'Liste cada polo uma vez só.');
        seen.add(id);
        if (!catalog.includes(id)) {
          const guess = closest(id, catalog);
          add('polos', `tem o id "${id}", que não está no catálogo.`, guess ? `Você quis dizer "${guess}"?` : `Ids disponíveis: ${catalog.join(', ')}.`);
        }
      }
    }
  }
  const fromOverrides = new Set(leafPaths(isPlainObject(raw.overrides) ? raw.overrides : {}));
  const shortcuts = effectiveShortcuts(raw);
  for (const key of PAGE_SHORTCUTS) {
    if (!isPlainObject(shortcuts[key])) continue;
    for (const path of leafPaths(shortcuts[key], key)) {
      if (fromOverrides.has(path)) add(`overrides.${path}`, `repete ${path}, que já está definido fora de overrides.`, 'Deixe o valor em um lugar só.');
    }
  }
  return issues;
}

/**
 * Monta a config final de uma página e valida.
 * Devolve { config, issues } — config é null quando há erros de formato.
 */
export async function resolvePage(page, globalConfig) {
  const file = page.configFile;
  const loaded = await loadModule(file);
  if (loaded.problem) return { config: null, issues: [{ level: 'erro', file, path: '', ...loaded.problem }] };
  const raw = loaded.value;

  const shapeIssues = checkPageShape(raw, globalConfig).map((issue) => ({ ...issue, file }));
  if (shapeIssues.length > 0) return { config: null, issues: shapeIssues };

  const shortcuts = effectiveShortcuts(raw);
  const config = deepMerge(deepMerge(globalConfig, raw.overrides ?? {}), shortcuts);
  if (raw.polos) config.polos = raw.polos.map((id) => config.polos.find((polo) => polo.id === id));

  const pagePaths = [
    ...leafPaths(raw.overrides ?? {}),
    ...Object.entries(shortcuts).flatMap(([key, value]) => leafPaths(value, key)),
    ...(raw.polos ? ['polos'] : []),
  ].map(segments);
  const ownerOf = (path) => {
    const target = segments(path);
    return pagePaths.some((p) => isPrefix(p, target) || isPrefix(target, p)) ? file : GLOBAL_CONFIG_FILE;
  };

  const issues = validateConfig(config, { mode: 'page', icons: availableIcons() }).map((issue) => ({
    ...issue,
    file: ownerOf(issue.path),
  }));
  return { config, issues };
}

/** Valores {calculados} disponíveis nos textos. */
export function computeTokens(config) {
  const date = deriveDate(config.exam.date);
  const s = config.scores;
  const percent = (value) => `${Math.floor((value * 100) / s.max)}%`;
  return {
    dateShort: date.dateShort,
    dateLong: date.dateLong,
    weekday: date.weekday,
    bootcamp: config.bootcamp.name,
    scoreMax: s.max,
    eligibleMin: s.eligibleMin,
    eligibleMax: s.eligibleMax,
    eligibleMinPct: percent(s.eligibleMin),
    eligibleMaxPct: percent(s.eligibleMax),
    approvalMin: s.approvalMin,
    recordedIfApproved: s.recordedIfApproved,
    stepsCount: config.steps.items.length,
    polosCount: config.polos.length,
  };
}
