import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web config is public by design; access is controlled by security rules.
// Values can be overridden per-environment with VITE_FIREBASE_* env vars.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD64swy9Tv2RDW_AECZCCN0qo5gv2Khx3Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nova-ai-6a35b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nova-ai-6a35b",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nova-ai-6a35b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "780713526754",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:780713526754:web:caf74e085ef9f933cf65bb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DP55QBDDRW",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Analytics is optional — guarded so ad-blockers or unsupported browsers
// can never break the app.
export let analytics = null;
analyticsIsSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch(() => {});