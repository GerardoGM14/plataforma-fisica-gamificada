"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

function EditarModulo() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    subtemas: "",
    puntosAlCompletar: 100,
    dificultad: "Medio",
    activo: true,
    // Recursos
    iframeURL: "",
    tituloSimulacion: "",
    videoEmbebido: "",
    tituloVideoEmbebido: "",
    archivoAdjuntoUrl: "",
    tituloPDF: "",
  })

  const [imagen, setImagen] = useState(null)
  const [imagenActual, setImagenActual] = useState("")
  const [imagenPreview, setImagenPreview] = useState("")
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState({})
  const [archivoAdjunto, setArchivoAdjunto] = useState(null)
  const [activeResourceTab, setActiveResourceTab] = useState("simulacion")

  useEffect(() => {
    const cargarModulo = async () => {
      try {
        setCargando(true)
        const refDoc = doc(db, "modulos", id)
        const snap = await getDoc(refDoc)

        if (snap.exists()) {
          const data = snap.data()
          setFormData({
            titulo: data.titulo || "",
            descripcion: data.descripcion || "",
            subtemas: Array.isArray(data.subtemas) ? data.subtemas.join(", ") : "",
            puntosAlCompletar: data.puntosAlCompletar || 100,
            dificultad: data.dificultad || "Medio",
            activo: data.activo !== undefined ? data.activo : true,
            // Recursos
            iframeURL: data.iframeURL || "",
            tituloSimulacion: data.tituloSimulacion || "",
            videoEmbebido: data.videoEmbebido || "",
            tituloVideoEmbebido: data.tituloVideoEmbebido || "",
            archivoAdjuntoUrl: data.archivoAdjuntoUrl || "",
            tituloPDF: data.tituloPDF || "",
          })
          setImagenActual(data.imagenUrl || "")
        } else {
          setError("No se encontró el módulo solicitado")
        }
      } catch (err) {
        console.error("Error al cargar el módulo:", err)
        setError("Error al cargar los datos del módulo")
      } finally {
        setCargando(false)
      }
    }

    cargarModulo()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true,
    })
  }

  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagen(file)

      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleArchivoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setArchivoAdjunto(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubiendo(true)
    setError(null)

    try {
      let imagenUrl = imagenActual

      if (imagen) {
        const storage = getStorage()
        const storageRef = ref(storage, `modulos/${Date.now()}_${imagen.name}`)
        await uploadBytes(storageRef, imagen)
        imagenUrl = await getDownloadURL(storageRef)
      }

      let archivoAdjuntoUrl = formData.archivoAdjuntoUrl || ""

      if (archivoAdjunto) {
        const storage = getStorage()
        const archivoRef = ref(storage, `modulos/archivos/${Date.now()}_${archivoAdjunto.name}`)
        await uploadBytes(archivoRef, archivoAdjunto)
        archivoAdjuntoUrl = await getDownloadURL(archivoRef)
      }

      await updateDoc(doc(db, "modulos", id), {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        subtemas: formData.subtemas
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        puntosAlCompletar: Number.parseInt(formData.puntosAlCompletar),
        dificultad: formData.dificultad,
        activo: formData.activo,
        imagenUrl,
        // Recursos
        iframeURL: formData.iframeURL,
        tituloSimulacion: formData.tituloSimulacion,
        videoEmbebido: formData.videoEmbebido,
        tituloVideoEmbebido: formData.tituloVideoEmbebido,
        archivoAdjuntoUrl,
        tituloPDF: formData.tituloPDF,
        fechaActualizacion: new Date(),
      })

      navigate("/admin/modulos")
    } catch (error) {
      console.error("Error al actualizar módulo:", error)
      setError("Error al actualizar el módulo. Por favor, intente nuevamente.")
    } finally {
      setSubiendo(false)
    }
  }

  const handleCancelar = () => {
    navigate("/admin/modulos")
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del módulo...</p>
        </div>
      </div>
    )
  }

  if (error && !formData.titulo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-red-100 text-red-700 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/admin/modulos")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver a Módulos
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Cabecera */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center bg-white rounded-xl shadow-md p-6 mb-6">
          <button
            onClick={() => navigate("/admin/modulos")}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </span>
            Editar Módulo
          </h1>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="bg-white/20 p-2 rounded-full mr-3">📝</span>
                Información básica
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del módulo</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full border ${touched.titulo && !formData.titulo ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {touched.titulo && !formData.titulo && (
                    <p className="mt-1 text-sm text-red-600">El título es obligatorio</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows="4"
                    className={`w-full border ${touched.descripcion && !formData.descripcion ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  ></textarea>
                  {touched.descripcion && !formData.descripcion && (
                    <p className="mt-1 text-sm text-red-600">La descripción es obligatoria</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtemas (separados por coma)</label>
                  <input
                    type="text"
                    name="subtemas"
                    value={formData.subtemas}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full border ${touched.subtemas && !formData.subtemas ? "border-red-500" : "border-gray-300"
                      } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  {touched.subtemas && !formData.subtemas && (
                    <p className="mt-1 text-sm text-red-600">Debe incluir al menos un subtema</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puntos al completar</label>
                  <input
                    type="number"
                    name="puntosAlCompletar"
                    value={formData.puntosAlCompletar}
                    onChange={handleChange}
                    min="0"
                    max="1000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                  <select
                    name="dificultad"
                    value={formData.dificultad}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Medio">Medio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="activo"
                      id="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                      Módulo activo (visible para los estudiantes)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recursos de aprendizaje */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="bg-white/20 p-2 rounded-full mr-3">📚</span>
                Recursos de aprendizaje
              </h2>
            </div>

            {/* Pestañas de recursos */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  type="button"
                  onClick={() => setActiveResourceTab("simulacion")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeResourceTab === "simulacion"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  🔬 Simulación interactiva
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResourceTab("video")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeResourceTab === "video"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  🎥 Video embebido
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResourceTab("pdf")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeResourceTab === "pdf"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  📄 Documento PDF
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Simulación interactiva */}
              {activeResourceTab === "simulacion" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2">🔬</span>
                      Simulación interactiva
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Agrega una URL de iframe para simulaciones, laboratorios virtuales o contenido interactivo.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título de la simulación
                        </label>
                        <input
                          type="text"
                          name="tituloSimulacion"
                          value={formData.tituloSimulacion}
                          onChange={handleChange}
                          placeholder="Ej: Laboratorio virtual de química"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL de la simulación (iframe)
                        </label>
                        <input
                          type="url"
                          name="iframeURL"
                          value={formData.iframeURL}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video embebido */}
              {activeResourceTab === "video" && (
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                      <span className="bg-red-100 text-red-600 p-1 rounded mr-2">🎥</span>
                      Video embebido
                    </h3>
                    <p className="text-red-700 text-sm mb-4">
                      Agrega videos de YouTube, Vimeo u otras plataformas usando la URL de embed.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título del video</label>
                        <input
                          type="text"
                          name="tituloVideoEmbebido"
                          value={formData.tituloVideoEmbebido}
                          onChange={handleChange}
                          placeholder="Ej: Introducción al tema"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL del video embebido
                        </label>
                        <input
                          type="url"
                          name="videoEmbebido"
                          value={formData.videoEmbebido}
                          onChange={handleChange}
                          placeholder="https://www.youtube.com/embed/VIDEO_ID"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Formatos:</strong>
                            <br />
                            • YouTube: https://www.youtube.com/embed/VIDEO_ID
                            <br />
                            • Vimeo: https://player.vimeo.com/video/VIDEO_ID
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documento PDF */}
              {activeResourceTab === "pdf" && (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                      <span className="bg-green-100 text-green-600 p-1 rounded mr-2">📄</span>
                      Documento PDF
                    </h3>
                    <p className="text-green-700 text-sm mb-4">
                      Sube un archivo PDF que los estudiantes podrán ver y descargar.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título del documento
                        </label>
                        <input
                          type="text"
                          name="tituloPDF"
                          value={formData.tituloPDF}
                          onChange={handleChange}
                          placeholder="Ej: Manual de laboratorio"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.archivoAdjuntoUrl ? "Cambiar archivo PDF (opcional)" : "Subir archivo PDF"}
                        </label>
                        {formData.archivoAdjuntoUrl && (
                          <div className="mb-3 p-3 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Archivo actual:</strong> {formData.tituloPDF || "Documento PDF"}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-7">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <p className="pt-1 text-sm text-gray-600">
                                Arrastra un PDF aquí o haz clic para seleccionar
                              </p>
                              <p className="text-xs text-gray-500">PDF hasta 10MB</p>
                            </div>
                            <input
                              type="file"
                              className="opacity-0"
                              accept=".pdf"
                              onChange={handleArchivoChange}
                            />
                          </label>
                        </div>
                        {archivoAdjunto && (
                          <div className="mt-3 p-3 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>Archivo seleccionado:</strong> {archivoAdjunto.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Imagen del módulo */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="bg-white/20 p-2 rounded-full mr-3">🖼️</span>
                Imagen del módulo
              </h2>
            </div>
            <div className="p-6">
              {/* Imagen actual */}
              {imagenActual && !imagenPreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Imagen actual:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagenActual || "/placeholder.svg"}
                      alt="Imagen actual del módulo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Preview de la nueva imagen */}
              {imagenPreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Nueva imagen seleccionada:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagenPreview || "/placeholder.svg"}
                      alt="Vista previa de la nueva imagen"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagen(null)
                        setImagenPreview("")
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Input para subir nueva imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {imagenActual ? "Cambiar imagen (opcional)" : "Subir imagen (opcional)"}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <p className="pt-1 text-sm text-gray-600">
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                    <input type="file" className="opacity-0" accept="image/*" onChange={handleImagenChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={subiendo}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
              >
                {subiendo ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                disabled={subiendo}
                className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarModulo;


