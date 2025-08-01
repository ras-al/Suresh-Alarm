// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- IMPORTANT ---
// Replace this with your own Firebase configuration object!

const firebaseConfig={
  apiKey: "AIzaSyAIAsQ3hg9hmt201vkAn54ryX_-Jdk2xdA",
  authDomain: "convincing-alarm.firebaseapp.com",
  projectId: "convincing-alarm",
  storageBucket: "convincing-alarm.firebasestorage.app",
  messagingSenderId: "288200999687",
  appId: "1:288200999687:web:06a8d6412ade992111fba2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
