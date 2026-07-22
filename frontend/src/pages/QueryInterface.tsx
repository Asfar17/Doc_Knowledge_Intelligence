import React, { useState, useRef } from 'react';
import {
  Container, Typography, Box, TextField, Button,
  Card, CardContent, CircularProgress, Alert, Divider, Chip,
} from '@mui/material';
import { Send, SmartToy, Search } from '@mui/icons-material';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const SESSION_ID = `session-${Date.now()}`;

const QueryInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [vectorResults, setVectorResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasQueried, setHasQueried] = useState(false);
  const { isDark } = useTheme();

  const glassCard = {
    background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '16px',
    boxShadow: isDark ? '0 4px 30px rgba(0,0,0,0.3)' : '0 4px 30px rgba(0,0,0,0.1)',
  };

  const textColor = { color: isDark ? '#f8fafc' : '#1e293b' };
  const subColor = { color: isDark ? '#94a3b8' : '#64748b' };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setAiResponse('');
    setVectorResults([]);
    setHasQueried(true);

    try {
      // Try agent endpoint first (gives AI response)
      const formData = new FormData();
      formData.append('query', query);
      formData.append('session_id', SESSION_ID);

      const res = await api.post('/query/agent', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setAiResponse(res.data.response || '');
      setVectorResults(res.data.vector_results || []);
    } catch {
      // Fall back to basic query endpoint
      try {
        const res = await api.post('/query/', { query, top_k: 5 });
        setVectorResults(res.data.vector_results || []);
        if (res.data.vector_results?.length === 0) {
          setAiResponse('No relevant documents found. Please upload documents first.');
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to get response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
      <Typography variant="h4" gutterBottom sx={textColor}>
        Query Interface
      </Typography>
      <Typography variant="body2" sx={{ ...subColor, mb: 3 }}>
        Ask questions about your uploaded documents. Press Ctrl+Enter to send.
      </Typography>

      {/* Input card */}
      <Card sx={{ ...glassCard, mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth multiline rows={4}
            label="Ask a question about your documents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              '& .MuiInputBase-input': textColor,
              '& .MuiInputLabel-root': subColor,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#DC2626' },
              },
            }}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={subColor}>Ctrl+Enter to send</Typography>
            <Button
              variant="contained" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
              onClick={handleSubmit} disabled={loading || !query.trim()}
              sx={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', '&:hover': { background: 'linear-gradient(135deg, #B91C1C, #DC2626)' } }}
            >
              {loading ? 'Thinking...' : 'Send Query'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

      {/* AI Response */}
      {aiResponse && (
        <Card sx={{ ...glassCard, mb: 3, borderLeft: '4px solid #DC2626' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SmartToy sx={{ color: '#DC2626' }} />
              <Typography variant="h6" sx={textColor}>AI Response</Typography>
            </Box>
            <Typography variant="body1" sx={{ ...textColor, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {aiResponse}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Source Documents */}
      {vectorResults.length > 0 && (
        <Card sx={glassCard}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Search sx={{ color: '#DC2626' }} />
              <Typography variant="h6" sx={textColor}>Source Documents</Typography>
              <Chip label={`${vectorResults.length} found`} size="small" sx={{ background: '#DC2626', color: '#fff' }} />
            </Box>
            {vectorResults.map((result, idx) => (
              <Box key={idx}>
                {idx > 0 && <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={subColor}>Source {idx + 1}</Typography>
                  <Chip
                    label={`Score: ${result.score?.toFixed(3) || 'N/A'}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', ...subColor }}
                  />
                </Box>
                <Typography variant="body2" sx={textColor}>{result.text}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {hasQueried && !loading && !error && vectorResults.length === 0 && !aiResponse && (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No results found. Make sure you've uploaded and processed documents first.
        </Alert>
      )}
    </Container>
  );
};

export default QueryInterface;
