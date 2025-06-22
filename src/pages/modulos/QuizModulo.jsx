"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, increment, setDoc, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../../firebase"
import { onAuthStateChanged } from "firebase/auth"


// Estilos para animaciones mejoradas estilo Kahoot
const animationStyles = `
  @keyframes kahootPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes streakBounce {
    0% { transform: scale(0) rotate(0deg); }
    50% { transform: scale(1.2) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
  }
  
  @keyframes correctAnswer {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }
  
  @keyframes wrongAnswer {
    0% { transform: translateX(0); }
    25% { transform: translateX(-15px); }
    75% { transform: translateX(15px); }
    100% { transform: translateX(0); }
  }
  
  @keyframes slideInUp {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
  }
  
  @keyframes timerPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  @keyframes floatingEmoji {
    0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
  }
  
  @keyframes progressGlow {
    0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
    100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  }
  
  @keyframes buttonHover {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  
  .kahoot-pulse {
    animation: kahootPulse 0.6s ease-in-out;
  }
  
  .streak-bounce {
    animation: streakBounce 0.8s ease-out;
  }
  
  .correct-answer {
    animation: correctAnswer 0.8s ease-out forwards;
  }
  
  .wrong-answer {
    animation: wrongAnswer 0.6s ease-in-out;
  }
  
  .slide-in-up {
    animation: slideInUp 0.5s ease-out;
  }
  
  .confetti-piece {
    animation: confetti 3s linear forwards;
  }
  
  .timer-pulse {
    animation: timerPulse 1s infinite;
  }
  
  .floating-emoji {
    animation: floatingEmoji 2s ease-out forwards;
  }
  
  .progress-glow {
    animation: progressGlow 2s infinite;
  }
  
  .button-hover:hover {
    animation: buttonHover 0.3s ease-in-out;
  }
  
  .option-hover:hover {
    transform: scale(1.03) translateY(-3px);
    transition: all 0.2s ease;
  }
  
  .gradient-text {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

function QuizModulo() {
  const { id } = useParams()
  const [preguntas, setPreguntas] = useState([])
  const [modulo, setModulo] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [calificado, setCalificado] = useState(false)
  const [puntosObtenidos, setPuntosObtenidos] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tiempoTotal, setTiempoTotal] = useState(0)
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [tiempoAgotado, setTiempoAgotado] = useState(false)
  const [resultadosPorPregunta, setResultadosPorPregunta] = useState({})
  const [mostrarRetroalimentacion, setMostrarRetroalimentacion] = useState(false)
  const [animatingQuestion, setAnimatingQuestion] = useState(false)
  const [rachaCorrectas, setRachaCorrectas] = useState(0)
  const [maxRacha, setMaxRacha] = useState(0)
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null)
  const [esRespuestaCorrecta, setEsRespuestaCorrecta] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState([])
  const [puntosGanados, setPuntosGanados] = useState(0)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  // Colores mejorados y más visibles, coherentes con el diseño
  const coloresOpciones = [
    {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      hover: "hover:from-blue-600 hover:to-blue-700",
      text: "text-white",
      icon: "🔷",
      shadow: "shadow-blue-500/30",
    },
    {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      hover: "hover:from-emerald-600 hover:to-emerald-700",
      text: "text-white",
      icon: "🟢",
      shadow: "shadow-emerald-500/30",
    },
    {
      bg: "bg-gradient-to-br from-amber-500 to-orange-500",
      hover: "hover:from-amber-600 hover:to-orange-600",
      text: "text-white",
      icon: "🔶",
      shadow: "shadow-amber-500/30",
    },
    {
      bg: "bg-gradient-to-br from-rose-500 to-pink-500",
      hover: "hover:from-rose-600 hover:to-pink-600",
      text: "text-white",
      icon: "🔴",
      shadow: "shadow-rose-500/30",
    },
  ]

  // Agregar estilos de animación al documento
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = animationStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    if (!id) {
      setError("No se recibió ID de módulo")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/")
        return
      }

      try {
        setLoading(true)
        const moduloRef = doc(db, "modulos", id)
        const moduloSnap = await getDoc(moduloRef)

        if (!moduloSnap.exists()) {
          throw new Error("El módulo no existe")
        }

        const moduloData = { id: moduloSnap.id, ...moduloSnap.data() }
        setModulo(moduloData)

        const preguntasRef = collection(db, "modulos", id, "preguntas")
        const snapshot = await getDocs(preguntasRef)
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        if (data.length === 0) {
          throw new Error("No hay preguntas disponibles para este módulo")
        }

        setPreguntas(data)

        const tiempoPorPregunta = moduloData.tiempoPorPregunta || 20
        const tiempoCalculado = data.length * tiempoPorPregunta
        const tiempoMaximo = moduloData.tiempoMaximo || 600
        const tiempoFinal = Math.min(tiempoCalculado, tiempoMaximo)

        setTiempoTotal(tiempoFinal)
        setTiempoRestante(tiempoFinal)
      } catch (err) {
        console.error("Error cargando quiz:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      unsubscribe()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [id, navigate])

  // Iniciar temporizador
  useEffect(() => {
    if (preguntas.length > 0 && !calificado && !tiempoAgotado && tiempoRestante > 0 && !mostrarRespuesta) {
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTiempoAgotado(true)
            calificarAutomaticamente()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [preguntas, calificado, tiempoAgotado, mostrarRespuesta])

  const formatTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos}:${segs < 10 ? "0" : ""}${segs}`
  }

  const crearEmojiFlotante = (emoji, puntos = 0) => {
    const nuevoEmoji = {
      id: Date.now(),
      emoji,
      puntos,
      x: Math.random() * 80 + 10, // Entre 10% y 90%
      y: Math.random() * 20 + 40, // Entre 40% y 60%
    }
    setFloatingEmojis((prev) => [...prev, nuevoEmoji])

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== nuevoEmoji.id))
    }, 2000)
  }

  const handleRespuesta = (preguntaId, opcionIndex) => {
    if (mostrarRespuesta) return

    setRespuestaSeleccionada(opcionIndex)
    setRespuestas({ ...respuestas, [preguntaId]: opcionIndex })

    const pregunta = preguntas[preguntaActual]
    const esCorrecta = opcionIndex === pregunta.respuestaCorrecta
    setEsRespuestaCorrecta(esCorrecta)
    setMostrarRespuesta(true)

    // Detener el temporizador
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Calcular puntos basados en velocidad y racha
    let puntosEstaRespuesta = 0
    if (esCorrecta) {
      const tiempoUsado = (modulo.tiempoPorPregunta || 20) - tiempoRestante
      const bonusVelocidad = Math.max(0, 20 - tiempoUsado) * 5 // Bonus por velocidad
      const bonusRacha = rachaCorrectas * 10 // Bonus por racha
      puntosEstaRespuesta = 100 + bonusVelocidad + bonusRacha
      setPuntosGanados(puntosEstaRespuesta)
    }

    // Actualizar racha y crear efectos
    if (esCorrecta) {
      const nuevaRacha = rachaCorrectas + 1
      setRachaCorrectas(nuevaRacha)
      if (nuevaRacha > maxRacha) {
        setMaxRacha(nuevaRacha)
      }

      // Efectos especiales según la racha
      if (nuevaRacha >= 5) {
        setShowConfetti(true)
        crearEmojiFlotante("🔥", puntosEstaRespuesta)
        setTimeout(() => setShowConfetti(false), 3000)
      } else if (nuevaRacha >= 3) {
        crearEmojiFlotante("⚡", puntosEstaRespuesta)
      } else {
        crearEmojiFlotante("✨", puntosEstaRespuesta)
      }
    } else {
      setRachaCorrectas(0)
      crearEmojiFlotante("💪")
    }

    // Avanzar automáticamente después de 3 segundos
    setTimeout(() => {
      siguientePregunta()
    }, 3000)
  }

  const siguientePregunta = () => {
    if (preguntaActual < preguntas.length - 1) {
      setAnimatingQuestion(true)
      setMostrarRespuesta(false)
      setRespuestaSeleccionada(null)
      setPuntosGanados(0)

      setTimeout(() => {
        setPreguntaActual(preguntaActual + 1)
        setAnimatingQuestion(false)

        // Reiniciar temporizador para la siguiente pregunta
        const tiempoPorPregunta = modulo.tiempoPorPregunta || 20
        setTiempoRestante(tiempoPorPregunta)
      }, 500)
    } else {
      calificar()
    }
  }

  const calificarAutomaticamente = () => {
    if (Object.keys(respuestas).length === 0) {
      setPuntosObtenidos(0)
      setCalificado(true)
      return
    }
    calificar()
  }

  const calificar = async () => {
    let correctas = 0
    const resultados = {}

    preguntas.forEach((preg) => {
      const respuestaUsuario = respuestas[preg.id]
      const esCorrecta = respuestaUsuario === preg.respuestaCorrecta

      if (esCorrecta) {
        correctas++
      }

      resultados[preg.id] = {
        correcta: esCorrecta,
        respuestaUsuario,
        respuestaCorrecta: preg.respuestaCorrecta,
      }
    })

    setResultadosPorPregunta(resultados)

    const puntajeTotal = modulo.puntosAlCompletar || 100
    const puntaje = Math.round((correctas / preguntas.length) * puntajeTotal)
    setPuntosObtenidos(puntaje)

    try {
      const user = auth.currentUser
      if (user) {
        const userRef = doc(db, "usuarios", user.uid)
        await updateDoc(userRef, {
          puntaje: increment(puntaje),
          modulosCompletados: arrayUnion(id),
        })
        ///////////////////////////////////////////////////////////////////
        const progresoRef = doc(db, "usuarios", user.uid, "progreso", id)
        await setDoc(progresoRef, {
          moduloId: id,
          fecha: serverTimestamp(),
          preguntasCorrectas: correctas,
          totalPreguntas: preguntas.length,
          puntaje,
          duracion: tiempoTotal - tiempoRestante, // opcional
        })
        ///////////////////////////////////////////////////////////////////
      }
    } catch (error) {
      console.error("Error al guardar resultados:", error)
    }

    setCalificado(true)
    setMostrarRetroalimentacion(true)
  }

  const reiniciarQuiz = () => {
    setRespuestas({})
    setCalificado(false)
    setPuntosObtenidos(0)
    setPreguntaActual(0)
    setTiempoRestante(tiempoTotal)
    setTiempoAgotado(false)
    setMostrarRetroalimentacion(false)
    setResultadosPorPregunta({})
    setRachaCorrectas(0)
    setMaxRacha(0)
    setMostrarRespuesta(false)
    setRespuestaSeleccionada(null)
    setFloatingEmojis([])
    setPuntosGanados(0)
  }

  const porcentajeProgreso = ((preguntaActual + 1) / preguntas.length) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="text-center text-white">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div
              className="absolute inset-0 w-24 h-24 border-4 border-blue-300 border-b-transparent rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <h2 className="text-3xl font-bold mb-2 gradient-text">Preparando tu quiz...</h2>
          <p className="text-blue-200 text-lg">¡La diversión está a punto de comenzar! 🎮✨</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md mx-4 border-4 border-red-200">
          <div className="text-7xl mb-4 animate-bounce">😵</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Oops! Algo salió mal</h2>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <button
            onClick={() => navigate(`/modulo/${id}`)}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl hover:from-red-600 hover:to-rose-600 transition-all font-bold text-lg button-hover shadow-lg"
          >
            Volver al módulo
          </button>
        </div>
      </div>
    )
  }

  if (!modulo || preguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-600 to-slate-700">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md mx-4 border-4 border-gray-200">
          <div className="text-7xl mb-4">📝</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz no disponible</h2>
          <p className="text-gray-600 mb-6 text-lg">No se encontraron preguntas para este módulo.</p>
          <button
            onClick={() => navigate(`/modulo/${id}`)}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-2xl hover:from-gray-700 hover:to-slate-700 transition-all font-bold text-lg button-hover shadow-lg"
          >
            Volver al módulo
          </button>
        </div>
      </div>
    )
  }

  const pregunta = preguntas[preguntaActual]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Confetti mejorado */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece absolute w-3 h-3 rounded"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Emojis flotantes */}
      {floatingEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className="fixed pointer-events-none z-40 floating-emoji"
          style={{
            left: `${emoji.x}%`,
            top: `${emoji.y}%`,
          }}
        >
          <div className="text-4xl">{emoji.emoji}</div>
          {emoji.puntos > 0 && <div className="text-yellow-300 font-bold text-xl">+{emoji.puntos}</div>}
        </div>
      ))}

      {/* Header mejorado */}
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(`/modulo/${id}`)}
              className="flex items-center text-white hover:text-yellow-300 transition-all duration-300 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm button-hover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Salir
            </button>

            <div className="text-center text-white">
              <h1 className="text-3xl font-bold gradient-text bg-white text-transparent bg-clip-text">
                {modulo.titulo}
              </h1>
              <p className="text-blue-200 text-lg">
                Pregunta {preguntaActual + 1} de {preguntas.length}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-white">
              {/* Racha mejorada */}
              <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-4 py-2 shadow-lg">
                <span className="text-yellow-300 mr-2 text-xl">🔥</span>
                <span className="font-bold text-lg">{rachaCorrectas}</span>
              </div>

              {/* Timer mejorado */}
              <div
                className={`flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full px-4 py-2 shadow-lg ${tiempoRestante <= 10 ? "timer-pulse from-red-500 to-rose-500" : ""
                  }`}
              >
                <span className="mr-2 text-xl">⏱️</span>
                <span className="font-bold text-lg">{formatTiempo(tiempoRestante)}</span>
              </div>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="w-full bg-white/20 rounded-full h-4 mb-8 progress-glow">
            <div
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {!calificado ? (
        <div className="relative z-10 px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Pregunta mejorada */}
            <div className={`text-center mb-10 ${animatingQuestion ? "opacity-0" : "slide-in-up"}`}>
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">{pregunta.pregunta}</h2>

                {/* Mostrar racha y puntos ganados */}
                <div className="flex justify-center space-x-4 mb-4">
                  {rachaCorrectas >= 3 && (
                    <div className="streak-bounce inline-flex items-center bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                      <span className="mr-2 text-xl">🔥</span>
                      ¡Racha de {rachaCorrectas}! ¡Increíble!
                    </div>
                  )}

                  {puntosGanados > 0 && (
                    <div className="inline-flex items-center bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                      <span className="mr-2">✨</span>+{puntosGanados} puntos
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Opciones mejoradas estilo Kahoot */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${animatingQuestion ? "opacity-0" : "slide-in-up"}`}>
              {pregunta.opciones.map((opcion, i) => {
                const color = coloresOpciones[i] || coloresOpciones[0]
                let claseAdicional = ""

                if (mostrarRespuesta) {
                  if (i === pregunta.respuestaCorrecta) {
                    claseAdicional = "correct-answer ring-4 ring-green-400 from-green-500 to-emerald-600"
                  } else if (i === respuestaSeleccionada && i !== pregunta.respuestaCorrecta) {
                    claseAdicional = "wrong-answer ring-4 ring-red-400 from-red-500 to-rose-600"
                  } else {
                    claseAdicional = "opacity-50 scale-95"
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleRespuesta(pregunta.id, i)}
                    disabled={mostrarRespuesta}
                    className={`
                      ${color.bg} ${color.hover} ${color.text} ${color.shadow}
                      p-8 rounded-3xl shadow-2xl transform transition-all duration-300 
                      option-hover font-bold text-xl md:text-2xl border-2 border-white/20
                      ${claseAdicional}
                      ${!mostrarRespuesta ? "hover:scale-105 active:scale-95" : ""}
                    `}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-center justify-center space-x-4">
                      <span className="text-4xl">{color.icon}</span>
                      <span className="flex-1 text-center leading-tight">{opcion}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback de respuesta mejorado */}
            {mostrarRespuesta && (
              <div className="text-center mt-10 slide-in-up">
                <div
                  className={`inline-flex items-center px-8 py-4 rounded-full text-white font-bold text-2xl shadow-2xl ${esRespuestaCorrecta
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-red-500 to-rose-600"
                    }`}
                >
                  <span className="mr-3 text-3xl">{esRespuestaCorrecta ? "🎉" : "💪"}</span>
                  {esRespuestaCorrecta ? "¡Excelente!" : "¡Sigue así! La respuesta correcta era otra"}
                </div>

                {pregunta.explicacion && (
                  <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto shadow-xl border border-white/20">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      <span className="font-bold text-blue-600">💡 Explicación:</span> {pregunta.explicacion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pantalla de resultados mejorada */
        <div className="relative z-10 px-6 pb-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl slide-in-up border border-white/20">
              <div className="text-8xl mb-6">
                {(puntosObtenidos / (modulo.puntosAlCompletar || 100)) * 100 >= 70
                  ? "🏆"
                  : (puntosObtenidos / (modulo.puntosAlCompletar || 100)) * 100 >= 40
                    ? "🥈"
                    : "🥉"}
              </div>

              <h2 className="text-4xl font-bold text-gray-800 mb-6 gradient-text">¡Quiz Completado!</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-xl">
                  <div className="text-3xl font-bold mb-2">{puntosObtenidos}</div>
                  <div className="text-blue-100">Puntos obtenidos</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl">
                  <div className="text-3xl font-bold mb-2">
                    {Object.values(resultadosPorPregunta).filter((r) => r.correcta).length}
                  </div>
                  <div className="text-green-100">Respuestas correctas</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-xl">
                  <div className="text-3xl font-bold mb-2">{maxRacha}</div>
                  <div className="text-orange-100">Racha máxima 🔥</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={reiniciarQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all font-bold text-lg flex items-center shadow-xl button-hover"
                >
                  <span className="mr-3 text-xl">🔄</span>
                  Jugar de nuevo
                </button>

                <button
                  onClick={() => navigate(`/modulo/${id}`)}
                  className="px-8 py-4 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-2xl hover:from-gray-600 hover:to-slate-700 transition-all font-bold text-lg flex items-center shadow-xl button-hover"
                >
                  <span className="mr-3 text-xl">📚</span>
                  Volver al módulo
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all font-bold text-lg flex items-center shadow-xl button-hover"
                >
                  <span className="mr-3 text-xl">🏠</span>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizModulo
