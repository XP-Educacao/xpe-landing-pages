/** Perguntas frequentes (sanfonas <details>). */
export default function faq(c) {
  const t = c.cfg.faq;
  const items = t.items.map(
    (item) => `<details><summary>${c.text(item.question)}</summary><p>${c.text(item.answer)}</p></details>`,
  );
  return `<section class="section" id="faq"><h2>${c.text(t.title)}</h2>${items.join('')}</section>\n`;
}
