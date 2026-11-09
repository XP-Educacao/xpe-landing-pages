import { Check, CircleCheck } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button.tsx';
import { uiText } from '@/content/ui-text.ts';
import { cn } from '@/lib/cn.ts';

/** Initial: light gray → hover: light green. Watched: strong brand green. */
const TOGGLE_CLASS = {
  idle: 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200',
  watched: 'bg-brand-700 text-white shadow-soft ring-1 ring-brand-700 hover:bg-brand-800',
} as const;

interface LessonCompletionProps {
  readonly isCompleted: boolean;
  readonly completionThreshold: number;
  /** `features.allowManualComplete`: shows the "Marcar como assistido" toggle. */
  readonly allowManualComplete: boolean;
  readonly onChange: (completed: boolean) => void;
}

/**
 * Completion status + manual toggle. Marking counts exactly like watching the video (it feeds
 * the progress bar and the "Próximo passo" counter); clicking the green button undoes it.
 */
export function LessonCompletion({
  isCompleted,
  completionThreshold,
  allowManualComplete,
  onChange,
}: LessonCompletionProps) {
  const copy = uiText.completion;
  // Celebrates only a click made now (not lessons that load already watched).
  const [justMarked, setJustMarked] = useState(false);

  const toggle = () => {
    setJustMarked(!isCompleted);
    onChange(!isCompleted);
  };

  return (
    <div className="flex flex-col gap-3 rounded-tile bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-600">{copy.hint(Math.round(completionThreshold * 100))}</p>
      {allowManualComplete ? (
        <Button
          aria-pressed={isCompleted}
          aria-label={copy.markAsWatched}
          title={isCompleted ? copy.unmarkHint : undefined}
          onClick={toggle}
          className={cn(
            'relative self-start sm:self-auto',
            isCompleted ? TOGGLE_CLASS.watched : TOGGLE_CLASS.idle,
            isCompleted && justMarked && 'completion-pulse',
          )}
        >
          {isCompleted ? (
            <CircleCheck aria-hidden="true" className={cn(justMarked && 'check-pop')} />
          ) : (
            <Check aria-hidden="true" />
          )}
          {isCompleted ? copy.watched : copy.markAsWatched}
        </Button>
      ) : (
        isCompleted && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            <CircleCheck aria-hidden="true" className="size-4" />
            {copy.watched}
          </span>
        )
      )}
    </div>
  );
}
