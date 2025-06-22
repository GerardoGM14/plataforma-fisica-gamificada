import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import Layout from "./Layout";


function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [modulos, setModulos] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const ref = doc(db, "usuarios", currentUser.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setUserData(snapshot.data());
        }

        const modulosSnapshot = await getDocs(collection(db, "modulos"));
        const modulosLista = modulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setModulos(modulosLista);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userData) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido, {userData.correo}!</h2>
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between">
          <div>
            <p>Puntaje: <span className="font-bold">{userData.puntaje}</span></p>
            <p>Insignias: {userData.insignias.length}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Módulos disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">{modulo.titulo}</h3>
              <p className="text-sm text-gray-600 mb-4">{modulo.descripcion}</p>
              <Link
                to={`/modulo/${modulo.id}`}
                className="block bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition"
              >
                Ingresar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
