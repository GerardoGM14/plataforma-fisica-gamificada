import { useEffect } from "react";
import { db } from "../firebase.js";
import { collection, addDoc, getDocs } from "firebase/firestore";

console.log("🚀 Iniciando carga de preguntas por módulo...");

// Bloque de preguntas por módulo
const preguntasPorModulo = [
    {
        moduloId: "GLzAUmLdkiQ2cicZJnKs", // Dinámica
        preguntas: [
            {
                pregunta: "¿Qué enuncia la segunda ley de Newton?",
                opciones: [
                    "Todo cuerpo permanece en reposo si no actúa una fuerza",
                    "Toda acción tiene una reacción",
                    "La aceleración es proporcional a la fuerza neta e inversamente proporcional a la masa",
                    "La fuerza es igual al peso del objeto"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué unidades tiene la fuerza en el sistema internacional?",
                opciones: ["kg", "N", "m/s", "J"],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Qué ocurre si la fuerza neta sobre un cuerpo es cero?",
                opciones: [
                    "Se acelera indefinidamente",
                    "Está en equilibrio y no cambia su estado de movimiento",
                    "Se mueve con velocidad creciente",
                    "Se detiene completamente"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cuál es la relación entre masa y aceleración si la fuerza es constante?",
                opciones: [
                    "Mayor masa, mayor aceleración",
                    "No hay relación",
                    "Mayor masa, menor aceleración",
                    "Masa no afecta la aceleración"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué representa un diagrama de cuerpo libre?",
                opciones: [
                    "El entorno de un objeto",
                    "El espacio vacío",
                    "Todas las fuerzas aplicadas sobre un objeto",
                    "El movimiento del cuerpo"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "Si una fuerza actúa sobre un objeto en reposo, ¿qué provoca?",
                opciones: [
                    "Desaceleración",
                    "Movimiento circular",
                    "Aceleración",
                    "Reducción de peso"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Cuál es la fórmula de la fuerza según Newton?",
                opciones: [
                    "F = m/g",
                    "F = m·a",
                    "F = a/m",
                    "F = m + a"
                ],
                respuestaCorrecta: 1
            }
        ]
    },

    {
        moduloId: "3fQRXZ8QcBrKRkYR0z7V", // Distribución de fuerza y movimiento en plano inclinado
        preguntas: [
            {
                pregunta: "¿Qué fuerza se opone al movimiento en un plano inclinado?",
                opciones: [
                    "Fuerza centrífuga",
                    "Fuerza gravitacional",
                    "Fuerza normal",
                    "Fuerza de fricción"
                ],
                respuestaCorrecta: 3
            },
            {
                pregunta: "¿Cuál es el ángulo típico considerado en ejercicios de planos inclinados?",
                opciones: ["0°", "45°", "90°", "Depende del ejercicio"],
                respuestaCorrecta: 3
            },
            {
                pregunta: "¿Qué componente de la fuerza pesa en la dirección del plano?",
                opciones: [
                    "mg·cos(θ)",
                    "mg·tan(θ)",
                    "mg·sin(θ)",
                    "mg·θ"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué representa la fuerza normal en el plano inclinado?",
                opciones: [
                    "La fuerza paralela al plano",
                    "La fuerza que sostiene al objeto perpendicular al plano",
                    "La fuerza que produce el movimiento",
                    "La fricción total"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cómo afecta el ángulo del plano a la fricción?",
                opciones: [
                    "A mayor ángulo, menor fricción",
                    "A mayor ángulo, mayor fricción",
                    "No afecta",
                    "La fricción desaparece"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Qué ocurre si no hay fricción en un plano inclinado?",
                opciones: [
                    "El objeto se mantiene en reposo",
                    "El objeto se desliza con aceleración constante",
                    "La fuerza neta es cero",
                    "El objeto se eleva"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Qué fórmula se usa para la fuerza neta en el plano inclinado sin fricción?",
                opciones: [
                    "F = m·g",
                    "F = m·g·cos(θ)",
                    "F = m·g·sin(θ)",
                    "F = m/a"
                ],
                respuestaCorrecta: 2
            }
        ]
    },
    {
        moduloId: "uyoFgGCB8ZxU2mkHcd9i", // Diagrama de cuerpo libre
        preguntas: [
            {
                pregunta: "¿Qué es un diagrama de cuerpo libre?",
                opciones: [
                    "Una representación de un objeto sin masa",
                    "Un gráfico de movimiento circular",
                    "Un esquema que muestra todas las fuerzas que actúan sobre un cuerpo",
                    "Un modelo tridimensional"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué tipo de fuerzas se incluyen en un diagrama de cuerpo libre?",
                opciones: [
                    "Solo fuerzas normales",
                    "Fuerzas externas y reacciones",
                    "Fuerzas centrífugas únicamente",
                    "Fuerzas ficticias"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Qué representa la dirección de la flecha en un DCL?",
                opciones: [
                    "La masa del objeto",
                    "La aceleración angular",
                    "La magnitud de la fuerza",
                    "La dirección de la fuerza"
                ],
                respuestaCorrecta: 3
            },
            {
                pregunta: "¿Qué pasa si se omite una fuerza en el diagrama?",
                opciones: [
                    "No afecta los cálculos",
                    "El cuerpo pierde masa",
                    "Se obtiene un análisis incompleto",
                    "El cuerpo se acelera más"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Cómo debe representarse la fuerza peso en un DCL?",
                opciones: [
                    "Como una flecha hacia arriba",
                    "Como una flecha horizontal",
                    "Como una flecha hacia el centro del objeto",
                    "Como una flecha hacia abajo desde el centro de masa"
                ],
                respuestaCorrecta: 3
            },
            {
                pregunta: "¿Qué condición indica equilibrio en un DCL?",
                opciones: [
                    "Suma de fuerzas no nula",
                    "Aceleración constante",
                    "Fuerza neta igual a cero",
                    "Movimiento oscilatorio"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué función cumple la fuerza de fricción en un DCL?",
                opciones: [
                    "Acelera el objeto",
                    "Anula el peso",
                    "Se opone al movimiento",
                    "Cambia la masa"
                ],
                respuestaCorrecta: 2
            }
        ]
    },

    {
        moduloId: "L5rMjoF1GDszYnoZ8eN4", // Descomposición de fuerzas
        preguntas: [
            {
                pregunta: "¿Qué es descomponer una fuerza?",
                opciones: [
                    "Dividirla en magnitudes escalares",
                    "Separarla en componentes sobre ejes coordenados",
                    "Eliminarla del sistema",
                    "Convertirla en peso"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cuáles son los ejes comúnmente usados para descomposición?",
                opciones: ["x e y", "r y θ", "x e z", "t y w"],
                respuestaCorrecta: 0
            },
            {
                pregunta: "¿Qué función cumple el coseno en la descomposición de fuerzas?",
                opciones: [
                    "Calcular la fuerza resultante",
                    "Calcular la componente perpendicular",
                    "Calcular la componente horizontal",
                    "Ajustar la masa"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué representa la hipotenusa en un triángulo de fuerzas?",
                opciones: [
                    "El peso",
                    "La componente en x",
                    "La fuerza original",
                    "La dirección del ángulo"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué ocurre si se usan ángulos incorrectos en la descomposición?",
                opciones: [
                    "Nada cambia",
                    "Se obtiene una fuerza más débil",
                    "Los resultados del análisis serán erróneos",
                    "Se calcula solo la masa"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "¿Qué pasa si una fuerza se encuentra sobre el eje y?",
                opciones: [
                    "Su componente en x es máxima",
                    "Su componente en x es cero",
                    "No tiene componente vertical",
                    "No se puede representar"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "¿Cuál es la fórmula de la componente vertical de una fuerza?",
                opciones: [
                    "F·cos(θ)",
                    "F·tg(θ)",
                    "F·sen(θ)",
                    "F·√θ"
                ],
                respuestaCorrecta: 2
            }
        ]
    }
];

// Función principal
const cargarPreguntasUnaVez = async () => {
  for (const modulo of preguntasPorModulo) {
    const ref = collection(db, `modulos/${modulo.moduloId}/preguntas`);
    console.log(`🔍 Revisando módulo: ${modulo.moduloId}`);

    try {
      const snapshot = await getDocs(ref);

      if (!snapshot.empty) {
        console.log(`⚠️ Ya existen preguntas en este módulo. Se omite carga.`);
        continue;
      }

      for (const pregunta of modulo.preguntas) {
        await addDoc(ref, pregunta);
        console.log(`✅ Pregunta añadida correctamente`);
      }
    } catch (error) {
      console.error(`❌ Error procesando módulo ${modulo.moduloId}:`, error);
    }
  }

  console.log("✅ Carga finalizada.");
};

// Ejecutar al correr con Node.js
cargarPreguntasUnaVez().catch((err) => {
  console.error("❌ Error general:", err);
});
