/** Caixa com o nome do bootcamp (bootcamp.name vem do page.config.mjs). */
export default function bootcamp(c) {
  const t = c.cfg.bootcamp;
  return [
    '<div class="bootcamp"><span class="bootcamp-icon" aria-hidden="true">',
    c.svg('livro', 'viewBox="0 0 24 24"'),
    '</span><div>',
    `<em>${c.text(t.label)}</em>`,
    `<strong id="bootcampNome">${c.plain(t.name)}</strong>`,
    t.hint ? `<span class="hint">${c.text(t.hint)}</span>` : '',
    '</div></div>\n',
  ].join('');
}
