import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { complianceAPI } from '../api/api';

const ComplianceReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentId, setDocumentId] = useState('');

  const fetchReports = async (docId: number | null = null) => {
    setLoading(true);
    setError('');
    try {
      // Since backend doesn't have a generic /compliance/reports (it's /compliance/reports/{document_id}),
      // we need to either list all reports or require a document ID
      // For now, let's just show a note or let user enter document ID
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
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Compliance & Failure Analysis Reports
      </Typography>

      <Card sx={{ mt: 4, mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="Document ID"
              type="number"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={handleFetchReports}
              disabled={loading || !documentId}
            >
              {loading ? <CircularProgress size={24} /> : 'Load Reports'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading && <CircularProgress sx={{ mt: 4 }} />}
      {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}
      {!loading && !error && reports.length === 0 && documentId && (
        <Typography variant="body1" sx={{ mt: 4 }}>No reports available for this document</Typography>
      )}
      {reports.map((report, index) => (
        <Card key={report.id || index} sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report {report.id} - Type: {report.report_type}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Standards: {report.standards?.join(", ")}
            </Typography>
            {report.compliance_score !== null && (
              <Typography variant="body2" gutterBottom>
                Compliance Score: {report.compliance_score}%
              </Typography>
            )}
            {report.findings && report.findings.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Findings:</Typography>
                {report.findings.map((finding: string, i: number) => (
                  <Typography key={i} variant="body2">- {finding}</Typography>
                ))}
              </Box>
            )}
            {report.summary && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Summary:</Typography>
                <Typography variant="body2">{report.summary}</Typography>
              </Box>
            )}
            {report.report_content && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Report Content:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
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
