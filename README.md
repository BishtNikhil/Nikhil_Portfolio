# Nikhil Singh Bisht - AI-Powered Portfolio

This is a modern, full-stack portfolio application designed to showcase Cloud Engineering and AI expertise. It features a custom-built **AI Digital Twin** powered by Retrieval-Augmented Generation (RAG), providing recruiters and developers with a contextualized, conversational interface to explore my professional background.

## 🚀 Key Features

- **AI Digital Twin (RAG)**: A serverless chatbot built with Gemini 2.5 Flash and Firestore Vector Search. It retrieves relevant sections of career history to provide accurate, non-hallucinated answers.
- **Serverless API Gateway**: A decoupled backend running on **Google Cloud Run**, handling AI processing, visitor tracking, live GitHub commit heatmaps, WakaTime coding stats, and Credly badge verification.
- **Zero-Cost FinOps Architecture**: Engineered strictly for **₹0.00 / $0.00 perpetual operation** using Google Cloud Free Tier quotas, automatic scale-to-zero compute (`min-instances: 0`), and direct in-memory secret injection (bypassing paid Secret Manager storage).
- **Security & Privacy First**: Implements **Cloud DLP** for active PII redaction during chats, backed by strict Helmet HTTP headers, CORS whitelisting, Input Validation, and IP Rate Limiting.
- **Real-time Observability**: Integrated with **Firestore** and **BigQuery** for visitor telemetry, click analytics, and live activity tracking.
- **Modern UI**: Built with **React + Vite**, featuring glassmorphism design, responsive layouts, interactive skill radars, and dynamic repository fetching from the GitHub API.

## 🛡️ Security & FinOps Audit (v2.1.0)

This application follows a zero-trust security and zero-cost cloud architecture:
- **CORS Restriction**: API Gateway exclusively allows requests from internal portfolio domains and localhost.
- **Rate Limiting**: IP-based rate limiting (100 req / 15 min) configured accurately behind Cloud Run load balancers using `trust proxy`.
- **DDoS Protection**: JSON payload limits (10kb) and HTTP header hardening via `helmet`.
- **Secret Management**: Absolute zero-trust policy. Local `.secrets.env` is strictly gitignored and injected directly into Cloud Run runtime memory during deployment with zero cloud storage fees.
- **Zero Idle Compute**: Cloud Run instance auto-scaling is capped at `--min-instances 0` to ensure no idle CPU charges.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide Icons, CSS3 (Vanilla).
- **Backend**: Node.js, Express.js (deployed on Google Cloud Run).
- **AI/ML**: Google Gemini (2.5 Flash), Google Cloud DLP, Firestore Vector Search.
- **Database & Analytics**: Google Firestore (NoSQL), Google BigQuery (Visitor Logs).
- **Infrastructure & CI/CD**: Firebase Hosting, Google Cloud Run, GitHub Actions.

## 📂 Project Structure

```text
Nikhil_Portfolio/
├── frontend/                # React.js & Vite Frontend
│   ├── src/                 # UI Components & App logic
│   ├── public/              # Static assets (images, case studies)
│   ├── dist/                # Production build output
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Node.js & Express API (Cloud Run)
│   ├── server.js            # Core API Gateway, RAG AI & telemetry logic
│   ├── ingest.js            # Vector Search ingestion script
│   ├── deploy.ps1           # Windows direct deploy script (Zero-cost env vars)
│   ├── deploy.sh            # Bash direct deploy script (Zero-cost env vars)
│   ├── .env.example         # Template for required environment variables
│   ├── Dockerfile           # Lightweight Alpine container configuration
│   └── package.json         # Backend dependencies
│
├── scripts/                 # Infrastructure and maintenance scripts
├── firebase.json            # Firebase Hosting configuration
├── firestore.rules          # Firestore database security rules
└── README.md                # Project documentation
```

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js (v20+)
- Google Cloud SDK (`gcloud`)
- Firebase CLI (`firebase`)

### Environment Variables
To run the project locally or deploy it, configure your keys in the `backend` directory:
1. Copy `backend/.env.example` to `backend/.secrets.env`:
   ```bash
   cp backend/.env.example backend/.secrets.env
   ```
2. Populate your keys in `backend/.secrets.env`:
   - `GEMINI_API_KEY`: Required for the AI Digital Twin chatbot.
   - `GITHUB_TOKEN`: Required for dynamic GitHub stats & commit activity.
   - `WAKATIME_API_KEY`: Required for live language coding stats.

*(Note: `backend/.secrets.env` is gitignored — your keys remain local and are never committed to version control).*

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BishtNikhil/Nikhil_Portfolio.git
   cd Nikhil_Portfolio
   ```

2. **Install dependencies**:
   ```bash
   # Front-end
   cd frontend
   npm install
   cd ..

   # Backend API
   cd backend
   npm install
   cd ..
   ```

3. **Run the application locally**:
   ```bash
   # Terminal 1: Start Backend API Server (Port 8080)
   cd backend
   npm start

   # Terminal 2: Start Frontend Dev Server (Port 5173)
   cd frontend
   npm run dev
   ```

### Deployment to Google Cloud (Zero-Cost)

To deploy updates to Google Cloud Run and Firebase Hosting:

```powershell
# Deploy Backend directly to Cloud Run (from backend directory)
cd backend
npm run deploy

# Deploy Frontend to Firebase Hosting (from root directory)
cd ..
firebase deploy --only hosting
```

## 📄 License
This project is for demonstration and portfolio purposes. All rights reserved.
