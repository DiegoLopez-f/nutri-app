'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';

interface PlanAlimento {
    refAlimento: string; // ID del alimento
    cantidad: string;
    nombre: string;
    macros: {
        proteinas: number;
        carbohidratos: number;
        grasas: number;
        kcal?: number;
    };
}

interface Comida {
    nombre: string;
    descripcion?: string;
    alimentos: PlanAlimento[];
}

interface Plan {
    id: string;
    nombre: string;
    tipo: string;
    calorias: number;
    descripcion?: string;
    comidas?: Comida[];
}

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                const planesSnapshot = await getDocs(collection(db, 'planes'));
                const alimentosSnapshot = await getDocs(collection(db, 'alimentos'));

                const alimentosMap = new Map<string, { nombre: string; macros: { proteinas: number; carbohidratos: number; grasas: number; kcal?: number } }>();
                alimentosSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    alimentosMap.set(doc.id, {
                        nombre: data.nombre || 'Nombre no disponible',
                        macros: {
                            proteinas: data.macros?.proteinas ?? 0,
                            carbohidratos: data.macros?.carbohidratos ?? 0,
                            grasas: data.macros?.grasas ?? 0,
                            kcal: data.macros?.kcal ?? undefined,
                        },
                    });
                });

                const planesData = planesSnapshot.docs.map(doc => {
                    const data = doc.data() as Omit<Plan, 'id'>;
                    const comidas = data.comidas?.map(comida => {
                        const alimentos = comida.alimentos.map(alimento => {
                            const alimentoInfo = alimentosMap.get(alimento.refAlimento);
                            return {
                                ...alimento,
                                nombre: alimento.nombre ?? alimentoInfo?.nombre ?? 'Nombre no disponible',
                                macros: alimento.macros ?? alimentoInfo?.macros ?? { proteinas: 0, carbohidratos: 0, grasas: 0 },
                            };
                        });
                        return {
                            ...comida,
                            alimentos,
                        };
                    });

                    return {
                        id: doc.id,
                        ...data,
                        comidas,
                    };
                }) as Plan[];

                setPlanes(planesData);
            } catch (error) {
                console.error('Error obteniendo planes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanes();
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

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold text-indigo-400 text-center mb-6">
                Planes de Alimentación
            </h1>

            {planes.map(plan => (
                <div
                    key={plan.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-200"
                >
                    <CardPlan
                        nombre={plan.nombre}
                        tipo={plan.tipo}
                        calorias={plan.calorias}
                        descripcion={plan.descripcion}
                    />

                    {plan.comidas && plan.comidas.length > 0 ? (
                        plan.comidas.map((comida, index) => (
                            <div key={index} className="mt-6">
                                <h3 className="text-lg font-semibold text-indigo-300 mb-2">
                                    {comida.nombre}
                                </h3>
                                <TableAlimentos alimentos={comida.alimentos} />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm mt-4">
                            Este plan aún no tiene comidas asignadas.
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}