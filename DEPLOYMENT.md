# Microsoft Azure Deployment Guide

This guide will walk you through deploying the Enterprise Knowledge Intelligence System to Microsoft Azure.

## Prerequisites
- An active Azure subscription
- Azure CLI installed and logged in (`az login`)
- GitHub account (for CI/CD)
- Qdrant Cloud account (free tier available)
- Neo4j AuraDB account (free tier available)
- OpenAI API key (optional but recommended)

## Architecture Overview

The system will be deployed using the following Azure services:
1. **Azure App Service**: Hosts the backend FastAPI application
2. **Azure Database for PostgreSQL**: Stores relational data
3. **Azure Blob Storage**: Stores uploaded documents
4. **Azure Cache for Redis**: For caching/session storage
5. **Azure Static Web Apps**: Hosts the React frontend
6. **External Services**: Qdrant Cloud (vector DB), Neo4j AuraDB (graph DB), OpenAI API (LLM)

## Deployment Steps

### 1. Create Azure Resources

You can use the provided PowerShell script to create all necessary Azure resources.

**First**, update the configuration variables in `.azure/setup-azure-resources.ps1` (replace placeholders with your own values):
- `$DB_ADMIN_PASSWORD`: Strong password for PostgreSQL admin (min 8 chars, mix of letters, numbers, symbols)
- `$OPENAI_API_KEY`: Your OpenAI API key (optional but recommended)
- `$QDRANT_HOST`, `$QDRANT_API_KEY`: Your Qdrant Cloud cluster URL and API key
- `$NEO4J_URI`, `$NEO4J_PASSWORD`: Your Neo4j AuraDB URI and password
- `$REDIS_PASSWORD`: Strong password for Azure Cache for Redis
- `$RESOURCE_GROUP_NAME`, `$LOCATION`, `$BACKEND_APP_NAME`, etc.: Customize if needed

