/**
 * Floating WhatsApp support button (bottom-right corner, follows the scroll).
 *
 * Fill ONE of them:
 *   `url`:   the full WhatsApp link (wa.me or api.whatsapp.com), used as is.
 *   `phone`: country code + area code + number, digits only (e.g. '5511999999999');
 *            the link is built with `message` already typed.
 * Both `null` = the button is shown but not clickable ("Link em breve").
 *
 * Keep the `as string | null`: without it the linter sees the link as "always filled" and
 * fails the deploy (@typescript-eslint/no-unnecessary-condition).
 */
export const supportContent = {
  url: 'https://api.whatsapp.com/send/?phone=5531983269441&text=Quero%20tirar%20d%C3%BAvidas' as
    string | null,
  phone: null as string | null,
  /** Message already typed when the chat opens. */
  message: 'Olá! Tenho uma dúvida sobre a Advisor Experience.',
  label: 'Fale com o suporte',
  ariaLabel: 'Fale com o suporte pelo WhatsApp',
  linkPending: 'Link em breve',
} as const;

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
