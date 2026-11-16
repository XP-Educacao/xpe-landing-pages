/**
 * Textos vindos da config: escape de HTML, mini-markup **negrito** e valores {calculados}.
 * Nada da config entra cru no HTML: tudo passa por escapeHtml/escapeAttr.
 */

/** Valores que os textos podem usar entre chaves. Ver o topo de config/global.config.mjs. */
export const TOKEN_NAMES = [
  'dateShort',
  'dateLong',
  'weekday',
  'bootcamp',
  'scoreMax',
  'eligibleMin',
  'eligibleMax',
  'eligibleMinPct',
  'eligibleMaxPct',
  'approvalMin',
  'recordedIfApproved',
  'stepsCount',
  'polosCount',
];

const TOKEN_PATTERN = /\{([A-Za-z]+)\}/g;
const BOLD_PATTERN = /\*\*(.+?)\*\*/g;
const HTML_TAG_PATTERN = /<\/?[A-Za-z][^>]*>/;

export function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', '&quot;');
}

/** Lista os {valores} usados no texto que não existem. */
export function unknownTokens(text) {
  return [...text.matchAll(TOKEN_PATTERN)].map((m) => m[1]).filter((name) => !TOKEN_NAMES.includes(name));
}

export function hasTokens(text) {
  return [...text.matchAll(TOKEN_PATTERN)].length > 0;
}

/** Problemas de marcação num texto (null = ok). `allowBold` = campo aceita **negrito**. */
export function markupProblem(text, { allowBold }) {
  if (HTML_TAG_PATTERN.test(text)) {
    return {
      message: `tem HTML (${text.match(HTML_TAG_PATTERN)[0]}), que não é aceito e apareceria como texto na página.`,
      fix: allowBold ? 'Remova o HTML. Para negrito, use **assim**.' : 'Remova o HTML. Este campo é texto simples.',
    };
  }
  const markers = text.split('**').length - 1;
  if (!allowBold && markers > 0) {
    return { message: 'usa **negrito**, mas este campo é texto simples.', fix: 'Remova os asteriscos (**).' };
  }
  if (markers % 2 !== 0) {
    return {
      message: 'tem um ** de negrito sem par (abre e não fecha).',
      fix: 'Confira se cada trecho em negrito está entre dois pares de asteriscos: **assim**.',
    };
  }
  return null;
}

function applyTokens(text, tokens) {
  return text.replace(TOKEN_PATTERN, (match, name) => (name in tokens ? String(tokens[name]) : match));
}

/** Texto com **negrito** → HTML seguro. */
export function renderText(text, tokens) {
  return escapeHtml(applyTokens(text, tokens)).replace(BOLD_PATTERN, '<strong>$1</strong>');
}

/** Texto simples (conteúdo de elemento) → HTML seguro. */
export function renderPlain(text, tokens) {
  return escapeHtml(applyTokens(text, tokens));
}

/** Texto simples para atributo (title, aria-label…) → HTML seguro. */
export function renderAttr(text, tokens) {
  return escapeAttr(applyTokens(text, tokens));
}

/** Distância de edição, para sugerir "você quis dizer…?" em campos digitados errado. */
export function closest(word, options) {
  const distance = (a, b) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const current = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = current;
      }
    }
    return row[b.length];
  };
  let best = null;
  for (const option of options) {
    const d = distance(word.toLowerCase(), option.toLowerCase());
    if (d <= Math.max(2, Math.floor(option.length / 3)) && (!best || d < best.d)) best = { option, d };
  }
  return best?.option ?? null;
}
