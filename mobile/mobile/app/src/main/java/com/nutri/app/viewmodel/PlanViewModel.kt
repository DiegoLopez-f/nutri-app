package com.nutri.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nutri.app.data.model.Plan
import com.nutri.app.data.repository.PlanesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import android.util.Log

class PlanViewModel(private val repository: PlanesRepository = PlanesRepository()) : ViewModel() {

    private val _planes = MutableStateFlow<List<Plan>>(emptyList())
    val planes: StateFlow<List<Plan>> = _planes

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    fun cargarPlanes(uid: String) {
        Log.d("PlanViewModel", "cargarPlanes called with uid: $uid")
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val planes = repository.obtenerPlanes(uid)
                _planes.value = planes
                Log.d("PlanViewModel", "Loaded ${planes.size} plans for uid: $uid")
                _errorMessage.value = null
            } catch (e: Exception) {
                _errorMessage.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun crearPlan(uid: String, plan: Plan) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                repository.crearPlan(uid, plan)
                _errorMessage.value = null
            } catch (e: Exception) {
                _errorMessage.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
}