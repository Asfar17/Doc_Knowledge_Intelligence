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

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Document Upload
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CloudUpload sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Select a document to upload
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
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
                <Button variant="contained" component="span">
                  Choose File
                </Button>
              </label>
              {file && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">Selected: {file.name}</Typography>
                  <Button
                    variant="contained" color="primary" onClick={handleUpload} disabled={uploading} sx={{ mt: 2 }}>
                    {uploading ? <CircularProgress size={24} /> : 'Upload'}
                  </Button>
                </Box>
              )}
            </Box>
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Document uploaded successfully!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
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
