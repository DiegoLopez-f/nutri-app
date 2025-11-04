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

    // Estados para la interactividad - INVERTIDOS
    const [selectedMinuta, setSelectedMinuta] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<'Volumen' | 'Recomposición' | null>(null);

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

                // Establecer la primera minuta como seleccionada por defecto
                if (planesData.length > 0) {
                    const firstMinuta = getUniqueMinutas(planesData)[0];
                    setSelectedMinuta(firstMinuta);
                }

            } catch (error) {
                console.error('Error obteniendo datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanes();
    }, []);

    // Obtener lista única de minutas (A, B, C, etc.)
    const getUniqueMinutas = (planesData: Plan[]): string[] => {
        const nombres = planesData.map(p => p.nombre);
        return Array.from(new Set(nombres)).sort(); // Orden alfabético
    };

    const minutas = useMemo(() => {
        return getUniqueMinutas(planes);
    }, [planes]);

    // Obtener los modos disponibles para la minuta seleccionada
    const modosDisponibles = useMemo(() => {
        if (!selectedMinuta) return [];

        const modos = planes
            .filter(p => p.nombre === selectedMinuta)
            .map(p => p.tipo as 'Volumen' | 'Recomposición');

        return Array.from(new Set(modos));
    }, [planes, selectedMinuta]);

    // Plan actual seleccionado
    const currentPlan = useMemo(() => {
        if (!selectedMinuta || !selectedMode) return null;

        return planes.find(p =>
            p.nombre === selectedMinuta &&
            p.tipo === selectedMode
        );
    }, [planes, selectedMinuta, selectedMode]);

    // Efecto para auto-seleccionar el primer modo disponible cuando cambia la minuta
    useEffect(() => {
        if (selectedMinuta && modosDisponibles.length > 0 && !selectedMode) {
            setSelectedMode(modosDisponibles[0]);
        }
    }, [selectedMinuta, modosDisponibles, selectedMode]);

    // Manejar selección de minuta
    const handleMinutaSelect = (minuta: string) => {
        setSelectedMinuta(minuta);
        // Resetear el modo cuando cambia la minuta
        setSelectedMode(null);
    };

    // Manejar selección de modo
    const handleModeSelect = (mode: 'Volumen' | 'Recomposición') => {
        setSelectedMode(mode);
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
            <h1 className="text-3xl font-bold text-indigo-400 text-center mb-8">
                Gestión de Planes
            </h1>

            {/* PRIMERO: SELECTOR DE MINUTAS (A, B, C...) */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700 max-w-2xl mx-auto">
                <h3 className="w-full text-center text-lg font-semibold text-gray-300 mb-3">
                    Selecciona una Minuta
                </h3>
                {minutas.map((minuta, index) => (
                    <button
                        key={index}
                        onClick={() => handleMinutaSelect(minuta)}
                        className={`py-2 px-6 text-base font-medium rounded-full transition duration-300 ease-in-out border ${
                            selectedMinuta === minuta
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/50 border-indigo-400 transform scale-105'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600 hover:text-white'
                        }`}
                    >
                        {minuta}
                    </button>
                ))}
            </div>

            {/* SEGUNDO: SELECTOR DE MODO (VOLUMEN/RECOMPOSICIÓN) - SOLO SI HAY MINUTA SELECCIONADA */}
            {selectedMinuta && modosDisponibles.length > 0 && (
                <div className="flex justify-center gap-4 mb-10 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-300 mr-4 self-center">
                        Versión:
                    </h3>
                    <div className="flex gap-2">
                        {modosDisponibles.includes('Volumen') && (
                            <button
                                onClick={() => handleModeSelect('Volumen')}
                                className={`py-2 px-6 text-base font-bold rounded-xl transition duration-300 shadow-md ${
                                    selectedMode === 'Volumen'
                                        ? 'bg-green-500 text-white shadow-green-500/50 transform scale-[1.05]'
                                        : 'bg-green-700 text-white hover:bg-green-600'
                                }`}
                            >
                                Volumen
                            </button>
                        )}
                        {modosDisponibles.includes('Recomposición') && (
                            <button
                                onClick={() => handleModeSelect('Recomposición')}
                                className={`py-2 px-6 text-base font-bold rounded-xl transition duration-300 shadow-md ${
                                    selectedMode === 'Recomposición'
                                        ? 'bg-cyan-500 text-white shadow-cyan-500/50 transform scale-[1.05]'
                                        : 'bg-cyan-700 text-white hover:bg-cyan-600'
                                }`}
                            >
                                Recomposición
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* VISTA DEL PLAN ACTIVO */}
            {currentPlan ? (
                <div
                    key={currentPlan.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl transition duration-200"
                >
                    <CardPlan
                        nombre={currentPlan.nombre}
                        tipo={currentPlan.tipo}
                        calorias={currentPlan.calorias}
                        descripcion={currentPlan.descripcion}
                    />

                    {currentPlan.comidas && currentPlan.comidas.length > 0 ? (
                        currentPlan.comidas.map((comida, index) => (
                            <div key={index} className="mt-8 pt-4 border-t border-gray-700">
                                <h3 className="text-xl font-bold text-indigo-300 mb-4">
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
            ) : selectedMinuta && !selectedMode ? (
                <div className="text-gray-400 text-center mt-10 p-10 bg-gray-800 rounded-xl border border-gray-700">
                    Selecciona un modo para la minuta <strong>{selectedMinuta}</strong>.
                </div>
            ) : !selectedMinuta ? (
                <div className="text-gray-400 text-center mt-10 p-10 bg-gray-800 rounded-xl border border-gray-700">
                    Selecciona una minuta para comenzar.
                </div>
            ) : (
                <div className="text-gray-400 text-center mt-10 p-10 bg-gray-800 rounded-xl border border-gray-700">
                    No se encontró el plan seleccionado.
                </div>
            )}
        </div>
    );
}