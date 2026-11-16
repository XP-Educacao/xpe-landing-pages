/**
 * Documento completo da página. As seções aparecem na ordem da lista SECTIONS.
 *
 * Contexto `c` recebido por todos os templates:
 *   c.cfg              config final da página (global + page.config.mjs)
 *   c.date             data derivada de exam.date: dateShort, dateLong, weekday, day, monthYearUpper
 *   c.text(s)          texto da config com **negrito** e {valores}, já escapado
 *   c.plain(s)         texto simples escapado (com {valores}, sem negrito)
 *   c.attr(s)          texto para atributo (title, aria-label), escapado
 *   c.url(s)           URL para atributo, escapada (sem {valores})
 *   c.svg(nome, attrs, valores)  conteúdo de src/icons/<nome>.svg dentro de <svg attrs>
 *   c.assets.css / c.assets.js   caminhos relativos dos assets com ?v=<hash>
 */
import bootcamp from './bootcamp.mjs';
import dateSection from './date.mjs';
import faq from './faq.mjs';
import footer from './footer.mjs';
import hero from './hero.mjs';
import poloSection from './polo.mjs';
import rules from './rules.mjs';
import steps from './steps.mjs';
import tips from './tips.mjs';

export const SECTIONS = [hero, bootcamp, dateSection, steps, poloSection, rules, tips, faq, footer];

export default function renderDocument(c) {
  return [
    '<!-- GERADO por tools/build — não editar; edite page.config.mjs -->\n',
    '<!doctype html>\n',
    '<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${c.plain(c.cfg.page.title)}</title>\n`,
    `<link rel="stylesheet" href="${c.assets.css}">\n`,
    '</head><body>\n',
    '<main>\n',
    ...SECTIONS.map((section) => section(c)),
    '</main>\n',
    `<script src="${c.assets.js}"></script></body></html>\n`,
  ].join('');
}
