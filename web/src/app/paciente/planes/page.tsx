'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';

// Interfaces
interface AlimentoBase {
    id: string;
    nombre: string;
    tipo: string;
    cantidadBase: number;
    unidad: string;
    proteina: number;
    carbohidratos: number;
    grasas: number;
    equivalentes: string[];
}

interface PlanAlimento {
    refAlimento: string;
    cantidad: string;
}

interface Comida {
    nombre: string;
    descripcion?: string;
    alimentos: PlanAlimento[];
    macros?: {
        proteinas: number;
        carbohidratos: number;
        grasas: number;
        kcal: number;
    };
}

interface DistribucionMacros {
    proteina: number;
    carbohidratos: number;
    grasas: number;
}

interface TotalesDiarios {
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    kcal: number;
}

interface VersionPlan {
    tipo: string;
    calorias: number;
    distribucion_macros: DistribucionMacros;
    objetivo: string;
    comidas: Comida[];
    totales_diarios: TotalesDiarios;
    notas_tecnicas: string[];
}

interface Plan {
    id: string;
    nombre: string;
    descripcion?: string;
    asignadoA: string;
    versiones: {
        volumen?: VersionPlan;
        recomposicion?: VersionPlan;
    };
}

// =========================================================================
// COMPONENTE PRINCIPAL - VISTA PACIENTE CON PESTAÑAS
// =========================================================================

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosBase, setAlimentosBase] = useState<AlimentoBase[]>([]);
    const [versionSeleccionada, setVersionSeleccionada] = useState<{ [planId: string]: 'volumen' | 'recomposicion' }>({});
    const [planActivo, setPlanActivo] = useState<string>(''); // Para controlar la pestaña activa
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Cargar alimentos base
                const alimentosSnapshot = await getDocs(collection(db, 'alimentos'));
                const alimentosBaseData: AlimentoBase[] = alimentosSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nombre: data.nombre || 'Nombre no disponible',
                        tipo: data.tipo || 'General',
                        cantidadBase: data.cantidadBase ?? 100,
                        unidad: data.unidad || 'g',
                        proteina: data.proteina ?? 0,
                        carbohidratos: data.carbohidratos ?? 0,
                        grasas: data.grasas ?? 0,
                        equivalentes: data.equivalentes || [],
                    };
                });
                setAlimentosBase(alimentosBaseData);

                // 2. Cargar planes principales
                const planesSnapshot = await getDocs(collection(db, 'planes'));
                const planesData: Plan[] = [];

                for (const planDoc of planesSnapshot.docs) {
                    const planData = planDoc.data();

                    // Cargar versiones (subcolección)
                    const versionesRef = collection(db, `planes/${planDoc.id}/versiones`);
                    const versionesSnapshot = await getDocs(versionesRef);

                    const versiones: Plan['versiones'] = {};
                    versionesSnapshot.forEach(vDoc => {
                        const vData = vDoc.data() as VersionPlan;
                        if (vDoc.id.toLowerCase().includes('volumen') || vData.tipo?.toLowerCase().includes('volumen')) {
                            versiones.volumen = vData;
                        } else if (vDoc.id.toLowerCase().includes('recomposicion') || vData.tipo?.toLowerCase().includes('recomposición')) {
                            versiones.recomposicion = vData;
                        }
                    });

                    if (versiones.volumen || versiones.recomposicion) {
                        planesData.push({
                            id: planDoc.id,
                            nombre: planData.nombre,
                            descripcion: planData.descripcion,
                            asignadoA: planData.asignadoA,
                            versiones,
                        });
                    }
                }

                setPlanes(planesData);

                // Inicializar plan activo y versiones seleccionadas
                if (planesData.length > 0) {
                    setPlanActivo(planesData[0].id);

                    const versionesIniciales: { [planId: string]: 'volumen' | 'recomposicion' } = {};
                    planesData.forEach(plan => {
                        if (plan.versiones.volumen) {
                            versionesIniciales[plan.id] = 'volumen';
                        } else if (plan.versiones.recomposicion) {
                            versionesIniciales[plan.id] = 'recomposicion';
                        }
                    });
                    setVersionSeleccionada(versionesIniciales);
                }

            } catch (error) {
                console.error('Error obteniendo datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Función para cambiar entre pestañas de planes
    const handleCambiarPlan = (planId: string) => {
        setPlanActivo(planId);
    };

    // Función para toggle entre versiones
    const handleToggleVersion = (planId: string, version: 'volumen' | 'recomposicion') => {
        setVersionSeleccionada(prev => ({
            ...prev,
            [planId]: version,
        }));
    };

    if (loading)
        return (
            <div className="text-gray-300 text-lg text-center mt-10">
                Cargando planes...
            </div>
        );

    if (!planes.length)
        return (
            <div className="text-gray-400 text-center mt-10">
                No hay planes disponibles aún.
            </div>
        );

    // Plan actualmente activo
    const planActual = planes.find(plan => plan.id === planActivo) || planes[0];
    const versionActiva = versionSeleccionada[planActual.id] ||
        (planActual.versiones.volumen ? 'volumen' : 'recomposicion');
    const dataVersion = planActual.versiones[versionActiva] ||
        planActual.versiones.volumen ||
        planActual.versiones.recomposicion;

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-indigo-400 text-center mb-8">
                Sus Planes Nutricionales
            </h1>

            {/* BOTONES DE PLANES */}
            <div className="flex justify-center flex-wrap gap-4 mb-8">
                {planes.map((plan) => (
                    <button
                        key={plan.id}
                        onClick={() => handleCambiarPlan(plan.id)}
                        className={`px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 border-2 ${
                            planActivo === plan.id
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/50 transform scale-105'
                                : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        {plan.nombre}
                    </button>
                ))}
            </div>

            {/* CONTENIDO DEL PLAN ACTIVO */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl">
                {/* Encabezado del Plan */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {planActual.nombre}
                    </h2>
                    {planActual.descripcion && (
                        <p className="text-gray-400 max-w-3xl mx-auto">
                            {planActual.descripcion}
                        </p>
                    )}
                    <div className="mt-2 text-sm text-indigo-300">
                        Asignado a: <span className="font-semibold">{planActual.asignadoA}</span>
                    </div>
                </div>

                {/* SELECTOR DE VERSIONES */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-700 rounded-lg p-1 flex space-x-1">
                        {planActual.versiones.volumen && (
                            <button
                                onClick={() => handleToggleVersion(planActual.id, 'volumen')}
                                className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                                    versionActiva === 'volumen'
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                        : 'bg-transparent text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                Volumen
                            </button>
                        )}
                        {planActual.versiones.recomposicion && (
                            <button
                                onClick={() => handleToggleVersion(planActual.id, 'recomposicion')}
                                className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                                    versionActiva === 'recomposicion'
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'bg-transparent text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                Recomposición
                            </button>
                        )}
                    </div>
                </div>

                {dataVersion ? (
                    <>
                        {/* CardPlan con información de la versión */}
                        <div className="mb-6">
                            <CardPlan
                                nombre={`${planActual.nombre} - ${dataVersion.tipo}`}
                                tipo={dataVersion.tipo}
                                calorias={dataVersion.calorias}
                                descripcion={dataVersion.objetivo}
                                distribucionMacros={dataVersion.distribucion_macros}
                                totalesDiarios={dataVersion.totales_diarios}
                            />
                        </div>

                        {/* Notas Técnicas */}
                        {dataVersion.notas_tecnicas && dataVersion.notas_tecnicas.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
                                <h3 className="text-lg font-bold text-amber-300 mb-3">Notas Técnicas</h3>
                                <ul className="space-y-2">
                                    {dataVersion.notas_tecnicas.map((nota, index) => (
                                        <li key={index} className="text-gray-300 text-sm flex items-start">
                                            <span className="text-amber-400 mr-2">•</span>
                                            {nota}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Comidas */}
                        {dataVersion.comidas && dataVersion.comidas.length > 0 ? (
                            dataVersion.comidas.map((comida, comidaIndex) => (
                                <div key={comidaIndex} className="mt-8 pt-6 border-t border-gray-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-indigo-300">
                                                {comida.nombre}
                                            </h3>
                                            {comida.descripcion && (
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {comida.descripcion}
                                                </p>
                                            )}
                                        </div>
                                        {comida.macros && (
                                            <div className="text-right">
                                                <div className="text-sm text-gray-300">
                                                    <span className="text-indigo-300 font-semibold">{comida.macros.proteinas}g</span> prote ·
                                                    <span className="text-indigo-300 font-semibold"> {comida.macros.carbohidratos}g</span> carb ·
                                                    <span className="text-indigo-300 font-semibold"> {comida.macros.grasas}g</span> gras
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {comida.macros.kcal} kcal
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <TableAlimentos
                                        alimentos={comida.alimentos}
                                        alimentosBase={alimentosBase}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm mt-4">
                                Esta versión del plan no tiene comidas asignadas.
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-gray-400 text-center py-8">
                        No hay datos disponibles para esta versión.
                    </p>
                )}
            </div>
        </div>
    );
}