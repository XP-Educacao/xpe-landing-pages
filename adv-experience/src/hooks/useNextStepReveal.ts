import { useCallback, useState } from 'react';

import type { Clock } from '@/services/clock.ts';
import type { ProgressRepository } from '@/services/progress/ProgressRepository.ts';

/**
 * "Seu próximo passo" area. Hidden until the learner clicks the purple card's button; from then
 * on it stays visible for good (saved with the progress), even if a webinar is unmarked later.
 */
export function useNextStepReveal(repository: ProgressRepository, journeyId: string, clock: Clock) {
  const [isRevealed, setIsRevealed] = useState(
    () => repository.loadNextStepRevealedAt(journeyId) !== null,
  );
  // Entrance animation + scroll only for a click made now (not when it loads already open).
  const [justRevealed, setJustRevealed] = useState(false);

  const reveal = useCallback(() => {
    if (!isRevealed) {
      repository.saveNextStepRevealedAt(journeyId, clock.now().toISOString());
      setIsRevealed(true);
    }
    setJustRevealed(true);
  }, [isRevealed, repository, journeyId, clock]);

  const endReveal = useCallback(() => {
    setJustRevealed(false);
  }, []);

  return { isRevealed, justRevealed, reveal, endReveal };
}
