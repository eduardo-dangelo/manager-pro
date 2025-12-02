'use client';

import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Asset = {
  id: number;
  name: string;
  type?: string | null;
  metadata?: Record<string, any>;
  objectives?: any[];
  todos?: any[];
  sprints?: any[];
};

type PropertyQuickLinksSectionProps = {
  asset: Asset;
  locale: string;
  onUpdateAsset: (asset: Asset) => void;
};

type QuickLink = {
  title: string;
  url: string;
  icon?: string;
};

export function PropertyQuickLinksSection({
  asset,
  locale,
  onUpdateAsset,
}: PropertyQuickLinksSectionProps) {
  const t = useTranslations('Assets');
  const [isEditing, setIsEditing] = useState(false);

  const metadata = asset.metadata || {};
  const links: QuickLink[] = metadata.links || [];

  const defaultLinks: QuickLink[] = [
    { title: t('link_mortgage'), url: '', icon: '🏦' },
    { title: t('link_insurance'), url: '', icon: '🛡️' },
    { title: t('link_utilities'), url: '', icon: '💡' },
    { title: t('link_maintenance'), url: '', icon: '🔧' },
    { title: t('link_taxes'), url: '', icon: '📄' },
    { title: t('link_legal'), url: '', icon: '⚖️' },
  ];

  const displayLinks = links.length > 0 ? links : defaultLinks;

  const handleUpdateLinks = async (updatedLinks: QuickLink[]) => {
    try {
      const updatedMetadata = {
        ...metadata,
        links: updatedLinks,
      };

      const response = await fetch(`/${locale}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const { asset: updatedAsset } = await response.json();
      onUpdateAsset({ ...asset, metadata: updatedMetadata });
    } catch (error) {
      console.error('Error updating links:', error);
    }
  };

  const handleLinkChange = (index: number, field: keyof QuickLink, value: string) => {
    const updatedLinks = [...displayLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    handleUpdateLinks(updatedLinks);
  };

  const handleAddLink = () => {
    const updatedLinks = [...displayLinks, { title: '', url: '', icon: '🔗' }];
    handleUpdateLinks(updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = displayLinks.filter((_, i) => i !== index);
    handleUpdateLinks(updatedLinks);
  };

  const LinkCard = ({ link, index }: { link: QuickLink; index: number }) => {
    return (
      <Box
        sx={{
          borderLeft: '2px solid',
          borderColor: 'divider',
          pl: 2,
          py: 1.5,
          minHeight: 100,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          {isEditing
            ? (
                <TextField
                  value={link.title}
                  onChange={e => handleLinkChange(index, 'title', e.target.value)}
                  size="small"
                  placeholder={t('link_title')}
                  sx={{ width: '100%' }}
                />
              )
            : (
                link.title
              )}
          :
        </Typography>

        {isEditing
          ? (
              <TextField
                fullWidth
                value={link.url}
                onChange={e => handleLinkChange(index, 'url', e.target.value)}
                size="small"
                placeholder={t('link_url')}
                sx={{ mb: 1 }}
              />
            )
          : link.url
            ? (
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    'display': 'flex',
                    'alignItems': 'center',
                    'gap': 0.5,
                    'color': 'text.primary',
                    'textDecoration': 'underline',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.icon && <span>{link.icon}</span>}
                  <Typography variant="body2">{link.url}</Typography>
                </Link>
              )
            : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('no_link_added')}
                </Typography>
              )}

        {isEditing && (
          <IconButton
            size="small"
            onClick={() => handleRemoveLink(index)}
            sx={{ mt: 1, color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {t('property_quick_links_title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditing && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddLink}
              sx={{ textTransform: 'none' }}
            >
              {t('add_link')}
            </Button>
          )}
          <IconButton
            size="small"
            onClick={() => setIsEditing(!isEditing)}
            sx={{ color: 'text.secondary' }}
          >
            {isEditing ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {displayLinks.map((link, index) => (
          <Grid item xs={12} md={4} key={index}>
            <LinkCard link={link} index={index} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
