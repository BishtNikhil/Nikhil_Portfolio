$PROJECT_ID = "react-app-492207"
$REGION = "us-central1"

Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "Vertex AI Vector Search Status Tracker (PowerShell)" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan

Write-Host "1. Checking Vertex AI Indexes..." -ForegroundColor Yellow
gcloud ai indexes list --region=$REGION --project=$PROJECT_ID --format="table(displayName, name.scope(indexes), createTime, updateTime)"

Write-Host ""
Write-Host "2. Checking Index Endpoints..." -ForegroundColor Yellow
gcloud ai index-endpoints list --region=$REGION --project=$PROJECT_ID --format="table(displayName, name.scope(indexEndpoints), publicEndpointDomainName)"

Write-Host ""
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "Once the Index status is ACTIVE (approx 60 mins):"
Write-Host "1. Run the /api/admin/setup-brain endpoint again to push real data."
Write-Host "2. Deploy the Index to the Endpoint using the Cloud Console or gcloud."
Write-Host "------------------------------------------------" -ForegroundColor Cyan
