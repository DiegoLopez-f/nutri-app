"use client";
import Link from "next/link";

export default function DashboardNutricionista() {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Dashboard Nutricionista</h1>
            <p>Bienvenido, aquí podrás ver tus planes y pacientes.</p>
            <div style={{ marginTop: "1rem" }}>
                <Link href="/nutricionista/planes">
                    <button style={{ padding: "0.5rem 1rem", marginRight: "1rem" }}>Ver Planes</button>
                </Link>
                <Link href="/nutricionista/pacientes">
                    <button style={{ padding: "0.5rem 1rem" }}>Ver Pacientes</button>
                </Link>
            </div>
        </div>
    );
}