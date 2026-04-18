import type { FinanceEntryData } from '@/entities';

export type FinanceCategoryKey
  = | 'vehicle_finance_agreement'
    | 'vehicle_insurance'
    | 'vehicle_gas'
    | 'vehicle_repair'
    | 'vehicle_other'
    | 'generic_other';

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
    key: 'vehicle_finance_agreement',
    label: 'Finance agreement',
    defaults: { name: 'Finance agreement', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'vehicle_insurance',
    label: 'Insurance',
    defaults: { name: 'Insurance', flow: 'expense', kind: 'recurring' },
  },
  {
    key: 'vehicle_gas',
    label: 'Gas',
    defaults: { name: 'Gas', flow: 'expense', kind: 'manual_recurring' },
  },
  {
    key: 'vehicle_repair',
    label: 'Repair',
    defaults: { name: 'Repair', flow: 'expense', kind: 'one_time' },
  },
  {
    key: 'vehicle_other',
    label: 'Other',
    defaults: { name: 'Other', flow: 'expense', kind: 'one_time' },
  },
];

const GENERIC_OPTIONS: CategoryOption[] = [
  {
    key: 'generic_other',
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
  vehicle_finance_agreement: 'Finance agreement',
  vehicle_insurance: 'Insurance',
  vehicle_gas: 'Gas',
  vehicle_repair: 'Repair',
  vehicle_other: 'Other',
  generic_other: 'Other',
};

export function categoryLabel(key: string | null | undefined): string {
  if (!key) {
    return '-';
  }
  return LABELS[key as FinanceCategoryKey] ?? key;
}
