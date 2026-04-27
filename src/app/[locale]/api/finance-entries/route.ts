import type { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { FinanceEntryService, mergeInitialIntoManualAmounts } from '@/services/financeEntryService';
import { FinanceEntryValidation } from '@/validations/FinanceEntryValidation';

export const GET = async (request: NextRequest) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetIdParam = searchParams.get('assetId');
    const yearParam = searchParams.get('year');

    let assetId: number | null = null;
    let year: number | undefined;

    if (assetIdParam != null && assetIdParam !== '') {
      const parsed = Number.parseInt(assetIdParam, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return NextResponse.json({ error: 'Invalid assetId' }, { status: 400 });
      }
      assetId = parsed;
    }

    if (yearParam != null && yearParam !== '') {
      const parsed = Number.parseInt(yearParam, 10);
      if (Number.isNaN(parsed) || parsed < 1900 || parsed > 3000) {
        return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
      }
      year = parsed;
    }

    const entries = assetId !== null
      ? await FinanceEntryService.getByAssetId(assetId, user.id, year)
      : await FinanceEntryService.getByUserId(user.id, year);

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    logger.error(`Error fetching finance entries: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch finance entries' },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const parse = FinanceEntryValidation.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const {
      initialAmountCents,
      initialEffectiveDate,
      manualAmounts: manualAmountsInput,
      attachments,
      financeAgreement,
      insurance,
      gas,
      repair,
      tax,
      service,
      mot,
      other,
      ...rest
    } = parse.data;

    const manualAmountsMerged = rest.kind === 'manual_recurring'
      ? mergeInitialIntoManualAmounts(
          manualAmountsInput ?? undefined,
          initialAmountCents ?? undefined,
          initialEffectiveDate ? new Date(initialEffectiveDate) : undefined,
        )
      : null;

    const entryData = {
      assetId: rest.assetId,
      name: rest.name,
      kind: rest.kind,
      flow: rest.flow,
      amountCents: rest.amountCents,
      category: rest.category ?? null,
      color: rest.color ?? null,
      manualAmounts: manualAmountsMerged,
      attachments: attachments ?? null,
      financeAgreement: financeAgreement ?? null,
      insurance: insurance ?? null,
      gas: gas ?? null,
      repair: repair ?? null,
      tax: tax ?? null,
      service: service ?? null,
      mot: mot ?? null,
      other: other ?? null,
      effectiveDate: rest.effectiveDate ? new Date(rest.effectiveDate) : null,
      recurringFrequency: rest.recurringFrequency ?? null,
      recurringStart: rest.recurringStart ? new Date(rest.recurringStart) : null,
      recurringEnd: rest.recurringEnd ? new Date(rest.recurringEnd) : null,
    };

    const entry = await FinanceEntryService.create(entryData, user.id);
    if (!entry) {
      throw new Error('Failed to create finance entry');
    }

    logger.info('Finance entry created', { financeEntryId: entry.id });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Error creating finance entry: ${msg}`);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to create finance entry' },
      { status: 500 },
    );
  }
};
