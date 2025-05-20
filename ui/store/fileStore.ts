import { create } from 'zustand';
import { getFileTree, getFileContent, saveFile } from '../services/api';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

interface FileState {
  fileTree: FileNode[];
  selectedFile: string | null;
  fileContent: string;
  fileType: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFileTree: () => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  updateFileContent: (content: string) => void;
  saveFileContent: () => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  fileTree: [],
  selectedFile: null,
  fileContent: '',
  fileType: '',
  isLoading: false,
  error: null,
  
  fetchFileTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getFileTree();
      if (response.status === 'success' && response.tree) {
        set({ fileTree: response.tree, isLoading: false });
      } else {
        set({ error: 'Failed to fetch file tree', isLoading: false });
      }
    } catch (error) {
      set({ error: `Error fetching file tree: ${error instanceof Error ? error.message : String(error)}`, isLoading: false });
    }
  },
  
  selectFile: async (path: string) => {
    set({ isLoading: true, error: null, selectedFile: path });
    
    try {
      const response = await getFileContent(path);
      if (response.status === 'success') {
        set({ 
          fileContent: response.content || '', 
          fileType: response.fileType || '',
          isLoading: false 
        });
      } else {
        set({ 
          error: 'Failed to load file content', 
          fileContent: '', 
          fileType: '',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: `Error loading file: ${error instanceof Error ? error.message : String(error)}`,
        fileContent: '',
        fileType: '',
        isLoading: false 
      });
    }
  },
  
  updateFileContent: (content: string) => {
    set({ fileContent: content });
  },
  
  saveFileContent: async () => {
    const { selectedFile, fileContent } = get();
    
    if (!selectedFile) {
      set({ error: 'No file selected to save' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await saveFile(selectedFile, fileContent);
      if (response.status === 'success') {
        set({ isLoading: false });
      } else {
        set({ error: 'Failed to save file', isLoading: false });
      }
    } catch (error) {
      set({ error: `Error saving file: ${error instanceof Error ? error.message : String(error)}`, isLoading: false });
    }
  }
})); 