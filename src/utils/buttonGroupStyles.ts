import type { Theme } from '@mui/material/styles';

export function getButtonGroupSx(theme: Theme) {
  return {
    'color': theme.palette.text.secondary,
    '&:hover': {
      bgcolor: theme.palette.action.hover,
    },
    '& .MuiToggleButtonGroup-root': {
      border: 'none',
    },
    '& .MuiToggleButton-root': {
      'color': theme.palette.text.secondary,
      'height': 30,
      // 'width': 30,
      'border': 'none',
      'bgcolor': 'transparent',
      'borderRadius': '6px',
      'transition': 'all 0.2s ease',
      'textTransform': 'none',
      '&:hover': {
        bgcolor: theme.palette.action.hover,
      },
      '&.Mui-selected': {
        'color': theme.palette.text.primary,
        'bgcolor': theme.palette.action.selected,
        'borderRadius': '6px',
        '&:hover': {
          bgcolor: theme.palette.action.hover,
        },
      },
    },
  };
}
