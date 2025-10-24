// scripts/importUsuarios.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";

// 🔹 Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDb9BAU5dAO78He70VjAOvEbbnmjvBa98M",
    authDomain: "plataformanutricl.firebaseapp.com",
    projectId: "plataformanutricl",
    storageBucket: "plataformanutricl.firebasestorage.app",
    messagingSenderId: "985581466306",
    appId: "1:985581466306:web:e8918843fa615b9d43c15b",
    measurementId: "G-6CCHYTVJ16"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Leer el JSON local
const usuariosPath = "./usuarios.json";
const usuariosData = JSON.parse(fs.readFileSync(usuariosPath, "utf-8"));

async function cargarUsuarios() {
    console.log("🚀 Subiendo usuarios a Firestore...");

    // 🔹 Subir nutricionistas
    for (const nutricionista of usuariosData.nutricionistas) {
        try {
            const docRef = await addDoc(collection(db, "usuarios"), {
                ...nutricionista,
                tipo: 1 // Aseguramos que sea tipo nutricionista
            });
            console.log(`✅ Nutricionista agregado: ${nutricionista.nombre} (ID: ${docRef.id})`);
        } catch (error) {
            console.error(`❌ Error al subir nutricionista ${nutricionista.nombre}:`, error);
        }
    }

    // 🔹 Subir pacientes
    for (const paciente of usuariosData.pacientes) {
        try {
            const docRef = await addDoc(collection(db, "usuarios"), {
                ...paciente,
                tipo: 2 // Aseguramos que sea tipo paciente
            });
            console.log(`✅ Paciente agregado: ${paciente.nombre} (ID: ${docRef.id})`);
        } catch (error) {
            console.error(`❌ Error al subir paciente ${paciente.nombre}:`, error);
        }
    }

    console.log("🎉 Todos los usuarios fueron agregados correctamente.");
}

// Ejecutar el script
cargarUsuarios();