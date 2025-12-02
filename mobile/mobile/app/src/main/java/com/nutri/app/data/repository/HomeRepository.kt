package com.nutri.app.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.nutri.app.data.model.Usuario
import kotlinx.coroutines.tasks.await

class HomeRepository(private val db: FirebaseFirestore = FirebaseFirestore.getInstance()) {

    suspend fun obtenerUsuario(uid: String): Usuario? {
        val snapshot = db.collection("usuarios").document(uid).get().await()
        return snapshot.toObject(Usuario::class.java)
    }
}