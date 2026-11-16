/** Escolha do polo: lista de polos (catálogo ou seleção da página) e área do Google Forms (#formulario). */
export default function poloSection(c) {
  const t = c.cfg.poloSection;
  const form = c.cfg.form;
  const polos = c.cfg.polos.map(
    (polo) =>
      `<div class="polo-item"><strong>${c.plain(polo.city)} · ${c.plain(polo.state)}</strong><address>${c.plain(polo.address)}</address></div>`,
  );
  return [
    '<section class="section" id="polo">',
    `<span class="tag">${c.text(t.tag)}</span>`,
    `<h2 style="margin-top:12px">${c.text(t.title)}</h2>`,
    `<p class="muted">${c.text(t.text)}</p>\n`,
    `<details class="polos-panel" id="polosDisponiveis"><summary><span>${c.text(t.panelTitle)}</span></summary>`,
    `<p class="polos-intro">${c.text(t.panelIntro)}</p>`,
    `<div class="polo-list">${polos.join('')}</div></details>\n`,
    '<div class="embed-frame" id="formulario">',
    `<div class="embed-heading"><h3>${c.text(t.formTitle)}</h3><p class="muted">${c.text(t.formText)}</p></div>\n`,
    `<div id="googleFormContainer" data-form-embed-url="${c.url(form.embedUrl)}" data-form-title="${c.attr(form.iframeTitle)}">`,
    '<div class="embed-placeholder">',
    c.svg('formulario', 'viewBox="0 0 24 24" aria-hidden="true"'),
    `<strong>${c.text(form.placeholderTitle)}</strong>`,
    `<p>${c.text(form.placeholderText)}</p>`,
    `<code>${c.text(form.placeholderCode)}</code>`,
    '</div></div></div>\n',
    `<p class="hint" style="margin-top:12px">${c.text(t.note)}</p></section>\n`,
  ].join('');
}
