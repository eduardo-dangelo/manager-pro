'use client';

import { ProjectColumnsView } from '@/components/Projects/Views/ProjectColumnsView';
import { ProjectFolderView } from '@/components/Projects/Views/ProjectFolderView';
import { ProjectListView } from '@/components/Projects/Views/ProjectListView';

type Project = {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

type ViewMode = 'folder' | 'list' | 'columns';
type CardSize = 'small' | 'medium' | 'large';
type SortBy = 'dateCreated' | 'dateModified' | 'name' | 'type' | 'status';

type ProjectsListProps = {
  projects: Project[];
  locale: string;
  viewMode: ViewMode;
  cardSize: CardSize;
  sortBy: SortBy;
  searchQuery: string;
  onProjectDeleted?: (projectId: number) => void;
};

export function ProjectsList({ projects, locale, viewMode, cardSize, sortBy, searchQuery, onProjectDeleted }: ProjectsListProps) {
  // Filter projects by search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort projects based on sortBy
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'dateCreated':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'dateModified':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Render different views
  if (viewMode === 'list') {
    return (
      <ProjectListView projects={sortedProjects} locale={locale} onProjectDeleted={onProjectDeleted} />
    );
  }

  if (viewMode === 'columns') {
    return <ProjectColumnsView projects={sortedProjects} locale={locale} onProjectDeleted={onProjectDeleted} />;
  }

  // Default folder view
  return (
    <ProjectFolderView projects={sortedProjects} locale={locale} cardSize={cardSize} onProjectDeleted={onProjectDeleted} />
  );
}
