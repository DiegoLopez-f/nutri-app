package com.nutri.app.ui.planes

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.nutri.app.viewmodel.PlanViewModel
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api

@ExperimentalMaterial3Api
@Composable
fun PlanDetalleScreen(
    planId: String,
    navController: NavController,
    planViewModel: PlanViewModel = viewModel()
) {
    val plans by planViewModel.planes.collectAsState(initial = emptyList())
    val plan = plans.find { it.id == planId }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = plan?.nombre ?: "Detalle del Plan") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Regresar"
                        )
                    }
                },
                colors = TopAppBarDefaults.smallTopAppBarColors()
            )
        }
    ) { paddingValues ->
        if (plan == null) {
            Column(modifier = Modifier.padding(paddingValues).padding(16.dp)) {
                Text(text = "Plan no encontrado", style = MaterialTheme.typography.bodyLarge)
            }
        } else {
            LazyColumn(modifier = Modifier.padding(paddingValues).padding(16.dp)) {
                item {
                    Text(text = plan.nombre, style = MaterialTheme.typography.headlineMedium)
                    Text(
                        text = plan.descripcion,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(top = 8.dp, bottom = 16.dp)
                    )
                }
                items(plan.versiones.entries.toList()) { version ->
                    Text(
                        text = "Versión: ${version.value.tipo}",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    version.value.comidas.forEach { comida ->
                        Text(
                            text = "- ${comida.nombre}: ${comida.descripcion}",
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(start = 8.dp, bottom = 4.dp)
                        )
                    }
                    Text(
                        text = "Macros: Proteínas ${version.value.totalesDiarios["proteinas"] ?: 0}g, Grasas ${version.value.totalesDiarios["grasas"] ?: 0}g, Carbohidratos ${version.value.totalesDiarios["carbohidratos"] ?: 0}g",
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(start = 8.dp, bottom = 12.dp)
                    )
                }
            }
        }
    }
}
