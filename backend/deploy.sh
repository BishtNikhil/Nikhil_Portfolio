#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# deploy.sh — One-command Cloud Run deploy with Secret Manager
# ═══════════════════════════════════════════════════════════════
# Usage:  bash deploy.sh
# Reads .secrets.env, creates/updates Google Secret Manager
# secrets, then deploys the latest code to Cloud Run.
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
echo "  Deploying $SERVICE_NAME to Cloud Run"
echo "  Project: $PROJECT_ID | Region: $REGION"
echo "═══════════════════════════════════════════════════════"

# ── Step 1: Enable Secret Manager API (idempotent) ──
echo ""
echo "Step 1/3: Ensuring Secret Manager API is enabled..."
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID" 2>/dev/null || true

# ── Step 2: Push secrets to Secret Manager ──
echo ""
echo "Step 2/3: Syncing secrets to Google Secret Manager..."

SECRET_BINDINGS=""

while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    # Skip empty values
    [ -z "$value" ] && continue

    SECRET_NAME="portfolio-${key,,}"  # lowercase the key for secret name
    SECRET_NAME="${SECRET_NAME//_/-}" # replace underscores with hyphens

    # Create or update the secret
    if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
        echo "  Updating: $SECRET_NAME"
        echo -n "$value" | gcloud secrets versions add "$SECRET_NAME" \
            --project="$PROJECT_ID" --data-file=- --quiet
    else
        echo "  Creating: $SECRET_NAME"
        echo -n "$value" | gcloud secrets create "$SECRET_NAME" \
            --project="$PROJECT_ID" --data-file=- \
            --replication-policy="automatic" --quiet
    fi

    # Build the --update-secrets flag binding
    if [ -n "$SECRET_BINDINGS" ]; then
        SECRET_BINDINGS="${SECRET_BINDINGS},${key}=${SECRET_NAME}:latest"
    else
        SECRET_BINDINGS="${key}=${SECRET_NAME}:latest"
    fi
done < "$SECRETS_FILE"

# ── Step 3: Deploy to Cloud Run ──
echo ""
echo "Step 3/3: Deploying latest code to Cloud Run..."

DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --memory 512Mi \
    --timeout 60"

if [ -n "$SECRET_BINDINGS" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --update-secrets=$SECRET_BINDINGS"
fi

eval "$DEPLOY_CMD"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✓ Deploy complete!"
echo "  Service URL: https://$SERVICE_NAME-502261012207.$REGION.run.app"
echo "═══════════════════════════════════════════════════════"
