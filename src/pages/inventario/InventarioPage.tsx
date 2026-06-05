import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { addItem, updateItem, deleteItem, addMovimiento } from '../../store/slices/inventarioSlice';
import type { Inventario, MovimientoInventario } from '../../types';
import { formatCurrency, formatDate, generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

interface InventarioForm {
  codigo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  cantidadMinima: number;
  unidad: string;
  ubicacion: string;
  proveedor: string;
  costo: number;
  activo: boolean;
}

const EMPTY_FORM: InventarioForm = {
  codigo: '', descripcion: '', categoria: '', cantidad: 0, cantidadMinima: 0,
  unidad: 'pza', ubicacion: '', proveedor: '', costo: 0, activo: true,
};

export const InventarioPage = () => {
  const dispatch = useAppDispatch();
  const { user, actionPerms } = useAuth();
  const { items, movimientos } = useAppSelector((s) => s.inventario);

  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showMovDialog, setShowMovDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Inventario | null>(null);
  const [form, setForm] = useState<InventarioForm>({ ...EMPTY_FORM });
  const [movForm, setMovForm] = useState({ tipo: 'entrada' as 'entrada' | 'salida', cantidad: 1, motivo: '' });

  const openNew = () => { setForm({ ...EMPTY_FORM }); setIsEdit(false); setShowDialog(true); };
  const openEdit = (item: Inventario) => {
    setForm({
      codigo: item.codigo,
      descripcion: item.descripcion,
      categoria: item.categoria,
      cantidad: item.cantidad,
      cantidadMinima: item.cantidadMinima,
      unidad: item.unidad,
      ubicacion: item.ubicacion,
      proveedor: item.proveedor,
      costo: item.costo,
      activo: item.activo,
    });
    setSelected(item); setIsEdit(true); setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.codigo || !form.descripcion) { toast.error('Complete los campos obligatorios'); return; }
    if (isEdit && selected) {
      dispatch(updateItem({ ...selected, ...form }));
      toast.success('Item actualizado');
    } else {
      dispatch(addItem({ ...form, id: generateId() }));
      toast.success('Item agregado al inventario');
    }
    setShowDialog(false);
  };

  const handleDelete = (item: Inventario) => {
    confirmDialog({
      message: `Eliminar el item "${item.descripcion}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      accept: () => { dispatch(deleteItem(item.id)); toast.success('Item eliminado'); },
    });
  };

  const handleMovimiento = () => {
    if (!selected || movForm.cantidad <= 0 || !movForm.motivo) {
      toast.error('Complete todos los campos');
      return;
    }
    if (movForm.tipo === 'salida' && movForm.cantidad > selected.cantidad) {
      toast.error('Cantidad insuficiente en inventario');
      return;
    }
    const mov: MovimientoInventario = {
      id: generateId(),
      inventarioId: selected.id,
      inventarioCodigo: selected.codigo,
      inventarioDescripcion: selected.descripcion,
      tipo: movForm.tipo,
      cantidad: movForm.cantidad,
      motivo: movForm.motivo,
      fecha: new Date().toISOString().split('T')[0],
      registradoPor: user?.nombre ?? '',
    };
    dispatch(addMovimiento(mov));
    toast.success(`${movForm.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada`);
    setShowMovDialog(false);
  };

  const getStockSeverity = (item: Inventario) => {
    if (item.cantidad === 0) return 'danger' as const;
    if (item.cantidad <= item.cantidadMinima) return 'warning' as const;
    return 'success' as const;
  };

  const getStockLabel = (item: Inventario) => {
    if (item.cantidad === 0) return 'Sin stock';
    if (item.cantidad <= item.cantidadMinima) return 'Stock bajo';
    return 'OK';
  };

  return (
    <div>
      <ConfirmDialog />
      <div className="page-header">
        <div>
          <div className="page-header-title">Inventario / Almacen</div>
          <div className="page-header-subtitle">
            {items.length} items | {items.filter((i) => i.cantidad <= i.cantidadMinima).length} con stock bajo
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {actionPerms?.gestionarInventario && (
            <Button label="Nuevo Item" icon="pi pi-plus" onClick={openNew} />
          )}
        </div>
      </div>

      <TabView>
        <TabPanel header="Catalogo de Materiales">
          <div style={{ marginBottom: '1rem' }}>
            <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '360px' }}>
              <i className="pi pi-search" />
              <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar por codigo, descripcion..." style={{ width: '100%', paddingLeft: '2.25rem' }} />
            </span>
          </div>
          <DataTable value={items} globalFilter={globalFilter}
            globalFilterFields={['codigo', 'descripcion', 'categoria', 'proveedor']}
            paginator rows={15} stripedRows
            emptyMessage="Sin items">
            <Column field="codigo" header="Codigo" sortable style={{ width: '150px', fontWeight: 600 }} />
            <Column field="descripcion" header="Descripcion" />
            <Column field="categoria" header="Categoria" sortable style={{ width: '130px' }} />
            <Column field="cantidad" header="Cant." style={{ width: '70px', textAlign: 'right' }} />
            <Column field="cantidadMinima" header="Min." style={{ width: '60px', textAlign: 'right' }} />
            <Column field="unidad" header="U.M." style={{ width: '60px' }} />
            <Column header="Estado" style={{ width: '90px' }}
              body={(row: Inventario) => (
                <Tag value={getStockLabel(row)} severity={getStockSeverity(row)} />
              )} />
            <Column field="ubicacion" header="Ubicacion" style={{ width: '90px' }} />
            <Column field="costo" header="Costo" style={{ width: '100px' }}
              body={(row: Inventario) => formatCurrency(row.costo)} />
            {actionPerms?.gestionarInventario && (
              <Column header="Acciones" style={{ width: '130px' }}
                body={(row: Inventario) => (
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <Button icon="pi pi-arrows-v" className="p-button-text p-button-sm p-button-info"
                      tooltip="Entrada/Salida"
                      onClick={() => { setSelected(row); setMovForm({ tipo: 'entrada', cantidad: 1, motivo: '' }); setShowMovDialog(true); }} />
                    <Button icon="pi pi-pencil" className="p-button-text p-button-sm p-button-warning"
                      tooltip="Editar" onClick={() => openEdit(row)} />
                    <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger"
                      tooltip="Eliminar" onClick={() => handleDelete(row)} />
                  </div>
                )} />
            )}
          </DataTable>
        </TabPanel>

        <TabPanel header="Historial de Movimientos">
          <DataTable value={movimientos} paginator rows={15} stripedRows
            emptyMessage="Sin movimientos">
            <Column field="fecha" header="Fecha" style={{ width: '100px' }}
              body={(row: MovimientoInventario) => formatDate(row.fecha)} />
            <Column header="Tipo" style={{ width: '90px' }}
              body={(row: MovimientoInventario) => (
                <Tag value={row.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                  severity={row.tipo === 'entrada' ? 'success' : 'warning'}
                />
              )} />
            <Column field="inventarioCodigo" header="Codigo" style={{ width: '150px' }} />
            <Column field="inventarioDescripcion" header="Descripcion" />
            <Column field="cantidad" header="Cant." style={{ width: '70px', textAlign: 'right' }} />
            <Column field="motivo" header="Motivo" />
            <Column field="registradoPor" header="Registrado por" style={{ width: '140px' }} />
          </DataTable>
        </TabPanel>
      </TabView>

      {/* Dialog item */}
      <Dialog header={isEdit ? 'Editar Item' : 'Nuevo Item de Inventario'}
        visible={showDialog} style={{ width: '650px', maxWidth: '95vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {([
            { key: 'codigo', label: 'Codigo *', full: false },
            { key: 'categoria', label: 'Categoria', full: false },
            { key: 'descripcion', label: 'Descripcion *', full: true },
            { key: 'ubicacion', label: 'Ubicacion', full: false },
            { key: 'proveedor', label: 'Proveedor', full: false },
            { key: 'unidad', label: 'Unidad de Medida', full: false },
          ] as { key: keyof InventarioForm; label: string; full: boolean }[]).map(({ key, label, full }) => (
            <div key={key} style={{ gridColumn: full ? '1 / -1' : undefined }}>
              <label style={labelStyle}>{label}</label>
              <InputText value={String(form[key])}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: '100%' }} />
            </div>
          ))}
          {([
            { key: 'cantidad', label: 'Cantidad Actual' },
            { key: 'cantidadMinima', label: 'Cantidad Minima' },
            { key: 'costo', label: 'Costo Unitario' },
          ] as { key: keyof InventarioForm; label: string }[]).map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <InputNumber value={form[key] as number}
                onValueChange={(e) => setForm((f) => ({ ...f, [key]: e.value ?? 0 }))}
                style={{ width: '100%' }} min={0} />
            </div>
          ))}
        </div>
      </Dialog>

      {/* Dialog movimiento */}
      <Dialog header={`Registrar Movimiento - ${selected?.codigo}`}
        visible={showMovDialog} style={{ width: '450px', maxWidth: '95vw' }}
        onHide={() => setShowMovDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowMovDialog(false)} />
            <Button label="Registrar" icon="pi pi-check" onClick={handleMovimiento} />
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-surface-2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700 }}>{selected.codigo}</div>
              <div style={{ color: 'var(--text-muted)' }}>{selected.descripcion}</div>
              <div style={{ marginTop: '0.25rem' }}>
                Existencia actual: <strong>{selected.cantidad} {selected.unidad}</strong>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Tipo de Movimiento</label>
              <Dropdown value={movForm.tipo}
                options={[{ label: 'Entrada (Recepcion)', value: 'entrada' }, { label: 'Salida (Entrega)', value: 'salida' }]}
                onChange={(e) => setMovForm((f) => ({ ...f, tipo: e.value as 'entrada' | 'salida' }))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>Cantidad</label>
              <InputNumber value={movForm.cantidad}
                onValueChange={(e) => setMovForm((f) => ({ ...f, cantidad: e.value ?? 1 }))}
                min={1} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>Motivo / Referencia</label>
              <InputText value={movForm.motivo}
                onChange={(e) => setMovForm((f) => ({ ...f, motivo: e.target.value }))}
                style={{ width: '100%' }} placeholder="Ej: Recepcion PO-2024-150" />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
