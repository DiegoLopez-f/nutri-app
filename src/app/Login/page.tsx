'use client';

import {useState} from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validación de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor ingresa un correo válido');
            setSuccess(false);
            return;
        }

        // Validación de contraseña
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setSuccess(false);
            return;
        }

        // Todo correcto
        setError('');
        setSuccess(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] px-4">
            <div
                className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-md border border-green-200 text-center">

                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    <span className="text-[#059669]">Iniciar</span> Sesión
                </h1>
                <p className="text-gray-600 mb-8">
                    Accede a tu panel personalizado de NutriApp
                </p>

                {/* Formulario */}
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="text-left">
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition duration-200"
                            required
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ADE80] focus:border-transparent transition duration-200"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-left">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-600 text-sm font-semibold text-left">¡Sesión iniciada!</p>
                    )}

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#4ADE80] to-[#059669] text-white font-bold py-2.5 px-7 rounded-full text-sm shadow-md shadow-green-400/40 transition duration-300 transform hover:scale-105 active:scale-95 w-full"
                    >
                        Ingresar
                    </button>
                </form>

            </div>
        </div>
    );
}