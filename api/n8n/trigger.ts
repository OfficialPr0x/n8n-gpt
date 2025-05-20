import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const app = express();
app.use(express.json());

const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://nest.myghostrep.com';
const apiKey = process.env.X_N8N_API_KEY;

// Trigger n8n workflow
router.post('/api/n8n/trigger', async (req, res) => {
  try {
    const { workflowId, input } = req.body;
    
    if (!workflowId || !input) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'workflowId and input are required',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Triggering workflow ${workflowId} with input:`, input);
    
    // Make request to n8n
    const response = await axios.post(
      `${n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`,
      { data: input },
      {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract useful information from the n8n response
    const result = response.data;
    
    // Create a summarized response for GPT
    const summary = `Workflow ${workflowId} executed successfully`;
    
    // Add log entry
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      agent: 'n8nExecutor',
      message: `Executed workflow: ${workflowId}`,
      type: 'success'
    };
    
    // Example response with standardized format
    return res.status(200).json({
      status: 'success',
      data: {
        summary,
        workflowId,
        executionData: result,
        // Optional fields depending on workflow purpose
        repoUrl: result.data?.repoUrl || null,
        deployedUrl: result.data?.deployedUrl || null,
        projectName: input.projectName || null,
        features: input.features || []
      },
      log: logEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    
    // Add log entry for failure
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      agent: 'n8nExecutor',
      message: `Failed to execute workflow: ${req.body.workflowId || 'unknown'}`,
      type: 'error'
    };
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to trigger workflow',
      error: error instanceof Error ? error.message : String(error),
      log: logEntry,
      timestamp: new Date().toISOString()
    });
  }
});

app.use(router);

export default router; 