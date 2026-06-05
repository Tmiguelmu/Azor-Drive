import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { addAgrupacion, updateAgrupacion, deleteAgrupacion } from '../../store/slices/catalogosSlice';
import type { AgrupacionFacturacion } from '../../types';
import { generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

export const CatalogosPage = () => {
  const dispatch = useAppDispatch();
  const agrupaciones = useAppSelector((s) => s.catalogos.agrupaciones);

  const [showDialog, setShowDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<AgrupacionFacturacion | null>(null);
  const [form, setForm] = useState({ clave: '', nombre: '' });

  const openNew = () => { setForm({ clave: '', nombre: '' }); setIsEdit(false); setShowDialog(true); };
  const openEdit = (a: AgrupacionFacturacion) => {
    setForm({ clave: a.clave, nombre: a.nombre }); setSelected(a); setIsEdit(true); setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.clave || !form.nombre) { toast.error('Complete todos los campos'); return; }
    if (isEdit && selected) {
      dispatch(updateAgrupacion({ ...selected, ...form }));
      toast.success('Agrupacion actualizada');
    } else {
      dispatch(addAgrupacion({ ...form, id: generateId() }));
      toast.success('Agrupacion creada');
    }
    setShowDialog(false);
  };

  const handleDelete = (a: AgrupacionFacturacion) => {
    confirmDialog({
      message: `Eliminar la agrupacion "${a.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => { dispatch(deleteAgrupacion(a.id)); toast.success('Agrupacion eliminada'); },
    });
  };

  return (
    <div>
      <ConfirmDialog />
      <div className="page-header">
        <div>
          <div className="page-header-title">Agrupaciones de Facturacion</div>
          <div className="page-header-subtitle">{agrupaciones.length} agrupaciones registradas</div>
        </div>
        <Button label="Nueva Agrupacion" icon="pi pi-plus" onClick={openNew} />
      </div>

      <div className="surface-card">
        <DataTable value={agrupaciones} paginator rows={15} stripedRows
          emptyMessage="Sin agrupaciones">
          <Column field="clave" header="Clave" sortable style={{ width: '100px', fontWeight: 700 }} />
          <Column field="nombre" header="Nombre de Agrupacion" sortable />
          <Column header="Acciones" style={{ width: '100px' }}
            body={(row: AgrupacionFacturacion) => (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button icon="pi pi-pencil" className="p-button-text p-button-sm p-button-warning"
                  tooltip="Editar" onClick={() => openEdit(row)} />
                <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger"
                  tooltip="Eliminar" onClick={() => handleDelete(row)} />
              </div>
            )} />
        </DataTable>
      </div>

      <Dialog header={isEdit ? 'Editar Agrupacion' : 'Nueva Agrupacion'}
        visible={showDialog} style={{ width: '420px', maxWidth: '95vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Clave *</label>
            <InputText value={form.clave} onChange={(e) => setForm((f) => ({ ...f, clave: e.target.value }))}
              style={{ width: '100%' }} placeholder="Ej: MM" />
          </div>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <InputText value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              style={{ width: '100%' }} placeholder="Ej: Mantenimiento Mecanico" />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
