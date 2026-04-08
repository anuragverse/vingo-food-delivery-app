// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery.firebaseapp.com",
  projectId: "vingo-food-delivery",
  storageBucket: "vingo-food-delivery.firebasestorage.app",
  messagingSenderId: "693314883513",
  appId: "1:693314883513:web:4840c943ecf3fb61a33068"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}