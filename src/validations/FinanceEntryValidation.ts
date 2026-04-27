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
const insuranceTypeSchema = z.enum(['comprehensive', 'third_party', 'third_party_fire_theft', 'other']);
const insuranceFrequencySchema = z.enum(['annual', 'monthly']);
const insuranceSchema = z.object({
  insuranceType: insuranceTypeSchema.nullable().optional(),
  provider: z.string().trim().min(1, 'Provider is required').max(200),
  frequency: insuranceFrequencySchema,
  premiumCents: z.number().int().positive(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().nullable().optional(),
  policyNumber: z.string().trim().max(120).nullable().optional(),
  insurerContact: z.string().trim().max(120).nullable().optional(),
});
const gasSchema = z.object({
  valueCents: z.number().int().positive(),
  litres: z.number().positive(),
  pricePerLitreCents: z.number().int().positive().nullable().optional(),
  date: z.string().datetime(),
});
const repairSchema = z.object({
  valueCents: z.number().int().positive(),
  date: z.string().datetime(),
  provider: z.string().trim().max(200).nullable().optional(),
  repairType: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});
const taxSchema = z.object({
  valueCents: z.number().int().positive(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().nullable().optional(),
  reference: z.string().trim().max(120).nullable().optional(),
});
const serviceSchema = z.object({
  valueCents: z.number().int().positive(),
  date: z.string().datetime(),
  provider: z.string().trim().max(200).nullable().optional(),
  serviceType: z.string().trim().max(120).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});
const motResultSchema = z.enum(['pass', 'fail', 'advisory']);
const motSchema = z.object({
  valueCents: z.number().int().positive(),
  date: z.string().datetime(),
  result: motResultSchema,
  provider: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});
const otherDirectionSchema = z.enum(['expense', 'income']);
const otherSchema = z.object({
  valueCents: z.number().int().positive(),
  date: z.string().datetime(),
  description: z.string().trim().min(1).max(300),
  direction: otherDirectionSchema,
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
  insurance: insuranceSchema.nullable().optional(),
  gas: gasSchema.nullable().optional(),
  repair: repairSchema.nullable().optional(),
  tax: taxSchema.nullable().optional(),
  service: serviceSchema.nullable().optional(),
  mot: motSchema.nullable().optional(),
  other: otherSchema.nullable().optional(),
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
  if (value.category === 'insurance') {
    const insurance = value.insurance;
    if (!insurance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Insurance details are required for this category',
        path: ['insurance'],
      });
    } else {
      if (insurance.validUntil) {
        const from = new Date(insurance.validFrom);
        const until = new Date(insurance.validUntil);
        if (until < from) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Valid until must be the same day or after valid from',
            path: ['insurance', 'validUntil'],
          });
        }
      }
      if (insurance.premiumCents !== value.amountCents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Insurance premium must match entry amount',
          path: ['insurance', 'premiumCents'],
        });
      }
    }
  }
  if (value.category === 'gas') {
    const gas = value.gas;
    if (!gas) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Gas details are required for this category',
        path: ['gas'],
      });
    } else {
      if (gas.valueCents !== value.amountCents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Gas value must match entry amount',
          path: ['gas', 'valueCents'],
        });
      }
      if (gas.pricePerLitreCents != null) {
        const expectedValue = Math.round(gas.pricePerLitreCents * gas.litres);
        if (Math.abs(expectedValue - gas.valueCents) > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Price per litre does not match value and litres',
            path: ['gas', 'pricePerLitreCents'],
          });
        }
      }
    }
  }
  if (value.category === 'repair') {
    const repair = value.repair;
    if (!repair) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Repair details are required for this category', path: ['repair'] });
    } else if (repair.valueCents !== value.amountCents) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Repair value must match entry amount', path: ['repair', 'valueCents'] });
    }
  }
  if (value.category === 'tax') {
    const tax = value.tax;
    if (!tax) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tax details are required for this category', path: ['tax'] });
    } else {
      if (tax.valueCents !== value.amountCents) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tax value must match entry amount', path: ['tax', 'valueCents'] });
      }
      if (tax.validUntil && new Date(tax.validUntil) < new Date(tax.validFrom)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid until must be the same day or after valid from', path: ['tax', 'validUntil'] });
      }
    }
  }
  if (value.category === 'service') {
    const service = value.service;
    if (!service) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Service details are required for this category', path: ['service'] });
    } else if (service.valueCents !== value.amountCents) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Service value must match entry amount', path: ['service', 'valueCents'] });
    }
  }
  if (value.category === 'mot') {
    const mot = value.mot;
    if (!mot) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MOT details are required for this category', path: ['mot'] });
    } else if (mot.valueCents !== value.amountCents) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MOT value must match entry amount', path: ['mot', 'valueCents'] });
    }
  }
  if (value.category === 'other') {
    const other = value.other;
    if (!other) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Other details are required for this category', path: ['other'] });
    } else if (other.valueCents !== value.amountCents) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Other value must match entry amount', path: ['other', 'valueCents'] });
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
  insurance: insuranceSchema.nullable().optional(),
  gas: gasSchema.nullable().optional(),
  repair: repairSchema.nullable().optional(),
  tax: taxSchema.nullable().optional(),
  service: serviceSchema.nullable().optional(),
  mot: motSchema.nullable().optional(),
  other: otherSchema.nullable().optional(),
  effectiveDate: z.string().datetime().nullable().optional(),
  recurringFrequency: FinanceEntryFrequencySchema.nullable().optional(),
  recurringStart: z.string().datetime().nullable().optional(),
  recurringEnd: z.string().datetime().nullable().optional(),
});

export type FinanceEntryInput = z.infer<typeof FinanceEntryValidation>;
export type UpdateFinanceEntryInput = z.infer<typeof UpdateFinanceEntryValidation>;
