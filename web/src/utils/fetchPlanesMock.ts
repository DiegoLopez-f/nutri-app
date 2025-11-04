// src/utils/fetchPlanesMock.ts
export async function fetchPlanesMock() {
    return [
        {
            id: "plan_a",
            nombre: "Plan A",
            versiones: {
                volumen: { calorias: 2800 },
                recomposicion: { calorias: 2200 },
            },
        },
    ];
}