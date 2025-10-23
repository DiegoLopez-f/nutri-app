import React from 'react';

interface Alimento {
    refAlimento: string;
    cantidad: string;
    macros: {
        proteinas: number;
        carbohidratos: number;
        grasas: number;
        kcal?: number;
    };
    nombre: string;
}

interface TableAlimentosProps {
    alimentos: Alimento[];
}

export default function TableAlimentos({ alimentos }: TableAlimentosProps) {
    return (
        <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm text-left text-gray-300 border border-gray-700 rounded-xl overflow-hidden">
                <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
                <tr>
                    <th className="px-4 py-3">Alimento</th>
                    <th className="px-4 py-3">Cantidad</th>
                    <th className="px-4 py-3">Proteínas (g)</th>
                    <th className="px-4 py-3">Carbs (g)</th>
                    <th className="px-4 py-3">Grasas (g)</th>
                </tr>
                </thead>
                <tbody>
                {alimentos.map((a, i) => (
                    <tr
                        key={i}
                        className="border-t border-gray-700 hover:bg-gray-800 transition duration-150"
                    >
                        <td className="px-4 py-3 font-semibold text-white">{a.nombre}</td>
                        <td className="px-4 py-3">{a.cantidad}</td>
                        <td className="px-4 py-3">{a.macros.proteinas}</td>
                        <td className="px-4 py-3">{a.macros.carbohidratos}</td>
                        <td className="px-4 py-3">{a.macros.grasas}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}