**Then**, run the script in PowerShell (make sure you're logged in with `az login` first):
```powershell
.\.azure\setup-azure-resources.ps1
```

This script will:
- Create a resource group
- Create PostgreSQL Flexible Server
- Create Azure Blob Storage account and container
- Create Azure Cache for Redis
- Create App Service Plan and Backend Web App
- Configure all necessary app settings for the backend

### 2. Create Azure Static Web App for Frontend

1. Go to the **Azure Portal** → **Create a resource** → Search for "Static Web Apps"
2. Click **Create**
3. Fill in the basics:
   - Subscription: Your Azure subscription
   - Resource Group: Use the same one from step 1 (e.g., `doc_knowledge`)
   - Name: A unique name for your frontend (e.g., `doc-knowledge-frontend`)
   - Hosting plan: **Free** (for development)
   - Deployment source: **GitHub** (or "Other" if you want to deploy manually later)
4. If you selected GitHub:
   - Click **Sign in with GitHub** and authorize Azure
   - Select your organization, repository, and branch (main)
5. In **Build details**:
   - App location: `/frontend`
   - API location: (leave blank)
   - Output location: `dist`
6. Click **Review + create** → **Create**
7. After deployment is complete (takes a few minutes):
   - Go to your new Static Web App in Azure Portal
   - Click **Manage deployment token** → Copy the token (you'll need this for GitHub Secrets)
   - Also copy the **URL** of your Static Web App from the Overview page

### 3. Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** and add these secrets:

| Secret Name | Description | Where to get it |
|-------------|-------------|-----------------|
| `AZURE_BACKEND_APP_NAME` | Name of your backend App Service | From step 1 (default: `doc-knowledge-backend`, check Azure Portal → App Service → Overview) |
| `AZURE_BACKEND_PUBLISH_PROFILE` | Publish profile for backend | Azure Portal → Backend App Service → Deployment Center → Publish Profile → Download the .publishsettings file → Open it with a text editor → Copy the entire content |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token for frontend | Azure Portal → Static Web App → Manage deployment token → Copy the token |
| `VITE_API_BASE_URL` | URL of your backend API | Azure Portal → Backend App Service → Overview → Default domain (e.g., `https://doc-knowledge-backend.azurewebsites.net`) |

**CRITICAL**: Ensure each secret is added exactly as described, with no extra spaces or line breaks!

### 4. Initialize Database Tables

The backend will automatically create database tables on first run, but to make sure, you can run the init script locally (or via SSH in App Service):

```powershell
cd backend
# Set up your .env file first (copy .env.example and fill in values)
python scripts/init_db.py
```

### 5. Deploy via GitHub

The GitHub Actions workflow will automatically deploy both frontend and backend when you push to the `main` branch!

To trigger a deployment manually:
1. Go to your GitHub repository → **Actions**
2. Select "Deploy to Azure" workflow
3. Click **Run workflow** → Select `main` branch → Click **Run workflow**

### 6. Verify the Deployment

- Access your frontend at the Static Web Apps URL
- Test document uploads
- Test query functionality
- Check graph visualization (upload a document first to see entities!)
- Verify compliance reports

## Manual Deployment Steps (Without CI/CD)

If you prefer to deploy manually instead of using GitHub Actions, follow these steps:

### Backend Deployment
1. Zip the contents of the `backend/` directory (excluding `venv/`, `__pycache__/`, etc.)
2. Go to your App Service in Azure Portal
3. Go to **Deployment Center** → **Manual Deployment** → **Zip Deploy**
4. Upload your zip file

### Frontend Deployment
1. Build the frontend locally:
   ```powershell
   cd frontend
   # Create a .env file with VITE_API_BASE_URL set to your backend URL
   npm install
   npm run build
   ```
2. Deploy the `dist/` folder to Azure Static Web Apps (via portal) or use the Static Web Apps CLI

## Environment Variables Reference

### Backend Environment Variables
The Azure setup script configures all these for you, but here they are for reference:
- `POSTGRES_HOST`: PostgreSQL server hostname (e.g., `doc-knowledge-db.postgres.database.azure.com`)
- `POSTGRES_PORT`: PostgreSQL port (default 5432)
- `POSTGRES_USER`: Database username (default `dbadmin`)
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name (default `doc_knowledge`)
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage connection string
- `AZURE_STORAGE_CONTAINER_NAME`: Blob container name (default `documents`)
- `STORAGE_TYPE`: Set to "azure"
- `QDRANT_HOST`: Qdrant Cloud cluster URL
- `QDRANT_PORT`: Qdrant port (default 6333)
- `QDRANT_API_KEY`: Qdrant API key
- `NEO4J_URI`: Neo4j AuraDB URI
- `NEO4J_USER`: Neo4j user (default `neo4j`)
- `NEO4J_PASSWORD`: Neo4j password
- `REDIS_HOST`: Azure Cache for Redis hostname
- `REDIS_PORT`: Redis port (default 6380 for Azure)
- `REDIS_PASSWORD`: Redis password
- `REDIS_SSL`: Set to "true" for Azure
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: OpenAI model to use (default `gpt-4o-mini`)

### Frontend Environment Variables
Set `VITE_API_BASE_URL` in GitHub Secrets for the build, or in Azure Static Web Apps → Configuration.

## Cost Considerations

- Use Azure Cost Calculator to estimate costs
- The setup script uses mostly free/basic tiers (B1 App Service, Basic Redis, etc.)
- Monitor costs in Azure Portal → Cost Management
- Consider scaling down resources during development

## Troubleshooting

### Backend Issues
- Check App Service logs in Azure Portal → App Service → Log stream
- Verify environment variables are set correctly in App Service → Configuration
- Check database connection strings and firewall rules (PostgreSQL allows public access in the setup script)
- Ensure dependencies are installed (check `requirements.txt`)

### Frontend Issues
- Check Static Web Apps logs in Azure Portal → Static Web App → Log stream
- Verify API base URL is correct (`VITE_API_BASE_URL`)
- Check CORS settings on backend (the backend allows all origins by default for development)

### Database Issues
- Verify PostgreSQL firewall allows Azure services (setup script sets `--public-access all`)
- Check connection string
- Ensure database user has correct permissions

## Cleanup

To delete all resources when you're done (to avoid unexpected costs):
```powershell
az group delete --name doc_knowledge --yes
```
