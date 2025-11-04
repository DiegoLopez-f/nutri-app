package com.nutri.app.ui.planes

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.nutri.app.data.model.Plan
import com.nutri.app.ui.components.PlanCard
import com.nutri.app.viewmodel.PlanViewModel

@ExperimentalMaterial3Api
@Composable
fun PlanScreen(
    uid: String,
    viewModel: PlanViewModel = viewModel(),
    navController: NavController
) {
    val planes by viewModel.planes.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    LaunchedEffect(uid) {
        viewModel.cargarPlanes(uid)
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Mis Planes") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                // ejemplo: crear plan rápido
                viewModel.crearPlan(
                    uid,
                    Plan(
                        nombre = "Nuevo plan",
                        descripcion = "Plan generado desde la app",
                        fechaAsignacion = System.currentTimeMillis()
                    )
                )
            }) {
                Text("+")
            }
        }
    ) { padding ->
        when {
            isLoading -> Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) { CircularProgressIndicator() }

            errorMessage != null -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) { Text("Error: $errorMessage") }

            planes.isEmpty() -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) { Text("No tienes planes asignados.") }

            else -> LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(planes) { plan ->
                    PlanCard(plan) {
                        navController.navigate("planDetalle/${plan.id}")
                    }
                }
            }
        }
    }
}