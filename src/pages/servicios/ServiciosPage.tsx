import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { addServicio, updateServicio, deleteServicio } from '../../store/slices/catalogosSlice';
import type { Servicio } from '../../types';
import { formatCurrency, generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

const EMPTY: Omit<Servicio, 'id' | 'agrupacionNombre'> = {
  clave: '', descripcion: '', agrupacionId: '', precioVenta: 0, precioAnterior: 0, activo: true,
};

export const ServiciosPage = () => {
  const dispatch = useAppDispatch();
  const { actionPerms } = useAuth();
  const servicios = useAppSelector((s) => s.catalogos.servicios);
  const agrupaciones = useAppSelector((s) => s.catalogos.agrupaciones);

  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });

  const agrupacionOptions = agrupaciones.map((a) => ({ label: a.nombre, value: a.id }));

  const openNew = () => { setForm({ ...EMPTY }); setIsEdit(false); setShowDialog(true); };
  const openEdit = (s: Servicio) => {
    const { id: _id, agrupacionNombre: _an, ...rest } = s;
    setForm(rest); setSelected(s); setIsEdit(true); setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.clave || !form.descripcion) { toast.error('Complete los campos obligatorios'); return; }
    const agrupacion = agrupaciones.find((a) => a.id === form.agrupacionId);
    if (isEdit && selected) {
      dispatch(updateServicio({ ...selected, ...form, agrupacionNombre: agrupacion?.nombre ?? '' }));
      toast.success('Servicio actualizado');
    } else {
      dispatch(addServicio({ ...form, id: generateId(), agrupacionNombre: agrupacion?.nombre ?? '' }));
      toast.success('Servicio agregado');
    }
    setShowDialog(false);
  };

  const handleDelete = (s: Servicio) => {
    confirmDialog({
      message: `Eliminar el servicio "${s.descripcion}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => { dispatch(deleteServicio(s.id)); toast.success('Servicio eliminado'); },
    });
  };

  const setField = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <ConfirmDialog />
      <div className="page-header">
        <div>
          <div className="page-header-title">Catalogo de Servicios</div>
          <div className="page-header-subtitle">{servicios.length} servicios registrados</div>
        </div>
        {actionPerms?.gestionarServicios && (
          <Button label="Nuevo Servicio" icon="pi pi-plus" onClick={openNew} />
        )}
      </div>

      <div className="surface-card">
        <div style={{ marginBottom: '1rem' }}>
          <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '360px' }}>
            <i className="pi pi-search" />
            <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar servicio..." style={{ width: '100%', paddingLeft: '2.25rem' }} />
          </span>
        </div>
        <DataTable value={servicios} globalFilter={globalFilter}
          globalFilterFields={['clave', 'descripcion', 'agrupacionNombre']}
          paginator rows={10} stripedRows
          emptyMessage="Sin servicios">
          <Column field="clave" header="Clave" sortable style={{ width: '120px', fontWeight: 600 }} />
          <Column field="descripcion" header="Descripcion" />
          <Column field="agrupacionNombre" header="Agrupacion" sortable style={{ width: '180px' }} />
          <Column field="precioAnterior" header="Precio Anterior" style={{ width: '130px', textAlign: 'right' }}
            body={(row: Servicio) => (
              <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {formatCurrency(row.precioAnterior)}
              </span>
            )} />
          <Column field="precioVenta" header="Precio Venta" style={{ width: '120px', textAlign: 'right' }}
            body={(row: Servicio) => <strong>{formatCurrency(row.precioVenta)}</strong>} />
          <Column field="activo" header="Estado" style={{ width: '90px' }}
            body={(row: Servicio) => (
              <Tag value={row.activo ? 'Activo' : 'Inactivo'}
                severity={row.activo ? 'success' : 'danger'} />
            )} />
          {actionPerms?.gestionarServicios && (
            <Column header="Acciones" style={{ width: '100px' }}
              body={(row: Servicio) => (
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

      <Dialog header={isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
        visible={showDialog} style={{ width: '550px', maxWidth: '95vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Clave *</label>
            <InputText value={form.clave} onChange={(e) => setField('clave', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Agrupacion de Facturacion</label>
            <Dropdown value={form.agrupacionId} options={agrupacionOptions}
              onChange={(e) => setField('agrupacionId', e.value)}
              placeholder="Seleccionar" style={{ width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descripcion del Servicio *</label>
            <InputText value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Precio Venta</label>
            <InputNumber value={form.precioVenta} onValueChange={(e) => setField('precioVenta', e.value ?? 0)}
              style={{ width: '100%' }} mode="currency" currency="MXN" locale="es-MX" />
          </div>
          <div>
            <label style={labelStyle}>Precio Anterior</label>
            <InputNumber value={form.precioAnterior} onValueChange={(e) => setField('precioAnterior', e.value ?? 0)}
              style={{ width: '100%' }} mode="currency" currency="MXN" locale="es-MX" />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox checked={form.activo} onChange={(e) => setField('activo', e.checked ?? true)} inputId="svcActivo" />
            <label htmlFor="svcActivo" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Servicio Activo</label>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
