"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ButtonRole from "@/components/ButtonRole"; // usa el alias correcto
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface PerfilNutricional {
    altura: number;
    peso: number;
    objetivo: string;
    alergias: string[];
    restricciones: string[];
}

interface Paciente {
    nombre: string;
    email: string;
    tipo: number; // 2 = paciente
    perfil_nutricional: PerfilNutricional;
}

interface Plan {
    nombre: string;
    asignadoA: string; // email del paciente
    tipo: string;
    calorias: number;
}

export default function DashboardNutricionista() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 🔹 Traer pacientes
                const pacientesSnap = await getDocs(
                    query(collection(db, "usuarios"), where("tipo", "==", 2))
                );
                const pacientesData = pacientesSnap.docs.map(doc => doc.data() as Paciente);
                setPacientes(pacientesData);

                // 🔹 Traer planes
                const planesSnap = await getDocs(collection(db, "planes"));
                const planesData: Plan[] = planesSnap.docs.map(doc => {
                    const data = doc.data() as any;
                    return {
                        nombre: data.nombre,
                        asignadoA: data.asignadoA,
                        tipo: data.tipo,
                        calorias: data.calorias,
                    };
                });
                setPlanes(planesData);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading)
        return (
            <div className="text-gray-500 text-center mt-10">Cargando dashboard...</div>
        );

    return (
        <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center space-y-8">
            {/* Encabezado */}
            <header className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Nutricionista</h1>
                <p className="text-lg text-gray-700">
                    Bienvenido, aquí podrás ver y registrar planes y pacientes.
                </p>
            </header>

            {/* Botón único para ver planes */}
            <div className="w-full max-w-xs">
                <Link href="/nutricionista/planes" passHref>
                    <ButtonRole
                        color="primary"
                        className="w-full py-3 px-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                    >
                        Ver Planes
                    </ButtonRole>
                </Link>
            </div>

            {/* Listado de pacientes con planes asignados */}
            <div className="w-full max-w-6xl">
                <h2 className="text-2xl font-bold text-green-700 mb-4">Pacientes y sus planes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pacientes.map((paciente) => {
                        const planesAsignados = planes.filter(p => p.asignadoA === paciente.email);
                        return (
                            <div
                                key={paciente.email}
                                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-gray-700">{paciente.nombre}</p>
                                    <p className="text-gray-500 text-sm">{paciente.email}</p>
                                    <p className="text-gray-600 mt-2">
                                        Objetivo: {paciente.perfil_nutricional.objetivo}
                                    </p>

                                    {planesAsignados.length > 0 && (
                                        <ul className="mt-3 list-disc list-inside text-gray-600 text-sm">
                                            {planesAsignados.map((plan) => (
                                                <li key={plan.nombre}>
                                                    {plan.nombre} ({plan.tipo}) - {plan.calorias} kcal
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <Link
                                    href={`/paciente/${paciente.email}/planes`}
                                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center"
                                >
                                    Ver Detalle
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}