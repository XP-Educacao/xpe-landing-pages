/** Etapas numeradas automaticamente (1, 2, 3…). */
export default function steps(c) {
  const t = c.cfg.steps;
  const items = t.items.map(
    (item, index) =>
      `<div class="step"><div class="number">${index + 1}</div><h3>${c.text(item.title)}</h3><p>${c.text(item.text)}</p></div>`,
  );
  return `<section class="section"><h2>${c.text(t.title)}</h2><div class="steps">${items.join('')}</div></section>\n`;
}
