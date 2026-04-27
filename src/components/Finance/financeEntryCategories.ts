import type { FinanceEntryCategory, FinanceEntryData } from '@/entities';

export type FinanceCategoryKey = FinanceEntryCategory;

export type CategoryOption = {
  key: FinanceCategoryKey;
  label: string;
  defaults: {
    name: string;
    flow: FinanceEntryData['flow'];
    kind: FinanceEntryData['kind'];
    /** Suggested amount in major units (pounds) for the form; optional */
    amountHint?: number;
  };
};

const VEHICLE_OPTIONS: CategoryOption[] = [
  {
    key: 'finance_agreement',
    label: 'Finance Agreement',
    defaults: { name: 'Finance Agreement', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'insurance',
    label: 'Insurance',
    defaults: { name: 'Insurance', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'gas',
    label: 'Gas',
    defaults: { name: 'Gas', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'repair',
    label: 'Repair',
    defaults: { name: 'Repair', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'tax',
    label: 'Tax',
    defaults: { name: 'Tax', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'service',
    label: 'Service',
    defaults: { name: 'Service', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'mot',
    label: 'MOT',
    defaults: { name: 'MOT', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'other',
    label: 'Other',
    defaults: { name: 'Other', flow: 'expense', kind: 'one_time' },
  },
];

const GENERIC_OPTIONS: CategoryOption[] = [
  {
    key: 'finance_agreement',
    label: 'Finance Agreement',
    defaults: { name: 'Finance Agreement', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'insurance',
    label: 'Insurance',
    defaults: { name: 'Insurance', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'gas',
    label: 'Gas',
    defaults: { name: 'Gas', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'repair',
    label: 'Repair',
    defaults: { name: 'Repair', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'tax',
    label: 'Tax',
    defaults: { name: 'Tax', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'service',
    label: 'Service',
    defaults: { name: 'Service', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'mot',
    label: 'MOT',
    defaults: { name: 'MOT', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'other',
    label: 'Other',
    defaults: { name: 'Other', flow: 'expense', kind: 'one_time' },
  },
];

export function getCategoryOptions(assetType: string | null | undefined): CategoryOption[] {
  if (assetType === 'vehicle') {
    return VEHICLE_OPTIONS;
  }
  return GENERIC_OPTIONS;
}

const LABELS: Record<FinanceCategoryKey, string> = {
  finance_agreement: 'Finance Agreement',
  insurance: 'Insurance',
  gas: 'Gas',
  repair: 'Repair',
  tax: 'Tax',
  service: 'Service',
  mot: 'MOT',
  other: 'Other',
};

const LEGACY_CATEGORY_MAP: Record<string, FinanceCategoryKey> = {
  vehicle_finance_agreement: 'finance_agreement',
  vehicle_insurance: 'insurance',
  vehicle_gas: 'gas',
  vehicle_repair: 'repair',
  vehicle_other: 'other',
  generic_other: 'other',
};

export function normalizeCategoryKey(key: string | null | undefined): FinanceCategoryKey | undefined {
  if (!key) {
    return undefined;
  }
  if (LABELS[key as FinanceCategoryKey]) {
    return key as FinanceCategoryKey;
  }
  return LEGACY_CATEGORY_MAP[key];
}

export function categoryLabel(key: string | null | undefined): string {
  if (!key) {
    return '-';
  }
  const normalized = normalizeCategoryKey(key);
  if (normalized) {
    return LABELS[normalized];
  }
  return key;
}

export function attachmentNounForCategory(key: string | null | undefined): string {
  switch (key) {
    case 'gas':
    case 'repair':
    case 'service':
      return 'receipts';
    default:
      return 'documents';
  }
}

export function categorySemanticsForUpload(key: string | null | undefined): { attachmentNoun: string; aiHint: string } {
  const attachmentNoun = attachmentNounForCategory(key);
  return {
    attachmentNoun,
    aiHint: `Uploaded ${attachmentNoun} can be parsed to prefill finance entry details in a future AI flow.`,
  };
}
