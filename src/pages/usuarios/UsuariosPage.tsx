import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { addUsuario, updateUsuario, deleteUsuario } from '../../store/slices/catalogosSlice';
import type { User, UserRole } from '../../types';
import { ROLE_LABELS } from '../../utils/permissions';
import { generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

const EMPTY: Omit<User, 'id'> = {
  nombre: '', email: '', rol: 'mecanico', activo: true,
};

export const UsuariosPage = () => {
  const dispatch = useAppDispatch();
  const usuarios = useAppSelector((s) => s.catalogos.usuarios);

  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });

  const rolOptions = (Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => ({ label, value }));

  const openNew = () => { setForm({ ...EMPTY }); setIsEdit(false); setShowDialog(true); };
  const openEdit = (u: User) => {
    const { id: _id, ...rest } = u;
    setForm(rest); setSelected(u); setIsEdit(true); setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.nombre || !form.email) { toast.error('Complete los campos obligatorios'); return; }
    if (isEdit && selected) {
      dispatch(updateUsuario({ ...selected, ...form }));
      toast.success('Usuario actualizado');
    } else {
      dispatch(addUsuario({ ...form, id: generateId() }));
      toast.success('Usuario creado');
    }
    setShowDialog(false);
  };

  const handleDelete = (u: User) => {
    confirmDialog({
      message: `Eliminar el usuario "${u.nombre}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => { dispatch(deleteUsuario(u.id)); toast.success('Usuario eliminado'); },
    });
  };

  const setField = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <ConfirmDialog />
      <div className="page-header">
        <div>
          <div className="page-header-title">Gestion de Usuarios</div>
          <div className="page-header-subtitle">{usuarios.length} usuarios registrados</div>
        </div>
        <Button label="Nuevo Usuario" icon="pi pi-user-plus" onClick={openNew} />
      </div>

      <div className="surface-card">
        <div style={{ marginBottom: '1rem' }}>
          <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '360px' }}>
            <i className="pi pi-search" />
            <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar usuario..." style={{ width: '100%', paddingLeft: '2.25rem' }} />
          </span>
        </div>
        <DataTable value={usuarios} globalFilter={globalFilter}
          globalFilterFields={['nombre', 'email', 'rol']}
          paginator rows={10} stripedRows
          emptyMessage="Sin usuarios">
          <Column field="nombre" header="Nombre" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="rol" header="Rol" sortable style={{ width: '160px' }}
            body={(row: User) => (
              <Tag value={ROLE_LABELS[row.rol]} severity="info" />
            )} />
          <Column field="activo" header="Estado" style={{ width: '90px' }}
            body={(row: User) => (
              <Tag value={row.activo ? 'Activo' : 'Inactivo'}
                severity={row.activo ? 'success' : 'danger'} />
            )} />
          <Column header="Acciones" style={{ width: '100px' }}
            body={(row: User) => (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button icon="pi pi-pencil" className="p-button-text p-button-sm p-button-warning"
                  tooltip="Editar" onClick={() => openEdit(row)} />
                <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger"
                  tooltip="Eliminar" onClick={() => handleDelete(row)} />
              </div>
            )} />
        </DataTable>
      </div>

      <Dialog header={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        visible={showDialog} style={{ width: '520px', maxWidth: '95vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Nombre Completo *</label>
            <InputText value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Correo Electronico *</label>
            <InputText value={form.email} onChange={(e) => setField('email', e.target.value.toLowerCase())}
              style={{ width: '100%' }} type="email" />
          </div>
          <div>
            <label style={labelStyle}>Rol del Usuario</label>
            <Dropdown value={form.rol} options={rolOptions}
              onChange={(e) => setField('rol', e.value)}
              style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox checked={form.activo} onChange={(e) => setField('activo', e.checked ?? true)} inputId="userActivo" />
            <label htmlFor="userActivo" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Usuario Activo</label>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
