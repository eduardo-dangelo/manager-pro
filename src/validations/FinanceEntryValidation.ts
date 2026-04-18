import z from 'zod';

export const FinanceEntryKindSchema = z.enum(['one_time', 'recurring', 'manual_recurring']);
export const FinanceEntryFlowSchema = z.enum(['income', 'expense']);
export const FinanceEntryFrequencySchema = z.enum(['monthly']);

const attachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
});

const manualAmountsSchema = z.record(z.string().regex(/^\d{4}-\d{2}$/), z.number().int().nonnegative());

const BaseFinanceEntryValidation = z.object({
  assetId: z.number().int().positive(),
  name: z.string().trim().min(1, 'Name is required').max(200),
  kind: FinanceEntryKindSchema,
  flow: FinanceEntryFlowSchema,
  amountCents: z.number().int().nonnegative(),
  category: z.string().trim().max(80).nullable().optional(),
  color: z.string().trim().max(32).nullable().optional(),
  manualAmounts: manualAmountsSchema.nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
  effectiveDate: z.string().datetime().nullable().optional(),
  recurringFrequency: FinanceEntryFrequencySchema.nullable().optional(),
  recurringStart: z.string().datetime().nullable().optional(),
  recurringEnd: z.string().datetime().nullable().optional(),
  initialAmountCents: z.number().int().nonnegative().nullable().optional(),
  initialEffectiveDate: z.string().datetime().nullable().optional(),
});

export const FinanceEntryValidation = BaseFinanceEntryValidation.superRefine((value, ctx) => {
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
  category: z.string().trim().max(80).nullable().optional(),
  color: z.string().trim().max(32).nullable().optional(),
  manualAmounts: manualAmountsSchema.nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
  effectiveDate: z.string().datetime().nullable().optional(),
  recurringFrequency: FinanceEntryFrequencySchema.nullable().optional(),
  recurringStart: z.string().datetime().nullable().optional(),
  recurringEnd: z.string().datetime().nullable().optional(),
});

export type FinanceEntryInput = z.infer<typeof FinanceEntryValidation>;
export type UpdateFinanceEntryInput = z.infer<typeof UpdateFinanceEntryValidation>;
