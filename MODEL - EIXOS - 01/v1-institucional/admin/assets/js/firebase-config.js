/**
 * Firebase Configuration and Initialization
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyCb7cklPv4lDH7ehbv6fEdrJwB859PrH_g",
    authDomain: "alphastudio-441ac.firebaseapp.com",
    projectId: "alphastudio-441ac",
    storageBucket: "alphastudio-441ac.firebasestorage.app",
    messagingSenderId: "450761444854",
    appId: "1:450761444854:web:a1a975aca9df975a3f8bd7",
    measurementId: "G-ZBWG142D73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };
