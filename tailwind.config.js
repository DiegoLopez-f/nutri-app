// tailwind.config.js (Creado manualmente para WebStorm)

/** @type {import('tailwindcss').Config} */
module.exports = {
    // ESTO ES LO MÁS IMPORTANTE PARA EL IDE:
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Puedes dejar theme y plugins vacíos si no has personalizado nada más
    theme: {
        extend: {},
    },
    plugins: [],
}