import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMuNz0RIq9tkTqVNCqaPqaZ-oOQJWr_28",
  authDomain: "project-8184807316787267292.firebaseapp.com",
  projectId: "project-8184807316787267292",
  storageBucket: "project-8184807316787267292.firebasestorage.app",
  messagingSenderId: "1032076685828",
  appId: "1:1032076685828:web:092358051042874a2ffb51",
  measurementId: "G-6XNHSSF0RD",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged, signInWithPopup, signOut };
