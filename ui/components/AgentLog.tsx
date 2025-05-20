import React, { useState } from 'react';
import { useLogStore, getFilteredLogs, type Agent, type LogEntry } from '../store/logStore';

// Simple component to format timestamps
const TimeStamp: React.FC<{ time: string }> = ({ time }) => {
  const date = new Date(time);
  const formattedTime = date.toLocaleTimeString();
  return <span className="log-time">{formattedTime}</span>;
};

// Agent avatar component
const AgentAvatar: React.FC<{ agent: Agent }> = ({ agent }) => {
  const avatars: Record<Agent, string> = {
    system: '🖥️',
    user: '👤',
    gpt: '🤖',
    codegpt: '👨‍💻',
    techgpt: '👩‍🔬'
  };

  return <span className={`agent-avatar ${agent}`}>{avatars[agent]}</span>;
};

// Individual log message
const LogMessage: React.FC<{ log: LogEntry }> = ({ log }) => {
  const { agent, message, timestamp, type = 'info', metadata } = log;
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className={`log-message ${agent} ${type}`}>
      <div className="log-header">
        <AgentAvatar agent={agent} />
        <span className="agent-name">{agent.toUpperCase()}</span>
        <TimeStamp time={timestamp} />
        {metadata && (
          <button 
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      <div className="log-content">
        <p>{message}</p>
        
        {showDetails && metadata && (
          <pre className="log-metadata">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

// Agent Log component
const AgentLog: React.FC = () => {
  const { logs, filter, setFilter, clearLogs } = useLogStore();
  const filteredLogs = getFilteredLogs(logs, filter);
  
  // Available agent filters
  const agents: Array<Agent | 'all'> = ['all', 'system', 'user', 'gpt', 'codegpt', 'techgpt'];
  
  return (
    <div className="agent-log">
      <div className="log-header-controls">
        <h3>Agent Log</h3>
        
        <div className="log-filters">
          {agents.map(agent => (
            <button
              key={agent}
              className={`filter-btn ${filter === agent ? 'active' : ''}`}
              onClick={() => setFilter(agent)}
            >
              {agent === 'all' ? 'All' : <AgentAvatar agent={agent as Agent} />}
            </button>
          ))}
        </div>
        
        <button
          className="clear-logs-btn"
          onClick={clearLogs}
          disabled={logs.length === 0}
        >
          Clear
        </button>
      </div>
      
      <div className="log-messages">
        {filteredLogs.length === 0 ? (
          <p className="no-logs">No log messages to display.</p>
        ) : (
          filteredLogs.map((log, index) => (
            <LogMessage key={`${log.timestamp}-${index}`} log={log} />
          ))
        )}
      </div>
    </div>
  );
};

export default AgentLog; 