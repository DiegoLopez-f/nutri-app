"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPaciente() {
    const [paciente, setPaciente] = useState<any>(null);

    useEffect(() => {
        const fetchPaciente = async () => {
            const docRef = doc(db, "usuarios", "paciente1");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) setPaciente(docSnap.data());
        };
        fetchPaciente();
    }, []);

    if (!paciente) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Bienvenido, {paciente.nombre}</h1>
            <p>Objetivo: {paciente.perfilNutricional.objetivo}</p>
        </div>
    );
}