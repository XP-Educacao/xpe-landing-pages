import { FaqSection } from '@/components/faq/FaqSection.tsx';
import { DateOverrideBanner } from '@/components/feedback/DateOverrideBanner.tsx';
import { Hero } from '@/components/layout/Hero.tsx';
import { PageShell } from '@/components/layout/PageShell.tsx';
import { SiteFooter } from '@/components/layout/SiteFooter.tsx';
import { SupportBubble } from '@/components/layout/SupportBubble.tsx';
import { NextStepSection } from '@/components/next-step/NextStepSection.tsx';
import type { Course } from '@/domain/types.ts';
import { useAppServices } from '@/hooks/useAppServices.ts';
import { useJourney } from '@/hooks/useJourney.ts';
import { useNextStepReveal } from '@/hooks/useNextStepReveal.ts';

import { JourneyContent } from './JourneyContent.tsx';

export function JourneyPage({ course }: { readonly course: Course }) {
  const { journey } = course;
  const { simulatedStart, progressRepository, clock } = useAppServices();
  const viewModel = useJourney(course);
  const nextStep = useNextStepReveal(progressRepository, journey.id, clock);

  return (
    <PageShell
      banner={
        simulatedStart && <DateOverrideBanner date={simulatedStart} timeZone={journey.timezone} />
      }
      after={
        nextStep.isRevealed && (
          <NextStepSection
            offerUrl={course.reward.cta.url}
            justRevealed={nextStep.justRevealed}
            onRevealEnd={nextStep.endReveal}
          />
        )
      }
      footer={
        <>
          <FaqSection />
          <SiteFooter />
          <SupportBubble />
        </>
      }
      hero={
        <Hero
          eyebrow={journey.eyebrow}
          title={journey.title}
          description={journey.description}
          highlights={journey.highlights}
        />
      }
    >
      <JourneyContent course={course} viewModel={viewModel} onAccessReward={nextStep.reveal} />
    </PageShell>
  );
}
