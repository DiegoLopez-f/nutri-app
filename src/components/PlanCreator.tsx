// components/PlanCreator.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, addDoc } from 'firebase/firestore';

export interface Alimento {
    id: string;
    nombre: string;
    proteina: number;
    grasas: number;
    carbohidratos: number;
    calorias: number;
}

export interface PlanItem extends Alimento {
    cantidad: number;
    unidad: string;
    idLocal: string;     // Solo para la lista en React
    idOriginal: string;  // Referencia real a Firestore
}

export type Comida = 'Desayuno' | 'Colacion' | 'Almuerzo' | 'Cena';

export interface PlanNutricional {
    id?: string;
    nombrePlan: string;
    tipo: 'Volumen' | 'Recomposición';
    fechaCreacion: Date;
    items: Record<Comida, PlanItem[]>;
    macrosTotales: {
        calorias: number;
        proteina: number;
        grasas: number;
        carbohidratos: number;
    };
}

export const INITIAL_PLAN_ITEMS: Record<Comida, PlanItem[]> = {
    Desayuno: [],
    Colacion: [],
    Almuerzo: [],
    Cena: [],
};

const parseNumber = (value: any): number => {
    const num = parseFloat(value);
    return isNaN(num) || num === null || value === undefined ? 0 : num;
};

const calcularTotales = (planItems: Record<Comida, PlanItem[]>) => {
    const todosLosItems = Object.values(planItems).flat();
    return todosLosItems.reduce(
        (acc, item) => {
            const factor = item.cantidad / 100;
            acc.calorias += (item.calorias || 0) * factor;
            acc.proteina += (item.proteina || 0) * factor;
            acc.grasas += (item.grasas || 0) * factor;
            acc.carbohidratos += (item.carbohidratos || 0) * factor;
            return acc;
        },
        { calorias: 0, proteina: 0, grasas: 0, carbohidratos: 0 }
    );
};

