'use client';

import type { useTranslations } from 'next-intl';
import type { FilePreviewItem } from '../FilePreviewPopover';
import type { FileItem, FolderItem } from '../types';
import { Collapse, List } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { DROPPABLE_ROOT } from './constants';
import { DocsFileRow } from './DocsFileRow';
import { DocsFolderRow } from './DocsFolderRow';
import { DroppableList } from './DroppableList';

export type DocsFlatListProps = {
  items: (FolderItem | FileItem)[];
  folders: FolderItem[];
  files: FileItem[];
  listItemSx: object;
  savingFileId: string | null;
  savingFolderId: string | null;
  newFolderId: string | null;
  deletingFileId: string | null;
  deletingFolderId: string | null;
  rowDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  folderDropdownRefs: React.MutableRefObject<Record<string, HTMLElement>>;
  isPdf: (item: FilePreviewItem) => boolean;
  onFolderClick: (folderId: string) => void;
  onDocClick: (e: React.MouseEvent<HTMLElement>, item: FilePreviewItem) => void;
  onFileRenameSave: (fileId: string, newName: string) => Promise<void>;
  onFolderRenameSave: (folderId: string, newName: string) => Promise<void>;
  onDeleteFile: (item: FileItem, anchor: HTMLElement) => void;
  onDeleteFolder: (item: FolderItem, anchor: HTMLElement) => void;
  t: ReturnType<typeof useTranslations<'Assets'>>;
};

export function DocsFlatList({
  items,
  folders,
  files,
  listItemSx,
  savingFileId,
  savingFolderId,
  newFolderId,
  deletingFileId,
  deletingFolderId,
  rowDropdownRefs,
  folderDropdownRefs,
  isPdf,
  onFolderClick,
  onDocClick,
  onFileRenameSave,
  onFolderRenameSave,
  onDeleteFile,
  onDeleteFolder,
  t,
}: DocsFlatListProps) {
  return (
    <DroppableList areaId={DROPPABLE_ROOT} folderId={null}>
      <List disablePadding>
        <TransitionGroup component={null}>
          {items.map((item) => {
            if ('type' in item && item.type === 'folder') {
              return (
                <Collapse key={`${item.id}-${item.type}`} timeout={undefined}>
                  <DocsFolderRow
                    folder={item}
                    folders={folders}
                    files={files}
                    listItemSx={listItemSx}
                    folderDropdownRefs={folderDropdownRefs}
                    savingFolderId={savingFolderId}
                    newFolderId={newFolderId}
                    isDeleting={deletingFolderId === item.id}
                    onFolderClick={onFolderClick}
                    onFolderRenameSave={onFolderRenameSave}
                    onDeleteFolder={onDeleteFolder}
                    t={t}
                  />
                </Collapse>
              );
            }
            const file = item as FileItem;
            return (
              <Collapse key={`${file.id}-doc`} timeout={undefined}>
                <DocsFileRow
                  file={file}
                  listItemSx={listItemSx}
                  savingFileId={savingFileId}
                  rowDropdownRefs={rowDropdownRefs}
                  isPdf={isPdf}
                  isDeleting={deletingFileId === file.id}
                  onDocClick={onDocClick}
                  onFileRenameSave={onFileRenameSave}
                  onDeleteFile={onDeleteFile}
                  t={t}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>
      </List>
    </DroppableList>
  );
}
