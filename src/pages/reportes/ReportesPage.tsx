import { useState } from 'react';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  AreaChart, Area,
} from 'recharts';
import { useAppSelector } from '../../hooks/useAppDispatch';
import {
  getEstadoOrdenLabel, getEstadoOrdenSeverity,
  getEstadoTareaLabel, getEstadoTareaSeverity,
  formatCurrency, formatDate,
} from '../../utils/helpers';
import type { OrdenTrabajo, Tarea } from '../../types';
import toast from 'react-hot-toast';

// Colores
const C = {
  navy:   '#1B2A4A',
  blue:   '#3B6CB4',
  gold:   '#D4A843',
  green:  '#16a34a',
  orange: '#d97706',
  red:    '#dc2626',
  purple: '#7c3aed',
  teal:   '#0891b2',
};

const CHART_STYLE = {
  contentStyle: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    fontSize: '0.85rem',
    boxShadow: 'var(--shadow-md)',
  },
};

// Datos mock extendidos
const ORDENES_MES = [
  { mes: 'Ene', creadas: 4, terminadas: 3, canceladas: 1 },
  { mes: 'Feb', creadas: 7, terminadas: 5, canceladas: 0 },
  { mes: 'Mar', creadas: 5, terminadas: 4, canceladas: 1 },
  { mes: 'Abr', creadas: 9, terminadas: 7, canceladas: 2 },
  { mes: 'May', creadas: 6, terminadas: 6, canceladas: 0 },
  { mes: 'Jun', creadas: 11, terminadas: 8, canceladas: 1 },
];

const TENDENCIA_DATOS = [
  { mes: 'Ene', valor: 4 },
  { mes: 'Feb', valor: 7 },
  { mes: 'Mar', valor: 5 },
  { mes: 'Abr', valor: 9 },
  { mes: 'May', valor: 6 },
  { mes: 'Jun', valor: 11 },
];

const FACTURACION_MES = [
  { mes: 'Ene', monto: 85000 },
  { mes: 'Feb', monto: 142000 },
  { mes: 'Mar', monto: 98000 },
  { mes: 'Abr', monto: 175000 },
  { mes: 'May', monto: 122000 },
  { mes: 'Jun', monto: 210000 },
];

// Componente de botones de accion por seccion
const ChartActions = ({ onExport, onPrint, seccion }: {
  onExport: () => void;
  onPrint: () => void;
  seccion: string;
}) => (
  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
    <Button
      icon="pi pi-copy"
      label="Copiar"
      className="p-button-outlined p-button-sm"
      tooltip={`Copiar datos de ${seccion}`}
      onClick={() => {
        navigator.clipboard.writeText(`Reporte: ${seccion} - ${new Date().toLocaleDateString('es-MX')}`);
        toast.success('Datos copiados al portapapeles');
      }}
    />
    <Button
      icon="pi pi-print"
      label="Imprimir"
      className="p-button-outlined p-button-sm"
      tooltip="Imprimir esta seccion"
      onClick={onPrint}
    />
    <Button
      icon="pi pi-file-excel"
      label="Excel"
      className="p-button-sm"
      style={{ background: '#16a34a', border: 'none' }}
      tooltip="Exportar a Excel"
      onClick={onExport}
    />
  </div>
);

