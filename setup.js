#!/usr/bin/env node

/**
 * Setup script for the GPT-n8n integration project.
 * This script helps users quickly set up the project by:
 * 1. Checking for required dependencies
 * 2. Creating .env file if it doesn't exist
 * 3. Installing npm dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Setting up GPT-n8n Integration Project...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  
  rl.question('Enter your n8n API key (or press enter to use placeholder): ', (apiKey) => {
    rl.question('Enter your n8n base URL (default: https://nest.myghostrep.com): ', (baseUrl) => {
      rl.question('Enter port number (default: 3000): ', (port) => {
        const envContent = `X_N8N_API_KEY=${apiKey || 'your_token_here'}
PORT=${port || '3000'}
N8N_BASE_URL=${baseUrl || 'https://nest.myghostrep.com'}`;
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully\n');
        
        continueSetup();
      });
    });
  });
} else {
  console.log('✅ .env file already exists\n');
  continueSetup();
}

function continueSetup() {
  // Install npm dependencies
  console.log('Installing npm dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
  
  // Create vfs directory if it doesn't exist
  const vfsPath = path.join(__dirname, 'vfs');
  if (!fs.existsSync(vfsPath)) {
    fs.mkdirSync(vfsPath, { recursive: true });
    console.log('✅ Virtual file system directory created\n');
  }
  
  console.log('\n🎉 Setup complete! You can now start the server with:');
  console.log('npm start');
  console.log('\nTo expose your server to the internet (required for GPT integration), use ngrok:');
  console.log('ngrok http 3000');
  console.log('\nThen update your plugin URL with:');
  console.log('npm run update-plugin https://your-ngrok-url.ngrok.io');
  
  rl.close();
}

rl.on('close', () => {
  console.log('\nThank you for setting up the GPT-n8n Integration!');
  process.exit(0);
}); 