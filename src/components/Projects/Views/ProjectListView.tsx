'use client';

import {
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  Flight as FlightIcon,
  Folder as FolderIcon,
  HomeWork as HomeWorkIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';

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

type ProjectListViewProps = {
  projects: Project[];
  locale: string;
};

// Removed status column

const projectTypeIcons = {
  vehicle: DirectionsCarIcon,
  property: HomeWorkIcon,
  cashflow: AttachMoneyIcon,
  trip: FlightIcon,
  band: MusicNoteIcon,
};

// Helper function to pluralize project types for routes
const pluralizeType = (type: string): string => {
  const pluralMap: Record<string, string> = {
    vehicle: 'vehicles',
    property: 'properties',
    cashflow: 'cashflow',
    trip: 'trips',
    band: 'bands',
  };
  return pluralMap[type] || `${type}s`;
};

export function ProjectListView({ projects, locale }: ProjectListViewProps) {
  return (
    <TableContainer
      sx={{
        'bgcolor': 'white',
        'borderRadius': 2,
        // border: 1,
        // borderColor: 'grey.200',
        // boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        'transition': 'box-shadow 0.2s ease',
        '&:hover': {
          // boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Table
        size="small"
        sx={{
          '& .MuiTableCell-root': { py: 0.75 },
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'grey.700', display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
            {/* Status column removed */}
            <TableCell sx={{ fontWeight: 600, color: 'grey.700', display: { xs: 'none', sm: 'table-cell' } }}>Progress</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'grey.700', display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>Tasks</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Modified</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project, index) => {
            const ProjectIcon = projectTypeIcons[project.type as keyof typeof projectTypeIcons] || FolderIcon;

            return (
              <TableRow
                key={project.id}
                component={Link}
                href={`/${locale}/projects/${pluralizeType(project.type)}/${project.id}`}
                sx={{
                  'textDecoration': 'none',
                  'cursor': 'pointer',
                  'bgcolor': index % 2 === 1 ? 'grey.100' : 'inherit',
                  '&:hover': {
                    bgcolor: 'grey.50',
                  },
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: 'grey.900',
                          mb: 0.25,
                        }}
                      >
                        {project.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'grey.600',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ProjectIcon sx={{ fontSize: 18, color: 'grey.700' }} />
                    <Typography variant="body2" sx={{ color: 'grey.700', textTransform: 'capitalize' }}>
                      {project.type}
                    </Typography>
                  </Box>
                </TableCell>
                {/* Status column removed */}
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    --%
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    --
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
