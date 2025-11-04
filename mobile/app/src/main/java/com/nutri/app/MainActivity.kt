package com.nutri.app

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.biometric.BiometricPrompt
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.core.content.ContextCompat
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.NavType
import androidx.navigation.navArgument
import com.nutri.app.ui.auth.LoginScreen
import com.nutri.app.ui.auth.RegistroScreen
import com.nutri.app.ui.home.HomeScreen
import com.google.firebase.auth.FirebaseAuth
import com.nutri.app.ui.auth.DatosInicialesScreen
import com.nutri.app.ui.planes.PlanScreen
import java.util.concurrent.Executor
import android.widget.Toast
import androidx.fragment.app.FragmentActivity // <-- ¡Importación necesaria!

// ----------------------------------------------------
// CAMBIADO A FragmentActivity PARA BiometricPrompt
class MainActivity : FragmentActivity() {
// ----------------------------------------------------

    @ExperimentalMaterial3Api
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        showBiometricPrompt()

        setContent {
            val navController = rememberNavController()
            val auth = FirebaseAuth.getInstance()

            // Si ya hay usuario logueado, ir directo al Home
            val startDestination = if (auth.currentUser != null) "home" else "login"

            NavHost(navController = navController, startDestination = startDestination) {
                composable("login") {
                    LoginScreen(
                        onLoginExitoso = {
                            navController.navigate("home") {
                                popUpTo("login") { inclusive = true }
                            }
                        },
                        onIrARegistro = {
                            navController.navigate("registro")
                        }
                    )
                }

                // ---- Pantalla de Registro ----
                composable("registro") {
                    RegistroScreen(
                        onRegistroExitoso = { _, onFinish ->
                            // Ir a la pantalla de datos iniciales después de crear el usuario
                            navController.navigate("datosIniciales") {
                                popUpTo("registro") { inclusive = true }
                            }
                            onFinish() // cerramos el estado de carga desde RegistroScreen
                        },
                        onVolverAlLogin = {
                            navController.popBackStack()
                        }
                    )
                }

                // ---- Pantalla para completar datos iniciales ----
                composable("datosIniciales") {
                    DatosInicialesScreen(navController)
                }

                // ---- Pantalla principal (Home) ----
                composable("home") {
                    HomeScreen(
                        onLogout = {
                            auth.signOut()
                            navController.navigate("login") {
                                popUpTo("home") { inclusive = true }
                            }
                        },
                        onVerPlanes = {
                            val uid = FirebaseAuth.getInstance().currentUser?.uid
                            if (uid != null) {
                                navController.navigate("planes/$uid")
                            }
                        }
                    )
                }

                // ---- Pantalla de Planes ----
                composable(
                    route = "planes/{uid}",
                    arguments = listOf(navArgument("uid") { type = NavType.StringType })
                ) { backStackEntry ->
                    val uid = backStackEntry.arguments?.getString("uid") ?: ""
                    PlanScreen(uid = uid, navController = navController)
                }
            }
        }
    }
    private fun showBiometricPrompt() {
        // Executor para que el callback se ejecute en el hilo principal
        val executor: Executor = ContextCompat.getMainExecutor(this)

        // El constructor ahora es válido porque 'this' es FragmentActivity
        val biometricPrompt = BiometricPrompt(
            this, // Activity (ahora FragmentActivity)
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    showToast("Autenticación exitosa!")
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    showToast("Error: $errString")
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    showToast("Autenticación fallida")
                }
            }
        )

        // Configuración del prompt
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Autenticación biométrica")
            .setSubtitle("Usa huella digital para entrar")
            .setNegativeButtonText("Cancelar")
            .build()

        // El método authenticate ya es reconocido
        biometricPrompt.authenticate(promptInfo)
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}