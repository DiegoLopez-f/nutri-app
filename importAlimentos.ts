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

// Leer JSON
const alimentos = JSON.parse(fs.readFileSync("./alimentos.json", "utf-8"));

async function importarAlimentos() {
    try {
        for (const alimento of alimentos) {
            await setDoc(doc(db, "alimentos", alimento.id), alimento);
            console.log(`Alimento ${alimento.nombre} importado`);
        }
        console.log("Todos los alimentos importados correctamente");
    } catch (error) {
        console.error("Error importando alimentos:", error);
    }
}

importarAlimentos();