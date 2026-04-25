import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { FinanceEntryService } from '@/services/financeEntryService';
import { UpdateFinanceEntryValidation } from '@/validations/FinanceEntryValidation';

export const PATCH = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const entryId = Number.parseInt(id, 10);
    if (Number.isNaN(entryId) || entryId < 1) {
      return NextResponse.json({ error: 'Invalid entry id' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateFinanceEntryValidation.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const updates: Parameters<typeof FinanceEntryService.update>[2] = {};
    const d = parse.data;
    if (d.name !== undefined) {
      updates.name = d.name;
    }
    if (d.kind !== undefined) {
      updates.kind = d.kind;
    }
    if (d.flow !== undefined) {
      updates.flow = d.flow;
    }
    if (d.amountCents !== undefined) {
      updates.amountCents = d.amountCents;
    }
    if (d.category !== undefined) {
      updates.category = d.category;
    }
    if (d.color !== undefined) {
      updates.color = d.color;
    }
    if (d.manualAmounts !== undefined) {
      updates.manualAmounts = d.manualAmounts;
    }
    if (d.attachments !== undefined) {
      updates.attachments = d.attachments;
    }
    if (d.financeAgreement !== undefined) {
      updates.financeAgreement = d.financeAgreement;
    }
    if (d.effectiveDate !== undefined) {
      updates.effectiveDate = d.effectiveDate ? new Date(d.effectiveDate) : null;
    }
    if (d.recurringFrequency !== undefined) {
      updates.recurringFrequency = d.recurringFrequency;
    }
    if (d.recurringStart !== undefined) {
      updates.recurringStart = d.recurringStart ? new Date(d.recurringStart) : null;
    }
    if (d.recurringEnd !== undefined) {
      updates.recurringEnd = d.recurringEnd ? new Date(d.recurringEnd) : null;
    }

    const entry = await FinanceEntryService.update(entryId, user.id, updates);
    if (!entry) {
      return NextResponse.json({ error: 'Finance entry not found' }, { status: 404 });
    }

    logger.info('Finance entry updated', { financeEntryId: entry.id });
    return NextResponse.json({ entry });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Error updating finance entry: ${msg}`);
    return NextResponse.json(
      { error: 'Failed to update finance entry' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const entryId = Number.parseInt(id, 10);
    if (Number.isNaN(entryId) || entryId < 1) {
      return NextResponse.json({ error: 'Invalid entry id' }, { status: 400 });
    }

    const entry = await FinanceEntryService.delete(entryId, user.id);
    if (!entry) {
      return NextResponse.json({ error: 'Finance entry not found' }, { status: 404 });
    }

    logger.info('Finance entry deleted', { financeEntryId: entry.id });
    return NextResponse.json({ entry });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Error deleting finance entry: ${msg}`);
    return NextResponse.json(
      { error: 'Failed to delete finance entry' },
      { status: 500 },
    );
  }
};
