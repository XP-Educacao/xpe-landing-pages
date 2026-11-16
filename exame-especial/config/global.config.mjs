/**
 * CONFIGURAÇÃO GLOBAL — vale para TODAS as páginas do Exame Especial.
 *
 * Cada página (pasta pg-1/, pg-2/…) pode trocar qualquer item daqui no próprio
 * page.config.mjs, dentro de `overrides`. Depois de editar, rode:  npm run build
 *
 * Regras de escrita (o `npm run check` avisa se algo estiver errado):
 *   - Textos ficam entre aspas simples: 'assim'. Se o texto tiver apóstrofo, use aspas duplas: "d'água".
 *   - Toda linha de item termina com vírgula.
 *   - Negrito: **assim**. HTML (<strong>, <br>…) não é aceito; ele aparece como texto.
 *   - Valores calculados automaticamente (use dentro dos textos, com as chaves):
 *       {dateShort}  16/12/2026             {dateLong}  16 de dezembro de 2026
 *       {weekday}    Quarta-feira           {bootcamp}  nome do bootcamp da página
 *       {eligibleMin} {eligibleMax}         notas mínima e máxima para fazer o exame (200, 349)
 *       {eligibleMinPct} {eligibleMaxPct}   as mesmas notas em % de scores.max (40%, 69%)
 *       {approvalMin}  nota para aprovação (350)   {recordedIfApproved}  nota registrada (350)
 *       {scoreMax}     nota máxima (500)           {stepsCount}  nº de etapas   {polosCount}  nº de polos
 */
