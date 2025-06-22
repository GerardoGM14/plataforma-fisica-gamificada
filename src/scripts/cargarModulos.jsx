import { useEffect } from "react";
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const CargarModulos = () => {
  useEffect(() => {
    const modulos = [
      {
        titulo: "Dinámica",
        descripcion: "Estudia las fuerzas y cómo afectan al movimiento de los objetos.",
        subtemas: ["Segunda ley de Newton", "Fuerza neta", "Aceleración"],
        puntosAlCompletar: 100,
        dificultad: "Medio",
        activo: true,
        imagenUrl: "",
        fechaCreacion: serverTimestamp(),
      },
      {
        titulo: "Distribución de fuerza y movimiento en plano inclinado",
        descripcion: "Analiza cómo se comportan los cuerpos sobre superficies inclinadas.",
        subtemas: ["Fuerza normal", "Fricción", "Descomposición en ejes"],
        puntosAlCompletar: 100,
        dificultad: "Medio",
        activo: true,
        imagenUrl: "",
        fechaCreacion: serverTimestamp(),
      },
      {
        titulo: "Diagrama de cuerpo libre",
        descripcion: "Representación gráfica de todas las fuerzas que actúan sobre un objeto.",
        subtemas: ["Fuerzas externas", "Reacciones", "Equilibrio"],
        puntosAlCompletar: 100,
        dificultad: "Fácil",
        activo: true,
        imagenUrl: "",
        fechaCreacion: serverTimestamp(),
      },
      {
        titulo: "Descomposición de fuerzas",
        descripcion: "Separa una fuerza en componentes sobre ejes coordenados.",
        subtemas: ["Componentes x-y", "Ángulos", "Vectores"],
        puntosAlCompletar: 100,
        dificultad: "Medio",
        activo: true,
        imagenUrl: "",
        fechaCreacion: serverTimestamp(),
      },
    ];

    const cargar = async () => {
      const ref = collection(db, "modulos");

      for (const modulo of modulos) {
        const q = query(ref, where("titulo", "==", modulo.titulo));
        const existe = await getDocs(q);

        if (!existe.empty) {
          console.log(`⚠️ Ya existe: ${modulo.titulo}`);
          continue;
        }

        const docRef = await addDoc(ref, modulo);
        console.log(`✅ Módulo creado: ${modulo.titulo} -> ID: ${docRef.id}`);
      }
    };

    cargar();
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold text-green-600">Procesando carga de módulos...</h1>
    </div>
  );
};

export default CargarModulos;

