import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCX-1U4lsujwfW3lCyWM2wNVF7J5tyiLe8",
  authDomain: "g-dept.firebaseapp.com",
  projectId: "g-dept",
  storageBucket: "g-dept.firebasestorage.app",
  messagingSenderId: "480522551964",
  appId: "1:480522551964:web:619f7abd0f3e70ce4e2359"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
