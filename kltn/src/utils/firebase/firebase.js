// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnfXS6oqOnuhVZwN4eSykYaooKXEdZV0U",
  authDomain: "fir-rtc-f0039.firebaseapp.com",
  projectId: "fir-rtc-f0039",
  storageBucket: "fir-rtc-f0039.appspot.com",
  messagingSenderId: "890415408460",
  appId: "1:890415408460:web:3fd245788a7b088c2c1be9",
  measurementId: "G-36YF5VR8EK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestoreDB = getFirestore(app);