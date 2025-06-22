import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom"
import { doc, setDoc } from "firebase/firestore"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Validación de contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const validatePassword = (password) => {
    setPasswordStrength({
      length: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    validatePassword(newPassword)
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setMsg("Las contraseñas no coinciden")
      setIsError(true)
      return
    }

    setIsLoading(true)
    setMsg("")
    setIsError(false)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        correo: user.email,
        fechaRegistro: new Date(),
        rol: "usuario",
        puntaje: 0,
        insignias: [],
        avatar: `https://api.dicebear.com/6.x/thumbs/svg?seed=${user.uid}`, // avatar basado en UID para consistencia
      })

      setMsg("Usuario registrado correctamente ✔️")
      setIsError(false)

      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate("/perfil")
      }, 1500)
    } catch (error) {
      let errorMessage = "Error desconocido"

      // Mensajes de error más amigables
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil"
      } else {
        errorMessage = error.message
      }

      setMsg("Error: " + errorMessage)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Fondo con elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-64 h-64 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex items-center justify-center relative z-10">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Columna izquierda - Formulario */}
          <div className="md:w-1/2 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Crea tu cuenta</h2>
              <p className="text-gray-500">Únete a nuestra plataforma de física gamificada</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    ✉️
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    🔒
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>

                {/* Indicador de fortaleza de contraseña */}
                {password && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div
                      className={`flex items-center ${passwordStrength.length ? "text-green-600" : "text-gray-400"}`}
                    >
                      {passwordStrength.length ? "✅" : "❌"} Al menos 6 caracteres
                    </div>
                    <div
                      className={`flex items-center ${passwordStrength.hasNumber ? "text-green-600" : "text-gray-400"}`}
                    >
                      {passwordStrength.hasNumber ? "✅" : "❌"} Al menos un número
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordStrength.hasSpecial ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {passwordStrength.hasSpecial ? "✅" : "❌"} Al menos un carácter especial
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    🔒
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      confirmPassword && password !== confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <div className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</div>
                  )}
                </div>
              </div>

              {msg && (
                <div className={`p-3 rounded-md ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {msg}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                disabled={isLoading || (confirmPassword && password !== confirmPassword)}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O regístrate con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  type="button"
                  className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-6">
                ¿Ya tienes cuenta?{" "}
                <Link to="/" className="font-medium text-purple-600 hover:text-purple-800 hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Columna derecha - Imagen/Información */}
          <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-800 p-8 flex flex-col justify-between">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">Únete a la aventura</h2>
              <p className="text-purple-100 mb-8">
                Descubre una nueva forma de aprender física a través de juegos, retos y recompensas.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-white">Gana insignias y recompensas</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-white">Sube de nivel y desbloquea contenido</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <p className="text-white">Compite con otros estudiantes</p>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="w-full h-48 relative">
                <svg
                  className="absolute bottom-0 left-0 w-full"
                  viewBox="0 0 1440 320"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#ffffff"
                    fillOpacity="0.2"
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,186.7C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 bg-purple-400 rounded-full opacity-20 animate-ping"></div>
                    <img
                      src="https://api.dicebear.com/6.x/shapes/svg?seed=physics&backgroundColor=7c3aed"
                      alt="Física Gamificada"
                      className="relative w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register