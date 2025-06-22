import { db } from "../firebase";
import { collection, addDoc, doc } from "firebase/firestore";

// Preguntas por módulo - BLOQUE 1
const preguntasPorModulo = [
  {
    moduloId: "uC8nRl2MTe7qD8G10gLT", // Conceptos básicos y representación gráfica de vectores.
    preguntas: [
      {
        pregunta: "¿Qué representa un vector?",
        opciones: ["Solo magnitud", "Solo dirección", "Magnitud y dirección", "Ninguna de las anteriores"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Cómo se representa un vector gráficamente?",
        opciones: ["Con un círculo", "Con un punto", "Con una flecha", "Con una línea recta"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Qué indica la longitud de la flecha en un vector?",
        opciones: ["Su dirección", "Su magnitud", "Su velocidad", "Su aceleración"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué indica la dirección de la flecha?",
        opciones: ["La fuerza", "El movimiento", "La dirección del vector", "La masa"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Qué sistema de referencia es necesario para ubicar vectores?",
        opciones: ["Sistema cartesiano", "Sistema internacional", "Sistema imperial", "Sistema escalar"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Un vector nulo tiene:",
        opciones: ["Magnitud 0", "Dirección infinita", "Valor negativo", "Ángulo 90°"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Cuál es la principal diferencia entre un escalar y un vector?",
        opciones: ["El color", "La unidad", "La dirección", "La temperatura"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Cuál es un ejemplo de vector?",
        opciones: ["Masa", "Temperatura", "Velocidad", "Tiempo"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Cuál es un ejemplo de magnitud escalar?",
        opciones: ["Fuerza", "Desplazamiento", "Velocidad", "Temperatura"],
        respuestaCorrecta: 3
      },
      {
        pregunta: "El ángulo entre dos vectores define:",
        opciones: ["Su magnitud", "Su relación trigonométrica", "Su desplazamiento", "Su cantidad escalar"],
        respuestaCorrecta: 1
      }
    ]
  },
  {
    moduloId: "kzz5gMdgmMapkeplJCIY", // Suma y resta de vectores con métodos gráficos.
    preguntas: [
      {
        pregunta: "¿Cómo se suman dos vectores gráficamente?",
        opciones: ["Por método cartesiano", "Por método de paralelogramo", "Por producto vectorial", "Por resta algebraica"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La suma de vectores mediante el método del triángulo es:",
        opciones: ["Poner un vector después del otro", "Restar sus componentes", "Multiplicar sus módulos", "Hallar el ángulo entre ellos"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué es el vector resultante?",
        opciones: ["La suma de las velocidades", "El escalar máximo", "El vector que suma todos los vectores", "El inverso del vector original"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La resta de vectores es equivalente a:",
        opciones: ["Sumar el vector opuesto", "Multiplicar magnitudes", "Calcular producto escalar", "Obtener el módulo mayor"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Cuando dos vectores son perpendiculares, su suma resulta en:",
        opciones: ["El doble de la magnitud mayor", "El producto de sus módulos", "Un vector diagonal", "Una fuerza nula"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Qué es el método analítico de suma de vectores?",
        opciones: ["Usar trigonometría y descomposición", "Hacer gráficas", "Multiplicar módulos", "Sumar ángulos directamente"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Para descomponer un vector se usan:",
        opciones: ["Sus componentes perpendiculares", "Su masa y aceleración", "Fuerzas opuestas", "Números complejos"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué componente se asocia al eje Y?",
        opciones: ["Coseno del ángulo", "Seno del ángulo", "Tangente del ángulo", "Cotangente del ángulo"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué componente se asocia al eje X?",
        opciones: ["Coseno del ángulo", "Seno del ángulo", "Tangente del ángulo", "Cotangente del ángulo"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "En la suma de vectores, la dirección del resultante depende de:",
        opciones: ["La suma de las masas", "El promedio de magnitudes", "La relación de sus ángulos", "La aceleración centrípeta"],
        respuestaCorrecta: 2
      }
    ]
  },
  {
    moduloId: "tD425MdCJTTXjskMKJzN", // Descomposición de vectores: seno, coseno y componentes.
    preguntas: [
      {
        pregunta: "¿Qué fórmula corresponde al componente horizontal (X)?",
        opciones: ["V·sen(θ)", "V·cos(θ)", "V·tg(θ)", "V/θ"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué fórmula corresponde al componente vertical (Y)?",
        opciones: ["V·sen(θ)", "V·cos(θ)", "V·tg(θ)", "V/θ"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué función trigonométrica relaciona cateto opuesto e hipotenusa?",
        opciones: ["Coseno", "Tangente", "Seno", "Cotangente"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Qué función trigonométrica relaciona cateto adyacente e hipotenusa?",
        opciones: ["Seno", "Tangente", "Cotangente", "Coseno"],
        respuestaCorrecta: 3
      },
      {
        pregunta: "La descomposición de un vector sirve para:",
        opciones: ["Multiplicar vectores", "Obtener los componentes en ejes perpendiculares", "Sumar módulos", "Hallar magnitud escalar"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué ángulo maximiza el componente horizontal?",
        opciones: ["0°", "45°", "90°", "180°"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué ángulo maximiza el componente vertical?",
        opciones: ["0°", "45°", "90°", "180°"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "Si θ = 30° y V = 10, ¿cuál es el componente horizontal?",
        opciones: ["5", "10", "8.66", "0"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "Si θ = 0°, el componente vertical vale:",
        opciones: ["V", "0", "V/2", "V²"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si θ = 90°, el componente horizontal vale:",
        opciones: ["0", "V", "V²", "V/2"],
        respuestaCorrecta: 0
      }
    ]
  },
  {
    moduloId: "ZqH9zsHWRvhXdndkookB", // Operaciones vectoriales en 3D.
    preguntas: [
      {
        pregunta: "¿Qué representa un vector unitario?",
        opciones: ["Magnitud 1", "Dirección indefinida", "Ángulo nulo", "Magnitud 0"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué eje está asociado a î?",
        opciones: ["X", "Y", "Z", "Ninguno"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué eje está asociado a ĵ?",
        opciones: ["X", "Y", "Z", "Ninguno"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué eje está asociado a k̂?",
        opciones: ["X", "Y", "Z", "Ninguno"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Qué operación define el producto escalar?",
        opciones: ["Proyección de un vector sobre otro", "Suma de vectores", "Multiplicación de ángulos", "Producto de unidades"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El producto vectorial genera:",
        opciones: ["Un escalar", "Un nuevo vector perpendicular", "Un ángulo", "Una magnitud negativa"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué representa el producto escalar nulo?",
        opciones: ["Vectores paralelos", "Vectores perpendiculares", "Vectores opuestos", "Vectores idénticos"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si dos vectores son paralelos, su producto escalar es:",
        opciones: ["Máximo", "Cero", "Mínimo", "Negativo"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿En qué dirección está el resultado del producto vectorial?",
        opciones: ["Misma dirección", "Perpendicular al plano de ambos", "Paralela al mayor vector", "Inversa"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué función se usa en producto escalar?",
        opciones: ["Seno", "Coseno", "Tangente", "Cotangente"],
        respuestaCorrecta: 1
      }
    ]
  }
];

// BLOQUE 2: Preguntas de los módulos 6 al 10

const preguntasPorModulo2 = [
  {
    moduloId: "MmuBNIwYMCcnLHR3OUou", // Aceleración y ecuaciones de MRUV
    preguntas: [
      {
        pregunta: "¿Qué es el MRUV?",
        opciones: ["Movimiento a velocidad constante", "Movimiento acelerado uniformemente", "Movimiento circular", "Movimiento armónico"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué magnitud permanece constante en el MRUV?",
        opciones: ["Velocidad", "Aceleración", "Tiempo", "Posición"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Cuál es la fórmula de la velocidad en MRUV?",
        opciones: ["v = v₀ + a·t", "v = d/t", "v² = v₀² + 2a·d", "v = m·a"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué indica el signo de la aceleración?",
        opciones: ["La dirección del desplazamiento", "El aumento o disminución de la velocidad", "La masa del objeto", "El tiempo que tarda"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Cuál es la unidad de aceleración?",
        opciones: ["m/s", "m/s²", "kg", "N"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "En MRUV, la gráfica velocidad-tiempo es:",
        opciones: ["Horizontal", "Recta inclinada", "Curva exponencial", "Parábola"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La distancia recorrida en MRUV es:",
        opciones: ["d = v₀t + (1/2)at²", "d = v·t", "d = m·a", "d = v² - v₀²"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "En caída libre, ¿qué valor toma 'a' en la Tierra?",
        opciones: ["9.8 m/s²", "0 m/s²", "98 m/s", "1 m/s²"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Si un cuerpo parte del reposo (v₀ = 0), la velocidad es:",
        opciones: ["v = a·t", "v = m·a", "v = v₀ + a", "v = v² + at"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El área bajo la gráfica velocidad-tiempo representa:",
        opciones: ["Tiempo", "Aceleración", "Distancia", "Velocidad promedio"],
        respuestaCorrecta: 2
      }
    ]
  },
  {
    moduloId: "P9rPOYMhPNjZf9rkGwCs", // Relación entre fuerza, masa y aceleración
    preguntas: [
      {
        pregunta: "La segunda ley de Newton es:",
        opciones: ["F = m·v", "F = m·g", "F = m·a", "F = d·t"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "Si la masa es constante, la fuerza es proporcional a:",
        opciones: ["Tiempo", "Velocidad", "Aceleración", "Desplazamiento"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La unidad de fuerza es:",
        opciones: ["kg", "N", "m/s²", "J"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Un cuerpo con masa 10kg acelerando a 2m/s² tiene fuerza:",
        opciones: ["20N", "5N", "8N", "12N"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Si no hay fuerza neta, el objeto:",
        opciones: ["Se acelera", "Mantiene su estado de movimiento", "Frena", "Disminuye masa"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si duplico la masa manteniendo la fuerza, la aceleración:",
        opciones: ["Se duplica", "Se reduce a la mitad", "Permanece igual", "Se hace cero"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué es la fuerza neta?",
        opciones: ["La suma vectorial de todas las fuerzas", "La masa total", "La fuerza normal", "La aceleración instantánea"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Si la fuerza neta es cero:",
        opciones: ["Existe aceleración", "El cuerpo está en equilibrio", "Se genera trabajo", "Disminuye velocidad"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Un objeto acelera negativamente si:",
        opciones: ["Fuerza y velocidad son opuestas", "Su masa es cero", "No existe gravedad", "Su energía es constante"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La aceleración es:",
        opciones: ["Cambio de velocidad", "Cantidad de movimiento", "Magnitud escalar", "Fuerza unitaria"],
        respuestaCorrecta: 0
      }
    ]
  },
  {
    moduloId: "renqGUk6z6vsZZ92gy3l", // Acción, reacción, diagramas de cuerpo libre
    preguntas: [
      {
        pregunta: "La tercera ley de Newton dice:",
        opciones: ["Toda fuerza tiene una reacción igual y opuesta", "Toda masa cae por gravedad", "La fuerza depende de la distancia", "El cuerpo permanece en reposo"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "¿Qué es un diagrama de cuerpo libre?",
        opciones: ["Representación de todas las fuerzas actuantes", "Suma de las velocidades", "Representación del peso", "Esquema del desplazamiento"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La fuerza normal actúa:",
        opciones: ["En paralelo a la superficie", "Perpendicular a la superficie", "En dirección de la gravedad", "En sentido opuesto al movimiento"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Cuando un cuerpo está en reposo sobre una mesa:",
        opciones: ["Fuerza neta ≠ 0", "La fuerza normal es igual al peso", "Existe aceleración", "La velocidad es constante"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La fricción estática es:",
        opciones: ["Constante", "Variable según la superficie", "Menor que la fricción cinética", "Inexistente en reposo"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué ocurre si no hay fuerza neta?",
        opciones: ["Acelera", "Velocidad uniforme o reposo", "Incrementa la energía", "Disminuye la masa"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si F normal es mayor al peso, el cuerpo:",
        opciones: ["Flota", "Cae", "Permanece estático", "Se aplasta"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Si no existiera fricción:",
        opciones: ["Todo cuerpo estaría siempre acelerado", "Los cuerpos detendrían su movimiento", "Se mantendrían en velocidad constante", "No habría gravedad"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La fricción cinética actúa cuando:",
        opciones: ["El objeto está quieto", "El objeto está en movimiento", "No hay contacto", "Hay fuerza perpendicular"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Cuando dos cuerpos interactúan, sus fuerzas son:",
        opciones: ["Iguales y opuestas", "Siempre distintas", "Solo atractivas", "Proporcionales a la velocidad"],
        respuestaCorrecta: 0
      }
    ]
  },
  {
    moduloId: "GNjfdtcIOusXQUzA7rqv", // Energía cinética, potencial y trabajo
    preguntas: [
      {
        pregunta: "El trabajo es:",
        opciones: ["Producto de fuerza por desplazamiento", "Producto de fuerza por tiempo", "Producto de masa por velocidad", "Fuerza neta aplicada"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La unidad de trabajo es:",
        opciones: ["Newton", "Julio", "Watt", "Pascal"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si no hay desplazamiento, el trabajo es:",
        opciones: ["Máximo", "Cero", "Mínimo", "Negativo"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "¿Qué es la energía cinética?",
        opciones: ["Energía en reposo", "Energía por movimiento", "Energía potencial", "Energía mecánica total"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Energía cinética depende de:",
        opciones: ["Aceleración", "Masa y velocidad", "Peso", "Área superficial"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La energía potencial gravitatoria depende de:",
        opciones: ["Masa, altura y gravedad", "Fuerza normal", "Aceleración centrípeta", "Coeficiente de fricción"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La energía potencial elástica depende de:",
        opciones: ["Constante elástica y deformación", "Gravedad", "Área superficial", "Tiempo"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El teorema trabajo-energía relaciona:",
        opciones: ["Trabajo con peso", "Trabajo con aceleración", "Trabajo con cambio de energía cinética", "Trabajo con calor"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "Si no hay fuerzas no conservativas, la energía mecánica total:",
        opciones: ["Se pierde", "Se mantiene constante", "Se duplica", "Se transforma en calor"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Cuando un cuerpo cae, su energía potencial se convierte en:",
        opciones: ["Energía cinética", "Calor", "Trabajo negativo", "Fuerza normal"],
        respuestaCorrecta: 0
      }
    ]
  },
  {
    moduloId: "I8ifuTD18AMKyFZBa20n", // Ley de conservación de energía mecánica
    preguntas: [
      {
        pregunta: "La conservación de energía dice que:",
        opciones: ["La energía se crea", "La energía se destruye", "La energía se transforma, pero no desaparece", "La masa es constante"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "En ausencia de fricción, la energía mecánica:",
        opciones: ["Disminuye", "Se mantiene", "Aumenta", "Se anula"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Cuando un objeto sube, su energía cinética:",
        opciones: ["Aumenta", "Se mantiene", "Disminuye", "Se vuelve negativa"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La suma de energía potencial y cinética da:",
        opciones: ["Trabajo total", "Energía mecánica", "Fuerza resultante", "Potencia"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si la energía potencial baja, la cinética:",
        opciones: ["Disminuye también", "Permanece igual", "Aumenta", "Se anula"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La energía no conservativa es:",
        opciones: ["La energía cinética", "El trabajo de fricción", "El peso del objeto", "La aceleración centrípeta"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Cuando cae un objeto libremente:",
        opciones: ["La energía total disminuye", "La potencial aumenta", "La cinética aumenta", "No hay energía involucrada"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "¿Qué es la energía mecánica total?",
        opciones: ["Solo energía cinética", "Solo potencial", "Suma de cinética y potencial", "Calor residual"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "Cuando rebota una pelota sin fricción:",
        opciones: ["Se conserva energía total", "Se pierde energía", "Se incrementa energía", "Disminuye el peso"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La unidad de energía en el SI es:",
        opciones: ["Newton", "Julio", "Watt", "Caloría"],
        respuestaCorrecta: 1
      }
    ]
  }
];

// BLOQUE 3: Preguntas de los módulos 11 al 15

const preguntasPorModulo3 = [
  {
    moduloId: "802uNdHCD53VhuBPm1Pm", // Movimiento armónico simple y péndulo simple
    preguntas: [
      {
        pregunta: "El movimiento armónico simple (MAS) es:",
        opciones: ["Uniformemente acelerado", "Rectilíneo uniforme", "Oscilatorio periódico", "Movimiento circular"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "El MAS tiene como característica:",
        opciones: ["Velocidad constante", "Aceleración constante", "Aceleración variable", "Desplazamiento uniforme"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La frecuencia es:",
        opciones: ["Ciclos por segundo", "Velocidad angular", "Desplazamiento máximo", "Tiempo total"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La amplitud es:",
        opciones: ["El desplazamiento máximo", "La velocidad promedio", "La aceleración instantánea", "El ángulo de giro"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La fórmula de frecuencia es:",
        opciones: ["f = 1/T", "f = T²", "f = T·π", "f = √T"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El péndulo simple depende de:",
        opciones: ["Masa del objeto", "Longitud de la cuerda", "Área de oscilación", "Fuerza centrípeta"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La fórmula del período del péndulo es:",
        opciones: ["T = 2π√(l/g)", "T = m·a", "T = d/t", "T = v²/r"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Si aumentamos la longitud del péndulo, el período:",
        opciones: ["Aumenta", "Disminuye", "No cambia", "Se vuelve cero"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "En ausencia de fricción, el MAS es:",
        opciones: ["No periódico", "Amortiguado", "Perfectamente periódico", "Uniformemente acelerado"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La unidad de frecuencia es:",
        opciones: ["Newton", "Julio", "Hertz", "Pascal"],
        respuestaCorrecta: 2
      }
    ]
  },
  {
    moduloId: "smwkjoS0vkKdkPY7OQRk", // Conceptos básicos de cinemática
    preguntas: [
      {
        pregunta: "La cinemática estudia:",
        opciones: ["Fuerzas", "Movimiento sin causas", "Energía", "Trabajo realizado"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La distancia es:",
        opciones: ["Cantidad vectorial", "Cantidad escalar", "Cantidad de aceleración", "Cantidad de fuerza"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "El desplazamiento es:",
        opciones: ["Cantidad escalar", "Magnitud negativa", "Vector entre posición final e inicial", "Peso sobre masa"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La velocidad media es:",
        opciones: ["d/t", "m·a", "F·d", "v² + v₀²"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El módulo de velocidad instantánea es igual a:",
        opciones: ["Promedio", "Tangencial", "Normal", "Gravitacional"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La aceleración media es:",
        opciones: ["Δv / Δt", "m/t", "v/d", "v²/t²"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "Cuando la aceleración es constante, se denomina:",
        opciones: ["MRU", "MCU", "MRUV", "MRUA"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "El tiempo es:",
        opciones: ["Magnitud vectorial", "Magnitud escalar", "Magnitud fuerza", "Magnitud potencial"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La posición inicial se representa como:",
        opciones: ["x₀", "v₀", "a₀", "t₀"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El SI de distancia es:",
        opciones: ["Segundo", "Metro", "Julio", "Hertz"],
        respuestaCorrecta: 1
      }
    ]
  },
  {
    moduloId: "xwcwKU4FfJX1b4oSnEZ3", // Tiro parabólico, gráficas de posición, velocidad y aceleración
    preguntas: [
      {
        pregunta: "El tiro parabólico combina:",
        opciones: ["MRU y MCU", "MRU y MRUV", "MAS y MRUV", "Fuerzas centrípetas"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "En el eje horizontal, el movimiento es:",
        opciones: ["Acelerado", "Uniforme", "Periódico", "Circular"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "En el eje vertical, el movimiento es:",
        opciones: ["MRU", "MCU", "MRUV", "Circular"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "El ángulo máximo para mayor alcance es:",
        opciones: ["30°", "45°", "60°", "90°"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La aceleración en vertical es igual a:",
        opciones: ["g", "0", "v²", "t"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "En el punto más alto, la velocidad vertical es:",
        opciones: ["Máxima", "Cero", "Negativa", "Infinita"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "El tiempo total de vuelo depende de:",
        opciones: ["Altura", "Masa", "Velocidad inicial y ángulo", "Peso total"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La trayectoria de un proyectil es:",
        opciones: ["Recta", "Circular", "Parabólica", "Elíptica"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "En ausencia de aire, el alcance horizontal:",
        opciones: ["Aumenta", "Disminuye", "Permanece constante", "Depende de peso"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La aceleración total es:",
        opciones: ["Solo horizontal", "Solo vertical", "Vertical constante", "Cero"],
        respuestaCorrecta: 2
      }
    ]
  },
  {
    moduloId: "F894np7ay5BSGWbAU2bx", // Conceptos de desplazamiento, velocidad y distancia
    preguntas: [
      {
        pregunta: "La distancia siempre es:",
        opciones: ["Negativa", "Vectorial", "Positiva o cero", "Igual a desplazamiento"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "El desplazamiento puede ser:",
        opciones: ["Negativo o positivo", "Siempre positivo", "Siempre cero", "Solo vector nulo"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "La velocidad promedio es:",
        opciones: ["Δx/Δt", "Δv/Δt", "m·a", "F·t"],
        respuestaCorrecta: 0
      },
      {
        pregunta: "El módulo de velocidad instantánea es:",
        opciones: ["Aceleración", "Desplazamiento", "Magnitud vectorial de velocidad", "Temperatura"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "Si no cambia el desplazamiento, la velocidad es:",
        opciones: ["Máxima", "Cero", "Mínima", "Infinita"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "El tiempo es siempre:",
        opciones: ["Negativo", "Infinito", "Cero", "Positivo o cero"],
        respuestaCorrecta: 3
      },
      {
        pregunta: "Si Δx es 0, el desplazamiento es:",
        opciones: ["Máximo", "Cero", "Negativo", "Infinito"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La rapidez es:",
        opciones: ["Vectorial", "Escalar", "Angular", "Mecánica"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La unidad de velocidad es:",
        opciones: ["m", "m/s", "m²", "s"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si t = 0, el desplazamiento es:",
        opciones: ["Máximo", "Infinito", "Mínimo", "Inicial"],
        respuestaCorrecta: 3
      }
    ]
  },
  {
    moduloId: "H23jNZyRFgeMQYQdpRQ2", // Aplicación de las leyes de Newton
    preguntas: [
      {
        pregunta: "Si no hay fuerza neta, el objeto:",
        opciones: ["Acelera", "Mantiene velocidad constante", "Se detiene", "Cambia masa"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si aumenta la fuerza neta sobre un cuerpo, su aceleración:",
        opciones: ["Disminuye", "Se mantiene", "Aumenta", "Cambia dirección"],
        respuestaCorrecta: 2
      },
      {
        pregunta: "La dirección de aceleración es:",
        opciones: ["Opuesta a fuerza", "Igual a fuerza", "Perpendicular", "Nula"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Cuando dos fuerzas iguales y opuestas actúan, el cuerpo está:",
        opciones: ["Acelerado", "En equilibrio", "Oscilando", "Rotando"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La fuerza neta es la:",
        opciones: ["Suma escalar de fuerzas", "Suma vectorial total", "Masa total", "Velocidad media"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si aplico una fuerza constante, la velocidad es:",
        opciones: ["Constante", "Uniformemente acelerada", "Inversamente proporcional", "Oscilante"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "El peso es igual a:",
        opciones: ["m·a", "m·g", "v·t", "m²"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "La unidad de peso es:",
        opciones: ["kg", "N", "W", "m/s²"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si la masa es cero, la fuerza neta es:",
        opciones: ["Máxima", "Nula", "Mínima", "Infinita"],
        respuestaCorrecta: 1
      },
      {
        pregunta: "Si la fuerza aumenta y la masa permanece, la aceleración:",
        opciones: ["Aumenta", "Disminuye", "No cambia", "Depende de velocidad"],
        respuestaCorrecta: 0
      }
    ]
  }
];

const preguntasCompletas = [
  ...preguntasPorModulo,
  ...preguntasPorModulo2,
  ...preguntasPorModulo3
];

// Función de carga (igual que en los módulos)
// Función de carga completa
export const cargarPreguntas = async () => {
  for (const modulo of preguntasCompletas) {
    const moduloRef = doc(db, "modulos", modulo.moduloId);
    const preguntasRef = collection(moduloRef, "preguntas");

    for (const pregunta of modulo.preguntas) {
      await addDoc(preguntasRef, pregunta);
    }
  }
  console.log("Preguntas cargadas correctamente.");
};


