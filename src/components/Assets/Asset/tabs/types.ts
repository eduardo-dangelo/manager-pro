import type { FilePreviewItem } from './FilePreviewPopover';

export type FolderItem = {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
};

export type FileItem = FilePreviewItem & {
  folderId?: string | null;
};

export type DocsMetadata = {
  folders: FolderItem[];
  files: FileItem[];
};

export type GalleryMetadata = DocsMetadata;

function isLegacyArray(data: unknown): data is FilePreviewItem[] {
  return Array.isArray(data) && data.length >= 0;
}

export function normalizeDocsMetadata(data: unknown): DocsMetadata {
  if (!data) {
    return { folders: [], files: [] };
  }
  if (isLegacyArray(data)) {
    return {
      folders: [],
      files: data.map(f => ({ ...f, folderId: null as string | null })),
    };
  }
  const obj = data as { folders?: FolderItem[]; files?: FileItem[] };
  return {
    folders: Array.isArray(obj.folders) ? obj.folders : [],
    files: Array.isArray(obj.files) ? obj.files : [],
  };
}

export function normalizeGalleryMetadata(data: unknown): GalleryMetadata {
  return normalizeDocsMetadata(data);
}

export function getItemsInFolder(
  folders: FolderItem[],
  files: FileItem[],
  folderId: string | null,
) {
  const subfolders = folders.filter(f => f.parentId === folderId);
  const folderFiles = files.filter(f => (f.folderId ?? null) === folderId);
  return { subfolders, folderFiles };
}

export function isFolderEmpty(
  folders: FolderItem[],
  files: FileItem[],
  folderId: string,
): boolean {
  const { subfolders, folderFiles } = getItemsInFolder(folders, files, folderId);
  if (subfolders.length > 0 || folderFiles.length > 0) {
    return false;
  }
  return true;
}

function getDescendantIds(folders: FolderItem[], folderId: string): Set<string> {
  const ids = new Set<string>();
  const collect = (parentId: string) => {
    for (const f of folders) {
      if (f.parentId === parentId) {
        ids.add(f.id);
        collect(f.id);
      }
    }
  };
  collect(folderId);
  return ids;
}

export function canMoveFolderTo(
  targetFolderId: string | null,
  sourceFolderId: string,
  folders: FolderItem[],
): boolean {
  if (targetFolderId === null) {
    return true;
  }
  if (targetFolderId === sourceFolderId) {
    return false;
  }
  const descendants = getDescendantIds(folders, sourceFolderId);
  if (descendants.has(targetFolderId)) {
    return false;
  }
  return true;
}

export function getFileParentFolderId(file: FileItem): string | null {
  return file.folderId ?? null;
}

export function getFolderParentId(folder: FolderItem): string | null {
  return folder.parentId;
}
