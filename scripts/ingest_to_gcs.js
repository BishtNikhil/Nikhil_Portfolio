/* global process */
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';

// Environment-based Configuration (CodeRabbit Fix)
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'react-app-492207';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || `${PROJECT_ID}-vector-search`;

// Clients
const firestore = new Firestore({ projectId: PROJECT_ID });
const storage = new Storage({ projectId: PROJECT_ID });
const ai = new GoogleGenAI({ project: PROJECT_ID, location: LOCATION, vertexai: true });

async function ingestToGCS() {
  console.log(`Starting Vector Ingestion (Standalone/GCS) in project ${PROJECT_ID}...`);
  
  const brainChunks = [
    { topic: 'Identity', text: "My name is Nikhil Singh Bisht. I go by Nikhil. I am a Cloud Engineer and Full Stack Developer." },
    { topic: 'Experience', text: "Software Engineer at Serveswiftly; Consultant at ENTAB. Migrated legacy systems to GCP." }
  ];

  const vectorData = [];

  for (let i = 0; i < brainChunks.length; i++) {
    const chunk = brainChunks[i];
    const id = `gcs_chunk_${i}`;
    
    try {
      console.log(`Embedding chunk: ${chunk.topic}...`);

      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: chunk.text
      });

      // Defensive Null Check (CodeRabbit Fix)
      if (!response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
        console.error(`Warning: Empty embedding for chunk ${chunk.topic}. Skipping.`);
        continue;
      }

      const vectorArray = response.embeddings[0].values;

      // Save to Firestore (ID -> Text Mapping)
      await firestore.collection('twin_brain').doc(id).set({
        id: id,
        text: chunk.text,
        embedding_vector: FieldValue.vector(vectorArray),
        source: 'ingest_to_gcs'
      });

      // Collect for Vector Search JSONL
      vectorData.push(JSON.stringify({ id, embedding: vectorArray }));
    } catch (chunkError) {
      console.error(`Failed to process GCS chunk ${chunk.topic}:`, chunkError.message);
    }
  }

  // Write and upload (Async CodeRabbit Fix)
  const filePath = 'brain_gcs.json';
  if (vectorData.length > 0) {
    await fs.writeFile(filePath, vectorData.join('\n'));
    
    console.log(`Uploading to gs://${BUCKET_NAME}/ingest/brain.json...`);
    await storage.bucket(BUCKET_NAME).upload(filePath, {
      destination: 'ingest/brain.json'
    });

    console.log("Ingestion to GCS Complete!");
  } else {
    console.error("No vectors generated. Aborting upload.");
    process.exit(1);
  }
}

ingestToGCS().catch(err => {
  console.error("Fatal GCS Ingestion Error:", err.message);
  process.exit(1);
});
