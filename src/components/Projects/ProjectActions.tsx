'use client';

import { DropdownButton } from '@/components/common/DropdownButton';

type ProjectActionsProps = {
  projectId: number;
  locale: string;
  onDeleted?: () => void;
  onCompleted?: () => void;
};

export function ProjectActions({ projectId, locale, onDeleted, onCompleted }: ProjectActionsProps) {
  const markComplete = async () => {
    try {
      await fetch(`/${locale}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      onCompleted?.();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProject = async () => {
    try {
      await fetch(`/${locale}/api/projects/${projectId}`, { method: 'DELETE' });
      onDeleted?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DropdownButton
      options={[
        {
          label: 'Mark as complete',
          onClick: markComplete,
        },
        {
          label: 'Delete',
          onClick: deleteProject,
          sx: { color: 'error.main' },
        },
      ]}
      tooltip="Project actions"
    />
  );
}
