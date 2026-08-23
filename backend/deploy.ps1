# ===============================================================
# deploy.ps1 - Direct Cloud Run deploy with local environment variables
# ===============================================================
# Usage:  .\deploy.ps1  OR  npm run deploy
# Reads .secrets.env and injects variables directly into Cloud Run
# with ZERO Secret Manager charges (100% Free Tier).
# ===============================================================

$ErrorActionPreference = "Continue"

$PROJECT_ID = "react-app-492207"
$REGION = "us-central1"
$SERVICE_NAME = "portfolio-api-gateway"
$SECRETS_FILE = ".secrets.env"

# -- Verify prerequisites --
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
Write-Host "  Deploying $SERVICE_NAME to Cloud Run (Direct Env Vars)" -ForegroundColor Cyan
Write-Host "  Project: $PROJECT_ID | Region: $REGION" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# -- Parse .secrets.env --
$envPairs = @()

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
    
    # Escape commas if any exist in value
    $escapedValue = $value -replace '\^', '^^' -replace ',', '\,'
    $envPairs += "$key=$escapedValue"
}

# -- Deploy to Cloud Run --
Write-Host ""
Write-Host "Deploying latest code to Cloud Run..." -ForegroundColor Yellow

$envStr = $envPairs -join ","

$deployArgs = @(
    "run", "deploy", $SERVICE_NAME,
    "--source", ".",
    "--region", $REGION,
    "--project", $PROJECT_ID,
    "--allow-unauthenticated",
    "--memory", "512Mi",
    "--min-instances", "0",
    "--timeout", "60",
    "--clear-secrets"
)

if ($envStr) {
    $deployArgs += "--set-env-vars=$envStr"
}

& gcloud @deployArgs

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "  Service URL: https://$SERVICE_NAME-502261012207.$REGION.run.app" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
