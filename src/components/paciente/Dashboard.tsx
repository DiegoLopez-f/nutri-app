'use client';

import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from 'next/link'; // Importamos Link de Next.js para la navegación
import { db } from "@/lib/firebase";
import { ArrowPathIcon, ScaleIcon, ListBulletIcon } from '@heroicons/react/24/solid'; // Importamos ListBulletIcon

// ... (Interfaces omitidas por brevedad, asumiendo que están correctas)

// =========================================================================
// INTERFACES (Definidas en el código anterior)
// =========================================================================

interface AlimentoAsignado { refAlimento: string; cantidad: number; unidad: string; }
interface Macros { proteinas: number; carbohidratos: number; grasas: number; kcal: number; }
interface Comida { nombre: string; descripcion?: string; alimentos: AlimentoAsignado[]; macros?: Macros; }
interface PerfilNutricional { altura: number; peso: number; objetivo: string; alergias: string[]; restricciones: string[]; }
interface Paciente { nombre: string; email: string; tipo: number; perfil_nutricional: PerfilNutricional; }
interface PlanVersion { tipo: 'Volumen' | 'Recomposición'; calorias: number; comidas: Comida[]; notas_tecnicas?: string[]; macros_total?: Macros; }
interface Plan { id: string; nombre: string; descripcion?: string; asignadoA: string; versiones: { volumen?: PlanVersion; recomposicion?: PlanVersion; }; }
interface DashboardProps { pacienteId: string; }

// =========================================================================
// COMPONENTE DASHBOARD (ACTUALIZADO CON BOTÓN)
// =========================================================================

