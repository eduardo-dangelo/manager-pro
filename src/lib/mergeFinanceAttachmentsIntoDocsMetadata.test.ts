import { describe, expect, it } from 'vitest';
import { mergeFinanceAttachmentsIntoDocsMetadata } from './mergeFinanceAttachmentsIntoDocsMetadata';

describe('mergeFinanceAttachmentsIntoDocsMetadata', () => {
  it('appends new files with folderId null and financeEntryId', () => {
    const out = mergeFinanceAttachmentsIntoDocsMetadata(
      {},
      42,
      [{ id: 'f1', name: 'a.pdf', url: 'https://x/a.pdf' }],
    );
    expect(out.folders).toEqual([]);
    expect(out.files).toHaveLength(1);
    expect(out.files[0]).toMatchObject({
      id: 'f1',
      name: 'a.pdf',
      url: 'https://x/a.pdf',
      folderId: null,
      financeEntryId: 42,
    });
  });

  it('preserves folders and existing files', () => {
    const meta = {
      docs: {
        folders: [{ id: 'fld1', name: 'Invoices', type: 'folder' as const, parentId: null }],
        files: [{ id: 'old', name: 'old.pdf', url: 'u', folderId: null }],
      },
    };
    const out = mergeFinanceAttachmentsIntoDocsMetadata(meta, 7, [
      { id: 'new1', name: 'n.pdf', url: 'https://n' },
    ]);
    expect(out.folders).toEqual(meta.docs.folders);
    expect(out.files).toHaveLength(2);
    expect(out.files[0].id).toBe('old');
    expect(out.files[1]).toMatchObject({ id: 'new1', financeEntryId: 7 });
  });

  it('dedupes by file id', () => {
    const meta = {
      docs: {
        folders: [],
        files: [{ id: 'dup', name: 'x.pdf', url: 'u', folderId: null }],
      },
    };
    const out = mergeFinanceAttachmentsIntoDocsMetadata(meta, 1, [
      { id: 'dup', name: 'x.pdf', url: 'u' },
      { id: 'other', name: 'y.pdf', url: 'v' },
    ]);
    expect(out.files).toHaveLength(2);
    expect(out.files.map(f => f.id)).toEqual(['dup', 'other']);
  });

  it('normalizes legacy docs array shape', () => {
    const meta = { docs: [{ id: 'l1', name: 'l.pdf', url: 'u' }] };
    const out = mergeFinanceAttachmentsIntoDocsMetadata(meta, 99, [
      { id: 'l2', name: 'b.pdf', url: 'v' },
    ]);
    expect(out.folders).toEqual([]);
    expect(out.files.map(f => f.id)).toContain('l1');
    expect(out.files.find(f => f.id === 'l2')).toMatchObject({ financeEntryId: 99 });
  });
});
