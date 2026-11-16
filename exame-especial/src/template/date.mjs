/** Data do exame, formato, aviso e botão de suporte (ativado por assets/exame-especial.js). */
export default function dateSection(c) {
  const t = c.cfg.dateSection;
  const support = c.cfg.support;
  return [
    '<section class="section">',
    `<span class="tag">${c.text(t.tag)}</span>`,
    `<h2 style="margin-top:12px">${c.text(t.title)}</h2>`,
    `<p class="muted">${c.text(t.text)}</p>`,
    '<div class="date">',
    `<div class="date-main"><span class="muted">${c.text(t.dateLabel)}</span><strong>${c.plain(c.date.dateLong)}</strong><span>${c.text(t.dateNote)}</span></div>`,
    `<div class="date-side"><span class="muted">${c.text(t.formatLabel)}</span><strong>${c.text(t.formatValue)}</strong><span>${c.text(t.formatText)}</span></div>`,
    '</div>',
    `<div class="notice">${c.text(t.notice)}</div>`,
    '<div class="support">',
    `<div><strong>${c.text(t.supportTitle)}</strong><p class="muted">${c.text(t.supportText)}</p></div>`,
    `<a id="suporteLink" class="button secondary" href="#" aria-disabled="true" title="${c.attr(support.pendingTitle)}" target="_blank" rel="noopener noreferrer" data-support-url="${c.url(support.url)}">${c.text(t.supportButton)}</a>`,
    '</div>',
    '</section>\n',
  ].join('');
}
