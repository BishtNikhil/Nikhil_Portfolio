/* global process */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenAI } from '@google/genai';
import { Storage } from '@google-cloud/storage';
import { GoogleAuth } from 'google-auth-library';
import { v1 } from '@google-cloud/aiplatform';
const { MatchServiceClient } = v1;
import DLP from '@google-cloud/dlp';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ==========================================
// ENVIRONMENT-BASED CONFIGURATION (CodeRabbit Fix)
// ==========================================
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'react-app-492207';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const firestore = new Firestore({ projectId: PROJECT_ID });
const bigquery = new BigQuery({ projectId: PROJECT_ID });
const storage = new Storage({ projectId: PROJECT_ID });
// Vertex AI client — used for embeddings (text-embedding-004)
const ai = new GoogleGenAI({ project: PROJECT_ID, location: LOCATION, vertexai: true });
// Vertex AI Vector Search client
const VERTEX_ENDPOINT_DOMAIN = process.env.VERTEX_ENDPOINT_DOMAIN; 
const matchClient = new MatchServiceClient({ apiEndpoint: VERTEX_ENDPOINT_DOMAIN || 'us-central1-aiplatform.googleapis.com' });

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || `${PROJECT_ID}-vector-search`;
const INDEX_ENDPOINT_ID = process.env.VERTEX_INDEX_ENDPOINT_ID;
const DEPLOYED_INDEX_ID = process.env.VERTEX_DEPLOYED_INDEX_ID;

// Google AI (Gemini API) client — used for generative model calls
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not set. All generative chat features will fail.");
}
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

// Cloud DLP Client — for PII redaction in chat messages
let dlpClient;
try {
    dlpClient = new DLP.DlpServiceClient({ projectId: PROJECT_ID });
} catch (dlpErr) {
    console.warn('DLP Client initialization failed (DLP features will be disabled):', dlpErr.message);
}

const app = express();
const PORT = process.env.PORT || 8080;

// Enable 'trust proxy' as the app is running behind a Cloud Run load balancer 
// This ensures that the Rate Limiter picks up the correct client IP from X-Forwarded-For
app.set('trust proxy', 1);

// ==========================================
// SECURITY MIDDLEWARE (Addressing CodeRabbit Findings)
// ==========================================
app.use(helmet()); 

// Restricted CORS: only allow your portfolio domains
const allowedOrigins = [
  'https://react-app-492207.web.app', 
  'https://react-app-492207.firebaseapp.com',
  'http://localhost:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10kb' })); 

// Rate Limiting: 100 requests every 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
      // Robust IP Retrieval for Cloud Run proxies (CodeRabbit Fix)
      return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.socket.remoteAddress;
  },
  message: { error: 'Too many requests, please try again later.' }
});

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Portfolio API Gateway is running securely (v2.1.0).' });
});

// 2. Dynamic GitHub Stats Endpoint
app.get('/api/stats/github/:username', apiLimiter, async (req, res) => {
    try {
        const { username } = req.params;
        // Basic Input Validation
        if (!username || !/^[a-z\d](?:[a-z\d]|-(?=\w)){0,38}$/i.test(username)) {
            return res.status(400).json({ success: false, error: "Invalid GitHub username format." });
        }

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

// 2b. GitHub Activity / Commit Heatmap Endpoint
app.get('/api/stats/github/:username/activity', apiLimiter, async (req, res) => {
    try {
        const { username } = req.params;
        if (!username || !/^[a-z\d](?:[a-z\d]|-(?=\w)){0,38}$/i.test(username)) {
            return res.status(400).json({ success: false, error: 'Invalid GitHub username.' });
        }

        const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'PortfolioApp' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const response = await axios.get(
            `https://api.github.com/users/${username}/events?per_page=100`,
            { headers }
        );

        const now = new Date();
        const days28Ago = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
        const commitMap = {};

        // Initialize all 28 days
        for (let i = 0; i < 28; i++) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            commitMap[d.toISOString().split('T')[0]] = 0;
        }

        // Count commits from PushEvents
        response.data
            .filter(e => e.type === 'PushEvent' && new Date(e.created_at) >= days28Ago)
            .forEach(e => {
                const date = new Date(e.created_at).toISOString().split('T')[0];
                if (commitMap[date] !== undefined) {
                    commitMap[date] += (e.payload.commits?.length || e.payload.size || 1);
                }
            });

        const totalCommits = Object.values(commitMap).reduce((a, b) => a + b, 0);
        const activeDays = Object.values(commitMap).filter(v => v > 0).length;

        // Calculate current streak
        let streak = 0;
        const sortedDays = Object.entries(commitMap).sort((a, b) => b[0].localeCompare(a[0]));
        for (const [, count] of sortedDays) {
            if (count > 0) streak++;
            else break;
        }

        res.json({ success: true, data: { commitMap, totalCommits, activeDays, currentStreak: streak } });
    } catch (error) {
        console.error('GitHub Activity Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch GitHub activity.' });
    }
});

// 2c. WakaTime Language Usage Proxy Endpoint
app.get('/api/stats/wakatime', apiLimiter, async (req, res) => {
    try {
        const WAKATIME_KEY = process.env.WAKATIME_API_KEY;
        if (!WAKATIME_KEY) {
            return res.status(503).json({ success: false, error: 'WakaTime not configured.' });
        }

        const encoded = Buffer.from(WAKATIME_KEY).toString('base64');
        const response = await axios.get(
            'https://wakatime.com/api/v1/users/current/stats/last_7_days',
            { headers: { 'Authorization': `Basic ${encoded}` } }
        );

        const languages = (response.data.data?.languages || []).map(lang => ({
            name: lang.name,
            totalSeconds: lang.total_seconds || 0,
            percent: lang.percent || 0,
            hours: Math.floor((lang.total_seconds || 0) / 3600),
            minutes: Math.floor(((lang.total_seconds || 0) % 3600) / 60),
            color: lang.color || null
        }));

        res.json({
            success: true,
            data: {
                languages: languages.slice(0, 8),
                totalSeconds: response.data.data?.total_seconds || 0,
                dailyAverage: response.data.data?.daily_average || 0
            }
        });
    } catch (error) {
        console.error('WakaTime Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch WakaTime stats.' });
    }
});

