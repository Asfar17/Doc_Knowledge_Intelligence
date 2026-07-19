# Microsoft Azure Deployment Guide

This guide will walk you through deploying the Enterprise Knowledge Intelligence System to Microsoft Azure.

## Prerequisites
- An active Azure subscription
- Azure CLI installed and logged in (`az login`)
- GitHub account (for CI/CD)

## Architecture Overview

The system will be deployed using the following Azure services:
1. **Azure App Service**: Hosts the backend FastAPI application
2. **Azure Database for PostgreSQL**: Stores relational data
3. **Azure Blob Storage**: Stores uploaded documents
4. **Azure Static Web Apps**: Hosts the React frontend

## Deployment Steps

### 1. Create Azure Resources

You can use the provided PowerShell script to create all necessary Azure resources.

First, update the configuration variables in `.azure/setup-azure-resources.ps1`:
- `$RESOURCE_GROUP_NAME`: Name for your resource group
- `$LOCATION`: Azure region (e.g., eastus, westeurope)
- `$BACKEND_APP_NAME`: Unique name for your backend app
- `$DB_SERVER_NAME`: Unique name for your PostgreSQL server
- `$DB_ADMIN_USER`: Database admin username
- `$STORAGE_ACCOUNT_NAME`: Unique name for your storage account

Then run the script:
```powershell
.\.azure\setup-azure-resources.ps1
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

- `AZURE_BACKEND_APP_NAME`: Name of your backend App Service
- `AZURE_BACKEND_PUBLISH_PROFILE`: Download from Azure Portal (App Service → Deployment Center → Publish Profile)
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Get from Static Web Apps deployment
- `OPENAI_API_KEY`: Your OpenAI API key (optional but recommended)

### 3. Update Frontend Configuration

Create a `.env` file in the `frontend/` directory (based on `.env.example`) and set the API URL to your backend App Service URL:
```env
VITE_API_BASE_URL=https://your-backend-app.azurewebsites.net
```

### 4. Deploy Frontend to Azure Static Web Apps

1. Go to Azure Portal and create a new Static Web App
2. Connect it to your GitHub repository
3. Configure the build settings:
   - App location: `/frontend`
   - API location: (leave blank)
   - Output location: `dist`

### 5. Deploy Backend to Azure App Service

The GitHub Actions workflow will automatically deploy the backend when you push to the `main` branch. You can also deploy manually using the Azure CLI:
```bash
cd backend
az webapp up --name your-backend-app --resource-group your-resource-group --runtime "PYTHON:3.12"
```

### 6. Verify the Deployment

- Access your frontend at the Static Web Apps URL
- Test document uploads
- Test query functionality
- Verify database connections

## Manual Deployment Steps (Without CI/CD)

If you prefer to deploy manually instead of using GitHub Actions, follow these steps:

### Backend Deployment
1. Zip the contents of the `backend/` directory (excluding `venv/`)
2. Go to your App Service in Azure Portal
3. Go to Deployment Center → Manual Deployment → Zip Deploy
4. Upload your zip file

### Frontend Deployment
1. Build the frontend locally: `cd frontend && npm run build`
2. Deploy the `dist/` folder to Azure Static Web Apps or App Service

## Environment Variables

### Backend Environment Variables
Set these in Azure App Service → Configuration → Application settings:
- `POSTGRES_HOST`: PostgreSQL server hostname
- `POSTGRES_PORT`: PostgreSQL port (default 5432)
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Storage connection string
- `AZURE_STORAGE_CONTAINER_NAME`: Blob container name
- `STORAGE_TYPE`: Set to "azure"
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-3.5-turbo)

### Frontend Environment Variables
Set these in Azure Static Web Apps → Configuration:
- `VITE_API_BASE_URL`: URL of your backend API

## Cost Considerations

- Use Azure Cost Calculator to estimate costs
- Start with B1 SKU for App Service and StorageV2 for storage
- Monitor costs in Azure Portal
- Consider scaling down resources during development

## Troubleshooting

### Backend Issues
- Check App Service logs in Azure Portal
- Verify environment variables are set correctly
- Check database connection string
- Ensure dependencies are installed

### Frontend Issues
- Check Static Web Apps logs
- Verify API base URL is correct
- Check CORS settings on backend

### Database Issues
- Verify firewall settings allow Azure services
- Check connection string
- Ensure database user has correct permissions

## Cleanup

To delete all resources when you're done:
```bash
az group delete --name your-resource-group-name
```
