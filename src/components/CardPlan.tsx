import React from 'react';

interface CardPlanProps {
    nombre: string;
    tipo: string;
    calorias: number;
    descripcion?: string;
}

export default function CardPlan({ nombre, tipo, calorias, descripcion }: CardPlanProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h2 className="text-2xl font-bold text-indigo-400 mb-2">{nombre}</h2>
            <p className="text-gray-300 mb-1">Tipo: <span className="font-semibold text-white">{tipo}</span></p>
            <p className="text-gray-300 mb-2">Calorías: <span className="font-semibold text-white">{calorias}</span></p>
            {descripcion && <p className="text-gray-400 text-sm italic">{descripcion}</p>}
        </div>
    );
}