"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "../../firebase"
import { useNavigate } from "react-router-dom"

function UsuariosAdmin() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsuarios, setFilteredUsuarios] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: "correo", direction: "ascending" })
  const [filterRole, setFilterRole] = useState("todos")
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    usuario: 0,
    puntajePromedio: 0,
  })

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const ref = collection(db, "usuarios")
      const q = query(ref, orderBy("fechaRegistro", "desc"))
      const snapshot = await getDocs(q)
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      setUsuarios(lista)

      // Calcular estadísticas
      const admins = lista.filter((u) => u.rol === "admin").length
      const totalPuntaje = lista.reduce((sum, user) => sum + (user.puntaje || 0), 0)

      setStats({
        total: lista.length,
        admin: admins,
        usuario: lista.length - admins,
        puntajePromedio: lista.length > 0 ? Math.round(totalPuntaje / lista.length) : 0,
      })

      setError(null)
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
      setError("No se pudieron cargar los usuarios. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  useEffect(() => {
    // Filtrar usuarios según término de búsqueda y rol
    let filtered = [...usuarios]

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterRole !== "todos") {
      filtered = filtered.filter((user) => user.rol === filterRole)
    }

    // Ordenar usuarios
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredUsuarios(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [usuarios, searchTerm, sortConfig, filterRole])

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? "↑" : "↓"
  }

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsuarios.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsuarios.length / usersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
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
              <span className="bg-green-100 text-green-700 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </span>
              Gestión de Usuarios
            </h1>
          </div>
          <button
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
            onClick={() => navigate("/admin/usuarios/exportar")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Exportar Datos
          </button>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de usuarios</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estudiantes</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.usuario}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 text-yellow-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Administradores</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.admin}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 text-green-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Puntaje promedio</p>
                <p className="text-xl font-bold">{loading ? "..." : stats.puntajePromedio}</p>
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
                placeholder="Buscar por correo, nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="usuario">Estudiantes</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilterRole("todos")
                  setSortConfig({ key: "correo", direction: "ascending" })
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
                onClick={cargarUsuarios}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg inline-block">
                <p>{error}</p>
                <button
                  onClick={cargarUsuarios}
                  className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-blue-100 text-blue-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron usuarios</h2>
              <p className="text-gray-600 mb-6">No hay usuarios que coincidan con los criterios de búsqueda.</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilterRole("todos")
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mostrar todos los usuarios
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("correo")}
                      >
                        <div className="flex items-center">
                          <span>Correo</span>
                          <span className="ml-1">{getSortIcon("correo")}</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("nombre")}
                      >
                        <div className="flex items-center">
                          <span>Nombre</span>
                          <span className="ml-1">{getSortIcon("nombre")}</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("rol")}
                      >
                        <div className="flex items-center">
                          <span>Rol</span>
                          <span className="ml-1">{getSortIcon("rol")}</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("puntaje")}
                      >
                        <div className="flex items-center">
                          <span>Puntaje</span>
                          <span className="ml-1">{getSortIcon("puntaje")}</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("fechaRegistro")}
                      >
                        <div className="flex items-center">
                          <span>Registro</span>
                          <span className="ml-1">{getSortIcon("fechaRegistro")}</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Insignias
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={
                                  usuario.avatar ||
                                  `https://api.dicebear.com/6.x/initials/svg?seed=${usuario.correo || "/placeholder.svg"}`
                                }
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{usuario.correo}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{usuario.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usuario.nombre || "No especificado"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.rol === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {usuario.rol || "usuario"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{usuario.puntaje || 0}</span>
                            <span className="ml-1 text-yellow-500">⭐</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(usuario.fechaRegistro)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.insignias?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {usuario.insignias.slice(0, 3).map((insignia, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {insignia}
                                </span>
                              ))}
                              {usuario.insignias.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{usuario.insignias.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Sin insignias</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/usuarios/${usuario.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => navigate(`/admin/usuarios/editar/${usuario.id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredUsuarios.length > usersPerPage && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> a{" "}
                        <span className="font-medium">{Math.min(indexOfLastUser, filteredUsuarios.length)}</span> de{" "}
                        <span className="font-medium">{filteredUsuarios.length}</span> usuarios
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
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
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

export default UsuariosAdmin
