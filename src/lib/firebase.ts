import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDb9BAU5dAO78He70VjAOvEbbnmjvBa98M",
    authDomain: "plataformanutricl.firebaseapp.com",
    projectId: "plataformanutricl",
    storageBucket: "plataformanutricl.firebasestorage.app",
    messagingSenderId: "985581466306",
    appId: "1:985581466306:web:e8918843fa615b9d43c15b",
    measurementId: "G-6CCHYTVJ16"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);