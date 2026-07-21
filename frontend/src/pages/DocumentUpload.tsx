import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { documentsAPI } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setSuccess(false);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      await documentsAPI.uploadDocument(file);
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        color: isDark ? '#f8fafc' : '#1e293b'
      }}>
        Document Upload
      </Typography>

      <Card sx={{ ...glassCardStyle, mt: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CloudUpload sx={{ fontSize: 80, mb: 2, color: '#DC2626' }} />
            <Typography variant="h6" gutterBottom sx={{
              color: isDark ? '#f8fafc' : '#1e293b'
            }}>
              Select a document to upload
            </Typography>
            <Typography variant="body2" sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              mb: 2
            }}>
              Supported formats: PDF, PPT, TXT, CSV, XLS, Images
            </Typography>
            <Box sx={{ mt: 4 }}>
              <input
                accept=".pdf,.ppt,.pptx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button 
                  variant="contained" 
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                    }
                  }}
                >
                  Choose File
                </Button>
              </label>
              {file && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}>
                    Selected: {file.name}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleUpload} 
                    disabled={uploading} 
                    sx={{ 
                      mt: 2,
                      background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                      }
                    }}
                  >
                    {uploading ? <CircularProgress size={24} /> : 'Upload'}
                  </Button>
                </Box>
              )}
            </Box>
            {success && (
              <Alert severity="success" sx={{ mt: 2, borderRadius: '12px' }}>
                Document uploaded successfully!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DocumentUpload;
