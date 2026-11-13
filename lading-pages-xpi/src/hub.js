/*
 * Busca de times (melhoria progressiva): sem JavaScript, a lista aparece completa e a caixa
 * de busca continua escondida. O script não acessa a página do D2L (window.top/parent),
 * não insere HTML e não chama nenhum endereço externo.
 *
 * A busca compara o COMEÇO de cada palavra (nome, sigla, descrição e palavras-chave), sem
 * acentos: "ti" acha Tecnologia (sigla TI), mas não "investimentos".
 *
 * Atalhos: "/" foca a busca · Esc limpa · Enter abre o time quando sobra só um.
 */
(() => {
  'use strict';

  const area = document.querySelector('[data-busca-area]');
  const input = document.getElementById('busca-times');
  const list = document.getElementById('lista-times');
  if (!area || !input || !list) return;

  const items = Array.from(list.querySelectorAll('li[data-busca]'));
  const empty = document.querySelector('[data-vazio]');
  const emptyTerm = document.querySelector('[data-vazio-termo]');
  const clearButton = document.querySelector('[data-limpar]');
  const status = document.getElementById('busca-status');

  /* Mesma regra de normalizeSearch() em tools/lib/text.mjs. */
  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();

  let announceTimer = 0;

  function announce(terms, visible) {
    window.clearTimeout(announceTimer);
    announceTimer = window.setTimeout(() => {
      if (!status) return;
      if (terms.length === 0) status.textContent = '';
      else if (visible === 0) status.textContent = 'Nenhum time encontrado.';
      else status.textContent = visible === 1 ? '1 time encontrado.' : `${visible} times encontrados.`;
    }, 450);
  }

  function filter() {
    const terms = normalize(input.value).split(' ').filter(Boolean);
    let visible = 0;
    for (const item of items) {
      const words = ` ${item.dataset.busca || ''}`;
      const match = terms.every((term) => words.includes(` ${term}`));
      item.hidden = !match;
      if (match) visible += 1;
    }
    if (empty) empty.hidden = visible > 0;
    if (emptyTerm) emptyTerm.textContent = input.value.trim();
    announce(terms, visible);
  }

  function clear() {
    input.value = '';
    filter();
    input.focus();
  }

  input.addEventListener('input', filter);
  input.addEventListener('search', filter);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      clear();
    } else if (event.key === 'Enter') {
      const visible = items.filter((item) => !item.hidden);
      const link = visible.length === 1 ? visible[0].querySelector('a.time__link') : null;
      if (link && input.value.trim()) {
        event.preventDefault();
        link.click();
      }
    }
  });

  if (clearButton) clearButton.addEventListener('click', clear);

  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
      return;
    }
    event.preventDefault();
    input.focus();
  });

  area.hidden = false;
  /* Ao voltar para a página, o navegador pode restaurar o texto digitado antes. */
  if (input.value) filter();
})();
