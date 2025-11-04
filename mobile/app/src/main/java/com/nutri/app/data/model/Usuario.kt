package com.nutri.app.data.model

data class Usuario(
    val uid: String = "",
    val nombre: String = "",
    val email: String = "",
    val peso: Double? = null,
    val altura: Double? = null,
    val objetivo: String? = null,
    val creadoEn: Long = System.currentTimeMillis(),
    val actualizadoEn: Long = System.currentTimeMillis()
)