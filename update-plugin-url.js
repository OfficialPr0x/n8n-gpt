#!/usr/bin/env node

/**
 * This script updates the ai-plugin.json file with the correct host URL.
 * Usage: node update-plugin-url.js https://your-host-url.com
 */

const fs = require('fs');
const path = require('path');

const pluginPath = path.join(__dirname, 'ai-plugin.json');

// Get the host URL from command line argument
const hostUrl = process.argv[2];

if (!hostUrl) {
  console.error('Please provide a host URL as an argument');
  console.error('Example: node update-plugin-url.js https://your-host-url.com');
  process.exit(1);
}

try {
  // Read the plugin.json file
  const pluginJson = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
  
  // Update the host URL in the plugin.json
  pluginJson.api.url = pluginJson.api.url.replace('${HOST_URL}', hostUrl);
  pluginJson.logo_url = pluginJson.logo_url.replace('${HOST_URL}', hostUrl);
  pluginJson.legal_info_url = pluginJson.legal_info_url.replace('${HOST_URL}', hostUrl);
  
  // Write the updated plugin.json file
  fs.writeFileSync(pluginPath, JSON.stringify(pluginJson, null, 2));
  
  console.log(`Updated ai-plugin.json with host URL: ${hostUrl}`);
} catch (error) {
  console.error('Error updating plugin.json:', error.message);
  process.exit(1);
} 