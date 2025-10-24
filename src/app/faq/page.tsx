"use client"; // Es un Client Component debido al uso del estado (useState) para el acordeón.

import React, { useState } from 'react';

// Datos de ejemplo para las preguntas frecuentes de NutriAPP
const faqData = [
    {
        id: 1,
        question: "¿Qué es NutriAPP y para quién está diseñado?",
        answer: "NutriAPP es una plataforma profesional para la gestión de planes nutricionales. Está diseñada tanto para nutricionistas y entrenadores que buscan optimizar su flujo de trabajo, como para usuarios que desean seguir planes personalizados y hacer un seguimiento detallado de su progreso diario.",
    },
    {
        id: 2,
        question: "¿Puedo personalizar mis planes de alimentación?",
        answer: "Sí, la personalización es el núcleo de NutriAPP. La plataforma permite a los profesionales crear planes desde cero o modificar plantillas existentes para adaptarlas perfectamente a las necesidades, restricciones y objetivos dietéticos de cada cliente.",
    },
    {
        id: 3,
        question: "¿Cómo funciona el seguimiento del progreso?",
        answer: "Ofrecemos herramientas intuitivas de seguimiento. Los usuarios pueden registrar su ingesta diaria, actividad física y medidas corporales. El sistema genera gráficos y reportes visuales que facilitan tanto al usuario como al profesional evaluar la efectividad del plan en tiempo real.",
    },
    {
        id: 4,
        question: "¿Necesito ser un profesional de la salud para usar NutriAPP?",
        answer: "No necesariamente. NutriAPP tiene módulos específicos para profesionales (gestión de clientes, creación avanzada de planes) y un módulo para usuarios que solo necesitan seguir y monitorear un plan que ya les ha sido asignado por un experto.",
    },
    {
        id: 5,
        question: "¿Es compatible con dispositivos móviles?",
        answer: "Absolutamente. La plataforma está construida con un enfoque totalmente responsivo (móvil primero), asegurando una experiencia fluida y consistente en cualquier dispositivo, ya sea un smartphone, tablet o escritorio.",
    },
];

// Componente individual de la Pregunta y Respuesta (AccordionItem)
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200">
            {/* Botón de Pregunta */}
            <button
                className="flex justify-between items-center w-full py-4 text-left font-semibold text-gray-900 focus:outline-none"
                onClick={onClick}
            >
                <span>{question}</span>
                {/* Ícono de flecha que rota según el estado */}
                <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {/* Contenido de Respuesta (se muestra con animación simple) */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                }`}
            >
                <p className="text-sm text-gray-700 leading-relaxed pr-6">{answer}</p>
            </div>
        </div>
    );
};


// Componente principal de Preguntas Frecuentes
export default function FAQ() {
    const [openItemId, setOpenItemId] = useState(null);

    const handleItemClick = (id) => {
        setOpenItemId(openItemId === id ? null : id);
    };

    return (
        <div className="min-h-screen pt-16 pb-12 flex flex-col items-center p-4">

            {/* Contenedor Principal Centrado */}
            <main className="w-full max-w-4xl space-y-12">

                {/* Sección Título Principal */}
                <header className="text-center mb-12 border-b border-foreground/10 pb-4">
                    <h1 className="text-5xl font-bold tracking-tight mb-2 text-gray-900">
                        Preguntas Frecuentes (FAQ)
                    </h1>
                    <p className="text-xl text-foreground/70">
                        Resolvemos tus dudas más comunes sobre NutriAPP.
                    </p>
                </header>

                {/* Sección de Acordeón */}
                <section className="bg-white shadow-xl rounded-xl p-6 md:p-8 border border-gray-200">
                    {faqData.map((item) => (
                        <AccordionItem
                            key={item.id}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openItemId === item.id}
                            onClick={() => handleItemClick(item.id)}
                        />
                    ))}
                </section>

                {/* CTA si el usuario no encuentra respuesta */}
                <footer className="text-center pt-8">
                    <p className="text-lg text-foreground/70 mb-4">
                        ¿No encuentras tu respuesta?
                    </p>
                    <button className="bg-gray-900 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-700 transition duration-300">
                        Contáctanos
                    </button>
                </footer>

            </main>
        </div>
    );
}
