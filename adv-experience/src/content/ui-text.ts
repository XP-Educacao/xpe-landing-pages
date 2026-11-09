/**
 * Fixed interface copy (buttons, labels, empty states, accessibility texts) in pt-BR.
 *
 * Course content (titles, dates, links, videos) lives in `course.json`. This file holds the
 * texts that are the same for every lesson, so components never hardcode copy.
 */
import type { LessonButtonLabel } from '../domain/lesson-button-label.ts';
import type { UnlockTrigger, VideoProvider } from '../domain/types.ts';

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

const lessonLabel = (number: number) => `Aula ${number}`;

export const uiText = {
  page: {
    skipToContent: 'Pular para o conteúdo principal',
    loading: 'Carregando sua jornada…',
  },

  howItWorks: {
    heading: 'Como funciona',
    steps: [
      'Os quatro webinars já estão liberados. Escolha por onde começar e assista no seu ritmo.',
      'Cada webinar assistido avança a sua jornada. Acompanhe o progresso no topo da trilha.',
      'Ao concluir os quatro, você desbloqueia uma condição especial para a Formação Advisor 3.0.',
      'Seu acesso gratuito vale por 13 dias. Depois disso, os conteúdos deixam de ficar disponíveis.',
    ],
  },

  journey: {
    heading: 'Sua jornada começa aqui',
    subheading: {
      play: 'Selecione um webinar para assistir. Ao concluir os quatro, seu próximo passo é desbloqueado.',
      watched:
        'Assista a uma aula até o fim para habilitar a seguinte. Depois, clique em “Liberar aula”.',
    } satisfies Record<UnlockTrigger, string>,
    progressLabel: 'Progresso da jornada',
    lessonListLabel: 'Aulas da jornada',
    progressSummary: (completed: number, total: number) =>
      `${completed} de ${total} ${plural(total, 'webinar assistido', 'webinars assistidos')}`,
    progressValueText: (released: number, total: number, completed: number) =>
      `${completed} de ${total} ${plural(total, 'webinar assistido', 'webinars assistidos')}; ` +
      `${released} ${plural(released, 'disponível', 'disponíveis')}.`,
    legend: {
      completed: 'Assistido',
      available: 'Disponível',
      locked: 'Bloqueada',
      nextStep: 'Próximo passo',
    },
  },

  /** 6th card while the reward is still locked ("Próximo passo"). */
  nextStepCard: {
    eyebrow: 'Próximo passo',
    title: 'Uma surpresa espera por você no final',
    remaining: (count: number) =>
      `${plural(count, 'Falta', 'Faltam')} ${count} ${plural(count, 'webinar', 'webinars')} ` +
      'para desbloquear o seu próximo passo.',
    locked: 'Bloqueado',
  },

  lessonCard: {
    lessonLabel: (number: number) => `Webinar ${number}`,
    releaseOn: (date: string) => `Liberação: ${date}`,
    awaitingEnrollment: 'Liberação conforme a data da sua inscrição',
    awaitingPreviousLesson: 'Desbloqueie a aula anterior',
    awaitingPublication: 'Disponível em breve',
    awaitingTrigger: {
      play: 'Dê play na aula anterior',
      watched: 'Conclua a aula anterior',
    } satisfies Record<UnlockTrigger, string>,
    readyHint: 'Pronta para liberar',
    availableHint: 'Disponível para assistir',
    inProgressHint: 'Assistindo agora',
    completedHint: 'Webinar assistido',
    badge: {
      locked: 'Bloqueado',
      ready: 'Liberar aula',
      unlocked: 'Assistir webinar',
      viewing: 'Visualizando',
      completed: 'Rever webinar',
    } satisfies Record<LessonButtonLabel, string>,
  },

  unlock: {
    title: (number: number | null) =>
      number === null ? 'Aula liberada!' : `${lessonLabel(number)} liberada!`,
    chip: (released: number, total: number) =>
      `${released} de ${total} ${plural(total, 'aula liberada', 'aulas liberadas')}`,
    announce: (number: number | null) =>
      number === null ? 'Aula liberada' : `${lessonLabel(number)} liberada`,
    completedAnnounce: (number: number | null) =>
      number === null ? 'Aula concluída' : `${lessonLabel(number)} concluída`,
  },

  lessonPanel: {
    tag: (number: number | null, isCompleted: boolean) => {
      const status = isCompleted ? 'Concluída' : 'Conteúdo liberado';
      return number === null ? status : `Webinar ${number} · ${status}`;
    },
    expandAll: 'Expandir tudo',
    collapseAll: 'Recolher tudo',
    sections: {
      video: 'Videoaula',
      materials: 'Materiais de apoio ao aluno',
    },
    emptyState: {
      title: 'Sua jornada começa em breve',
      firstReleaseOn: (date: string) => `A primeira aula será liberada em ${date}.`,
      awaitingEnrollment: 'As aulas serão liberadas de acordo com a data da sua inscrição.',
      awaitingPublication: 'As aulas serão publicadas em breve. Volte para conferir.',
    },
  },

  video: {
    play: (title: string) => `Reproduzir o vídeo: ${title}`,
    releasedBadge: (number: number | null) =>
      number === null ? 'Liberada' : `${lessonLabel(number)} • Liberada`,
    iframeTitle: (title: string) => `Vídeo da aula: ${title}`,
    comingSoonTitle: 'Videoaula em breve',
    comingSoonDescription: 'O vídeo desta aula será publicado aqui assim que estiver disponível.',
    expand: 'Modo expandido',
    shrink: 'Largura padrão',
    minimize: 'Minimizar',
    restore: 'Restaurar',
    close: 'Fechar vídeo',
    miniPlayerRegion: (title: string) => `Mini-player: ${title}`,
    resizeMiniPlayer: (edge: string) => `Redimensionar mini-player pela alça ${edge}`,
    miniPlayerPlaceholder: 'O vídeo continua tocando no mini-player.',
    errorTitle: 'Não foi possível reproduzir o vídeo aqui.',
    errorDescription: 'Você pode assistir diretamente no site do provedor.',
    watchOn: {
      youtube: 'Assistir no YouTube',
      vimeo: 'Assistir no Vimeo',
      mp4: 'Abrir o arquivo de vídeo',
      spalla: 'Assistir na Spalla',
    } satisfies Record<VideoProvider, string>,
    captionsLabel: 'Português',
  },

  completion: {
    hint: (thresholdPct: number) =>
      `O webinar é marcado como assistido automaticamente ao atingir ${thresholdPct}% do vídeo.`,
    markAsWatched: 'Marcar como assistido',
    watched: 'Assistido',
    /** Tooltip on the green button: it is a toggle, a click undoes it. */
    unmarkHint: 'Clique para desmarcar',
  },

  carousel: {
    regionLabel: 'Aulas e desconto da jornada',
    roleDescription: 'carrossel',
    prev: 'Ver cards anteriores',
    next: 'Ver próximos cards',
    hintTouch: 'Deslize ou use as setas para explorar a jornada',
    position: (from: number, to: number, total: number) =>
      `Mostrando ${from} a ${to} de ${total} cards`,
  },

  materials: {
    comingSoon: 'Em breve',
    opensInNewTab: '(abre em nova aba)',
    visited: 'Material acessado',
    empty: 'Os materiais desta aula serão publicados em breve.',
  },

  footer: {
    xpEducacao: 'XP Educação',
    partnership: 'Advisor Experience · em parceria com o',
    xpAcademy: 'Academy XP',
  },

  dateOverride: {
    message: (date: string) => `Simulação de data ativa: a página considera ${date}.`,
    hint: 'Remova o parâmetro ?today= do endereço para voltar à data real.',
  },

  errors: {
    contentTitle: 'Não foi possível carregar o conteúdo da jornada',
    contentDescription:
      'Encontramos um problema no arquivo de conteúdo (course.json). Corrija os itens abaixo e recarregue a página.',
    contentDetails: 'Itens a corrigir',
    accessTitle: 'Não foi possível verificar o seu acesso',
    accessDescription: 'Verifique sua conexão e tente novamente em alguns instantes.',
    unexpectedTitle: 'Algo não saiu como esperado',
    unexpectedDescription:
      'Recarregue a página. Se o problema continuar, avise a equipe de suporte.',
    retry: 'Tentar novamente',
    reload: 'Recarregar página',
  },
} as const;