export default {
  /* Endereço público do repositório no GitHub Pages. Usado só pelas ferramentas
     (npm run list, tabela do README e avisos do check), nunca dentro das páginas.
     Exemplo: 'https://xp-educacao.github.io/xpe-landing-pages/' (termina com /). */
  site: {
    publicBaseUrl: 'https://xp-educacao.github.io/xpe-landing-pages/',
  },

  page: {
    /* Título da aba do navegador. Texto simples (sem negrito). */
    title: 'Seu Exame Especial | XP Educação',
  },

  exam: {
    /* Data da prova no formato ANO-MÊS-DIA (ISO). Exemplo: '2026-12-16'.
       Daqui saem, sozinhos: o calendário do topo (DEZEMBRO 2026 / 16), o card da data,
       o dia da semana e todas as menções {dateShort}/{dateLong} nos textos. */
    date: '2026-12-16',
  },

  /* Pontuações do regulamento (números inteiros). As porcentagens são calculadas sobre
     `max` e arredondadas para baixo, como no original: 349 de 500 → 69%. */
  scores: {
    /* Nota máxima do bootcamp. Exemplo: 500. */
    max: 500,
    /* Nota mínima para poder fazer o Exame Especial. Exemplo: 200 (→ 40%). */
    eligibleMin: 200,
    /* Nota máxima para poder fazer o exame (abaixo da aprovação). Exemplo: 349 (→ 69%). */
    eligibleMax: 349,
    /* Nota mínima no Exame Especial para ser aprovado. Exemplo: 350. */
    approvalMin: 350,
    /* Nota registrada no bootcamp quando o aluno é aprovado no exame. Exemplo: 350. */
    recordedIfApproved: 350,
  },

  bootcamp: {
    /* O NOME do bootcamp é definido em cada página (page.config.mjs → bootcamp.name). */
    /* Rótulo acima do nome. Texto simples. */
    label: 'EXAME ESPECIAL REFERENTE AO BOOTCAMP',
    /* Frase pequena abaixo do nome. Deixe '' (vazio) para não exibir. Aceita **negrito**. */
    hint: 'Este campo deve ser preenchido automaticamente conforme o exame adquirido.',
  },

  form: {
    /* O LINK do formulário é definido em cada página (page.config.mjs → form.embedUrl). */
    /* Nome do formulário lido por leitores de tela (atributo title do iframe). Texto simples. */
    iframeTitle: 'Formulário de escolha do polo do Exame Especial',
    /* Textos exibidos enquanto a página ainda não tem link de formulário. */
    placeholderTitle: 'Espaço reservado para o formulário do Google',
    placeholderText:
      'O formulário será exibido diretamente nesta área, integrado ao visual da página, assim que o link de incorporação for configurado.',
    /* Texto simples. */
    placeholderCode: 'CONFIGURAR: GOOGLE_FORM_EMBED_URL',
  },

  support: {
    /* Link do suporte (precisa começar com https://). Vazio = botão desabilitado.
       Cada página pode ter o seu (page.config.mjs → support.url).
       Exemplo: 'https://suporte.exemplo.com.br/'. */
    url: '',
    /* Dica que aparece ao passar o mouse no botão enquanto o link não existe. Texto simples. */
    pendingTitle: 'Link do suporte pendente de configuração',
  },

  /* CATÁLOGO DE POLOS. Cada página mostra todos, ou só os escolhidos em page.config.mjs → polos.
     Para incluir um polo: copie um bloco { … }, cole no fim e troque os valores.
       id:      identificador único, minúsculas e hífens (ex.: 'porto-alegre'). Não aparece na página.
       city:    nome da cidade como aparece na página.
       state:   UF com 2 letras maiúsculas (ex.: 'RS').
       address: endereço completo, como aparece na página.
     Lembre de incluir/alterar a mesma opção no Google Forms. */
  polos: [
    {
      id: 'belo-horizonte',
      city: 'Belo Horizonte',
      state: 'MG',
      address: 'R. Roma, 561 – 2º andar – Sala 210 – Santa Lúcia',
    },
    {
      id: 'curitiba',
      city: 'Curitiba',
      state: 'PR',
      address: 'R. Comendador Araújo, 990 – Batel',
    },
    {
      id: 'sao-paulo',
      city: 'São Paulo',
      state: 'SP',
      address: 'Av. Chedid Jafet, 75 – Torre Sul – Vila Olímpia',
    },
    {
      id: 'rio-de-janeiro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      address: 'Praia de Botafogo, 501 – Torre Pão de Açúcar – 6º andar',
    },
    {
      id: 'brasilia',
      city: 'Brasília',
      state: 'DF',
      address: 'SGCV/SUL Lote N. 22 – CasaPark – Piso Superior',
    },
    {
      id: 'recife',
      city: 'Recife',
      state: 'PE',
      address: 'Av. Eng. Domingos Ferreira, 2589 – Boa Viagem',
    },
    {
      id: 'manaus',
      city: 'Manaus',
      state: 'AM',
      address: 'Av. Umberto Calderaro, 455 – Adrianópolis',
    },
  ],

  /* ── TEXTOS DAS SEÇÕES, na ordem em que aparecem na página ── */

  /* Abertura (faixa verde do topo). */
  hero: {
    eyebrow: 'Sua jornada continua',
    title: 'Uma nova oportunidade para seguir em frente.',
    text: 'Seu Exame Especial foi adquirido. Agora, é hora de organizar os próximos passos: confira as orientações, escolha o polo e prepare-se para a avaliação presencial.',
    /* Texto do botão que leva até a escolha do polo. */
    button: 'Escolher meu polo ↓',
    /* Descrição da ilustração para leitores de tela. Texto simples. */
    illustrationLabel: 'Ilustração de calendário, caderno de estudos e símbolo de confirmação',
  },

  /* Seção "Sua prova já tem data definida" (inclui o bloco de suporte). */
  dateSection: {
    tag: 'Informação importante',
    title: 'Sua prova já tem data definida',
    text: 'O Exame Especial será realizado **presencialmente, em uma data única e fixa**. Organize sua agenda para participar.',
    /* Card verde: rótulo acima da data (a data em si vem de exam.date). */
    dateLabel: 'Data oficial do exame',
    dateNote: '{weekday} · Data fixa',
    /* Card cinza ao lado. */
    formatLabel: 'Formato',
    formatValue: '100% presencial',
    formatText: 'Consulte os polos disponíveis e indique onde deseja realizar sua prova.',
    /* Aviso amarelo. */
    notice:
      '**Não poderá comparecer nessa data?** A data oficial não pode ser alterada pelo aluno. Entre em contato com o suporte para explicar sua situação. Solicitações excepcionais serão analisadas individualmente, **sem garantia de alteração ou atendimento**.',
    /* Bloco de suporte. */
    supportTitle: 'Precisa de ajuda com a data?',
    supportText: 'Fale com a equipe de suporte antes do exame.',
    supportButton: 'Falar com o Suporte ↗',
  },

  /* Seção de etapas. A numeração (1, 2, 3…) é automática. Para incluir uma etapa,
     acrescente um item { title, text } em `items`; {stepsCount} acompanha. */
  steps: {
    title: 'Seu próximo passo, em {stepsCount} etapas',
    items: [
      {
        title: 'Entenda as orientações',
        text: 'Confira como funciona o exame e o que é necessário para a aprovação.',
      },
      {
        title: 'Informe seu polo',
        text: 'Consulte os polos disponíveis, escolha onde deseja fazer a prova e registre sua opção no formulário.',
      },
      {
        title: 'Estude e compareça',
        text: 'Revise os conteúdos e esteja presente no polo na data fixa do exame.',
      },
    ],
  },

  /* Seção "Escolha onde fará sua prova" (polos + formulário). */
  poloSection: {
    tag: 'Etapa após a compra',
    title: 'Escolha onde fará sua prova',
    text: 'Confira os polos disponíveis e seus endereços aqui mesmo. Depois, indique sua unidade de preferência no formulário abaixo para que a equipe organize a aplicação do seu Exame Especial no polo escolhido, em **{dateShort}**.',
    /* Painel que abre/fecha com a lista de polos. Texto simples. */
    panelTitle: 'Consultar os polos disponíveis e endereços',
    panelIntro: 'Todos os polos abaixo estão ativos. Consulte o endereço antes de informar sua escolha no formulário.',
    /* Cabeçalho do formulário. */
    formTitle: 'Informe seu polo de realização',
    formText: 'Preencha o formulário abaixo com seus dados e o polo escolhido. Esta etapa é necessária para organizar sua prova presencial.',
    /* Observação abaixo do formulário. */
    note: 'A compra do exame já foi realizada. O preenchimento do formulário serve para informar o polo onde deseja fazer a prova.',
  },

  /* Seção "Como funciona o Exame Especial?". Para incluir um card, acrescente { title, text }. */
  rules: {
    title: 'Como funciona o Exame Especial?',
    text: 'É uma oportunidade de recuperação para estudantes que não alcançaram a aprovação no bootcamp, mas atenderam aos critérios de elegibilidade.',
    cards: [
      {
        title: 'Quem pode realizar?',
        text: 'Alunos com **{eligibleMin} a {eligibleMax} pontos ({eligibleMinPct} a {eligibleMaxPct})** no bootcamp, frequência mínima cumprida e prova presencial regular realizada.',
      },
      {
        title: 'O que preciso para ser aprovado?',
        text: 'Alcançar **{approvalMin} pontos ou mais** no Exame Especial. A nota final registrada será de **{recordedIfApproved} pontos**, mesmo que a nota do exame seja maior.',
      },
      {
        title: 'E se eu não alcançar a nota?',
        text: 'Será mantida a maior nota entre a avaliação regular e o Exame Especial, e o aluno permanecerá reprovado.',
      },
      {
        title: 'Tenho mais de um bootcamp reprovado',
        text: 'É necessário adquirir um exame para cada bootcamp. As avaliações acontecem na mesma data, sendo uma prova para cada bootcamp.',
      },
    ],
  },

  /* Seção de dicas. `icon` aceita: 'livro', 'alvo', 'documento', 'formulario'
     (arquivos em src/icons/). Para incluir uma dica, acrescente { icon, title, text }. */
  tips: {
    title: 'Prepare-se com tranquilidade',
    text: 'Pequenas ações agora ajudam você a chegar mais confiante ao dia da avaliação.',
    items: [
      {
        icon: 'livro',
        title: 'Revisite as aulas',
        text: 'Retome os vídeos, leituras e materiais de apoio do bootcamp.',
      },
      {
        icon: 'alvo',
        title: 'Priorize suas dúvidas',
        text: 'Identifique os assuntos em que teve mais dificuldade e dê atenção especial a eles.',
      },
      {
        icon: 'documento',
        title: 'Pratique o que aprendeu',
        text: 'Refaça exercícios e atividades disponíveis para testar seus conhecimentos.',
      },
    ],
    /* Frase abaixo das dicas. */
    footnote:
      'Dica: reserve períodos curtos de revisão ao longo das próximas semanas e acompanhe as orientações oficiais sobre o local e o horário da prova.',
  },

  /* Perguntas frequentes. Para incluir uma pergunta, acrescente { question, answer }.
     `question` é texto simples; `answer` aceita **negrito** e os valores {…}. */
  faq: {
    title: 'Perguntas frequentes',
    items: [
      {
        question: 'Posso realizar o exame em outra data?',
        answer:
          'A data oficial é fixa: {dateShort}. Se você não puder comparecer, procure o suporte para apresentar sua situação. Pedidos excepcionais serão analisados caso a caso, sem garantia de atendimento.',
      },
      {
        question: 'O Exame Especial é on-line ou presencial?',
        answer:
          'É exclusivamente presencial. Você deve indicar o polo no formulário e comparecer na data informada.',
      },
      {
        question: 'Preciso pagar novamente para escolher o polo?',
        answer:
          'Não. Esta página é apresentada após a compra do Exame Especial e a escolha do polo não representa uma nova compra.',
      },
      {
        question: 'Como funciona se eu tiver mais de um bootcamp reprovado?',
        answer:
          'É necessário ter adquirido um Exame Especial para cada bootcamp. Todas as avaliações ocorrerão em {dateShort}, com uma prova específica para cada bootcamp.',
      },
      {
        question: 'Qual nota preciso tirar para passar?',
        answer:
          'Você precisa obter pelo menos {approvalMin} pontos no Exame Especial. Se aprovado, sua nota final no bootcamp será registrada como {recordedIfApproved} pontos.',
      },
      {
        question: 'Como consulto o endereço do polo?',
        answer:
          'Abra “Consultar os polos disponíveis e endereços”, nesta mesma página, para conferir os endereços antes de preencher o formulário. O horário da prova será informado pelos canais oficiais da instituição.',
      },
    ],
  },

  footer: {
    text: 'XP Educação · Exame Especial de Graduação. Consulte os endereços na seção de polos desta página. O horário e eventuais orientações adicionais serão comunicados pelos canais oficiais. Esta página não substitui o regulamento acadêmico vigente.',
  },
};
