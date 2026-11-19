export const MINUTES_PER_DAY = 1440;

export function fmt(min: number): string {
  if (!Number.isFinite(min)) return '--:--';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function timeInputToMinutes(val: string): number {
  const [h, m] = val.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}
