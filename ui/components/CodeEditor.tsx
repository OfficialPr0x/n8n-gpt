import React, { useState, useEffect } from 'react';
import { useLogStore } from '../store/logStore';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  language, 
  onChange,
  onSave 
}) => {
  const [content, setContent] = useState(value || '');
  const { addLog } = useLogStore();

  // Sync content with parent component value
  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle save keyboard shortcut (Ctrl+S or Cmd+S)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      addLog({
        agent: 'system',
        message: 'File saved via keyboard shortcut',
        type: 'info',
        timestamp: new Date().toISOString()
      });
    }

    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      onChange(newContent);
      
      // Move cursor position after the inserted tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Return appropriate CSS class based on the language
  const getLanguageClass = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return 'language-javascript';
      case 'typescript':
      case 'ts':
        return 'language-typescript';
      case 'json':
        return 'language-json';
      case 'html':
        return 'language-html';
      case 'css':
        return 'language-css';
      case 'markdown':
      case 'md':
        return 'language-markdown';
      default:
        return '';
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="language-indicator">
          {language || 'text'}
        </div>
        <button 
          className="save-button" 
          onClick={onSave}
        >
          Save
        </button>
      </div>
      <textarea
        className={`editor-textarea ${getLanguageClass()}`}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter code here..."
        spellCheck={false}
      />
    </div>
  );
};

export default CodeEditor;
