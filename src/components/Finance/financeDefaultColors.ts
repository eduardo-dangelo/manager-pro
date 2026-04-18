import type { FinanceEntryFlow } from '@/entities';

/** Distinct hues for charts when `color` is not set on the entry. */
export function getDefaultFinanceColor(flow: FinanceEntryFlow, index: number): string {
  if (flow === 'expense') {
    const l = 32 + (index % 7) * 6;
    const s = 72 - (index % 3) * 8;
    return `hsl(0 ${s}% ${l}%)`;
  }
  const l = 30 + (index % 7) * 6;
  const s = 55 - (index % 3) * 6;
  return `hsl(136 ${s}% ${l}%)`;
}
