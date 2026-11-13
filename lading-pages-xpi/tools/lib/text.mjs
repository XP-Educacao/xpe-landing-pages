/**
 * Textos vindos da config: escape de HTML, siglas, normalização para a busca e detecção
 * de contagem de cursos. Nada da config entra cru no HTML: tudo passa por escapeHtml/escapeAttr.
 */

export function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', '&quot;');
}

/**
 * Minúsculas, sem acentos e sem pontuação: «Ética, Conduta & P&D» → «etica conduta p d».
 * A mesma regra está em src/hub.js (a busca compara o começo de cada palavra).
 */
export function normalizeSearch(text) {
  return String(text)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const SMALL_WORDS = new Set([
  'a', 'as', 'o', 'os', 'e', 'de', 'da', 'das', 'do', 'dos', 'em', 'na', 'nas', 'no', 'nos',
  'para', 'por', 'com', 'of', 'and', 'the', '&',
]);

/** Sigla do selo: iniciais das duas primeiras palavras relevantes, ou as 2 primeiras letras. */
export function makeInitials(name) {
  const words = String(name)
    .split(/[^\p{L}\p{N}&]+/u)
    .filter((word) => word && !SMALL_WORDS.has(word.toLocaleLowerCase('pt-BR')));
  if (words.length === 0) return '?';
  const letters =
    words.length >= 2 ? [...words[0]][0] + [...words[1]][0] : [...words[0]].slice(0, 2).join('');
  return letters.toLocaleUpperCase('pt-BR');
}

const HTML_TAG = /<\/?[A-Za-z][^>]*>/;

export function hasHtml(text) {
  return HTML_TAG.test(text);
}

/* "12 cursos", "+300 trilhas", "1.200 conteúdos", "5 mil aulas"… */
const COURSE_COUNT =
  /\d[\d.,]*\s*(?:\+\s*)?(?:mil\s+)?(?:cursos?|trilhas?|turmas?|aulas?|m[oó]dulos?|treinamentos?|conte[uú]dos?|disciplinas?|capacita[cç](?:ão|ões|ao|oes))(?!\p{L})/iu;

/** Trecho do texto que conta cursos, ou null. O hub não conta cursos (ficaria desatualizado). */
export function courseCountIn(text) {
  return String(text).match(COURSE_COUNT)?.[0] ?? null;
}
