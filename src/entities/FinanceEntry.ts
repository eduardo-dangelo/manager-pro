export type FinanceEntryKind = 'one_time' | 'recurring' | 'manual_recurring';
export type FinanceEntryFlow = 'income' | 'expense';
export type FinanceEntryFrequency = 'monthly';

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
  category: string | null;
  color: string | null;
  manualAmounts: FinanceManualAmounts | null;
  attachments: FinanceEntryAttachment[] | null;
  effectiveDate: string | null;
  recurringFrequency: FinanceEntryFrequency | null;
  recurringStart: string | null;
  recurringEnd: string | null;
  createdAt: string;
  updatedAt: string;
};
