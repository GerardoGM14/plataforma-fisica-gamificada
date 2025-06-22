"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore"

function PanelAdmin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    nuevosHoy: 0,
    totalModulos: 0,
    modulosActivos: 0,
    accesosSemana: 0,
    completadosHoy: 0,
  })
  const [actividadReciente, setActividadReciente] = useState([])
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    const checkAdmin = async (user) => {
      if (!user) {
        navigate("/")
        return false
      }

      try {
        const userRef = doc(db, "usuarios", user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists() || userSnap.data().rol !== "admin") {
          navigate("/dashboard")
          return false
        }

        return true
      } catch (err) {
        console.error("Error verificando rol de administrador:", err)
        navigate("/dashboard")
        return false
      }
    }

    const loadDashboardData = async () => {
      try {
        // Obtener estadísticas de usuarios
        const usuariosRef = collection(db, "usuarios")
        const usuariosSnap = await getDocs(usuariosRef)
        const totalUsuarios = usuariosSnap.size

        // Obtener usuarios nuevos de hoy
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const usuariosHoyQuery = query(usuariosRef, where("fechaRegistro", ">=", hoy))
        const usuariosHoySnap = await getDocs(usuariosHoyQuery)
        const nuevosHoy = usuariosHoySnap.size

        // Obtener estadísticas de módulos
        const modulosRef = collection(db, "modulos")
        const modulosSnap = await getDocs(modulosRef)
        const totalModulos = modulosSnap.size

        // Obtener módulos activos
        const modulosActivosQuery = query(modulosRef, where("activo", "==", true))
        const modulosActivosSnap = await getDocs(modulosActivosQuery)
        const modulosActivos = modulosActivosSnap.size

        // Obtener accesos de la última semana
        const semanaAtras = new Date()
        semanaAtras.setDate(semanaAtras.getDate() - 7)
        const logsRef = collection(db, "logs")
        const logsQuery = query(logsRef, where("fecha", ">=", semanaAtras))
        const logsSnap = await getDocs(logsQuery)
        const accesosSemana = logsSnap.size

        // Obtener módulos completados hoy
        const completadosHoyQuery = query(collection(db, "completados"), where("fecha", ">=", hoy))
        const completadosHoySnap = await getDocs(completadosHoyQuery)
        const completadosHoy = completadosHoySnap.size

        setStats({
          totalUsuarios,
          nuevosHoy,
          totalModulos,
          modulosActivos,
          accesosSemana,
          completadosHoy,
        })

        // Obtener actividad reciente
        const actividadQuery = query(collection(db, "actividad"), orderBy("fecha", "desc"), limit(5))
        const actividadSnap = await getDocs(actividadQuery)
        const actividadData = actividadSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setActividadReciente(actividadData)
      } catch (err) {
        console.error("Error cargando datos del dashboard:", err)
        setError("Error al cargar los datos del panel. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isAdmin = await checkAdmin(user)
      if (isAdmin) {
        loadDashboardData()
      }
    })

    return () => unsubscribe()
  }, [navigate])

  // Función para formatear fechas
  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case "login":
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case "modulo_completado":
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case "registro":
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        )
      case "quiz_completado":
        return (
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0016 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Cabecera */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-700 p-2 rounded-full mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            Panel de Administración
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 md:mt-0 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>

      {/* Tarjetas principales */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tarjeta 1: Gestión de Módulos */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-2 bg-blue-600"></div>
            <div className="p-6">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Gestión de Módulos</h2>
              <p className="text-gray-600 mb-6">
                Edita los módulos existentes o crea nuevos cursos disponibles para los estudiantes.
              </p>
              <button
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={() => navigate("/admin/modulos")}
              >
                <span>Gestionar Módulos</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tarjeta 2: Gestión de Usuarios */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-2 bg-green-600"></div>
            <div className="p-6">
              <div className="bg-green-100 text-green-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Gestión de Usuarios</h2>
              <p className="text-gray-600 mb-6">
                Consulta todos los usuarios registrados y su progreso dentro de la plataforma.
              </p>
              <button
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                onClick={() => navigate("/admin/usuarios")}
              >
                <span>Ver Usuarios</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tarjeta 3: Auditoría de Accesos */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="h-2 bg-purple-600"></div>
            <div className="p-6">
              <div className="bg-purple-100 text-purple-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Auditoría de Accesos</h2>
              <p className="text-gray-600 mb-6">Visualiza el historial de accesos de los usuarios en el sistema.</p>
              <button
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                onClick={() => navigate("/admin/logs")}
              >
                <span>Ver Accesos</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Panel de Administración | Física Gamificada</p>
      </div>
    </div>
  )
}

export default PanelAdmin

