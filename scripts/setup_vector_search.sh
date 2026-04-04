#!/bin/bash
set -euo pipefail # Error handling (CodeRabbit Fix)

# Configuration with Parameterization (CodeRabbit Fix)
PROJECT_ID="${GCP_PROJECT_ID:-react-app-492207}"
REGION="${GCP_REGION:-us-central1}"
BUCKET_NAME="${INDEX_BUCKET:-${PROJECT_ID}-vector-search}"
INDEX_NAME="${INDEX_DISPLAY_NAME:-nikhil_brain_index}"
INDEX_ENDPOINT_NAME="${ENDPOINT_DISPLAY_NAME:-nikhil_brain_endpoint}"

echo "Step 1: Creating Google Cloud Storage Bucket..."
# Idempotency Check (CodeRabbit Fix)
if gsutil ls -p "${PROJECT_ID}" "gs://${BUCKET_NAME}" &>/dev/null; then
  echo "Bucket gs://${BUCKET_NAME} already exists. Skipping."
else
  gsutil mb -l "${REGION}" -p "${PROJECT_ID}" "gs://${BUCKET_NAME}"
fi

echo "Step 2: Uploading Brain Data..."
# Ensure the ingest directory exists
gsutil cp brain.json "gs://${BUCKET_NAME}/ingest/brain.json" || {
  echo "Error: brain.json not found locally. Run ingestion first."
  exit 1
}

echo "Step 3: Creating Vertex AI Vector Search Index..."
# Check for existing index to ensure idempotency (CodeRabbit Fix)
EXISTING_INDEX=$(gcloud ai indexes list --region="${REGION}" --project="${PROJECT_ID}" --filter="displayName:${INDEX_NAME}" --format="value(name)" || true)
if [[ -n "${EXISTING_INDEX}" ]]; then
  echo "Index ${INDEX_NAME} already exists. Skipping creation."
else
  gcloud ai indexes create \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --display-name="${INDEX_NAME}" \
    --metadata-file="gs://${BUCKET_NAME}/ingest/brain.json" \
    --index-update-method=BATCH_UPDATE \
    --description="Nikhil's AI Twin Brain Index"
fi

echo "Step 4: Creating Vector Search Index Endpoint..."
# Idempotency Check
EXISTING_ENDPOINT=$(gcloud ai index-endpoints list --region="${REGION}" --project="${PROJECT_ID}" --filter="displayName:${INDEX_ENDPOINT_NAME}" --format="value(name)" || true)
if [[ -n "${EXISTING_ENDPOINT}" ]]; then
  echo "Endpoint ${INDEX_ENDPOINT_NAME} already exists. Skipping creation."
else
  gcloud ai index-endpoints create \
    --project="${PROJECT_ID}" \
    --region="${REGION}" \
    --display-name="${INDEX_ENDPOINT_NAME}" \
    --public-endpoint-enabled
fi

echo "Step 5: Next Steps..."
echo "Vertex AI Setup script complete."
echo "Use 'bash scripts/check_infra_status.sh' to track deployment progress."
