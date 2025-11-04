// src/__tests__/fetchPlanesMock.test.ts
import { fetchPlanesMock } from "@/utils/fetchPlanesMock";

describe("fetchPlanesMock", () => {
    it("debe devolver una lista de planes simulados", async () => {
        const planes = await fetchPlanesMock();
        expect(Array.isArray(planes)).toBe(true);
        expect(planes.length).toBeGreaterThan(0);
    });

    it("cada plan debe tener un id, nombre y versiones", async () => {
        const planes = await fetchPlanesMock();
        for (const plan of planes) {
            expect(plan).toHaveProperty("id");
            expect(plan).toHaveProperty("nombre");
            expect(plan).toHaveProperty("versiones");
        }
    });

    it("el primer plan debe tener versión de volumen", async () => {
        const planes = await fetchPlanesMock();
        expect(planes[0].versiones.volumen?.calorias).toBe(2800);
    });

    /*it("debería fallar porque el primer plan no tiene 9999 calorías", async () => {
        const planes = await fetchPlanesMock();
        expect(planes[0].versiones.volumen?.calorias).toBe(9999); // valor incorrecto intencionalmente
    });*/
});