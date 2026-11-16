/**
 * Esquema das configurações e validação própria (sem bibliotecas).
 *
 * Cada campo diz o tipo e as regras. A validação devolve uma lista de problemas
 * { level: 'erro' | 'aviso', path, message, fix }. Erros impedem o build; avisos não
 * (a não ser em `npm run check:strict`).
 */
import { FORM_EMBED_URL_PATTERN, SUPPORT_URL_PATTERN } from '../../src/scripts/rules.mjs';
import { parseIsoDate } from './dates.mjs';
import { closest, hasTokens, markupProblem, TOKEN_NAMES, unknownTokens } from './text.mjs';

const field =
  (kind) =>
  (options = {}) => ({ kind, ...options });
const text = field('text'); // aceita **negrito** e {valores}
const plain = field('plain'); // texto simples (atributos, título da aba, nomes)
const int = field('int');
const isoDate = field('date');
const formUrl = field('formUrl');
const supportUrl = field('supportUrl');
const baseUrl = field('baseUrl');
const slugId = field('id');
const uf = field('uf');
const icon = field('icon');
const obj = (fields, options = {}) => ({ kind: 'object', fields, ...options });
const list = (item, options = {}) => ({ kind: 'list', item, ...options });
const titled = (extra = {}) => obj({ title: text(), text: text(), ...extra });

/** scope: 'page' = só pode ser definido em page.config.mjs (obrigatório lá). */
export const SCHEMA = obj({
  site: obj({ publicBaseUrl: baseUrl() }),
  page: obj({ title: plain() }),
  exam: obj({ date: isoDate() }),
  scores: obj({
    max: int(),
    eligibleMin: int(),
    eligibleMax: int(),
    approvalMin: int(),
    recordedIfApproved: int(),
  }),
  bootcamp: obj({
    name: plain({ scope: 'page', noTokens: true }),
    label: text(),
    hint: text({ allowEmpty: true }),
  }),
  form: obj({
    embedUrl: formUrl({ scope: 'page' }),
    iframeTitle: plain(),
    placeholderTitle: text(),
    placeholderText: text(),
    placeholderCode: text(),
  }),
  support: obj({ url: supportUrl(), pendingTitle: plain() }),
  polos: list(obj({ id: slugId(), city: plain(), state: uf(), address: plain() }), {
    min: 1,
    uniqueBy: 'id',
  }),
  hero: obj({
    eyebrow: text(),
    title: text(),
    text: text(),
    button: text(),
    illustrationLabel: plain(),
  }),
  dateSection: obj({
    tag: text(),
    title: text(),
    text: text(),
    dateLabel: text(),
    dateNote: text(),
    formatLabel: text(),
    formatValue: text(),
    formatText: text(),
    notice: text(),
    supportTitle: text(),
    supportText: text(),
    supportButton: text(),
  }),
  steps: obj({ title: text(), items: list(obj({ title: text(), text: text() }), { min: 1 }) }),
  poloSection: obj({
    tag: text(),
    title: text(),
    text: text(),
    panelTitle: text(),
    panelIntro: text(),
    formTitle: text(),
    formText: text(),
    note: text(),
  }),
  rules: titled({ cards: list(obj({ title: text(), text: text() }), { min: 1 }) }),
  tips: titled({
    items: list(obj({ icon: icon(), title: text(), text: text() }), { min: 1 }),
    footnote: text({ allowEmpty: true }),
  }),
  faq: obj({ title: text(), items: list(obj({ question: text(), answer: text() }), { min: 1 }) }),
  footer: obj({ text: text() }),
});

const SLUG_LIKE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function describe(value) {
  if (value === undefined) return 'vazio (undefined)';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'uma lista [ … ]';
  if (typeof value === 'string') return `o texto "${value}"`;
  if (typeof value === 'object') return 'um bloco { … }';
  return `o valor ${JSON.stringify(value)}`;
}

const joinPath = (base, key) =>
  typeof key === 'number' ? `${base}[${key}]` : base ? `${base}.${key}` : key;

