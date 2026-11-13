/**
 * HTML do hub. Recebe os dados já validados (tools/lib/config.mjs) e devolve a página inteira.
 *
 * Decisões:
 *   - Barra branca no topo com o logo da XP Inc. (como no xpinc.com), depois a faixa preta.
 *   - Cada card é um <article> com o nome do time num <h3>; o link fica no nome e um ::after
 *     estica a área clicável para o card todo (leitor de tela ouve só o nome do time).
 *   - O logo do time é decorativo (alt vazio): o nome já está no título do card.
 *   - CSS embutido e liberado pelo hash na Content-Security-Policy: a página não carrega nada
 *     de fora e nenhum texto da config consegue injetar script ou estilo.
 *   - A busca só existe quando há times suficientes; sem JavaScript a lista continua completa.
 */
import { escapeAttr as attr, escapeHtml as html } from './text.mjs';

const ICON_SEARCH =
  '<svg class="busca__icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4.2-4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_ARROW =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14m-5.5-5.5L19 12l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_NEW_TAB =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function linkAttributes(target) {
  if (target === '_blank') return ' target="_blank" rel="noopener noreferrer"';
  if (target === '_top') return ' target="_top"';
  return '';
}

/** Área do logo do time: a imagem, ou a sigla quando não há logo. */
function renderTeamVisual(team) {
  if (team.logoSrc) {
    return `<span class="time__logo"><img class="time__logo-img" src="${attr(team.logoSrc)}" alt="" decoding="async" /></span>`;
  }
  return `<span class="time__logo" aria-hidden="true"><span class="time__sigla">${html(team.sigla)}</span></span>`;
}

function renderTeam(team, { textos, d2l }) {
  const visual = renderTeamVisual(team);
  const description = team.descricao ? `\n                <p class="time__descricao">${html(team.descricao)}</p>` : '';

  if (!team.url) {
    return `          <li class="times__item" data-busca="${attr(team.busca)}">
            <article class="time time--em-breve">
              ${visual}
              <div class="time__texto">
                <h3 class="time__nome">${html(team.nome)}</h3>${description}
              </div>
              <p class="time__acao"><span class="time__selo">${html(textos.emBreve)}</span></p>
            </article>
          </li>`;
  }

  const newTab = d2l.abrirEm === '_blank';
  const srNewTab = newTab ? '<span class="sr-only"> (abre em nova aba)</span>' : '';
  return `          <li class="times__item" data-busca="${attr(team.busca)}">
            <article class="time time--link">
              ${visual}
              <div class="time__texto">
                <h3 class="time__nome"><a class="time__link" href="${attr(team.url)}"${linkAttributes(d2l.abrirEm)}>${html(team.nome)}${srNewTab}</a></h3>${description}
              </div>
              <p class="time__acao" aria-hidden="true"><span class="time__acao-texto">${html(textos.botao)}</span><span class="time__seta">${newTab ? ICON_NEW_TAB : ICON_ARROW}</span></p>
            </article>
          </li>`;
}

function renderBrand({ nome, logoSrc }) {
  if (logoSrc) return `<img class="marca__logo" src="${attr(logoSrc)}" alt="${attr(nome)}" />`;
  return `<span class="marca__nome">${html(nome)}</span>`;
}

/**
 * @param {object} options
 * @param {object} options.data     dados validados (validateConfig().data), com logoSrc já resolvido
 * @param {string} options.css      CSS final, exatamente como vai dentro de <style>
 * @param {string} options.cssHash  'sha256-…' do CSS, para a Content-Security-Policy
 * @param {string} options.script   caminho do hub.js com ?v= (vazio = sem busca)
 */
export function renderPage({ data, css, cssHash, script }) {
  const { textos, marca, busca, d2l, times } = data;
  const searchOn = Boolean(script);

  const csp = [
    "default-src 'none'",
    `style-src '${cssHash}'`,
    script ? "script-src 'self'" : "script-src 'none'",
    "img-src 'self' data:",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  const searchBox = searchOn
    ? `
          <div class="busca" role="search" data-busca-area hidden>
            <label class="sr-only" for="busca-times">${html(busca.placeholder)}</label>
            <div class="busca__campo">
              ${ICON_SEARCH}
              <input class="busca__input" id="busca-times" type="search" placeholder="${attr(busca.placeholder)}" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="go" aria-controls="lista-times" aria-keyshortcuts="/" />
              <kbd class="busca__atalho" aria-hidden="true">/</kbd>
            </div>
          </div>`
    : '';

  const emptyState = searchOn
    ? `
        <div class="vazio" data-vazio hidden>
          <p class="vazio__titulo">Nenhum time encontrado para “<span data-vazio-termo></span>”.</p>
          <p class="vazio__texto">Confira a grafia ou <button class="vazio__limpar" type="button" data-limpar>limpe a busca</button>.</p>
        </div>`
    : '';

  const footer = textos.rodape
    ? `
      <footer class="rodape">
        <p class="rodape__conteudo">${html(textos.rodape)}</p>
      </footer>`
    : '';

  /* Sem busca, a lista nunca é filtrada: os cards podem esticar e ocupar a largura toda. */
  const gridClass = searchOn ? 'times__grade' : 'times__grade times__grade--fixa';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${html(textos.tituloAba)}</title>
    <link rel="icon" href="data:," />
    <style>${css}</style>${script ? `\n    <script src="${attr(script)}" defer></script>` : ''}
  </head>
  <body>
    <a class="pular" href="#times">Ir para a lista de times</a>
    <div class="hub">
      <header class="cabecalho">
        <div class="topo">
          <p class="topo__conteudo marca">${renderBrand(marca)}</p>
        </div>
        <div class="hero">
          <div class="hero__conteudo">${textos.rotulo ? `\n            <p class="hero__rotulo">${html(textos.rotulo)}</p>` : ''}
            <h1 class="hero__titulo">${html(textos.titulo)}</h1>${textos.subtitulo ? `\n            <p class="hero__subtitulo">${html(textos.subtitulo)}</p>` : ''}${searchBox}
          </div>
        </div>
      </header>

      <main class="times" id="times" tabindex="-1">
        <h2 class="sr-only">Times</h2>${searchOn ? '\n        <p class="sr-only" id="busca-status" role="status"></p>' : ''}
        <ul class="${gridClass}" id="lista-times" role="list">
${times.map((team) => renderTeam(team, { textos, d2l })).join('\n')}
        </ul>${emptyState}
      </main>${footer}
    </div>
  </body>
</html>
`;
}
