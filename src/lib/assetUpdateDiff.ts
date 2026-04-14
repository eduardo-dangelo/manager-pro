export type AssetFieldChange = {
  field: string;
  before: unknown;
  after: unknown;
};

export type AssetRowForDiff = {
  name?: string | null;
  description?: string | null;
  color?: string | null;
  status?: string | null;
  registrationNumber?: string | null;
  address?: string | null;
  tabs?: string[] | null;
  metadata?: Record<string, unknown> | null;
};

export function stableJsonForActivityKey(a: unknown): string {
  return JSON.stringify(a, (_k, v) => {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v as object)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (v as Record<string, unknown>)[key];
          return acc;
        }, {});
    }
    return v;
  });
}

function emptyish(v: unknown): boolean {
  return v == null || v === '';
}

/**
 * True when two values should be treated as the same for activity diffs
 * (null/undefined/empty string; string vs number with same trimmed text; deep JSON for objects).
 */
export function areAssetFieldValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a == null && b == null) {
    return true;
  }
  if (emptyish(a) && emptyish(b)) {
    return true;
  }
  if ((typeof a === 'string' || typeof a === 'number')
    && (typeof b === 'string' || typeof b === 'number')) {
    if (String(a).trim() === String(b).trim()) {
      return true;
    }
  }
  if (typeof a === 'object' || typeof b === 'object') {
    return stableJsonForActivityKey(a ?? null) === stableJsonForActivityKey(b ?? null);
  }
  return false;
}

function tabsEqual(a: unknown, b: unknown): boolean {
  return areAssetFieldValuesEqual(a, b);
}

const METADATA_BLOB_KEYS = ['dvla', 'mot', 'maintenance'] as const;

/**
 * Compares `before` asset fields with the validated `patch` from a PUT body
 * and returns human-facing field ids with before/after values.
 */
export function diffAssetUpdate(
  before: AssetRowForDiff,
  patch: Record<string, unknown>,
): AssetFieldChange[] {
  const changes: AssetFieldChange[] = [];

  const scalarKeys = ['name', 'description', 'color', 'status', 'registrationNumber', 'address'] as const;
  for (const key of scalarKeys) {
    if (!(key in patch)) {
      continue;
    }
    const next = patch[key];
    if (next === undefined) {
      continue;
    }
    const prev = before[key];
    if (!areAssetFieldValuesEqual(prev, next)) {
      changes.push({ field: key, before: prev ?? null, after: next });
    }
  }

  if ('tabs' in patch && patch.tabs !== undefined) {
    const prev = before.tabs;
    const next = patch.tabs;
    if (!tabsEqual(prev, next)) {
      changes.push({ field: 'tabs', before: prev ?? null, after: next });
    }
  }

  if ('metadata' in patch && patch.metadata !== undefined && typeof patch.metadata === 'object') {
    const prevMeta = (before.metadata ?? {}) as Record<string, unknown>;
    const nextMeta = patch.metadata as Record<string, unknown>;

    const prevSpecs = (prevMeta.specs && typeof prevMeta.specs === 'object')
      ? (prevMeta.specs as Record<string, unknown>)
      : {};
    const nextSpecs = (nextMeta.specs && typeof nextMeta.specs === 'object')
      ? (nextMeta.specs as Record<string, unknown>)
      : {};

    const specKeys = new Set([...Object.keys(prevSpecs), ...Object.keys(nextSpecs)]);
    for (const k of specKeys) {
      const pv = prevSpecs[k];
      const nv = nextSpecs[k];
      if (!areAssetFieldValuesEqual(pv, nv)) {
        changes.push({ field: `metadata.specs.${k}`, before: pv ?? null, after: nv ?? null });
      }
    }

    for (const blobKey of METADATA_BLOB_KEYS) {
      if (!areAssetFieldValuesEqual(prevMeta[blobKey], nextMeta[blobKey])) {
        changes.push({
          field: `metadata.${blobKey}`,
          before: null,
          after: 'blob_updated',
        });
      }
    }
  }

  return changes;
}
