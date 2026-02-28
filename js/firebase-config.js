import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyAGuuvUfUlL6cseKLAvqDvnMTg58oWWRlQ",
    authDomain: "mpasjverw.firebaseapp.com",
    projectId: "mpasjverw",
    storageBucket: "mpasjverw.firebasestorage.app",
    messagingSenderId: "538954423511",
    appId: "1:538954423511:web:20995dd17500f2a603e492"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };