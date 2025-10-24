'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, CollectionReference } from 'firebase/firestore';
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

interface PlanVersion {
    id: string;
    tipo: 'Volumen' | 'Recomposición';
    calorias: number;
    distribucion_macros: DistribucionMacros;
    objetivo: string;
    comidas?: Comida[];
    totales_diarios: TotalesDiarios;
    notas_tecnicas: string[];
}

interface Plan {
    id: string;
    nombre: string;
    descripcion?: string;
    asignadoA: string;
    versiones: PlanVersion[];
}

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosBase, setAlimentosBase] = useState<AlimentoBase[]>([]);
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

                    // 3. Cargar versiones (subcolección) de cada plan
                    const versionesSnapshot = await getDocs(
                        collection(db, 'planes', planDoc.id, 'versiones')
                    );

                    const versiones: PlanVersion[] = versionesSnapshot.docs.map(versionDoc => {
                        const versionData = versionDoc.data();
                        return {
                            id: versionDoc.id,
                            tipo: versionData.tipo,
                            asignadoA: versionData.asignadoA,
                            calorias: versionData.calorias,
                            distribucion_macros: versionData.distribucion_macros,
                            objetivo: versionData.objetivo,
                            comidas: versionData.comidas,
                            totales_diarios: versionData.totales_diarios,
                            notas_tecnicas: versionData.notas_tecnicas || [],
                        } as PlanVersion;
                    });

                    planesData.push({
                        id: planDoc.id,
                        nombre: planData.nombre,
                        descripcion: planData.descripcion,
                        asignadoA: planData.asignadoA,
                        versiones,
                    });
                }

                setPlanes(planesData);

            } catch (error) {
                console.error('Error obteniendo datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    // Renderizado del catálogo completo
    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-12">
            <h1 className="text-3xl font-bold text-indigo-400 text-center mb-10">
                Catálogo Completo de Planes Nutricionales
            </h1>

            {planes.map((plan) => (
                <div
                    key={plan.id}
                    className="space-y-8 pb-8 border-b-4 border-indigo-900/50" // Separador visual de planes
                >
                    {/* Título del Plan Principal */}
                    <h2 className="text-3xl font-extrabold text-white text-center pt-4 pb-2 bg-gray-900 rounded-lg shadow-md">
                        Plan: {plan.nombre}
                    </h2>
                    {plan.descripcion && (
                        <p className="text-center text-gray-400 max-w-3xl mx-auto mb-6">
                            {plan.descripcion}
                        </p>
                    )}

                    <div className="space-y-10">
                        {plan.versiones.map((version) => (
                            // Contenedor de la Versión, replicando el estilo de la versión anterior
                            <div key={version.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">

                                {/* Encabezado de la Versión, usando la clase de la versión para el color */}
                                <h3 className={`text-2xl font-bold mb-6 text-center border-b pb-3 border-gray-700 ${
                                    version.tipo === 'Volumen' ? 'text-green-400' : 'text-cyan-400'
                                }`}>
                                    Versión: {version.tipo}
                                </h3>

                                {/* CardPlan con información de la versión */}
                                <div className="mb-6">
                                    <CardPlan
                                        nombre={`${plan.nombre} - ${version.tipo}`}
                                        tipo={version.tipo}
                                        calorias={version.calorias}
                                        descripcion={version.objetivo}
                                        distribucionMacros={version.distribucion_macros}
                                        totalesDiarios={version.totales_diarios}
                                    />
                                </div>

                                {/* Notas Técnicas */}
                                {version.notas_tecnicas && version.notas_tecnicas.length > 0 && (
                                    <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                        <h4 className="text-lg font-bold text-amber-300 mb-3">Notas Técnicas</h4>
                                        <ul className="space-y-2">
                                            {version.notas_tecnicas.map((nota, index) => (
                                                <li key={index} className="text-gray-300 text-sm flex items-start">
                                                    <span className="text-amber-400 mr-2">•</span>
                                                    {nota}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Comidas */}
                                {version.comidas && version.comidas.length > 0 ? (
                                    version.comidas.map((comida, comidaIndex) => (
                                        <div key={comidaIndex} className="mt-8 pt-6 border-t border-gray-700">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-xl font-bold text-indigo-300">
                                                        {comida.nombre}
                                                    </h4>
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
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
