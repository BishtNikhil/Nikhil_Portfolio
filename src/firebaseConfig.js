import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
// IMPORTANT: You need to replace this with your actual Firebase Project config.
// Go to Firebase Console -> Project Settings -> General -> Web Apps
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "react-app-492207.firebaseapp.com",
  projectId: "react-app-492207",
  storageBucket: "react-app-492207.firebasestorage.app",
  messagingSenderId: "502261012207",
  appId: "1:502261012207:web:11871658104141247361"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore for real-time visitor database listening
export const db = getFirestore(app);

