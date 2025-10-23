import ButtonRole from './ButtonRole';

export default function CardHome() {
    return (
        <div className="w-full max-w-lg bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl border border-gray-700 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                <span className="text-indigo-400">Nutri</span>App
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-xs mx-auto">
                Sistema colaborativo para la gestión de planes nutricionales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <ButtonRole href="/nutricionista" label="Nutricionista" color="primary" />
                <ButtonRole href="/paciente" label="Paciente" color="secondary" />
            </div>
        </div>
    );
}