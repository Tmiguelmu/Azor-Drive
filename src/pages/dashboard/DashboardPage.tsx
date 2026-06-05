import { useAppSelector } from '../../hooks/useAppDispatch';
import { useAuth } from '../../hooks/useAuth';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  getEstadoOrdenLabel,
  getEstadoOrdenSeverity,
  formatDate,
} from '../../utils/helpers';
import type { OrdenTrabajo } from '../../types';

const COLORS_PIE = ['#3B6CB4', '#d97706', '#16a34a', '#dc2626'];

export const DashboardPage = () => {
  const { user } = useAuth();
  const ordenes = useAppSelector((s) => s.ordenes.ordenes);
  const tareas = useAppSelector((s) => s.tareas.tareas);
  const inventario = useAppSelector((s) => s.inventario.items);

  const ordenesActivas    = ordenes.filter((o) => o.estado === 'activa').length;
  const ordenesEnProgreso = ordenes.filter((o) => o.estado === 'en_progreso').length;
  const tareasPendientes  = tareas.filter((t) => ['activa', 'asignada', 'en_progreso'].includes(t.estado)).length;
  const stockBajo         = inventario.filter((i) => i.cantidad <= i.cantidadMinima).length;
  const ultimasOrdenes    = ordenes.slice(0, 8);

  const stats = [
    {
      label: 'Ordenes Activas',
      value: ordenesActivas,
      icon: 'pi pi-file-edit',
      color: '#3B6CB4',
      bg: '#DBEAFE',
      borderClass: 'card-border-info',
      trend: '+2 esta semana',
      trendColor: '#3B6CB4',
    },
    {
      label: 'En Progreso',
      value: ordenesEnProgreso,
      icon: 'pi pi-spinner',
      color: '#d97706',
      bg: '#FEF3C7',
      borderClass: 'card-border-warning',
      trend: '3 con retraso',
      trendColor: '#dc2626',
    },
    {
      label: 'Tareas Pendientes',
      value: tareasPendientes,
      icon: 'pi pi-list-check',
      color: '#059669',
      bg: '#D1FAE5',
      borderClass: 'card-border-success',
      trend: '5 sin asignar',
      trendColor: '#d97706',
    },
    {
      label: 'Alertas de Stock',
      value: stockBajo,
      icon: 'pi pi-exclamation-triangle',
      color: '#dc2626',
      bg: '#FEE2E2',
      borderClass: 'card-border-danger',
      trend: '2 sin existencias',
      trendColor: '#dc2626',
    },
  ];

  const tareaStats = [
    { label: 'Activas',     count: tareas.filter((t) => t.estado === 'activa').length,     color: '#64748b' },
    { label: 'Asignadas',   count: tareas.filter((t) => t.estado === 'asignada').length,   color: '#2563eb' },
    { label: 'En Progreso', count: tareas.filter((t) => t.estado === 'en_progreso').length, color: '#d97706' },
    { label: 'Completadas', count: tareas.filter((t) => t.estado === 'completada').length,  color: '#16a34a' },
    { label: 'Verificadas', count: tareas.filter((t) => t.estado === 'verificada').length,  color: '#059669' },
  ];

  // Datos mock para grafica de barras (ordenes por mes)
  const ordenesPorMes = [
    { mes: 'Ene', ordenes: 4 },
    { mes: 'Feb', ordenes: 7 },
    { mes: 'Mar', ordenes: 5 },
    { mes: 'Abr', ordenes: 9 },
    { mes: 'May', ordenes: 6 },
    { mes: 'Jun', ordenes: 11 },
  ];

  const dataPie = [
    { name: 'Activas',    value: ordenesActivas },
    { name: 'En Progreso', value: ordenesEnProgreso },
    { name: 'Terminadas', value: ordenes.filter((o) => o.estado === 'terminada').length },
    { name: 'Canceladas', value: ordenes.filter((o) => o.estado === 'cancelada').length },
  ].filter((d) => d.value > 0);

  return (
    <div>
      {/* Saludo */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          Bienvenido, {user?.nombre.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Sistema de Gestion de Mantenimiento Aeronautico &bull; Azor Drive ERP
        </p>
      </div>

      {/* Stats KPI */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.1rem',
        marginBottom: '1.75rem',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.borderClass}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-card-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
              <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                <i className={stat.icon} />
              </div>
            </div>
            <div className="stat-card-trend" style={{ color: stat.trendColor }}>
              <i className="pi pi-info-circle" style={{ marginRight: '0.3rem', fontSize: '0.72rem' }} />
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Graficas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.1rem',
        marginBottom: '1.75rem',
      }}>
        {/* Barras: ordenes por mes */}
        <div className="surface-card">
          <div className="surface-card-header">
            <div className="surface-card-title">
              <i className="pi pi-chart-bar" style={{ color: 'var(--color-primary-500)' }} />
              Ordenes por Mes
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ultimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordenesPorMes} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              />
              <Bar dataKey="ordenes" fill="#3B6CB4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: ordenes por estado */}
        <div className="surface-card">
          <div className="surface-card-header">
            <div className="surface-card-title">
              <i className="pi pi-chart-pie" style={{ color: 'var(--color-gold-500)' }} />
              Estado de Ordenes
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ordenes.length} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {dataPie.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de tareas con barras */}
        <div className="surface-card">
          <div className="surface-card-header">
            <div className="surface-card-title">
              <i className="pi pi-list-check" style={{ color: 'var(--color-success)' }} />
              Estado de Tareas
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tareas.length} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {tareaStats.map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>
                    {item.count}
                  </span>
                </div>
                <div className="progress-bar-container" style={{ height: '7px' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${tareas.length ? (item.count / tareas.length) * 100 : 0}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tablas y alertas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.1rem',
      }}>
        {/* Ultimas ordenes */}
        <div className="surface-card" style={{ gridColumn: 'span 2' }}>
          <div className="surface-card-header">
            <div className="surface-card-title">
              <i className="pi pi-file-edit" style={{ color: 'var(--color-primary-500)' }} />
              Ultimas Ordenes de Trabajo
            </div>
          </div>
          <DataTable value={ultimasOrdenes} size="small" stripedRows>
            <Column field="folio" header="Folio" style={{ width: '120px', fontWeight: 700 }} />
            <Column field="clienteNombre" header="Cliente" />
            <Column field="matricula" header="Matricula" style={{ width: '100px' }} />
            <Column header="Aeronave" body={(row: OrdenTrabajo) => `${row.marca} ${row.modelo}`} />
            <Column
              field="fechaCreacion"
              header="Fecha"
              style={{ width: '110px' }}
              body={(row: OrdenTrabajo) => formatDate(row.fechaCreacion)}
            />
            <Column
              field="estado"
              header="Estado"
              style={{ width: '140px' }}
              body={(row: OrdenTrabajo) => (
                <Tag
                  value={getEstadoOrdenLabel(row.estado)}
                  severity={getEstadoOrdenSeverity(row.estado)}
                />
              )}
            />
          </DataTable>
        </div>

        {/* Alertas stock */}
        <div className="surface-card">
          <div className="surface-card-header">
            <div className="surface-card-title">
              <i className="pi pi-exclamation-triangle" style={{ color: '#dc2626' }} />
              Alertas de Inventario
            </div>
            <span style={{
              background: '#FEE2E2',
              color: '#dc2626',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: '10px',
            }}>{stockBajo} alertas</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {inventario.filter((i) => i.cantidad <= i.cantidadMinima).slice(0, 6).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.9rem',
                  background: item.cantidad === 0 ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${item.cantidad === 0 ? '#dc2626' : '#d97706'}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {item.codigo}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {item.descripcion.substring(0, 32)}...
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: item.cantidad === 0 ? '#dc2626' : '#d97706',
                  }}>
                    {item.cantidad} {item.unidad}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    Min: {item.cantidadMinima}
                  </div>
                </div>
              </div>
            ))}
            {stockBajo === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '1.5rem',
                color: 'var(--color-success)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}>
                <i className="pi pi-check-circle" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} />
                Stock en niveles optimos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
