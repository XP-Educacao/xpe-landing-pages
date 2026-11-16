/* Comportamento da página no navegador (formulário e suporte), igual ao HTML original.
   Os valores de cada página chegam pelos atributos data-* que o build escreve no HTML.
   Os dois marcadores __…_PATTERN__ abaixo são trocados pelo build pelas expressões de
   src/scripts/rules.mjs. Nada de acessar a janela de cima (top/parent): a página roda em
   iframe no D2L. */
(() => {
  const FORM_EMBED_URL_PATTERN = __FORM_EMBED_URL_PATTERN__;
  const SUPPORT_URL_PATTERN = __SUPPORT_URL_PATTERN__;

  const suporteLink = document.getElementById('suporteLink');
  if (suporteLink) {
    const supportUrl = suporteLink.getAttribute('data-support-url') || '';
    if (SUPPORT_URL_PATTERN.test(supportUrl)) {
      suporteLink.href = supportUrl;
      suporteLink.removeAttribute('aria-disabled');
      suporteLink.removeAttribute('title');
    } else {
      suporteLink.addEventListener('click', (e) => e.preventDefault());
      suporteLink.style.opacity = '.65';
      suporteLink.style.cursor = 'not-allowed';
    }
  }

  const container = document.getElementById('googleFormContainer');
  if (container) {
    const formUrl = container.getAttribute('data-form-embed-url') || '';
    if (FORM_EMBED_URL_PATTERN.test(formUrl)) {
      const iframe = document.createElement('iframe');
      iframe.className = 'google-form-frame';
      iframe.title = container.getAttribute('data-form-title') || '';
      iframe.src = formUrl;
      iframe.loading = 'lazy';
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      container.replaceChildren(iframe);
    }
  }
})();
