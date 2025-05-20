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

// Get file content
router.get('/api/files/content', (req, res) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'File path is required' 
      });
    }
    
    // Sanitize file path to prevent directory traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(vfsRoot, normalizedPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        status: 'error',
        message: `File not found: ${normalizedPath}`
      });
    }
    
    // Check if it's a directory
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return res.status(400).json({
        status: 'error',
        message: `Path is a directory, not a file: ${normalizedPath}`
      });
    }
    
    // Read file content
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Determine file type based on extension
    const extension = path.extname(fullPath).toLowerCase();
    const fileType = getFileType(extension);
    
    return res.status(200).json({
      status: 'success',
      path: normalizedPath,
      content,
      fileType,
      size: stats.size,
      lastModified: stats.mtime
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to read file',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Helper to determine file type based on extension
function getFileType(extension: string): string {
  const codeExts = ['.js', '.jsx', '.ts', '.tsx', '.py', '.rb', '.php', '.java', '.c', '.cpp', '.cs', '.go'];
  const markupExts = ['.html', '.xml', '.svg', '.md', '.mdx'];
  const styleExts = ['.css', '.scss', '.sass', '.less'];
  const dataExts = ['.json', '.yaml', '.yml', '.toml'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  
  if (codeExts.includes(extension)) return 'code';
  if (markupExts.includes(extension)) return 'markup';
  if (styleExts.includes(extension)) return 'style';
  if (dataExts.includes(extension)) return 'data';
  if (imageExts.includes(extension)) return 'image';
  
  return 'text';
}

app.use(router);

export default router; 