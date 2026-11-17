/*
 * Inicia o VLibras (tradutor de português para Libras do governo federal).
 * Só é publicado quando acessibilidade.vlibras é true em times.config.mjs.
 *
 * É o mesmo `new window.VLibras.Widget(...)` do código oficial, mas num arquivo do próprio hub:
 * a Content-Security-Policy não deixa rodar script escrito direto no HTML.
 * Se o plugin não carregar (rede bloqueada, gov.br fora do ar), nada quebra: o botão só não aparece.
 */
(() => {
  'use strict';
  if (window.VLibras && typeof window.VLibras.Widget === 'function') {
    new window.VLibras.Widget('https://vlibras.gov.br/app');
  }
})();
