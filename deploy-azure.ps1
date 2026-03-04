# Azure Container Apps Deployment Script
# This script deploys the AccelQuote UI to Azure Container Apps with HTTP support

# Variables
$RESOURCE_GROUP = "AccelQuote"
$CONTAINER_APP_NAME = "accelquote-ui"
$LOCATION = "eastus"
$ENVIRONMENT_NAME = "accelquote-env"
$ACR_NAME = "accelquote"
$IMAGE_NAME = "accelquoteui"
$IMAGE_TAG = "latest"
$FULL_IMAGE_NAME = "$ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"

# Create resource group if it doesn't exist
Write-Host "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry if it doesn't exist
Write-Host "Creating Azure Container Registry..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --location $LOCATION --admin-enabled true

# Login to ACR
Write-Host "Logging into Azure Container Registry..."
az acr login --name $ACR_NAME

# Build Docker image with ACR tag
Write-Host "Building Docker image..."
docker build -t $FULL_IMAGE_NAME .

# Push image to ACR
Write-Host "Pushing image to Azure Container Registry..."
docker push $FULL_IMAGE_NAME

# Create container apps environment if it doesn't exist
Write-Host "Creating container apps environment..."
az containerapp env create --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

# Deploy container app with HTTP ingress
Write-Host "Deploying container app..."
az containerapp create `
  --name $CONTAINER_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT_NAME `
  --image $FULL_IMAGE_NAME `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 80 `
  --ingress external `
  --transport http `
  --allow-insecure `
  --env-vars REACT_APP_API_BASE_URL=http://172.179.232.31 REACT_APP_USE_MOCK_API=false `
  --cpu 0.25 `
  --memory 0.5Gi `
  --min-replicas 1 `
  --max-replicas 3

Write-Host "Deployment complete!"
Write-Host "Getting application URL..."
$APP_URL = az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "Your app is available at: http://$APP_URL"
