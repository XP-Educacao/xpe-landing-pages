// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Reward } from '@/domain/types.ts';

import { RewardCard } from './RewardCard.tsx';

afterEach(cleanup);

const reward: Reward = {
  enabled: true,
  unlockWhen: 'all_watched',
  title: 'Surpresa desbloqueada!',
  description: 'Seu próximo passo está aqui.',
  cta: { label: 'Acessar a surpresa', url: null, pendingLabel: 'Acessar a surpresa' },
  announce: 'Surpresa desbloqueada.',
  overlayNote: 'Uma surpresa foi desbloqueada.',
  teaser: null,
  progress: null,
};

function renderCard(isUnlocked: boolean, remaining = 0) {
  const onAccess = vi.fn();
  render(
    <RewardCard
      reward={reward}
      isUnlocked={isUnlocked}
      remaining={remaining}
      isRevealing={false}
      onRevealEnd={vi.fn()}
      onAccess={onAccess}
    />,
  );
  return { onAccess };
}

describe('<RewardCard />', () => {
  it('locked: shows how many webinars are missing and no access button', () => {
    renderCard(false, 2);
    expect(screen.getByText(/Faltam 2 webinars/)).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('unlocked: the button opens the "Seu próximo passo" area', () => {
    const { onAccess } = renderCard(true);
    fireEvent.click(screen.getByRole('button', { name: reward.cta.label }));
    expect(onAccess).toHaveBeenCalledOnce();
  });
});
