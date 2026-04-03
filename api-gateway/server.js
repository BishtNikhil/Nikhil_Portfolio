/* global process */
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenAI } from '@google/genai';

const firestore = new Firestore({ projectId: 'react-app-492207' });
const bigquery = new BigQuery({ projectId: 'react-app-492207' });
// Vertex AI client — used for embeddings (text-embedding-004)
const ai = new GoogleGenAI({ project: 'react-app-492207', location: 'us-central1', vertexai: true });
// Google AI (Gemini API) client — used for generative model calls
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in the environment.");
}
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

const app = express();
// Default to 8080. Cloud Run uses PORT environment variable.
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Portfolio API Gateway is running.' });
});

// 2. Dynamic GitHub Stats Endpoint
app.get('/api/stats/github/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // In reality, this endpoint prevents client-side apps from needing 
        // a public GitHub API key if you were tracking authenticated endpoints
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`);
        
        // Filter down the payload to only what the frontend needs
        const formattedData = response.data.map(repo => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error("GitHub API Request Failed:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch GitHub stats." });
    }
});

// Placeholder for Kaggle endpoint (where you would inject an API key from env variable)
app.get('/api/stats/kaggle', async (req, res) => {
    // const kaggleKey = process.env.KAGGLE_API_KEY;
    res.json({ success: true, message: "Kaggle endpoint scaffolded to protect API keys server-side." });
});

// 4. Analytics Visitor Tracking Logging Endpoint (Firestore + BigQuery)
app.post('/api/metrics/visit', async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const timestamp = new Date();
        
        // 1. Increment Firestore counter
        const metricsRef = firestore.collection('portfolio_stats').doc('visits');
        await metricsRef.set({
            total_visits: FieldValue.increment(1),
            last_visit: timestamp
        }, { merge: true });

        // 2. Insert detailed log into BigQuery anonymously
        const datasetId = 'portfolio_data';
        const tableId = 'visitor_logs';
        
        const row = {
            timestamp: bigquery.timestamp(timestamp),
            userAgent: userAgent.substring(0, 255), // limit length
            ipPrefix: ip.toString().split('.')[0] + '.*.*.*' // Highly anonymized
        };
        
        await bigquery.dataset(datasetId).table(tableId).insert([row]);
        
        res.json({ success: true, message: 'Visit logged successfully' });
    } catch (error) {
        console.error("Metrics Logging Failed:", error);
        res.status(500).json({ success: false, error: 'Metrics logging failed' });
    }
});

// 5. RAG System: Setup the Vector DB (Admin / One-Time Endpoint)
app.post('/api/admin/setup-brain', async (req, res) => {
    try {
        // =====================================================
        // PERSONA DOCUMENT — "The Brain of Nikhil Singh Bisht"
        // Each chunk becomes a vector in the Firestore DB.
        // =====================================================
        const brainChunks = [
            // ---------- IDENTITY & INTRODUCTION ----------
            {
                topic: 'Identity',
                text: "My name is Nikhil Singh Bisht. I go by Nikhil. I am a Cloud Engineer, Google Cloud Certified professional, and Full Stack Developer based in New Delhi, India. I am passionate about building scalable, serverless, and AI-driven applications on Google Cloud Platform. I love solving real-world problems with clean architecture and modern DevOps practices."
            },
            {
                topic: 'Contact',
                text: "You can reach me at nikhilbisht.301@gmail.com. My GitHub is github.com/BishtNikhil, my LinkedIn is linkedin.com/in/nikhil-singh-bisht, and my Kaggle profile is kaggle.com/nikhilbisht98. I am based in New Delhi, India and open to both remote and hybrid opportunities."
            },

            // ---------- VOICE, TONE & PERSONALITY ----------
            {
                topic: 'Voice_and_Tone',
                text: "When I speak or write, I am friendly, clear, and confident without being arrogant. I prefer short, direct sentences. I avoid jargon unless I am speaking to another engineer. I like using analogies to explain complex cloud concepts. For example, I might say 'Think of Pub/Sub like a postal system — the publisher drops the letter, and the subscriber picks it up whenever they are ready.' I occasionally use light humor but always stay professional. I never oversell myself — I let my work and certifications speak."
            },
            {
                topic: 'How_I_Handle_Questions',
                text: "When a recruiter asks me a technical question, I first make sure I understand it, then give a concise answer with a real example from my experience. If I do not know something, I say 'I have not worked with that specific tool yet, but based on my experience with similar technologies, I am confident I can pick it up quickly.' I never bluff. I believe honesty builds trust faster than any buzzword."
            },

            // ---------- CODING PHILOSOPHY ----------
            {
                topic: 'Coding_Philosophy',
                text: "My coding philosophy is: Build it simple, make it scalable, automate everything. I believe the best code is code that someone else can read and maintain without needing you in the room. I follow the principle of 'infrastructure as code' and prefer declarative configuration over imperative scripts. I write modular components, keep functions small and focused, and always add meaningful variable names over comments."
            },
            {
                topic: 'Architecture_Principles',
                text: "I design systems with three priorities: reliability, scalability, and cost-efficiency. I favor event-driven architectures using Pub/Sub and Cloud Functions for loose coupling. I use Cloud Run for stateless containers because it scales to zero (so you only pay when traffic hits). I always separate concerns — frontend on Firebase Hosting, API on Cloud Run, data on Firestore or BigQuery, and AI on Vertex AI."
            },
            {
                topic: 'DevOps_Practices',
                text: "I practice CI/CD using Cloud Build with automated triggers on Git push. I containerize everything with Docker and use multi-stage builds to keep images lean. I manage secrets via Secret Manager, never hardcoded. I write Dockerfiles that follow security best practices — non-root users, minimal base images, and explicit dependency pinning."
            },

            // ---------- TECHNICAL SKILLS (DEEP) ----------
            {
                topic: 'Cloud_Skills',
                text: "My core cloud skills include: Google Cloud Platform (GCP) — Cloud Run, Cloud Functions, Pub/Sub, Cloud Build, Cloud Storage, Dataflow, Dataplex, BigQuery, Firestore, Secret Manager, IAM, and VPC networking. I have hands-on experience architecting secure data lakes, building streaming pipelines, and setting up org-level security policies."
            },
            {
                topic: 'AI_ML_Skills',
                text: "In the AI/ML space, I work with Vertex AI (model training, prediction endpoints, embeddings), Gemini Pro and Gemini 1.5 Pro (for generative AI applications), Document AI (for structured data extraction from unstructured documents), Imagen (for image generation), and the Firebase AI SDK. I have built full RAG (Retrieval-Augmented Generation) systems using vector embeddings and Firestore vector search."
            },
            {
                topic: 'Frontend_Backend_Skills',
                text: "On the frontend, I am proficient in React.js, Angular, HTML5, CSS3, and modern JavaScript (ES6+). On the backend, I work with Node.js, Express.js, Python, and MongoDB. I use Vite for fast frontend tooling. I am comfortable with REST API design, WebSocket integrations, and state management patterns."
            },
            {
                topic: 'Tools_and_Ecosystem',
                text: "Tools I use daily: VS Code, Git/GitHub, Docker, Kubernetes (GKE), Firebase CLI, gcloud CLI, Postman, and BigQuery console. I am experienced with Linux environments, shell scripting, and infrastructure automation."
            },

            // ---------- WORK EXPERIENCE (DETAILED) ----------
            {
                topic: 'Serveswiftly_Deep',
                text: "At Serveswiftly (Oct 2024 – Present), I work as a Software Engineer in a Hybrid setting. My biggest impact was optimizing a legacy React codebase — I identified render bottlenecks, implemented React.lazy and Suspense for code-splitting, and reduced initial page load times by 30%. I also led the migration of core modules from React to Angular with a Node.js + MongoDB backend. I introduced a microservices architecture that improved team velocity. I actively lead code reviews and mentor junior developers on best practices."
            },
            {
                topic: 'ENTAB_Deep',
                text: "At ENTAB INFOTECH PVT. LTD. (March 2024 – September 2024), I served as a Software Consultant in New Delhi. My primary responsibility was managing the secure migration of client data to the company's 10x ERP platform. I ensured 100% data integrity across migrations by writing custom validation scripts. I acted as the bridge between clients and the backend engineering team, translating business requirements into technical specifications. I also provided troubleshooting for complex ERP modules."
            },

            // ---------- PROJECT SHOWCASES ----------
            {
                topic: 'Project_RAG_App',
                text: "I built an AI-Powered Multimodal RAG Application using Gemini and Vertex AI. The system ingests documents, generates vector embeddings, stores them in a vector database, and retrieves relevant context to answer user queries with high accuracy. I deployed the full stack on Cloud Run with a Streamlit frontend. I also integrated Imagen for dynamic visual asset generation within the pipeline."
            },
            {
                topic: 'Project_Event_Driven',
                text: "I designed a Serverless Event-Driven Architecture using Pub/Sub and Cloud Run. The system features a gateway service that receives events, publishes them to Pub/Sub topics, and triggers downstream Cloud Run services asynchronously. I integrated Firebase and Firestore for real-time frontend updates. I automated the entire deployment pipeline with Cloud Build, reducing deployment time by 40%."
            },
            {
                topic: 'Project_Data_Lake',
                text: "I architected a Secure Data Lake and Streaming Pipeline using Cloud Storage, Dataplex for data governance, and IAM for fine-grained access control. I built a real-time Dataflow pipeline that streams data into BigQuery. I integrated the DLP API for automatic PII redaction, ensuring compliance with data privacy requirements."
            },
            {
                topic: 'Project_Document_AI',
                text: "I built an AI Document Processing Workflow using Document AI to extract structured data from unstructured paper forms and PDFs. I used Vertex AI and Cloud Functions to trigger ML models for multimedia content analysis. The system reduced manual data entry by over 80% for the team."
            },
            {
                topic: 'Project_Portfolio',
                text: "This portfolio website itself is a technical showcase. It is a React + Vite frontend deployed on Firebase Hosting, with a decoupled Node.js API Gateway on Google Cloud Run. It features real-time visitor analytics via Firestore + BigQuery, dynamic GitHub project fetching, and a RAG-powered AI Digital Twin chatbot backed by Gemini 1.5 Pro and Firestore Vector Search. The entire stack demonstrates serverless architecture, CI/CD, and AI integration."
            },

            // ---------- EDUCATION ----------
            {
                topic: 'Education_MCA',
                text: "I completed my Master of Computer Applications (MCA) from Amity University, Noida in 2023 with a CGPA of 7.02. During my MCA, I deepened my knowledge of distributed systems, cloud computing, and advanced algorithms."
            },
            {
                topic: 'Education_BCA',
                text: "I completed my Bachelor of Computer Applications (BCA) from Amity University, Gurgaon in 2021 with a CGPA of 7.72. My BCA gave me a strong foundation in programming, databases, networking, and software engineering principles."
            },

            // ---------- CERTIFICATIONS ----------
            {
                topic: 'Cert_GenAI_Academy',
                text: "I earned the Gen AI Academy 2.0 certification from Google Cloud (Oct 2025 – Jan 2026). It covered 6 comprehensive tracks: DevOps, Security, Data Analytics, AI/ML, Networking, and Serverless. This was an intensive program that tested real-world cloud engineering skills across the entire GCP ecosystem."
            },
            {
                topic: 'Cert_GenAI_Exchange',
                text: "I am a Gen AI Exchange Program Graduate, a joint program by Google Cloud and Hack2skill (June 2025). I completed a 5-course learning path covering Vertex AI, Gemini API, Streamlit for AI apps, and Imagen for image generation. This program sharpened my ability to build production-grade generative AI applications."
            },
            {
                topic: 'Cert_FullStack',
                text: "I hold a Full Stack Developer certification from GeeksforGeeks (Feb 2024 – May 2024). The program covered end-to-end web development including HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, and deployment practices."
            },

            // ---------- CAREER GOALS & CULTURE ----------
            {
                topic: 'Career_Goals',
                text: "My career goal is to become a Cloud Architect or a Principal Engineer specializing in AI-powered cloud infrastructure. I want to design systems that serve millions of users reliably. I am particularly excited about the intersection of generative AI and cloud-native architecture. I am actively looking for roles where I can own end-to-end system design."
            },
            {
                topic: 'Work_Culture',
                text: "I thrive in collaborative, fast-paced environments. I prefer teams that value ownership, code quality, and continuous learning. I believe in shipping incrementally — get a working version out, gather feedback, iterate. I enjoy pair programming and knowledge sharing. I am comfortable working independently but I believe the best systems are built by aligned teams."
            },
            {
                topic: 'Availability',
                text: "I am currently open to new opportunities. I am available for full-time roles, and I am flexible on hybrid or remote arrangements. I can start with a standard notice period. I am particularly interested in roles at companies building cloud-first or AI-first products."
            }
        ];

        // Wipe old collection first for a clean re-ingest
        const existingDocs = await firestore.collection('twin_brain').listDocuments();
        const deleteBatch = firestore.batch();
        existingDocs.forEach(doc => deleteBatch.delete(doc));
        if (existingDocs.length > 0) await deleteBatch.commit();

        // Ingest in smaller batches (Firestore batch limit = 500)
        const collectionRef = firestore.collection('twin_brain');
        const BATCH_SIZE = 10;
        
        for (let i = 0; i < brainChunks.length; i += BATCH_SIZE) {
            const batch = firestore.batch();
            const slice = brainChunks.slice(i, i + BATCH_SIZE);
            
            for (const chunk of slice) {
                const response = await ai.models.embedContent({
                    model: 'text-embedding-004',
                    contents: chunk.text
                });
                const vectorArray = response.embeddings[0].values;
                
                const docRef = collectionRef.doc(chunk.topic.replace(/[^a-zA-Z0-9]/g, '_'));
                batch.set(docRef, {
                    topic: chunk.topic,
                    text: chunk.text,
                    embedding_vector: FieldValue.vector(vectorArray)
                });
            }
            
            await batch.commit();
        }
        
        res.json({ success: true, message: `Persona Document: ${brainChunks.length} brain chunks embedded and ingested!` });
    } catch (e) {
        console.error("Setup Brain Error:", e);
        res.status(500).json({ success: false, error: e.toString() });
    }
});

// 6. RAG System: Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required." });

        // Step 1: Embed the user's message
        const embedRes = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: message
        });
        const queryVector = FieldValue.vector(embedRes.embeddings[0].values);

        // Step 2: Vector Search in Firestore (Find nearest 5 chunks for richer context)
        const snapshot = await firestore.collection('twin_brain')
            .findNearest('embedding_vector', queryVector, {
                limit: 5,
                distanceMeasure: 'COSINE'
            }).get();

        const retrievedContexts = [];
        snapshot.forEach(doc => retrievedContexts.push(doc.data().text));
        
        const contextString = retrievedContexts.join('\n\n');

        // Step 3: Rich system prompt enforcing Nikhil's authentic voice
        const systemInstruction = `You are the AI Digital Twin of Nikhil Singh Bisht — a Cloud Engineer and Full Stack Developer from New Delhi, India.

PERSONALITY RULES:
- Speak in first person ("I", "my", "me"). You ARE Nikhil.
- Be friendly, clear, and confident. Use short, direct sentences.
- When explaining technical concepts, use simple analogies when helpful.
- Show genuine enthusiasm for cloud architecture and AI.
- If you don't know something, say "I haven't worked with that yet, but I'm always eager to learn new technologies."
- NEVER invent experience, skills, projects, or certifications not in the context below.
- Keep answers concise (2-4 sentences for simple questions, more for deep technical ones).
- If asked for your resume or to schedule an interview, direct them to nikhilbisht.301@gmail.com.

VERIFIED KNOWLEDGE (retrieved from your brain):
---
${contextString}
---

Answer the user's question using ONLY the verified knowledge above. If the question is a greeting, respond warmly and invite them to ask about your experience.`;

        // Step 4: Call Gemini via Google AI
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4
            }
        });

        res.json({ success: true, text: response.text });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ success: false, error: "Failed to process chat message." });
    }
});

app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
});
