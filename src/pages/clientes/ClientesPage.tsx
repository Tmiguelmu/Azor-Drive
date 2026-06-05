import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { addCliente, updateCliente, deleteCliente } from '../../store/slices/catalogosSlice';
import type { Cliente } from '../../types';
import { generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

interface ClienteForm {
  clave: string;
  nombre: string;
  razonSocial: string;
  rfc: string;
  direccion: string;
  ciudad: string;
  estado: string;
  cp: string;
  telefono: string;
  email: string;
  activo: boolean;
}

const EMPTY: ClienteForm = {
  clave: '', nombre: '', razonSocial: '', rfc: '',
  direccion: '', ciudad: '', estado: '', cp: '',
  telefono: '', email: '', activo: true,
};

const TEXT_FIELDS: { key: keyof ClienteForm; label: string; full?: boolean }[] = [
  { key: 'clave', label: 'Clave *' },
  { key: 'rfc', label: 'RFC' },
  { key: 'nombre', label: 'Nombre Comercial *', full: true },
  { key: 'razonSocial', label: 'Razon Social', full: true },
  { key: 'direccion', label: 'Direccion', full: true },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'estado', label: 'Estado' },
  { key: 'cp', label: 'C.P.' },
  { key: 'telefono', label: 'Telefono' },
  { key: 'email', label: 'Email', full: true },
];

export const ClientesPage = () => {
  const dispatch = useAppDispatch();
  const { actionPerms } = useAuth();
  const clientes = useAppSelector((s) => s.catalogos.clientes);

  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteForm>({ ...EMPTY });

  const openNew = () => { setForm({ ...EMPTY }); setIsEdit(false); setShowDialog(true); };
  const openEdit = (c: Cliente) => {
    setForm({
      clave: c.clave, nombre: c.nombre, razonSocial: c.razonSocial, rfc: c.rfc,
      direccion: c.direccion, ciudad: c.ciudad, estado: c.estado, cp: c.cp,
      telefono: c.telefono, email: c.email, activo: c.activo,
    });
    setSelected(c); setIsEdit(true); setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.clave || !form.nombre) { toast.error('Complete los campos obligatorios'); return; }
    if (isEdit && selected) {
      dispatch(updateCliente({ ...selected, ...form }));
      toast.success('Cliente actualizado');
    } else {
      dispatch(addCliente({ ...form, id: generateId() }));
      toast.success('Cliente agregado');
    }
    setShowDialog(false);
  };

  const handleDelete = (c: Cliente) => {
    confirmDialog({
      message: `Eliminar el cliente "${c.nombre}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => { dispatch(deleteCliente(c.id)); toast.success('Cliente eliminado'); },
    });
  };

  return (
    <div>
      <ConfirmDialog />
      <div className="page-header">
        <div>
          <div className="page-header-title">Catalogo de Clientes</div>
          <div className="page-header-subtitle">{clientes.length} clientes registrados</div>
        </div>
        {actionPerms?.gestionarClientes && (
          <Button label="Nuevo Cliente" icon="pi pi-plus" onClick={openNew} />
        )}
      </div>

      <div className="surface-card">
        <div style={{ marginBottom: '1rem' }}>
          <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '360px' }}>
            <i className="pi pi-search" />
            <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar cliente..." style={{ width: '100%', paddingLeft: '2.25rem' }} />
          </span>
        </div>
        <DataTable value={clientes} globalFilter={globalFilter}
          globalFilterFields={['clave', 'nombre', 'rfc', 'ciudad']}
          paginator rows={10} stripedRows
          emptyMessage="Sin clientes">
          <Column field="clave" header="Clave" sortable style={{ width: '90px', fontWeight: 600 }} />
          <Column field="nombre" header="Nombre" sortable />
          <Column field="rfc" header="RFC" style={{ width: '130px' }} />
          <Column field="ciudad" header="Ciudad" sortable style={{ width: '120px' }} />
          <Column field="telefono" header="Telefono" style={{ width: '120px' }} />
          <Column field="activo" header="Estado" style={{ width: '90px' }}
            body={(row: Cliente) => (
              <Tag value={row.activo ? 'Activo' : 'Inactivo'}
                severity={row.activo ? 'success' : 'danger'} />
            )} />
          {actionPerms?.gestionarClientes && (
            <Column header="Acciones" style={{ width: '100px' }}
              body={(row: Cliente) => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button icon="pi pi-pencil" className="p-button-text p-button-sm p-button-warning"
                    tooltip="Editar" onClick={() => openEdit(row)} />
                  <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger"
                    tooltip="Eliminar" onClick={() => handleDelete(row)} />
                </div>
              )} />
          )}
        </DataTable>
      </div>

      <Dialog header={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
        visible={showDialog} style={{ width: '700px', maxWidth: '95vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {TEXT_FIELDS.map(({ key, label, full }) => (
            <div key={key} style={{ gridColumn: full ? '1 / -1' : undefined }}>
              <label style={labelStyle}>{label}</label>
              <InputText
                value={String(form[key])}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox checked={form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.checked ?? true }))}
              inputId="clienteActivo" />
            <label htmlFor="clienteActivo" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cliente Activo</label>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