// 2d. Credly Badges Proxy Endpoint (bypasses CORS)
app.get('/api/stats/credly/:userId/badges', apiLimiter, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || userId.length > 100) {
            return res.status(400).json({ success: false, error: 'Invalid Credly user ID.' });
        }

        const response = await axios.get(
            `https://www.credly.com/users/${encodeURIComponent(userId)}/badges.json`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'PortfolioApp/1.0' } }
        );

        const rawBadges = response.data?.data || response.data || [];
        const badges = (Array.isArray(rawBadges) ? rawBadges : []).map(badge => ({
            id: badge.id,
            title: badge.badge_template?.name || badge.name || 'Untitled Badge',
            description: badge.badge_template?.description || badge.description || '',
            imageUrl: badge.badge_template?.image_url || badge.image_url || badge.image || null,
            issuer: badge.issuer?.entities?.[0]?.entity?.name || badge.badge_template?.issuer?.name || badge.issuer_name || null,
            issuedAt: badge.issued_at || badge.issued_at_date || null,
            expiresAt: badge.expires_at || null,
            verifyUrl: badge.badge_url || (badge.id ? `https://www.credly.com/badges/${badge.id}` : '#'),
            skills: badge.badge_template?.skills || []
        }));

        res.json({ success: true, data: badges });
    } catch (error) {
        console.error('Credly Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch Credly badges.' });
    }
});

// 3. Analytics Visitor Tracking Logging Endpoint
app.post('/api/metrics/visit', apiLimiter, async (req, res) => {
    try {
        const userAgent = (req.headers['user-agent'] || 'unknown').substring(0, 255);
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
        const timestamp = new Date();
        
        const metricsRef = firestore.collection('portfolio_stats').doc('visits');
        await metricsRef.set({
            total_visits: FieldValue.increment(1),
            last_visit: timestamp
        }, { merge: true });

        if (req.query.project) {
            const projectName = String(req.query.project);
            const projectClicksRef = firestore.collection('portfolio_stats').doc('project_clicks');
            await projectClicksRef.set({
                [projectName]: FieldValue.increment(1)
            }, { merge: true });
        }

        const row = {
            timestamp: timestamp,
            userAgent: userAgent,
            ipPrefix: (ip.toString().split('.')[0] || '0') + '.*.*.*'
        };
        
        await bigquery.dataset('portfolio_data').table('visitor_logs').insert([row]);
        res.json({ success: true, message: 'Visit logged successfully' });
    } catch (error) {
        console.error("Metrics Logging Failed:", error.message);
        res.status(500).json({ success: false, error: 'Metrics logging failed' });
    }
});

// 3c. Analytics Project Clicks Read Endpoint
app.get('/api/metrics/projects', apiLimiter, async (req, res) => {
    try {
        const projectClicksRef = firestore.collection('portfolio_stats').doc('project_clicks');
        const docSnap = await projectClicksRef.get();
        if (docSnap.exists) {
            res.json({ success: true, data: docSnap.data() });
        } else {
            res.json({ success: true, data: {} });
        }
    } catch (error) {
        console.error("Project Clicks Fetch Failed:", error.message);
        res.status(500).json({ success: false, error: 'Project clicks fetch failed' });
    }
});

