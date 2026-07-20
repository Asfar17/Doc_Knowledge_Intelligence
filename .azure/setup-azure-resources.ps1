# Azure Resource Deployment Script for Enterprise Knowledge Intelligence System
# Prerequisites: Azure CLI installed and logged in (`az login`)
#
# BEFORE RUNNING:
#   1. Set $DB_ADMIN_PASSWORD to a strong password
#   2. Set $OPENAI_API_KEY to your OpenAI API key
#   3. Set $QDRANT_HOST, $QDRANT_API_KEY to your Qdrant Cloud values
#   4. Set $NEO4J_URI, $NEO4J_PASSWORD to your Neo4j AuraDB values
#   5. Set $REDIS_PASSWORD to a strong password

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────
$RESOURCE_GROUP_NAME      = "doc_knowledge"
$LOCATION                 = "southeastasia"   # Allowed by subscription policy

# App Service
$BACKEND_APP_NAME         = "doc-knowledge-backend"
$APPSERVICE_PLAN_NAME     = "doc-knowledge-plan"

# PostgreSQL
$DB_SERVER_NAME           = "doc-knowledge-db"
$DB_NAME                  = "doc_knowledge"
$DB_ADMIN_USER            = "dbadmin"
$DB_ADMIN_PASSWORD        = "PASTE_YOUR_DB_PASSWORD"   # <-- Set this before running

# Storage
$STORAGE_ACCOUNT_NAME     = "docknowledgesto2"       # Must be lowercase, no hyphens, globally unique
$STORAGE_CONTAINER_NAME   = "documents"

# Redis
$REDIS_CACHE_NAME         = "doc-knowledge-redis"
$REDIS_SKU                = "Basic"
$REDIS_VM_SIZE            = "c0"                       # Smallest / free-tier equivalent

# External services — fill these locally before running, do NOT commit real keys
$OPENAI_API_KEY           = "PASTE_YOUR_OPENAI_KEY_HERE"
$OPENAI_MODEL             = "gpt-4o-mini"

$QDRANT_HOST              = "PASTE_QDRANT_CLUSTER_URL"  # e.g. https://xxxx.cloud.qdrant.io
$QDRANT_PORT              = "6333"
$QDRANT_API_KEY           = "PASTE_QDRANT_API_KEY"

$NEO4J_URI                = "PASTE_NEO4J_URI"           # e.g. neo4j+s://xxxx.databases.neo4j.io
$NEO4J_USER               = "neo4j"
$NEO4J_PASSWORD           = "PASTE_NEO4J_PASSWORD"

# ──────────────────────────────────────────────
# 1. Resource Group
# ──────────────────────────────────────────────
Write-Host "`n[1/8] Creating Resource Group..." -ForegroundColor Cyan
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# ──────────────────────────────────────────────
# 2. PostgreSQL Flexible Server
# ──────────────────────────────────────────────
Write-Host "`n[2/8] Creating Azure Database for PostgreSQL..." -ForegroundColor Cyan
az postgres flexible-server create `
  --resource-group $RESOURCE_GROUP_NAME `
  --name $DB_SERVER_NAME `
  --location $LOCATION `
  --admin-user $DB_ADMIN_USER `
  --admin-password $DB_ADMIN_PASSWORD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 16 `
  --public-access all

az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP_NAME `
  --server-name $DB_SERVER_NAME `
  --database-name $DB_NAME

# ──────────────────────────────────────────────
# 3. Azure Blob Storage
# ──────────────────────────────────────────────
Write-Host "`n[3/8] Creating Azure Storage Account..." -ForegroundColor Cyan
az storage account create `
  --name $STORAGE_ACCOUNT_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind StorageV2

az storage container create `
  --name $STORAGE_CONTAINER_NAME `
  --account-name $STORAGE_ACCOUNT_NAME `
  --auth-mode login

# Grab the connection string for later use
$STORAGE_CONNECTION_STRING = $(az storage account show-connection-string `
  --name $STORAGE_ACCOUNT_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --query connectionString `
  --output tsv)

# ──────────────────────────────────────────────
# 4. Azure Cache for Redis
# ──────────────────────────────────────────────
Write-Host "`n[4/8] Creating Azure Cache for Redis..." -ForegroundColor Cyan
az redis create `
  --name $REDIS_CACHE_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --location $LOCATION `
  --sku $REDIS_SKU `
  --vm-size $REDIS_VM_SIZE

# Grab Redis connection details
$REDIS_HOST = "$REDIS_CACHE_NAME.redis.cache.windows.net"
$REDIS_PORT = "6380"
$REDIS_PASSWORD = $(az redis list-keys `
  --name $REDIS_CACHE_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --query primaryKey `
  --output tsv)

# ──────────────────────────────────────────────
# 5. App Service Plan + Backend Web App
# ──────────────────────────────────────────────
Write-Host "`n[5/8] Creating App Service Plan..." -ForegroundColor Cyan
az appservice plan create `
  --name $APPSERVICE_PLAN_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --sku B1 `
  --is-linux

Write-Host "`n[6/8] Creating Backend App Service..." -ForegroundColor Cyan
az webapp create `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --plan $APPSERVICE_PLAN_NAME `
  --runtime "PYTHON|3.12"

# ──────────────────────────────────────────────
# 6. Configure Backend App Settings
# ──────────────────────────────────────────────
Write-Host "`n[7/8] Configuring Backend App Settings..." -ForegroundColor Cyan
az webapp config appsettings set `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --settings `
    POSTGRES_HOST="$DB_SERVER_NAME.postgres.database.azure.com" `
    POSTGRES_PORT="5432" `
    POSTGRES_USER="$DB_ADMIN_USER" `
    POSTGRES_PASSWORD="$DB_ADMIN_PASSWORD" `
    POSTGRES_DB="$DB_NAME" `
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" `
    AZURE_STORAGE_CONTAINER_NAME="$STORAGE_CONTAINER_NAME" `
    STORAGE_TYPE="azure" `
    QDRANT_HOST="$QDRANT_HOST" `
    QDRANT_PORT="$QDRANT_PORT" `
    QDRANT_API_KEY="$QDRANT_API_KEY" `
    NEO4J_URI="$NEO4J_URI" `
    NEO4J_USER="$NEO4J_USER" `
    NEO4J_PASSWORD="$NEO4J_PASSWORD" `
    REDIS_HOST="$REDIS_HOST" `
    REDIS_PORT="$REDIS_PORT" `
    REDIS_PASSWORD="$REDIS_PASSWORD" `
    REDIS_SSL="true" `
    OPENAI_API_KEY="$OPENAI_API_KEY" `
    OPENAI_MODEL="$OPENAI_MODEL"

# Enable startup command
az webapp config set `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP_NAME `
  --startup-file "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000"

# ──────────────────────────────────────────────
# 7. Done
# ──────────────────────────────────────────────
Write-Host "`n[8/8] Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend URL : https://$BACKEND_APP_NAME.azurewebsites.net" -ForegroundColor Yellow
Write-Host "Redis Host  : $REDIS_HOST" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Create Azure Static Web App via portal and link to your GitHub repo"
Write-Host "  2. Add GitHub secrets (see DEPLOYMENT.md)"
Write-Host "  3. Push to main branch to trigger CI/CD"
