/**
 * HUB DE TIMES — o ÚNICO arquivo que você edita no dia a dia.
 *
 * O hub mostra só TIMES. Cada time é um card que leva para a home dele no D2L.
 * Nunca liste, conte ou cite cursos aqui: eles ficam na home de cada time, e qualquer
 * número ficaria desatualizado no dia seguinte. A página só cresce quando entra um time novo.
 *
 * Depois de editar:
 *   npm run check     → confere se está tudo certo (mostra onde está o erro e como corrigir)
 *   npm run preview   → mostra o hub no navegador, também dentro de um iframe como no D2L
 *
 * Regras de escrita:
 *   - Textos ficam entre aspas simples: 'assim'. Se tiver apóstrofo, use aspas duplas: "d'água".
 *   - Toda linha de item termina com vírgula.
 *   - Texto simples: HTML (<b>, <br>…) não é aceito.
 */
export default {
  d2l: {
    /* Endereço do D2L Brightspace, só o começo e sem barra no final.
       Exemplo: 'https://suaempresa.brightspace.com'.
       Com ele preenchido, cada time só precisa do número da home (campo `home` lá embaixo). */
    endereco: '',

    /* Onde a home do time abre quando a pessoa clica no card:
         '_top'   → na janela inteira, no lugar do D2L (recomendado quando o hub está num iframe do D2L)
         '_blank' → numa nova aba
         '_self'  → dentro do próprio quadro (evite no iframe: aparece um D2L dentro do D2L) */
    abrirEm: '_top',
  },

  marca: {
    /* Nome da marca (lido por leitores de tela no logo, se houver logo). */
    nome: 'XP Inc.',

    /* Logo OPCIONAL da XP Inc., dentro da faixa PRETA do topo: precisa ser a versão BRANCA
       (para fundo escuro). A versão preta (logo-xp-inc.png) some no preto, por isso está vazio.
       Coloque o arquivo na pasta imagens/ e escreva só o nome dele. Vazio = sem logo no topo. */
    logo: '',
  },

  textos: {
    /* Título da aba do navegador. */
    tituloAba: 'Times da XP Inc. no D2L',
    /* Linha pequena em verde-água acima do título. Vazio = não exibe. */
    rotulo: 'Hub de times · D2L Brightspace',
    /* Título principal. */
    titulo: 'Escolha o seu time',
    /* Frase abaixo do título. Vazio = não exibe. */
    subtitulo: 'Cada time da XP Inc. tem uma home própria no D2L. Selecione o seu para continuar.',
    /* Texto no rodapé de cada card. */
    botao: 'Acessar home',
    /* Selo dos times que ainda não têm home cadastrada. */
    emBreve: 'Em breve',
    /* Linha no fim da página. Vazio = não exibe. */
    rodape: 'Não encontrou o seu time? Procure a pessoa responsável pelos treinamentos da sua área.',
  },

  busca: {
    /* A caixa de busca aparece quando o hub tem pelo menos este número de times. 0 = nunca. */
    aPartirDe: 8,
    /* Texto dentro da caixa de busca. */
    placeholder: 'Buscar time',
  },

  /* Ordem dos cards:
       'alfabetica' → por nome, automaticamente (recomendado: time novo entra em qualquer lugar da lista)
       'manual'     → na ordem em que os times aparecem abaixo */
  ordem: 'alfabetica',

  /*
   * TIMES — um bloco { … } por time. Para adicionar, copie um bloco; para remover, apague o bloco.
   *
   *   nome           (obrigatório) Nome do time, como as pessoas o reconhecem. Até 60 caracteres.
   *   home           Número da home do time no D2L: o número no fim de .../d2l/home/12345.
   *                  Também aceita o endereço completo, começando com https://.
   *                  Vazio ('') = o card aparece como "Em breve", sem link.
   *   descricao      (opcional) Uma frase sobre o time. Até 120 caracteres. Não cite cursos.
   *   logo           (opcional) Logo do time, no topo do card BRANCO: use a versão para fundo claro.
   *                  Coloque o arquivo em imagens/ e escreva só o nome, exatamente igual (com
   *                  maiúsculas). Ex.: 'logo-academy.png'. O espaço tem 80 px de altura e até
   *                  240 px de largura. Vazio = mostra a sigla.
   *   sigla          (opcional) Até 3 letras, exibidas quando não há logo. Sem ela, sai das iniciais.
   *   palavrasChave  (opcional) Outros nomes que as pessoas digitam na busca. Ex.: ['TI', 'tech'].
   */
  times: [
    {
      nome: 'Academy',
      home: 'https://xpetest.brightspace.com/d2l/home/6786',
      descricao: '',
      logo: 'logo-academy.png',
    },
    {
      nome: 'Atendimento',
      home: 'https://xpetest.brightspace.com/d2l/home/6788',
      descricao: '',
      logo: 'xp-inc-atendimento.png',
    },
    {
      nome: 'Gente e Cultura',
      home: 'https://xpetest.brightspace.com/d2l/home/6787',
      descricao: '',
      logo: 'xp-inc-gente-e-cultura.png',
    },
  ],
};
