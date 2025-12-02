package com.nutri.app.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun HomeScreen(
    onLogout: () -> Unit,
    onVerPlanes: () -> Unit
) {
    val viewModel: HomeViewModel = viewModel()
    val usuarioState = viewModel.usuario.collectAsState()
    val isLoadingState = viewModel.isLoading.collectAsState()
    val errorState = viewModel.error.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.cargarDatosUsuario()
    }

    Scaffold { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when {
                isLoadingState.value -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                errorState.value != null -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = errorState.value ?: "",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
                else -> {
                    val usuario = usuarioState.value
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Bienvenido, ${usuario.nombre}",
                            style = MaterialTheme.typography.headlineSmall
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text("Peso: ${usuario.peso ?: "-"} kg")
                        Text("Altura: ${usuario.altura ?: "-"} m")
                        Text("Objetivo: ${if (!usuario.objetivo.isNullOrBlank()) usuario.objetivo else "-"}")

                        Spacer(modifier = Modifier.height(24.dp))

                        Button(
                            onClick = { onVerPlanes() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                        ) {
                            Text("Ver Planes")
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedButton(
                            onClick = onLogout,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                        ) {
                            Text("Cerrar sesión")
                        }
                    }
                }
            }
        }
    }
}