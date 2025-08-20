import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB3GTUm9rZM3Nr3dUzIlUix8jxK7IBSSlg",
  authDomain: "thurry-a244e.firebaseapp.com",
  databaseURL: "https://thurry-a244e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thurry-a244e",
  storageBucket: "thurry-a244e.firebasestorage.app",
  messagingSenderId: "473310657344",
  appId: "1:473310657344:web:0d318483ff521a7e6818a5",
  measurementId: "G-277LGMMDD7"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(app);

export { app, analytics };