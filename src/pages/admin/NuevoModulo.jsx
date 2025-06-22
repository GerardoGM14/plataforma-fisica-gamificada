import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function NuevoModulo() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [subtemas, setSubtemas] = useState("");
  const [puntosAlCompletar, setPuntosAlCompletar] = useState(100);
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);
    try {
      let imagenUrl = "";

      if (imagen) {
        const storage = getStorage();
        const storageRef = ref(storage, `modulos/${Date.now()}_${imagen.name}`);
        await uploadBytes(storageRef, imagen);
        imagenUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "modulos"), {
        titulo,
        descripcion,
        subtemas: subtemas.split(",").map(s => s.trim()),
        puntosAlCompletar: parseInt(puntosAlCompletar),
        imagenUrl,
        insigniaAlCompletar: null
      });

      navigate("/admin/modulos");
    } catch (error) {
      console.error("Error al crear módulo:", error);
    }
    setSubiendo(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">➕ Nuevo Módulo</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded max-w-xl mx-auto">
        <label className="block mb-3 font-semibold">Título:</label>
        <input 
          type="text" className="w-full border p-2 rounded mb-4" 
          value={titulo} onChange={e => setTitulo(e.target.value)} required 
        />

        <label className="block mb-3 font-semibold">Descripción:</label>
        <textarea 
          className="w-full border p-2 rounded mb-4"
          value={descripcion} onChange={e => setDescripcion(e.target.value)} required
        ></textarea>

        <label className="block mb-3 font-semibold">Subtemas (separados por coma):</label>
        <input 
          type="text" className="w-full border p-2 rounded mb-4" 
          value={subtemas} onChange={e => setSubtemas(e.target.value)} required 
        />

        <label className="block mb-3 font-semibold">Puntos al Completar:</label>
        <input 
          type="number" className="w-full border p-2 rounded mb-4" 
          value={puntosAlCompletar} onChange={e => setPuntosAlCompletar(e.target.value)} required 
        />

        <label className="block mb-3 font-semibold">Imagen:</label>
        <input type="file" onChange={e => setImagen(e.target.files[0])} className="mb-6" />

        <button 
          type="submit"
          disabled={subiendo}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition w-full"
        >
          {subiendo ? "Subiendo..." : "Guardar Módulo"}
        </button>
      </form>
    </div>
  );
}

export default NuevoModulo;
