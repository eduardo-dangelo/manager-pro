'use client';

import type { MotTest } from '@/components/Assets/vehicle/utils';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIconOutlinedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { Card } from '@/components/common/Card';

import { MotTestResultItem } from './MotTestResultItem';

type MotHistorySidePanelProps = {
  open: boolean;
  onClose: () => void;
  motTests: MotTest[];
};

export function MotHistorySidePanel({
  open,
  onClose,
  motTests,
}: MotHistorySidePanelProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 480, md: 600 },
          boxSizing: 'border-box',
          zIndex: 1000,
        },
        'zIndex': 2000,
      }}
    >
      {/* Drawer Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 3,
            position: 'sticky',
            top: 0,
            my: 0,
            backdropFilter: 'blur(2px)',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(62, 62, 62, 0.8)',
            zIndex: 100,
          }}
        >
          <Typography variant="h6" component="h2">
            Full MOT History
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            position: 'relative',
          }}
        >
          {motTests.map((test, index) => {
            const isPassed = test.testResult === 'PASSED' || test.testResult === 'PASS';
            const isLastTest = index === motTests.length - 1;
            return (
              <Box
                key={test.motTestNumber || `mot-test-${index}`}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'space-between',
                  gap: 1,
                  pb: 0.5,
                }}
              >
                {/* Timeline dot */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
                >
                  <Box
                    sx={{
                      borderRadius: '50%',
                      color: isPassed ? 'success.light' : 'error.light',
                      zIndex: 1,
                      position: 'sticky',
                      top: 0,
                      border: '1px solid',
                      borderColor: isPassed ? 'success.light' : 'error.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPassed ? <CheckCircleIconOutlinedIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                  </Box>

                  <Box sx={{ width: '1px', height: '100%', backgroundColor: isLastTest ? 'transparent' : 'divider', borderRadius: 2 }} />
                </Box>
                <Card sx={{ py: 1, px: 2, flex: 1, mb: 1 }}>
                  <MotTestResultItem
                    test={test}
                    isLatest={index === 0}
                    showDetails
                    showExpiryDate={index === 0}
                  />
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Drawer>
  );
}
