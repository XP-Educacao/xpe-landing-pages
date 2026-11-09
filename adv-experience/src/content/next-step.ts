/**
 * "Seu próximo passo" area (Formação Advisor 3.0), shown after the learner clicks the purple
 * card's button. Edit the texts and links here.
 *
 * The offer buttons ("Quero minha condição especial" and "Ver detalhes da oferta") use the
 * reward link in course.json (`reward.cta.url`).
 */
export const nextStepContent = {
  eyebrow: 'Seu próximo passo',
  title: 'Formação Advisor 3.0',
  description:
    'Uma formação da XP Educação em parceria com o Academy XP que prepara você para atuar na ' +
    'assessoria de investimentos, com preparatórios para as certificações ANBIMA, mentorias, ' +
    'ferramentas práticas e imersão presencial na XP.',
  primaryCta: 'Quero minha condição especial',
  secondaryCta: {
    label: 'Saiba mais sobre a formação',
    /** Paste the course page link here. `null` = button shown as "em breve" (not clickable). */
    url: null as string | null,
  },
  stats: [
    { value: '143h', label: 'de preparatórios para as certificações CPA, CProR e CProI' },
    { value: '3 dias', label: 'completos de imersão presencial na XP' },
    { value: '12 meses', label: 'de acesso à plataforma dos preparatórios' },
    {
      value: 'Híbrido',
      label: 'imersão presencial combinada com preparatórios, mentorias e ferramentas on-line',
    },
  ],
  includedHeading: 'O que está incluído',
  included: [
    {
      title: 'Preparatórios ANBIMA',
      description:
        'Videoaulas gravadas, exercícios e simulados aderentes para CPA, CProR e CProI, com ' +
        'apoio de tutor e aulas ao vivo mensais.',
    },
    {
      title: 'Imersão presencial na XP',
      description:
        'Três dias completos de atividades presenciais, com certificado físico entregue no ' +
        'último dia.',
    },
    {
      title: 'Mentoria Aplicada',
      description:
        'Encontros on-line ao vivo, em grupo, com profissionais de referência sobre rotina, ' +
        'plano de carreira e posicionamento.',
    },
    {
      title: 'Sparring',
      description:
        'Ferramenta de treinamento comercial, liberada na imersão e mantida depois para ' +
        'aprofundar o treino.',
    },
    {
      title: 'Plano Comercial',
      description:
        'Planilha orientativa para construir seu plano comercial, com acompanhamento do ' +
        'concierge do produto após a imersão.',
    },
    {
      title: 'Expansão',
      description:
        'Conexão com as oportunidades de trabalho da XP, uma ponte entre a formação e a ' +
        'empregabilidade na XP Inc.',
    },
  ],
  offer: {
    title: 'Condição exclusiva para quem participa da Advisor Experience',
    description: 'Confira os detalhes e as condições da oferta na página exclusiva.',
    cta: 'Ver detalhes da oferta',
  },
  /** Shown on a button whose link is still empty. */
  linkPending: 'Link em breve',
} as const;
