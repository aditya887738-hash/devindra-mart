import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA4y5n3BhbgIvE1-owBqO0fFycrKXi2grw",
  authDomain: "devindra-mart-main-21205.firebaseapp.com",
  projectId: "devindra-mart-main-21205",
  storageBucket: "devindra-mart-main-21205.firebasestorage.app",
  messagingSenderId: "513697622138",
  appId: "1:513697622138:web:a150445a5abe1d9985b3c3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
