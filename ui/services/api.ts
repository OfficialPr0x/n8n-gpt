import { useLogStore, createLogFromResponse, agents } from '../stores/LogStore';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Base API request function
export const apiRequest = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  const response = await fetch(endpoint, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  // Log the response if available
  const logStore = useLogStore.getState();
  const logEntry = createLogFromResponse(data);
  if (logEntry) {
    logStore.addLog(logEntry);
  }
  
  return data as T;
};

// Workflow API
export interface WorkflowInput {
  [key: string]: any;
}

export interface WorkflowResponse {
  status: string;
  data: {
    summary: string;
    workflowId: string;
    executionData: any;
    repoUrl?: string;
    deployedUrl?: string;
    projectName?: string;
    features?: string[];
    [key: string]: any;
  };
  log?: any;
  timestamp: string;
}

export const triggerWorkflow = async (workflowId: string, input: WorkflowInput): Promise<WorkflowResponse> => {
  try {
    // Log initiating workflow
    const logStore = useLogStore.getState();
    logStore.addLog({
      agent: agents.TECHNICAL_STRATEGIST,
      message: `Initiating workflow: ${workflowId}`,
      type: 'info'
    });
    
    const response = await apiRequest<WorkflowResponse>('/api/n8n/trigger', {
      method: 'POST',
      body: { workflowId, input }
    });
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log error
    const logStore = useLogStore.getState();
    logStore.addLog({
      agent: agents.SYSTEM,
      message: `Error triggering workflow: ${errorMessage}`,
      type: 'error'
    });
    
    throw error;
  }
};

// File System API
export interface FileContent {
  path: string;
  content: string;
}

export interface FileSaveResponse {
  status: string;
  path: string;
}

export const saveFile = async (path: string, content: string): Promise<FileSaveResponse> => {
  return apiRequest<FileSaveResponse>('/api/files/save', {
    method: 'POST',
    body: { path, content }
  });
};

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
}

export interface FileTreeResponse {
  status: string;
  tree: FileTreeNode[];
}

export const getFileTree = async (): Promise<FileTreeResponse> => {
  return apiRequest<FileTreeResponse>('/api/files/tree');
};

export interface FileContentResponse {
  status: string;
  path: string;
  content: string;
  fileType: string;
  size: number;
  lastModified: string;
}

export const getFileContent = async (filePath: string): Promise<FileContentResponse> => {
  try {
    const logStore = useLogStore.getState();
    logStore.addLog({
      agent: agents.SYSTEM,
      message: `Reading file: ${filePath}`,
      type: 'info'
    });
    
    const response = await apiRequest<FileContentResponse>(`/api/files/content?path=${encodeURIComponent(filePath)}`);
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const logStore = useLogStore.getState();
    logStore.addLog({
      agent: agents.SYSTEM,
      message: `Error reading file: ${errorMessage}`,
      type: 'error'
    });
    
    throw error;
  }
};

// Code Generation API
export interface GenerateCodeResponse {
  status: string;
  code: string;
  prompt: string;
  timestamp: string;
}

export const generateCode = async (prompt: string, context?: any): Promise<GenerateCodeResponse> => {
  try {
    const logStore = useLogStore.getState();
    logStore.addLog({
      agent: agents.CODE_COMMANDER,
      message: `Generating code for: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
      type: 'info'
    });
    
    const response = await apiRequest<GenerateCodeResponse>('/api/gpt/generate', {
      method: 'POST',
      body: { prompt, context }
    });
    
    // Log success
    logStore.addLog({
      agent: agents.CODE_COMMANDER,
      message: 'Code generated successfully',
      type: 'success'
    });
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log error
    const logStore = useLogStore.getState();
    logStore.addLog({
      agent: agents.CODE_COMMANDER,
      message: `Failed to generate code: ${errorMessage}`,
      type: 'error'
    });
    
    throw error;
  }
}; 