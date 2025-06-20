# Azure Container Apps Deployment Script
# This script deploys the AccelQuote UI to Azure Container Apps with HTTP support

# Variables
$RESOURCE_GROUP = "accelquote-rg"
$CONTAINER_APP_NAME = "accelquote-ui"
$LOCATION = "eastus"
$ENVIRONMENT_NAME = "accelquote-env"
$IMAGE_NAME = "accelquoteui:latest"

# Create resource group if it doesn't exist
Write-Host "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container apps environment if it doesn't exist
Write-Host "Creating container apps environment..."
az containerapp env create --name $ENVIRONMENT_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

# Build and push container image (assuming you have a container registry)
Write-Host "Building Docker image..."
docker build -t $IMAGE_NAME .

# Deploy container app with HTTP ingress
Write-Host "Deploying container app..."
az containerapp create `
  --name $CONTAINER_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT_NAME `
  --image $IMAGE_NAME `
  --target-port 80 `
  --ingress external `
  --transport http `
  --allow-insecure `
  --env-vars REACT_APP_API_BASE_URL=http://172.203.227.114:8080/ REACT_APP_USE_MOCK_API=false `
  --cpu 0.25 `
  --memory 0.5Gi `
  --min-replicas 1 `
  --max-replicas 3

Write-Host "Deployment complete!"
Write-Host "Your app will be available at the URL provided by the ingress configuration."
