import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, collection, getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
  if (!userData?.email && !userData?.uid) return;

  const userRef = doc(db, "users", userData.uid || userData.email);
  try {
    const existingUser = await getDoc(userRef);
    const userRecord = {
      email: userData.email,
      joinedDate: new Date().toISOString().split("T")[0],
      authType: "Google Auth",
      status: "active",
      name: userData.name || userData.email.split("@")[0],
      picture: userData.picture || "",
      createdAt: serverTimestamp()
    };
    if (!existingUser.exists()) {
      userRecord.deposit = 0;
      userRecord.earnedYield = 0;
      userRecord.withdrawnYield = 0;
    }
    if (!existingUser.exists() || !existingUser.data().depositTimestamp) {
      userRecord.depositTimestamp = Date.now();
    }

    await setDoc(userRef, userRecord, { merge: true });
    return userRecord;
  } catch (error) {
    console.error("Could not save Google user to Firestore:", error);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    await ensureGoogleUserRecord(res.user);
    return res.user;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
};

export const logOutUser = async () => {
  await signOut(auth);
};

export async function submitWithdrawalRequest(data) {
  if (!db) return null;

  return addDoc(collection(db, "withdrawals"), {
    ...data,
    status: "pending",
    createdAt: Date.now(),
    dateStr: new Date().toLocaleDateString()
  });
}