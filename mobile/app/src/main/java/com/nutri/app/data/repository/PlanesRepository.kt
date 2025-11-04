package com.nutri.app.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.nutri.app.data.model.Plan
import kotlinx.coroutines.tasks.await

class PlanesRepository {

    private val db = FirebaseFirestore.getInstance()

    // Obtener todos los planes de un usuario
    suspend fun obtenerPlanes(uid: String): List<Plan> {
        return try {
            val snapshot = db.collection("usuarios")
                .document(uid)
                .collection("planes")
                .get()
                .await()

            snapshot.documents.mapNotNull { doc ->
                doc.toObject(Plan::class.java)?.copy(id = doc.id)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    // Crear un nuevo plan dentro del usuario autenticado
    suspend fun crearPlan(uid: String, plan: Plan) {
        try {
            db.collection("usuarios")
                .document(uid)
                .collection("planes")
                .add(plan)
                .await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Obtener un plan específico
    suspend fun obtenerPlanPorId(uid: String, planId: String): Plan? {
        return try {
            val doc = db.collection("usuarios")
                .document(uid)
                .collection("planes")
                .document(planId)
                .get()
                .await()

            doc.toObject(Plan::class.java)?.copy(id = planId)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}