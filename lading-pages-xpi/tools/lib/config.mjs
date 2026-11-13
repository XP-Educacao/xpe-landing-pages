/**
 * Leitura e validação de times.config.mjs.
 *
 * As mensagens são para quem não programa: cada problema diz ONDE está, O QUE houve
 * e COMO corrigir. Erros impedem o build (a versão anterior continua no ar); avisos não.
 *
 * Princípio do hub: só TIMES. Campos ou textos que listem ou contem cursos são recusados.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Script } from 'node:vm';

import { courseCountIn, hasHtml, makeInitials, normalizeSearch } from './text.mjs';

export const OPEN_TARGETS = ['_top', '_blank', '_self'];
export const ORDERS = ['alfabetica', 'manual'];
export const TEAM_FIELDS = ['nome', 'home', 'descricao', 'logo', 'sigla', 'palavrasChave'];

const SECTIONS = {
  d2l: ['endereco', 'abrirEm'],
  marca: ['nome', 'logo'],
  textos: ['tituloAba', 'rotulo', 'titulo', 'subtitulo', 'botao', 'emBreve', 'rodape'],
  busca: ['aPartirDe', 'placeholder'],
};
const ROOT_FIELDS = [...Object.keys(SECTIONS), 'ordem', 'times'];

const TEXT_RULES = {
  tituloAba: { required: true, max: 70 },
  rotulo: { max: 60 },
  titulo: { required: true, max: 70 },
  subtitulo: { max: 220 },
  botao: { required: true, max: 28 },
  emBreve: { required: true, max: 20 },
  rodape: { max: 240 },
};

/* Nomes de campo que indicam lista ou contagem de cursos (sem acento, minúsculas). */
const COURSE_FIELD = /curso|trilha|turma|aula|modulo|disciplina|catalogo|treinamento|conteudo/;
const LOGO_FILE = /^[\w.-]+\.(?:svg|png|webp|jpe?g)$/i;
const LOGO_MAX_BYTES = 300 * 1024;
const DEFAULT_SEARCH_FROM = 8;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const plainKey = (key) => normalizeSearch(key).replace(/[^a-z]/g, '');
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

function listNames(names) {
  const shown = names.slice(0, 5).map((name) => `«${name}»`);
  return names.length > 5 ? `${shown.join(', ')} e mais ${names.length - 5}` : shown.join(', ');
}

/**
 * Linha de um erro de sintaxe. O import() do Node não informa a linha, então o arquivo é
 * compilado de novo como função (`export default` vira `return`, sem mudar a contagem de linhas).
 */
function syntaxErrorLine(file) {
  try {
    const source = readFileSync(file, 'utf8').replace(/^(\s*)export\s+default\b/m, '$1return');
    new Script(`(function () {${source}\n})`, { filename: 'config' });
  } catch (error) {
    return String(error?.stack ?? '').match(/^config:(\d+)/m)?.[1] ?? null;
  }
  return null;
}

/** Importa a config. Erros de sintaxe viram uma mensagem com a linha. */
export async function loadConfig(file) {
  if (!existsSync(file)) {
    return {
      ok: false,
      issue: {
        level: 'erro',
        field: '',
        message: 'O arquivo não foi encontrado.',
        fix: 'Restaure o arquivo com: git restore times.config.mjs',
      },
    };
  }
  try {
    const module = await import(`${pathToFileURL(file).href}?v=${Date.now()}`);
    return { ok: true, config: module.default };
  } catch (error) {
    const line = error instanceof SyntaxError ? syntaxErrorLine(file) : null;
    return {
      ok: false,
      issue: {
        level: 'erro',
        field: line ? `linha ${line}` : '',
        message: `O arquivo não pôde ser lido: ${error?.message ?? error}`,
        fix: 'Confira aspas, vírgulas e chaves perto dessa linha. Cada item termina com vírgula e cada texto fica entre aspas.',
      },
    };
  }
}

/**
 * Valida a config e devolve os dados prontos para a página (textos limpos, times ordenados,
 * links montados). `data` é null só quando o arquivo nem tem a forma de uma config.
 */
