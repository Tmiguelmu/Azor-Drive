// ============================================================
// TIPOS GLOBALES - Azor Drive
// ============================================================

export type UserRole =
  | 'admin'
  | 'gerencia'
  | 'ingenieria'
  | 'inspector'
  | 'mecanico'
  | 'certificado'
  | 'almacen';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  avatar?: string;
}

export type EstadoOrden = 'activa' | 'en_progreso' | 'terminada' | 'cancelada';

export interface OrdenTrabajo {
  id: string;
  folio: string;
  clienteId: string;
  clienteNombre: string;
  matricula: string;
  serie: string;
  marca: string;
  modelo: string;
  planeadorHrs: number;
  motorHrs1: number;
  motorHrs2?: number;
  motorHrs3?: number;
  motorHrs4?: number;
  ciclos1: number;
  ciclos2?: number;
  ciclos3?: number;
  ciclos4?: number;
  aterrizajes: number;
  comentarios: string;
  estado: EstadoOrden;
  fechaCreacion: string;
  fechaCierre?: string;
  creadoPor: string;
  tareas: string[];
}

export type EstadoTarea =
  | 'activa'
  | 'asignada'
  | 'en_progreso'
  | 'completada'
  | 'verificada'
  | 'cancelada';

export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'critica';

export interface Evidencia {
  id: string;
  nombre: string;
  tipo: 'imagen' | 'pdf' | 'otro';
  url: string;
  fechaSubida: string;
  subidoPor: string;
}

export interface Tarea {
  id: string;
  folio: string;
  ordenId: string;
  ordenFolio: string;
  descripcion: string;
  servicioId: string;
  servicioNombre: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  asignadoA?: string;
  asignadoNombre?: string;
  porcentajeAvance: number;
  notas: string;
  evidencias: Evidencia[];
  materialesRequeridos: MaterialTarea[];
  fechaCreacion: string;
  fechaAsignacion?: string;
  fechaCompletada?: string;
  creadoPor: string;
  comentarioValidacion?: string;
}

export interface MaterialTarea {
  inventarioId: string;
  descripcion: string;
  cantidadRequerida: number;
  cantidadEntregada: number;
}

export interface Cliente {
  id: string;
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

export interface AgrupacionFacturacion {
  id: string;
  clave: string;
  nombre: string;
}

export interface Servicio {
  id: string;
  clave: string;
  descripcion: string;
  agrupacionId: string;
  agrupacionNombre: string;
  precioVenta: number;
  precioAnterior: number;
  activo: boolean;
}

export interface Inventario {
  id: string;
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

export interface MovimientoInventario {
  id: string;
  inventarioId: string;
  inventarioCodigo: string;
  inventarioDescripcion: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string;
  referenciaId?: string;
  referenciaFolio?: string;
  fecha: string;
  registradoPor: string;
}
