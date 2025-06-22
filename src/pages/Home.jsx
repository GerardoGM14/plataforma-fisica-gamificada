import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe(); // cleanup
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-800">
        ¡Bienvenido, {user?.email}!
      </h1>
      <p className="text-gray-700 mb-6">Has iniciado sesión correctamente.</p>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default Home;
