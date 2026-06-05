import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { addOrden, updateOrden } from '../../store/slices/ordenesSlice';
import { FileUploader } from '../../components/common/FileUploader';
import type { UploadedFile } from '../../components/common/FileUploader';
import type { OrdenTrabajo, EstadoOrden } from '../../types';
import {
  getEstadoOrdenLabel,
  getEstadoOrdenSeverity,
  formatDate,
  generateId,
} from '../../utils/helpers';
import toast from 'react-hot-toast';

// ---- tipos ----
interface OrdenForm {
  clienteId: string;
  clienteNombre: string;
  matricula: string;
  serie: string;
  marca: string;
  modelo: string;
  planeadorHrs: number;
  motorHrs1: number;
  ciclos1: number;
  aterrizajes: number;
  comentarios: string;
  estado: EstadoOrden;
}

const EMPTY_FORM: OrdenForm = {
  clienteId: '', clienteNombre: '', matricula: '', serie: '',
  marca: '', modelo: '', planeadorHrs: 0, motorHrs1: 0,
  ciclos1: 0, aterrizajes: 0, comentarios: '', estado: 'activa',
};

// ---- helpers visuales ----
const ESTADO_STEP: Record<EstadoOrden, number> = {
  activa: 0, en_progreso: 2, terminada: 5, cancelada: 5,
};

const STEPPER_STEPS = [
  { label: 'Nueva', icon: 'pi-plus-circle' },
  { label: 'Tareas', icon: 'pi-list-check' },
  { label: 'Asignacion', icon: 'pi-user-plus' },
  { label: 'En Progreso', icon: 'pi-spinner' },
  { label: 'Supervision', icon: 'pi-eye' },
  { label: 'Cierre', icon: 'pi-check-circle' },
];

const ESTADO_COLORS: Record<EstadoOrden, string> = {
  activa: 'var(--color-info)',
  en_progreso: 'var(--color-warning)',
  terminada: 'var(--color-success)',
  cancelada: 'var(--color-danger)',
};

const ESTADO_BG: Record<EstadoOrden, string> = {
  activa: 'var(--color-info-bg)',
  en_progreso: 'var(--color-warning-bg)',
  terminada: 'var(--color-success-bg)',
  cancelada: 'var(--color-danger-bg)',
};

type VistaMode = 'cards' | 'tabla';

