import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

export async function registerWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      email: cred.user.email,
      role: "user",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return "user";
  return snap.data().role || "user";
}