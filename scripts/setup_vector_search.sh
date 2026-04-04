#!/bin/bash

# Configuration
PROJECT_ID="react-app-492207"
REGION="us-central1"
BUCKET_NAME="${PROJECT_ID}-vector-search"
INDEX_NAME="nikhil_brain_index"
INDEX_ENDPOINT_NAME="nikhil_brain_endpoint"

echo "Step 1: Creating Google Cloud Storage Bucket..."
gsutil mb -l ${REGION} -p ${PROJECT_ID} gs://${BUCKET_NAME}

echo "Step 2: Uploading Brain Data (Assuming you ran /api/admin/setup-brain)..."
# This is usually done by the API Gateway, but for first-time setup:
# gsutil cp brain.json gs://${BUCKET_NAME}/ingest/brain.json

echo "Step 3: Creating Vertex AI Vector Search Index (Matches text-embedding-004)..."
gcloud ai indexes create \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --display-name=${INDEX_NAME} \
  --metadata-file=gs://${BUCKET_NAME}/ingest/brain.json \
  --index-update-method=BATCH_UPDATE \
  --description="Nikhil's AI Twin Brain Index"

echo "Step 4: Creating Vector Search Index Endpoint..."
gcloud ai index-endpoints create \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --display-name=${INDEX_ENDPOINT_NAME} \
  --public-endpoint-enabled

echo "Step 5: Deploying Index to Endpoint..."
# Note: You'll need the INDEX_ID and INDEX_ENDPOINT_ID from steps 3 and 4.
# Deployment can take 30-60 minutes.
echo "Manually deploy via Cloud Console or use 'gcloud ai index-endpoints deploy-index'."

echo "Setup script generated. Please modify variables as needed."
