"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { db, auth } from "../../firebase"
import { onAuthStateChanged } from "firebase/auth"

function VistaModulo() {
  const { id } = useParams()
  const [modulo, setModulo] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("contenido")
  const navigate = useNavigate()

  // Estados para el sistema de PIN y edición
  const [mostrarPinModal, setMostrarPinModal] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const [modoEdicion, setModoEdicion] = useState(false)

  // Estados para títulos editables
  const [tituloSimulacion, setTituloSimulacion] = useState("")
  const [tituloPDF, setTituloPDF] = useState("")
  const [tituloVideoEmbebido, setTituloVideoEmbebido] = useState("")

  // Estados para mostrar/ocultar PDF
  const [mostrarPDF, setMostrarPDF] = useState(false)

  // Estados para agregar nuevo video embebido
  const [nuevoVideoURL, setNuevoVideoURL] = useState("")
  const [nuevoVideoTitulo, setNuevoVideoTitulo] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/")
        return
      }

      try {
        setLoading(true)

        // Cargar datos del módulo
        if (!id) {
          throw new Error("ID de módulo no encontrado")
        }

        const moduloRef = doc(db, "modulos", id)
        const moduloSnapshot = await getDoc(moduloRef)

        if (!moduloSnapshot.exists()) {
          throw new Error("El módulo no existe")
        }

        const moduloData = {
          id: moduloSnapshot.id,
          ...moduloSnapshot.data(),
        }

        setModulo(moduloData)

        // Cargar títulos existentes si los hay
        setTituloSimulacion(moduloData.tituloSimulacion || "")
        setTituloPDF(moduloData.tituloPDF || "")
        setTituloVideoEmbebido(moduloData.tituloVideoEmbebido || "")

        // Cargar datos del usuario para verificar progreso
        const userRef = doc(db, "usuarios", user.uid)
        const userSnapshot = await getDoc(userRef)

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data())
        }
      } catch (err) {
        console.error("Error al cargar el módulo:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [id, navigate])

  // Función para verificar PIN
  const verificarPin = () => {
    if (pinInput === "140603") {
      setModoEdicion(true)
      setMostrarPinModal(false)
      setPinInput("")
      setPinError("")
    } else {
      setPinError("PIN incorrecto. Inténtalo de nuevo.")
    }
  }

  // Funciones para guardar títulos en Firebase
  const guardarTituloSimulacion = async () => {
    try {
      const moduloRef = doc(db, "modulos", id)
      await updateDoc(moduloRef, { tituloSimulacion })
      console.log("Título de simulación guardado:", tituloSimulacion)
    } catch (error) {
      console.error("Error guardando título de simulación:", error)
    }
  }

  const guardarTituloPDF = async () => {
    try {
      const moduloRef = doc(db, "modulos", id)
      await updateDoc(moduloRef, { tituloPDF })
      console.log("Título de PDF guardado:", tituloPDF)
    } catch (error) {
      console.error("Error guardando título de PDF:", error)
    }
  }

  const guardarTituloVideo = async () => {
    try {
      const moduloRef = doc(db, "modulos", id)
      await updateDoc(moduloRef, { tituloVideoEmbebido })
      console.log("Título de video guardado:", tituloVideoEmbebido)
    } catch (error) {
      console.error("Error guardando título de video:", error)
    }
  }

  // Función para agregar video embebido
  const agregarVideoEmbebido = async () => {
    if (nuevoVideoURL && nuevoVideoTitulo) {
      try {
        const moduloRef = doc(db, "modulos", id)
        await updateDoc(moduloRef, {
          videoEmbebido: nuevoVideoURL,
          tituloVideoEmbebido: nuevoVideoTitulo,
        })

        // Actualizar estado local
        setModulo((prev) => ({
          ...prev,
          videoEmbebido: nuevoVideoURL,
          tituloVideoEmbebido: nuevoVideoTitulo,
        }))

        setTituloVideoEmbebido(nuevoVideoTitulo)
        setNuevoVideoURL("")
        setNuevoVideoTitulo("")

        console.log("Video embebido agregado:", { url: nuevoVideoURL, titulo: nuevoVideoTitulo })
      } catch (error) {
        console.error("Error agregando video:", error)
      }
    }
  }

  const marcarComoVisto = async () => {
    if (!userData || !modulo) return

    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid)

      // Verificar si el módulo ya está en la lista de vistos
      const modulosVistos = userData.modulosVistos || []
      if (!modulosVistos.includes(id)) {
        await updateDoc(userRef, {
          modulosVistos: arrayUnion(id),
        })

        // Actualizar el estado local
        setUserData({
          ...userData,
          modulosVistos: [...modulosVistos, id],
        })
      }
    } catch (err) {
      console.error("Error al marcar como visto:", err)
    }
  }

  const isModuloVisto = userData?.modulosVistos?.includes(id)
  const isModuloCompletado = userData?.modulosCompletados?.includes(id)

  const subtemas = Array.isArray(modulo?.subtemas) ? modulo.subtemas : []
  const recursos = Array.isArray(modulo?.recursos) ? modulo.recursos : []
  const requisitosModulo = Array.isArray(modulo?.requisitos) ? modulo.requisitos : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-5xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error al cargar el módulo</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!modulo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo no encontrado</h2>
          <p className="text-gray-600 mb-6">No se pudo encontrar el módulo solicitado.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera del módulo */}
      <div
        className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-8 px-4"
        style={{
          backgroundImage: modulo.imagenFondo
            ? `linear-gradient(rgba(30, 64, 175, 0.85), rgba(55, 48, 163, 0.85)), url(${modulo.imagenFondo})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Volver"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div>
              <p className="text-blue-200">Módulo {modulo.orden || ""}</p>
              <h1 className="text-3xl font-bold">{modulo.titulo}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between">
            <div className="w-full md:w-2/3 mb-4 md:mb-0">
              <p className="text-lg text-blue-100">{modulo.descripcion}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {modulo.dificultad && (
                  <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                    {modulo.dificultad === "Fácil" ? "🟢 " : modulo.dificultad === "Medio" ? "🟡 " : "🔴 "}
                    {modulo.dificultad}
                  </span>
                )}

                {modulo.duracion && (
                  <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">⏱️ {modulo.duracion}</span>
                )}

                <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                  🏆 {modulo.puntosAlCompletar || 0} pts
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-center">
              <div className="bg-white/10 rounded-lg p-3 text-center mb-2">
                <div className="text-2xl mb-1">{isModuloCompletado ? "✅" : isModuloVisto ? "👁️" : "🆕"}</div>
                <p className="text-sm">{isModuloCompletado ? "Completado" : isModuloVisto ? "Visto" : "Nuevo"}</p>
              </div>

              <button
                onClick={() => navigate(`/modulo/${id}/quiz`)}
                className="bg-white text-blue-700 px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors w-full"
              >
                {isModuloCompletado ? "Repasar" : "Iniciar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-5xl">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("contenido")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "contenido"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contenido
            </button>
            <button
              onClick={() => setActiveTab("recursos")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "recursos"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Recursos
            </button>
            <button
              onClick={() => setActiveTab("requisitos")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "requisitos"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Requisitos
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {activeTab === "contenido" && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 p-2 rounded-full mr-3">📚</span>
                Subtemas
              </h2>

              {subtemas.length > 0 ? (
                <ul className="space-y-3">
                  {subtemas.map((subtema, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-50 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-800">{subtema}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No hay subtemas disponibles para este módulo.</p>
              )}
            </div>

            {modulo.contenido && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-700 p-2 rounded-full mr-3">📝</span>
                  Contenido del módulo
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{modulo.contenido}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-700 p-2 rounded-full mr-3">🎯</span>
                Objetivos de aprendizaje
              </h2>

              {modulo.objetivos && modulo.objetivos.length > 0 ? (
                <ul className="space-y-3">
                  {modulo.objetivos.map((objetivo, index) => (
                    <li key={index} className="flex items-start">
                      <div className="text-green-600 mr-3 flex-shrink-0">✓</div>
                      <p className="text-gray-700">{objetivo}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No hay objetivos definidos para este módulo.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "recursos" && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="bg-yellow-100 text-yellow-700 p-2 rounded-full mr-3">📚</span>
                  Recursos de aprendizaje
                </h2>

                {/* Botón para editar con PIN */}
                <button
                  onClick={() => setMostrarPinModal(true)}
                  className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
                  </svg>
                  Editar títulos
                </button>
              </div>

              {/* Modal para PIN */}
              {mostrarPinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Ingresa el PIN de administrador</h3>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Ingresa el PIN"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                      onKeyPress={(e) => e.key === "Enter" && verificarPin()}
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={verificarPin}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Verificar
                      </button>
                      <button
                        onClick={() => {
                          setMostrarPinModal(false)
                          setPinInput("")
                          setPinError("")
                        }}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                    {pinError && <p className="text-red-600 text-sm mt-2">{pinError}</p>}
                  </div>
                </div>
              )}

              {modulo.iframeURL || modulo.archivoAdjuntoUrl || modulo.videoEmbebido ? (
                <div className="space-y-6">
                  {/* Video embebido */}
                  {modulo.videoEmbebido && (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <span className="bg-red-100 text-red-600 p-1 rounded mr-2">🎥</span>
                          {modoEdicion ? (
                            <input
                              type="text"
                              value={tituloVideoEmbebido}
                              onChange={(e) => setTituloVideoEmbebido(e.target.value)}
                              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Título del video"
                            />
                          ) : (
                            tituloVideoEmbebido || "Video educativo"
                          )}
                        </h3>
                        {modoEdicion && (
                          <button
                            onClick={guardarTituloVideo}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Guardar
                          </button>
                        )}
                      </div>
                      <div className="w-full aspect-video rounded-lg overflow-hidden border">
                        <iframe
                          src={modulo.videoEmbebido}
                          title={tituloVideoEmbebido || "Video educativo"}
                          width="100%"
                          height="100%"
                          allowFullScreen
                          className="w-full h-full border-none"
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Simulación interactiva */}
                  {modulo.iframeURL && (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2">🔬</span>
                          {modoEdicion ? (
                            <input
                              type="text"
                              value={tituloSimulacion}
                              onChange={(e) => setTituloSimulacion(e.target.value)}
                              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Título de la simulación"
                            />
                          ) : (
                            tituloSimulacion || "Simulación interactiva"
                          )}
                        </h3>
                        {modoEdicion && (
                          <button
                            onClick={guardarTituloSimulacion}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Guardar
                          </button>
                        )}
                      </div>
                      <div className="w-full aspect-video rounded-lg overflow-hidden border">
                        <iframe
                          src={modulo.iframeURL}
                          title={tituloSimulacion || "Simulación interactiva"}
                          width="100%"
                          height="100%"
                          allowFullScreen
                          className="w-full h-[400px] border-none"
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Archivo PDF */}
                  {modulo.archivoAdjuntoUrl && (
                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <span className="bg-green-100 text-green-600 p-1 rounded mr-2">📄</span>
                          {modoEdicion ? (
                            <input
                              type="text"
                              value={tituloPDF}
                              onChange={(e) => setTituloPDF(e.target.value)}
                              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Título del documento"
                            />
                          ) : (
                            tituloPDF || "Documento PDF"
                          )}
                        </h3>
                        {modoEdicion && (
                          <button
                            onClick={guardarTituloPDF}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Guardar
                          </button>
                        )}
                      </div>

                      {!mostrarPDF ? (
                        <div className="text-center py-8">
                          <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-sm mx-auto hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-3">📄</div>
                            <h4 className="font-medium text-gray-800 mb-2">{tituloPDF || "Documento PDF"}</h4>
                            <p className="text-gray-600 text-sm mb-4">Haz clic para ver el documento</p>
                            <button
                              onClick={() => {
                                setMostrarPDF(true)
                                marcarComoVisto()
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Ver documento
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600">Vista del documento</span>
                            <button
                              onClick={() => setMostrarPDF(false)}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                              Ocultar
                            </button>
                          </div>
                          <div className="w-full aspect-square rounded-lg overflow-hidden border">
                            <iframe
                              src={modulo.archivoAdjuntoUrl}
                              title={tituloPDF || "Documento PDF"}
                              width="100%"
                              height="600"
                              className="w-full border-none"
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sección para agregar video embebido (solo visible en modo edición) */}
                  {modoEdicion && (
                    <div className="bg-yellow-50 rounded-xl p-4 border-2 border-dashed border-yellow-200">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="bg-yellow-100 text-yellow-600 p-1 rounded mr-2">➕</span>
                        Agregar video embebido
                      </h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={nuevoVideoURL}
                          onChange={(e) => setNuevoVideoURL(e.target.value)}
                          placeholder="URL del video embebido (YouTube, Vimeo, etc.)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={nuevoVideoTitulo}
                          onChange={(e) => setNuevoVideoTitulo(e.target.value)}
                          placeholder="Título del video"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={agregarVideoEmbebido}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Agregar video
                        </button>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Nota:</strong> Para YouTube, usa el formato: https://www.youtube.com/embed/VIDEO_ID
                          <br />
                          Para Vimeo: https://player.vimeo.com/video/VIDEO_ID
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No hay recursos disponibles</h3>
                  <p className="text-gray-600">Este módulo aún no tiene recursos de aprendizaje asociados.</p>
                  {modoEdicion && (
                    <p className="text-blue-600 text-sm mt-2">Usa el modo de edición para agregar recursos.</p>
                  )}
                </div>
              )}

              {/* Botones de modo edición */}
              {modoEdicion && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 font-medium">Modo de edición activado</span>
                    <button
                      onClick={() => {
                        setModoEdicion(false)
                        // Aquí puedes agregar lógica adicional para guardar cambios
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Salir del modo edición
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "requisitos" && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-red-100 text-red-700 p-2 rounded-full mr-3">⚠️</span>
                Requisitos previos
              </h2>

              {requisitosModulo.length > 0 ? (
                <ul className="space-y-3">
                  {requisitosModulo.map((requisito, index) => (
                    <li key={index} className="flex items-start">
                      <div className="text-blue-600 mr-3">•</div>
                      <p className="text-gray-700">{requisito}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">Este módulo no tiene requisitos previos específicos.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 text-green-700 p-2 rounded-full mr-3">🏆</span>
                Recompensas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">⭐</div>
                    <div>
                      <h3 className="font-medium text-gray-800">Puntos al completar</h3>
                      <p className="text-2xl font-bold text-blue-700">{modulo.puntosAlCompletar || 0}</p>
                    </div>
                  </div>
                </div>

                {modulo.insignia && (
                  <div className="border rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🏅</div>
                      <div>
                        <h3 className="font-medium text-gray-800">Insignia</h3>
                        <p className="text-lg font-bold text-purple-700">{modulo.insignia}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate(`/modulo/${id}/quiz`)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-2">Iniciar actividades</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default VistaModulo
