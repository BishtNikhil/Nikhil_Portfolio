# Case Study: Serverless Scalability & Load Testing on GCP

This document serves as a permanent record and technical tutorial on how I orchestrated a high-availability Google Kubernetes Engine (GKE) cluster and subsequently load-tested my serverless Cloud Run architecture using 10,000 concurrent users. 

This case study is meant for recruiters, engineering managers, and fellow developers who wish to replicate this exact setup.

## Phase 1: Infrastructure as Code & GKE Orchestration
**Objective:** Prove capability in orchestrating containerized workloads in a standard GKE environment with proper resource limits, health checks, and network security policies.

### 1. Generating Kubernetes Manifests
We established three core YAML manifests located in `infra/k8s/`:
- **`deployment.yaml`**: Defined a 3-replica deployment pulling our custom container from Google Artifact Registry. Crucially, it established CPU limits (`500m`) and memory limits (`512Mi`) to prevent runaway node exhaustion, along with liveness and readiness probes pointing to our `/api/health` endpoint.
- **`service.yaml`**: Provisioned a Layer 4 Google Cloud External Network Load Balancer to expose port 80 to the public web and route it to port 8080 on the pods.
- **`network-policy.yaml`**: Enforced a least-privilege security model using Calico. It restricted egress traffic exclusively to port 443 (HTTPS) and DNS, blocking unauthorized lateral movement.

### 2. Spinning Up the Cluster
With the manifests written, we utilized the Google Cloud SDK to dynamically provision the cluster:
```bash
# 1. Create a 3-node cluster with standard machine types
gcloud container clusters create portfolio-cluster --num-nodes=3 --zone=us-central1-a --machine-type=e2-standard-4

# 2. Authenticate kubectl
gcloud container clusters get-credentials portfolio-cluster --zone=us-central1-a

# 3. Apply the infrastructure
kubectl apply -f infra/k8s/
```

## Phase 2: Distributed Load Testing (Locust)
**Objective:** Attack the serverless Cloud Run API gateway to find its breaking point and validate its auto-scaling capability under massive concurrent stress.

### 1. Provisioning a Load Injector VM
To generate 10,000 concurrent connections, a local laptop is insufficient due to socket exhaustion and bandwidth caps. We provisioned a heavy Compute Engine virtual machine:
```bash
gcloud compute instances create load-injector-vm --zone=us-central1-a --machine-type=n2-standard-4 --image-family=debian-11 --image-project=debian-cloud
```

### 2. The Python Locust Script
We wrote `testing/load/locustfile.py` to bombard the `/api/health` endpoint. We purposefully targeted the health check to avoid triggering HTTP 429 Rate Limits from external APIs (like GitHub or Gemini) while successfully triggering Cloud Run's CPU autoscaler. We added randomized `cache_buster` query parameters to prevent Cloud CDN from serving cached responses.

### 3. The Attack
We uploaded the script via `gcloud compute scp` and ran the headless attack inside the VM:
```bash
locust -f locustfile.py --headless -u 10000 -r 100 --host=https://portfolio-api-gateway-502261012207.us-central1.run.app --run-time 10m --html locust_report.html
```

**Results:** Cloud Run instantaneously detected the load, spinning up from 0 to over 100 active container instances. The p99 latencies remained sub-second despite the massive RPS (Requests Per Second) load.

## Phase 3: FinOps (Financial Operations)
**Objective:** Maintain zero ongoing costs.

Once the test concluded and the HTML reports were downloaded, we executed strict FinOps teardown procedures to ensure the $300 free trial credits were protected:
```bash
# Delete the expensive GKE Cluster
gcloud container clusters delete portfolio-cluster --zone=us-central1-a

# Delete the Load Injector VM
gcloud compute instances delete load-injector-vm --zone=us-central1-a
```
*Current Cloud Bill: $0.00.*
