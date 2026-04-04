#!/bin/bash
set -euo pipefail

# Validate gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed or not in PATH"
  exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo "Error: No active gcloud authentication found. Run 'gcloud auth login'"
  exit 1
fi

PROJECT_ID="react-app-492207"
REGION="us-central1"

echo "------------------------------------------------"
echo "Vertex AI Vector Search Status Tracker"
echo "------------------------------------------------"

echo "1. Checking Vertex AI Indexes..."
gcloud ai indexes list --region=${REGION} --project=${PROJECT_ID} --format="table(displayName, name, createTime, updateTime)"

echo ""
echo "2. Checking Index Endpoints..."
gcloud ai index-endpoints list --region=${REGION} --project=${PROJECT_ID} --format="table(displayName, name, publicEndpointDomainName)"

echo ""
echo "------------------------------------------------"
echo "NEXT STEPS:"
echo "Once the Index status is ACTIVE (approx 60 mins):"
echo "1. Run the /api/admin/setup-brain endpoint again to push real data."
echo "2. Deploy the Index to the Endpoint using the Cloud Console or gcloud."
echo "------------------------------------------------"
