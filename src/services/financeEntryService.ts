import { and, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { assetsSchema, financeEntriesSchema } from '@/models/Schema';
import { AssetService } from '@/services/assetService';

export type FinanceEntryCreatePayload = {
  assetId: number;
  name: string;
  kind: 'one_time' | 'recurring' | 'manual_recurring';
  flow: 'income' | 'expense';
  amountCents: number;
  category?: string | null;
  color?: string | null;
  manualAmounts?: Record<string, number> | null;
  attachments?: Array<{ id: string; name: string; url: string }> | null;
  financeAgreement?: {
    provider: string;
    totalCashPriceCents: number;
    advancePaymentsCents: number;
    durationMonths: number;
    frequency: 'monthly';
    amountCents: number;
    amountOfCreditCents: number;
    interestChargesCents: number;
    acceptanceFeeCents: number;
    titleTransferFeeCents: number;
    totalChargeForCreditCents: number;
    totalAmountPayableCents: number;
    interestRatePercent: number;
  } | null;
  insurance?: {
    insuranceType?: 'comprehensive' | 'third_party' | 'third_party_fire_theft' | 'other' | null;
    provider: string;
    frequency: 'annual' | 'monthly';
    premiumCents: number;
    validFrom: string;
    validUntil?: string | null;
    policyNumber?: string | null;
    insurerContact?: string | null;
  } | null;
  gas?: {
    valueCents: number;
    litres: number;
    pricePerLitreCents?: number | null;
    date: string;
  } | null;
  repair?: {
    valueCents: number;
    date: string;
    provider?: string | null;
    repairType?: string | null;
    notes?: string | null;
  } | null;
  tax?: {
    valueCents: number;
    validFrom: string;
    validUntil?: string | null;
    reference?: string | null;
  } | null;
  service?: {
    valueCents: number;
    date: string;
    provider?: string | null;
    serviceType?: string | null;
    notes?: string | null;
  } | null;
  mot?: {
    valueCents: number;
    date: string;
    result: 'pass' | 'fail' | 'advisory';
    provider?: string | null;
    notes?: string | null;
  } | null;
  other?: {
    valueCents: number;
    date: string;
    description: string;
    direction: 'expense' | 'income';
  } | null;
  effectiveDate?: Date | null;
  recurringFrequency?: 'monthly' | null;
  recurringStart?: Date | null;
  recurringEnd?: Date | null;
};

export type FinanceEntryUpdatePayload = Partial<Omit<FinanceEntryCreatePayload, 'assetId'>>;

export function mergeInitialIntoManualAmounts(
  manual: Record<string, number> | null | undefined,
  initialAmountCents: number | null | undefined,
  initialEffectiveDate: Date | null | undefined,
): Record<string, number> | null {
  const base = manual && Object.keys(manual).length > 0 ? { ...manual } : {};
  if (initialAmountCents != null && initialAmountCents > 0 && initialEffectiveDate) {
    const d = new Date(initialEffectiveDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    base[key] = (base[key] ?? 0) + initialAmountCents;
  }
  return Object.keys(base).length > 0 ? base : null;
}

export class FinanceEntryService {
  private static async verifyAssetOwnership(assetId: number, userId: string) {
    const asset = await db
      .select()
      .from(assetsSchema)
      .where(and(eq(assetsSchema.id, assetId), eq(assetsSchema.userId, userId)))
      .limit(1);

    return asset.length > 0;
  }

  static async create(data: FinanceEntryCreatePayload, userId: string) {
    const hasAccess = await this.verifyAssetOwnership(data.assetId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Asset not found or access denied');
    }

    const [created] = await db
      .insert(financeEntriesSchema)
      .values({
        assetId: data.assetId,
        userId,
        name: data.name,
        kind: data.kind,
        flow: data.flow,
        amountCents: data.amountCents,
        category: data.category ?? null,
        color: data.color ?? null,
        manualAmounts: data.manualAmounts ?? null,
        attachments: data.attachments ?? null,
        financeAgreement: data.financeAgreement ?? null,
        insurance: data.insurance ?? null,
        gas: data.gas ?? null,
        repair: data.repair ?? null,
        tax: data.tax ?? null,
        service: data.service ?? null,
        mot: data.mot ?? null,
        other: data.other ?? null,
        effectiveDate: data.effectiveDate ?? null,
        recurringFrequency: data.recurringFrequency ?? null,
        recurringStart: data.recurringStart ?? null,
        recurringEnd: data.recurringEnd ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (created && data.attachments?.length) {
      await AssetService.syncFinanceAttachmentsToAssetDocs(
        data.assetId,
        userId,
        created.id,
        data.attachments,
      );
    }

    return created;
  }

  static async getById(entryId: number, userId: string) {
    const [row] = await db
      .select()
      .from(financeEntriesSchema)
      .where(and(eq(financeEntriesSchema.id, entryId), eq(financeEntriesSchema.userId, userId)))
      .limit(1);

    return row ?? null;
  }

  static async update(entryId: number, userId: string, updates: FinanceEntryUpdatePayload) {
    const existing = await this.getById(entryId, userId);
    if (!existing) {
      return null;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.kind !== undefined) {
      updateData.kind = updates.kind;
    }
    if (updates.flow !== undefined) {
      updateData.flow = updates.flow;
    }
    if (updates.amountCents !== undefined) {
      updateData.amountCents = updates.amountCents;
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }
    if (updates.color !== undefined) {
      updateData.color = updates.color;
    }
    if (updates.manualAmounts !== undefined) {
      updateData.manualAmounts = updates.manualAmounts;
    }
    if (updates.attachments !== undefined) {
      updateData.attachments = updates.attachments;
    }
    if (updates.financeAgreement !== undefined) {
      updateData.financeAgreement = updates.financeAgreement;
    }
    if (updates.insurance !== undefined) {
      updateData.insurance = updates.insurance;
    }
    if (updates.gas !== undefined) {
      updateData.gas = updates.gas;
    }
    if (updates.repair !== undefined) {
      updateData.repair = updates.repair;
    }
    if (updates.tax !== undefined) {
      updateData.tax = updates.tax;
    }
    if (updates.service !== undefined) {
      updateData.service = updates.service;
    }
    if (updates.mot !== undefined) {
      updateData.mot = updates.mot;
    }
    if (updates.other !== undefined) {
      updateData.other = updates.other;
    }
    if (updates.effectiveDate !== undefined) {
      updateData.effectiveDate = updates.effectiveDate;
    }
    if (updates.recurringFrequency !== undefined) {
      updateData.recurringFrequency = updates.recurringFrequency;
    }
    if (updates.recurringStart !== undefined) {
      updateData.recurringStart = updates.recurringStart;
    }
    if (updates.recurringEnd !== undefined) {
      updateData.recurringEnd = updates.recurringEnd;
    }

    const [updated] = await db
      .update(financeEntriesSchema)
      .set(updateData)
      .where(and(eq(financeEntriesSchema.id, entryId), eq(financeEntriesSchema.userId, userId)))
      .returning();

    if (updated && updates.attachments !== undefined) {
      await AssetService.syncFinanceAttachmentsToAssetDocs(
        existing.assetId,
        userId,
        entryId,
        updates.attachments ?? [],
      );
    }

    return updated ?? null;
  }

  static async delete(entryId: number, userId: string) {
    const existing = await this.getById(entryId, userId);
    if (!existing) {
      return null;
    }

    const existingAttachments = Array.isArray(existing.attachments) ? existing.attachments : [];
    if (existingAttachments.length > 0) {
      await AssetService.syncFinanceAttachmentsToAssetDocs(
        existing.assetId,
        userId,
        entryId,
        [],
      );
    }

    const [deleted] = await db
      .delete(financeEntriesSchema)
      .where(and(eq(financeEntriesSchema.id, entryId), eq(financeEntriesSchema.userId, userId)))
      .returning();

    return deleted ?? null;
  }

  private static yearFilter(year: number) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    const recurringOverlap = and(
      lte(financeEntriesSchema.recurringStart, yearEnd),
      or(
        isNull(financeEntriesSchema.recurringEnd),
        gte(financeEntriesSchema.recurringEnd, yearStart),
      ),
    );

    return or(
      and(
        eq(financeEntriesSchema.kind, 'one_time'),
        gte(financeEntriesSchema.effectiveDate, yearStart),
        lte(financeEntriesSchema.effectiveDate, yearEnd),
      ),
      and(
        eq(financeEntriesSchema.kind, 'recurring'),
        recurringOverlap,
      ),
      and(
        eq(financeEntriesSchema.kind, 'manual_recurring'),
        recurringOverlap,
      ),
    );
  }

  static async getByUserId(userId: string, year?: number) {
    if (!year) {
      return db
        .select()
        .from(financeEntriesSchema)
        .where(eq(financeEntriesSchema.userId, userId))
        .orderBy(financeEntriesSchema.createdAt);
    }

    return db
      .select()
      .from(financeEntriesSchema)
      .where(and(eq(financeEntriesSchema.userId, userId), this.yearFilter(year)))
      .orderBy(financeEntriesSchema.createdAt);
  }

  static async getByAssetId(assetId: number, userId: string, year?: number) {
    const hasAccess = await this.verifyAssetOwnership(assetId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Asset not found or access denied');
    }

    if (!year) {
      return db
        .select()
        .from(financeEntriesSchema)
        .where(eq(financeEntriesSchema.assetId, assetId))
        .orderBy(financeEntriesSchema.createdAt);
    }

    return db
      .select()
      .from(financeEntriesSchema)
      .where(and(eq(financeEntriesSchema.assetId, assetId), this.yearFilter(year)))
      .orderBy(financeEntriesSchema.createdAt);
  }
}
