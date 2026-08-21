import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwPM1RU6m7dpLCeiNUOJNCueP2xt7CHJc",
  authDomain: "dollar-craft-live.firebaseapp.com",
  projectId: "dollar-craft-live",
  storageBucket: "dollar-craft-live.firebasestorage.app",
  messagingSenderId: "983167960550",
  appId: "1:983167960550:web:33e2e06897d393a9ea2227",
  measurementId: "G-66L4MPBTXB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
};

export const logOutUser = async () => {
  await signOut(auth);
};