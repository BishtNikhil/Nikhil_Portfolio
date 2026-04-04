#!/bin/bash
set -euo pipefail

# Configuration with Parameterization (CodeRabbit Fix)
PROJECT_ID="${GCP_PROJECT_ID:-react-app-492207}"
REGION="${GCP_REGION:-us-central1}"

# Validate gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed or not in PATH"
  exit 1
fi

# Check if user is authenticated (Robust bash test)
if [[ -z "$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)" ]]; then
  echo "Error: No active gcloud authentication found. Run 'gcloud auth login'"
  exit 1
fi

echo "------------------------------------------------"
echo "Vertex AI Vector Search Status Tracker"
echo "Project: ${PROJECT_ID} | Region: ${REGION}"
echo "------------------------------------------------"

echo "1. Checking Vertex AI Indexes..."
# Added 'state' and 'updateTime' (CodeRabbit Fix)
gcloud ai indexes list \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="table(displayName, name.scope(indexes):label=ID, state:label=STATUS, updateTime)"

echo ""
echo "2. Checking Index Endpoints..."
gcloud ai index-endpoints list \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="table(displayName, name.scope(indexEndpoints):label=ID, publicEndpointDomainName:label=ENDPOINT_DOMAIN)"

echo ""
echo "------------------------------------------------"
echo "NEXT STEPS:"
echo "Once the Index status is DEPLOYED or ACTIVE (approx 60 mins):"
echo "1. Run the /api/admin/setup-brain endpoint again to push real data."
echo "2. Verify the ENDPOINT_DOMAIN is set in your API Gateway environment variables."
echo "------------------------------------------------"
