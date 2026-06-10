import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNX3M4qJQ7jRdxqg-i_Z_E-AeJL3J-f2w",
  authDomain: "achadinhos-aac01.firebaseapp.com",
  projectId: "achadinhos-aac01",
  storageBucket: "achadinhos-aac01.firebasestorage.app",
  messagingSenderId: "511419304094",
  appId: "1:511419304094:web:cc692567d0c0890b5f138f"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { 
    db, 
    auth, 
    storage,
    ref,
    uploadBytes,
    getDownloadURL,
    collection, 
    getDocs, 
    onSnapshot, 
    doc, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
};