export function validateConfig(raw, { imagesDir }) {
  const issues = [];
  const error = (field, message, fix) => issues.push({ level: 'erro', field, message, fix });
  const warning = (field, message, fix) => issues.push({ level: 'aviso', field, message, fix });

  function checkKeys(object, allowed, prefix) {
    for (const key of Object.keys(object)) {
      if (allowed.includes(key)) continue;
      const field = prefix ? `${prefix} → ${key}` : key;
      if (COURSE_FIELD.test(plainKey(key))) {
        error(
          field,
          'Este campo lista ou conta cursos. O hub mostra só times: os cursos ficam na home de cada time no D2L, e qualquer lista ou número aqui ficaria desatualizado.',
          `Apague o campo ${key}.`,
        );
      } else {
        error(field, 'Este campo não existe.', `Confira a grafia. Campos aceitos aqui: ${allowed.join(', ')}.`);
      }
    }
  }

  function readText(value, field, { required = false, max } = {}) {
    if (value === undefined || value === null) {
      if (required) error(field, 'Está faltando.', "Preencha com um texto entre aspas, ex.: 'Escolha o seu time'.");
      return '';
    }
    if (typeof value !== 'string') {
      error(field, 'Precisa ser um texto entre aspas.', "Exemplo: 'Escolha o seu time'.");
      return '';
    }
    const text = value.trim().replace(/\s+/g, ' ');
    if (required && !text) error(field, 'Está vazio.', 'Preencha com um texto.');
    if (hasHtml(text)) {
      error(field, 'Tem HTML, que não é aceito (apareceria como texto na página).', 'Remova as marcações <…>.');
    }
    const count = courseCountIn(text);
    if (count) {
      error(
        field,
        `Cita uma quantidade de cursos («${count}»). O hub não conta cursos: o número fica desatualizado assim que um time publica algo novo.`,
        'Reescreva o texto sem o número.',
      );
    }
    if (max && text.length > max) {
      warning(field, `Tem ${text.length} caracteres; o recomendado é até ${max}.`, 'Encurte o texto para não desalinhar o layout.');
    }
    return text;
  }

  /** Imagem da pasta imagens/ (logo da marca ou de um time). Devolve o nome do arquivo ou ''. */
  function readImage(value, field, example) {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value !== 'string' || !LOGO_FILE.test(value.trim())) {
      error(field, 'Precisa ser só o nome de um arquivo .svg, .png, .webp ou .jpg, sem pastas.', `Exemplo: logo: '${example}', com o arquivo dentro de imagens/.`);
      return '';
    }
    const file = value.trim();
    if (!existsSync(join(imagesDir, file))) {
      error(field, `O arquivo imagens/${file} não existe.`, "Coloque o arquivo na pasta imagens/ (confira maiúsculas e extensão) ou deixe logo: ''.");
      return '';
    }
    const size = statSync(join(imagesDir, file)).size;
    if (size > LOGO_MAX_BYTES) {
      warning(field, `O arquivo tem ${Math.round(size / 1024)} KB e deixa o hub lento dentro do D2L.`, 'Use um .svg ou uma imagem com até 300 KB.');
    }
    return file;
  }

  if (!isPlainObject(raw)) {
    error('', 'O arquivo não exporta a configuração.', 'Ele precisa começar com "export default {" e terminar com "};".');
    return { data: null, issues };
  }
  checkKeys(raw, ROOT_FIELDS, '');

  function section(name) {
    const value = raw[name];
    if (isPlainObject(value)) {
      checkKeys(value, SECTIONS[name], name);
      return value;
    }
    error(
      name,
      value === undefined ? 'O bloco está faltando.' : 'Precisa ser um bloco { … }.',
      `Restaure o bloco ${name}: { … } (o modelo está no README).`,
    );
    return {};
  }

  /* ── d2l ─────────────────────────────────────────────────────────────── */
  const d2l = section('d2l');
  let base = '';
  const baseEmpty = d2l.endereco === undefined || d2l.endereco === null || d2l.endereco === '';
  if (!baseEmpty) {
    const field = 'd2l → endereco';
    const fix = "Use só o começo do endereço do D2L, ex.: 'https://suaempresa.brightspace.com'.";
    let url = null;
    try {
      url = typeof d2l.endereco === 'string' ? new URL(d2l.endereco.trim()) : null;
    } catch {
      url = null;
    }
    if (!url) error(field, `Não é um endereço válido: «${d2l.endereco}».`, fix);
    else if (url.protocol !== 'https:') error(field, 'Precisa começar com https://.', fix);
    else if (url.pathname !== '/' || url.search || url.hash) {
      error(field, `Tem um caminho depois do domínio («${url.pathname}${url.search}${url.hash}»).`, `Deixe só '${url.origin}'.`);
    } else base = url.origin;
  }
  const abrirEm = d2l.abrirEm ?? '_top';
  if (!OPEN_TARGETS.includes(abrirEm)) {
    error('d2l → abrirEm', `O valor ${JSON.stringify(abrirEm)} não existe.`, "Use '_top', '_blank' ou '_self'.");
  }

  /* ── marca ───────────────────────────────────────────────────────────── */
  const marca = section('marca');
  const brandName = readText(marca.nome, 'marca → nome', { required: true, max: 40 });
  const logo = readImage(marca.logo, 'marca → logo', 'logo-xp-inc.svg');

  /* ── textos ──────────────────────────────────────────────────────────── */
  const textos = section('textos');
  const texts = {};
  for (const [key, rules] of Object.entries(TEXT_RULES)) {
    texts[key] = readText(textos[key], `textos → ${key}`, rules);
  }

  /* ── busca e ordem ───────────────────────────────────────────────────── */
  const busca = section('busca');
  const searchFrom = busca.aPartirDe ?? DEFAULT_SEARCH_FROM;
  if (!Number.isInteger(searchFrom) || searchFrom < 0) {
    error('busca → aPartirDe', 'Precisa ser um número inteiro (0 ou mais), sem aspas.', `Exemplo: aPartirDe: ${DEFAULT_SEARCH_FROM},`);
  }
  const placeholder = readText(busca.placeholder, 'busca → placeholder', { required: true, max: 40 });

  const ordem = raw.ordem ?? 'alfabetica';
  if (!ORDERS.includes(ordem)) {
    error('ordem', `O valor ${JSON.stringify(ordem)} não existe.`, "Use 'alfabetica' ou 'manual'.");
  }

  /* ── times ───────────────────────────────────────────────────────────── */
  const teams = [];
  const emptyHome = [];
  const waitingBase = [];
  const seenNames = new Map();
  const seenUrls = new Map();

  function resolveHome(value, field) {
    const fix = "Use o número da home (ex.: home: 12345,) ou o endereço completo, começando com https://.";
    if (value === undefined || value === null || value === '') return { url: null, pending: 'vazio' };
    let text;
    if (typeof value === 'number') {
      if (!Number.isInteger(value) || value <= 0) {
        error(field, `«${value}» não é um número de home válido.`, fix);
        return { url: null };
      }
      text = String(value);
    } else if (typeof value === 'string') {
      text = value.trim();
    } else {
      error(field, 'Precisa ser um número ou um endereço entre aspas.', fix);
      return { url: null };
    }

    if (/^\d+$/.test(text)) return base ? { url: `${base}/d2l/home/${text}` } : { url: null, pending: 'sem-endereco' };
    if (text.startsWith('/')) {
      if (!text.startsWith('/d2l/')) {
        error(field, `O caminho «${text}» não é do D2L (deveria começar com /d2l/).`, fix);
        return { url: null };
      }
      return base ? { url: `${base}${text}` } : { url: null, pending: 'sem-endereco' };
    }

    let url;
    try {
      url = new URL(text);
    } catch {
      error(field, `Não é um número nem um endereço válido: «${text}».`, fix);
      return { url: null };
    }
    if (url.protocol !== 'https:') {
      error(field, 'O endereço precisa começar com https:// (o D2L bloqueia http://).', 'Troque http:// por https://.');
      return { url: null };
    }
    if (url.username || url.password) {
      error(field, 'O endereço tem usuário ou senha embutidos.', 'Remova a parte antes do @. Nunca coloque credenciais aqui: tudo é público.');
      return { url: null };
    }
    if (base && url.origin !== base) {
      warning(
        field,
        `Aponta para ${url.host}, fora do D2L configurado em d2l → endereco (${new URL(base).host}).`,
        'Confira se o endereço está certo. Se for de propósito, ignore este aviso.',
      );
    }
    return { url: url.href };
  }

  if (!Array.isArray(raw.times)) {
    error('times', raw.times === undefined ? 'A lista de times está faltando.' : 'Precisa ser uma lista [ … ].', 'Restaure a lista: times: [ { nome: …, home: … }, ],');
  } else if (raw.times.length === 0) {
    error('times', 'A lista está vazia.', 'Inclua pelo menos um time.');
  } else {
    raw.times.forEach((team, index) => {
      const label =
        isPlainObject(team) && typeof team.nome === 'string' && team.nome.trim()
          ? `time nº ${index + 1} («${team.nome.trim()}»)`
          : `time nº ${index + 1}`;
      if (!isPlainObject(team)) {
        error(label, 'Não é um bloco { … }.', "Cada time fica entre chaves: { nome: 'Tecnologia', home: 12345 },");
        return;
      }
      checkKeys(team, TEAM_FIELDS, label);

      const name = readText(team.nome, `${label} → nome`, { required: true, max: 60 });
      const description = readText(team.descricao, `${label} → descricao`, { max: 120 });
      const teamLogo = readImage(team.logo, `${label} → logo`, 'logo-academy.svg');

      let initials = makeInitials(name);
      if (team.sigla !== undefined && team.sigla !== null && team.sigla !== '') {
        if (typeof team.sigla !== 'string' || !/^[\p{L}\p{N}]{1,3}$/u.test(team.sigla.trim())) {
          error(`${label} → sigla`, 'Precisa ter de 1 a 3 letras ou números, sem espaços.', "Exemplo: sigla: 'TI',");
        } else {
          initials = team.sigla.trim().toLocaleUpperCase('pt-BR');
        }
      }

      let keywords = [];
      if (team.palavrasChave !== undefined && team.palavrasChave !== null) {
        if (!Array.isArray(team.palavrasChave) || team.palavrasChave.some((word) => typeof word !== 'string')) {
          error(`${label} → palavrasChave`, 'Precisa ser uma lista de textos.', "Exemplo: palavrasChave: ['TI', 'tecnologia'],");
        } else {
          keywords = team.palavrasChave.map((word) => word.trim()).filter(Boolean);
        }
      }

      const home = resolveHome(team.home, `${label} → home`);
      if (home.pending === 'vazio') emptyHome.push(name || label);
      if (home.pending === 'sem-endereco') waitingBase.push(name || label);

      if (name) {
        const key = normalizeSearch(name);
        if (seenNames.has(key)) {
          error(`${label} → nome`, `Repete o nome do time nº ${seenNames.get(key)}.`, 'Cada time aparece uma vez só. Apague um dos blocos ou diferencie os nomes.');
        } else seenNames.set(key, index + 1);
      }
      if (home.url) {
        if (seenUrls.has(home.url)) {
          warning(`${label} → home`, `Leva para a mesma home de «${seenUrls.get(home.url)}».`, 'Confira o número da home.');
        } else seenUrls.set(home.url, name);
      }

      teams.push({
        nome: name,
        descricao: description,
        logo: teamLogo,
        sigla: initials,
        url: home.url,
        busca: normalizeSearch([name, initials, description, ...keywords].join(' ')),
      });
    });
  }

  if (emptyHome.length > 0) {
    const many = emptyHome.length > 1;
    warning(
      'times',
      `${emptyHome.length} ${many ? 'times estão' : 'time está'} sem home e ${many ? 'aparecem' : 'aparece'} como “${texts.emBreve || 'Em breve'}”: ${listNames(emptyHome)}.`,
      'Preencha o campo home com o número da home do time no D2L.',
    );
  }
  /* Endereço inválido já tem o próprio erro; o aviso abaixo é só para o campo vazio. */
  if (waitingBase.length > 0 && baseEmpty) {
    const many = waitingBase.length > 1;
    warning(
      'd2l → endereco',
      `Está vazio, então ${waitingBase.length} ${many ? 'times' : 'time'} com número de home ${many ? 'aparecem' : 'aparece'} como “${texts.emBreve || 'Em breve'}”: ${listNames(waitingBase)}.`,
      "Preencha com o endereço do D2L, ex.: 'https://suaempresa.brightspace.com'.",
    );
  }

  if (ordem === 'alfabetica') teams.sort((a, b) => collator.compare(a.nome, b.nome));

  const searchActive = Number.isInteger(searchFrom) && searchFrom > 0 && teams.length >= searchFrom;
  return {
    data: {
      d2l: { endereco: base, abrirEm },
      marca: { nome: brandName, logo },
      textos: texts,
      busca: { aPartirDe: searchFrom, placeholder, ativa: searchActive },
      ordem,
      times: teams,
    },
    issues,
  };
}
