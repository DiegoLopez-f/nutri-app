import React from 'react';
// Importamos Link si necesitas navegación cliente-side, pero usaremos <a> para el HTML puro.

// Icono SVG simple de Nutrición (una manzana y un corazón)
const NutritionIcon: React.FC = () => (
    <svg className="w-16 h-16 text-indigo-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM15 10a1 1 0 100-2 1 1 0 000 2zM9 10a1 1 0 100-2 1 1 0 000 2z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14h4v4h-4zM12 18v3"></path>
    </svg>
);

// Componente principal de la página (page.tsx)
export default function Home() {
    return (
        // Contenedor principal: Centrado en la pantalla, con fondo oscuro y padding generoso.
        // Nota: El fondo 'bg-gray-900' se aplicará a toda la vista si no está definido globalmente en el CSS.
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">

            {/* Tarjeta de bienvenida */}
            <div className="w-full max-w-lg bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl border border-gray-700 text-center">

                <NutritionIcon />

                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                    <span className="text-indigo-400">Nutri</span>App
                </h1>

                <p className="text-lg text-gray-400 mb-10 max-w-xs mx-auto">
                    El sistema colaborativo para la gestión de planes nutricionales.
                </p>

                <p className="text-md font-semibold text-gray-300 mb-6">
                    Selecciona tu rol para acceder:
                </p>

                {/* Contenedor de botones: Usamos flexbox para el espaciado y hacerlo responsivo */}
                <div className="flex flex-col sm:flex-row gap-4">

                    {/* Botón Nutricionista (Asegúrate de usar <Link> si necesitas pre-fetching) */}
                    <a href="/nutricionista" className="flex-1">
                        <button className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl transition duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-[1.02]">
                            Nutricionista
                        </button>
                    </a>

                    {/* Botón Paciente (Asegúrate de usar <Link> si necesitas pre-fetching) */}
                    <a href="/paciente/page" className="flex-1">
                        <button className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-xl transition duration-300 shadow-lg hover:shadow-teal-500/50 transform hover:scale-[1.02]">
                            Paciente
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}
