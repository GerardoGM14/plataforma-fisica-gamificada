import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../../firebase"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"

function Perfil() {
  const [userData, setUserData] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: "", message: "" })
  const [activeTab, setActiveTab] = useState("general")
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    avatar: "",
    rol: "",
    universidad: "",
    carrera: "",
    semestre: "",
    biografia: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          const ref = doc(db, "usuarios", currentUser.uid)
          const snapshot = await getDoc(ref)
          if (snapshot.exists()) {
            const data = snapshot.data()
            setUserData(data)
            setFormData({
              nombre: data.nombre || "",
              correo: data.correo || "",
              avatar: data.avatar || "",
              rol: data.rol || "",
              universidad: data.universidad || "",
              carrera: data.carrera || "",
              semestre: data.semestre || "",
              biografia: data.biografia || "",
            })
          }
        } else {
          // Usuario no autenticado, redirigir al login
          navigate("/")
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        showNotification("error", "Error al cargar los datos del perfil")
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [navigate])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const guardarCambios = async () => {
    try {
      setSaving(true)
      const currentUser = auth.currentUser
      const ref = doc(db, "usuarios", currentUser.uid)

      // Solo actualizamos los campos que han cambiado
      const updatedFields = {}
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== userData[key]) {
          updatedFields[key] = formData[key]
        }
      })

      await updateDoc(ref, updatedFields)

      setUserData({
        ...userData,
        ...updatedFields,
      })

      showNotification("success", "Perfil actualizado correctamente")
      setModoEdicion(false)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      showNotification("error", "Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" })
    }, 3000)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

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
          <p className="text-gray-600">Cargando tu perfil...</p>
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
          <button
            onClick={() => navigate("/")}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const nivel = calcularNivel(userData.puntaje || 0)
  const progreso = calcularProgreso(userData.puntaje || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación superior */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/dashboard")} className="text-white hover:text-blue-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="text-2xl font-bold">Mi Perfil</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1">
              <span className="text-yellow-300 mr-1">⭐</span>
              <span className="font-medium">{userData.puntaje || 0} pts</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cabecera del perfil */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
            <div className="md:flex items-center">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="relative inline-block">
                  <img
                    src={userData.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${userData.correo}`}
                    alt="Avatar"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {userData.nombre || userData.correo.split("@")[0]}
                </h1>
                <p className="text-blue-100 mb-2">{userData.correo}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-white/20 text-sm px-3 py-1 rounded-full">{userData.rol || "Estudiante"}</span>
                  <span className="bg-white/20 text-sm px-3 py-1 rounded-full flex items-center">
                    <span className="mr-1">Nivel</span>
                    <span className="bg-yellow-400 text-yellow-800 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">
                      {nivel}
                    </span>
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                {!modoEdicion && (
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notificación */}
          {notification.show && (
            <div
              className={`px-4 py-3 ${
                notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Contenido del perfil */}
          <div className="p-6">
            {modoEdicion ? (
              /* Formulario de edición */
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Editar información de perfil</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="correo@ejemplo.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">El correo no se puede modificar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de avatar</label>
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Universidad</label>
                    <input
                      type="text"
                      name="universidad"
                      value={formData.universidad}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre de tu universidad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                    <input
                      type="text"
                      name="carrera"
                      value={formData.carrera}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tu carrera universitaria"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                    <input
                      type="text"
                      name="semestre"
                      value={formData.semestre}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Semestre actual"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                  <textarea
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cuéntanos un poco sobre ti..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setModoEdicion(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarCambios}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
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
                        Guardando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Vista de perfil */
              <div>
                {/* Pestañas */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "general"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setActiveTab("estadisticas")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "estadisticas"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Estadísticas
                    </button>
                    <button
                      onClick={() => setActiveTab("insignias")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "insignias"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Insignias
                    </button>
                  </nav>
                </div>

                {/* Contenido de la pestaña General */}
                {activeTab === "general" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Información personal</h3>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Nombre completo</h4>
                            <p className="mt-1">{userData.nombre || "No especificado"}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Correo electrónico</h4>
                            <p className="mt-1">{userData.correo}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Rol</h4>
                            <p className="mt-1">{userData.rol || "Estudiante"}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Universidad</h4>
                            <p className="mt-1">{userData.universidad || "No especificado"}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Carrera</h4>
                              <p className="mt-1">{userData.carrera || "No especificado"}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Semestre</h4>
                              <p className="mt-1">{userData.semestre || "No especificado"}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Biografía</h4>
                            <p className="mt-1">{userData.biografia || "No hay biografía disponible."}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Nivel y progreso</h3>

                        <div className="text-center mb-4">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-800 text-3xl font-bold mb-2">
                            {nivel}
                          </div>
                          <p className="text-gray-600">Nivel actual</p>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Nivel {nivel}</span>
                            <span>Nivel {nivel + 1}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progreso}%` }}></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            {userData.puntaje || 0} / {nivel * 100} puntos para el siguiente nivel
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600">Puntos totales</p>
                          <p className="text-2xl font-bold text-blue-600">{userData.puntaje || 0}</p>
                        </div>
                      </div>

                      <div className="mt-6 bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Acciones rápidas</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Ir al Dashboard
                          </button>
                          <button
                            onClick={() => setModoEdicion(true)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Editar perfil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido de la pestaña Estadísticas */}
                {activeTab === "estadisticas" && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white border rounded-xl shadow-sm p-6">
                        <div className="text-4xl text-blue-600 mb-2">📊</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">Módulos completados</h3>
                        <p className="text-3xl font-bold text-gray-900">{userData.modulosCompletados || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">de un total de módulos</p>
                      </div>

                      <div className="bg-white border rounded-xl shadow-sm p-6">
                        <div className="text-4xl text-blue-600 mb-2">📝</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">Ejercicios resueltos</h3>
                        <p className="text-3xl font-bold text-gray-900">{userData.ejerciciosResueltos || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">ejercicios completados</p>
                      </div>

                      <div className="bg-white border rounded-xl shadow-sm p-6">
                        <div className="text-4xl text-blue-600 mb-2">🏆</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">Posición en ranking</h3>
                        <p className="text-3xl font-bold text-gray-900">{userData.posicionRanking || "-"}</p>
                        <p className="text-sm text-gray-500 mt-1">entre todos los estudiantes</p>
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Progreso por áreas</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Mecánica</span>
                            <span className="text-sm font-medium text-gray-700">75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Termodinámica</span>
                            <span className="text-sm font-medium text-gray-700">45%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Electromagnetismo</span>
                            <span className="text-sm font-medium text-gray-700">30%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "30%" }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Óptica</span>
                            <span className="text-sm font-medium text-gray-700">10%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "10%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Actividad reciente</h3>
                      <div className="space-y-4">
                        {userData.actividades ? (
                          userData.actividades.map((actividad, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                {actividad.tipo === "ejercicio" ? "📝" : actividad.tipo === "examen" ? "📊" : "📚"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{actividad.descripcion}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(actividad.fecha?.seconds * 1000).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No hay actividad reciente para mostrar.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenido de la pestaña Insignias */}
                {activeTab === "insignias" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Tus insignias</h3>

                      {userData.insignias && userData.insignias.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {userData.insignias.map((insignia, index) => (
                            <div
                              key={index}
                              className="bg-white border rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
                            >
                              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-blue-100 rounded-full text-2xl">
                                {insignia.emoji || "🏆"}
                              </div>
                              <h3 className="font-medium text-gray-800">
                                {insignia.nombre || `Insignia ${index + 1}`}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {insignia.fecha
                                  ? new Date(insignia.fecha.seconds * 1000).toLocaleDateString()
                                  : "Obtenida recientemente"}
                              </p>
                              {insignia.descripcion && (
                                <p className="text-xs text-gray-600 mt-2">{insignia.descripcion}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <div className="text-5xl mb-4">🏅</div>
                          <h3 className="text-xl font-medium text-gray-800 mb-2">Aún no tienes insignias</h3>
                          <p className="text-gray-600 mb-4">
                            Completa módulos y actividades para ganar insignias y mostrarlas aquí.
                          </p>
                          <button
                            onClick={() => navigate("/dashboard")}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Explorar módulos
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Insignias disponibles</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Insignias bloqueadas (ejemplos) */}
                        <div className="bg-gray-50 border rounded-xl p-4 text-center opacity-60">
                          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-gray-200 rounded-full text-2xl">
                            🔒
                          </div>
                          <h3 className="font-medium text-gray-600">Maestro de la Mecánica</h3>
                          <p className="text-xs text-gray-500 mt-1">Completa todos los módulos de mecánica</p>
                        </div>

                        <div className="bg-gray-50 border rounded-xl p-4 text-center opacity-60">
                          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-gray-200 rounded-full text-2xl">
                            🔒
                          </div>
                          <h3 className="font-medium text-gray-600">Experto en Termodinámica</h3>
                          <p className="text-xs text-gray-500 mt-1">Obtén calificación perfecta en el examen final</p>
                        </div>

                        <div className="bg-gray-50 border rounded-xl p-4 text-center opacity-60">
                          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-gray-200 rounded-full text-2xl">
                            🔒
                          </div>
                          <h3 className="font-medium text-gray-600">Científico Dedicado</h3>
                          <p className="text-xs text-gray-500 mt-1">Inicia sesión 30 días consecutivos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil

