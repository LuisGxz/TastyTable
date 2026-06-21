/** Shared display formatters for the warm UI. */

export function priceTag(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(4, level)));
}

/** "19:30" → "7:30 PM". */
export function time12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/** "YYYY-MM-DD" relative to today → { label, sub } for chips. */
export function dayLabel(date: string, lang: 'en' | 'es', today = new Date()): { label: string; sub: string } {
  const d = new Date(`${date}T00:00:00`);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  if (diff === 0) return { label: lang === 'es' ? 'Hoy' : 'Today', sub: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) };
  if (diff === 1) return { label: lang === 'es' ? 'Mañana' : 'Tomorrow', sub: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) };
  return {
    label: d.toLocaleDateString(locale, { weekday: 'short' }),
    sub: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
  };
}

/** Full date for the ticket, e.g. "Thu, Jun 25". */
export function fullDate(date: string, lang: 'en' | 'es'): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** The next `count` days as "YYYY-MM-DD" starting today. */
export function nextDays(count: number, today = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}
