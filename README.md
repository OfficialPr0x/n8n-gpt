# Multi-Agent GPT + n8n Dev Ecosystem

A modular GPT-based dev council that can trigger n8n workflows, save and browse generated code in a file tree, and connect via OpenAPI as a fully compliant GPT Action.

## 🌐 System Overview

This project integrates GPT with n8n workflows, providing a complete development ecosystem that allows:

- Triggering n8n workflows from GPT
- Saving and browsing code in a virtual file system
- Generating code using GPT
- Connecting via OpenAPI as a GPT Action

## 🔧 Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React + TailwindCSS
- **Agents:** GPT Custom Action (via OpenAPI 3.1.0)
- **n8n Integration:** Self-hosted backend at `https://nest.myghostrep.com`
- **CI/CD:** GitHub Actions + Railway or Vercel for deploy preview

## 📁 Project Structure

```
root/
├── api/
│   ├── gpt/generate.ts
│   ├── files/save.ts
│   ├── files/tree.ts
│   ├── n8n/trigger.ts
├── public/
│   └── openapi.yaml
├── ui/
│   └── components/
│       ├── CommandPanel.tsx
│       ├── FileTree.tsx
│       └── AgentLog.tsx
├── ai-plugin.json
├── .env
├── server.ts
└── .github/workflows/deploy.yml
```

## ⚙️ Getting Started

### Prerequisites

- Node.js 18 or later
- n8n instance with API key
- npm or yarn

### Quick Setup

The easiest way to get started is to use the included setup script:

```bash
# Clone the repository
git clone https://github.com/yourusername/n8n-gpt.git
cd n8n-gpt

# Run the setup script
npm run setup
```

The setup script will:
1. Create a `.env` file with your n8n API key
2. Install all dependencies
3. Create necessary directories
4. Guide you through the next steps

### Manual Installation

If you prefer to set up manually:

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/n8n-gpt.git
   cd n8n-gpt
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file
   ```env
   X_N8N_API_KEY=your_token_here
   PORT=3000
   N8N_BASE_URL=https://nest.myghostrep.com
   ```

4. Run the server
   ```bash
   npm start
   ```

5. Expose endpoint via HTTPS (e.g. Ngrok)
   ```bash
   ngrok http 3000
   ```

6. Update the plugin URL with your public URL
   ```bash
   npm run update-plugin https://your-ngrok-url.ngrok.io
   ```

### Connecting to GPT

1. Update OpenAPI URL in `ai-plugin.json` with your exposed HTTPS URL (done automatically with the update-plugin script)
2. Register with GPT Actions Console
3. Follow GPT documentation for testing and deploying your action

## 🚀 Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Deployment

The project includes a GitHub Action workflow in `.github/workflows/deploy.yml` that automatically builds and tests the application. You can customize it to deploy to your preferred hosting provider.

## 📚 API Documentation

The API is documented using OpenAPI 3.1.0 and can be accessed at `/openapi.yaml`. The available endpoints are:

- `POST /api/n8n/trigger` - Trigger an n8n workflow
- `POST /api/files/save` - Save a file to the virtual file system
- `GET /api/files/tree` - Get the virtual file system tree
- `POST /api/gpt/generate` - Generate code using GPT

## 🔗 Related Links

- [n8n Documentation](https://docs.n8n.io/)
- [GPT API Documentation](https://platform.openai.com/docs/api-reference)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 