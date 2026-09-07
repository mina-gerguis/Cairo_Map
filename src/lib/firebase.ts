import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type Auth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// Fallback dummy config so initializeApp doesn't throw if variables are empty during build/dev
const fallbackConfig = {
  apiKey: "AIzaSyDummyKeyForDevelopment123456",
  authDomain: "cairo-map-dev.firebaseapp.com",
  projectId: "cairo-map-dev",
  storageBucket: "cairo-map-dev.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(isFirebaseConfigured ? firebaseConfig : fallbackConfig);

let authInstance: Auth | null = null;
export const getFirebaseAuth = (): Auth | null => {
  if (typeof window !== "undefined" && !authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
};

export { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult };
