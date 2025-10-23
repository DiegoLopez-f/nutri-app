"use client";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface Alimento {
    nombre: string;
    cantidadBase: number;
    unidad: string;
    proteina: number;
    carbohidratos: number;
    grasas: number;
    equivalentes?: string[];
}

interface PlanAlimento {
    alimentoId: string;
    cantidad: number;
}

interface Comida {
    nombreComida: string;
    alimentos: PlanAlimento[];
}

interface Plan {
    nombre: string;
    tipo: string;
    calorias: number;
    macros: { proteina: number; carbohidratos: number; grasas: number };
    comidas: Comida[];
    notas?: string;
}

export default function PlanesNutricionista() {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [alimentosMap, setAlimentosMap] = useState<Record<string, Alimento>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlimentos = async () => {
            const snapshot = await getDocs(collection(db, "alimentos"));
            const map: Record<string, Alimento> = {};
            snapshot.docs.forEach(doc => {
                map[doc.id] = doc.data() as Alimento;
            });
            return map;
        };

        const fetchPlanes = async () => {
            try {
                const alimentos = await fetchAlimentos();
                setAlimentosMap(alimentos);

                const planesCol = collection(db, "planes");
                const planesSnapshot = await getDocs(planesCol);
                const planesList = planesSnapshot.docs.map(doc => doc.data() as Plan);
                setPlanes(planesList);
            } catch (error) {
                console.error("Error al obtener planes o alimentos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanes();
    }, []);

    if (loading) return <p>Cargando planes...</p>;

    return (
        <div>
            <h1>Planes de Alimentación</h1>
            {planes.length === 0 ? (
                <p>No hay planes creados aún.</p>
            ) : (
                <ul>
                    {planes.map((plan, idx) => (
                        <li key={idx} style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
                            <h2>{plan.nombre} ({plan.tipo})</h2>
                            <p>Calorías: {plan.calorias} kcal</p>
                            <p>Macros: P {plan.macros.proteina}g / C {plan.macros.carbohidratos}g / G {plan.macros.grasas}g</p>
                            {plan.notas && <p>Notas: {plan.notas}</p>}

                            {plan.comidas.map((comida, cIdx) => (
                                <div key={cIdx} style={{ marginTop: "1rem" }}>
                                    <h3>{comida.nombreComida}</h3>
                                    <ul>
                                        {comida.alimentos.map((pa, aIdx) => {
                                            const alimento = alimentosMap[pa.alimentoId];
                                            if (!alimento) return null;
                                            const factor = pa.cantidad / alimento.cantidadBase;
                                            return (
                                                <li key={aIdx}>
                                                    {alimento.nombre}: {pa.cantidad}{alimento.unidad} — P { (alimento.proteina * factor).toFixed(1) }g / C { (alimento.carbohidratos * factor).toFixed(1) }g / G { (alimento.grasas * factor).toFixed(1) }g
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}