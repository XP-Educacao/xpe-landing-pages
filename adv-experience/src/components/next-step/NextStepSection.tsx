import { ArrowRight, ExternalLink } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';

import { nextStepContent as content } from '@/content/next-step.ts';
import { uiText } from '@/content/ui-text.ts';
import { ANCHORS } from '@/lib/anchors.ts';
import { cn } from '@/lib/cn.ts';

const TITLE_ID = `${ANCHORS.nextStep}-titulo`;

const BUTTON_BASE =
  'inline-flex min-h-12 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-200 ease-out';

interface NextStepSectionProps {
  /** Offer page (`reward.cta.url`); `null` = buttons shown as "Link em breve". */
  readonly offerUrl: string | null;
  /** Just opened by a click: scroll to it and play the entrance. */
  readonly justRevealed: boolean;
  readonly onRevealEnd: () => void;
}

/** External link, or a non-clickable "em breve" button while the URL is empty. */
function ExternalButton({
  url,
  className,
  children,
}: {
  readonly url: string | null;
  readonly className: string;
  readonly children: ReactNode;
}) {
  if (!url) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title={content.linkPending}
        className={cn(className, 'cursor-not-allowed opacity-60')}
      >
        {children}
      </span>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {uiText.materials.opensInNewTab}</span>
    </a>
  );
}

/** "Seu próximo passo · Formação Advisor 3.0": full-width dark area below the lesson panel. */
export function NextStepSection({ offerUrl, justRevealed, onRevealEnd }: NextStepSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!justRevealed) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'start',
    });
    // Keyboard and screen-reader users land on the new content too.
    titleRef.current?.focus({ preventScroll: true });
  }, [justRevealed]);

  return (
    <section
      ref={sectionRef}
      id={ANCHORS.nextStep}
      aria-labelledby={TITLE_ID}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onRevealEnd();
      }}
      className={cn('scroll-mt-4 bg-ink-950 text-white', justRevealed && 'next-step-in')}
    >
      <div className="mx-auto max-w-page px-4 py-14 sm:px-6 md:py-20">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase">
          {content.eyebrow}
        </p>
        <h2
          ref={titleRef}
          id={TITLE_ID}
          tabIndex={-1}
          className="mt-3 text-[2rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance outline-none sm:text-4xl md:text-[2.75rem]"
        >
          {content.title}
        </h2>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center md:gap-12">
          <p className="max-w-2xl text-base leading-relaxed text-pretty text-neutral-300 md:text-lg">
            {content.description}
          </p>
          <div className="flex flex-col gap-3">
            <ExternalButton
              url={offerUrl}
              className={cn(
                BUTTON_BASE,
                'justify-between bg-brand-700 text-white shadow-soft hover:bg-brand-800',
              )}
            >
              {content.primaryCta}
              <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </ExternalButton>
            <ExternalButton
              url={content.secondaryCta.url}
              className={cn(
                BUTTON_BASE,
                'justify-center border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5',
              )}
            >
              {content.secondaryCta.label}
            </ExternalButton>
          </div>
        </div>

        {/* gap-px over a light background draws the thin dividers between the cells. */}
        <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {content.stats.map((stat) => (
            <div key={stat.value} className="flex flex-col-reverse gap-2 bg-ink-950 p-5 md:p-6">
              <dt className="text-sm leading-relaxed text-neutral-300">{stat.label}</dt>
              <dd className="text-3xl font-bold tracking-[-0.02em] text-brand-300 md:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-12 text-xl font-bold tracking-[-0.02em] md:text-2xl">
          {content.includedHeading}
        </h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.included.map((item) => (
            <li
              key={item.title}
              className="rounded-tile border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 ease-out hover:border-white/20"
            >
              <h4 className="text-[15px] font-semibold tracking-[-0.01em]">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col gap-5 rounded-card bg-brand-700 p-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-lg font-bold tracking-[-0.01em] text-balance md:text-xl">
              {content.offer.title}
            </p>
            <p className="mt-1 text-sm text-white/90">{content.offer.description}</p>
          </div>
          <ExternalButton
            url={offerUrl}
            className={cn(
              BUTTON_BASE,
              'shrink-0 justify-center self-start bg-white text-ink-950 hover:bg-neutral-100 md:self-auto',
            )}
          >
            {content.offer.cta}
            <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
          </ExternalButton>
        </div>
      </div>
    </section>
  );
}
