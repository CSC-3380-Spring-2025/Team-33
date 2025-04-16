// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn4h9O-bM2UEay0En5MvLGs7SesCyJRG0",
  authDomain: "waypointapp-5fc26.firebaseapp.com",
  projectId: "waypointapp-5fc26",
  storageBucket: "waypointapp-5fc26.firebasestorage.app",
  messagingSenderId: "97140910771",
  appId: "1:97140910771:web:ba39e5380a818e25a81ec6",
  measurementId: "G-EJW0YX7PL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };