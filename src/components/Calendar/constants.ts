export const EVENT_COLORS = [
  { value: 'gray', label: 'Gray', hex: '#6b7280' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
] as const;

export const COLOR_MAP: Record<string, string> = Object.fromEntries(
  EVENT_COLORS.map(c => [c.value, c.hex]),
);

export const DEFAULT_EVENT_COLOR = 'blue';
