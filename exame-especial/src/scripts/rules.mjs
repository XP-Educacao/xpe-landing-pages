/**
 * Regras de URL — FONTE ÚNICA, usada em dois lugares:
 *   1. no navegador: o build injeta estas expressões em assets/exame-especial.js;
 *   2. no build/check: tools/lib/schema.mjs valida as configs com elas.
 * Iguais às do HTML original. Mudou aqui, rode `npm run build` e `npm test`.
 */

/** O formulário só é incorporado (iframe) se a URL começar assim. */
export const FORM_EMBED_URL_PATTERN = /^https:\/\/docs\.google\.com\/forms\//i;

/** O botão de suporte só fica ativo com link HTTPS. */
export const SUPPORT_URL_PATTERN = /^https:\/\//i;
