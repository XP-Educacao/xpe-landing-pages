/**
 * "Dúvidas frequentes" — always at the end of the page. Edit the questions and answers here;
 * the counter under the heading follows the number of items.
 */
export const faqContent = {
  heading: 'Dúvidas frequentes',
  summary: (count: number) =>
    `${count} ${count === 1 ? 'dúvida frequente' : 'dúvidas frequentes'}.`,
  items: [
    {
      question: 'Por quanto tempo tenho acesso aos conteúdos?',
      answer:
        'Seu acesso gratuito vale por 13 dias. Depois disso, os conteúdos deixam de ficar disponíveis.',
    },
    {
      question: 'Quando posso assistir aos webinars?',
      answer:
        'Os quatro webinars já estão liberados. Assista quando e onde quiser, na ordem que preferir e no seu ritmo.',
    },
    {
      question: 'O que acontece quando concluo os quatro webinars?',
      answer:
        'Você desbloqueia uma condição especial para a Formação Advisor 3.0. É só clicar no card roxo, no fim da trilha, para conhecer a formação e os detalhes da oferta.',
    },
    {
      question: 'Preciso de algum pré-requisito para a Formação Advisor 3.0?',
      // TODO: replace with the official answer.
      answer: 'Resposta em breve.',
    },
    {
      question: 'A Formação Advisor 3.0 oferece certificado?',
      answer:
        'Sim. Ao concluir 80% da trilha dos preparatórios, você recebe um certificado de conclusão emitido pela XP Educação, além do certificado físico entregue no último dia da imersão presencial.',
    },
  ],
} as const;
