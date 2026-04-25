export type FinanceEntryKind = 'one_time' | 'recurring' | 'manual_recurring';
export type FinanceEntryFlow = 'income' | 'expense';
export type FinanceEntryFrequency = 'monthly';
export type FinanceAgreementDetails = {
  provider: string;
  totalCashPriceCents: number;
  advancePaymentsCents: number;
  durationMonths: number;
  frequency: FinanceEntryFrequency;
  amountCents: number;
  amountOfCreditCents: number;
  interestChargesCents: number;
  acceptanceFeeCents: number;
  titleTransferFeeCents: number;
  totalChargeForCreditCents: number;
  totalAmountPayableCents: number;
  interestRatePercent: number;
};
export const FINANCE_ENTRY_CATEGORIES = [
  'finance_agreement',
  'insurance',
  'gas',
  'repair',
  'tax',
  'service',
  'mot',
  'income',
  'other',
] as const;
export type FinanceEntryCategory = (typeof FINANCE_ENTRY_CATEGORIES)[number];

export type FinanceEntryAttachment = {
  id: string;
  name: string;
  url: string;
};

/** Keys `yyyy-mm` → amount in cents */
export type FinanceManualAmounts = Record<string, number>;

export type FinanceEntryData = {
  id: number;
  assetId: number;
  userId: string;
  name: string;
  kind: FinanceEntryKind;
  flow: FinanceEntryFlow;
  amountCents: number;
  category: FinanceEntryCategory | string | null;
  color: string | null;
  manualAmounts: FinanceManualAmounts | null;
  attachments: FinanceEntryAttachment[] | null;
  effectiveDate: string | null;
  recurringFrequency: FinanceEntryFrequency | null;
  recurringStart: string | null;
  recurringEnd: string | null;
  financeAgreement?: FinanceAgreementDetails | null;
  createdAt: string;
  updatedAt: string;
};
