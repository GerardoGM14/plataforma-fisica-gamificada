# 📚 Plataforma Web Gamificada – Física I

Este proyecto es una plataforma interactiva desarrollada con **React + Vite + Firebase**, orientada al aprendizaje gamificado de conceptos clave del curso **Física I**. Está dirigida a estudiantes de nivel universitario, combinando contenido visual, quizzes, recursos multimedia y seguimiento personalizado.

---

## Dashboard
![Vista del sistema](https://i.postimg.cc/N0yqJ5yz/imagen-2025-06-22-102222935.png)

## Usuario (Logros)
![Vista del sistema](https://i.postimg.cc/qBKg5q5V/Imagen1.png)

## Vista de Modulos
![Vista del sistema](https://i.postimg.cc/SNDcVsb8/imagen-2025-06-22-102507399.png)

## Admin (Modulos)
![Gestión de Modulos](https://i.postimg.cc/RhkvdvFt/imagen-2025-06-22-101911943.png)

## Admin (Usuarios)
![Gestión de Usuarios](https://i.postimg.cc/rFGHQ5fm/imagen-2025-06-22-102116857.png)



## ⚙️ Tecnologías utilizadas

- ⚛️ **React** – Librería para interfaces interactivas.
- ⚡ **Vite.js** – Empaquetador rápido y moderno.
- 🎨 **TailwindCSS** – Framework de estilos para diseño responsivo.
- 🔐 **Firebase Auth** – Autenticación con correo/contraseña.
- 🔥 **Cloud Firestore** – Base de datos en tiempo real.
- ☁️ **Firebase Storage** – Gestión de archivos adjuntos (PDFs, imágenes).
- 🧭 **React Router DOM** – Navegación entre módulos y vistas protegidas.

---

## 🧠 Funcionalidades principales

### 👨‍🏫 Administrador
- Crear y editar módulos de aprendizaje.
- Subir recursos como simulaciones (iFrame) y documentos (PDF).
- Activar/desactivar la visibilidad de los módulos.
- Ver historial de acceso de estudiantes.

### 👨‍🎓 Estudiante
- Ingresar a módulos activos.
- Ver recursos de aprendizaje embebidos y descargables.
- Realizar quizzes y visualizar su progreso.
- Desbloquear insignias y puntos por participación.

---

## 🔐 Roles

- `admin`: Accede al panel de gestión y configuración.
- `usuario`: Vista educativa interactiva con seguimiento de avance.

---

## 🔥 Base de datos (Firestore)

```plaintext
modulos (collection)
 └── {moduloId}
      ├── titulo, descripcion, dificultad
      ├── imagenUrl, iframeURL, archivoAdjuntoUrl
      └── activo: true

usuarios (collection)
 └── {uid}
      ├── nombre, correo, rol, puntaje
      ├── insignias: []
      └── avances: módulos completados, quizzes resueltos
```

---

## 🛠️ Instalación local

```bash
git clone https://github.com/GerardoGM14/plataforma-fisica-gamificada.git
cd plataforma-fisica-gamificada
npm install
npm run dev
```

⚠️ Recuerda configurar tu archivo `.env` con los valores de Firebase:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-auth-domain
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
VITE_FIREBASE_APP_ID=tu-app-id

```

---

## 📁 Estructura del proyecto

```
/src
 ├── /components
 ├── /pages
      ├── /admin
      ├── /auth
      ├── /gamiificacion
      ├── /perfil
      ├── /test
 ├── /scripts
 ├── /utils
 ├── /firebase
 ├── App.jsx
 └── main.jsx

firebase.js      → Configuración de Firebase
vite.config.js   → Configuración del entorno Vite
```

---

## 📝 Licencia

Este proyecto no es de código abierto. Licenciado mediante BSL 1.1.

Desarrollado con 💻 por **Gerardo Fabian Gonzalez Moreno**
