package com.nutri.app.data.model

data class Plan(
    val id: String = "",                        // ID del plan (documento en Firestore)
    val nombre: String = "",
    val descripcion: String = "",
    val asignadoA: String = "",                 // UID del usuario
    val fechaAsignacion: Long? = null,          // Timestamp
    val versiones: Map<String, Version> = emptyMap()  // “volumen”, “recomposicion”, etc.
) {
    constructor() : this("", "", "", "", null, emptyMap())
}

data class Version(
    val tipo: String = "",                      // “Volumen”, “Recomposición”, etc.
    val calorias: Int = 0,
    val distribucionMacros: Map<String, Int> = emptyMap(),  // {proteina, carbohidratos, grasas}
    val objetivo: String = "",
    val comidas: List<Comida> = emptyList(),
    val totalesDiarios: Map<String, Int> = emptyMap(),      // {proteinas, carbohidratos, grasas, kcal}
    val notasTecnicas: List<String> = emptyList()
)

data class Comida(
    val nombre: String = "",
    val descripcion: String = "",
    val alimentos: List<AlimentoPlan> = emptyList(),
    val macros: Map<String, Int> = emptyMap()                // {proteinas, carbohidratos, grasas, kcal}
)

data class AlimentoPlan(
    val refAlimento: String = "",     // referencia al documento en “alimentos”
    val cantidad: String = ""         // ej: “100 g” o “1 unidad”
)