'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

// ... (Interfaces AlimentoBase, PlanAlimento, Comida, VersionPlan, Plan no cambian) ...
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
    const [planesExpandido, setPlanesExpandido] = useState<{ [id: string]: boolean }>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // ... (useEffect para 'alimentos' y 'planes' quedan exactamente igual) ...
    // 🔹 Escuchar alimentos en tiempo real
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'alimentos'), (snapshot) => {
            const data: AlimentoBase[] = snapshot.docs.map((doc) => {
                const d = doc.data();
                return {
                    id: doc.id,
                    nombre: d.nombre || 'Nombre no disponible',
                    tipo: d.tipo || 'General',
                    cantidadBase: d.cantidadBase ?? 100,
                    unidad: d.unidad || 'g',
                    proteina: d.proteina ?? 0,
                    carbohidratos: d.carbohidratos ?? 0,
                    grasas: d.grasas ?? 0,
                    equivalentes: d.equivalentes || [],
                };
            });
            setAlimentosBase(data);
        });

        return () => unsub();
    }, []);

    // 🔹 Escuchar planes en tiempo real (y recargar versiones)
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'planes'), async (snapshot) => {
            const planesData: Plan[] = [];

            for (const planDoc of snapshot.docs) {
                const planData = planDoc.data();

                // Subcolección de versiones
                const versionesRef = collection(db, `planes/${planDoc.id}/versiones`);
                const versionesSnapshot = await getDocs(versionesRef);

                const versiones: Plan['versiones'] = {};
                versionesSnapshot.forEach((vDoc) => {
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
            setLoading(false);
        });

        return () => unsub();
    }, []);


    // --- CAMBIO 1: Modificar la función para detener la propagación ---
    const handleToggleVersion = (e: React.MouseEvent, planId: string, version: 'volumen' | 'recomposicion') => {
        e.stopPropagation(); // Evita que el clic pliegue/despliegue la tarjeta
        setVersionSeleccionada((prev) => ({
            ...prev,
            [planId]: version,
        }));
    };

    const togglePlan = (id: string) => {
        setPlanesExpandido((prev) => ({ ...prev, [id]: !prev[id] }));
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
        <div className="w-full max-w-6xl mx-auto p-6 space-y-10 relative">
            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Planes de Alimentación
                </h1>

                <button
                    onClick={() => router.push('/plancreator')}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-200"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear nuevo plan
                </button>
            </div>

            {planes.map((plan) => {
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
                        {/* --- CAMBIO 2: Mover los botones al encabezado --- */}
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => togglePlan(plan.id)}
                        >
                            {/* Lado izquierdo: Títulos */}
                            <div>
                                <h2 className="text-2xl font-bold text-indigo-300">
                                    {plan.nombre}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Asignado a:{' '}
                                    <span className="text-indigo-400">{plan.asignadoA}</span>
                                </p>
                                <p className="text-gray-400 mt-1">{plan.descripcion}</p>
                            </div>

                            {/* Lado derecho: Botones y Chevron */}
                            <div className="flex items-center space-x-4">
                                {/* Botones de versión (movidos aquí) */}
                                <div className="flex space-x-2">
                                    {plan.versiones.volumen && (
                                        <button
                                            onClick={(e) => handleToggleVersion(e, plan.id, 'volumen')}
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
                                            onClick={(e) => handleToggleVersion(e, plan.id, 'recomposicion')}
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

                                {/* Icono Chevron */}
                                {planesExpandido[plan.id] ? (
                                    <ChevronUp className="text-indigo-300 w-6 h-6 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="text-indigo-300 w-6 h-6 flex-shrink-0" />
                                )}
                            </div>
                        </div>
                        {/* --- FIN DEL CAMBIO --- */}


                        {/* Contenido expandible */}
                        <div
                            className={`transition-all duration-500 overflow-hidden ${
                                planesExpandido[plan.id] ? 'max-h-[4000px] mt-4' : 'max-h-0'
                            }`}
                        >
                            {/* Los botones de versión ya no están aquí */}

                            {dataVersion && (
                                <>
                                    <CardPlan
                                        nombre={dataVersion.tipo}
                                        tipo={dataVersion.tipo}
                                        calorias={dataVersion.calorias}
                                        descripcion={dataVersion.objetivo}
                                    />

                                    {/* 🔹 Comidas (siempre visibles, sin colapsar) */}
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
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}