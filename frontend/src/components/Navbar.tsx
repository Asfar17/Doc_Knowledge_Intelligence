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
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: isDark 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.1)',
    }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ 
            textDecoration: 'none', 
            color: isDark ? '#ffffff' : '#1a1a1a',
            fontWeight: 700,
          }}>
            ET Knowledge Intelligence
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
          <Button sx={{ color: isDark ? '#ffffff' : '#1a1a1a' }} startIcon={<Home />} component={RouterLink} to="/">
            Home
          </Button>
          <Button sx={{ color: isDark ? '#ffffff' : '#1a1a1a' }} startIcon={<UploadFile />} component={RouterLink} to="/upload">
            Upload
          </Button>
          <Button sx={{ color: isDark ? '#ffffff' : '#1a1a1a' }} startIcon={<QuestionAnswer />} component={RouterLink} to="/query">
            Query
          </Button>
          <Button sx={{ color: isDark ? '#ffffff' : '#1a1a1a' }} startIcon={<Hub />} component={RouterLink} to="/graph">
            Graph
          </Button>
          <Button sx={{ color: isDark ? '#ffffff' : '#1a1a1a' }} startIcon={<Assessment />} component={RouterLink} to="/reports">
            Reports
          </Button>
        </Box>

        <IconButton sx={{ color: isDark ? '#ffffff' : '#1a1a1a' }} onClick={toggleTheme}>
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
