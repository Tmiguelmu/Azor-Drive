import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PrimeReactProvider } from 'primereact/api';
import { useTheme } from './hooks/useTheme';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NotFoundPage } from './components/common/NotFoundPage';

import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { OrdenesPage } from './pages/ordenes/OrdenesPage';
import { TareasPage } from './pages/tareas/TareasPage';
import { MisTareasPage } from './pages/tareas/MisTareasPage';
import { ValidarTareasPage } from './pages/tareas/ValidarTareasPage';
import { InventarioPage } from './pages/inventario/InventarioPage';
import { ClientesPage } from './pages/clientes/ClientesPage';
import { ServiciosPage } from './pages/servicios/ServiciosPage';
import { CatalogosPage } from './pages/catalogos/CatalogosPage';
import { UsuariosPage } from './pages/usuarios/UsuariosPage';
import { RolesPage } from './pages/roles/RolesPage';
import { ReportesPage } from './pages/reportes/ReportesPage';

const AppThemeWrapper = () => {
  useTheme();
  return null;
};

function App() {
  return (
    <PrimeReactProvider>
      <AppThemeWrapper />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<DashboardPage />} />
            <Route path="ordenes"        element={<OrdenesPage />} />
            <Route path="tareas"         element={<TareasPage />} />
            <Route path="mis-tareas"     element={<MisTareasPage />} />
            <Route path="validar-tareas" element={<ValidarTareasPage />} />
            <Route path="inventario"     element={<InventarioPage />} />
            <Route path="clientes"       element={<ClientesPage />} />
            <Route path="servicios"      element={<ServiciosPage />} />
            <Route path="catalogos"      element={<CatalogosPage />} />
            <Route path="usuarios"       element={<UsuariosPage />} />
            <Route path="roles"          element={<RolesPage />} />
            <Route path="reportes"       element={<ReportesPage />} />
            <Route path="*"              element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.9rem',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: 'white' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: 'white' } },
        }}
      />
    </PrimeReactProvider>
  );
}

export default App;
