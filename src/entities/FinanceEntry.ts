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
export type InsuranceType = 'comprehensive' | 'third_party' | 'third_party_fire_theft' | 'other';
export type InsuranceFrequency = 'annual' | 'monthly';
export type InsuranceDetails = {
  insuranceType?: InsuranceType | null;
  provider: string;
  frequency: InsuranceFrequency;
  premiumCents: number;
  validFrom: string;
  validUntil?: string | null;
  policyNumber?: string | null;
  insurerContact?: string | null;
};
export type GasDetails = {
  valueCents: number;
  litres: number;
  pricePerLitreCents?: number | null;
  date: string;
};
export type RepairDetails = {
  valueCents: number;
  date: string;
  provider?: string | null;
  repairType?: string | null;
  notes?: string | null;
};
export type TaxDetails = {
  valueCents: number;
  validFrom: string;
  validUntil?: string | null;
  reference?: string | null;
};
export type ServiceDetails = {
  valueCents: number;
  date: string;
  provider?: string | null;
  serviceType?: string | null;
  notes?: string | null;
};
export type MotResult = 'pass' | 'fail' | 'advisory';
export type MotDetails = {
  valueCents: number;
  date: string;
  result: MotResult;
  provider?: string | null;
  notes?: string | null;
};
export type OtherDirection = 'expense' | 'income';
export type OtherDetails = {
  valueCents: number;
  date: string;
  description: string;
  direction: OtherDirection;
};
export const FINANCE_ENTRY_CATEGORIES = [
  'finance_agreement',
  'insurance',
  'gas',
  'repair',
  'tax',
  'service',
  'mot',
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
  insurance?: InsuranceDetails | null;
  gas?: GasDetails | null;
  repair?: RepairDetails | null;
  tax?: TaxDetails | null;
  service?: ServiceDetails | null;
  mot?: MotDetails | null;
  other?: OtherDetails | null;
  createdAt: string;
  updatedAt: string;
};
