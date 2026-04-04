/* global process */
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenAI } from '@google/genai';
import { Storage } from '@google-cloud/storage';
import { GoogleAuth } from 'google-auth-library';
import { v1 } from '@google-cloud/aiplatform';
const { MatchServiceClient } = v1;
import fs from 'fs';
import path from 'path';
import os from 'os';

const PROJECT_ID = 'YOUR_PROJECT_ID';
const LOCATION = 'YOUR_LOCATION';

const firestore = new Firestore({ projectId: PROJECT_ID });
const bigquery = new BigQuery({ projectId: PROJECT_ID });
const storage = new Storage({ projectId: PROJECT_ID });
// Vertex AI client — used for embeddings (text-embedding-004)
const ai = new GoogleGenAI({ project: PROJECT_ID, location: LOCATION, vertexai: true });
// Vertex AI Vector Search client
const VERTEX_ENDPOINT_DOMAIN = process.env.VERTEX_ENDPOINT_DOMAIN || 'YOUR_ENDPOINT_DOMAIN'; 
const matchClient = new MatchServiceClient({ apiEndpoint: VERTEX_ENDPOINT_DOMAIN });

const BUCKET_NAME = `${PROJECT_ID}-vector-search`;
const INDEX_ENDPOINT_ID = process.env.VERTEX_INDEX_ENDPOINT_ID || 'YOUR_INDEX_ENDPOINT_ID';
const DEPLOYED_INDEX_ID = process.env.VERTEX_DEPLOYED_INDEX_ID || 'YOUR_DEPLOYED_INDEX_ID';

// Google AI (Gemini API) client — used for generative model calls
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in the environment.");
}
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

const app = express();
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
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`);
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

// 3. Analytics Visitor Tracking Logging Endpoint
app.post('/api/metrics/visit', async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const timestamp = new Date();
        
        const metricsRef = firestore.collection('portfolio_stats').doc('visits');
        await metricsRef.set({
            total_visits: FieldValue.increment(1),
            last_visit: timestamp
        }, { merge: true });

        const row = {
            timestamp: bigquery.timestamp(timestamp),
            userAgent: userAgent.substring(0, 255),
            ipPrefix: ip.toString().split('.')[0] + '.*.*.*'
        };
        
        await bigquery.dataset('portfolio_data').table('visitor_logs').insert([row]);
        res.json({ success: true, message: 'Visit logged successfully' });
    } catch (error) {
        console.error("Metrics Logging Failed:", error);
        res.status(500).json({ success: false, error: 'Metrics logging failed' });
    }
});

// 4. RAG Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required." });

        const contextString = await getRetrievedContext(message);

        const getCacheTTL = () => {
            const now = new Date();
            const utcHour = now.getUTCHours();
            const istHour = (utcHour + 5) % 24; 
            return (istHour >= 8 && istHour < 22) ? 3600 : 60;
        };

        const systemInstruction = `You are the AI Digital Twin of Nikhil Singh Bisht — a Cloud Engineer and Full Stack Developer from New Delhi, India.

PERSONALITY RULES:
- Speak in first person ("I", "my", "me"). You ARE Nikhil.
- Be friendly, clear, and confident. Use short, direct sentences.
- NEVER invent experience, skills, projects, or certifications not in the context below.
- Keep answers concise (2-4 sentences).

VERIFIED KNOWLEDGE:
---
${contextString}
---`;

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

// Helper for RAG Retrieval
async function getRetrievedContext(message) {
    try {
        const embedRes = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: message
        });

        let context = [];
        if (VERTEX_ENDPOINT_DOMAIN && INDEX_ENDPOINT_ID) {
            try {
                const [vertexResponse] = await matchClient.findNeighbors({
                    indexEndpoint: `projects/${PROJECT_ID}/locations/${LOCATION}/indexEndpoints/${INDEX_ENDPOINT_ID}`,
                    deployedIndexId: DEPLOYED_INDEX_ID,
                    queries: [{
                        datapoint: { featureVector: embedRes.embeddings[0].values },
                        neighborCount: 5
                    }]
                });

                const neighborIds = vertexResponse.nearestNeighbors[0].neighbors.map(n => n.datapoint.datapointId);
                if (neighborIds.length > 0) {
                    const docs = await Promise.all(neighborIds.map(id => firestore.collection('twin_brain').doc(id).get()));
                    docs.forEach(doc => { if (doc.exists) context.push(doc.data().text); });
                }
            } catch (vertexError) {
                console.warn("Vertex AI Search Fallback...");
            }
        }

        if (context.length === 0) {
            const queryVector = FieldValue.vector(embedRes.embeddings[0].values);
            const snapshot = await firestore.collection('twin_brain')
                .findNearest('embedding_vector', queryVector, {
                    limit: 5,
                    distanceMeasure: 'COSINE'
                }).get();
            snapshot.forEach(doc => context.push(doc.data().text));
        }

        return context.join('\n\n');
    } catch (e) {
        console.error("Context Retrieval Failed:", e);
        return "";
    }
}

app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
});
