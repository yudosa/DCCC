// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCAYk2w1l8E99Fwem6DP1NirTcoLHye_g",
  authDomain: "hdycc-aba1c.firebaseapp.com",
  projectId: "hdycc-aba1c",
  storageBucket: "hdycc-aba1c.firebasestorage.app",
  messagingSenderId: "398444607932",
  appId: "1:398444607932:web:a226871df0663224e513b9",
  measurementId: "G-HRRLLDP0SV",
  databaseURL: "https://hdycc-aba1c-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const realtimeDb = getDatabase(app);

// Export for use in other files
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;
window.firebaseAnalytics = analytics;
window.firebaseRealtimeDb = realtimeDb; 