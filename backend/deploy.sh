#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# deploy.sh — Direct Cloud Run deploy with local environment variables
# ═══════════════════════════════════════════════════════════════
# Usage:  bash deploy.sh
# Reads .secrets.env and injects variables directly into Cloud Run
# with ZERO Secret Manager charges (100% Free Tier).
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_ID="react-app-492207"
REGION="us-central1"
SERVICE_NAME="portfolio-api-gateway"
SECRETS_FILE=".secrets.env"

# ── Verify prerequisites ──
if ! command -v gcloud &> /dev/null; then
    echo "ERROR: gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if [ ! -f "$SECRETS_FILE" ]; then
    echo "ERROR: $SECRETS_FILE not found. Copy .env.example to .secrets.env and fill in your keys."
    exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  Deploying $SERVICE_NAME to Cloud Run (Direct Env Vars)"
echo "  Project: $PROJECT_ID | Region: $REGION"
echo "═══════════════════════════════════════════════════════"

# ── Parse .secrets.env ──
ENV_VARS=""

while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    # Skip empty values
    [ -z "$value" ] && continue

    if [ -n "$ENV_VARS" ]; then
        ENV_VARS="${ENV_VARS},${key}=${value}"
    else
        ENV_VARS="${key}=${value}"
    fi
done < "$SECRETS_FILE"

# ── Deploy to Cloud Run ──
echo ""
echo "Deploying latest code to Cloud Run..."

DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --memory 512Mi \
    --min-instances 0 \
    --timeout 60 \
    --clear-secrets"

if [ -n "$ENV_VARS" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --set-env-vars=$ENV_VARS"
fi

eval "$DEPLOY_CMD"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✓ Deploy complete!"
echo "  Service URL: https://$SERVICE_NAME-502261012207.$REGION.run.app"
echo "═══════════════════════════════════════════════════════"

