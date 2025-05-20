import { create } from 'zustand';

export type Agent = 'system' | 'user' | 'gpt' | 'codegpt' | 'techgpt';

export interface LogEntry {
  agent: Agent;
  message: string;
  timestamp: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
}

interface LogState {
  logs: LogEntry[];
  filter: Agent | 'all';
  
  // Actions
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  setFilter: (filter: Agent | 'all') => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  filter: 'all',
  
  addLog: (log: LogEntry) => {
    set((state) => ({
      logs: [...state.logs, {
        ...log,
        timestamp: log.timestamp || new Date().toISOString()
      }]
    }));
  },
  
  clearLogs: () => {
    set({ logs: [] });
  },
  
  setFilter: (filter: Agent | 'all') => {
    set({ filter });
  }
}));

// Helper function to get filtered logs
export const getFilteredLogs = (logs: LogEntry[], filter: Agent | 'all'): LogEntry[] => {
  if (filter === 'all') {
    return logs;
  }
  return logs.filter(log => log.agent === filter);
}; 