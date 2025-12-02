package com.nutri.app.data

import android.content.Context
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import com.nutri.app.R
import kotlinx.coroutines.tasks.await

object FirebaseUploader {

    // Convierte JSONObject a Map
    // Esto es para que los objetos anidados se suban como Mapas de Firestore
    private fun JSONObject.toMap(): Map<String, Any> {
        val map = mutableMapOf<String, Any>()
        val keysItr: Iterator<String> = this.keys()
        while (keysItr.hasNext()) {
            val key = keysItr.next()
            var value: Any = this.get(key)

            when (value) {
                is JSONObject -> value = value.toMap() // Mapea objetos anidados
                is org.json.JSONArray -> value = value.toList() // 💡 CORRECCIÓN: Convierte arrays anidados
                // Nota: El 'value' se mantiene como el tipo base (String, Int, Boolean, etc.) si no es Object/Array
            }
            map[key] = value
        }
        return map
    }

    // 💡 NUEVA FUNCIÓN AUXILIAR para convertir JSONArray a List
    private fun org.json.JSONArray.toList(): List<Any> {
        val list = mutableListOf<Any>()
        for (i in 0 until this.length()) {
            var value: Any = this.get(i)
            when (value) {
                is JSONObject -> value = value.toMap() // Mapea objetos dentro de la lista
                is org.json.JSONArray -> value = value.toList() // Mapea listas dentro de la lista
            }
            list.add(value)
        }
        return list
    }

    suspend fun subirPlanesDesdeJson(context: Context) {
        val db = FirebaseFirestore.getInstance()
        try {
            val inputStream = context.resources.openRawResource(R.raw.planes)
            val jsonString = inputStream.bufferedReader().use { it.readText() }
            val root = JSONObject(jsonString)
            root.keys().forEach { planKey ->
                val planObj = root.getJSONObject(planKey)
                val uidAsignado = planObj.getString("asignadoA")
                val planRef = db.collection("usuarios")
                    .document(uidAsignado)
                    .collection("planes")
                    .document(planKey)
                val versionesMap = planObj.getJSONObject("versiones").toMap()
                val planData = mutableMapOf<String, Any>(
                    "nombre" to planObj.getString("nombre"),
                    "descripcion" to planObj.getString("descripcion"),
                    "fecha_asignacion" to System.currentTimeMillis(),
                    "versiones" to versionesMap
                )
                try {
                    planRef.set(planData).await()
                    Log.d("Firestore", "✅ Plan $planKey agregado al usuario $uidAsignado")
                } catch (e: Exception) {
                    Log.e("Firestore", "❌ Error al subir plan $planKey: ${e.message}")
                }
            }
        } catch (e: Exception) {
            Log.e("Firestore", "Error procesando JSON: ${e.message}")
        }
    }
}