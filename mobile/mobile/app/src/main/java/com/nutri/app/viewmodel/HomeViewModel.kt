package com.nutri.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.nutri.app.data.repository.HomeRepository
import com.nutri.app.data.model.Usuario
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HomeViewModel(
    private val repository: HomeRepository = HomeRepository(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) : ViewModel() {

    // Estado principal del usuario
    private val _usuario = MutableStateFlow(Usuario())
    val usuario = _usuario.asStateFlow()

    // Indicador de carga
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    // Manejo de errores
    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    /**
     * Carga los datos del usuario autenticado desde Firestore.
     */
    fun cargarDatosUsuario() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val uid = auth.currentUser?.uid ?: throw Exception("Usuario no autenticado")
                val usuarioData = repository.obtenerUsuario(uid)

                if (usuarioData != null) {
                    _usuario.value = usuarioData
                } else {
                    _error.value = "No se encontraron datos del usuario."
                }

            } catch (e: Exception) {
                _error.value = e.message ?: "Error desconocido al cargar el usuario."
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Cierra sesión y ejecuta una acción posterior (por ejemplo, navegación al login).
     */
    fun cerrarSesion(onLogout: () -> Unit) {
        auth.signOut()
        onLogout()
    }
}