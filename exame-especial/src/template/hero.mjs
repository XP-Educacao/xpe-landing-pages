/** Abertura: chamada, botão para #polo e calendário com a data de exam.date. */
export default function hero(c) {
  const t = c.cfg.hero;
  return [
    '<section class="hero"><div>',
    `<div class="eyebrow">${c.text(t.eyebrow)}</div>`,
    `<h1>${c.text(t.title)}</h1>`,
    `<p>${c.text(t.text)}</p>`,
    `<a class="button" href="#polo">${c.text(t.button)}</a>`,
    '</div>',
    c.svg(
      'calendario',
      `class="hero-art" viewBox="0 0 400 320" role="img" aria-label="${c.attr(t.illustrationLabel)}"`,
      { mesAno: c.date.monthYearUpper, dia: c.date.day },
    ),
    '</section>\n',
  ].join('');
}
