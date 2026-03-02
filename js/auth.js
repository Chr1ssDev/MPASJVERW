import {
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

const ADMIN_DOMAIN = "mpa.ver";
const USER_DOMAIN = "mpa.gav";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getDomain(email) {
  const clean = normalizeEmail(email);
  const parts = clean.split("@");
  return parts.length === 2 ? parts[1] : "";
}

function isAllowedDomain(email) {
  const domain = getDomain(email);
  return domain === ADMIN_DOMAIN || domain === USER_DOMAIN;
}

async function syncUserProfile(user) {
  if (!user?.uid || !user?.email) return;

  const domain = getDomain(user.email);
  if (domain !== USER_DOMAIN) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: normalizeEmail(user.email),
      domain,
      role: "user",
      accountType: "user",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function ensureAdminAuthorized(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : null;

  if (!data || data.role !== "admin") {
    await signOut(auth);
    throw new Error("Cuenta @mpa.ver no autorizada como administrador");
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: normalizeEmail(user.email),
      domain: ADMIN_DOMAIN,
      accountType: "admin",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function registerWithEmail(email, password) {
  void email;
  void password;
  throw new Error("El registro desde la web está deshabilitado. Tu cuenta se crea manualmente por un administrador.");
}

export async function loginWithEmail(email, password) {
  const cleanEmail = normalizeEmail(email);
  const domain = getDomain(cleanEmail);

  if (!isAllowedDomain(cleanEmail)) {
    throw new Error("Solo se permiten correos @mpa.ver o @mpa.gav");
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);

  if (domain === ADMIN_DOMAIN) {
    await ensureAdminAuthorized(cred.user);
  } else {
    await syncUserProfile(cred.user);
  }

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