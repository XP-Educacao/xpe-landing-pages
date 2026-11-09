/**
 * Floating WhatsApp support button (bottom-right corner, follows the scroll).
 *
 * `phone`: country code + area code + number, digits only (e.g. '5511999999999').
 * `null` = the button is shown but not clickable ("Link em breve").
 */
export const supportContent = {
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
