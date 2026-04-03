# Nikhil Singh Bisht - AI-Powered Portfolio

This is a modern, full-stack portfolio application designed to showcase Cloud Engineering and AI expertise. It features a custom-built **AI Digital Twin** powered by Retrieval-Augmented Generation (RAG), providing recruiters and developers with a contextualized, conversational interface to explore my professional background.

## 🚀 Key Features

- **AI Digital Twin (RAG)**: A serverless chatbot built with Gemini 1.5 Pro and Vertex AI Vector Search. It retrieves relevant sections of my career history to provide accurate, non-hallucinated answers.
- **Serverless API Gateway**: A decoupled backend running on **Google Cloud Run**, handling AI processing, visitor tracking, and project metadata.
- **Real-time Visitor Analytics**: Integrated with **Firestore** and **BigQuery** to track unique visits and session metrics in real-time.
- **Modern UI**: Built with **React + Vite**, featuring glassmorphism design, responsive layouts, and dynamic project fetching from the GitHub API.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide Icons, CSS3.
- **Backend**: Node.js, Express.js (deployed on Google Cloud Run).
- **AI/ML**: Google Vertex AI (Gemini 1.5 Pro, Text Embeddings), Firestore Vector Search.
- **Database**: Google Firestore (NoSQL), Google BigQuery (Data Analytics).
- **Infrastructure**: Firebase Hosting, Google Cloud Build (CI/CD), Docker.

## ⚙️ Setup & Configuration

### Prerequisites
- Node.js (v20+)
- Google Cloud SDK (gcloud)
- Firebase CLI

### Environment Variables
To run the project locally or deploy it, the following environment variables are required in the `api-gateway`:
- `GEMINI_API_KEY`: Your Google Gen AI API key.
- `PROJECT_ID`: Your Google Cloud Project ID.

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BishtNikhil/Nikhil_Portfolio.git
   cd Nikhil_Portfolio
   ```

2. **Install dependencies**:
   ```bash
   # Front-end
   npm install

   # API Gateway
   cd api-gateway
   npm install
   ```

3. **Configure Firebase**:
   Replace the placeholder in `src/firebaseConfig.js` with your actual project credentials.

4. **Run the application**:
   ```bash
   # Start the API Gateway
   cd api-gateway
   node server.js

   # Start the Frontend
   cd ..
   npm run dev
   ```

## 📄 License
This project is for demonstration and portfolio purposes. All rights reserved.
