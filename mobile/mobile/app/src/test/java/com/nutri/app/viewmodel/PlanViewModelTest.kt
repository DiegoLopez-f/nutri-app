package com.nutri.app.viewmodel

import android.util.Log
import com.nutri.app.data.model.Plan
import com.nutri.app.data.repository.PlanesRepository
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.just
import io.mockk.Runs
import io.mockk.unmockkAll
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.AfterEachCallback
import org.junit.jupiter.api.extension.BeforeEachCallback
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.extension.ExtensionContext

// 1. Usamos @ExtendWith en lugar de @Rule para Corrutinas en JUnit 5
@ExperimentalCoroutinesApi
@ExtendWith(MainDispatcherExtension::class)
class PlanViewModelTest {

    // 2. Mocks
    private lateinit var repository: PlanesRepository
    private lateinit var viewModel: PlanViewModel

    @BeforeEach // Nota: En JUnit 5 es @BeforeEach, no @Before
    fun setUp() {
        // Mockeamos la clase Log de Android
        mockkStatic(Log::class)
        every { Log.d(any(), any()) } returns 0

        // Inicializamos mocks
        repository = mockk()
        viewModel = PlanViewModel(repository)
    }

    @AfterEach
    fun tearDown() {
        // Limpiamos los mocks estáticos después de cada test
        unmockkAll()
    }

    @Test
    fun `cargarPlanes actualiza lista de planes cuando es exitoso`() = runTest {
        // GIVEN
        val uid = "user123"
        val planesDummy = listOf(
            Plan(id = "1", nombre = "Plan Keto"),
            Plan(id = "2", nombre = "Plan Vegano")
        )
        coEvery { repository.obtenerPlanes(uid) } returns planesDummy

        // WHEN
        viewModel.cargarPlanes(uid)
        advanceUntilIdle() // Esperamos a que termine la corrutina

        // THEN
        assertEquals(planesDummy, viewModel.planes.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.errorMessage.value)
    }

    @Test
    fun `cargarPlanes maneja errores y actualiza errorMessage`() = runTest {
        // GIVEN
        val uid = "user123"
        val mensajeError = "Error de conexión"
        coEvery { repository.obtenerPlanes(uid) } throws Exception(mensajeError)

        // WHEN
        viewModel.cargarPlanes(uid)
        advanceUntilIdle()

        // THEN
        assertTrue(viewModel.planes.value.isEmpty())
        assertEquals(mensajeError, viewModel.errorMessage.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `crearPlan llama al repositorio exitosamente`() = runTest {
        // GIVEN
        val uid = "user123"
        val nuevoPlan = Plan(id = "3", nombre = "Plan Ayuno")
        coEvery { repository.crearPlan(uid, nuevoPlan) } just Runs

        // WHEN
        viewModel.crearPlan(uid, nuevoPlan)
        advanceUntilIdle()

        // THEN
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.errorMessage.value)
    }

    @Test
    fun `crearPlan maneja errores y actualiza errorMessage`() = runTest {
        // GIVEN: Simulamos que el repositorio falla al guardar
        val uid = "user123"
        val nuevoPlan = Plan(id = "3", nombre = "Plan Fallido")
        val errorMsg = "No se pudo guardar"
        coEvery { repository.crearPlan(uid, nuevoPlan) } throws Exception(errorMsg)

        // WHEN: Intentamos crear el plan
        viewModel.crearPlan(uid, nuevoPlan)
        advanceUntilIdle()

        // THEN: Verificamos que se guardó el mensaje de error
        assertEquals(errorMsg, viewModel.errorMessage.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `cargarPlanes maneja lista vacia correctamente`() = runTest {
        // GIVEN: El repositorio no devuelve nada (lista vacía)
        val uid = "userNuevo"
        coEvery { repository.obtenerPlanes(uid) } returns emptyList()

        // WHEN: Cargamos los planes
        viewModel.cargarPlanes(uid)
        advanceUntilIdle()

        // THEN: La lista en el ViewModel debe estar vacía (0 elementos)
        assertTrue(viewModel.planes.value.isEmpty())
        assertNull(viewModel.errorMessage.value)
    }
}

// -------------------------------------------------------------------
// Extensión para JUnit 5 (Reemplaza a la Rule de JUnit 4)
// Copia esto al final del archivo o en un archivo separado en test/
// -------------------------------------------------------------------
@ExperimentalCoroutinesApi
class MainDispatcherExtension(
    private val testDispatcher: TestDispatcher = StandardTestDispatcher()
) : BeforeEachCallback, AfterEachCallback {

    override fun beforeEach(context: ExtensionContext?) {
        Dispatchers.setMain(testDispatcher)
    }

    override fun afterEach(context: ExtensionContext?) {
        Dispatchers.resetMain()
    }
}