// 3b. Analytics Visitor Tracking Read Endpoint
app.get('/api/metrics/visits', apiLimiter, async (req, res) => {
    try {
        const metricsRef = firestore.collection('portfolio_stats').doc('visits');
        const docSnap = await metricsRef.get();
        if (docSnap.exists) {
            res.json({ success: true, visits: docSnap.data().total_visits || 0 });
        } else {
            res.json({ success: true, visits: 0 });
        }
    } catch (error) {
        console.error("Failed to fetch visits:", error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch visits' });
    }
});

// 3c. Case Study (Engineering Lab) Tracking Endpoint
app.post('/api/metrics/case-study', apiLimiter, async (req, res) => {
    try {
        const metricsRef = firestore.collection('portfolio_stats').doc('visits');
        await metricsRef.set({
            case_study_visits: FieldValue.increment(1)
        }, { merge: true });
        res.json({ success: true, message: 'Case study visit logged' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Metrics logging failed' });
    }
});

// 3d. Case Study Tracking Read Endpoint (For Admin Panel)
app.get('/api/metrics/case-study', apiLimiter, async (req, res) => {
    try {
        const metricsRef = firestore.collection('portfolio_stats').doc('visits');
        const docSnap = await metricsRef.get();
        if (docSnap.exists) {
            res.json({ success: true, visits: docSnap.data().case_study_visits || 0 });
        } else {
            res.json({ success: true, visits: 0 });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch visits' });
    }
});

// 4. RAG Chat Endpoint
app.post('/api/chat', apiLimiter, async (req, res) => {
    try {
        let { message } = req.body;
        // Input Validation & Length Check
        if (!message || typeof message !== 'string' || message.length > 500) {
            return res.status(400).json({ error: "Message required (max 500 characters)." });
        }

        // Sanitize PII with Cloud DLP before processing
        message = await sanitizeWithDLP(message);

        const contextString = await getRetrievedContext(message);

        const systemInstruction = `You are the AI Digital Twin of Nikhil Singh Bisht — a Cloud Engineer and Full Stack Developer.
Speak in first person ("I"). You ARE Nikhil. Be friendly, clear, and confident.
Answer only using the verified knowledge:
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

        // Defensive Null Check on generative response (CodeRabbit Fix)
        if (!response || !response.text) {
             return res.status(500).json({ success: false, error: "AI is currently reflective. Try again shortly." });
        }

        res.json({ success: true, text: response.text });
    } catch (error) {
        console.error("Chat API Error:", error.message);
        res.status(500).json({ success: false, error: "AI currently pondering. Try again shortly." });
    }
});

// Helper for RAG Retrieval
async function getRetrievedContext(message) {
    try {
        const embedRes = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: message
        });

        // Defensive Null Check on embedding response (CodeRabbit Fix)
        if (!embedRes.embeddings || !embedRes.embeddings[0] || !embedRes.embeddings[0].values) {
            throw new Error("Empty embedding returned from Vertex AI.");
        }

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

                // Defensive Null Check on Vertex response (CodeRabbit Fix)
                if (vertexResponse && vertexResponse.nearestNeighbors?.[0]?.neighbors) {
                    const neighborIds = vertexResponse.nearestNeighbors[0].neighbors.map(n => n.datapoint.datapointId);
                    if (neighborIds.length > 0) {
                        const docs = await Promise.all(neighborIds.map(id => firestore.collection('twin_brain').doc(id).get()));
                        docs.forEach(doc => { if (doc.exists) context.push(doc.data().text); });
                    }
                }
            } catch (vertexError) {
                console.warn("Retaining fallback due to Vertex latency or configuration...");
            }
        }

        // Fallback to Firestore Vector Search
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
        console.error("Context Retrieval Failed:", e.message);
        return "";
    }
}

// ==========================================
// DLP SANITIZATION HELPER
// ==========================================
async function sanitizeWithDLP(text) {
    if (!dlpClient) return text; // Graceful fallback if DLP not available
    try {
        const infoTypes = [
            { name: 'EMAIL_ADDRESS' },
            { name: 'PHONE_NUMBER' },
            { name: 'PERSON_NAME' },
            { name: 'CREDIT_CARD_NUMBER' },
            { name: 'US_SOCIAL_SECURITY_NUMBER' },
        ];
        const [response] = await dlpClient.deidentifyContent({
            parent: `projects/${PROJECT_ID}/locations/global`,
            item: { value: text },
            deidentifyConfig: {
                infoTypeTransformations: {
                    transformations: [{
                        infoTypes: infoTypes,
                        primitiveTransformation: {
                            replaceConfig: {
                                newValue: { stringValue: '[REDACTED]' }
                            }
                        }
                    }]
                }
            },
            inspectConfig: { infoTypes: infoTypes }
        });
        return response.item?.value || text;
    } catch (error) {
        console.warn('DLP sanitization failed, using original text:', error.message);
        return text; // Graceful fallback
    }
}

app.listen(PORT, () => {
    console.log(`SECURE API Gateway listening on port ${PORT}`);
});
