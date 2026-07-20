// Simple static file server for Azure Web App
// Serves the Vite build output (dist/) on the port Azure provides
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist');

// Serve static files from the Vite build
app.use(express.static(DIST));

// SPA fallback — all routes serve index.html so React Router works
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend serving on port ${PORT}`);
});
