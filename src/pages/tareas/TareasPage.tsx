import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Slider } from 'primereact/slider';
import { TabView, TabPanel } from 'primereact/tabview';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { addTarea, updateTarea } from '../../store/slices/tareasSlice';
import { FileUploader } from '../../components/common/FileUploader';
import type { UploadedFile } from '../../components/common/FileUploader';
import type { Tarea, EstadoTarea, PrioridadTarea } from '../../types';
import {
  getEstadoTareaLabel,
  getEstadoTareaSeverity,
  getPrioridadLabel,
  getPrioridadSeverity,
  generateId,
} from '../../utils/helpers';
import toast from 'react-hot-toast';

const PRIORIDAD_COLORS: Record<PrioridadTarea, string> = {
  baja: '#16a34a',
  media: '#2563eb',
  alta: '#d97706',
  critica: '#dc2626',
};

const fieldLabel: React.CSSProperties = {
  display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem',
  fontWeight: 700, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

export const TareasPage = () => {
  const dispatch = useAppDispatch();
  const { user, actionPerms } = useAuth();
  const tareas = useAppSelector((s) => s.tareas.tareas);
  const ordenes = useAppSelector((s) => s.ordenes.ordenes);
  const servicios = useAppSelector((s) => s.catalogos.servicios);
  const usuarios = useAppSelector((s) => s.catalogos.usuarios);

  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog]   = useState(false);
  const [showAvance, setShowAvance]   = useState(false);
  const [showAsignar, setShowAsignar] = useState(false);
  const [showValidar, setShowValidar] = useState(false);
  const [selected, setSelected]       = useState<Tarea | null>(null);

  const [formTarea, setFormTarea] = useState({
    ordenId: '', descripcion: '', servicioId: '',
    prioridad: 'media' as PrioridadTarea,
  });
  const [formAvance, setFormAvance] = useState({ porcentaje: 0, notas: '' });
  const [evidenciasAvance, setEvidenciasAvance] = useState<UploadedFile[]>([]);
  const [asignadoId, setAsignadoId] = useState('');
  const [comentarioValidacion, setComentarioValidacion] = useState('');

  const ordenOptions = ordenes
    .filter((o) => o.estado === 'activa' || o.estado === 'en_progreso')
    .map((o) => ({ label: `${o.folio} - ${o.clienteNombre}`, value: o.id }));

  const servicioOptions = servicios
    .filter((s) => s.activo)
    .map((s) => ({ label: s.descripcion, value: s.id }));

  const mecanicoOptions = usuarios
    .filter((u) => u.rol === 'mecanico' && u.activo)
    .map((u) => ({ label: u.nombre, value: u.id }));

  const prioridadOptions: { label: string; value: PrioridadTarea }[] = [
    { label: 'Baja',    value: 'baja' },
    { label: 'Media',   value: 'media' },
    { label: 'Alta',    value: 'alta' },
    { label: 'Critica', value: 'critica' },
  ];

  const handleCrearTarea = () => {
    if (!formTarea.ordenId || !formTarea.descripcion) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    const orden    = ordenes.find((o) => o.id === formTarea.ordenId);
    const servicio = servicios.find((s) => s.id === formTarea.servicioId);
    dispatch(addTarea({
      id: generateId(),
      folio: `T-${String(tareas.length + 1).padStart(3, '0')}`,
      ordenId: formTarea.ordenId,
      ordenFolio: orden?.folio ?? '',
      descripcion: formTarea.descripcion,
      servicioId: formTarea.servicioId,
      servicioNombre: servicio?.descripcion ?? '',
      prioridad: formTarea.prioridad,
      estado: 'activa',
      porcentajeAvance: 0,
      notas: '',
      evidencias: [],
      materialesRequeridos: [],
      fechaCreacion: new Date().toISOString().split('T')[0],
      creadoPor: user?.id ?? 'u1',
    }));
    toast.success('Tarea creada');
    setShowDialog(false);
    setFormTarea({ ordenId: '', descripcion: '', servicioId: '', prioridad: 'media' });
  };

  const handleAsignar = () => {
    if (!selected || !asignadoId) { toast.error('Seleccione un mecanico'); return; }
    const mec = usuarios.find((u) => u.id === asignadoId);
    dispatch(updateTarea({
      ...selected, estado: 'asignada',
      asignadoA: asignadoId, asignadoNombre: mec?.nombre ?? '',
      fechaAsignacion: new Date().toISOString().split('T')[0],
    }));
    toast.success('Tarea asignada');
    setShowAsignar(false);
  };

  const handleAvance = () => {
    if (!selected) return;
    const nuevoEstado: EstadoTarea = formAvance.porcentaje === 100 ? 'completada' : 'en_progreso';
    dispatch(updateTarea({
      ...selected,
      porcentajeAvance: formAvance.porcentaje,
      notas: formAvance.notas,
      estado: nuevoEstado,
      ...(nuevoEstado === 'completada' ? { fechaCompletada: new Date().toISOString().split('T')[0] } : {}),
    }));
    toast.success('Avance registrado');
    setShowAvance(false);
    setEvidenciasAvance([]);
  };

  const handleValidar = (aprobado: boolean) => {
    if (!selected) return;
    dispatch(updateTarea({
      ...selected,
      estado: aprobado ? 'verificada' : 'en_progreso',
      comentarioValidacion,
    }));
    toast.success(aprobado ? 'Tarea verificada y aprobada' : 'Tarea enviada de regreso al mecanico');
    setShowValidar(false);
  };

  const tareasFiltradas = tareas.filter((t) => {
    const q = globalFilter.toLowerCase();
    return !q || [t.folio, t.ordenFolio, t.descripcion, t.asignadoNombre ?? '']
      .some((v) => v.toLowerCase().includes(q));
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Gestion de Tareas</div>
          <div className="page-header-subtitle">{tareas.length} tareas registradas</div>
        </div>
        <div className="page-header-actions">
          {actionPerms?.crearTarea && (
            <Button label="Nueva Tarea" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
          )}
        </div>
      </div>

      {/* KPI mini */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Activas',     count: tareas.filter((t) => t.estado === 'activa').length,      color: '#64748b', bg: '#F1F5F9' },
          { label: 'Asignadas',   count: tareas.filter((t) => t.estado === 'asignada').length,    color: '#2563eb', bg: '#DBEAFE' },
          { label: 'En Progreso', count: tareas.filter((t) => t.estado === 'en_progreso').length, color: '#d97706', bg: '#FEF3C7' },
          { label: 'Completadas', count: tareas.filter((t) => t.estado === 'completada').length,  color: '#16a34a', bg: '#D1FAE5' },
          { label: 'Verificadas', count: tareas.filter((t) => t.estado === 'verificada').length,  color: '#059669', bg: '#A7F3D0' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1rem',
            borderLeft: `4px solid ${s.color}`,
            cursor: 'pointer',
          }} onClick={() => setGlobalFilter(s.label)}>
            <div style={{ fontWeight: 800, fontSize: '1.6rem', color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="surface-card">
        <div style={{ marginBottom: '1.1rem' }}>
          <span className="p-input-icon-left" style={{ width: '100%', maxWidth: '400px' }}>
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar tarea..."
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </span>
        </div>

        <DataTable
          value={tareasFiltradas}
          paginator rows={12} stripedRows
          emptyMessage="No se encontraron tareas"
        >
          <Column field="folio" header="Folio" style={{ width: '90px', fontWeight: 700 }} />
          <Column field="ordenFolio" header="Orden" style={{ width: '120px' }} />
          <Column field="descripcion" header="Descripcion" />
          <Column
            field="asignadoNombre" header="Asignado" style={{ width: '155px' }}
            body={(row: Tarea) => row.asignadoNombre
              ? <span style={{ fontWeight: 600 }}>{row.asignadoNombre}</span>
              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin asignar</span>
            }
          />
          <Column field="prioridad" header="Prioridad" style={{ width: '110px' }}
            body={(row: Tarea) => (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: `${PRIORIDAD_COLORS[row.prioridad]}18`,
                color: PRIORIDAD_COLORS[row.prioridad],
                padding: '0.2rem 0.65rem',
                borderRadius: '12px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: PRIORIDAD_COLORS[row.prioridad],
                  flexShrink: 0,
                }} />
                {getPrioridadLabel(row.prioridad)}
              </span>
            )}
          />
          <Column field="porcentajeAvance" header="Avance" style={{ width: '110px' }}
            body={(row: Tarea) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{row.porcentajeAvance}%</span>
                </div>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${row.porcentajeAvance}%` }} />
                </div>
              </div>
            )}
          />
          <Column field="estado" header="Estado" style={{ width: '130px' }}
            body={(row: Tarea) => (
              <Tag value={getEstadoTareaLabel(row.estado)} severity={getEstadoTareaSeverity(row.estado)} />
            )}
          />
          <Column header="Acciones" style={{ width: '130px' }}
            body={(row: Tarea) => (
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {actionPerms?.asignarTarea && row.estado === 'activa' && (
                  <Button
                    icon="pi pi-user-plus"
                    className="p-button-text p-button-sm p-button-info"
                    tooltip="Asignar"
                    onClick={() => { setSelected(row); setAsignadoId(''); setShowAsignar(true); }}
                  />
                )}
                {actionPerms?.avanzarTarea && (row.estado === 'asignada' || row.estado === 'en_progreso') && (
                  <Button
                    icon="pi pi-chart-line"
                    className="p-button-text p-button-sm p-button-warning"
                    tooltip="Registrar avance"
                    onClick={() => {
                      setSelected(row);
                      setFormAvance({ porcentaje: row.porcentajeAvance, notas: row.notas });
                      setEvidenciasAvance([]);
                      setShowAvance(true);
                    }}
                  />
                )}
                {actionPerms?.validarTarea && row.estado === 'completada' && (
                  <Button
                    icon="pi pi-check-circle"
                    className="p-button-text p-button-sm p-button-success"
                    tooltip="Validar tarea"
                    onClick={() => { setSelected(row); setComentarioValidacion(''); setShowValidar(true); }}
                  />
                )}
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* ====== Dialog nueva tarea ====== */}
      <Dialog
        header="Nueva Tarea"
        visible={showDialog}
        style={{ width: '580px', maxWidth: '96vw' }}
        onHide={() => setShowDialog(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Crear Tarea" icon="pi pi-plus" onClick={handleCrearTarea} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={fieldLabel}>Orden de Trabajo *</label>
            <Dropdown
              value={formTarea.ordenId} options={ordenOptions}
              onChange={(e) => setFormTarea((f) => ({ ...f, ordenId: e.value as string }))}
              placeholder="Seleccionar orden" style={{ width: '100%' }} filter
            />
          </div>
          <div>
            <label style={fieldLabel}>Descripcion *</label>
            <InputTextarea
              value={formTarea.descripcion}
              onChange={(e) => setFormTarea((f) => ({ ...f, descripcion: e.target.value }))}
              rows={3} style={{ width: '100%' }} autoResize
              placeholder="Descripcion detallada de la tarea..."
            />
          </div>
          <div className="form-grid-2">
            <div>
              <label style={fieldLabel}>Servicio</label>
              <Dropdown
                value={formTarea.servicioId} options={servicioOptions}
                onChange={(e) => setFormTarea((f) => ({ ...f, servicioId: e.value as string }))}
                placeholder="Seleccionar servicio" style={{ width: '100%' }} filter showClear
              />
            </div>
            <div>
              <label style={fieldLabel}>Prioridad</label>
              <Dropdown
                value={formTarea.prioridad} options={prioridadOptions}
                onChange={(e) => setFormTarea((f) => ({ ...f, prioridad: e.value as PrioridadTarea }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* ====== Dialog asignar ====== */}
      <Dialog
        header="Asignar Tarea"
        visible={showAsignar}
        style={{ width: '450px', maxWidth: '96vw' }}
        onHide={() => setShowAsignar(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowAsignar(false)} />
            <Button label="Asignar" icon="pi pi-user-plus" onClick={handleAsignar} />
          </div>
        }
      >
        {selected && (
          <div>
            <div style={{
              background: 'var(--bg-surface-2)',
              borderRadius: '8px',
              padding: '0.9rem',
              marginBottom: '1.1rem',
              borderLeft: '3px solid var(--color-primary-500)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                {selected.folio} &bull; {selected.descripcion}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Orden: {selected.ordenFolio} &bull; Prioridad: {getPrioridadLabel(selected.prioridad)}
              </div>
            </div>
            <label style={fieldLabel}>Seleccionar Mecanico *</label>
            <Dropdown
              value={asignadoId} options={mecanicoOptions}
              onChange={(e) => setAsignadoId(e.value as string)}
              placeholder="Seleccionar mecanico" style={{ width: '100%' }}
            />
          </div>
        )}
      </Dialog>

      {/* ====== Dialog avance del mecanico ====== */}
      <Dialog
        header="Registrar Avance de Tarea"
        visible={showAvance}
        style={{ width: '600px', maxWidth: '96vw' }}
        onHide={() => setShowAvance(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowAvance(false)} />
            <Button label="Guardar Avance" icon="pi pi-save" onClick={handleAvance} />
          </div>
        }
      >
        {selected && (
          <TabView>
            <TabPanel header="Avance">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  padding: '0.9rem',
                  borderLeft: '3px solid var(--color-warning)',
                }}>
                  <div style={{ fontWeight: 700 }}>{selected.folio} &bull; {selected.descripcion}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mecanico: {selected.asignadoNombre}</div>
                </div>
                <div>
                  <label style={fieldLabel}>
                    Porcentaje de Avance:
                    <span style={{ color: 'var(--color-primary-500)', marginLeft: '0.5rem', fontSize: '1rem' }}>
                      {formAvance.porcentaje}%
                    </span>
                  </label>
                  <Slider
                    value={formAvance.porcentaje}
                    onChange={(e) => setFormAvance((f) => ({ ...f, porcentaje: e.value as number }))}
                    min={0} max={100} step={5}
                    style={{ marginTop: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>
                <div>
                  <label style={fieldLabel}>Notas y Observaciones</label>
                  <InputTextarea
                    value={formAvance.notas}
                    onChange={(e) => setFormAvance((f) => ({ ...f, notas: e.target.value }))}
                    rows={4} style={{ width: '100%' }} autoResize
                    placeholder="Describe el trabajo realizado, materiales usados, observaciones..."
                  />
                </div>
                {formAvance.porcentaje === 100 && (
                  <div style={{
                    background: 'var(--color-success-bg)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    color: 'var(--color-success)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <i className="pi pi-check-circle" style={{ fontSize: '1.1rem' }} />
                    Al guardar con 100%, la tarea pasara a estado "Completada" y quedara lista para validacion.
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Evidencias">
              <div style={{ marginBottom: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Adjunta fotos y documentos que evidencien el trabajo realizado.
              </div>
              <FileUploader
                files={evidenciasAvance}
                onChange={setEvidenciasAvance}
                label="Arrastra fotos del trabajo aqui o haz clic"
              />
            </TabPanel>
          </TabView>
        )}
      </Dialog>

      {/* ====== Dialog validar ====== */}
      <Dialog
        header="Validar Tarea Completada"
        visible={showValidar}
        style={{ width: '540px', maxWidth: '96vw' }}
        onHide={() => setShowValidar(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowValidar(false)} />
            <Button label="Rechazar" icon="pi pi-times" className="p-button-danger p-button-outlined"
              onClick={() => handleValidar(false)} />
            <Button label="Aprobar" icon="pi pi-check" className="p-button-success"
              onClick={() => handleValidar(true)} />
          </div>
        }
      >
        {selected && (
          <div>
            <div style={{
              background: 'var(--bg-surface-2)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.1rem',
              borderLeft: '3px solid var(--color-success)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem', fontSize: '1rem' }}>
                {selected.folio} &bull; {selected.descripcion}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Mecanico: <strong>{selected.asignadoNombre}</strong> &bull; Avance: <strong>{selected.porcentajeAvance}%</strong>
              </div>
              {selected.notas && (
                <div style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  borderLeft: '2px solid var(--border-color)',
                }}>
                  <strong>Notas del mecanico:</strong> {selected.notas}
                </div>
              )}
            </div>
            <label style={fieldLabel}>Comentario de Validacion</label>
            <InputTextarea
              value={comentarioValidacion}
              onChange={(e) => setComentarioValidacion(e.target.value)}
              rows={3} style={{ width: '100%' }} autoResize
              placeholder="Observaciones sobre la validacion..."
            />
          </div>
        )}
      </Dialog>
    </div>
  );
};
