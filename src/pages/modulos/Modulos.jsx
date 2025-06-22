import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

function Modulos() {
  const [modulos, setModulos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      const modulosRef = collection(db, "modulos");
      const snapshot = await getDocs(modulosRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setModulos(data);
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">📚 Módulos de Aprendizaje</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map((modulo) => (
          <div key={modulo.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{modulo.titulo}</h2>
            <p className="text-sm text-gray-600 mb-4">{modulo.descripcion}</p>
            <p className="text-green-600 font-semibold mb-4">Puntos: {modulo.puntosAlCompletar}</p>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => navigate(`/modulo/${modulo.id}`)}
            >
              Ingresar al módulo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Modulos;
