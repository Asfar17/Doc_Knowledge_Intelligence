import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DocumentUpload from './pages/DocumentUpload';
import QueryInterface from './pages/QueryInterface';
import GraphVisualization from './pages/GraphVisualization';
import ComplianceReports from './pages/ComplianceReports';
import { Box, Container, CssBaseline } from '@mui/material';
import { useThemeContext } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { isDark } = useThemeContext();
  
  return (
    <Box sx={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<DocumentUpload />} />
          <Route path="/query" element={<QueryInterface />} />
          <Route path="/graph" element={<GraphVisualization />} />
          <Route path="/reports" element={<ComplianceReports />} />
        </Routes>
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </CustomThemeProvider>
  );
};

export default App;
