import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { updateTarea } from '../../store/slices/tareasSlice';
import type { Tarea } from '../../types';
import { getPrioridadLabel, getPrioridadSeverity } from '../../utils/helpers';
import toast from 'react-hot-toast';

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem',
  fontWeight: 600, color: 'var(--text-secondary)',
};

export const ValidarTareasPage = () => {
  const dispatch = useAppDispatch();
  const tareas = useAppSelector((s) => s.tareas.tareas);

  const tareasParaValidar = tareas.filter((t) => t.estado === 'completada');

  const [showValidar, setShowValidar] = useState(false);
  const [selected, setSelected] = useState<Tarea | null>(null);
  const [comentario, setComentario] = useState('');

  const handleValidar = (aprobado: boolean) => {
    if (!selected) return;
    dispatch(updateTarea({
      ...selected,
      estado: aprobado ? 'verificada' : 'en_progreso',
      comentarioValidacion: comentario,
    }));
    toast.success(aprobado ? 'Tarea aprobada y verificada' : 'Tarea regresada al mecanico');
    setShowValidar(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Tareas por Validar</div>
          <div className="page-header-subtitle">{tareasParaValidar.length} tareas pendientes de validacion</div>
        </div>
      </div>

      <div className="surface-card">
        <DataTable value={tareasParaValidar} paginator rows={10} stripedRows
          emptyMessage="No hay tareas pendientes de validacion">
          <Column field="folio" header="Folio" style={{ width: '80px', fontWeight: 600 }} />
          <Column field="ordenFolio" header="Orden" style={{ width: '110px' }} />
          <Column field="descripcion" header="Descripcion" />
          <Column field="asignadoNombre" header="Mecanico" style={{ width: '140px' }} />
          <Column field="prioridad" header="Prioridad" style={{ width: '100px' }}
            body={(row: Tarea) => (
              <Tag value={getPrioridadLabel(row.prioridad)} severity={getPrioridadSeverity(row.prioridad)} />
            )} />
          <Column field="notas" header="Notas del Mecanico"
            body={(row: Tarea) => (
              <span style={{ color: 'var(--text-secondary)' }}>
                {row.notas || '-'}
              </span>
            )} />
          <Column header="Acciones" style={{ width: '120px' }}
            body={(row: Tarea) => (
              <Button icon="pi pi-check-circle" className="p-button-sm p-button-success"
                label="Validar"
                onClick={() => { setSelected(row); setComentario(''); setShowValidar(true); }} />
            )} />
        </DataTable>
      </div>

      <Dialog header="Validacion de Tarea" visible={showValidar} style={{ width: '520px', maxWidth: '95vw' }}
        onHide={() => setShowValidar(false)}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button label="Cancelar" className="p-button-text" onClick={() => setShowValidar(false)} />
            <Button label="Rechazar" icon="pi pi-times" className="p-button-danger p-button-outlined"
              onClick={() => handleValidar(false)} />
            <Button label="Aprobar y Verificar" icon="pi pi-check" className="p-button-success"
              onClick={() => handleValidar(true)} />
          </div>
        }
      >
        {selected && (
          <div>
            <div style={{ background: 'var(--bg-surface-2)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {selected.folio} - {selected.descripcion}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Orden: {selected.ordenFolio} | Mecanico: {selected.asignadoNombre}
              </div>
              {selected.notas && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: '6px' }}>
                  <strong>Notas del mecanico:</strong> {selected.notas}
                </div>
              )}
            </div>
            <label style={labelStyle}>Comentario de Validacion (opcional)</label>
            <InputTextarea value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3} style={{ width: '100%' }} autoResize
              placeholder="Observaciones sobre el trabajo realizado..." />
          </div>
        )}
      </Dialog>
    </div>
  );
};
