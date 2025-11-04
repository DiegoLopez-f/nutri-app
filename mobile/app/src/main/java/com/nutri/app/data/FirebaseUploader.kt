package com.nutri.app.data

import android.content.Context
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import com.nutri.app.R

object FirebaseUploader {

    fun subirPlanesDesdeJson(context: Context) {
        val db = FirebaseFirestore.getInstance()

        try {
            // Leer archivo desde res/raw/planes.json
            val inputStream = context.resources.openRawResource(R.raw.planes)
            val jsonString = inputStream.bufferedReader().use { it.readText() }
            val root = JSONObject(jsonString)

            // Recorrer cada plan (planA, planB, planC)
            root.keys().forEach { planKey ->
                val planObj = root.getJSONObject(planKey)
                val uidAsignado = planObj.getString("asignadoA")

                val planRef = db.collection("usuarios")
                    .document(uidAsignado)
                    .collection("planes")
                    .document(planKey)

                val planData = mapOf(
                    "nombre" to planObj.getString("nombre"),
                    "descripcion" to planObj.getString("descripcion"),
                    "fecha_asignacion" to System.currentTimeMillis(),
                    "versiones" to planObj.getJSONObject("versiones").toString()
                )

                planRef.set(planData)
                    .addOnSuccessListener {
                        Log.d("Firestore", "✅ Plan $planKey agregado al usuario $uidAsignado")
                    }
                    .addOnFailureListener { e ->
                        Log.e("Firestore", "❌ Error al subir plan $planKey: ${e.message}")
                    }
            }

        } catch (e: Exception) {
            Log.e("Firestore", "Error procesando JSON: ${e.message}")
        }
    }
}