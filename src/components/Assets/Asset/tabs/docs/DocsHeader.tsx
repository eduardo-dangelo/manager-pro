'use client';

import {
  ArrowBack as ArrowBackIcon,
  CreateNewFolder as CreateFolderIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
} from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

type DocsHeaderProps = {
  currentFolderId: string | null;
  currentFolderName: string;
  onBack: () => void;
  onCreateFolder: () => void;
  onUploadClick: () => void;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function DocsHeader({
  currentFolderId,
  currentFolderName,
  onBack,
  onCreateFolder,
  onUploadClick,
  uploading,
  inputRef,
  accept,
  onUploadChange,
}: DocsHeaderProps) {
  const t = useTranslations('Assets');

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {currentFolderId !== null && (
          <>
            <Tooltip title={t('folder_back')}>
              <IconButton size="small" onClick={onBack} aria-label={t('folder_back')}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
              {currentFolderName}
            </Typography>
          </>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CreateFolderIcon />}
          onClick={onCreateFolder}
          sx={{ textTransform: 'none' }}
        >
          {t('folder_create')}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onUploadChange}
          style={{ display: 'none' }}
        />
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <FileUploadOutlinedIcon />}
          onClick={onUploadClick}
          disabled={uploading}
          sx={{ textTransform: 'none' }}
        >
          {t('docs_upload')}
        </Button>
      </Box>
    </Box>
  );
}
