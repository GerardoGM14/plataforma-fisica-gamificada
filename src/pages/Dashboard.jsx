"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../firebase"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { Link, useNavigate } from "react-router-dom"

function Dashboard() {
  const [user] = useAuthState(auth)
  const [progresoGeneral, setProgresoGeneral] = useState(0)
  const [ejerciciosCompletados, setEjerciciosCompletados] = useState(0)
  const [totalEjercicios, setTotalEjercicios] = useState(0)
  const [evaluacionesHechas, setEvaluacionesHechas] = useState(0)
  const [userData, setUserData] = useState(null)
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("modulos")
  const navigate = useNavigate()

  // Estados para el leaderboard
  const [topUsuarios, setTopUsuarios] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)

  // Función para cargar top usuarios
  const cargarTopUsuarios = async () => {
    try {
      setLoadingLeaderboard(true)
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"))
      const usuariosList = usuariosSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((usuario) => usuario.puntaje > 0) // Solo usuarios con puntaje
        .sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0)) // Ordenar por puntaje descendente
        .slice(0, 3) // Solo top 3

      setTopUsuarios(usuariosList)
    } catch (error) {
      console.error("Error al cargar top usuarios:", error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  useEffect(
    () => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            // Cargar datos del usuario
            const ref = doc(db, "usuarios", currentUser.uid)
            const snapshot = await getDoc(ref)
            if (snapshot.exists()) {
              setUserData(snapshot.data())
            }

            // Cargar módulos
            const modulosSnapshot = await getDocs(collection(db, "modulos"))
            const modulosLista = modulosSnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((modulo) => modulo.activo === true) // solo módulos activos
            setModulos(modulosLista)

            // Cargar Progreso
            const cargarProgreso = async () => {
              if (!user) return

              const progresoRef = collection(db, "usuarios", user.uid, "progreso")
              const snapshot = await getDocs(progresoRef)

              let correctas = 0
              let total = 0
              let evaluaciones = 0

              snapshot.forEach((doc) => {
                const data = doc.data()
                correctas += data.preguntasCorrectas || 0
                total += data.totalPreguntas || 0
                if (data.totalPreguntas > 0) evaluaciones++
              })

              setEjerciciosCompletados(correctas)
              setTotalEjercicios(total)
              setEvaluacionesHechas(evaluaciones)
              setProgresoGeneral(total > 0 ? Math.round((correctas / total) * 100) : 0)
            }
            cargarProgreso()

            // Cargar top usuarios
            cargarTopUsuarios()
          } catch (error) {
            console.error("Error al cargar datos:", error)
          } finally {
            setLoading(false)
          }
        } else {
          // Usuario no autenticado, redirigir al login
          navigate("/")
        }
      })

      return () => unsubscribe()
    },
    [navigate],
    [user],
  )

  // Calcular nivel basado en puntaje
  const calcularNivel = (puntaje) => {
    return Math.floor(puntaje / 100) + 1
  }

  // Calcular progreso hacia el siguiente nivel
  const calcularProgreso = (puntaje) => {
    const nivelActual = calcularNivel(puntaje)
    const puntajeNivelActual = (nivelActual - 1) * 100
    const puntajeNivelSiguiente = nivelActual * 100
    return ((puntaje - puntajeNivelActual) / (puntajeNivelSiguiente - puntajeNivelActual)) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error de acceso</h2>
          <p className="text-gray-600 mb-4">No se pudieron cargar tus datos. Por favor, inicia sesión nuevamente.</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const nivel = calcularNivel(userData.puntaje || 0)
  const progreso = calcularProgreso(userData.puntaje || 0)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Barra de navegación superior */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">Física Gamificada</div>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => setActiveTab("modulos")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "modulos"
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                Módulos
              </button>
              <button
                onClick={() => setActiveTab("progreso")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "progreso"
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                Mi Progreso
              </button>
              <button
                onClick={() => setActiveTab("insignias")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "insignias"
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                Insignias
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1">
              <span className="text-yellow-300 mr-1">⭐</span>
              <span className="font-medium">{userData.puntaje || 0} pts</span>
            </div>
            <div className="flex items-center">
              <div
                onClick={() => navigate("/perfil")}
                className="flex items-center cursor-pointer hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
                role="button"
                aria-label="Ver perfil"
              >
                <img
                  src={userData.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${userData.correo}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <div className="ml-2">
                  <p className="text-sm font-medium truncate max-w-[150px]">{userData.correo}</p>
                  <p className="text-xs text-blue-200 flex items-center">
                    <span>Nivel {nivel}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs para móvil */}
      <div className="md:hidden bg-white border-b px-4 py-2 flex justify-between overflow-x-auto">
        <button
          onClick={() => setActiveTab("modulos")}
          className={`px-3 py-1 text-sm font-medium whitespace-nowrap ${
            activeTab === "modulos" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Módulos
        </button>
        <button
          onClick={() => setActiveTab("progreso")}
          className={`px-3 py-1 text-sm font-medium whitespace-nowrap ${
            activeTab === "progreso" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Mi Progreso
        </button>
        <button
          onClick={() => setActiveTab("insignias")}
          className={`px-3 py-1 text-sm font-medium whitespace-nowrap ${
            activeTab === "insignias" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Insignias
        </button>
      </div>

      {/* Contenido principal */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Tarjeta de bienvenida */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="md:flex">
            <div className="p-6 md:w-2/3">
              <h1 className="text-2xl font-bold text-white mb-2">¡Bienvenido de nuevo!</h1>
              <p className="text-blue-100 mb-4">
                Continúa tu aprendizaje en física y sigue acumulando puntos para subir de nivel.
              </p>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex justify-between text-white mb-1">
                  <span>Nivel {nivel}</span>
                  <span>Nivel {nivel + 1}</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2.5">
                  <div className="bg-yellow-300 h-2.5 rounded-full" style={{ width: `${progreso}%` }}></div>
                </div>
                <p className="text-white text-sm mt-2">
                  {userData.puntaje || 0} / {nivel * 100} puntos para el siguiente nivel
                </p>
              </div>
            </div>
            <div className="md:w-1/3 bg-white/10 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 text-white text-3xl font-bold mb-2">
                  {nivel}
                </div>
                <p className="text-white font-medium">Tu nivel actual</p>
                <p className="text-blue-100 text-sm">{userData.insignias?.length || 0} insignias obtenidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Componente de Racha Diaria */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center">
            <div className="text-3xl mr-3">🔥</div>
            <div>
              <h3 className="text-lg font-bold">Racha Diaria</h3>
              <div className="flex space-x-6 mt-1">
                <p className="text-gray-700">
                  <span className="font-medium">Racha actual:</span> {userData.rachaActual || 0} días
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Racha máxima:</span> {userData.rachaMaxima || 0} días
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Usuarios - Leaderboard */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">🏆 Top Estudiantes</h2>
                <p className="text-purple-100">Los usuarios con mayor puntaje</p>
              </div>
            </div>

            {loadingLeaderboard ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white ml-3">Cargando ranking...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topUsuarios.map((usuario, index) => {
                  const maxPuntaje = topUsuarios[0]?.puntaje || 1
                  const porcentaje = (usuario.puntaje / maxPuntaje) * 100
                  const posicion = index + 1

                  return (
                    <div key={usuario.id} className="relative group">
                      {/* Posición */}
                      <div
                        className={`absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          posicion === 1 ? "bg-yellow-500" : posicion === 2 ? "bg-gray-400" : "bg-orange-600"
                        }`}
                      >
                        {posicion}
                      </div>

                      {/* Barra animada */}
                      <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                        <div className="text-center mb-3">
                          {/* Avatar con tooltip */}
                          <div className="relative inline-block group">
                            <img
                              src={usuario.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${usuario.correo}`}
                              alt={`Avatar de ${usuario.correo}`}
                              className="w-16 h-16 rounded-full border-4 border-white shadow-lg mx-auto mb-2 transition-transform duration-300 group-hover:scale-110"
                            />
                            {/* Tooltip con nombre */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                              {usuario.nombre || usuario.correo}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                            </div>
                          </div>
                        </div>

                        {/* Información del usuario */}
                        <div className="text-center text-white">
                          <p className="font-bold text-lg">{usuario.puntaje || 0}</p>
                          <p className="text-sm text-purple-100">puntos</p>
                          <p className="text-xs text-purple-200 mt-1">Nivel {calcularNivel(usuario.puntaje || 0)}</p>
                        </div>

                        {/* Barra de progreso animada */}
                        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              posicion === 1
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                : posicion === 2
                                  ? "bg-gradient-to-r from-gray-300 to-gray-500"
                                  : "bg-gradient-to-r from-orange-400 to-orange-600"
                            }`}
                            style={{
                              width: `${porcentaje}%`,
                              animationDelay: `${index * 200}ms`,
                            }}
                          ></div>
                        </div>

                        {/* Medalla para el primer lugar */}
                        {posicion === 1 && <div className="absolute -top-1 -right-1 text-2xl animate-bounce">👑</div>}
                      </div>
                    </div>
                  )
                })}

                {/* Mensaje si no hay suficientes usuarios */}
                {topUsuarios.length === 0 && (
                  <div className="col-span-full text-center text-white py-8">
                    <div className="text-4xl mb-2">🏆</div>
                    <p className="text-lg font-medium">¡Sé el primero en el ranking!</p>
                    <p className="text-purple-100">Completa módulos para aparecer aquí</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenido basado en la pestaña activa */}
        {activeTab === "modulos" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Módulos Disponibles </h2>
              <div className="text-sm text-gray-500">{modulos.length} módulos</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulos.map((modulos) => (
                <div
                  key={modulos.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${
                        modulos.imagenUrl ||
                        `https://api.dicebear.com/6.x/shapes/svg?seed=${modulos.titulo}&backgroundColor=4f46e5`
                      })`,
                    }}
                  ></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{modulos.titulo}</h3>
                      {modulos.dificultad && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            modulos.dificultad === "Fácil"
                              ? "bg-green-100 text-green-800"
                              : modulos.dificultad === "Medio"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {modulos.dificultad}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{modulos.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {modulos.lecciones ? `${modulos.lecciones} lecciones` : ""}
                      </div>
                      <Link
                        to={`/modulo/${modulos.id}`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Ingresar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {modulos.length === 0 && (
                <div className="col-span-full bg-white rounded-lg p-8 text-center">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No hay módulos disponibles</h3>
                  <p className="text-gray-600">
                    Pronto añadiremos nuevos módulos para que puedas continuar tu aprendizaje.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "progreso" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tu progreso</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl text-blue-600 mb-2">🏆</div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Puntaje total</h3>
                <p className="text-3xl font-bold text-gray-900">{userData.puntaje || 0}</p>
                <p className="text-sm text-gray-500 mt-1">puntos acumulados</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl text-blue-600 mb-2">🎯</div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Nivel actual</h3>
                <p className="text-3xl font-bold text-gray-900">{nivel}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(progreso)}% hacia el nivel {nivel + 1}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl text-blue-600 mb-2">🏅</div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Insignias</h3>
                <p className="text-3xl font-bold text-gray-900">{userData.insignias?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-1">insignias obtenidas</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Estadísticas de aprendizaje</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progreso general</span>
                    <span className="text-sm font-medium text-gray-700">{progresoGeneral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progresoGeneral}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Ejercicios completados</span>
                    <span className="text-sm font-medium text-gray-700">
                      {ejerciciosCompletados}/{totalEjercicios}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${totalEjercicios > 0 ? (ejerciciosCompletados / totalEjercicios) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Evaluaciones</span>
                    <span className="text-sm font-medium text-gray-700">{evaluacionesHechas}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{ width: `${(evaluacionesHechas / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "insignias" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tus insignias</h2>

            {userData.insignias && userData.insignias.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userData.insignias.map((insignia, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-blue-100 rounded-full text-2xl">
                      {insignia.emoji || "🏆"}
                    </div>
                    <h3 className="font-medium text-gray-800">{insignia.nombre || `Insignia ${index + 1}`}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {insignia.fecha
                        ? new Date(insignia.fecha.seconds * 1000).toLocaleDateString()
                        : "Obtenida recientemente"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">🏅</div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Aún no tienes insignias</h3>
                <p className="text-gray-600 mb-4">
                  Completa módulos y actividades para ganar insignias y mostrarlas aquí.
                </p>
                <button
                  onClick={() => setActiveTab("modulos")}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Explorar módulos
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pie de página */}
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 Plataforma de Física Gamificada. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
