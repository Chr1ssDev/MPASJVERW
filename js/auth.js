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

const ADMIN_DOMAIN = "mpa.ver";
const MEMBER_DOMAIN = "mpa.sjv";

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
  return domain === ADMIN_DOMAIN || domain === MEMBER_DOMAIN;
}

async function syncMemberProfile(user) {
  if (!user?.uid || !user?.email) return;

  const domain = getDomain(user.email);
  if (domain !== MEMBER_DOMAIN) return;

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: normalizeEmail(user.email),
      domain,
      role: "member",
      accountType: "invited",
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
  const cleanEmail = normalizeEmail(email);
  const domain = getDomain(cleanEmail);

  if (domain === ADMIN_DOMAIN) {
    throw new Error("Ese tipo de correo no está permitido para registrarse. Tal vez quisiste usar @mpa.sjv");
  }

  if (domain !== MEMBER_DOMAIN) {
    throw new Error("Solo se permite registro con correos @mpa.sjv");
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      email: cleanEmail,
      domain: MEMBER_DOMAIN,
      role: "member",
      accountType: "invited",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cleanEmail = normalizeEmail(email);
  const domain = getDomain(cleanEmail);

  if (!isAllowedDomain(cleanEmail)) {
    throw new Error("Solo se permiten correos @mpa.ver o @mpa.sjv");
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);

  if (domain === ADMIN_DOMAIN) {
    await ensureAdminAuthorized(cred.user);
  } else {
    await syncMemberProfile(cred.user);
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
  if (!snap.exists()) return "member";
  return snap.data().role || "member";
}