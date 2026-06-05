import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Slider } from 'primereact/slider';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { updateTarea } from '../../store/slices/tareasSlice';
import type { Tarea, EstadoTarea } from '../../types';
import { getEstadoTareaLabel, getEstadoTareaSeverity, getPrioridadLabel, getPrioridadSeverity } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

export const MisTareasPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const tareas = useAppSelector((s) => s.tareas.tareas);

  const misTareas = tareas.filter((t) => t.asignadoA === user?.id);

  const [showAvance, setShowAvance] = useState(false);
  const [selected, setSelected] = useState<Tarea | null>(null);
  const [formAvance, setFormAvance] = useState({ porcentaje: 0, notas: '' });

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
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Mis Tareas</div>
          <div className="page-header-subtitle">{misTareas.length} tareas asignadas</div>
        </div>
      </div>

      <div className="surface-card">
        <DataTable value={misTareas} paginator rows={10} stripedRows
          emptyMessage="No tienes tareas asignadas">
          <Column field="folio" header="Folio" style={{ width: '80px', fontWeight: 600 }} />
          <Column field="ordenFolio" header="Orden" style={{ width: '110px' }} />
          <Column field="descripcion" header="Descripcion" />
          <Column field="prioridad" header="Prioridad" style={{ width: '100px' }}
            body={(row: Tarea) => (
              <Tag value={getPrioridadLabel(row.prioridad)} severity={getPrioridadSeverity(row.prioridad)} />
            )} />
          <Column field="porcentajeAvance" header="Avance" style={{ width: '120px' }}
            body={(row: Tarea) => (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{row.porcentajeAvance}%</div>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${row.porcentajeAvance}%` }} />
                </div>
              </div>
            )} />
          <Column field="estado" header="Estado" style={{ width: '130px' }}
            body={(row: Tarea) => (
              <Tag value={getEstadoTareaLabel(row.estado)} severity={getEstadoTareaSeverity(row.estado)} />
            )} />
          <Column header="Acciones" style={{ width: '120px' }}
            body={(row: Tarea) => (
              (row.estado === 'asignada' || row.estado === 'en_progreso') ? (
                <Button icon="pi pi-chart-line" className="p-button-text p-button-sm p-button-warning"
                  label="Avance"
                  onClick={() => { setSelected(row); setFormAvance({ porcentaje: row.porcentajeAvance, notas: row.notas }); setShowAvance(true); }} />
              ) : null
            )} />
        </DataTable>
      </div>

      <Dialog header="Registrar Avance" visible={showAvance} style={{ width: '480px', maxWidth: '95vw' }}
        onHide={() => setShowAvance(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowAvance(false)} />
            <Button label="Guardar Avance" icon="pi pi-save" onClick={handleAvance} />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Porcentaje de Avance: {formAvance.porcentaje}%</label>
            <Slider value={formAvance.porcentaje}
              onChange={(e) => setFormAvance((f) => ({ ...f, porcentaje: e.value as number }))}
              min={0} max={100} step={5} style={{ marginTop: '0.5rem' }} />
          </div>
          <div>
            <label style={labelStyle}>Notas y Observaciones</label>
            <InputTextarea value={formAvance.notas}
              onChange={(e) => setFormAvance((f) => ({ ...f, notas: e.target.value }))}
              rows={4} style={{ width: '100%' }} autoResize />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
