package com.nutri.app.viewmodel

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.nutri.app.data.model.Usuario
import com.nutri.app.data.repository.HomeRepository
import com.nutri.app.ui.home.HomeViewModel
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@OptIn(ExperimentalCoroutinesApi::class)
class HomeViewModelTest {

    // 1. Mocks de las dependencias
    private val repository: HomeRepository = mockk()
    private val auth: FirebaseAuth = mockk()
    private val firebaseUser: FirebaseUser = mockk()

    // Dispatcher para corrutinas
    private val testDispatcher = StandardTestDispatcher()

    @BeforeEach
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @AfterEach
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `cargarDatosUsuario actualiza el estado con datos del usuario si la carga es exitosa`() = runTest {
        // GIVEN (Dado)
        val uid = "12345"
        val usuarioEsperado = Usuario(nombre = "Diego", email = "test@nutri.app")

        // Simulamos comportamiento de Firebase
        every { auth.currentUser } returns firebaseUser
        every { firebaseUser.uid } returns uid

        // Simulamos comportamiento del Repositorio (suspend fun)
        coEvery { repository.obtenerUsuario(uid) } returns usuarioEsperado

        // Instanciamos el ViewModel con los mocks
        val viewModel = HomeViewModel(repository, auth)

        // WHEN (Cuando)
        viewModel.cargarDatosUsuario()
        testDispatcher.scheduler.advanceUntilIdle() // Ejecuta las corrutinas pendientes

        // THEN (Entonces) - Aserciones con Kotest
        viewModel.usuario.value shouldBe usuarioEsperado
        viewModel.isLoading.value shouldBe false
        viewModel.error.value shouldBe null
    }

    @Test
    fun `cargarDatosUsuario maneja el error cuando el usuario no esta autenticado`() = runTest {
        // GIVEN
        every { auth.currentUser } returns null // No hay usuario logueado

        val viewModel = HomeViewModel(repository, auth)

        // WHEN
        viewModel.cargarDatosUsuario()
        testDispatcher.scheduler.advanceUntilIdle()

        // THEN
        viewModel.error.value shouldBe "Usuario no autenticado"
        viewModel.isLoading.value shouldBe false
    }

}