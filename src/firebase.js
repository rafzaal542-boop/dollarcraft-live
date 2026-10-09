import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

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
  if (!userData?.email || !userData?.uid) {
    throw new Error("Google sign-in did not provide a user identity.");
  }

  const userRef = doc(db, "users", userData.uid);
  const existingUser = await getDoc(userRef);
  if (existingUser.exists()) {
    return { ...existingUser.data(), id: existingUser.id };
  }

  const fullName = (userData.displayName || userData.name || "").trim();
  const [firstName = "", ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);
  const profile = {
    email: userData.email.toLowerCase(),
    name: fullName || userData.email.split("@")[0],
    firstName: firstName || userData.email.split("@")[0],
    lastName: lastNameParts.join(" "),
    createdAt: serverTimestamp(),
    balanceCents: 0
  };

  await setDoc(userRef, profile);
  return { ...profile, id: userData.uid };
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

export const createAccount = async (email, password, profileData) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await createUserProfile({
      uid: credential.user.uid,
      email: credential.user.email,
      ...profileData
    });
    return credential;
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (rollbackError) {
      console.error("Could not remove an account after its profile failed to save:", rollbackError);
      throw new Error("The account was created but its profile could not be saved or rolled back. Contact support.");
    }
    throw error;
  }
};

export const signInWithPassword = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const observeAuthState = (callback) => onAuthStateChanged(auth, callback);

export const observeAllUserProfiles = (onUsers, onError) =>
  onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      onUsers(snapshot.docs.map((userDoc) => ({ ...userDoc.data(), id: userDoc.id })));
    },
    onError
  );

export const observeUserProfile = (uid, onUser, onError) =>
  onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      onUser(snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null);
    },
    onError
  );

export const getUserProfile = async (uid) => {
  const userSnapshot = await getDoc(doc(db, "users", uid));
  return userSnapshot.exists()
    ? { ...userSnapshot.data(), id: userSnapshot.id }
    : null;
};

export const createUserProfile = ({ uid, firstName, lastName, email }) =>
  setDoc(doc(db, "users", uid), {
    email: email.toLowerCase(),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    createdAt: serverTimestamp(),
    balanceCents: 0
  });

export const changeUserBalance = (uid, changeInCents) => {
  if (!Number.isSafeInteger(changeInCents) || changeInCents === 0) {
    throw new Error("The wallet change must be a non-zero whole number of cents.");
  }

  return runTransaction(db, async (transaction) => {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists()) {
      throw new Error("The registered user profile could not be found.");
    }

    const currentBalance = userSnapshot.data().balanceCents;
    if (!Number.isSafeInteger(currentBalance) || currentBalance < 0) {
      throw new Error("The stored wallet balance is invalid.");
    }

    const updatedBalance = currentBalance + changeInCents;
    if (!Number.isSafeInteger(updatedBalance) || updatedBalance < 0) {
      throw new Error("The wallet balance is insufficient or too large.");
    }

    transaction.update(userRef, { balanceCents: updatedBalance });
    return updatedBalance;
  });
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