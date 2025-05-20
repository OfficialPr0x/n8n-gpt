import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
}

interface LogState {
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addLogs: (logs: Omit<LogEntry, 'id' | 'timestamp'>[]) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      logs: [],
      
      addLog: (log) => set((state) => ({
        logs: [
          ...state.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...log
          }
        ]
      })),
      
      addLogs: (newLogs) => set((state) => ({
        logs: [
          ...state.logs,
          ...newLogs.map(log => ({
            id: Date.now() + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            ...log
          }))
        ]
      })),
      
      clearLogs: () => set({ logs: [] })
    }),
    {
      name: 'agent-logs-storage',
    }
  )
);

// Predefined agents
export const agents = {
  CODE_COMMANDER: 'CodeCommander',
  TECHNICAL_STRATEGIST: 'TechnicalStrategist',
  DEPLOYMENT_SPECIALIST: 'DeploymentSpecialist',
  N8N_EXECUTOR: 'n8nExecutor',
  SYSTEM: 'System'
};

// Helper function to create agent logs from API responses
export const createLogFromResponse = (response: any): LogEntry | null => {
  if (!response) return null;
  
  // If the response already contains a log entry
  if (response.log && response.log.id) {
    return response.log as LogEntry;
  }
  
  // Create a log entry from the response
  const type = response.status === 'success' ? 'success' : 'error';
  const agent = response.agent || agents.SYSTEM;
  const message = response.data?.summary || response.message || 'Operation completed';
  
  return {
    id: Date.now().toString(),
    timestamp: response.timestamp || new Date().toISOString(),
    agent,
    message,
    type
  };
};

export default useLogStore; 