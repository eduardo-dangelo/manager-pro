export const DOCS_ACCEPT = 'application/pdf';

export const DROPPABLE_ROOT = 'droppable-root';
export const droppableId = (folderId: string | null) =>
  folderId === null ? DROPPABLE_ROOT : `droppable-${folderId}`;
export const draggableFileId = (id: string) => `file-${id}`;
export const draggableFolderId = (id: string) => `folder-${id}`;
