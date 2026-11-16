/**
 * Datas: tudo sai de exam.date (ISO, 'AAAA-MM-DD'), calculado em UTC com Intl pt-BR.
 * Usar UTC evita o erro clássico de "um dia a menos" por causa do fuso horário.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Devolve um Date (meio-dia UTC) ou null se a data não existir (ex.: 2026-02-30). */
export function parseIsoDate(iso) {
  const match = typeof iso === 'string' ? iso.match(ISO_DATE) : null;
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const sameDay =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return sameDay ? date : null;
}

function format(date, options) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...options }).format(date);
}

const capitalize = (text) => text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);

/** Confere se o Node tem os dados de idioma pt-BR (sem eles, "dezembro" viraria "December"). */
export function intlProblem() {
  const sample = format(new Date(Date.UTC(2026, 11, 16, 12)), { month: 'long' });
  return sample === 'dezembro'
    ? null
    : `O Node instalado não formata datas em português (veio "${sample}"). Instale o Node oficial de https://nodejs.org (versão LTS).`;
}

/** Todos os formatos usados na página, a partir da data ISO. */
export function deriveDate(iso) {
  const date = parseIsoDate(iso);
  if (!date) throw new Error(`Data inválida: "${iso}"`);
  return {
    iso,
    dateShort: format(date, { day: '2-digit', month: '2-digit', year: 'numeric' }), // 16/12/2026
    dateLong: format(date, { day: 'numeric', month: 'long', year: 'numeric' }), // 16 de dezembro de 2026
    weekday: capitalize(format(date, { weekday: 'long' })), // Quarta-feira
    day: format(date, { day: 'numeric' }), // 16
    monthYearUpper: `${format(date, { month: 'long' })} ${format(date, { year: 'numeric' })}`.toLocaleUpperCase(
      'pt-BR',
    ), // DEZEMBRO 2026
  };
}

/** Data de hoje (fuso de São Paulo) em ISO, para avisar quando o exame já passou. */
export function todayIso(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}
