import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// ===============================
// 🔥 CONFIGURAR FIREBASE
// ===============================
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

// ===============================
// 📦 IMPORTAR PLANES DESDE JSON
// ===============================
async function importarPlanes() {
    try {
        // Leer y parsear el archivo JSON
        const rawData = fs.readFileSync("./planes.json", "utf8");
        const planes = JSON.parse(rawData);

        // 🔁 Iterar sobre cada plan (A, B, C...)
        for (const planId of Object.keys(planes)) {
            const plan = planes[planId];
            const planRef = doc(db, "planes", planId);

            // Crear el documento principal
            await setDoc(planRef, {
                nombre: plan.nombre,
                descripcion: plan.descripcion,
                asignadoA: plan.asignadoA,
            });

            // Subcolección: versiones (volumen / recomposición)
            for (const versionKey of Object.keys(plan.versiones)) {
                const version = plan.versiones[versionKey];
                const versionRef = doc(db, "planes", planId, "versiones", versionKey);

                await setDoc(versionRef, {
                    tipo: version.tipo,
                    calorias: version.calorias,
                    distribucion_macros: version.distribucion_macros,
                    objetivo: version.objetivo,
                    comidas: version.comidas,
                    totales_diarios: version.totales_diarios,
                    notas_tecnicas: version.notas_tecnicas,
                });
            }

            console.log(`✅ Plan importado correctamente: ${plan.nombre}`);
        }

        console.log("🎉 Importación completada con éxito.");
    } catch (error) {
        console.error("❌ Error al importar planes:", error);
    }
}

importarPlanes();