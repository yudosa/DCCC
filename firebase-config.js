const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const { getDatabase } = require('firebase/database');

// Your web app's Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);
const realtimeDb = getDatabase(app);

module.exports = { app, db, auth, realtimeDb }; 