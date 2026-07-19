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

const QueryInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [vectorResults, setVectorResults] = useState<any[]>([]);
  const [graphResults, setGraphResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Query Interface
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Ask a question"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            multiline
            rows={4}
          />
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Query'}
            </Button>
          </Box>
          {(vectorResults.length > 0 || graphResults.length > 0) && (
            <Box sx={{ mt: 4 }}>
              {vectorResults.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Vector Search Results:
                  </Typography>
                  {vectorResults.map((result, idx) => (
                    <Card key={idx} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Score: {result.score?.toFixed(4) || "N/A"}
                      </Typography>
                      <Typography variant="body1">{result.text}</Typography>
                    </Card>
                  ))}
                </Box>
              )}
              {graphResults.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Graph Search Results:
                  </Typography>
                  {graphResults.map((result, idx) => (
                    <Card key={idx} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Document ID: {result.document_id}
                      </Typography>
                      <Typography variant="body1">
                        Related Entities: {result.related_entities?.join(", ") || "None"}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default QueryInterface;
