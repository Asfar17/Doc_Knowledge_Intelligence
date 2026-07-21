import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';
import { documentsAPI } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const GraphVisualization: React.FC = () => {
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
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

  const fetchGraphData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await documentsAPI.getGraphData();
      setGraphData(res.data);
    } catch (err) {
      setError('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        color: isDark ? '#f8fafc' : '#1e293b'
      }}>
        Knowledge Graph Visualization
      </Typography>

      {loading && <CircularProgress sx={{ mt: 4 }} />}
      {error && <Alert severity="error" sx={{ mt: 4, borderRadius: '12px' }}>{error}</Alert>}
      {!loading && !error && (
        <Card sx={{ ...glassCardStyle, mt: 4, height: '70vh' }}>
          <CardContent sx={{ height: '100%', p: 0 }}>
            <Box sx={{ height: '100%' }}>
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="name"
                nodeColor="color"
                linkWidth={2}
                linkColor="#94a3b8"
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.1}
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default GraphVisualization;
