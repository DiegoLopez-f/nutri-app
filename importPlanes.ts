import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";


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
const db = getFirestore(app);
const planes = JSON.parse(fs.readFileSync("./planes.json", "utf-8"));

async function importarPlanes() {
    for (const plan of planes) {
        const docId = plan.nombre.replace(/\s+/g, "_").toLowerCase();
        const docRef = doc(db, "planes", docId);
        await setDoc(docRef, plan);
        console.log(`✅ Plan importado: ${plan.nombre}`);
    }
}

importarPlanes().then(() => console.log("¡Todos los planes han sido importados!"));