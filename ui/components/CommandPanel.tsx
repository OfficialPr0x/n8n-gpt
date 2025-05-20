import React, { useState, useEffect, useRef } from 'react';
import { triggerWorkflow } from '../services/api';
import useLogStore, { agents } from '../stores/LogStore';

// Enhanced workflow presets with descriptions and parameter templates
const WORKFLOW_PRESETS = [
  {
    id: 'nextjs_scaffold',
    name: 'Next.js Scaffold',
    icon: '📚',
    description: 'Initialize a new Next.js project with custom features',
    category: 'setup',
    params: {
      projectName: "my-nextjs-app",
      features: ["typescript", "tailwindcss", "api-routes"],
      withDocker: false
    }
  },
  {
    id: 'react_component_creator',
    name: 'React Component',
    icon: '🧩',
    description: 'Generate a React component with props and tests',
    category: 'code',
    params: {
      componentName: "Button",
      props: ["variant", "size", "onClick"],
      withStorybook: true,
      withTests: true
    }
  },
  {
    id: 'generate_api_endpoint',
    name: 'API Endpoint',
    icon: '🔌',
    description: 'Create a new API endpoint with validation',
    category: 'code',
    params: {
      path: "/api/users",
      method: "GET",
      responseType: "json",
      withValidation: true
    }
  },
  {
    id: 'deploy_to_vercel',
    name: 'Deploy to Vercel',
    icon: '🚀',
    description: 'Deploy your application to Vercel',
    category: 'deploy',
    params: {
      directory: "./build",
      projectName: "my-deployed-app",
      environment: "production"
    }
  },
  {
    id: 'run_tests',
    name: 'Run Tests',
    icon: '✅',
    description: 'Execute test suite for your project',
    category: 'testing',
    params: {
      testPattern: "**/*.test.js",
      coverage: true,
      updateSnapshots: false
    }
  },
  {
    id: 'analyze_code_quality',
    name: 'Code Analysis',
    icon: '🔍',
    description: 'Analyze code quality and performance issues',
    category: 'testing',
    params: {
      paths: ["./src"],
      rules: ["security", "performance", "best-practices"],
      generateReport: true
    }
  }
];

// Group presets by category
const CATEGORIES = {
  setup: { name: 'Project Setup', color: 'blue' },
  code: { name: 'Code Generation', color: 'purple' },
  deploy: { name: 'Deployment', color: 'green' },
  testing: { name: 'Testing & QA', color: 'amber' }
};

const CommandPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [lastResult, setLastResult] = useState<Record<string, any> | null>(null);
  const { addLog } = useLogStore();
  
  const presetDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter presets based on search term
  const filteredPresets = WORKFLOW_PRESETS.filter(preset => 
    preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    preset.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the current selected preset object
  const currentPreset = WORKFLOW_PRESETS.find(p => p.id === selectedPreset);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setShowPresets(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showPresets && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showPresets]);

  const selectPreset = (presetId: string) => {
    const preset = WORKFLOW_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset.id);
      setCustomParams(preset.params);
      setShowPresets(false);
      setSearchTerm('');
    }
  };

  const handleParamChange = (key: string, value: any) => {
    setCustomParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayParamChange = (key: string, index: number, value: string) => {
    setCustomParams(prev => {
      const updatedArray = [...prev[key]];
      updatedArray[index] = value;
      return {
        ...prev,
        [key]: updatedArray
      };
    });
  };

  const addArrayItem = (key: string) => {
    setCustomParams(prev => ({
      ...prev,
      [key]: [...prev[key], ""]
    }));
  };

  const removeArrayItem = (key: string, index: number) => {
    setCustomParams(prev => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPreset) {
      addLog({
        agent: agents.SYSTEM,
        message: 'Please select a workflow to run',
        type: 'warning'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Trigger the workflow with customParams
      const result = await triggerWorkflow(selectedPreset, customParams);
      setLastResult(result);
      
      // Handle success case with informative message
      addLog({
        agent: agents.CODE_COMMANDER,
        message: `Workflow "${currentPreset?.name}" executed successfully`,
        type: 'success',
        metadata: { result }
      });
      
      if (result.data?.deployedUrl) {
        addLog({
          agent: agents.DEPLOYMENT_SPECIALIST,
          message: `Deployment successful! Your app is live at: ${result.data.deployedUrl}`,
          type: 'success'
        });
      }
      
      if (result.data?.repoUrl) {
        addLog({
          agent: agents.CODE_COMMANDER,
          message: `Code repository available at: ${result.data.repoUrl}`,
          type: 'info'
        });
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      // Error logging is handled in the triggerWorkflow function
    } finally {
      setIsLoading(false);
    }
  };

  // Render param inputs based on their type
  const renderParamInput = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <button
              type="button"
              onClick={() => addArrayItem(key)}
              className="text-xs bg-secondary-color rounded px-2 py-1"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2 mt-1">
            {value.map((item: any, index: number) => (
              <div key={`${key}-${index}`} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayParamChange(key, index, e.target.value)}
                  className="editor-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(key, index)}
                  className="text-error-color px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (typeof value === 'boolean') {
      return (
        <div className="flex items-center mt-2">
          <input
            id={`param-${key}`}
            type="checkbox"
            checked={value}
            onChange={(e) => handleParamChange(key, e.target.checked)}
            className="mr-2"
          />
          <label htmlFor={`param-${key}`} className="text-sm font-medium">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
        </div>
      );
    } else {
      return (
        <div className="mt-2">
          <label className="block text-sm font-medium">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleParamChange(key, e.target.value)}
            className="editor-input mt-1 w-full"
          />
        </div>
      );
    }
  };

  return (
    <div className="command-panel">
      <div className="command-header">
        <h2>Workflow Commands</h2>
      </div>

      <div className="overflow-auto flex-1 p-4">
        <div className="relative" ref={presetDropdownRef}>
          <div 
            className="editor-input flex items-center cursor-pointer"
            onClick={() => setShowPresets(true)}
          >
            {currentPreset ? (
              <div className="flex items-center">
                <span className="mr-2">{currentPreset.icon}</span>
                <span>{currentPreset.name}</span>
              </div>
            ) : (
              <span className="text-text-secondary">Select a workflow...</span>
            )}
            <span className="ml-auto">▼</span>
          </div>

          {showPresets && (
            <div className="absolute top-full left-0 right-0 bg-secondary-bg border border-border-color rounded-md mt-1 shadow-lg z-10">
              <div className="p-2 border-b border-border-color">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="editor-input w-full"
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {Object.entries(CATEGORIES).map(([categoryId, category]) => {
                  const presetsByCategory = filteredPresets.filter(p => p.category === categoryId);
                  if (presetsByCategory.length === 0) return null;
                  
                  return (
                    <div key={categoryId}>
                      <div className="px-3 py-1 bg-background-color text-xs font-bold">
                        {category.name}
                      </div>
                      {presetsByCategory.map(preset => (
                        <div
                          key={preset.id}
                          className="px-3 py-2 hover:bg-background-color cursor-pointer flex items-start gap-2"
                          onClick={() => selectPreset(preset.id)}
                        >
                          <div className="text-xl">{preset.icon}</div>
                          <div>
                            <div className="font-medium">{preset.name}</div>
                            <div className="text-xs text-text-secondary">{preset.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {filteredPresets.length === 0 && (
                  <div className="px-3 py-4 text-center text-text-secondary">
                    No workflows found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {currentPreset && (
          <form onSubmit={handleSubmit} className="mt-4">
            <h3 className="text-sm font-medium mb-2">Configure Parameters</h3>
            
            <div className="bg-secondary-bg border border-border-color rounded-md p-3">
              {Object.entries(customParams).map(([key, value]) => (
                <div key={key} className="mb-3">
                  {renderParamInput(key, value)}
                </div>
              ))}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="save-button w-full mt-4"
            >
              {isLoading ? 'Executing...' : `Run ${currentPreset.name}`}
            </button>
          </form>
        )}
        
        {lastResult && (
          <div className="mt-4 border-t border-border-color pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Last Result</h3>
              <button 
                onClick={() => setLastResult(null)}
                className="text-xs text-text-secondary"
              >
                Clear
              </button>
            </div>
            <div className="bg-secondary-bg border border-border-color rounded-md p-3 overflow-auto max-h-40 text-sm">
              <pre>{JSON.stringify(lastResult, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPanel; 