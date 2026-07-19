import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#DC2626',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#DC2626',
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
});
