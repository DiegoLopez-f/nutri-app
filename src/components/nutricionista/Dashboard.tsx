'use client';

import React from 'react';
import ButtonRole from '@/components/ButtonRole';

export default function Dashboard() {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 w-full">
            <h2 className="text-2xl font-bold text-green-700">Dashboard Nutricionista</h2>
            <p className="text-gray-600">
                Aquí puedes ver un resumen general de tus pacientes y planes asignados.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
                <ButtonRole color="primary" onClick={() => console.log('Planes')}>Ver Planes</ButtonRole>
                <ButtonRole color="secondary" onClick={() => console.log('Pacientes')}>Ver Pacientes</ButtonRole>
            </div>

            {/* Panel de estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm">Pacientes Activos</p>
                    <p className="text-xl font-bold text-green-700">12</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm">Planes Asignados</p>
                    <p className="text-xl font-bold text-green-700">8</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500 text-sm">Planes Completados</p>
                    <p className="text-xl font-bold text-green-700">3</p>
                </div>
            </div>
        </div>
    );
}