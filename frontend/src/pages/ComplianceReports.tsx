import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from '@mui/material';
import { complianceAPI } from '../api/api';
import { useTheme } from '../context/ThemeContext';

const ComplianceReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentId, setDocumentId] = useState('');
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

  const fetchReports = async (docId: number | null = null) => {
    setLoading(true);
    setError('');
    try {
      if (docId) {
        const res = await complianceAPI.getReportsByDocument(docId);
        setReports(res.data || []);
      }
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initially don't fetch anything since we need document ID
  }, []);

  const handleFetchReports = () => {
    if (documentId) {
      fetchReports(parseInt(documentId));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        color: isDark ? '#f8fafc' : '#1e293b'
      }}>
        Compliance & Failure Analysis Reports
      </Typography>

      <Card sx={{ ...glassCardStyle, mt: 4, mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              label="Document ID"
              type="number"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              variant="outlined"
              sx={{
                flexGrow: 1,
                minWidth: '200px',
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
            <Button 
              variant="contained"
              onClick={handleFetchReports}
              disabled={loading || !documentId}
              sx={{
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                },
                height: '56px'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Load Reports'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading && <CircularProgress sx={{ mt: 4 }} />}
      {error && <Alert severity="error" sx={{ mt: 4, borderRadius: '12px' }}>{error}</Alert>}
      {!loading && !error && reports.length === 0 && documentId && (
        <Typography variant="body1" sx={{ mt: 4, color: isDark ? '#cbd5e1' : '#64748b' }}>
          No reports available for this document
        </Typography>
      )}
      {reports.map((report, index) => (
        <Card key={report.id || index} sx={{ ...glassCardStyle, mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{
              color: isDark ? '#f8fafc' : '#1e293b'
            }}>
              Report {report.id} - Type: {report.report_type}
            </Typography>
            <Typography variant="body2" sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              mb: 1
            }}>
              Standards: {report.standards?.join(", ")}
            </Typography>
            {report.compliance_score !== null && (
              <Typography variant="body2" sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                mb: 1
              }}>
                Compliance Score: {report.compliance_score}%
              </Typography>
            )}
            {report.findings && report.findings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{
                  color: isDark ? '#f8fafc' : '#1e293b'
                }}>
                  Findings:
                </Typography>
                {report.findings.map((finding: string, i: number) => (
                  <Typography key={i} variant="body2" sx={{
                    color: isDark ? '#cbd5e1' : '#64748b'
                  }}>
                    - {finding}
                  </Typography>
                ))}
              </Box>
            )}
            {report.summary && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{
                  color: isDark ? '#f8fafc' : '#1e293b'
                }}>
                  Summary:
                </Typography>
                <Typography variant="body2" sx={{
                  color: isDark ? '#cbd5e1' : '#64748b'
                }}>
                  {report.summary}
                </Typography>
              </Box>
            )}
            {report.report_content && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{
                  color: isDark ? '#f8fafc' : '#1e293b'
                }}>
                  Report Content:
                </Typography>
                <Typography variant="body2" sx={{
                  color: isDark ? '#cbd5e1' : '#64748b',
                  whiteSpace: 'pre-wrap'
                }}>
                  {report.report_content}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default ComplianceReports;