const PlanCreator: React.FC = () => {
    const [alimentosMaestros, setAlimentosMaestros] = useState<Alimento[]>([]);
    const [nombrePlan, setNombrePlan] = useState('');
    const [tipoPlan, setTipoPlan] = useState<'Volumen' | 'Recomposición'>('Volumen');
    const [planItems, setPlanItems] = useState<Record<Comida, PlanItem[]>>(INITIAL_PLAN_ITEMS);
    const [selectedComida, setSelectedComida] = useState<Comida>('Desayuno');
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [cantidad, setCantidad] = useState(100);
    const [unidad, setUnidad] = useState('g');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const comidas: Comida[] = ['Desayuno', 'Colacion', 'Almuerzo', 'Cena'];

    useEffect(() => {
        const fetchAlimentos = async () => {
            try {
                const alimentosSnapshot = await getDocs(collection(db, 'alimentos'));
                const alimentosList: Alimento[] = alimentosSnapshot.docs.map(
                    (docSnapshot: QueryDocumentSnapshot) => {
                        const data = docSnapshot.data();
                        const prot = parseNumber(data.proteina || data.proteinas);
                        const carb = parseNumber(data.carbohidratos);
                        const fat = parseNumber(data.grasas);
                        const cal = parseNumber(data.calorias || data.kcal);
                        const caloriasCalculadas = cal || (prot * 4 + carb * 4 + fat * 9);
                        return {
                            id: docSnapshot.id,
                            nombre: data.nombre || 'Alimento sin nombre',
                            proteina: prot,
                            grasas: fat,
                            carbohidratos: carb,
                            calorias: caloriasCalculadas,
                        };
                    }
                );
                setAlimentosMaestros(alimentosList);
            } catch (err) {
                console.error(err);
                setError('Error al cargar alimentos.');
            } finally {
                setCargando(false);
            }
        };
        fetchAlimentos();
    }, []);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFoodId || cantidad <= 0) {
            alert('Selecciona un alimento y una cantidad válida.');
            return;
        }
        const foodToAdd = alimentosMaestros.find(a => a.id === selectedFoodId);
        if (foodToAdd) {
            const newItem: PlanItem = {
                ...foodToAdd,
                cantidad,
                unidad,
                idLocal: crypto.randomUUID(),  // solo para la lista
                idOriginal: foodToAdd.id,      // referencia real a Firestore
            };
            setPlanItems(prev => ({
                ...prev,
                [selectedComida]: [...prev[selectedComida], newItem],
            }));
            setSelectedFoodId('');
            setCantidad(100);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombrePlan.trim() || Object.values(planItems).flat().length === 0) {
            alert('El plan debe tener un nombre y al menos un alimento.');
            return;
        }

        try {
            setCargando(true);
            const totales = calcularTotales(planItems);

            // Transformar items para la estructura de PlanesPage
            const comidasParaGuardar = Object.entries(planItems).map(([comida, items]) => ({
                nombre: comida,
                alimentos: items.map(item => ({
                    refAlimento: item.idOriginal, // <-- clave para que PlanesPage lo reconozca
                    cantidad: `${item.cantidad}${item.unidad}`,
                })),
            }));

            const nuevoPlan = {
                nombre: nombrePlan.trim(),
                tipo: tipoPlan,
                calorias: totales.calorias,
                descripcion: '',
                comidas: comidasParaGuardar,
                fechaCreacion: new Date(),
            };

            await addDoc(collection(db, 'planes'), nuevoPlan);

            alert(`Plan "${nombrePlan}" guardado correctamente.`);
            setNombrePlan('');
            setTipoPlan('Volumen');
            setPlanItems(INITIAL_PLAN_ITEMS);

        } catch (err) {
            console.error(err);
            alert('Error al guardar el plan.');
        } finally {
            setCargando(false);
        }
    };

    const totalesActuales = useMemo(() => calcularTotales(planItems), [planItems]);
    const totalItems = Object.values(planItems).flat().length;

    if (cargando && alimentosMaestros.length === 0) return <p className="text-center mt-10 text-gray-600">Cargando alimentos...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <h1 className="text-3xl font-bold text-green-700 text-center mb-10">Crear Plan Nutricional</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                    {/* Formulario Añadir */}
                    <form onSubmit={handleAddItem} className="bg-white rounded-2xl shadow p-6 border border-green-100">
                        <h2 className="text-lg font-semibold text-green-600 mb-4">Agregar alimento</h2>

                        <label className="block mb-2 font-medium text-gray-700">Comida</label>
                        <select
                            value={selectedComida}
                            onChange={e => setSelectedComida(e.target.value as Comida)}
                            className="w-full border rounded-lg p-2 mb-4"
                        >
                            {comidas.map(c => <option key={c}>{c}</option>)}
                        </select>

                        <label className="block mb-2 font-medium text-gray-700">Alimento</label>
                        <select
                            value={selectedFoodId}
                            onChange={e => setSelectedFoodId(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4"
                        >
                            <option value="">Selecciona un alimento</option>
                            {alimentosMaestros.map(a => (
                                <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                        </select>

                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block mb-2 font-medium text-gray-700">Cantidad</label>
                                <input
                                    type="number"
                                    value={cantidad}
                                    onChange={e => setCantidad(parseFloat(e.target.value))}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-2 font-medium text-gray-700">Unidad</label>
                                <select
                                    value={unidad}
                                    onChange={e => setUnidad(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="g">g</option>
                                    <option value="ml">ml</option>
                                    <option value="unidad">unidad</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                        >
                            + Añadir al {selectedComida}
                        </button>
                    </form>

                    {/* Formulario Guardar */}
                    <form onSubmit={handleSavePlan} className="bg-white rounded-2xl shadow p-6 border border-green-100">
                        <input
                            type="text"
                            value={nombrePlan}
                            onChange={e => setNombrePlan(e.target.value)}
                            placeholder="Nombre del plan"
                            className="w-full border rounded-lg p-2 mb-4"
                        />

                        <label className="block mb-2 font-medium text-gray-700">Tipo de Plan</label>
                        <select
                            value={tipoPlan}
                            onChange={e => setTipoPlan(e.target.value as 'Volumen' | 'Recomposición')}
                            className="w-full border rounded-lg p-2 mb-4"
                        >
                            <option value="Volumen">Volumen</option>
                            <option value="Recomposición">Recomposición</option>
                        </select>

                        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                            <h4 className="text-green-700 font-semibold mb-2">Totales ({totalItems} ítems)</h4>
                            <p><strong>Calorías:</strong> {totalesActuales.calorias.toFixed(0)} kcal</p>
                            <p><strong>Proteínas:</strong> {totalesActuales.proteina.toFixed(1)}g</p>
                            <p><strong>Grasas:</strong> {totalesActuales.grasas.toFixed(1)}g</p>
                            <p><strong>Carbohidratos:</strong> {totalesActuales.carbohidratos.toFixed(1)}g</p>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando || totalItems === 0}
                            className={`w-full py-2 rounded-lg font-semibold transition ${
                                cargando ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-green-700 hover:opacity-90 text-white'
                            }`}
                        >
                            {cargando ? 'Guardando...' : 'Guardar Plan'}
                        </button>
                    </form>
                </div>

                {/* Columna Derecha: vista previa */}
                <div className="bg-white rounded-2xl shadow p-6 border border-green-100 overflow-y-auto max-h-[600px]">
                    {comidas.map(comida => (
                        <div key={comida} className="mb-6 border-b border-gray-200 pb-3">
                            <h3 className="text-xl font-semibold text-green-700 mb-2">{comida}</h3>
                            {planItems[comida].length === 0 ? (
                                <p className="text-gray-500 text-sm">Sin alimentos</p>
                            ) : (
                                <ul className="space-y-2">
                                    {planItems[comida].map(item => (
                                        <li key={item.idLocal} className="flex justify-between items-center text-sm bg-green-50 p-2 rounded-md">
                                            <span className="text-green-800">
                                                {item.nombre} <span className="text-gray-500">({item.cantidad}{item.unidad})</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPlanItems(prev => ({
                                                        ...prev,
                                                        [comida]: prev[comida].filter(i => i.idLocal !== item.idLocal),
                                                    }))
                                                }
                                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlanCreator;
