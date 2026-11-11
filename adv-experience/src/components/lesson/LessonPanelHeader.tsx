import { Badge } from '@/components/ui/badge.tsx';
import { uiText } from '@/content/ui-text.ts';
import type { Lesson } from '@/domain/types.ts';

interface LessonPanelHeaderProps {
  readonly lesson: Lesson;
  readonly titleId: string;
  readonly isCompleted: boolean;
}

export function LessonPanelHeader({ lesson, titleId, isCompleted }: LessonPanelHeaderProps) {
  const copy = uiText.lessonPanel;

  return (
    <header>
      <Badge size="sm">{copy.tag(lesson.number, isCompleted)}</Badge>
      <h2
        id={titleId}
        className="mt-4 text-2xl leading-tight font-bold tracking-[-0.025em] text-balance text-ink-950 md:text-[2rem]"
      >
        {lesson.title}
      </h2>
      {lesson.subtitle && (
        <p className="mt-2 text-base text-pretty text-neutral-600">{lesson.subtitle}</p>
      )}
    </header>
  );
}
