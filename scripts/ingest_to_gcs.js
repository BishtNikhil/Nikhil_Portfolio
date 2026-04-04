import { Firestore, FieldValue } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const PROJECT_ID = 'react-app-492207';
const LOCATION = 'us-central1';
const BUCKET_NAME = `${PROJECT_ID}-vector-search`;

// Clients
const firestore = new Firestore({ projectId: PROJECT_ID });
const storage = new Storage({ projectId: PROJECT_ID });
const ai = new GoogleGenAI({ project: PROJECT_ID, location: LOCATION, vertexai: true });

async function ingest() {
  console.log("Starting Vector Ingestion for 'Nikhil Persona'...");
  
  const brainChunks = [
    { topic: 'Identity', text: "My name is Nikhil Singh Bisht. I go by Nikhil. I am a Cloud Engineer and Full Stack Developer from New Delhi, India." },
    { topic: 'Contact', text: "Contact me at nikhilbisht.301@gmail.com, github.com/BishtNikhil, linkedin.com/in/nikhil-singh-bisht." },
    { topic: 'Voice', text: "I am friendly, clear, and confident. I use analogies for cloud concepts." },
    { topic: 'Skills', text: "GCP (Cloud Run, Functions, Pub/Sub, BQ), React, Node.js, AI/ML (Vertex AI, Gemini, RAG)." },
    { topic: 'Experience', text: "Software Engineer at Serveswiftly; Consultant at ENTAB. Migrated legacy systems to GCP." }
  ];

  const vectorData = [];

  for (let i = 0; i < brainChunks.length; i++) {
    const chunk = brainChunks[i];
    const id = `chunk_${i}`;
    console.log(`Embedding chunk: ${chunk.topic}...`);

    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: chunk.text
    });
    const vectorArray = response.embeddings[0].values;

    // Save to Firestore (ID -> Text Mapping)
    await firestore.collection('twin_brain').doc(id).set({
      id: id,
      topic: chunk.topic,
      text: chunk.text,
      embedding_vector: FieldValue.vector(vectorArray)
    });

    // Collect for Vector Search JSONL
    vectorData.push(JSON.stringify({ id, embedding: vectorArray }));
  }

  // Write and upload
  const filePath = 'brain.json';
  fs.writeFileSync(filePath, vectorData.join('\n'));
  
  console.log(`Uploading to gs://${BUCKET_NAME}/ingest/brain.json...`);
  await storage.bucket(BUCKET_NAME).upload(filePath, {
    destination: 'ingest/brain.json'
  });

  console.log("Ingestion Complete!");
}

ingest().catch(console.error);
