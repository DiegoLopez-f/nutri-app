'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';

interface Alimento {
    id: string;
    nombre: string;
    proteina: number;
    carbohidratos: number;
    grasas: number;
    kcal?: number;
    cantidadBase: number;
    unidad: string;
}

interface PlanAlimento {
    refAlimento: string; // id del alimento
    cantidad: string;
}

interface Comida {
    nombre: string;
    alimentos: PlanAlimento[];
}

interface Plan {
    id: string;
    nombre: string;
    tipo: string;
    calorias: number;
    comidas?: Comida[];
}

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosBaseMap, setAlimentosBaseMap] = useState<Record<string, Alimento>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1️⃣ Cargar alimentos base
                const alimentosSnap = await getDocs(collection(db, 'alimentos'));
                const map: Record<string, Alimento> = {};
                alimentosSnap.docs.forEach(doc => {
                    map[doc.id] = doc.data() as Alimento;
                });
                setAlimentosBaseMap(map);

                // 2️⃣ Cargar planes
                const planesSnap = await getDocs(collection(db, 'planes'));
                const planesData: Plan[] = planesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Plan));

                setPlanes(planesData);
            } catch (error) {
                console.error('Error cargando planes o alimentos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Cargando planes...</div>;
    if (!planes.length) return <div>No hay planes disponibles.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-bold text-indigo-400 text-center mb-6">
                Planes de Alimentación
            </h1>

            {planes.map(plan => (
                <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md">
                    <CardPlan
                        nombre={plan.nombre}
                        tipo={plan.tipo}
                        calorias={plan.calorias}
                    />

                    {plan.comidas?.map((comida, i) => (
                        <div key={i} className="mt-6">
                            <h3 className="text-lg font-semibold text-indigo-300 mb-2">{comida.nombre}</h3>
                            {Object.keys(alimentosBaseMap).length > 0 && (
                                <TableAlimentos
                                    alimentos={comida.alimentos}
                                    alimentosBaseMap={alimentosBaseMap}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}