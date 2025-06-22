import './index.css'; // 👈 aquí importas los estilos globales de Tailwind
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import Perfil from './pages/perfil/Perfil';
import Modulos from './pages/modulos/Modulos';
import VistaModulo from './pages/modulos/VistaModulo';
import QuizModulo from './pages/modulos/QuizModulo';
import Dashboard from "./pages/Dashboard";
import TestVistaModulo from "./pages/test/TestVistaModulo";
import PanelAdmin from "./pages/admin/PanelAdmin";
import ModulosAdmin from "./pages/admin/ModulosAdmin";
import NuevoModulo from "./pages/admin/NuevoModulo";
import EditarModulo from "./pages/admin/EditarModulo";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import LogsAcceso from "./pages/admin/LogsAcceso";


import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/modulos" element={<ProtectedRoute><Modulos /></ProtectedRoute>} />
        <Route path="/modulo/:id" element={<VistaModulo />} />
        <Route path="/modulo/:id/quiz" element={<QuizModulo />} />
        <Route path="/testmodulo" element={<TestVistaModulo />} />

        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/admin/modulos" element={<ModulosAdmin />} />
        <Route path="/admin/modulos/nuevo" element={<NuevoModulo />} />
        <Route path="/admin/modulos/editar/:id" element={<EditarModulo />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
        <Route path="/admin/logs" element={<LogsAcceso />} />
      </Routes>
    </Router>
  );
}

export default App;

