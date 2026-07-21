import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { queryAPI } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const QueryInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [vectorResults, setVectorResults] = useState<any[]>([]);
  const [graphResults, setGraphResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!query) return;

    setLoading(true);
    setError('');
    try {
      const res = await queryAPI.sendQuery(query);
      setVectorResults(res.data.vector_results || []);
      setGraphResults(res.data.graph_results || []);
    } catch (err) {
      setError('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        color: isDark ? '#f8fafc' : '#1e293b'
      }}>
        Query Interface
      </Typography>

      <Card sx={{ ...glassCardStyle, mt: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Ask a question"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.4)',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#DC2626',
                },
              },
              '& .MuiInputLabel-root': {
                color: isDark ? '#94a3b8' : '#64748b',
              },
              '& .MuiInputBase-input': {
                color: isDark ? '#f8fafc' : '#1e293b',
              }
            }}
          />
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button 
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Query'}
            </Button>
          </Box>
          {(vectorResults.length > 0 || graphResults.length > 0) && (
            <Box sx={{ mt: 4 }}>
              {vectorResults.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}>
                    Vector Search Results:
                  </Typography>
                  {vectorResults.map((result, idx) => (
                    <Card key={idx} sx={{
                      ...glassCardStyle,
                      mb: 2, 
                      p: 2,
                    }} variant="outlined">
                      <Typography variant="body2" sx={{
                        color: isDark ? '#94a3b8' : '#64748b'
                      }}>
                        Score: {result.score?.toFixed(4) || "N/A"}
                      </Typography>
                      <Typography variant="body1" sx={{
                        color: isDark ? '#f8fafc' : '#1e293b'
                      }}>
                        {result.text}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              )}
              {graphResults.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}>
                    Graph Search Results:
                  </Typography>
                  {graphResults.map((result, idx) => (
                    <Card key={idx} sx={{
                      ...glassCardStyle,
                      mb: 2, 
                      p: 2,
                    }} variant="outlined">
                      <Typography variant="body2" sx={{
                        color: isDark ? '#94a3b8' : '#64748b'
                      }}>
                        Document ID: {result.document_id}
                      </Typography>
                      <Typography variant="body1" sx={{
                        color: isDark ? '#f8fafc' : '#1e293b'
                      }}>
                        Related Entities: {result.related_entities?.join(", ") || "None"}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default QueryInterface;
