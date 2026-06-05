import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import toast from 'react-hot-toast';
import { generateId } from '../../utils/helpers';

// ---- Tipos ----
type PermissionKey = 'crear' | 'leer' | 'editar' | 'eliminar';

interface ModulePermission {
  modulo: string;
  icono: string;
  crear: boolean;
  leer: boolean;
  editar: boolean;
  eliminar: boolean;
}

interface Role {
  id: string;
  nombre: string;
  descripcion: string;
  usuariosAsignados: number;
  permisos: ModulePermission[];
  color: string;
}

// ---- Modulos del sistema ----
const MODULES = [
  { modulo: 'Dashboard',          icono: 'pi-home' },
  { modulo: 'Ordenes de Trabajo', icono: 'pi-file-edit' },
  { modulo: 'Tareas',             icono: 'pi-list-check' },
  { modulo: 'Inventario',         icono: 'pi-box' },
  { modulo: 'Clientes',           icono: 'pi-building' },
  { modulo: 'Servicios',          icono: 'pi-wrench' },
  { modulo: 'Catalogos',          icono: 'pi-tags' },
  { modulo: 'Usuarios',           icono: 'pi-users' },
  { modulo: 'Roles',              icono: 'pi-shield' },
  { modulo: 'Reportes',           icono: 'pi-chart-bar' },
];

const PERMS_LABELS: Record<PermissionKey, string> = {
  crear: 'Crear', leer: 'Leer', editar: 'Editar', eliminar: 'Eliminar',
};

const PERM_ICONS: Record<PermissionKey, string> = {
  crear: 'pi-plus', leer: 'pi-eye', editar: 'pi-pencil', eliminar: 'pi-trash',
};

const PERM_COLORS: Record<PermissionKey, string> = {
  crear: '#16a34a', leer: '#2563eb', editar: '#d97706', eliminar: '#dc2626',
};

const buildDefaultPerms = (todo = false): ModulePermission[] =>
  MODULES.map((m) => ({
    modulo: m.modulo,
    icono: m.icono,
    crear: todo,
    leer: todo,
    editar: todo,
    eliminar: todo,
  }));

// ---- Roles iniciales ----
const INITIAL_ROLES: Role[] = [
  {
    id: 'r1',
    nombre: 'Administrador',
    descripcion: 'Acceso completo a todos los modulos del sistema',
    usuariosAsignados: 2,
    color: '#7c3aed',
    permisos: buildDefaultPerms(true),
  },
  {
    id: 'r2',
    nombre: 'Gerencia',
    descripcion: 'Supervision general, reportes y aprobaciones',
    usuariosAsignados: 3,
    color: '#1d4ed8',
    permisos: buildDefaultPerms(false).map((p) => ({
      ...p,
      leer: true,
      crear: ['Ordenes de Trabajo', 'Tareas'].includes(p.modulo),
      editar: ['Ordenes de Trabajo', 'Tareas', 'Clientes'].includes(p.modulo),
    })),
  },
  {
    id: 'r3',
    nombre: 'Mecanico',
    descripcion: 'Solo puede ver y actualizar sus tareas asignadas',
    usuariosAsignados: 8,
    color: '#d97706',
    permisos: buildDefaultPerms(false).map((p) => ({
      ...p,
      leer:  ['Dashboard', 'Tareas'].includes(p.modulo),
      editar: p.modulo === 'Tareas',
    })),
  },
  {
    id: 'r4',
    nombre: 'Almacen',
    descripcion: 'Gestion de inventario y movimientos',
    usuariosAsignados: 2,
    color: '#059669',
    permisos: buildDefaultPerms(false).map((p) => ({
      ...p,
      leer:    ['Dashboard', 'Inventario'].includes(p.modulo),
      crear:   p.modulo === 'Inventario',
      editar:  p.modulo === 'Inventario',
    })),
  },
];

