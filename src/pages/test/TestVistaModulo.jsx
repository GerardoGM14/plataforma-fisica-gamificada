import { useState, useEffect } from "react";

function TestVistaModulo() {
  const [modulo, setModulo] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setModulo({
        titulo: "Simulación de módulo",
        descripcion: "Esto es solo un test para comprobar la protección del subtemas.",
        puntosAlCompletar: 100,
        // Puedes probar distintas variantes aquí:
        subtemas: null
      });
    }, 1000);
  }, []);

  if (!modulo) return <div className="p-10 text-center">Cargando módulo de prueba...</div>;

  const subtemas = Array.isArray(modulo.subtemas) ? modulo.subtemas : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">{modulo.titulo}</h1>
      <p className="text-center text-lg text-gray-700 mb-8">{modulo.descripcion}</p>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📄 Subtemas</h2>

        {subtemas.length === 0 ? (
          <p className="text-gray-400 text-center">No hay subtemas disponibles</p>
        ) : (
          <ul className="list-disc list-inside mb-6">
            {subtemas.map((subtema, index) => (
              <li key={index} className="text-gray-800 mb-2">{subtema}</li>
            ))}
          </ul>
        )}

        <p className="text-green-700 font-bold text-lg">
          Puntos al completar: {modulo.puntosAlCompletar}
        </p>
      </div>
    </div>
  );
}

export default TestVistaModulo;
