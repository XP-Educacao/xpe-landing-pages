/**
 * "Dúvidas frequentes" — always at the end of the page. Edit the questions and answers here;
 * the counter under the heading follows the number of items.
 *
 * ── ANSWER ─────────────────────────────────────────────────────────────────────────────────
 * Plain text:
 *     answer: 'Texto da resposta.'
 *
 * Or a list of blocks, shown in order (mix them freely):
 *     answer: [
 *       'Parágrafo comum.',                                        ← paragraph
 *       { topics: [ ... ] },                                       ← topic list (see below)
 *       { note: 'Texto em destaque.', label: 'Importante' },       ← highlight box
 *       { small: 'Texto complementar, menor e discreto.' },        ← complementary note
 *     ]
 *
 * ── TOPIC LIST ─────────────────────────────────────────────────────────────────────────────
 *     {
 *       layout: 'list',               (optional) 'cards' (default): one box per topic, in a grid
 *                                                'list': one panel, topics in rows split by lines
 *                                                'timeline': steps joined by a line (use when
 *                                                            there IS an order)
 *       marker: 'play',               (optional) 'check' | 'play' | 'dot' | 'number' (01, 02…)
 *                                                default: 'check'; 'number' in timeline
 *       itemLabel: 'Módulo',          (optional) small label above each title. With
 *                                                marker 'number' it is numbered: "MÓDULO 1"…
 *       title: 'Título da lista',     (optional) small heading above the topics
 *       columns: 1,                   (optional, cards) 1 = one column; default = 2 on desktop
 *       topics: [
 *         'Tópico só com texto',
 *         {
 *           title: 'Título do tópico',
 *           description: 'Descrição logo abaixo do título.',      (optional)
 *           complement: 'Informação extra, menor e discreta.',    (optional)
 *         },
 *       ],
 *     }
 *
 * ── HIGHLIGHT BOX ──────────────────────────────────────────────────────────────────────────
 *     { note: 'Texto.', label: 'Importante', tone: 'brand' }
 *       label (optional): bold word before the text, e.g. 'Importante', 'Atenção', 'Dica'
 *       tone  (optional): 'brand' (green, default) | 'neutral' (gray) | 'reward' (purple)
 *
 * Empty texts ('') are simply not shown, so you can leave fields blank while drafting.
 */

/** A topic: plain text, or a title with an optional description and complementary note. */
export type FaqTopic =
  | string
  | {
      readonly title: string;
      readonly description?: string;
      readonly complement?: string;
    };

export interface FaqTopicList {
  readonly topics: readonly FaqTopic[];
  readonly layout?: 'cards' | 'list' | 'timeline';
  readonly itemLabel?: string;
  readonly title?: string;
  readonly columns?: 1 | 2;
  readonly marker?: 'check' | 'play' | 'dot' | 'number';
}

export interface FaqNote {
  readonly note: string;
  readonly label?: string;
  readonly tone?: 'brand' | 'neutral' | 'reward';
}

export interface FaqSmallPrint {
  readonly small: string;
}

export type FaqAnswerBlock = string | FaqTopicList | FaqNote | FaqSmallPrint;

export type FaqAnswer = string | readonly FaqAnswerBlock[];

export interface FaqItem {
  readonly question: string;
  readonly answer: FaqAnswer;
}

const items: readonly FaqItem[] = [
  {
    question: 'O que é o Advisor Experience?',
    answer:
      'O curso Advisor Experience é um curso rápido e gratuito da XP Educação, em parceria com o Academy XP para pessoas que têm interesse em entrar no mercado financeiro e querem conhecer um pouco mais sobre esse universo. Nesse curso o aluno terá acesso à 4 Webinars realizadas por especialistas do mercado.',
  },
  {
    question: 'Pra quem é o Advisor Experience (público-alvo)?',
    answer:
      'Pessoas interessadas em entrar no Mercado Financeiro e/ou assessores e consultores de investimento.',
  },
  {
    question: 'Carga horária?',
    answer: 'Os 4 webinars totalizam 4 horas de conteúdo.',
  },
  {
    question: 'Tem certificado? Com quantos % de conclusão?',
    answer:
      'Ao concluir 80% da visualização dos vídeos, o aluno recebe um certificado de conclusão emitido pela XP Educação.',
  },
  {
    question: 'Tempo de acesso ao curso?',
    answer:
      'Acesso à plataforma do preparatório por 13 dias, sendo desmatriculado depois desse prazo.',
  },
  {
    question: 'Formato do produto (híbrido, presencial, online)?',
    answer: '100% online e assíncrono',
  },
  {
    question: 'O que o curso oferece (atributos)?',
    answer: [
      'Acesso aos 4 webinars:',
      {
        topics: [
          { title: 'Playbook XP', description: '', complement: '' },
          { title: 'O Advisor do Futuro', description: '', complement: '' },
          {
            title: 'Do currículo à entrevista: como entrar no mercado financeiro',
            description: '',
            complement: '',
          },
          {
            title: 'Como vencer no início da carreira de assessor',
            description: '',
            complement: '',
          },
        ],
      },
      {
        label: 'Importante',
        note: 'Esses webinars foram gravados por especialistas na oferta da Formação Advisor 3.0.',
      },
    ],
  },
  {
    question: 'O que eu preciso para iniciar? (Pré-requisito)',
    answer: 'Não há um pré requisito.',
  },
  {
    question: 'Metodologia de ensino e aulas?',
    answer:
      'São webinars para compartilhar os aprendizados, competências e experiências que ajudam a construir carreiras de sucesso no mercado financeiro, trazendo a visão de especialistas do mercado e referências da XP.',
  },
  {
    question: 'As aulas são ao vivo (síncronas) ou gravadas (assíncronas)?',
    answer: 'Somente Assíncronas',
  },
  {
    question: 'Quais são os módulos do curso?',
    answer: [
      {
        layout: 'list',
        marker: 'play',
        topics: [
          { title: 'Playbook XP', description: '', complement: '' },
          { title: 'O Advisor do Futuro', description: '', complement: '' },
          {
            title: 'Do currículo à entrevista: como entrar no mercado financeiro',
            description: '',
            complement: '',
          },
          {
            title: 'Como vencer no início da carreira de assessor',
            description: '',
            complement: '',
          },
        ],
      },
    ],
  },
  {
    question: 'Como tirar dúvida de conteúdo? (Fórum)',
    answer: 'Não há fórum para dúvidas',
  },
];

export const faqContent = {
  heading: 'Dúvidas frequentes',
  summary: (count: number) =>
    `${count} ${count === 1 ? 'dúvida frequente' : 'dúvidas frequentes'}.`,
  items,
} as const;
