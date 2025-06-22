"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../../firebase"
import { useNavigate } from "react-router-dom"

function ModulosAdmin() {
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const navigate = useNavigate()

  const obtenerModulos = async () => {
    try {
      setLoading(true)
      const ref = collection(db, "modulos")
      const snapshot = await getDocs(ref)
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setModulos(lista)
      setError(null)
    } catch (err) {
      console.error("Error al obtener módulos:", err)
      setError("No se pudieron cargar los módulos. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    obtenerModulos()
  }, [])

  const eliminarModulo = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este módulo? Esta acción no se puede deshacer.")) {
      try {
        setDeleteLoading(id)
        await deleteDoc(doc(db, "modulos", id))
        obtenerModulos() // recargar después de eliminar
      } catch (err) {
        console.error("Error al eliminar módulo:", err)
        alert("Error al eliminar el módulo. Intente nuevamente.")
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Cabecera con navegación */}
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </span>
              Gestión de Módulos
            </h1>
          </div>
          <button
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
            onClick={() => navigate("/admin/modulos/nuevo")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Nuevo Módulo
          </button>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de módulos</p>
                <p className="text-xl font-bold">{loading ? "..." : modulos.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-green-100 text-green-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Módulos activos</p>
                <p className="text-xl font-bold">{loading ? "..." : modulos.filter((m) => m.activo).length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-700 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estudiantes inscritos</p>
                <p className="text-xl font-bold">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button
              onClick={obtenerModulos}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : modulos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="bg-blue-100 text-blue-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay módulos disponibles</h2>
            <p className="text-gray-600 mb-6">Comienza creando tu primer módulo educativo</p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              onClick={() => navigate("/admin/modulos/nuevo")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Crear Módulo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((modulo) => (
              <div
                key={modulo.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: modulo.imagenUrl
                      ? `url(${modulo.imagenUrl})`
                      : `url(https://api.dicebear.com/6.x/shapes/svg?seed=${modulo.titulo}&backgroundColor=4f46e5)`,
                  }}
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{modulo.titulo}</h2>
                    {modulo.dificultad && (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          modulo.dificultad === "Fácil"
                            ? "bg-green-100 text-green-800"
                            : modulo.dificultad === "Medio"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {modulo.dificultad}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{modulo.descripcion}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {modulo.activo ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                        Activo
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                        Inactivo
                      </span>
                    )}
                    {modulo.puntosAlCompletar && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {modulo.puntosAlCompletar} pts
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      onClick={() => navigate(`/admin/modulos/editar/${modulo.id}`)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar
                    </button>

                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      onClick={() => eliminarModulo(modulo.id)}
                      disabled={deleteLoading === modulo.id}
                    >
                      {deleteLoading === modulo.id ? (
                        <svg
                          className="animate-spin h-4 w-4 mr-1"
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
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ModulosAdmin
