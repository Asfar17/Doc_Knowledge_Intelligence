import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { UploadFile, QuestionAnswer, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const glassCardStyle = {
    background: isDark 
      ? 'rgba(15, 23, 42, 0.6)' 
      : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    border: isDark 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    boxShadow: isDark 
      ? '0 4px 30px rgba(0, 0, 0, 0.3)' 
      : '0 4px 30px rgba(0, 0, 0, 0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{
        color: isDark ? '#f8fafc' : '#1e293b',
        textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'
      }}>
        Enterprise Knowledge Intelligence System
      </Typography>
      <Typography variant="body1" align="center" sx={{
        color: isDark ? '#cbd5e1' : '#64748b',
        mb: 6
      }}>
        Advanced document processing, semantic search, and compliance analysis
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <UploadFile sx={{ fontSize: 80, mb: 2, color: '#DC2626' }} />
              <Typography variant="h5" gutterBottom sx={{
                color: isDark ? '#f8fafc' : '#1e293b'
              }}>
                Document Upload
              </Typography>
              <Typography variant="body2" sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                mb: 2
              }}>
                Upload and process documents for knowledge extraction
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/upload')}
                sx={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                  }
                }}
              >
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <QuestionAnswer sx={{ fontSize: 80, mb: 2, color: '#DC2626' }} />
              <Typography variant="h5" gutterBottom sx={{
                color: isDark ? '#f8fafc' : '#1e293b'
              }}>
                Query Interface
              </Typography>
              <Typography variant="body2" sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                mb: 2
              }}>
                Ask questions and get intelligent answers
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/query')}
                sx={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                  }
                }}
              >
                Go to Query
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 80, mb: 2, color: '#DC2626' }} />
              <Typography variant="h5" gutterBottom sx={{
                color: isDark ? '#f8fafc' : '#1e293b'
              }}>
                Compliance Reports
              </Typography>
              <Typography variant="body2" sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                mb: 2
              }}>
                Analyze documents for compliance and failures
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/reports')}
                sx={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                  }
                }}
              >
                Go to Reports
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
