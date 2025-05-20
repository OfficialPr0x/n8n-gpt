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

// Helper function to build file tree
const buildFileTree = (dir: string, basePath: string = ''): any[] => {
  const files = fs.readdirSync(dir);
  
  return files.map(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      return {
        name: file,
        path: relativePath,
        type: 'directory',
        children: buildFileTree(filePath, relativePath)
      };
    } else {
      return {
        name: file,
        path: relativePath,
        type: 'file',
        size: stats.size
      };
    }
  });
};

// Get file tree
router.get('/api/files/tree', (req, res) => {
  try {
    if (!fs.existsSync(vfsRoot)) {
      return res.status(200).json({
        status: 'success',
        tree: []
      });
    }
    
    const tree = buildFileTree(vfsRoot);
    
    return res.status(200).json({
      status: 'success',
      tree
    });
  } catch (error) {
    console.error('Error getting file tree:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve file tree',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.use(router);

export default router; 