export const OrdenesPage = () => {
  const dispatch = useAppDispatch();
  const { user, actionPerms } = useAuth();
  const ordenes = useAppSelector((s) => s.ordenes.ordenes);
  const clientes = useAppSelector((s) => s.catalogos.clientes);
  const tareas = useAppSelector((s) => s.tareas.tareas);

  const [globalFilter, setGlobalFilter] = useState('');
  const [vistaMode, setVistaMode] = useState<VistaMode>('cards');
  const [showDialog, setShowDialog] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<OrdenTrabajo | null>(null);
  const [form, setForm] = useState<OrdenForm>({ ...EMPTY_FORM });
  const [isEdit, setIsEdit] = useState(false);
  const [evidencias, setEvidencias] = useState<UploadedFile[]>([]);

  const clienteOptions = clientes
    .filter((c) => c.activo)
    .map((c) => ({ label: c.nombre, value: c.id }));

  const estadoOptions: { label: string; value: EstadoOrden }[] = [
    { label: 'Activa',      value: 'activa' },
    { label: 'En Progreso', value: 'en_progreso' },
    { label: 'Terminada',   value: 'terminada' },
    { label: 'Cancelada',   value: 'cancelada' },
  ];

  // Filtro
  const ordenesFiltradas = ordenes.filter((o) => {
    const q = globalFilter.toLowerCase();
    return !q || [o.folio, o.clienteNombre, o.matricula, o.marca, o.modelo]
      .some((v) => v.toLowerCase().includes(q));
  });

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setIsEdit(false);
    setShowDialog(true);
  };

  const openEdit = (orden: OrdenTrabajo) => {
    setForm({
      clienteId: orden.clienteId, clienteNombre: orden.clienteNombre,
      matricula: orden.matricula, serie: orden.serie,
      marca: orden.marca, modelo: orden.modelo,
      planeadorHrs: orden.planeadorHrs, motorHrs1: orden.motorHrs1,
      ciclos1: orden.ciclos1, aterrizajes: orden.aterrizajes,
      comentarios: orden.comentarios, estado: orden.estado,
    });
    setSelected(orden);
    setIsEdit(true);
    setShowDialog(true);
  };

  const openDetail = (orden: OrdenTrabajo) => {
    setSelected(orden);
    setEvidencias([]);
    setShowDetail(true);
  };

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    setForm((f) => ({ ...f, clienteId, clienteNombre: cliente?.nombre ?? '' }));
  };

  const handleSave = () => {
    if (!form.clienteId || !form.matricula || !form.marca || !form.modelo) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    if (isEdit && selected) {
      dispatch(updateOrden({ ...selected, ...form }));
      toast.success('Orden actualizada');
    } else {
      const folio = `OT-2024-${String(ordenes.length + 1).padStart(3, '0')}`;
      dispatch(addOrden({
        ...form, id: generateId(), folio,
        fechaCreacion: new Date().toISOString().split('T')[0],
        creadoPor: user?.id ?? 'u1', tareas: [],
      }));
      toast.success('Orden creada correctamente');
    }
    setShowDialog(false);
  };

  const handleCambioEstado = (orden: OrdenTrabajo, nuevoEstado: EstadoOrden) => {
    const labels: Record<EstadoOrden, string> = {
      activa: 'Activa', en_progreso: 'En Progreso',
      terminada: 'Terminada', cancelada: 'Cancelada',
    };
    confirmDialog({
      message: `Cambiar estado de la orden ${orden.folio} a "${labels[nuevoEstado]}"?`,
      header: 'Confirmar cambio de estado',
      icon: 'pi pi-question-circle',
      accept: () => {
        dispatch(updateOrden({
          ...orden, estado: nuevoEstado,
          ...(nuevoEstado === 'terminada' || nuevoEstado === 'cancelada'
            ? { fechaCierre: new Date().toISOString().split('T')[0] }
            : {}),
        }));
        toast.success(`Orden cambiada a ${labels[nuevoEstado]}`);
        if (showDetail) setSelected((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
      },
    });
  };

  const tareasDeOrden = selected ? tareas.filter((t) => t.ordenId === selected.id) : [];
  const tareasCompletadas = tareasDeOrden.filter((t) => ['completada', 'verificada'].includes(t.estado)).length;
  const pctAvance = tareasDeOrden.length ? Math.round((tareasCompletadas / tareasDeOrden.length) * 100) : 0;

  const fieldLabel: React.CSSProperties = {
    display: 'block', marginBottom: '0.3rem', fontSize: '0.78rem',
    fontWeight: 700, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  // ---- Render card ----
  const renderOrdenCard = (orden: OrdenTrabajo) => {
    const t = tareas.filter((x) => x.ordenId === orden.id);
    const done = t.filter((x) => ['completada', 'verificada'].includes(x.estado)).length;
    const pct = t.length ? Math.round((done / t.length) * 100) : 0;

    return (
      <div key={orden.id} className="ot-card">
        <div className="ot-card-header" style={{ borderLeft: `4px solid ${ESTADO_COLORS[orden.estado]}` }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {orden.folio}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatDate(orden.fechaCreacion)}
            </div>
          </div>
          <div style={{
            background: ESTADO_BG[orden.estado],
            color: ESTADO_COLORS[orden.estado],
            padding: '0.3rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            {getEstadoOrdenLabel(orden.estado)}
          </div>
        </div>

        <div className="ot-card-body">
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
              {orden.clienteNombre}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              <i className="pi pi-tag" style={{ fontSize: '0.78rem' }} />
              <span style={{ fontWeight: 700, color: 'var(--color-primary-500)' }}>{orden.matricula}</span>
              <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
              <span>{orden.marca} {orden.modelo}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                <i className="pi pi-list-check" style={{ marginRight: '0.3rem' }} />
                {done}/{t.length} tareas
              </span>
              <span style={{ fontWeight: 700, color: pct === 100 ? 'var(--color-success)' : 'var(--color-primary-500)' }}>
                {pct}%
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary-500)',
                }}
              />
            </div>
          </div>

          {/* Datos tecnicos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {[
              { icon: 'pi-gauge', label: 'Motor Hrs', value: orden.motorHrs1 },
              { icon: 'pi-sync', label: 'Ciclos', value: orden.ciclos1 },
              { icon: 'pi-send', label: 'Aterrizajes', value: orden.aterrizajes },
            ].map((d) => (
              <div key={d.label} style={{
                background: 'var(--bg-surface-2)',
                borderRadius: '8px',
                padding: '0.45rem 0.6rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
                  {d.label}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ot-card-footer">
          <Button
            icon="pi pi-eye"
            label="Ver detalle"
            className="p-button-text p-button-sm"
            onClick={() => openDetail(orden)}
          />
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {actionPerms?.editarOrden && orden.estado === 'activa' && (
              <Button
                icon="pi pi-pencil"
                className="p-button-text p-button-sm p-button-warning"
                tooltip="Editar"
                onClick={() => openEdit(orden)}
              />
            )}
            {actionPerms?.cerrarOrden && orden.estado !== 'terminada' && orden.estado !== 'cancelada' && (
              <Button
                icon="pi pi-check"
                className="p-button-text p-button-sm p-button-success"
                tooltip="Cerrar"
                onClick={() => handleCambioEstado(orden, 'terminada')}
              />
            )}
            {actionPerms?.cancelarOrden && orden.estado !== 'cancelada' && orden.estado !== 'terminada' && (
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-sm p-button-danger"
                tooltip="Cancelar"
                onClick={() => handleCambioEstado(orden, 'cancelada')}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const activeStep = selected ? ESTADO_STEP[selected.estado] : 0;

  return (
    <div>
      <ConfirmDialog />

      {/* Header de pagina */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Ordenes de Trabajo</div>
          <div className="page-header-subtitle">{ordenes.length} ordenes registradas</div>
        </div>
        <div className="page-header-actions">
          {/* Toggle vista */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {(['cards', 'tabla'] as VistaMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setVistaMode(mode)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: vistaMode === mode ? 'var(--color-primary-600)' : 'transparent',
                  color: vistaMode === mode ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                <i className={mode === 'cards' ? 'pi pi-th-large' : 'pi pi-table'} />
                {mode === 'cards' ? 'Cards' : 'Tabla'}
              </button>
            ))}
          </div>

          {actionPerms?.crearOrden && (
            <Button label="Nueva Orden" icon="pi pi-plus" onClick={openNew} />
          )}
        </div>
      </div>

      {/* Barra busqueda */}
      <div className="surface-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="p-input-icon-left" style={{ flex: 1, minWidth: '240px', maxWidth: '420px' }}>
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por folio, cliente, matricula..."
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['activa', 'en_progreso', 'terminada'] as EstadoOrden[]).map((estado) => (
              <span
                key={estado}
                style={{
                  padding: '0.3rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: ESTADO_BG[estado],
                  color: ESTADO_COLORS[estado],
                  cursor: 'pointer',
                  border: `1px solid ${ESTADO_COLORS[estado]}33`,
                }}
                onClick={() => setGlobalFilter(getEstadoOrdenLabel(estado))}
              >
                {ordenesFiltradas.filter((o) => o.estado === estado).length} {getEstadoOrdenLabel(estado)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vista cards */}
      {vistaMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.1rem',
        }}>
          {ordenesFiltradas.map(renderOrdenCard)}
          {ordenesFiltradas.length === 0 && (
            <div style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}>
              <i className="pi pi-inbox" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} />
              No se encontraron ordenes
            </div>
          )}
        </div>
      )}

      {/* Vista tabla */}
      {vistaMode === 'tabla' && (
        <div className="surface-card">
          <DataTable
            value={ordenesFiltradas}
            paginator rows={10} stripedRows
            emptyMessage="No se encontraron ordenes"
          >
            <Column field="folio" header="Folio" sortable style={{ width: '130px', fontWeight: 700 }} />
            <Column field="clienteNombre" header="Cliente" sortable />
            <Column field="matricula" header="Matricula" sortable style={{ width: '110px' }} />
            <Column header="Aeronave" body={(row: OrdenTrabajo) => `${row.marca} ${row.modelo}`} />
            <Column
              field="fechaCreacion" header="Fecha" sortable style={{ width: '110px' }}
              body={(row: OrdenTrabajo) => formatDate(row.fechaCreacion)}
            />
            <Column
              field="estado" header="Estado" style={{ width: '145px' }}
              body={(row: OrdenTrabajo) => (
                <Tag value={getEstadoOrdenLabel(row.estado)} severity={getEstadoOrdenSeverity(row.estado)} />
              )}
            />
            <Column
              header="Acciones" style={{ width: '160px' }}
              body={(row: OrdenTrabajo) => (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button icon="pi pi-eye" className="p-button-text p-button-sm" tooltip="Ver detalle"
                    onClick={() => openDetail(row)} />
                  {actionPerms?.editarOrden && row.estado === 'activa' && (
                    <Button icon="pi pi-pencil" className="p-button-text p-button-sm p-button-warning"
                      tooltip="Editar" onClick={() => openEdit(row)} />
                  )}
                  {actionPerms?.cerrarOrden && row.estado !== 'terminada' && row.estado !== 'cancelada' && (
                    <Button icon="pi pi-check" className="p-button-text p-button-sm p-button-success"
                      tooltip="Cerrar" onClick={() => handleCambioEstado(row, 'terminada')} />
                  )}
                  {actionPerms?.cancelarOrden && row.estado !== 'cancelada' && row.estado !== 'terminada' && (
                    <Button icon="pi pi-times" className="p-button-text p-button-sm p-button-danger"
                      tooltip="Cancelar" onClick={() => handleCambioEstado(row, 'cancelada')} />
                  )}
                </div>
              )}
            />
          </DataTable>
        </div>
      )}

      {/* ====== Dialog crear/editar ====== */}
      <Dialog
        header={isEdit ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
        visible={showDialog}
        style={{ width: '760px', maxWidth: '96vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Guardar" icon="pi pi-save" onClick={handleSave} />
          </div>
        }
      >
        {/* Fieldset datos generales */}
        <fieldset className="erp-fieldset">
          <legend className="erp-fieldset-legend">Datos del Cliente</legend>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={fieldLabel}>Cliente *</label>
            <Dropdown
              value={form.clienteId} options={clienteOptions}
              onChange={(e) => handleClienteChange(e.value as string)}
              placeholder="Seleccionar cliente" style={{ width: '100%' }} filter
            />
          </div>
        </fieldset>

        <fieldset className="erp-fieldset">
          <legend className="erp-fieldset-legend">Datos de la Aeronave</legend>
          <div className="form-grid-2">
            {(['matricula', 'serie', 'marca', 'modelo'] as const).map((key) => (
              <div key={key}>
                <label style={fieldLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {['matricula', 'marca', 'modelo'].includes(key) ? ' *' : ''}
                </label>
                <InputText
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="erp-fieldset">
          <legend className="erp-fieldset-legend">Datos Tecnicos</legend>
          <div className="form-grid-2">
            {([
              ['planeadorHrs', 'Planeador Hrs'],
              ['motorHrs1', 'Motor Hrs 1'],
              ['ciclos1', 'Ciclos 1'],
              ['aterrizajes', 'Aterrizajes'],
            ] as const).map(([key, lbl]) => (
              <div key={key}>
                <label style={fieldLabel}>{lbl}</label>
                <InputNumber
                  value={form[key]}
                  onValueChange={(e) => setForm((f) => ({ ...f, [key]: e.value ?? 0 }))}
                  style={{ width: '100%' }} min={0}
                />
              </div>
            ))}
          </div>
        </fieldset>

        {actionPerms?.editarOrden && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={fieldLabel}>Estado</label>
            <Dropdown
              value={form.estado} options={estadoOptions}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.value as EstadoOrden }))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <div>
          <label style={fieldLabel}>Comentarios</label>
          <InputTextarea
            value={form.comentarios}
            onChange={(e) => setForm((f) => ({ ...f, comentarios: e.target.value }))}
            rows={3} style={{ width: '100%' }} autoResize
          />
        </div>
      </Dialog>

      {/* ====== Dialog detalle completo ====== */}
      <Dialog
        header={null}
        visible={showDetail}
        style={{ width: '960px', maxWidth: '97vw' }}
        onHide={() => { setShowDetail(false); setSelected(null); }}
        maximizable
      >
        {selected && (
          <div>
            {/* Hero header */}
            <div style={{
              background: `linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-600) 100%)`,
              borderRadius: '10px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                    Orden de Trabajo
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '1px' }}>
                    {selected.folio}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9, marginTop: '0.2rem' }}>
                    {selected.clienteNombre}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    background: ESTADO_BG[selected.estado],
                    color: ESTADO_COLORS[selected.estado],
                    padding: '0.5rem 1.2rem',
                    borderRadius: '24px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    border: `2px solid ${ESTADO_COLORS[selected.estado]}`,
                  }}>
                    {getEstadoOrdenLabel(selected.estado)}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    <i className="pi pi-tag" style={{ marginRight: '0.35rem' }} />
                    <strong>{selected.matricula}</strong> &bull; {selected.marca} {selected.modelo}
                  </div>
                </div>
              </div>

              {/* Stepper */}
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                <div className="stepper">
                  {STEPPER_STEPS.map((step, idx) => (
                    <div key={step.label} className="stepper-step">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                        <div className={`stepper-dot ${idx < activeStep ? 'done' : idx === activeStep ? 'active' : ''}`}>
                          {idx < activeStep
                            ? <i className="pi pi-check" style={{ fontSize: '0.8rem' }} />
                            : <span>{idx + 1}</span>
                          }
                        </div>
                        <div className={`stepper-label ${idx < activeStep ? 'done' : idx === activeStep ? 'active' : ''}`}
                          style={{ color: 'white', opacity: idx <= activeStep ? 1 : 0.5 }}>
                          {step.label}
                        </div>
                      </div>
                      {idx < STEPPER_STEPS.length - 1 && (
                        <div className={`stepper-line ${idx < activeStep ? 'done' : ''}`}
                          style={{ background: idx < activeStep ? 'var(--color-success)' : 'rgba(255,255,255,0.3)' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info tecnica */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.5rem',
            }}>
              {[
                { icon: 'pi-gauge',       label: 'Planeador Hrs', value: selected.planeadorHrs },
                { icon: 'pi-cog',         label: 'Motor Hrs 1',   value: selected.motorHrs1 },
                { icon: 'pi-sync',        label: 'Ciclos 1',      value: selected.ciclos1 },
                { icon: 'pi-send',        label: 'Aterrizajes',   value: selected.aterrizajes },
                { icon: 'pi-calendar',    label: 'Fecha Creacion', value: formatDate(selected.fechaCreacion) },
                { icon: 'pi-list-check',  label: 'Progreso',      value: `${pctAvance}% (${tareasCompletadas}/${tareasDeOrden.length})` },
              ].map((d) => (
                <div key={d.label} style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  textAlign: 'center',
                }}>
                  <i className={`pi ${d.icon}`} style={{ fontSize: '1.2rem', color: 'var(--color-primary-400)', marginBottom: '0.4rem', display: 'block' }} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
                    {d.label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {d.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <TabView>
              <TabPanel header="General">
                <div className="form-grid-2">
                  {([
                    ['Cliente', selected.clienteNombre],
                    ['No. Serie', selected.serie],
                    ['Marca', selected.marca],
                    ['Modelo', selected.modelo],
                    ['Fecha Creacion', formatDate(selected.fechaCreacion)],
                    ['Fecha Cierre', selected.fechaCierre ? formatDate(selected.fechaCierre) : 'Sin cerrar'],
                  ] as [string, string][]).map(([lbl, val]) => (
                    <div key={lbl} style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-surface-2)',
                      borderRadius: '8px',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
                        {lbl}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
                    </div>
                  ))}
                  {selected.comentarios && (
                    <div style={{ gridColumn: '1/-1', padding: '0.75rem 1rem', background: 'var(--bg-surface-2)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                        Comentarios
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>{selected.comentarios}</div>
                    </div>
                  )}
                </div>
                {actionPerms?.cerrarOrden && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    {selected.estado !== 'terminada' && selected.estado !== 'cancelada' && (
                      <>
                        <Button label="Cerrar Orden" icon="pi pi-check" className="p-button-success"
                          onClick={() => handleCambioEstado(selected, 'terminada')} />
                        <Button label="Cancelar Orden" icon="pi pi-times" className="p-button-danger p-button-outlined"
                          onClick={() => handleCambioEstado(selected, 'cancelada')} />
                      </>
                    )}
                  </div>
                )}
              </TabPanel>

              <TabPanel header={`Tareas (${tareasDeOrden.length})`}>
                <DataTable value={tareasDeOrden} size="small" stripedRows emptyMessage="Sin tareas">
                  <Column field="folio" header="Folio" style={{ width: '90px' }} />
                  <Column field="descripcion" header="Descripcion" />
                  <Column field="asignadoNombre" header="Asignado"
                    body={(row) => row.asignadoNombre || <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}
                  />
                  <Column field="porcentajeAvance" header="Avance" style={{ width: '100px' }}
                    body={(row) => (
                      <div>
                        <div style={{ fontSize: '0.82rem', marginBottom: '3px', fontWeight: 700 }}>{row.porcentajeAvance}%</div>
                        <div className="progress-bar-container" style={{ height: '5px' }}>
                          <div className="progress-bar-fill" style={{ width: `${row.porcentajeAvance}%` }} />
                        </div>
                      </div>
                    )}
                  />
                  <Column field="estado" header="Estado"
                    body={(row) => (
                      <Tag value={row.estado} severity={row.estado === 'verificada' ? 'success' : row.estado === 'cancelada' ? 'danger' : 'info'} />
                    )}
                  />
                </DataTable>
              </TabPanel>

              <TabPanel header="Materiales">
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <i className="pi pi-box" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
                  Los materiales se gestionan desde cada tarea individual
                </div>
              </TabPanel>

              <TabPanel header="Evidencias">
                <div style={{ marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Adjunta imagenes y documentos de evidencia de la orden de trabajo.
                </div>
                <FileUploader
                  files={evidencias}
                  onChange={setEvidencias}
                  label="Arrastra evidencias aqui o haz clic para seleccionar"
                />
              </TabPanel>

              <TabPanel header="Pre-Factura">
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <i className="pi pi-file-export" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} />
                  La pre-factura se genera al cerrar la orden con todas las tareas verificadas
                </div>
              </TabPanel>
            </TabView>
          </div>
        )}
      </Dialog>
    </div>
  );
};
