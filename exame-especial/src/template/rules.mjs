/** "Como funciona o Exame Especial?": cards com as regras (as notas vêm de scores). */
export default function rules(c) {
  const t = c.cfg.rules;
  const cards = t.cards.map(
    (card) => `<div class="card"><h3>${c.text(card.title)}</h3><p>${c.text(card.text)}</p></div>`,
  );
  return `<section class="section"><h2>${c.text(t.title)}</h2><p class="muted">${c.text(t.text)}</p><div class="cards">${cards.join('')}</div></section>\n`;
}
