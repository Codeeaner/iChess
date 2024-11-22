import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnyBGYwsSZka5bVa4QmVl7AUIbKcMXOvI",
  authDomain: "ichess-cfb5b.firebaseapp.com",
  projectId: "ichess-cfb5b",
  storageBucket: "ichess-cfb5b.firebasestorage.app",
  messagingSenderId: "596678676157",
  appId: "1:596678676157:web:eae32743a255a360d431d4",
  measurementId: "G-JPPPX22D2L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);