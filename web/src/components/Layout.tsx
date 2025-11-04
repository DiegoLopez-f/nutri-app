'use client';

import React, {ReactNode} from 'react';
import Link from 'next/link';

interface LayoutProps {
    children: ReactNode;
}

const LeafIcon: React.FC = () => (
    <svg className="w-7 h-7 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18"/>
    </svg>
);

const Layout: React.FC<LayoutProps> = ({children}) => {
    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-800 font-sans flex flex-col">

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white bg-opacity-60 backdrop-blur-md border-b border-green-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link href="/">
                        <div className="flex items-center cursor-pointer">
                            <LeafIcon/>
                            <span className="text-2xl font-extrabold tracking-wide text-[#059669]">
                                <span className="text-[#4ADE80]">Nutri</span>App
                            </span>
                        </div>
                    </Link>

                    {/* Navegación */}
                    <nav className="hidden md:flex space-x-10">
                        <Link href="/nutricionista"
                              className="text-base font-semibold text-gray-700 hover:text-[#059669] transition duration-200 ease-in-out border-b-2 border-transparent hover:border-[#4ADE80] pb-1">
                            Nutricionista
                        </Link>
                        <Link href="/paciente/dashboard"
                              className="text-base font-semibold text-gray-700 hover:text-[#059669] transition duration-200 ease-in-out border-b-2 border-transparent hover:border-[#4ADE80] pb-1">
                            Mi Plan
                        </Link>
                        <Link href="/recursos"
                              className="text-base font-semibold text-gray-700 hover:text-[#059669] transition duration-200 ease-in-out border-b-2 border-transparent hover:border-[#4ADE80] pb-1">
                            Recursos
                        </Link>
                    </nav>

                    {/* Botón de Acción - Mantenemos el estilo original */}
                    <button
                        className="bg-gradient-to-r from-[#4ADE80] to-[#059669] text-white font-bold py-2.5 px-7 rounded-full text-sm shadow-md shadow-green-400/40 transition duration-300 transform hover:scale-105 active:scale-95 hidden sm:block"
                        onClick={() => window.location.href = '/Login'} // <-- Ruta sensible a mayúscula
                    >
                        Panel de Acceso
                    </button>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow w-full bg-gradient-to-br from-[#E0F7F1] via-[#F3FAF7] to-[#E8FDF2] px-6 py-16">
                {children}
            </main>

            {/* FOOTER */}
            <footer className="bg-white border-t border-green-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-600">

                        <div>
                            <span className="text-lg font-extrabold text-[#059669] mb-2 block">NutriApp</span>
                            <p className="text-gray-500">
                                Nutrición inteligente, seguimiento efectivo.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700">Enlaces</h4>
                            <Link href="/about" className="block hover:text-[#4ADE80] transition-colors">Sobre
                                Nosotros</Link>
                            <Link href="/faq" className="block hover:text-[#4ADE80] transition-colors">Preguntas
                                Frecuentes</Link>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700">Legal</h4>
                            <Link href="/terms" className="block hover:text-[#4ADE80] transition-colors">Términos de
                                Uso</Link>
                            <Link href="/privacidad"
                                  className="block hover:text-[#4ADE80] transition-colors">Privacidad</Link>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700">Contacto</h4>
                            <p>Correo: nutriapp@nutricion.com</p>
                            <p>© {new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;