const Dashboard: React.FC<DashboardProps> = ({ pacienteId }) => {
    // ... (Hooks de estado omitidos)
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [versionSeleccionada, setVersionSeleccionada] = useState<{ [planId: string]: 'volumen' | 'recomposicion' }>({});

    // ... (useEffect de carga de datos omitido por brevedad)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const pacienteRef = doc(db, 'usuarios', pacienteId);
                const pacienteSnap = await getDoc(pacienteRef);
                if (!pacienteSnap.exists()) throw new Error('No se encontró información del paciente');
                setPaciente(pacienteSnap.data() as Paciente);

                const planesSnap = await getDocs(collection(db, 'planes'));
                const planesData: Plan[] = [];

                for (const docPlan of planesSnap.docs) {
                    const planData = docPlan.data() as any;
                    if (planData.asignadoA === pacienteId) {
                        const versionesSnap = await getDocs(collection(db, `planes/${docPlan.id}/versiones`));
                        const versiones: Plan['versiones'] = {};
                        versionesSnap.forEach(vDoc => {
                            const vData = vDoc.data() as PlanVersion;
                            if (vDoc.id.toLowerCase().includes('volumen') || vData.tipo?.toLowerCase().includes('volumen')) {
                                versiones.volumen = vData;
                            } else if (vDoc.id.toLowerCase().includes('recomposicion') || vData.tipo?.toLowerCase().includes('recomposición')) {
                                versiones.recomposicion = vData;
                            }
                        });

                        planesData.push({
                            id: docPlan.id,
                            ...(planData as Omit<Plan, 'id' | 'versiones'>),
                            versiones,
                        });
                    }
                }

                setPlanes(planesData);
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error al cargar datos');
                setLoading(false);
            }
        };

        fetchData();
    }, [pacienteId]);


    if (loading) return <div className="text-center mt-10 text-gray-500">Cargando información...</div>;
    if (error) return <div className="text-center mt-10 text-red-600 font-semibold">{error}</div>;
    if (!paciente) return <div className="text-center mt-10 text-gray-500">No se encontró información del paciente.</div>;

    const planActivo = planes.length > 0 ? planes[0] : null;

    if (!planActivo) {
        return (
            <div className="text-center mt-10 p-6 bg-white rounded-xl text-gray-500 border border-green-200 shadow-md">
                ¡Felicidades! Aún no tienes planes nutricionales asignados.
            </div>
        );
    }

    const versionActivaKey = versionSeleccionada[planActivo.id] || (planActivo.versiones.volumen ? 'volumen' : 'recomposicion');
    const dataVersion = planActivo.versiones[versionActivaKey];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-10">

            {/* 1. Resumen del paciente - MODIFICADO */}
            <div className="bg-white p-6 rounded-xl shadow-xl border border-green-200 relative">

                {/* Botón de navegación a la derecha */}
                <Link href={`/paciente/planes`} passHref>
                    <button
                        className="absolute top-4 right-4 bg-[#4ADE80] text-gray-800 font-semibold py-2 px-4 rounded-full text-sm shadow-md hover:bg-[#059669] hover:text-white transition duration-200 flex items-center"
                    >
                        <ListBulletIcon className="w-5 h-5 mr-1" />
                        Ver Mis Planes
                    </button>
                </Link>

                {/* Contenido principal del resumen */}
                <h1 className="text-3xl font-extrabold text-[#059669]">
                    ¡Bienvenido(a), {paciente.nombre}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                    Tu plan se enfoca en: <strong className="text-green-700">{paciente.perfil_nutricional.objetivo}</strong>
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium shadow-sm">
                        Peso: <strong className="font-bold">{paciente.perfil_nutricional.peso} kg</strong>
                    </div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium shadow-sm">
                        Altura: <strong className="font-bold">{paciente.perfil_nutricional.altura} cm</strong>
                    </div>
                </div>
            </div>

            {/* 2. Resumen del Plan Activo (Sin Cambios) */}
            <div className="bg-white border border-green-200 rounded-xl p-6 shadow-2xl shadow-green-100/50">

                {/* Encabezado del Plan y Selector */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#059669]">{planActivo.nombre}</h2>
                        {planActivo.descripcion && <p className="text-gray-500 mt-1">{planActivo.descripcion}</p>}
                    </div>

                    {/* Selector de versión */}
                    <div className="flex space-x-3 mt-4 sm:mt-0 flex-shrink-0">
                        {planActivo.versiones.volumen && (
                            <button
                                onClick={() => setVersionSeleccionada(prev => ({ ...prev, [planActivo.id]: 'volumen' }))}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                                    versionActivaKey === 'volumen'
                                        ? 'bg-[#059669] text-white shadow-md shadow-green-400/50 transform scale-105'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                <ScaleIcon className="w-4 h-4 mr-1 inline-block" /> Volumen
                            </button>
                        )}
                        {planActivo.versiones.recomposicion && (
                            <button
                                onClick={() => setVersionSeleccionada(prev => ({ ...prev, [planActivo.id]: 'recomposicion' }))}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                                    versionActivaKey === 'recomposicion'
                                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-400/50 transform scale-105'
                                        : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                                }`}
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-1 inline-block" /> Recomposición
                            </button>
                        )}
                    </div>
                </div>

                {/* RESUMEN DE DATOS CLAVE (Calorías, Macros, Notas) */}
                {dataVersion ? (
                    <>
                        <h3 className="text-2xl font-bold text-gray-700 mb-4">
                            Resumen de la Versión Activa ({dataVersion.tipo})
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            <div className="p-4 bg-green-50 rounded-lg border border-green-300 shadow-sm text-center">
                                <p className="text-xs font-medium text-green-700 uppercase">Calorías Totales</p>
                                <p className="text-3xl font-extrabold text-[#059669] mt-1">{dataVersion.calorias}</p>
                                <p className="text-sm text-gray-500">kcal</p>
                            </div>

                            {/* ... (Las tarjetas de macros si existen en dataVersion.macros_total) ... */}
                            {dataVersion.macros_total?.proteinas && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-center">
                                    <p className="text-xs font-medium text-gray-600 uppercase">Proteínas</p>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1">{dataVersion.macros_total.proteinas}</p>
                                    <p className="text-sm text-gray-500">gramos</p>
                                </div>
                            )}

                            {dataVersion.macros_total?.carbohidratos && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-center">
                                    <p className="text-xs font-medium text-gray-600 uppercase">Carbohidratos</p>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1">{dataVersion.macros_total.carbohidratos}</p>
                                    <p className="text-sm text-gray-500">gramos</p>
                                </div>
                            )}

                            {dataVersion.macros_total?.grasas && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-center">
                                    <p className="text-xs font-medium text-gray-600 uppercase">Grasas</p>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1">{dataVersion.macros_total.grasas}</p>
                                    <p className="text-sm text-gray-500">gramos</p>
                                </div>
                            )}
                        </div>

                        {/* Notas Técnicas */}
                        {dataVersion.notas_tecnicas && dataVersion.notas_tecnicas.length > 0 && (
                            <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-300 shadow-inner">
                                <h3 className="text-xl font-bold text-green-700 mb-3">Instrucciones Clave</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    {dataVersion.notas_tecnicas.slice(0, 3).map((nota, index) => (
                                        <li key={index} className="text-base">
                                            {nota}
                                        </li>
                                    ))}
                                    {dataVersion.notas_tecnicas.length > 3 && (
                                        <li className="text-sm italic text-gray-500">...y más notas en la vista completa del plan.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500 mt-4">No hay datos disponibles para la versión seleccionada.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;