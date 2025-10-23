import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import planes from "./planes.json";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT.appspot.com",
    messagingSenderId: "TU_MESSAGING_ID",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importarPlanes() {
    for (const plan of planes) {
        const docId = plan.nombre.replace(/\s+/g, "_").toLowerCase();
        const docRef = doc(db, "planes", docId);
        await setDoc(docRef, plan);
        console.log(`✅ Plan importado: ${plan.nombre}`);
    }
}

importPlanes().then(() => console.log("¡Todos los planes han sido importados!"));