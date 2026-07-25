import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD64swy9Tv2RDW_AECZCCN0qo5gv2Khx3Y",
  authDomain: "nova-ai-6a35b.firebaseapp.com",
  projectId: "nova-ai-6a35b",
  storageBucket: "nova-ai-6a35b.firebasestorage.app",
  messagingSenderId: "780713526754",
  appId: "1:780713526754:web:caf74e085ef9f933cf65bb",
  measurementId: "G-DP55QBDDRW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);

// Analytics
export const analytics = getAnalytics(app);