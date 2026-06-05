// ============================================================
// HELPERS Y UTILIDADES
// ============================================================

import type { EstadoOrden, EstadoTarea, PrioridadTarea } from '../types';

export type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | null | undefined;

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getEstadoOrdenLabel = (estado: EstadoOrden): string => {
  const labels: Record<EstadoOrden, string> = {
    activa: 'Activa',
    en_progreso: 'En Progreso',
    terminada: 'Terminada',
    cancelada: 'Cancelada',
  };
  return labels[estado];
};

export const getEstadoOrdenSeverity = (estado: EstadoOrden): TagSeverity => {
  const severities: Record<EstadoOrden, TagSeverity> = {
    activa: 'info',
    en_progreso: 'warning',
    terminada: 'success',
    cancelada: 'danger',
  };
  return severities[estado];
};

export const getEstadoTareaLabel = (estado: EstadoTarea): string => {
  const labels: Record<EstadoTarea, string> = {
    activa: 'Activa',
    asignada: 'Asignada',
    en_progreso: 'En Progreso',
    completada: 'Completada',
    verificada: 'Verificada',
    cancelada: 'Cancelada',
  };
  return labels[estado];
};

export const getEstadoTareaSeverity = (estado: EstadoTarea): TagSeverity => {
  const map: Record<EstadoTarea, TagSeverity> = {
    activa: 'secondary',
    asignada: 'info',
    en_progreso: 'warning',
    completada: 'success',
    verificada: 'success',
    cancelada: 'danger',
  };
  return map[estado];
};

export const getPrioridadLabel = (prioridad: PrioridadTarea): string => {
  const labels: Record<PrioridadTarea, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Critica',
  };
  return labels[prioridad];
};

export const getPrioridadSeverity = (prioridad: PrioridadTarea): TagSeverity => {
  const map: Record<PrioridadTarea, TagSeverity> = {
    baja: 'success',
    media: 'info',
    alta: 'warning',
    critica: 'danger',
  };
  return map[prioridad];
};

export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);
