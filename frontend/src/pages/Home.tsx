import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { UploadFile, QuestionAnswer, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Enterprise Knowledge Intelligence System
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" gutterBottom sx={{ mb: 6 }}>
        Advanced document processing, semantic search, and compliance analysis
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <UploadFile sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Document Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload and process documents for knowledge extraction
              </Typography>
              <Button variant="contained" onClick={() => navigate('/upload')}>
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <QuestionAnswer sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Query Interface
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ask questions and get intelligent answers
              </Typography>
              <Button variant="contained" onClick={() => navigate('/query')}>
                Go to Query
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Compliance Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Analyze documents for compliance and failures
              </Typography>
              <Button variant="contained" onClick={() => navigate('/reports')}>
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
