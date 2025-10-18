'use client';

import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        if (isLast || !item.href) {
          return (
            <Typography
              key={item.label}
              sx={{
                fontSize: '0.875rem',
                color: 'grey.700',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isFirst ? <HomeIcon fontSize="small" /> : item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            key={item.label}
            component={Link}
            href={item.href}
            underline="hover"
            sx={{
              'fontSize': '0.875rem',
              'color': 'grey.600',
              'textDecoration': 'none',
              'display': 'flex',
              'alignItems': 'center',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {isFirst ? <HomeIcon fontSize="small" /> : item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
