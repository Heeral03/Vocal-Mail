// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBgxJUcs3HCUnOwdd8vXXu0ywKJzBpEtDE",              // paste from Firebase console
  authDomain: "vocal-mail-e2fcd.firebaseapp.com",
  projectId: "vocal-mail-e2fcd",
  storageBucket: "vocal-mail-e2fcd.appspot.com",
  messagingSenderId: "1022684846158",
  appId: "1:1022684846158:web:939e43a710d7077f7b8b1f"
};

const app = initializeApp(firebaseConfig);

export default app;
