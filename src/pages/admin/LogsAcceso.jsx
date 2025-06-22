import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../../firebase"
import { useNavigate } from "react-router-dom"

function LogsAcceso() {
  const navigate = useNavigate()
  const [accesos, setAccesos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAccesos, setFilteredAccesos] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [logsPerPage] = useState(15)
  const [dateFilter, setDateFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semana: 0,
    mes: 0,
  })

  const cargarAccesos = async () => {
    try {
      setLoading(true)
      const ref = collection(db, "accesos")
      const q = query(ref, orderBy("fecha", "desc"), limit(500)) // Limitar a 500 para rendimiento
      const snapshot = await getDocs(q)
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setAccesos(lista)

      // Calcular estadísticas
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const unaSemanaAtras = new Date()
      unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)

      const unMesAtras = new Date()
      unMesAtras.setMonth(unMesAtras.getMonth() - 1)

      const accesosHoy = lista.filter((log) => {
        const fechaLog = log.fecha?.toDate ? log.fecha.toDate() : new Date(log.fecha)
        return fechaLog >= hoy
      }).length

      const accesosSemana = lista.filter((log) => {
        const fechaLog = log.fecha?.toDate ? log.fecha.toDate() : new Date(log.fecha)
        return fechaLog >= unaSemanaAtras
      }).length

      const accesosMes = lista.filter((log) => {
        const fechaLog = log.fecha?.toDate ? log.fecha.toDate() : new Date(log.fecha)
        return fechaLog >= unMesAtras
      }).length

      setStats({
        total: lista.length,
        hoy: accesosHoy,
        semana: accesosSemana,
        mes: accesosMes,
      })

      setError(null)
    } catch (err) {
      console.error("Error al cargar accesos:", err)
      setError("No se pudieron cargar los registros de acceso. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarAccesos()
  }, [])

  useEffect(() => {
    // Filtrar accesos según término de búsqueda y fecha
    let filtered = [...accesos]

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.dispositivo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por fecha
    if (dateFilter !== "all") {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const ayer = new Date()
      ayer.setDate(ayer.getDate() - 1)
      ayer.setHours(0, 0, 0, 0)

      const unaSemanaAtras = new Date()
      unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)

      const unMesAtras = new Date()
      unMesAtras.setMonth(unMesAtras.getMonth() - 1)

      filtered = filtered.filter((log) => {
        const fechaLog = log.fecha?.toDate ? log.fecha.toDate() : new Date(log.fecha)

        switch (dateFilter) {
          case "today":
            return fechaLog >= hoy
          case "yesterday":
            return fechaLog >= ayer && fechaLog < hoy
          case "week":
            return fechaLog >= unaSemanaAtras
          case "month":
            return fechaLog >= unMesAtras
          default:
            return true
        }
      })
    }

    setFilteredAccesos(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [accesos, searchTerm, dateFilter])

  // Paginación
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredAccesos.slice(indexOfFirstLog, indexOfLastLog)
  const totalPages = Math.ceil(filteredAccesos.length / logsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha"
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha)

    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  // Obtener el tiempo transcurrido desde la fecha
  const getTimeAgo = (fecha) => {
    if (!fecha) return ""

    const date = fecha.toDate ? fecha.toDate() : new Date(fecha)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) {
      return `hace ${diffSecs} segundos`
    } else if (diffMins < 60) {
      return `hace ${diffMins} minutos`
    } else if (diffHours < 24) {
      return `hace ${diffHours} horas`
    } else if (diffDays < 30) {
      return `hace ${diffDays} días`
    } else {
      const diffMonths = Math.floor(diffDays / 30)
      return `hace ${diffMonths} meses`
    }
  }

  // Obtener icono según el tipo de dispositivo
  const getDeviceIcon = (dispositivo) => {
    if (!dispositivo) return "🖥️"

    const lowerDevice = dispositivo.toLowerCase()
    if (lowerDevice.includes("mobile") || lowerDevice.includes("android") || lowerDevice.includes("iphone")) {
      return "📱"
    } else if (lowerDevice.includes("tablet") || lowerDevice.includes("ipad")) {
      return "📱"
    } else {
      return "🖥️"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Cabecera */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => navigate("/admin")}
              className="mr-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-purple-100 text-purple-700 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              Auditoría de Accesos
            </h1>
          </div>
          <button
            className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-sm"
            onClick={() => navigate("/admin/logs/exportar")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Exportar Registros
          </button>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de accesos</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 text-green-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Accesos hoy</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.hoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 text-yellow-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Últimos 7 días</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.semana}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Último mes</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.mes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Buscar por correo, UID o dispositivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos los períodos</option>
                  <option value="today">Hoy</option>
                  <option value="yesterday">Ayer</option>
                  <option value="week">Últimos 7 días</option>
                  <option value="month">Último mes</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("")
                  setDateFilter("all")
                }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Reiniciar
              </button>

              <button
                onClick={cargarAccesos}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de accesos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
                <p>{error}</p>
                <button
                  onClick={cargarAccesos}
                  className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : filteredAccesos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-purple-100 text-purple-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron registros</h2>
              <p className="text-gray-600 mb-6">
                No hay registros de acceso que coincidan con los criterios de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setDateFilter("all")
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Mostrar todos los registros
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Usuario
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha y Hora
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Dispositivo
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        IP
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={
                                  log.avatar ||
                                  `https://api.dicebear.com/6.x/initials/svg?seed=${log.correo || "/placeholder.svg"}`
                                }
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{log.correo}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{log.uid}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatearFecha(log.fecha)}</div>
                          <div className="text-xs text-gray-500">{getTimeAgo(log.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getDeviceIcon(log.dispositivo)}</span>
                            <span className="text-sm text-gray-900">{log.dispositivo || "Desconocido"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip || "No registrada"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.exitoso === false ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {log.exitoso === false ? "Fallido" : "Exitoso"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredAccesos.length > logsPerPage && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstLog + 1}</span> a{" "}
                        <span className="font-medium">{Math.min(indexOfLastLog, filteredAccesos.length)}</span> de{" "}
                        <span className="font-medium">{filteredAccesos.length}</span> registros
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Números de página */}
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1
                          // Mostrar solo algunas páginas para no sobrecargar la UI
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                  currentPage === pageNumber
                                    ? "z-10 bg-purple-50 border-purple-500 text-purple-600"
                                    : "text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            )
                          } else if (
                            (pageNumber === currentPage - 2 && currentPage > 3) ||
                            (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            )
                          }
                          return null
                        })}

                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LogsAcceso

