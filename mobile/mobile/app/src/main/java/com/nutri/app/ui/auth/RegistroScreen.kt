package com.nutri.app.ui.auth

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.nutri.app.data.model.Usuario

@Composable
fun RegistroScreen(
    onRegistroExitoso: (String, () -> Unit) -> Unit, // te devuelve el UID del usuario y un callback de carga completada
    onVolverAlLogin: () -> Unit
) {
    val context = LocalContext.current
    val auth = FirebaseAuth.getInstance()
    val db = FirebaseFirestore.getInstance()

    var nombre by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Crear cuenta", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(20.dp))

        OutlinedTextField(
            value = nombre,
            onValueChange = { nombre = it },
            label = { Text("Nombre completo") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Correo electrónico") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                if (nombre.isBlank() || email.isBlank() || password.isBlank()) {
                    Toast.makeText(context, "Completa todos los campos", Toast.LENGTH_SHORT).show()
                    return@Button
                }

                isLoading = true
                auth.createUserWithEmailAndPassword(email, password)
                    .addOnSuccessListener { result ->
                        val uid = result.user?.uid ?: return@addOnSuccessListener

                        val usuario = Usuario(
                            uid = uid,
                            nombre = nombre,
                            email = email
                        )

                        db.collection("usuarios").document(uid)
                            .set(usuario)
                            .addOnSuccessListener {
                                Toast.makeText(context, "Cuenta creada correctamente", Toast.LENGTH_SHORT).show()
                                onRegistroExitoso(uid) {
                                    isLoading = false
                                }
                            }
                            .addOnFailureListener { e ->
                                Toast.makeText(context, "Error al guardar: ${e.message}", Toast.LENGTH_SHORT).show()
                                isLoading = false
                            }
                    }
                    .addOnFailureListener { e ->
                        Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                        isLoading = false
                    }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading
        ) {
            if (isLoading)
                CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary)
            else
                Text("Registrarse")
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = onVolverAlLogin) {
            Text("¿Ya tienes cuenta? Inicia sesión")
        }
    }
}