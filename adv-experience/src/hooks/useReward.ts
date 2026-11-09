import { useCallback, useState } from 'react';

import { countRemainingForReward, isRewardUnlocked } from '@/domain/reward.ts';
import type { LessonStatus, Reward } from '@/domain/types.ts';

export interface RewardView {
  /** The 6th card ("Próximo passo") and the purple bar segment exist (always, while enabled). */
  readonly isEnabled: boolean;
  /** Condition met: the card shows the reward instead of the locked "Próximo passo". */
  readonly isUnlocked: boolean;
  /** Lessons still missing to unlock it (drives the "Faltam N webinars" counter). */
  readonly remaining: number;
  /** Entrance animation running (only on a false → true transition during the visit). */
  readonly isRevealing: boolean;
  /** Revealed during this visit (drives the one-off screen-reader announcement). */
  readonly wasRevealed: boolean;
  readonly endReveal: () => void;
}

/**
 * Reward card state, DERIVED from the lesson statuses (nothing is persisted).
 * Loading the page with the condition already true shows the card ready, without animation.
 */
export function useReward(statuses: readonly LessonStatus[], reward: Reward): RewardView {
  const isUnlocked = isRewardUnlocked(statuses, reward.unlockWhen, reward.enabled);
  const [previousUnlocked, setPreviousUnlocked] = useState(isUnlocked);
  const [isRevealing, setIsRevealing] = useState(false);
  const [wasRevealed, setWasRevealed] = useState(false);

  // Transition detected during render (React's pattern for state derived from new props).
  if (isUnlocked !== previousUnlocked) {
    setPreviousUnlocked(isUnlocked);
    setIsRevealing(isUnlocked);
    setWasRevealed(isUnlocked);
  }

  const endReveal = useCallback(() => {
    setIsRevealing(false);
  }, []);

  return {
    isEnabled: reward.enabled,
    isUnlocked,
    remaining: countRemainingForReward(statuses, reward.unlockWhen),
    isRevealing,
    wasRevealed,
    endReveal,
  };
}
