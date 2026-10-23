import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getDb, queryOne, runTransaction } from './server/db.js';
import { router as apiRouter } from './server/routes.js';
import { parseRawInput, classifyImport, applyImport } from './server/importer.js';
import { generateAllExports } from './server/exporter.js';
import { generatePresentation } from './server/presentation-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize SQLite Database
  await getDb();

  // Check if initial seeding is needed
  try {
    const existingCount = queryOne<{ count: number }>('SELECT count(*) as count FROM conversations');
    if (!existingCount || existingCount.count === 0) {
      console.log('Database empty. Seeding initial demonstration dataset...');
      const sampleCsvPath = path.join(__dirname, 'data', 'sample_conversations.csv');
      if (fs.existsSync(sampleCsvPath)) {
        const csvContent = fs.readFileSync(sampleCsvPath, 'utf8');
        const rows = parseRawInput(csvContent, 'csv');
        const preview = classifyImport(rows, 'sample_conversations.csv', 'csv');
        applyImport(preview, 'system_bootstrap@sales-intel.internal');
        console.log(`Seeded ${preview.newCount} conversations successfully.`);
      }
    }
  } catch (err) {
    console.error('Error during database bootstrap check:', err);
  }

  // Generate initial export manifest & presentation file if missing
  try {
    generateAllExports({});
    const pptxPath = path.join(__dirname, 'presentation', 'sales-review-findings.pptx');
    if (!fs.existsSync(pptxPath)) {
      await generatePresentation(pptxPath);
      console.log('Generated executive 5-slide presentation PPTX.');
    }
  } catch (err) {
    console.warn('Initial file pre-generation note:', err);
  }

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Sales Call Intelligence Dashboard', port: PORT });
  });

  if (!isProd) {
    // In development mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Mounted Vite development middleware.');
  } else {
    // In production mode, serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`Serving static production build from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sales Call Intelligence Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
