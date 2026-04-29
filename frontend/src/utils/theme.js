import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E53935',
      light: '#FF6F60',
      dark: '#AB000D',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF7043',
      light: '#FFA270',
      dark: '#C63F17',
      contrastText: '#fff',
    },
    background: {
      default: '#F7F3F0',
      paper: '#FFFFFF',
    },
    success: { main: '#2E7D32' },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 700, letterSpacing: 0.3 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 16px rgba(229,57,53,0.35)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          border: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 12 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
  },
});

export default theme;
