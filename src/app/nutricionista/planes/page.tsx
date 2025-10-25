'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';

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
    alimentos: PlanAlimento[];
}

interface Plan {
    id: string;
    nombre: string;
    tipo: 'Volumen' | 'Recomposición';
    calorias?: number;
    descripcion?: string;
    comidas?: Comida[];
}

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosBase, setAlimentosBase] = useState<AlimentoBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [planesSnapshot, alimentosSnapshot] = await Promise.all([
                    getDocs(collection(db, 'planes')),
                    getDocs(collection(db, 'alimentos')),
                ]);

                const alimentosData: AlimentoBase[] = alimentosSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nombre: data.nombre || 'Sin nombre',
                        tipo: data.tipo || 'General',
                        cantidadBase: data.cantidadBase ?? 100,
                        unidad: data.unidad || 'g',
                        proteina: data.proteina ?? 0,
                        carbohidratos: data.carbohidratos ?? 0,
                        grasas: data.grasas ?? 0,
                        equivalentes: data.equivalentes || [],
                    };
                });
                setAlimentosBase(alimentosData);

                const planesData: Plan[] = planesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Plan));

                setPlanes(planesData);
            } catch (err) {
                console.error('Error obteniendo datos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedPlans(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleEliminarPlan = async (id: string) => {
        if (confirm('¿Deseas eliminar este plan?')) {
            await deleteDoc(doc(db, 'planes', id));
            setPlanes(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleEditarPlan = (plan: Plan) => {
        // Redirigir a PlanCreator con el ID del plan o pasar datos por query/state
        router.push(`/plancreator?editar=${plan.id}`);
    };

    if (loading) return <p className="text-gray-300 text-center mt-10">Cargando planes...</p>;
    if (!planes.length) return <p className="text-gray-400 text-center mt-10">No hay planes disponibles aún.</p>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-400">Gestión de Planes</h1>
                <button
                    onClick={() => router.push('/plancreator')}
                    className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                    <Plus className="w-5 h-5" /> Crear Plan
                </button>
            </div>

            {planes.map(plan => (
                <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                    {/* Header compacto */}
                    <div
                        onClick={() => toggleExpand(plan.id)}
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700 transition"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-indigo-300">{plan.nombre}</h2>
                            <p className="text-sm text-green-400">
                                {plan.tipo} - {(plan.calorias ?? 0).toFixed(0)} kcal
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    handleEditarPlan(plan);
                                }}
                                title="Editar"
                                className="p-1 rounded-full hover:bg-gray-700"
                            >
                                <Edit className="w-5 h-5 text-blue-400" />
                            </button>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    handleEliminarPlan(plan.id);
                                }}
                                title="Eliminar"
                                className="p-1 rounded-full hover:bg-red-700"
                            >
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                            {expandedPlans[plan.id] ? <ChevronUp className="w-5 h-5 text-gray-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
                        </div>
                    </div>

                    {/* Contenido expandido */}
                    {expandedPlans[plan.id] && (
                        <div className="p-4 border-t border-gray-700 space-y-4">
                            <CardPlan
                                nombre={plan.nombre}
                                tipo={plan.tipo}
                                calorias={plan.calorias ?? 0}
                                descripcion={plan.descripcion}
                            />

                            {plan.comidas && plan.comidas.length > 0 ? (
                                plan.comidas.map((comida, idx) => (
                                    <div key={idx} className="mt-4 pt-2 border-t border-gray-700">
                                        <h3 className="text-lg font-bold text-indigo-200 mb-2">{comida.nombre}</h3>
                                        <TableAlimentos alimentos={comida.alimentos} alimentosBase={alimentosBase} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm mt-2">Este plan aún no tiene comidas asignadas.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
