import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DocumentUpload from './pages/DocumentUpload';
import QueryInterface from './pages/QueryInterface';
import ComplianceReports from './pages/ComplianceReports';
import { Box } from '@mui/material';

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/query" element={<QueryInterface />} />
            <Route path="/reports" element={<ComplianceReports />} />
          </Routes>
        </Box>
      </Router>
    </CustomThemeProvider>
  );
};

export default App;
