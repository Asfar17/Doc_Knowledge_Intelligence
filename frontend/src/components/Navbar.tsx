import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import {
  Brightness4, Brightness7, Home, UploadFile, QuestionAnswer, Assessment, Hub 
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppBar position="static" color="primary" sx={{
      background: isDark 
        ? 'rgba(15, 23, 42, 0.7)' 
        : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      borderBottom: isDark 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.1)',
    }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            ET Knowledge Intelligence
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
          <Button color="inherit" startIcon={<Home />} component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" startIcon={<UploadFile />} component={RouterLink} to="/upload">
            Upload
          </Button>
          <Button color="inherit" startIcon={<QuestionAnswer />} component={RouterLink} to="/query">
            Query
          </Button>
          <Button color="inherit" startIcon={<Hub />} component={RouterLink} to="/graph">
            Graph
          </Button>
          <Button color="inherit" startIcon={<Assessment />} component={RouterLink} to="/reports">
            Reports
          </Button>
        </Box>

        <IconButton color="inherit" onClick={toggleTheme}>
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
