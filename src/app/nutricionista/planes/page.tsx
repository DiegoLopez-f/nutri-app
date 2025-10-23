'use client';

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CardPlan from '@/components/CardPlan';
import TableAlimentos from '@/components/TableAlimentos';

// Interfaz que el componente TableAlimentos espera para el catálogo (AlimentoBase)
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

// Interfaz para el alimento dentro del plan (PlanAlimento)
interface PlanAlimento {
    refAlimento: string; // ID del alimento (ej: "pechuga_pollo")
    cantidad: string;    // Cantidad asignada (ej: "120 g")
}

interface Comida {
    nombre: string;
    descripcion?: string;
    alimentos: PlanAlimento[];
}

interface Plan {
    id: string;
    nombre: string; // Ejemplo: "Plan A", "Plan B"
    tipo: string; // Ejemplo: "Volumen", "Recomposición"
    calorias: number;
    descripcion?: string;
    comidas?: Comida[];
}

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================

export default function PlanesPage() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosBase, setAlimentosBase] = useState<AlimentoBase[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para la interactividad
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [objetiveMode, setObjetiveMode] = useState<'Volumen' | 'Recomposición'>('Volumen');

    useEffect(() => {
        const fetchPlanes = async () => {
            try {
                // 1. Cargar ambas colecciones
                const planesSnapshot = await getDocs(collection(db, 'planes'));
                const alimentosSnapshot = await getDocs(collection(db, 'alimentos'));

                // 2. CONSTRUIR EL CATÁLOGO (alimentosBase)
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

                // 3. PROCESAR LOS PLANES
                const planesData = planesSnapshot.docs.map(doc => {
                    const data = doc.data() as Omit<Plan, 'id'>;

                    const comidas = data.comidas?.map(comida => {
                        const alimentos = comida.alimentos.map(alimento => {
                            return {
                                refAlimento: alimento.refAlimento,
                                cantidad: alimento.cantidad,
                            } as PlanAlimento;
                        });
                        return {
                            ...comida,
                            alimentos,
                        };
                    });

                    return {
                        id: doc.id,
                        ...data,
                        comidas: comidas as Comida[],
                    };
                }) as Plan[];

                setPlanes(planesData);

                // Establecer el primer plan como seleccionado por defecto
                if (planesData.length > 0) {
                    // Selecciona el primer plan de "Volumen" o el primero disponible
                    const defaultPlan = planesData.find(p => p.tipo === 'Volumen') || planesData[0];
                    setSelectedPlanId(defaultPlan.id);
                }

            } catch (error) {
                console.error('Error obteniendo datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanes();
    }, []);

    // 4. Lógica de filtrado: Mostrar solo el plan seleccionado
    const currentPlan = useMemo(() => {
        return planes.find(p => p.id === selectedPlanId);
    }, [planes, selectedPlanId]);

    // 5. Obtener una lista única de los nombres de planes (A, B, C, etc.)
    const planNames = useMemo(() => {
        // Asume que el nombre del plan está en el campo 'nombre' (ej: "Plan A Volumen")
        // Aquí se necesitaría una lógica más robusta si los nombres son dinámicos.
        // Simplificamos mostrando solo los que coinciden con el modo actual (Volumen/Recomposición)
        const filteredNames = planes
            .filter(p => p.tipo === objetiveMode)
            .map(p => p.nombre);

        // Usamos un Set para obtener solo nombres únicos
        return Array.from(new Set(filteredNames));
    }, [planes, objetiveMode]);

    // Manejar el clic en los botones de Plan A, B, C...
    const handlePlanSelect = (name: string) => {
        // Busca el primer plan con ese nombre y el modo activo, y lo selecciona
        const plan = planes.find(p => p.nombre === name && p.tipo === objetiveMode);
        if (plan) {
            setSelectedPlanId(plan.id);
        }
    };

    // Manejar el cambio de modo (Volumen/Recomposición)
    const handleModeChange = (mode: 'Volumen' | 'Recomposición') => {
        setObjetiveMode(mode);
        // Al cambiar el modo, intenta seleccionar el primer plan disponible para ese modo
        const newPlan = planes.find(p => p.tipo === mode);
        if (newPlan) {
            setSelectedPlanId(newPlan.id);
        } else {
            // Si no hay planes para el nuevo modo, deselecciona
            setSelectedPlanId(null);
        }
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
            <h1 className="text-3xl font-bold text-indigo-400 text-center mb-6">
                Gestión de Planes
            </h1>

            {/* BARRA DE BOTONES DE OBJETIVO (VOLUMEN/RECOMPOSICIÓN) */}
            <div className="flex justify-center mb-8 p-1 bg-gray-700 rounded-full shadow-inner">
                <button
                    onClick={() => handleModeChange('Volumen')}
                    className={`flex-1 py-3 px-6 text-lg font-semibold rounded-full transition duration-300 transform ${
                        objetiveMode === 'Volumen'
                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-xl shadow-green-500/30 scale-105'
                            : 'text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Volumen
                </button>
                <button
                    onClick={() => handleModeChange('Recomposición')}
                    className={`flex-1 py-3 px-6 text-lg font-semibold rounded-full transition duration-300 transform ${
                        objetiveMode === 'Recomposición'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 scale-105'
                            : 'text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    Recomposición
                </button>
            </div>

            {/* BOTONES DE PLANES (A, B, C...) */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {planNames.map((name, index) => {
                    const plan = planes.find(p => p.nombre === name && p.tipo === objetiveMode);
                    const isActive = plan?.id === selectedPlanId;

                    // Solo renderiza el botón si existe un plan para el modo activo
                    if (!plan) return null;

                    return (
                        <button
                            key={index}
                            onClick={() => handlePlanSelect(name)}
                            className={`py-2 px-6 text-md font-medium rounded-xl transition duration-300 ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105 border-2 border-indigo-300'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                            }`}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>

            {/* VISTA DEL PLAN ACTIVO */}
            {currentPlan ? (
                <div
                    key={currentPlan.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-200"
                >
                    <CardPlan
                        nombre={currentPlan.nombre}
                        tipo={currentPlan.tipo}
                        calorias={currentPlan.calorias}
                        descripcion={currentPlan.descripcion}
                    />

                    {currentPlan.comidas && currentPlan.comidas.length > 0 ? (
                        currentPlan.comidas.map((comida, index) => (
                            <div key={index} className="mt-6">
                                <h3 className="text-lg font-semibold text-indigo-300 mb-2">
                                    {comida.nombre}
                                </h3>
                                {/* Pasamos el catálogo y los alimentos al componente de tabla */}
                                <TableAlimentos
                                    alimentos={comida.alimentos}
                                    alimentosBase={alimentosBase}
                                />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm mt-4">
                            Este plan aún no tiene comidas asignadas.
                        </p>
                    )}
                </div>
            ) : (
                <div className="text-gray-400 text-center mt-10 p-10 bg-gray-800 rounded-xl">
                    Selecciona un plan disponible para el modo **{objetiveMode}**.
                </div>
            )}
        </div>
    );
}
