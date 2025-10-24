'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, CollectionReference } from 'firebase/firestore';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';

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
}

interface VersionPlan {
    tipo: string;
    calorias: number;
    distribucion_macros: {
        proteina: number;
        carbohidratos: number;
        grasas: number;
    };
    objetivo: string;
    comidas: Comida[];
    totales_diarios: {
        proteinas: number;
        carbohidratos: number;
        grasas: number;
        kcal: number;
    };
    notas_tecnicas: string[];
}

interface Plan {
    id: string;
    nombre: string;
    descripcion: string;
    asignadoA: string;
    versiones: {
        volumen?: VersionPlan;
        recomposicion?: VersionPlan;
    };
}

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosBase, setAlimentosBase] = useState<AlimentoBase[]>([]);
    const [versionSeleccionada, setVersionSeleccionada] = useState<{ [planId: string]: 'volumen' | 'recomposicion' }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlanesYAlimentos = async () => {
            try {
                // 🔹 1. Cargar catálogo de alimentos
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

                // 🔹 2. Cargar los planes
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
                        if (vDoc.id.toLowerCase().includes('volumen')) {
                            versiones.volumen = vData;
                        } else if (vDoc.id.toLowerCase().includes('recomposicion')) {
                            versiones.recomposicion = vData;
                        }
                    });

                    if (versiones.volumen || versiones.recomposicion) {
                        planesData.push({
                            id: planDoc.id,
                            nombre: planData.nombre,
                            descripcion: planData.descripcion || '',
                            asignadoA: planData.asignadoA || 'Sin asignar',
                            versiones,
                        });
                    }
                }

                setPlanes(planesData);
            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanesYAlimentos();
    }, []);

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

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
                Planes de Alimentación
            </h1>

            {planes.map(plan => {
                const versionActiva =
                    versionSeleccionada[plan.id] ||
                    (plan.versiones.volumen ? 'volumen' : 'recomposicion');

                const dataVersion =
                    plan.versiones[versionActiva] ||
                    plan.versiones.volumen ||
                    plan.versiones.recomposicion;

                return (
                    <div
                        key={plan.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-200"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-indigo-300">{plan.nombre}</h2>
                                <p className="text-gray-400 text-sm">
                                    Asignado a: <span className="text-indigo-400">{plan.asignadoA}</span>
                                </p>
                                <p className="text-gray-400 mt-1">{plan.descripcion}</p>
                            </div>

                            <div className="flex space-x-2 mt-4 sm:mt-0">
                                {plan.versiones.volumen && (
                                    <button
                                        onClick={() => handleToggleVersion(plan.id, 'volumen')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                            versionActiva === 'volumen'
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        Volumen
                                    </button>
                                )}
                                {plan.versiones.recomposicion && (
                                    <button
                                        onClick={() => handleToggleVersion(plan.id, 'recomposicion')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                            versionActiva === 'recomposicion'
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        Recomposición
                                    </button>
                                )}
                            </div>
                        </div>

                        {dataVersion ? (
                            <>
                                <CardPlan
                                    nombre={dataVersion.tipo}
                                    tipo={dataVersion.tipo}
                                    calorias={dataVersion.calorias}
                                    descripcion={dataVersion.objetivo}
                                />

                                {dataVersion.comidas.map((comida, idx) => (
                                    <div key={idx} className="mt-6">
                                        <h3 className="text-lg font-semibold text-indigo-300 mb-2">
                                            {comida.nombre}
                                        </h3>
                                        <TableAlimentos
                                            alimentos={comida.alimentos}
                                            alimentosBase={alimentosBase}
                                        />
                                    </div>
                                ))}

                                <div className="mt-6 text-gray-400 text-sm">
                                    <h4 className="text-indigo-400 font-semibold mb-2">
                                        Notas Técnicas
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {dataVersion.notas_tecnicas.map((nota, i) => (
                                            <li key={i}>{nota}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-400">No hay versión disponible para mostrar.</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}