export const ReportesPage = () => {
  const ordenes   = useAppSelector((s) => s.ordenes.ordenes);
  const tareas    = useAppSelector((s) => s.tareas.tareas);
  const inventario = useAppSelector((s) => s.inventario.items);

  const [fechaDesde, setFechaDesde] = useState('2024-01-01');
  const [fechaHasta, setFechaHasta] = useState('2024-12-31');

  const handleExportXlsx = (nombre: string) => {
    toast.success(`Generando Excel: ${nombre}...`);
    // En produccion real: usar xlsx-js-style para generar el archivo
    setTimeout(() => toast.success(`${nombre}.xlsx descargado`), 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  // ---- Datos calculados ----
  const resumenOrdenes = [
    { label: 'Activas',    count: ordenes.filter((o) => o.estado === 'activa').length,      color: C.blue },
    { label: 'En Progreso', count: ordenes.filter((o) => o.estado === 'en_progreso').length, color: C.orange },
    { label: 'Terminadas', count: ordenes.filter((o) => o.estado === 'terminada').length,   color: C.green },
    { label: 'Canceladas', count: ordenes.filter((o) => o.estado === 'cancelada').length,   color: C.red },
  ];

  const pieDatos = resumenOrdenes.filter((d) => d.count > 0).map((d) => ({
    name: d.label, value: d.count,
  }));

  const tareasPorMecanico = (() => {
    const map: Record<string, { nombre: string; completadas: number; total: number }> = {};
    tareas.forEach((t) => {
      if (!t.asignadoNombre) return;
      if (!map[t.asignadoNombre]) map[t.asignadoNombre] = { nombre: t.asignadoNombre, completadas: 0, total: 0 };
      map[t.asignadoNombre].total++;
      if (['completada', 'verificada'].includes(t.estado)) map[t.asignadoNombre].completadas++;
    });
    return Object.values(map).slice(0, 8);
  })();

  const estadosTarea = [
    { estado: 'Activas',     count: tareas.filter((t) => t.estado === 'activa').length,      color: '#64748b' },
    { estado: 'Asignadas',   count: tareas.filter((t) => t.estado === 'asignada').length,    color: C.blue },
    { estado: 'En Progreso', count: tareas.filter((t) => t.estado === 'en_progreso').length, color: C.orange },
    { estado: 'Completadas', count: tareas.filter((t) => t.estado === 'completada').length,  color: C.green },
    { estado: 'Verificadas', count: tareas.filter((t) => t.estado === 'verificada').length,  color: '#059669' },
    { estado: 'Canceladas',  count: tareas.filter((t) => t.estado === 'cancelada').length,   color: C.red },
  ];

  const invStockOK   = inventario.filter((i) => i.cantidad > i.cantidadMinima).length;
  const invStockBajo = inventario.filter((i) => i.cantidad > 0 && i.cantidad <= i.cantidadMinima).length;
  const invSinStock  = inventario.filter((i) => i.cantidad === 0).length;

  const invData = [
    { label: 'Stock OK',    value: invStockOK,   color: C.green },
    { label: 'Stock Bajo',  value: invStockBajo, color: C.orange },
    { label: 'Sin Stock',   value: invSinStock,  color: C.red },
  ];

  const valorTotal = inventario.reduce((acc, i) => acc + i.costo * i.cantidad, 0);
  const facturacionTotal = FACTURACION_MES.reduce((acc, m) => acc + m.monto, 0);

  // KPI financiero
  const kpiFinanciero = [
    { label: 'Facturacion Total YTD', valor: formatCurrency(facturacionTotal), icon: 'pi-dollar', color: C.green, bg: 'var(--color-success-bg)' },
    { label: 'Valor Inventario',      valor: formatCurrency(valorTotal),       icon: 'pi-box',    color: C.blue,  bg: 'var(--color-info-bg)' },
    { label: 'Ticket Promedio OT',    valor: formatCurrency(facturacionTotal / Math.max(ordenes.length, 1)), icon: 'pi-chart-line', color: C.gold, bg: 'var(--color-warning-bg)' },
    { label: 'OT Cerradas',           valor: ordenes.filter((o) => o.estado === 'terminada').length.toString(), icon: 'pi-check-circle', color: C.green, bg: 'var(--color-success-bg)' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Reportes y Analitica</div>
          <div className="page-header-subtitle">Dashboard ejecutivo del sistema Azor Drive</div>
        </div>
        <div className="page-header-actions">
          {/* Rango de fechas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <i className="pi pi-calendar" style={{ color: 'var(--text-muted)' }} />
            <input
              type="date" value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '7px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.88rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                minHeight: '40px',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>al</span>
            <input
              type="date" value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '7px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.88rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                minHeight: '40px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs principales */}
      <TabView>
        {/* ===== Tab Ordenes ===== */}
        <TabPanel header="Ordenes de Trabajo">
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {resumenOrdenes.map((s) => (
              <div key={s.label} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div className="stat-card-value" style={{ color: s.color, fontSize: '2rem' }}>{s.count}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
            {/* Barras apiladas por mes */}
            <div className="surface-card">
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-chart-bar" style={{ color: C.blue }} />
                  Ordenes por Mes
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Ordenes_Por_Mes')}
                  onPrint={handlePrint}
                  seccion="Ordenes por Mes"
                />
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ORDENES_MES} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip {...CHART_STYLE} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.82rem' }} />
                  <Bar dataKey="creadas"    name="Creadas"    fill={C.blue}   radius={[3, 3, 0, 0]} />
                  <Bar dataKey="terminadas" name="Terminadas" fill={C.green}  radius={[3, 3, 0, 0]} />
                  <Bar dataKey="canceladas" name="Canceladas" fill={C.red}    radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie estado */}
            <div className="surface-card">
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-chart-pie" style={{ color: C.gold }} />
                  Distribucion por Estado
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Ordenes_Estado')}
                  onPrint={handlePrint}
                  seccion="Estado de Ordenes"
                />
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieDatos} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value">
                    {pieDatos.map((_, i) => (
                      <Cell key={i} fill={[C.blue, C.orange, C.green, C.red][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_STYLE} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.82rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Linea tendencia */}
            <div className="surface-card" style={{ gridColumn: '1 / -1' }}>
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-chart-line" style={{ color: C.teal }} />
                  Tendencia de Creacion de Ordenes
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Tendencia_Ordenes')}
                  onPrint={handlePrint}
                  seccion="Tendencia Ordenes"
                />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={TENDENCIA_DATOS} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorOrdenes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.blue} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip {...CHART_STYLE} />
                  <Area type="monotone" dataKey="valor" name="Ordenes" stroke={C.blue} strokeWidth={2.5} fill="url(#colorOrdenes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla completa */}
          <div className="surface-card">
            <div className="surface-card-header">
              <div className="surface-card-title">Listado Completo de Ordenes</div>
              <ChartActions
                onExport={() => handleExportXlsx('Ordenes_Completo')}
                onPrint={handlePrint}
                seccion="Ordenes"
              />
            </div>
            <DataTable value={ordenes} paginator rows={8} stripedRows>
              <Column field="folio" header="Folio" style={{ width: '130px', fontWeight: 700 }} />
              <Column field="clienteNombre" header="Cliente" />
              <Column field="matricula" header="Matricula" style={{ width: '105px' }} />
              <Column header="Aeronave" body={(row: OrdenTrabajo) => `${row.marca} ${row.modelo}`} />
              <Column field="fechaCreacion" header="Fecha Creacion" style={{ width: '130px' }}
                body={(row: OrdenTrabajo) => formatDate(row.fechaCreacion)} />
              <Column field="fechaCierre" header="Fecha Cierre" style={{ width: '120px' }}
                body={(row: OrdenTrabajo) => row.fechaCierre ? formatDate(row.fechaCierre) : '-'} />
              <Column field="estado" header="Estado" style={{ width: '140px' }}
                body={(row: OrdenTrabajo) => (
                  <Tag value={getEstadoOrdenLabel(row.estado)} severity={getEstadoOrdenSeverity(row.estado)} />
                )}
              />
            </DataTable>
          </div>
        </TabPanel>

        {/* ===== Tab Tareas ===== */}
        <TabPanel header="Tareas">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
            {/* Donut tareas por estado */}
            <div className="surface-card">
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-chart-pie" style={{ color: C.orange }} />
                  Tareas por Estado
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Tareas_Estado')}
                  onPrint={handlePrint}
                  seccion="Tareas por Estado"
                />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estadosTarea.filter((s) => s.count > 0)}
                    dataKey="count" nameKey="estado"
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95} paddingAngle={3}
                  >
                    {estadosTarea.filter((s) => s.count > 0).map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip {...CHART_STYLE} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.82rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Barras horizontales por mecanico */}
            <div className="surface-card">
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-users" style={{ color: C.blue }} />
                  Tareas por Mecanico
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Tareas_Mecanico')}
                  onPrint={handlePrint}
                  seccion="Tareas por Mecanico"
                />
              </div>
              {tareasPorMecanico.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {tareasPorMecanico.map((m) => {
                    const pct = m.total ? Math.round((m.completadas / m.total) * 100) : 0;
                    return (
                      <div key={m.nombre}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.88rem' }}>
                          <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{m.completadas}/{m.total} ({pct}%)</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Sin datos de asignacion
                </div>
              )}
            </div>
          </div>

          {/* Tabla tareas */}
          <div className="surface-card">
            <div className="surface-card-header">
              <div className="surface-card-title">Listado Completo de Tareas</div>
              <ChartActions
                onExport={() => handleExportXlsx('Tareas_Completo')}
                onPrint={handlePrint}
                seccion="Tareas"
              />
            </div>
            <DataTable value={tareas} paginator rows={8} stripedRows>
              <Column field="folio" header="Folio" style={{ width: '90px' }} />
              <Column field="ordenFolio" header="Orden" style={{ width: '120px' }} />
              <Column field="descripcion" header="Descripcion" />
              <Column field="asignadoNombre" header="Asignado" style={{ width: '155px' }} />
              <Column field="porcentajeAvance" header="Avance" style={{ width: '95px' }}
                body={(row: Tarea) => `${row.porcentajeAvance}%`} />
              <Column field="estado" header="Estado" style={{ width: '130px' }}
                body={(row: Tarea) => (
                  <Tag value={getEstadoTareaLabel(row.estado)} severity={getEstadoTareaSeverity(row.estado)} />
                )}
              />
            </DataTable>
          </div>
        </TabPanel>

        {/* ===== Tab Inventario ===== */}
        <TabPanel header="Inventario">
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {invData.map((d) => (
              <div key={d.label} className="stat-card" style={{ borderLeft: `4px solid ${d.color}` }}>
                <div className="stat-card-value" style={{ color: d.color }}>{d.value}</div>
                <div className="stat-card-label">{d.label}</div>
              </div>
            ))}
            <div className="stat-card card-border-info">
              <div className="stat-card-label">Valor Total</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: C.blue, marginTop: '0.4rem' }}>
                {formatCurrency(valorTotal)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.1rem', marginBottom: '1.5rem' }}>
            {/* Barras stock */}
            <div className="surface-card">
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-box" style={{ color: C.blue }} />
                  Estado del Stock
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Inventario_Estado')}
                  onPrint={handlePrint}
                  seccion="Estado Stock"
                />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={invData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} width={80} />
                  <Tooltip {...CHART_STYLE} />
                  <Bar dataKey="value" name="Items" radius={[0, 4, 4, 0]}>
                    {invData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla alertas */}
            <div className="surface-card">
              <div className="surface-card-header">
                <div className="surface-card-title">
                  <i className="pi pi-exclamation-triangle" style={{ color: C.red }} />
                  Items con Stock Bajo
                </div>
                <ChartActions
                  onExport={() => handleExportXlsx('Stock_Bajo')}
                  onPrint={handlePrint}
                  seccion="Stock Bajo"
                />
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {inventario.filter((i) => i.cantidad <= i.cantidadMinima).map((item) => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.55rem 0.75rem',
                    borderBottom: '1px solid var(--border-light)',
                    borderLeft: `3px solid ${item.cantidad === 0 ? C.red : C.orange}`,
                    marginBottom: '0.35rem',
                    background: item.cantidad === 0 ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.codigo}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.descripcion.substring(0, 28)}...
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontWeight: 800,
                        color: item.cantidad === 0 ? C.red : C.orange,
                      }}>
                        {item.cantidad} / {item.cantidadMinima}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.unidad}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>

        {/* ===== Tab Financiero ===== */}
        <TabPanel header="Financiero">
          {/* KPIs grandes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {kpiFinanciero.map((k) => (
              <div key={k.label} className="stat-card" style={{ borderLeft: `4px solid ${k.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '10px',
                    background: k.bg, color: k.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem',
                  }}>
                    <i className={`pi ${k.icon}`} />
                  </div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: '0.3rem' }}>
                  {k.valor}
                </div>
                <div className="stat-card-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Grafica facturacion */}
          <div className="surface-card" style={{ marginBottom: '1.25rem' }}>
            <div className="surface-card-header">
              <div className="surface-card-title">
                <i className="pi pi-chart-line" style={{ color: C.green }} />
                Facturacion Mensual (Mock)
              </div>
              <ChartActions
                onExport={() => handleExportXlsx('Facturacion_Mensual')}
                onPrint={handlePrint}
                seccion="Facturacion"
              />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={FACTURACION_MES} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorFacturacion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.green} stopOpacity={0.85} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  {...CHART_STYLE}
                  formatter={(value) => [formatCurrency(Number(value)), 'Facturacion']}
                />
                <Bar dataKey="monto" name="Facturacion" fill="url(#colorFacturacion)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla resumen mensual */}
          <div className="surface-card">
            <div className="surface-card-header">
              <div className="surface-card-title">Resumen Financiero por Mes</div>
              <ChartActions
                onExport={() => handleExportXlsx('Resumen_Financiero')}
                onPrint={handlePrint}
                seccion="Resumen Financiero"
              />
            </div>
            <DataTable
              value={FACTURACION_MES}
              stripedRows
            >
              <Column field="mes" header="Mes" style={{ fontWeight: 700 }} />
              <Column field="monto" header="Facturacion"
                body={(row) => formatCurrency(row.monto)} />
              <Column header="% del Total"
                body={(row) => `${((row.monto / facturacionTotal) * 100).toFixed(1)}%`} />
              <Column header="Estado" body={() => (
                <Tag value="Cerrado" severity="success" />
              )} />
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
};
