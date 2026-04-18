import type { DocsMetadata, FileItem } from '@/components/Assets/Asset/tabs/types';
import { normalizeDocsMetadata } from '@/components/Assets/Asset/tabs/types';

export type FinanceAttachmentInput = {
  id: string;
  name: string;
  url: string;
};

/**
 * Merges finance entry PDFs into asset `metadata.docs` (same structure as the Docs tab).
 * Skips files whose `id` already exists (idempotent for retries).
 */
export function mergeFinanceAttachmentsIntoDocsMetadata(
  metadata: unknown,
  financeEntryId: number,
  attachments: FinanceAttachmentInput[],
): DocsMetadata {
  const meta = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
  const docs = normalizeDocsMetadata(meta.docs);
  const existingIds = new Set(docs.files.map(f => f.id));
  const additions: FileItem[] = [];

  for (const a of attachments) {
    if (!a.id || existingIds.has(a.id)) {
      continue;
    }
    existingIds.add(a.id);
    additions.push({
      id: a.id,
      name: a.name,
      url: a.url,
      folderId: null,
      financeEntryId,
    });
  }

  return {
    folders: docs.folders,
    files: [...docs.files, ...additions],
  };
}
