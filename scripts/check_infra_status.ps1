# Vertex AI Status Tracker (PowerShell Edition)
# Configuration with Parameterization (CodeRabbit Fix)
$PROJECT_ID = $Env:GCP_PROJECT_ID -or "react-app-492207"
$REGION = $Env:GCP_REGION -or "us-central1"

Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "Vertex AI Vector Search Status Tracker" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID | Region: $REGION"
Write-Host "------------------------------------------------" -ForegroundColor Cyan

Write-Host "1. Checking Vertex AI Indexes..." -ForegroundColor Yellow
# Added 'state' and 'updateTime' (CodeRabbit Fix)
gcloud ai indexes list `
  --region=$REGION `
  --project=$PROJECT_ID `
  --format="table(displayName, name.scope(indexes):label=ID, state:label=STATUS, updateTime)"

Write-Host ""
Write-Host "2. Checking Index Endpoints..." -ForegroundColor Yellow
gcloud ai index-endpoints list `
  --region=$REGION `
  --project=$PROJECT_ID `
  --format="table(displayName, name.scope(indexEndpoints):label=ID, publicEndpointDomainName:label=ENDPOINT_DOMAIN)"

Write-Host ""
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "Once the Index status is DEPLOYED or ACTIVE (approx 60 mins):"
Write-Host "1. Run the /api/admin/setup-brain endpoint again to push real data."
Write-Host "2. Verify the ENDPOINT_DOMAIN is set in your API Gateway environment variables."
Write-Host "------------------------------------------------" -ForegroundColor Cyan
