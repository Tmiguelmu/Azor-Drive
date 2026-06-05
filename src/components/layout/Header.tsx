import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROLE_LABELS } from '../../utils/permissions';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

const BREADCRUMB_MAP: Record<string, { section: string; label: string }> = {
  '/dashboard':      { section: 'Principal', label: 'Dashboard' },
  '/ordenes':        { section: 'Operaciones', label: 'Ordenes de Trabajo' },
  '/tareas':         { section: 'Operaciones', label: 'Gestion de Tareas' },
  '/mis-tareas':     { section: 'Operaciones', label: 'Mis Tareas' },
  '/validar-tareas': { section: 'Operaciones', label: 'Validar Tareas' },
  '/inventario':     { section: 'Almacen', label: 'Inventario' },
  '/clientes':       { section: 'Catalogos', label: 'Clientes' },
  '/servicios':      { section: 'Catalogos', label: 'Servicios' },
  '/catalogos':      { section: 'Catalogos', label: 'Agrupaciones' },
  '/usuarios':       { section: 'Administracion', label: 'Usuarios' },
  '/roles':          { section: 'Administracion', label: 'Roles y Permisos' },
  '/reportes':       { section: 'Administracion', label: 'Reportes' },
};

const MOCK_NOTIFS = [
  { id: 1, texto: '3 tareas pendientes de validar', tipo: 'warning', hora: '09:15' },
  { id: 2, texto: 'Stock bajo: Filtro aceite motor', tipo: 'danger', hora: '08:42' },
  { id: 3, texto: 'OT-2024-008 cerrada exitosamente', tipo: 'success', hora: '08:05' },
];

export const Header = ({ onToggleSidebar, title }: HeaderProps) => {
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);

  const breadcrumb = BREADCRUMB_MAP[location.pathname];

  const getInitials = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  const NOTIF_COLORS: Record<string, string> = {
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    success: 'var(--color-success)',
    info: 'var(--color-info)',
  };

  const NOTIF_ICONS: Record<string, string> = {
    warning: 'pi-exclamation-triangle',
    danger: 'pi-times-circle',
    success: 'pi-check-circle',
    info: 'pi-info-circle',
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="toggle-sidebar-btn" onClick={onToggleSidebar} title="Colapsar menu">
          <i className="pi pi-bars" />
        </button>

        {breadcrumb ? (
          <div className="header-breadcrumb">
            <span className="header-breadcrumb-item">Azor Drive</span>
            <span className="header-breadcrumb-sep">
              <i className="pi pi-chevron-right" style={{ fontSize: '0.7rem' }} />
            </span>
            <span className="header-breadcrumb-item">{breadcrumb.section}</span>
            <span className="header-breadcrumb-sep">
              <i className="pi pi-chevron-right" style={{ fontSize: '0.7rem' }} />
            </span>
            <span className="header-breadcrumb-item current">{breadcrumb.label}</span>
          </div>
        ) : (
          <span className="header-breadcrumb-item current">{title}</span>
        )}
      </div>

      <div className="header-right">
        {/* Busqueda global */}
        <div className="header-search">
          <i className="pi pi-search" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} />
          <input type="text" placeholder="Buscar en el sistema..." />
          <kbd style={{
            background: 'var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.68rem',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            fontFamily: 'inherit',
          }}>Ctrl+K</kbd>
        </div>

        {/* Toggle dark/light */}
        <button
          className="toggle-sidebar-btn"
          onClick={toggle}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          <i className={isDark ? 'pi pi-sun' : 'pi pi-moon'} />
        </button>

        {/* Notificaciones */}
        <div style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            onClick={() => setShowNotifs((v) => !v)}
            title="Notificaciones"
          >
            <i className="pi pi-bell" />
            <span className="notif-badge">{MOCK_NOTIFS.length}</span>
          </button>

          {showNotifs && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                onClick={() => setShowNotifs(false)}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '340px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0.9rem 1.2rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notificaciones</span>
                  <span style={{
                    background: 'var(--color-primary-100)',
                    color: 'var(--color-primary-600)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.5rem',
                    borderRadius: '10px',
                  }}>{MOCK_NOTIFS.length} nuevas</span>
                </div>
                {MOCK_NOTIFS.map((n) => (
                  <div key={n.id} style={{
                    padding: '0.85rem 1.2rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: `${NOTIF_COLORS[n.tipo]}22`,
                      color: NOTIF_COLORS[n.tipo],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}>
                      <i className={`pi ${NOTIF_ICONS[n.tipo]}`} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {n.texto}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Hoy a las {n.hora}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{
                  padding: '0.75rem 1.2rem',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  color: 'var(--color-primary-500)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
                  Ver todas las notificaciones
                </div>
              </div>
            </>
          )}
        </div>

        {/* User chip */}
        {user && (
          <div className="user-chip">
            <div className="user-chip-avatar">
              {getInitials(user.nombre)}
            </div>
            <div>
              <div className="user-chip-name">{user.nombre.split(' ')[0]}</div>
              <div className="user-chip-role">{ROLE_LABELS[user.rol]}</div>
            </div>
            <i className="pi pi-chevron-down" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
    </header>
  );
};
