"use client";
import {useEffect, useState} from "react";
import {db} from "../../lib/firebase";
import {doc, getDoc} from "firebase/firestore";
import Link from "next/link";
import ButtonRole from "@/components/ButtonRole"; // Asegúrate de la ruta correcta

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
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-indigo-400">Bienvenido, {paciente.nombre}</h1>
            <p className="text-black-300 text-lg">Objetivo: {paciente.perfilNutricional.objetivo}</p>

            {/* BOTÓN HACIA PLANES */}
            <Link href="/paciente/planes">
                <ButtonRole color="primary">
                    Ver mis planes
                </ButtonRole>
            </Link>
        </div>
    );
}