import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create necessary directories if they don't exist
const dirs = ['api/gpt', 'api/files', 'api/n8n', 'public', 'vfs'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Import routes
import n8nTriggerRouter from './api/n8n/trigger.js';
import filesSaveRouter from './api/files/save.js';
import filesTreeRouter from './api/files/tree.js';
import filesContentRouter from './api/files/content.js';
import gptGenerateRouter from './api/gpt/generate.js';

// Use routes
app.use(n8nTriggerRouter);
app.use(filesSaveRouter);
app.use(filesTreeRouter);
app.use(filesContentRouter);
app.use(gptGenerateRouter);

// Route handlers
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to check if server is alive (for CI/CD)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`OpenAPI spec available at: http://localhost:${PORT}/openapi.yaml`);
  console.log(`API docs available at: http://localhost:${PORT}`);
});
