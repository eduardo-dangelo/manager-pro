import z from 'zod';
import { FINANCE_ENTRY_CATEGORIES } from '@/entities';

export const FinanceEntryKindSchema = z.enum(['one_time', 'recurring', 'manual_recurring']);
export const FinanceEntryFlowSchema = z.enum(['income', 'expense']);
export const FinanceEntryFrequencySchema = z.enum(['monthly']);

const attachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
});

const manualAmountsSchema = z.record(z.string().regex(/^\d{4}-\d{2}$/), z.number().int().nonnegative());
const financeEntryCategorySchema = z.enum(FINANCE_ENTRY_CATEGORIES);
const financeAgreementSchema = z.object({
  provider: z.string().trim().min(1, 'Provider is required').max(200),
  totalCashPriceCents: z.number().int().nonnegative(),
  advancePaymentsCents: z.number().int().nonnegative(),
  durationMonths: z.number().int().positive(),
  frequency: FinanceEntryFrequencySchema,
  amountCents: z.number().int().positive(),
  amountOfCreditCents: z.number().int().nonnegative(),
  interestChargesCents: z.number().int().nonnegative(),
  acceptanceFeeCents: z.number().int().nonnegative(),
  titleTransferFeeCents: z.number().int().nonnegative(),
  totalChargeForCreditCents: z.number().int().nonnegative(),
  totalAmountPayableCents: z.number().int().nonnegative(),
  interestRatePercent: z.number().nonnegative(),
});

const BaseFinanceEntryValidation = z.object({
  assetId: z.number().int().positive(),
  name: z.string().trim().min(1, 'Name is required').max(200),
  kind: FinanceEntryKindSchema,
  flow: FinanceEntryFlowSchema,
  amountCents: z.number().int().nonnegative(),
  category: financeEntryCategorySchema.nullable().optional(),
  color: z.string().trim().max(32).nullable().optional(),
  manualAmounts: manualAmountsSchema.nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
  financeAgreement: financeAgreementSchema.nullable().optional(),
  effectiveDate: z.string().datetime().nullable().optional(),
  recurringFrequency: FinanceEntryFrequencySchema.nullable().optional(),
  recurringStart: z.string().datetime().nullable().optional(),
  recurringEnd: z.string().datetime().nullable().optional(),
  initialAmountCents: z.number().int().nonnegative().nullable().optional(),
  initialEffectiveDate: z.string().datetime().nullable().optional(),
});

export const FinanceEntryValidation = BaseFinanceEntryValidation.superRefine((value, ctx) => {
  if (value.category === 'finance_agreement') {
    const agreement = value.financeAgreement;
    if (!agreement) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Finance agreement details are required for this category',
        path: ['financeAgreement'],
      });
    } else {
      const expectedAmountOfCredit = agreement.totalCashPriceCents - agreement.advancePaymentsCents;
      if (expectedAmountOfCredit < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Advance payments cannot exceed total cash price',
          path: ['financeAgreement', 'advancePaymentsCents'],
        });
      }
      if (agreement.amountOfCreditCents !== expectedAmountOfCredit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount of credit must match total cash price minus advance payments',
          path: ['financeAgreement', 'amountOfCreditCents'],
        });
      }
      const expectedTotalCharge = agreement.interestChargesCents + agreement.acceptanceFeeCents + agreement.titleTransferFeeCents;
      if (agreement.totalChargeForCreditCents !== expectedTotalCharge) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Total charge for credit must equal interest charges plus agreement fees',
          path: ['financeAgreement', 'totalChargeForCreditCents'],
        });
      }
      const expectedTotalPayable = agreement.amountOfCreditCents + agreement.totalChargeForCreditCents;
      if (agreement.totalAmountPayableCents !== expectedTotalPayable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Total amount payable must equal amount of credit plus total charge for credit',
          path: ['financeAgreement', 'totalAmountPayableCents'],
        });
      }
      if (agreement.amountCents !== value.amountCents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Finance agreement amount must match entry amount',
          path: ['financeAgreement', 'amountCents'],
        });
      }
    }
  }

  if (value.kind === 'one_time') {
    if (!value.effectiveDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Effective date is required for one-time entries',
        path: ['effectiveDate'],
      });
    }
    if (value.amountCents <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount must be greater than 0 for one-time entries',
        path: ['amountCents'],
      });
    }
    return;
  }

  if (value.kind === 'recurring') {
    if (!value.recurringStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recurring start is required for recurring entries',
        path: ['recurringStart'],
      });
    }
    if (!value.recurringFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recurring frequency is required for recurring entries',
        path: ['recurringFrequency'],
      });
    }
    if (value.amountCents <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount must be greater than 0 for recurring entries',
        path: ['amountCents'],
      });
    }
    if (value.recurringStart && value.recurringEnd) {
      const start = new Date(value.recurringStart);
      const end = new Date(value.recurringEnd);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Recurring end must be the same day or after recurring start',
          path: ['recurringEnd'],
        });
      }
    }
    return;
  }

  // manual_recurring
  if (!value.recurringStart) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Recurring start is required for manual recurring entries',
      path: ['recurringStart'],
    });
  }
  if (value.recurringStart && value.recurringEnd) {
    const start = new Date(value.recurringStart);
    const end = new Date(value.recurringEnd);
    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recurring end must be the same day or after recurring start',
        path: ['recurringEnd'],
      });
    }
  }
  const hasManual = value.manualAmounts && Object.keys(value.manualAmounts).length > 0;
  const hasInitial = (value.initialAmountCents ?? 0) > 0 && Boolean(value.initialEffectiveDate);
  if (!hasManual && !hasInitial) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide manual amounts and/or an initial transaction for manual recurring entries',
      path: ['manualAmounts'],
    });
  }
  if ((value.initialAmountCents ?? 0) > 0 && !value.initialEffectiveDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Initial effective date is required when initial amount is set',
      path: ['initialEffectiveDate'],
    });
  }
});

export const UpdateFinanceEntryValidation = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  kind: FinanceEntryKindSchema.optional(),
  flow: FinanceEntryFlowSchema.optional(),
  amountCents: z.number().int().nonnegative().optional(),
  category: financeEntryCategorySchema.nullable().optional(),
  color: z.string().trim().max(32).nullable().optional(),
  manualAmounts: manualAmountsSchema.nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
  financeAgreement: financeAgreementSchema.nullable().optional(),
  effectiveDate: z.string().datetime().nullable().optional(),
  recurringFrequency: FinanceEntryFrequencySchema.nullable().optional(),
  recurringStart: z.string().datetime().nullable().optional(),
  recurringEnd: z.string().datetime().nullable().optional(),
});

export type FinanceEntryInput = z.infer<typeof FinanceEntryValidation>;
export type UpdateFinanceEntryInput = z.infer<typeof UpdateFinanceEntryValidation>;
