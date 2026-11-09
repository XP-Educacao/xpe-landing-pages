import { Play } from 'lucide-react';

import { ANCHORS } from '@/lib/anchors.ts';

/**
 * Banner background video. To go back to the plain black banner, set it to `null`:
 *   const HERO_VIDEO_SRC: string | null = null;
 */
const HERO_VIDEO_SRC: string | null =
  'https://stream.mux.com/WTFa55YJxcdH8Ldjg67BRkxrYrskSA4aTfYoQDOOcKA/highest.mp4';

interface HeroProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly highlights: readonly string[];
}

export function Hero({ eyebrow, title, description, highlights }: HeroProps) {
  const scrollToWebinar = () => {
    const target =
      document.getElementById(ANCHORS.lessonPanel) ?? document.getElementById(ANCHORS.main);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="hero-backdrop relative isolate overflow-hidden border-b-4 border-brand-600"
    >
      {HERO_VIDEO_SRC && (
        <>
          {/* Decorative background: muted, no controls; hidden for users who prefer reduced motion. */}
          <video
            aria-hidden="true"
            tabIndex={-1}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="pointer-events-none absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          {/* Keeps the text readable over any frame (stronger on the left, where the copy sits). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/90 via-ink-950/75 to-ink-950/45"
          />
        </>
      )}
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6 md:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase">
            {eyebrow}
          </p>
        )}
        <h1
          id="hero-title"
          className="mt-3 max-w-3xl text-[2rem] leading-[1.1] font-bold tracking-[-0.025em] text-balance text-white sm:text-4xl md:text-5xl"
        >
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-neutral-300 md:text-lg">
            {description}
          </p>
        )}

        {highlights.length > 0 && (
          <ul className="mt-6 flex max-w-3xl flex-wrap gap-2">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="w-fit rounded-2xl border border-neutral-700 bg-transparent px-4 py-2 text-center text-sm font-semibold text-white transition-colors duration-200 hover:border-brand-700 hover:bg-brand-700 hover:text-white"
              >
                {highlight}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={scrollToWebinar}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-950 shadow-soft transition-transform duration-200 ease-out hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:hover:scale-100"
        >
          <Play aria-hidden="true" className="size-4" />
          Assistir aos webinars
        </button>
      </div>
    </section>
  );
}
