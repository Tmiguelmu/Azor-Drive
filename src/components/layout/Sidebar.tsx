import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { AzorLogo } from './AzorLogo';
import { Button } from 'primereact/button';
import toast from 'react-hot-toast';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar = ({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) => {
  const { user, menuPerms, logout } = useAuth();
  const navigate = useNavigate();

  // Contadores para badges
  const tareas = useAppSelector((s) => s.tareas.tareas);
  const tareasPendientes = tareas.filter((t) => ['activa', 'asignada', 'en_progreso'].includes(t.estado)).length;
  const tareasCompletadas = tareas.filter((t) => t.estado === 'completada').length;
  const misTareas = user
    ? tareas.filter((t) => t.asignadoA === user.id && ['asignada', 'en_progreso'].includes(t.estado)).length
    : 0;

  const handleLogout = () => {
    logout();
    toast.success('Sesion cerrada correctamente');
    navigate('/login');
  };

  const buildNavSections = (): NavSection[] => {
    if (!menuPerms) return [];

    const sections: NavSection[] = [];

    sections.push({
      title: 'Principal',
      items: [
        { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
      ],
    });

    const operaciones: NavItem[] = [];
    if (menuPerms.ordenes)
      operaciones.push({ label: 'Ordenes de Trabajo', icon: 'pi pi-file-edit', path: '/ordenes' });
    if (menuPerms.tareas)
      operaciones.push({ label: 'Gestion de Tareas', icon: 'pi pi-list-check', path: '/tareas', badge: tareasPendientes || undefined });
    if (menuPerms.misTareas)
      operaciones.push({ label: 'Mis Tareas', icon: 'pi pi-user-edit', path: '/mis-tareas', badge: misTareas || undefined });
    if (menuPerms.tareasValidar)
      operaciones.push({ label: 'Validar Tareas', icon: 'pi pi-check-circle', path: '/validar-tareas', badge: tareasCompletadas || undefined });
    if (operaciones.length > 0)
      sections.push({ title: 'Operaciones', items: operaciones });

    const almacen: NavItem[] = [];
    if (menuPerms.inventario) {
      almacen.push({ label: 'Inventario', icon: 'pi pi-box', path: '/inventario' });
    }
    if (almacen.length > 0)
      sections.push({ title: 'Almacen', items: almacen });

    const catalogos: NavItem[] = [];
    if (menuPerms.clientes)
      catalogos.push({ label: 'Clientes', icon: 'pi pi-building', path: '/clientes' });
    if (menuPerms.servicios)
      catalogos.push({ label: 'Servicios', icon: 'pi pi-wrench', path: '/servicios' });
    if (menuPerms.catalogos)
      catalogos.push({ label: 'Agrupaciones', icon: 'pi pi-tags', path: '/catalogos' });
    if (catalogos.length > 0)
      sections.push({ title: 'Catalogos', items: catalogos });

    const admin: NavItem[] = [];
    if (menuPerms.usuarios)
      admin.push({ label: 'Usuarios', icon: 'pi pi-users', path: '/usuarios' });
    if (menuPerms.roles)
      admin.push({ label: 'Roles y Permisos', icon: 'pi pi-shield', path: '/roles' });
    if (menuPerms.reportes)
      admin.push({ label: 'Reportes', icon: 'pi pi-chart-bar', path: '/reportes' });
    if (admin.length > 0)
      sections.push({ title: 'Administracion', items: admin });

    return sections;
  };

  const sections = buildNavSections();

  const getInitials = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay visible" onClick={onCloseMobile} />
      )}
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <AzorLogo size={36} />
          <div>
            <div className="sidebar-logo-text">AZOR</div>
            <div className="sidebar-logo-sub">Drive ERP</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-header">
                <span className="sidebar-section-title">{section.title}</span>
              </div>
              <div className="sidebar-section-line" />
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                >
                  <i className={`sidebar-item-icon ${item.icon}`} />
                  <span className="sidebar-item-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="sidebar-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer usuario */}
        <div className="sidebar-footer">
          {user && !collapsed && (
            <div style={{
              marginBottom: '0.8rem',
              paddingBottom: '0.8rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-gold-500)',
                color: '#1B2A4A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 800,
                flexShrink: 0,
              }}>
                {getInitials(user.nombre)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.nombre}
                </div>
                <div style={{ color: 'var(--color-gold-400)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}
          {user && collapsed && (
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-gold-500)',
                color: '#1B2A4A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 800,
                margin: '0 auto',
              }}>
                {getInitials(user.nombre)}
              </div>
            </div>
          )}
          <Button
            icon="pi pi-sign-out"
            label={collapsed ? undefined : 'Cerrar Sesion'}
            className="p-button-text p-button-sm"
            style={{
              color: 'rgba(255,255,255,0.6)',
              width: '100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
            }}
            onClick={handleLogout}
          />
        </div>
      </nav>
    </>
  );
};
