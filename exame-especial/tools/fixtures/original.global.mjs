/**
 * FIXTURE DO TESTE DE FIDELIDADE — NÃO EDITE.
 *
 * Retrato dos dados do HTML original (reference/original.html) no formato da config global.
 * O teste gera uma página com estes dados e exige o mesmo resultado do original. Assim, mudar
 * textos em config/global.config.mjs não quebra o teste; mudar template/CSS/script quebra
 * (e precisa ser justificado em tools/verify-fidelity.mjs).
 */
export default {
  "site": {
    "publicBaseUrl": "https://xp-educacao.github.io/xpe-landing-pages/"
  },
  "page": {
    "title": "Seu Exame Especial | XP Educação"
  },
  "exam": {
    "date": "2026-12-16"
  },
  "scores": {
    "max": 500,
    "eligibleMin": 200,
    "eligibleMax": 349,
    "approvalMin": 350,
    "recordedIfApproved": 350
  },
  "bootcamp": {
    "label": "EXAME ESPECIAL REFERENTE AO BOOTCAMP",
    "hint": "Este campo deve ser preenchido automaticamente conforme o exame adquirido."
  },
  "form": {
    "iframeTitle": "Formulário de escolha do polo do Exame Especial",
    "placeholderTitle": "Espaço reservado para o formulário do Google",
    "placeholderText": "O formulário será exibido diretamente nesta área, integrado ao visual da página, assim que o link de incorporação for configurado.",
    "placeholderCode": "CONFIGURAR: GOOGLE_FORM_EMBED_URL"
  },
  "support": {
    "url": "",
    "pendingTitle": "Link do suporte pendente de configuração"
  },
  "polos": [
    {
      "id": "belo-horizonte",
      "city": "Belo Horizonte",
      "state": "MG",
      "address": "R. Roma, 561 – 2º andar – Sala 210 – Santa Lúcia"
    },
    {
      "id": "curitiba",
      "city": "Curitiba",
      "state": "PR",
      "address": "R. Comendador Araújo, 990 – Batel"
    },
    {
      "id": "sao-paulo",
      "city": "São Paulo",
      "state": "SP",
      "address": "Av. Chedid Jafet, 75 – Torre Sul – Vila Olímpia"
    },
    {
      "id": "rio-de-janeiro",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "address": "Praia de Botafogo, 501 – Torre Pão de Açúcar – 6º andar"
    },
    {
      "id": "brasilia",
      "city": "Brasília",
      "state": "DF",
      "address": "SGCV/SUL Lote N. 22 – CasaPark – Piso Superior"
    },
    {
      "id": "recife",
      "city": "Recife",
      "state": "PE",
      "address": "Av. Eng. Domingos Ferreira, 2589 – Boa Viagem"
    },
    {
      "id": "manaus",
      "city": "Manaus",
      "state": "AM",
      "address": "Av. Umberto Calderaro, 455 – Adrianópolis"
    }
  ],
  "hero": {
    "eyebrow": "Sua jornada continua",
    "title": "Uma nova oportunidade para seguir em frente.",
    "text": "Seu Exame Especial foi adquirido. Agora, é hora de organizar os próximos passos: confira as orientações, escolha o polo e prepare-se para a avaliação presencial.",
    "button": "Escolher meu polo ↓",
    "illustrationLabel": "Ilustração de calendário, caderno de estudos e símbolo de confirmação"
  },
  "dateSection": {
    "tag": "Informação importante",
    "title": "Sua prova já tem data definida",
    "text": "O Exame Especial será realizado **presencialmente, em uma data única e fixa**. Organize sua agenda para participar.",
    "dateLabel": "Data oficial do exame",
    "dateNote": "{weekday} · Data fixa",
    "formatLabel": "Formato",
    "formatValue": "100% presencial",
    "formatText": "Consulte os polos disponíveis e indique onde deseja realizar sua prova.",
    "notice": "**Não poderá comparecer nessa data?** A data oficial não pode ser alterada pelo aluno. Entre em contato com o suporte para explicar sua situação. Solicitações excepcionais serão analisadas individualmente, **sem garantia de alteração ou atendimento**.",
    "supportTitle": "Precisa de ajuda com a data?",
    "supportText": "Fale com a equipe de suporte antes do exame.",
    "supportButton": "Falar com o Suporte ↗"
  },
  "steps": {
    "title": "Seu próximo passo, em {stepsCount} etapas",
    "items": [
      {
        "title": "Entenda as orientações",
        "text": "Confira como funciona o exame e o que é necessário para a aprovação."
      },
      {
        "title": "Informe seu polo",
        "text": "Consulte os polos disponíveis, escolha onde deseja fazer a prova e registre sua opção no formulário."
      },
      {
        "title": "Estude e compareça",
        "text": "Revise os conteúdos e esteja presente no polo na data fixa do exame."
      }
    ]
  },
  "poloSection": {
    "tag": "Etapa após a compra",
    "title": "Escolha onde fará sua prova",
    "text": "Confira os polos disponíveis e seus endereços aqui mesmo. Depois, indique sua unidade de preferência no formulário abaixo para que a equipe organize a aplicação do seu Exame Especial no polo escolhido, em **{dateShort}**.",
    "panelTitle": "Consultar os polos disponíveis e endereços",
    "panelIntro": "Todos os polos abaixo estão ativos. Consulte o endereço antes de informar sua escolha no formulário.",
    "formTitle": "Informe seu polo de realização",
    "formText": "Preencha o formulário abaixo com seus dados e o polo escolhido. Esta etapa é necessária para organizar sua prova presencial.",
    "note": "A compra do exame já foi realizada. O preenchimento do formulário serve para informar o polo onde deseja fazer a prova."
  },
  "rules": {
    "title": "Como funciona o Exame Especial?",
    "text": "É uma oportunidade de recuperação para estudantes que não alcançaram a aprovação no bootcamp, mas atenderam aos critérios de elegibilidade.",
    "cards": [
      {
        "title": "Quem pode realizar?",
        "text": "Alunos com **{eligibleMin} a {eligibleMax} pontos ({eligibleMinPct} a {eligibleMaxPct})** no bootcamp, frequência mínima cumprida e prova presencial regular realizada."
      },
      {
        "title": "O que preciso para ser aprovado?",
        "text": "Alcançar **{approvalMin} pontos ou mais** no Exame Especial. A nota final registrada será de **{recordedIfApproved} pontos**, mesmo que a nota do exame seja maior."
      },
      {
        "title": "E se eu não alcançar a nota?",
        "text": "Será mantida a maior nota entre a avaliação regular e o Exame Especial, e o aluno permanecerá reprovado."
      },
      {
        "title": "Tenho mais de um bootcamp reprovado",
        "text": "É necessário adquirir um exame para cada bootcamp. As avaliações acontecem na mesma data, sendo uma prova para cada bootcamp."
      }
    ]
  },
  "tips": {
    "title": "Prepare-se com tranquilidade",
    "text": "Pequenas ações agora ajudam você a chegar mais confiante ao dia da avaliação.",
    "items": [
      {
        "icon": "livro",
        "title": "Revisite as aulas",
        "text": "Retome os vídeos, leituras e materiais de apoio do bootcamp."
      },
      {
        "icon": "alvo",
        "title": "Priorize suas dúvidas",
        "text": "Identifique os assuntos em que teve mais dificuldade e dê atenção especial a eles."
      },
      {
        "icon": "documento",
        "title": "Pratique o que aprendeu",
        "text": "Refaça exercícios e atividades disponíveis para testar seus conhecimentos."
      }
    ],
    "footnote": "Dica: reserve períodos curtos de revisão ao longo das próximas semanas e acompanhe as orientações oficiais sobre o local e o horário da prova."
  },
  "faq": {
    "title": "Perguntas frequentes",
    "items": [
      {
        "question": "Posso realizar o exame em outra data?",
        "answer": "A data oficial é fixa: {dateShort}. Se você não puder comparecer, procure o suporte para apresentar sua situação. Pedidos excepcionais serão analisados caso a caso, sem garantia de atendimento."
      },
      {
        "question": "O Exame Especial é on-line ou presencial?",
        "answer": "É exclusivamente presencial. Você deve indicar o polo no formulário e comparecer na data informada."
      },
      {
        "question": "Preciso pagar novamente para escolher o polo?",
        "answer": "Não. Esta página é apresentada após a compra do Exame Especial e a escolha do polo não representa uma nova compra."
      },
      {
        "question": "Como funciona se eu tiver mais de um bootcamp reprovado?",
        "answer": "É necessário ter adquirido um Exame Especial para cada bootcamp. Todas as avaliações ocorrerão em {dateShort}, com uma prova específica para cada bootcamp."
      },
      {
        "question": "Qual nota preciso tirar para passar?",
        "answer": "Você precisa obter pelo menos {approvalMin} pontos no Exame Especial. Se aprovado, sua nota final no bootcamp será registrada como {recordedIfApproved} pontos."
      },
      {
        "question": "Como consulto o endereço do polo?",
        "answer": "Abra “Consultar os polos disponíveis e endereços”, nesta mesma página, para conferir os endereços antes de preencher o formulário. O horário da prova será informado pelos canais oficiais da instituição."
      }
    ]
  },
  "footer": {
    "text": "XP Educação · Exame Especial de Graduação. Consulte os endereços na seção de polos desta página. O horário e eventuais orientações adicionais serão comunicados pelos canais oficiais. Esta página não substitui o regulamento acadêmico vigente."
  }
};
