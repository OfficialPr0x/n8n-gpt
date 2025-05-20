import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const app = express();
app.use(express.json());

// Virtual file system root
const vfsRoot = path.join(__dirname, '../../vfs');

// Ensure VFS directory exists
if (!fs.existsSync(vfsRoot)) {
  fs.mkdirSync(vfsRoot, { recursive: true });
}

// Save a file to the virtual file system
router.post('/api/files/save', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'File path and content are required' 
      });
    }
    
    // Sanitize file path to prevent directory traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(vfsRoot, normalizedPath);
    
    // Create directories if they don't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write content to file
    fs.writeFileSync(fullPath, content);
    
    return res.status(200).json({
      status: 'success',
      path: normalizedPath
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save file',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.use(router);

export default router; 