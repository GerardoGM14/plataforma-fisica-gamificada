import { useState, useEffect } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react"
import { actualizarRachaDiaria } from "../../utils/actualizarRacha";
// Importar el archivo CSS
import "../login.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isError, setIsError] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMsg("")
    setIsError(false)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      setMsg("Inicio de sesión exitoso ✔️")
      setIsError(false)
      setTimeout(async () => {
        await actualizarRachaDiaria();
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setMsg("Error: " + error.message)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Efecto para crear las burbujas animadas en el fondo
  useEffect(() => {
    const createBubble = () => {
      const bubbleContainer = document.querySelector(".bubble-container")
      if (!bubbleContainer) return

      const bubble = document.createElement("div")
      bubble.className = "bubble"

      // Posición aleatoria
      const size = Math.random() * 60 + 20
      bubble.style.width = `${size}px`
      bubble.style.height = `${size}px`
      bubble.style.left = `${Math.random() * 100}%`
      bubble.style.animationDuration = `${Math.random() * 10 + 10}s`

      bubbleContainer.appendChild(bubble)

      // Eliminar la burbuja después de la animación
      setTimeout(() => {
        if (bubble.parentNode === bubbleContainer) {
          bubbleContainer.removeChild(bubble)
        }
      }, 20000)
    }

    // Crear burbujas iniciales
    for (let i = 0; i < 15; i++) {
      setTimeout(createBubble, i * 300)
    }

    // Crear burbujas periódicamente
    const interval = setInterval(createBubble, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Contenedor de burbujas animadas */}
      <div className="bubble-container"></div>

      <div className="container mx-auto px-4 h-screen flex items-center justify-center relative z-10">
        <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Columna izquierda - Imagen */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 flex flex-col justify-between">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-6">Plataforma de Física Gamificada</h2>
              <p className="text-blue-100 mb-8">
                Aprende física de manera divertida e interactiva con nuestra plataforma educativa gamificada.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-white">Experimentos interactivos</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-white">Sistema de puntos e insignias</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-white">Seguimiento de progreso</p>
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
                    d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="https://api.dicebear.com/6.x/shapes/svg?seed=physics&backgroundColor=2563eb"
                    alt="Física Gamificada"
                    className="w-32 h-32"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="md:w-1/2 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Bienvenido de nuevo</h2>
              <p className="text-gray-500">Ingresa tus credenciales para acceder a tu cuenta</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    {MailIcon ? <MailIcon className="h-5 w-5" /> : "✉️"}
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    {LockIcon ? <LockIcon className="h-5 w-5" /> : "🔒"}
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      EyeOffIcon ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        "👁️‍🗨️"
                      )
                    ) : EyeIcon ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      "👁️"
                    )}
                  </button>
                </div>
              </div>

              {msg && (
                <div className={`p-3 rounded-md ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {msg}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                disabled={isLoading}
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
                  <span className="flex items-center justify-center">Iniciar Sesión</span>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O continúa con</span>
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
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

