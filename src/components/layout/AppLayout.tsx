import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ordenes': 'Ordenes de Trabajo',
  '/tareas': 'Gestion de Tareas',
  '/mis-tareas': 'Mis Tareas',
  '/validar-tareas': 'Tareas por Validar',
  '/inventario': 'Inventario',
  '/clientes': 'Catalogo de Clientes',
  '/servicios': 'Catalogo de Servicios',
  '/catalogos': 'Agrupaciones de Facturacion',
  '/usuarios': 'Gestion de Usuarios',
  '/roles': 'Roles y Permisos',
  '/reportes': 'Reportes',
};

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const currentTitle = PAGE_TITLES[location.pathname] || 'Azor Drive';

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Header onToggleSidebar={handleToggleSidebar} title={currentTitle} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
