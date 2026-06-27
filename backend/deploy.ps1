# ===============================================================
# deploy.ps1 ? One-command Cloud Run deploy with Secret Manager
# ===============================================================
# Usage:  .\deploy.ps1  OR  npm run deploy
# Reads .secrets.env, creates/updates Google Secret Manager
# secrets, then deploys the latest code to Cloud Run.
# ===============================================================

$ErrorActionPreference = "Continue"

$PROJECT_ID = "react-app-492207"
$REGION = "us-central1"
$SERVICE_NAME = "portfolio-api-gateway"
$SECRETS_FILE = ".secrets.env"

# ?? Verify prerequisites ??
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $SECRETS_FILE)) {
    Write-Host "ERROR: $SECRETS_FILE not found. Copy .env.example to .secrets.env and fill in your keys." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Deploying $SERVICE_NAME to Cloud Run" -ForegroundColor Cyan
Write-Host "  Project: $PROJECT_ID | Region: $REGION" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# ?? Step 1: Enable Secret Manager API (idempotent) ??
Write-Host ""
Write-Host "Step 1/3: Ensuring Secret Manager API is enabled..." -ForegroundColor Yellow
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID" 2>$null

# ?? Step 2: Push secrets to Secret Manager ??
Write-Host ""
Write-Host "Step 2/3: Syncing secrets to Google Secret Manager..." -ForegroundColor Yellow

$secretBindings = @()

Get-Content $SECRETS_FILE | ForEach-Object {
    $line = $_.Trim()
    
    # Skip comments and empty lines
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) { return }
    
    # Parse KEY=VALUE
    $eqIndex = $line.IndexOf("=")
    if ($eqIndex -le 0) { return }
    
    $key = $line.Substring(0, $eqIndex).Trim()
    $value = $line.Substring($eqIndex + 1).Trim()
    
    # Skip empty values
    if ([string]::IsNullOrWhiteSpace($value)) { return }
    
    # Build secret name: portfolio-gemini-api-key (lowercase, hyphens)
    $secretName = "portfolio-$($key.ToLower() -replace '_', '-')"
    
    # Check if secret already exists
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    try {
        gcloud secrets describe $secretName --project="$PROJECT_ID" 2>&1 | Out-Null
        $secretExists = ($LASTEXITCODE -eq 0)
    } catch {
        $secretExists = $false
    }
    $ErrorActionPreference = $oldEap
    
    if ($secretExists) {
        Write-Host "  Updating: $secretName" -ForegroundColor Gray
        $value | gcloud secrets versions add $secretName --project="$PROJECT_ID" --data-file=- --quiet 2>$null
    } else {
        Write-Host "  Creating: $secretName" -ForegroundColor Green
        $value | gcloud secrets create $secretName --project="$PROJECT_ID" --data-file=- --replication-policy="automatic" --quiet 2>$null
    }
    
    # Build binding: ENV_VAR=secret-name:latest
    $secretBindings += "${key}=${secretName}:latest"
}

# ?? Step 3: Deploy to Cloud Run ??
Write-Host ""
Write-Host "Step 3/3: Deploying latest code to Cloud Run..." -ForegroundColor Yellow

$deployArgs = @(
    "run", "deploy", $SERVICE_NAME,
    "--source", ".",
    "--region", $REGION,
    "--project", $PROJECT_ID,
    "--allow-unauthenticated",
    "--memory", "512Mi",
    "--timeout", "60"
)

if ($secretBindings.Count -gt 0) {
    $bindingStr = $secretBindings -join ","
    $deployArgs += "--update-secrets=$bindingStr"
}

& gcloud @deployArgs

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "  ? Deploy complete!" -ForegroundColor Green
Write-Host "  Service URL: https://$SERVICE_NAME-502261012207.$REGION.run.app" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

