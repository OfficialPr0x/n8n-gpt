import React, { useEffect } from 'react';
import FileTree from './components/FileTree';
import CodeEditor from './components/CodeEditor';
import CommandPanel from './components/CommandPanel';
import AgentLog from './components/AgentLog';
import { useFileStore } from './store/fileStore';
import { useLogStore } from './store/logStore';
import './App.css';

const App: React.FC = () => {
  const { 
    selectedFile, 
    fileContent, 
    fileType,
    updateFileContent, 
    saveFileContent, 
    error 
  } = useFileStore();
  
  const { addLog } = useLogStore();
  
  // Log any file system errors
  useEffect(() => {
    if (error) {
      addLog({
        agent: 'system',
        message: `Error: ${error}`,
        type: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }, [error, addLog]);
  
  const handleEditorChange = (content: string) => {
    updateFileContent(content);
  };
  
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    
    addLog({
      agent: 'user',
      message: `Saving file: ${selectedFile}`,
      timestamp: new Date().toISOString()
    });
    
    await saveFileContent();
    
    addLog({
      agent: 'system',
      message: `File saved: ${selectedFile}`,
      type: 'success',
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GPT-n8n Integration</h1>
      </header>
      
      <div className="app-content">
        <div className="left-panel">
          <FileTree />
        </div>
        
        <div className="center-panel">
          <div className="editor-container">
            {selectedFile ? (
              <CodeEditor 
                value={fileContent} 
                language={fileType} 
                onChange={handleEditorChange}
                onSave={handleSaveFile}
              />
            ) : (
              <div className="no-file-selected">
                <p>Select a file to edit</p>
              </div>
            )}
          </div>
          
          <div className="command-container">
            <CommandPanel />
          </div>
        </div>
        
        <div className="right-panel">
          <AgentLog />
        </div>
      </div>
    </div>
  );
};

export default App; 