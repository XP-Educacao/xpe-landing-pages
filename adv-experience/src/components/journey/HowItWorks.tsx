import { uiText } from '@/content/ui-text.ts';

const HEADING_ID = 'how-it-works-heading';

/** "Como funciona": numbered steps that explain the journey rules, above the journey heading. */
export function HowItWorks() {
  const copy = uiText.howItWorks;

  return (
    <section aria-labelledby={HEADING_ID} className="flex flex-col gap-4 md:gap-5">
      <h2 id={HEADING_ID} className="text-xl font-bold tracking-[-0.02em] text-ink-950 md:text-2xl">
        {copy.heading}
      </h2>
      <ol className="grid gap-x-8 gap-y-6 rounded-card border border-neutral-200/70 bg-white p-6 shadow-lift sm:grid-cols-2 md:p-7 lg:grid-cols-4">
        {copy.steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700 tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="pt-0.5 text-sm leading-relaxed text-neutral-600">
              <span className="sr-only">{`Passo ${index + 1}: `}</span>
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
