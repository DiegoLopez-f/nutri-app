package com.nutri.app.ui.auth

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.auth.FirebaseAuth

@Composable
fun DatosInicialesScreen(
    navController: NavController
) {
    val context = LocalContext.current
    val auth = FirebaseAuth.getInstance()
    val db = FirebaseFirestore.getInstance()

    var peso by remember { mutableStateOf("") }
    var altura by remember { mutableStateOf("") }
    var objetivo by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    val uid = auth.currentUser?.uid ?: return

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Completa tus datos", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedTextField(
            value = peso,
            onValueChange = { peso = it },
            label = { Text("Peso (kg)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = altura,
            onValueChange = { altura = it },
            label = { Text("Altura (m)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = objetivo,
            onValueChange = { objetivo = it },
            label = { Text("Objetivo (ej: ganar masa, bajar grasa)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                if (peso.isBlank() || altura.isBlank() || objetivo.isBlank()) {
                    Toast.makeText(context, "Completa todos los campos", Toast.LENGTH_SHORT).show()
                    return@Button
                }

                isLoading = true

                val updates = mapOf(
                    "peso" to peso.toDoubleOrNull(),
                    "altura" to altura.toDoubleOrNull(),
                    "objetivo" to objetivo,
                    "actualizadoEn" to System.currentTimeMillis()
                )

                db.collection("usuarios").document(uid)
                    .update(updates)
                    .addOnSuccessListener {
                        isLoading = false
                        Toast.makeText(context, "Datos guardados", Toast.LENGTH_SHORT).show()
                        navController.navigate("home") {
                            popUpTo("registro") { inclusive = true }
                        }
                    }
                    .addOnFailureListener { e ->
                        isLoading = false
                        Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
            },
            enabled = !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        ) {
            if (isLoading)
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(22.dp)
                )
            else
                Text("Guardar y continuar")
        }
    }
}