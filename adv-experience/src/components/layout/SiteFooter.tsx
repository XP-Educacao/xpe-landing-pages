import logoXpAcademy from '@/assets/logos/logo-xp-academy.png';
import logoXpEducacao from '@/assets/logos/logo-xp-educacao.png';
import { uiText } from '@/content/ui-text.ts';

/**
 * Page footer. Dark like the hero: both logo files are white on transparent (made for dark
 * backgrounds), so they keep their original colors here.
 */
export function SiteFooter() {
  const copy = uiText.footer;
  return (
    <footer className="border-t-4 border-brand-600 bg-ink-950">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <img
          src={logoXpEducacao}
          alt={copy.xpEducacao}
          width={234}
          height={68}
          className="h-8 w-auto self-start sm:self-auto"
        />
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-400">
          <span>{copy.partnership}</span>
          {/* The file has transparent margins around the mark: the crop keeps it aligned. */}
          <img
            src={logoXpAcademy}
            alt={copy.xpAcademy}
            width={816}
            height={460}
            className="-my-3 h-14 w-auto"
          />
        </p>
      </div>
    </footer>
  );
}
