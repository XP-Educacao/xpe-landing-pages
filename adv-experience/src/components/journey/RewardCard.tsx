import { ArrowDown, Gift, Lock } from 'lucide-react';

import { uiText } from '@/content/ui-text.ts';
import type { Reward } from '@/domain/types.ts';
import { cn } from '@/lib/cn.ts';

const CTA_CLASS =
  'relative flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-center text-xs font-semibold';

interface RewardCardProps {
  readonly reward: Reward;
  /** `false` → the "Próximo passo" teaser with the remaining-lessons counter. */
  readonly isUnlocked: boolean;
  readonly remaining: number;
  readonly isRevealing: boolean;
  readonly onRevealEnd: () => void;
  /** Opens the "Seu próximo passo" area below the lesson panel. */
  readonly onAccess: () => void;
}

/**
 * 6th card of the journey. Same structure, height and radius as the lesson cards, but it is NOT
 * a lesson: not selectable, outside the progress. Locked: "Próximo passo" + counter; unlocked:
 * the reward ("Desconto desbloqueado!").
 */
export function RewardCard({
  reward,
  isUnlocked,
  remaining,
  isRevealing,
  onRevealEnd,
  onAccess,
}: RewardCardProps) {
  if (!isUnlocked) return <NextStepCard remaining={remaining} />;

  const { cta } = reward;
  return (
    <article
      data-reward-card=""
      onAnimationEnd={(event) => {
        if (event.animationName === 'card-glow' || event.animationName === 'reward-fade') {
          onRevealEnd();
        }
      }}
      className={cn(
        'relative flex h-full w-full flex-col rounded-card border-2 border-reward-500 bg-linear-160 from-reward-50 to-reward-100 p-4 text-left',
        isRevealing && 'reward-reveal',
      )}
    >
      <span className="grid size-9 place-items-center rounded-full bg-white text-reward-600">
        <Gift aria-hidden="true" className="size-[18px]" />
      </span>
      <h3 className="mt-4 text-[15px] leading-snug font-bold tracking-[-0.01em] text-reward-700">
        {reward.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-reward-ink">{reward.description}</p>
      <span className="mt-auto block w-full pt-4">
        <button
          type="button"
          onClick={onAccess}
          className={cn(
            CTA_CLASS,
            'bg-reward-600 text-white transition-colors duration-200 ease-out hover:bg-reward-700',
          )}
        >
          {cta.label}
          <ArrowDown aria-hidden="true" className="size-3 shrink-0" />
        </button>
      </span>
    </article>
  );
}

/** Locked 6th card: same anatomy as a locked lesson card, with the purple "next step" accent. */
function NextStepCard({ remaining }: { readonly remaining: number }) {
  const copy = uiText.nextStepCard;
  return (
    <article
      data-reward-card=""
      data-status="locked"
      className="flex h-full w-full flex-col rounded-card border-2 border-dashed border-reward-500/50 bg-white/60 p-4 text-left"
    >
      <span className="grid size-9 place-items-center rounded-full bg-reward-50 text-reward-600">
        <Lock aria-hidden="true" className="size-[18px]" />
      </span>
      <span className="mt-4 text-[11px] font-semibold tracking-[0.08em] text-reward-600 uppercase">
        {copy.eyebrow}
      </span>
      <h3 className="mt-1 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-ink-950">
        {copy.title}
      </h3>
      <p className="mt-1.5 text-xs text-neutral-600">{copy.remaining(remaining)}</p>
      <span className="mt-auto block w-full pt-4">
        <span className={cn(CTA_CLASS, 'bg-neutral-100 text-neutral-600')}>
          <Lock aria-hidden="true" className="size-3" />
          {copy.locked}
        </span>
      </span>
    </article>
  );
}
