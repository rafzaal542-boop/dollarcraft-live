import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const ensureGoogleUserRecord = async (userData) => {
  if (!userData?.email) return;

  const userRef = doc(db, "users", userData.email.toLowerCase().trim());
  try {
    const existingUser = await getDoc(userRef);
    if (existingUser.exists()) return existingUser.data();

    const userRecord = {
      email: userData.email,
      joinedDate: new Date().toISOString().split("T")[0],
      authType: "Google Auth",
      status: "active",
      deposit: 0,
      earnedYield: 0,
      name: userData.name || userData.email.split("@")[0],
      picture: userData.picture || "",
      createdAt: serverTimestamp()
    };

    await setDoc(userRef, userRecord);
    return userRecord;
  } catch (error) {
    console.error("Could not save Google user to Firestore:", error);
    return null;
  }
};

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