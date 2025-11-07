import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBoRdKRfE30fkM69RWTAT8sGrZlFbqRHA",
  authDomain: "receipt-tracker-1c5c3.firebaseapp.com",
  projectId: "receipt-tracker-1c5c3",
  storageBucket: "receipt-tracker-1c5c3.firebasestorage.app",
  messagingSenderId: "943690897043",
  appId: "1:943690897043:web:5588f4e9fec6cf57ae5f66",
  measurementId: "G-GCNGDE4GFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
export default app;