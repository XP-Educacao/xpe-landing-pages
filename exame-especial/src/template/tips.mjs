/** Dicas de preparação, cada uma com um ícone de src/icons/. */
export default function tips(c) {
  const t = c.cfg.tips;
  const items = t.items.map(
    (item) =>
      `<div class="tip"><div class="tip-symbol">${c.svg(item.icon, 'viewBox="0 0 24 24" aria-hidden="true"')}</div><h3>${c.text(item.title)}</h3><p>${c.text(item.text)}</p></div>`,
  );
  const footnote = t.footnote ? `<p class="muted" style="margin-bottom:0">${c.text(t.footnote)}</p>` : '';
  return `<section class="section"><h2>${c.text(t.title)}</h2><p class="muted">${c.text(t.text)}</p><div class="tips">${items.join('')}</div>${footnote}</section>\n\n`;
}
