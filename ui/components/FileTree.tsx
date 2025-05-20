import React, { useEffect, useState } from 'react';
import { useFileStore } from '../store/fileStore';
import { useLogStore } from '../store/logStore';
import type { FileNode } from '../store/fileStore';

const FileTreeNode: React.FC<{
  node: FileNode;
  level: number;
  onSelectFile: (path: string) => void;
  selectedFile: string | null;
}> = ({ node, level, onSelectFile, selectedFile }) => {
  const [expanded, setExpanded] = useState(level < 1);
  const isSelected = selectedFile === node.path;
  const isDirectory = node.type === 'directory';
  const hasChildren = isDirectory && node.children && node.children.length > 0;
  
  const toggleExpand = () => {
    if (isDirectory) {
      setExpanded(!expanded);
    }
  };
  
  const handleClick = () => {
    if (isDirectory) {
      toggleExpand();
    } else {
      onSelectFile(node.path);
    }
  };
  
  return (
    <div className="file-tree-node">
      <div 
        className={`file-node ${isSelected ? 'selected' : ''} ${isDirectory ? 'directory' : 'file'}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
      >
        <span className="file-icon">
          {isDirectory ? (expanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="file-name">{node.name}</span>
      </div>
      
      {expanded && hasChildren && (
        <div className="file-children">
          {node.children!.map((child, index) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC = () => {
  const { 
    fileTree, 
    selectedFile, 
    fetchFileTree, 
    selectFile,
    isLoading,
    error 
  } = useFileStore();
  
  const { addLog } = useLogStore();
  
  useEffect(() => {
    // Load file tree on component mount
    fetchFileTree();
    
    addLog({
      agent: 'system',
      message: 'Loaded project file tree',
      timestamp: new Date().toISOString()
    });
  }, [fetchFileTree, addLog]);
  
  const handleSelectFile = (path: string) => {
    selectFile(path);
    
    addLog({
      agent: 'user',
      message: `Selected file: ${path}`,
      timestamp: new Date().toISOString()
    });
  };
  
  if (isLoading && fileTree.length === 0) {
    return <div className="file-tree loading">Loading file tree...</div>;
  }
  
  if (error && fileTree.length === 0) {
    return <div className="file-tree error">Error: {error}</div>;
  }
  
  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h3>Project Files</h3>
        <button
          className="refresh-button"
          onClick={() => fetchFileTree()}
          disabled={isLoading}
        >
          🔄
        </button>
      </div>
      
      <div className="file-tree-content">
        {fileTree.length === 0 ? (
          <div className="empty-tree">No files found</div>
        ) : (
          fileTree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              level={0}
              onSelectFile={handleSelectFile}
              selectedFile={selectedFile}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FileTree; 