/**
 * CONFIGURAÇÃO DESTA PÁGINA. O nome da pasta é o final da URL (o slug).
 * Depois de editar, rode no terminal (dentro de exame-especial):  npm run build
 *
 * Só bootcamp.name e form.embedUrl são obrigatórios. O resto vem de config/global.config.mjs.
 */
export default {
  bootcamp: {
    /* Nome do bootcamp do exame, exatamente como deve aparecer para o aluno.
       Exemplo: 'Bootcamp Analista de Dados'. Texto simples (sem negrito). */
    name: 'Mercado Financeiro e de Capitais - BTC 2',
  },

  form: {
    /* Link de INCORPORAÇÃO do Google Forms desta página. Como pegar:
       Google Forms → Enviar → ícone <> (Incorporar HTML) → copie só o endereço de src="…".
       Ele começa com https://docs.google.com/forms/ e termina com /viewform?embedded=true.
       Vazio ('') = a página mostra o espaço reservado no lugar do formulário. */
    embedUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeqe0lqFGbReHQZXpoM7kv0rTpSKinBOgO07XwWKlVDo5zmNw/viewform?embedded=true',
  },

  support: {
    /* OPCIONAL. Link do suporte só desta página (precisa começar com https://).
       Vazio ('') = usa o link de config/global.config.mjs. Apague o bloco se não precisar. */
    url: '',
  },

  /* OPCIONAL. Polos exibidos nesta página, pelo id do catálogo (config/global.config.mjs).
     Sem esta linha, aparecem todos. Ids: belo-horizonte, curitiba, sao-paulo,
     rio-de-janeiro, brasilia, recife, manaus. Exemplo:
  polos: ['sao-paulo', 'rio-de-janeiro'],
  */

  /* OPCIONAL. Troca qualquer item da config global só nesta página. Blocos { } se combinam;
     listas [ ] são substituídas inteiras. Exemplos:
       overrides: { exam: { date: '2027-01-20' } },
       overrides: { hero: { title: 'Outro título' } },  */
  overrides: {},
};
