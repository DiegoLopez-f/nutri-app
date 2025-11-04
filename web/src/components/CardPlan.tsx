// components/CardPlan.tsx
interface DistribucionMacros {
    proteina: number;
    carbohidratos: number;
    grasas: number;
}

interface TotalesDiarios {
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    kcal: number;
}

interface CardPlanProps {
    nombre: string;
    tipo: string;
    calorias: number;
    descripcion?: string;
    distribucionMacros?: DistribucionMacros;
    totalesDiarios?: TotalesDiarios;
}

export default function CardPlan({
                                     nombre,
                                     tipo,
                                     calorias,
                                     descripcion,
                                     distribucionMacros,
                                     totalesDiarios
                                 }: CardPlanProps) {
    return (
        <div className="bg-gray-750 border border-gray-600 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{nombre}</h2>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                        tipo === 'Volumen'
                            ? 'bg-green-500 text-white'
                            : 'bg-cyan-500 text-white'
                    }`}>
                        {tipo}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-400">{calorias}</div>
                    <div className="text-gray-400 text-sm">kcal totales</div>
                </div>
            </div>

            {descripcion && (
                <p className="text-gray-300 mb-4">{descripcion}</p>
            )}

            {/* Distribución de Macros */}
            {distribucionMacros && (
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Distribución de Macros</h4>
                    <div className="flex gap-4 text-sm">
                        <div className="text-green-400">
                            <span className="font-bold">{distribucionMacros.proteina}%</span> Proteína
                        </div>
                        <div className="text-yellow-400">
                            <span className="font-bold">{distribucionMacros.carbohidratos}%</span> Carbohidratos
                        </div>
                        <div className="text-red-400">
                            <span className="font-bold">{distribucionMacros.grasas}%</span> Grasas
                        </div>
                    </div>
                </div>
            )}

            {/* Totales Diarios */}
            {totalesDiarios && (
                <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Totales Diarios</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-green-400 font-bold">{totalesDiarios.proteinas}g</div>
                            <div className="text-gray-400 text-xs">Proteínas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-yellow-400 font-bold">{totalesDiarios.carbohidratos}g</div>
                            <div className="text-gray-400 text-xs">Carbohidratos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-red-400 font-bold">{totalesDiarios.grasas}g</div>
                            <div className="text-gray-400 text-xs">Grasas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-indigo-400 font-bold">{totalesDiarios.kcal}</div>
                            <div className="text-gray-400 text-xs">Calorías</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}