/** Validação de URL do Google Forms (mesma regra do navegador + checagens extras do build). */
export function checkFormUrl(value) {
  const out = [];
  if (value === '') {
    out.push({
      level: 'aviso',
      message: 'está pendente: sem link, a página mostra o espaço reservado no lugar do formulário.',
      fix: 'No Google Forms: Enviar → ícone <> → copie só a URL de src="…" (termina com /viewform?embedded=true).',
    });
    return out;
  }
  if (/\s/.test(value)) {
    out.push({ level: 'erro', message: 'tem espaços ou quebras de linha.', fix: 'Apague os espaços antes, depois e dentro do link.' });
    return out;
  }
  if (!FORM_EMBED_URL_PATTERN.test(value)) {
    const short = /forms\.gle/i.test(value);
    out.push({
      level: 'erro',
      message: short
        ? 'é um link encurtado (forms.gle), que não pode ser incorporado.'
        : `precisa começar com https://docs.google.com/forms/ (veio "${value}").`,
      fix: 'No Google Forms: Enviar → ícone <> (Incorporar HTML) → copie só a URL de src="…".',
    });
    return out;
  }
  if (/\/edit(?:[/?#]|$)/i.test(value)) {
    out.push({
      level: 'erro',
      message: 'é o link de EDIÇÃO do formulário; os alunos veriam uma tela de acesso negado.',
      fix: 'Use o link de incorporação: Enviar → ícone <> → URL de src="…" (termina com /viewform?embedded=true).',
    });
    return out;
  }
  if (!/[?&]embedded=true(?:&|#|$)/i.test(value)) {
    out.push({
      level: 'aviso',
      message: 'não tem "embedded=true"; o formulário pode não aparecer ou aparecer com a moldura do Google.',
      fix: 'Copie a URL do src do código de incorporação (Enviar → <>), que termina com /viewform?embedded=true.',
    });
  }
  return out;
}

/** Validação do link de suporte (mesma regra do navegador + URL bem formada). */
export function checkSupportUrl(value) {
  if (value === '') {
    return [
      {
        level: 'aviso',
        message: 'está pendente: sem link, o botão "Falar com o Suporte" fica desabilitado.',
        fix: 'Preencha support.url com o link oficial do suporte, começando com https://.',
      },
    ];
  }
  if (/\s/.test(value)) {
    return [{ level: 'erro', message: 'tem espaços ou quebras de linha.', fix: 'Apague os espaços do link.' }];
  }
  if (!SUPPORT_URL_PATTERN.test(value)) {
    return [
      {
        level: 'erro',
        message: `precisa começar com https:// (veio "${value}"); sem isso o botão fica desabilitado.`,
        fix: 'Use o endereço completo e seguro, ex.: https://suporte.exemplo.com.br/.',
      },
    ];
  }
  try {
    new URL(value);
  } catch {
    return [{ level: 'erro', message: `não é um endereço válido ("${value}").`, fix: 'Copie o link direto da barra do navegador.' }];
  }
  return [];
}

/**
 * Valida um objeto de configuração contra o esquema.
 * mode 'global' = config/global.config.mjs (campos de página não entram);
 * mode 'page'   = config final de uma página (global + page.config.mjs).
 */
export function validateConfig(config, { mode, icons }) {
  const issues = [];
  const add = (level, path, message, fix) => issues.push({ level, path, message, fix });

  const walkString = (value, spec, path) => {
    if (typeof value !== 'string') {
      add('erro', path, `deveria ser um texto entre aspas, mas é ${describe(value)}.`, "Escreva entre aspas simples: 'assim'.");
      return;
    }
    if (value.trim() === '' && !spec.allowEmpty) {
      add('erro', path, 'está vazio.', 'Preencha o texto (ou confira se colou no campo certo).');
      return;
    }
    const markup = markupProblem(value, { allowBold: spec.kind === 'text' });
    if (markup) add('erro', path, markup.message, markup.fix);
    if (spec.noTokens && hasTokens(value)) {
      add('erro', path, 'não pode usar valores entre chaves { }.', 'Escreva o texto final, sem { }.');
      return;
    }
    for (const name of unknownTokens(value)) {
      const guess = closest(name, TOKEN_NAMES);
      add(
        'erro',
        path,
        `usa {${name}}, que não existe.`,
        guess ? `Você quis dizer {${guess}}?` : `Valores disponíveis: ${TOKEN_NAMES.map((t) => `{${t}}`).join(', ')}.`,
      );
    }
    if (mode === 'page' && /\[INSERIR/i.test(value)) {
      add('aviso', path, `está pendente: ainda tem o texto provisório "${value}".`, 'Troque pelo texto final antes de divulgar a página.');
    }
  };

  const walk = (value, spec, path) => {
    switch (spec.kind) {
      case 'object': {
        if (!isPlainObject(value)) {
          add('erro', path, `deveria ser um bloco { … }, mas é ${describe(value)}.`, 'Confira as chaves { } e as vírgulas.');
          return;
        }
        const known = Object.keys(spec.fields);
        for (const key of Object.keys(value)) {
          if (!known.includes(key)) {
            const guess = closest(key, known);
            add(
              'erro',
              joinPath(path, key),
              'não é um campo conhecido.',
              guess ? `Você quis dizer "${guess}"?` : `Campos aceitos aqui: ${known.join(', ')}.`,
            );
          }
        }
        for (const [key, child] of Object.entries(spec.fields)) {
          const childPath = joinPath(path, key);
          if (child.scope === 'page' && mode === 'global') {
            if (key in value) {
              add('erro', childPath, 'é definido em cada página, não na config global.', 'Apague daqui e preencha no page.config.mjs de cada página.');
            }
            continue;
          }
          if (value[key] === undefined) {
            add('erro', childPath, 'está faltando.', 'Inclua o campo (veja o modelo em config/global.config.mjs).');
            continue;
          }
          walk(value[key], child, childPath);
        }
        return;
      }
      case 'list': {
        if (!Array.isArray(value)) {
          add('erro', path, `deveria ser uma lista [ … ], mas é ${describe(value)}.`, 'Use colchetes [ ] com itens separados por vírgula.');
          return;
        }
        if (value.length < (spec.min ?? 0)) {
          add('erro', path, 'é uma lista sem nenhum item.', 'Inclua ao menos um item.');
        }
        value.forEach((item, index) => walk(item, spec.item, joinPath(path, index)));
        if (spec.uniqueBy) {
          const seen = new Set();
          value.forEach((item, index) => {
            const key = item?.[spec.uniqueBy];
            if (seen.has(key)) {
              add('erro', joinPath(joinPath(path, index), spec.uniqueBy), `repete "${key}".`, 'Cada item precisa de um id diferente.');
            }
            seen.add(key);
          });
        }
        return;
      }
      case 'text':
      case 'plain':
        walkString(value, spec, path);
        return;
      case 'int':
        if (!Number.isInteger(value) || value < 0) {
          add('erro', path, `deveria ser um número inteiro, mas é ${describe(value)}.`, 'Escreva só o número, sem aspas. Ex.: 350');
        }
        return;
      case 'date':
        if (!parseIsoDate(value)) {
          add('erro', path, `não é uma data válida (${describe(value)}).`, "Use ANO-MÊS-DIA entre aspas. Ex.: '2026-12-16'");
        }
        return;
      case 'formUrl':
      case 'supportUrl': {
        if (typeof value !== 'string') {
          add('erro', path, `deveria ser um texto entre aspas, mas é ${describe(value)}.`, "Escreva o link entre aspas simples. Vazio = ''.");
          return;
        }
        const results = spec.kind === 'formUrl' ? checkFormUrl(value) : checkSupportUrl(value);
        for (const r of results) {
          if (r.level === 'aviso' && mode !== 'page') continue;
          add(r.level, path, r.message, r.fix);
        }
        return;
      }
      case 'baseUrl':
        if (typeof value !== 'string' || !/^https:\/\/[^\s]+\/$/.test(value)) {
          add('erro', path, `deveria ser um endereço https:// terminado em / (veio ${describe(value)}).`, "Ex.: 'https://xp-educacao.github.io/xpe-landing-pages/'");
        }
        return;
      case 'id':
        if (typeof value !== 'string' || !SLUG_LIKE.test(value)) {
          add('erro', path, `deveria usar só minúsculas, números e hífens (veio ${describe(value)}).`, "Ex.: 'porto-alegre'");
        }
        return;
      case 'uf':
        if (typeof value !== 'string' || !/^[A-Z]{2}$/.test(value)) {
          add('erro', path, `deveria ser a UF com 2 letras maiúsculas (veio ${describe(value)}).`, "Ex.: 'RS'");
        }
        return;
      case 'icon':
        if (!icons.includes(value)) {
          add('erro', path, `usa o ícone ${describe(value)}, que não existe.`, `Ícones disponíveis: ${icons.map((i) => `'${i}'`).join(', ')}.`);
        }
        return;
      default:
        throw new Error(`Tipo de campo desconhecido no esquema: ${spec.kind}`);
    }
  };

  walk(config, SCHEMA, '');

  const s = config?.scores;
  const scoresOk =
    isPlainObject(s) && ['max', 'eligibleMin', 'eligibleMax', 'approvalMin', 'recordedIfApproved'].every((k) => Number.isInteger(s[k]));
  if (scoresOk) {
    const rules = [
      [s.max > 0, 'scores.max', 'precisa ser maior que zero.'],
      [s.eligibleMin <= s.eligibleMax, 'scores.eligibleMin', `vale ${s.eligibleMin}, mas não pode passar de scores.eligibleMax (${s.eligibleMax}).`],
      [s.eligibleMax < s.approvalMin, 'scores.eligibleMax', `vale ${s.eligibleMax}, mas precisa ser menor que scores.approvalMin (${s.approvalMin}).`],
      [s.approvalMin <= s.max, 'scores.approvalMin', `vale ${s.approvalMin}, mas não pode passar de scores.max (${s.max}).`],
      [s.recordedIfApproved <= s.max, 'scores.recordedIfApproved', `vale ${s.recordedIfApproved}, mas não pode passar de scores.max (${s.max}).`],
    ];
    for (const [ok, path, message] of rules) {
      if (!ok) add('erro', path, message, 'Confira as notas do regulamento.');
    }
  }
  return issues;
}