const fieldLabel: React.CSSProperties = {
  display: 'block', marginBottom: '0.35rem',
  fontSize: '0.78rem', fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

export const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selected, setSelected] = useState<Role | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({ nombre: '', descripcion: '', color: '#3B6CB4' });
  const [editPerms, setEditPerms] = useState<ModulePermission[]>([]);

  const openNew = () => {
    setForm({ nombre: '', descripcion: '', color: '#3B6CB4' });
    setIsEdit(false);
    setShowDialog(true);
  };

  const openEdit = (role: Role) => {
    setForm({ nombre: role.nombre, descripcion: role.descripcion, color: role.color });
    setSelected(role);
    setIsEdit(true);
    setShowDialog(true);
  };

  const openPerms = (role: Role) => {
    setSelected(role);
    setEditPerms(role.permisos.map((p) => ({ ...p })));
    setShowPerms(true);
  };

  const handleSave = () => {
    if (!form.nombre.trim()) { toast.error('El nombre del rol es obligatorio'); return; }
    if (isEdit && selected) {
      setRoles((prev) => prev.map((r) => r.id === selected.id ? { ...r, ...form } : r));
      toast.success('Rol actualizado');
    } else {
      const newRole: Role = {
        id: generateId(),
        nombre: form.nombre,
        descripcion: form.descripcion,
        color: form.color,
        usuariosAsignados: 0,
        permisos: buildDefaultPerms(false),
      };
      setRoles((prev) => [...prev, newRole]);
      toast.success('Rol creado');
    }
    setShowDialog(false);
  };

  const handleSavePerms = () => {
    if (!selected) return;
    setRoles((prev) => prev.map((r) =>
      r.id === selected.id ? { ...r, permisos: editPerms } : r
    ));
    toast.success('Permisos guardados');
    setShowPerms(false);
  };

  const togglePerm = (modulo: string, perm: PermissionKey) => {
    setEditPerms((prev) => prev.map((p) =>
      p.modulo === modulo ? { ...p, [perm]: !p[perm] } : p
    ));
  };

  const toggleAllForModule = (modulo: string, value: boolean) => {
    setEditPerms((prev) => prev.map((p) =>
      p.modulo === modulo ? { ...p, crear: value, leer: value, editar: value, eliminar: value } : p
    ));
  };

  const toggleAllForPerm = (perm: PermissionKey, value: boolean) => {
    setEditPerms((prev) => prev.map((p) => ({ ...p, [perm]: value })));
  };

  // Vista previa de menu segun permisos del rol seleccionado
  const menuVisible = selected?.permisos.filter((p) => p.leer) ?? [];

  const deleteRole = (role: Role) => {
    if (role.usuariosAsignados > 0) {
      toast.error(`No se puede eliminar: ${role.usuariosAsignados} usuario(s) asignados`);
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== role.id));
    toast.success('Rol eliminado');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Roles y Permisos</div>
          <div className="page-header-subtitle">{roles.length} roles configurados en el sistema</div>
        </div>
        <div className="page-header-actions">
          <Button label="Nuevo Rol" icon="pi pi-plus" onClick={openNew} />
        </div>
      </div>

      {/* Grid de roles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.1rem',
        marginBottom: '1.5rem',
      }}>
        {roles.map((role) => {
          const totalPerms = role.permisos.reduce(
            (acc, p) => acc + (p.crear ? 1 : 0) + (p.leer ? 1 : 0) + (p.editar ? 1 : 0) + (p.eliminar ? 1 : 0), 0
          );
          const maxPerms = MODULES.length * 4;
          const pct = Math.round((totalPerms / maxPerms) * 100);

          return (
            <div key={role.id} className="surface-card" style={{ borderLeft: `5px solid ${role.color}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `${role.color}22`, color: role.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}>
                    <i className="pi pi-shield" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {role.nombre}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {role.descripcion}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{
                  flex: 1, background: 'var(--bg-surface-2)',
                  borderRadius: '8px', padding: '0.6rem 0.8rem', textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {role.usuariosAsignados}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Usuarios
                  </div>
                </div>
                <div style={{
                  flex: 1, background: 'var(--bg-surface-2)',
                  borderRadius: '8px', padding: '0.6rem 0.8rem', textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: role.color }}>
                    {pct}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Acceso
                  </div>
                </div>
                <div style={{
                  flex: 1, background: 'var(--bg-surface-2)',
                  borderRadius: '8px', padding: '0.6rem 0.8rem', textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {totalPerms}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Permisos
                  </div>
                </div>
              </div>

              {/* Barra de acceso */}
              <div style={{ marginBottom: '1rem' }}>
                <div className="progress-bar-container" style={{ height: '7px' }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: role.color }} />
                </div>
              </div>

              {/* Modulos con acceso (badges) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                {role.permisos.filter((p) => p.leer).map((p) => (
                  <span key={p.modulo} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.15rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}>
                    <i className={`pi ${p.icono}`} style={{ fontSize: '0.7rem' }} />
                    {p.modulo}
                  </span>
                ))}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button label="Permisos" icon="pi pi-shield" className="p-button-sm"
                  style={{ background: role.color, border: 'none', flex: 1 }}
                  onClick={() => openPerms(role)} />
                <Button label="Editar" icon="pi pi-pencil" className="p-button-sm p-button-outlined"
                  onClick={() => openEdit(role)} />
                <Button icon="pi pi-trash" className="p-button-sm p-button-text p-button-danger"
                  tooltip="Eliminar rol" onClick={() => deleteRole(role)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ====== Dialog Nuevo / Editar Rol ====== */}
      <Dialog
        header={isEdit ? 'Editar Rol' : 'Nuevo Rol'}
        visible={showDialog}
        style={{ width: '500px', maxWidth: '96vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={fieldLabel}>Nombre del Rol *</label>
            <InputText
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              style={{ width: '100%' }}
              placeholder="Ej: Inspector de Calidad"
            />
          </div>
          <div>
            <label style={fieldLabel}>Descripcion</label>
            <InputTextarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={3} style={{ width: '100%' }} autoResize
              placeholder="Describe las responsabilidades de este rol..."
            />
          </div>
          <div>
            <label style={fieldLabel}>Color identificador</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                style={{
                  width: 44, height: 44, border: '1px solid var(--border-color)',
                  borderRadius: '8px', cursor: 'pointer', padding: '2px',
                }}
              />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Este color identificara visualmente al rol en todo el sistema
              </span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* ====== Dialog Editar Permisos ====== */}
      <Dialog
        header={selected ? `Permisos del rol: ${selected.nombre}` : 'Permisos'}
        visible={showPerms}
        style={{ width: '900px', maxWidth: '97vw' }}
        onHide={() => setShowPerms(false)}
        maximizable
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowPerms(false)} />
            <Button label="Guardar Permisos" icon="pi pi-shield" className="p-button-success" onClick={handleSavePerms} />
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>
            {/* Matriz de permisos */}
            <div>
              <div style={{
                background: 'var(--bg-surface-2)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
              }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr repeat(4, 90px)',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-sidebar)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  gap: '0.25rem',
                }}>
                  <span>Modulo</span>
                  {(['crear', 'leer', 'editar', 'eliminar'] as PermissionKey[]).map((perm) => (
                    <div key={perm} style={{ textAlign: 'center' }}>
                      <div style={{ color: PERM_COLORS[perm], marginBottom: '0.15rem' }}>
                        <i className={`pi ${PERM_ICONS[perm]}`} />
                      </div>
                      <div>{PERMS_LABELS[perm]}</div>
                    </div>
                  ))}
                </div>

                {/* Fila "Todos" */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr repeat(4, 90px)',
                  padding: '0.65rem 1rem',
                  background: 'var(--bg-surface-2)',
                  borderBottom: '2px solid var(--border-color)',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Seleccionar todo
                  </span>
                  {(['crear', 'leer', 'editar', 'eliminar'] as PermissionKey[]).map((perm) => {
                    const allChecked = editPerms.every((p) => p[perm]);
                    return (
                      <div key={perm} style={{ textAlign: 'center' }}>
                        <Checkbox
                          checked={allChecked}
                          onChange={(e) => toggleAllForPerm(perm, !!e.checked)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Filas por modulo */}
                {editPerms.map((p, idx) => {
                  const allChecked = p.crear && p.leer && p.editar && p.eliminar;
                  return (
                    <div key={p.modulo} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr repeat(4, 90px)',
                      padding: '0.65rem 1rem',
                      background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface-2)',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-light)',
                      gap: '0.25rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Checkbox
                          checked={allChecked}
                          onChange={(e) => toggleAllForModule(p.modulo, !!e.checked)}
                        />
                        <i className={`pi ${p.icono}`} style={{ color: 'var(--color-primary-400)', fontSize: '1rem' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {p.modulo}
                        </span>
                      </div>
                      {(['crear', 'leer', 'editar', 'eliminar'] as PermissionKey[]).map((perm) => (
                        <div key={perm} style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={p[perm]}
                            onChange={() => togglePerm(p.modulo, perm)}
                            style={{ accentColor: PERM_COLORS[perm] }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vista previa menu */}
            <div>
              <div style={{
                background: 'var(--bg-sidebar)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'sticky',
                top: 0,
              }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  Vista previa del menu
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                  {editPerms.filter((p) => p.leer).length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                      <i className="pi pi-ban" style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                      Sin acceso a ningun modulo
                    </div>
                  ) : (
                    editPerms.filter((p) => p.leer).map((p) => (
                      <div key={p.modulo} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 1rem',
                        color: 'rgba(255,255,255,0.78)',
                        fontSize: '0.88rem',
                        fontWeight: 500,
                      }}>
                        <i className={`pi ${p.icono}`} style={{ fontSize: '1rem', minWidth: '1rem' }} />
                        <span>{p.modulo}</span>
                        {/* Badges de acciones */}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.2rem' }}>
                          {p.crear    && <span style={{ width: 6, height: 6, borderRadius: '50%', background: PERM_COLORS.crear }} />}
                          {p.editar   && <span style={{ width: 6, height: 6, borderRadius: '50%', background: PERM_COLORS.editar }} />}
                          {p.eliminar && <span style={{ width: 6, height: 6, borderRadius: '50%', background: PERM_COLORS.eliminar }} />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                }}>
                  {editPerms.filter((p) => p.leer).length} modulos visibles
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
