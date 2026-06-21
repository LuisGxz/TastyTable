/** Generate a human-facing reservation code like TT-48217-PDX. */
export function generateReservationCode(cityTag = 'PDX'): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `TT-${n}-${cityTag}`;
}
