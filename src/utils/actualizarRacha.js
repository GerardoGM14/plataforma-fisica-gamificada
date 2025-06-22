import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { differenceInCalendarDays, format } from "date-fns";

export const actualizarRachaDiaria = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "usuarios", user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    const data = snapshot.data();

    const hoy = new Date();
    const hoyStr = format(hoy, "yyyy-MM-dd");
    const ultimaAcceso = data.ultimaFechaAcceso || null;

    if (!ultimaAcceso) {
      // Primer acceso
      await updateDoc(ref, {
        rachaActual: 1,
        rachaMaxima: 1,
        ultimaFechaAcceso: hoyStr
      });
      return;
    }

    const diasDiferencia = differenceInCalendarDays(hoy, new Date(ultimaAcceso));

    if (diasDiferencia === 1) {
      // Mantuvo la racha
      const nuevaRacha = (data.rachaActual || 0) + 1;
      const nuevaMaxima = Math.max(nuevaRacha, data.rachaMaxima || 0);
      await updateDoc(ref, {
        rachaActual: nuevaRacha,
        rachaMaxima: nuevaMaxima,
        ultimaFechaAcceso: hoyStr
      });
    } else if (diasDiferencia === 0) {
      // Ya ingresó hoy, no actualizamos
    } else {
      // Racha rota
      await updateDoc(ref, {
        rachaActual: 1,
        ultimaFechaAcceso: hoyStr
      });
    }
  }
};
