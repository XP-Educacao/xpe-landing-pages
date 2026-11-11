import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

import { faqContent as content } from '@/content/faq.ts';
import { cn } from '@/lib/cn.ts';

import { FaqAnswer } from './FaqAnswer.tsx';

/** "Dúvidas frequentes": accordion; each question opens and closes on its own. */
export function FaqSection() {
  const baseId = useId();
  const titleId = `${baseId}-titulo`;
  const [openIndexes, setOpenIndexes] = useState<ReadonlySet<number>>(() => new Set());

  const toggle = (index: number) => {
    setOpenIndexes((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section
      aria-labelledby={titleId}
      className="mx-auto w-full max-w-3xl px-4 pt-10 pb-14 sm:px-6 md:pt-14 md:pb-20"
    >
      <h2
        id={titleId}
        className="text-2xl font-bold tracking-[-0.02em] text-ink-950 md:text-[1.75rem]"
      >
        {content.heading}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 md:text-base">
        {content.summary(content.items.length)}
      </p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {content.items.map((item, index) => {
          const isOpen = openIndexes.has(index);
          const buttonId = `${baseId}-pergunta-${index}`;
          const panelId = `${baseId}-resposta-${index}`;
          return (
            <li
              // Index too: two questions with the same text must not collide while drafting.
              key={`${index}-${item.question}`}
              className={cn(
                'rounded-tile border bg-white transition-[border-color,box-shadow] duration-200 ease-out',
                isOpen
                  ? 'border-neutral-300 shadow-soft'
                  : 'border-neutral-200 hover:border-neutral-300',
              )}
            >
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="group flex w-full items-center justify-between gap-4 rounded-tile px-4 py-4 text-left sm:px-5"
                >
                  <span className="text-[15px] leading-snug font-semibold text-ink-950 md:text-base">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-200 ease-out',
                      isOpen
                        ? 'rotate-180 bg-brand-50 text-brand-700'
                        : 'bg-neutral-100 text-neutral-600 group-hover:bg-brand-50 group-hover:text-brand-700',
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </button>
              </h3>
              {/* 0fr → 1fr rows: smooth height animation without measuring the answer. */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-200 ease-out starting:grid-rows-[0fr]"
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <FaqAnswer answer={item.answer} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
