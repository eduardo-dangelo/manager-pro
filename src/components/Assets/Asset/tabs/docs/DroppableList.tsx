'use client';

import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';

type DroppableListProps = {
  areaId: string;
  folderId: string | null;
  children: React.ReactNode;
};

export function DroppableList({ areaId, folderId, children }: DroppableListProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: areaId,
    data: { folderId },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 40,
        borderRadius: 1,
        border: isOver ? 2 : 0,
        borderColor: 'primary.main',
        borderStyle: 'dashed',
        ...(isOver ? { bgcolor: 'action.selected' } : {}),
      }}
    >
      {children}
    </Box>
  );
}
