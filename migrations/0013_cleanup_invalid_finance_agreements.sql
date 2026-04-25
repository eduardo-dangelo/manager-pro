DELETE FROM "finance_entries"
WHERE "category" = 'finance_agreement'
  AND (
    "finance_agreement" IS NULL
    OR jsonb_typeof("finance_agreement") <> 'object'
    OR COALESCE("finance_agreement"->>'provider', '') = ''
    OR "finance_agreement"->>'frequency' <> 'monthly'
    OR jsonb_typeof("finance_agreement"->'totalCashPriceCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'advancePaymentsCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'durationMonths') <> 'number'
    OR jsonb_typeof("finance_agreement"->'amountCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'amountOfCreditCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'interestChargesCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'acceptanceFeeCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'titleTransferFeeCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'totalChargeForCreditCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'totalAmountPayableCents') <> 'number'
    OR jsonb_typeof("finance_agreement"->'interestRatePercent') <> 'number'
    OR ("finance_agreement"->>'amountCents')::integer <> "amount_cents"
  );
