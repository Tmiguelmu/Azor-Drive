// ============================================================
// PERMISOS POR ROL
// ============================================================

import type { UserRole } from '../types';

export interface MenuPermissions {
  dashboard: boolean;
  ordenes: boolean;
  tareas: boolean;
  misTareas: boolean;
  tareasValidar: boolean;
  inventario: boolean;
  clientes: boolean;
  servicios: boolean;
  catalogos: boolean;
  usuarios: boolean;
  roles: boolean;
  reportes: boolean;
}

export interface ActionPermissions {
  crearOrden: boolean;
  editarOrden: boolean;
  cerrarOrden: boolean;
  cancelarOrden: boolean;
  crearTarea: boolean;
  asignarTarea: boolean;
  autorizarTarea: boolean;
  avanzarTarea: boolean;
  validarTarea: boolean;
  gestionarInventario: boolean;
  gestionarClientes: boolean;
  gestionarServicios: boolean;
  gestionarCatalogos: boolean;
  gestionarUsuarios: boolean;
  verReportes: boolean;
}

const ROLE_MENU: Record<UserRole, MenuPermissions> = {
  admin: {
    dashboard: true, ordenes: true, tareas: true, misTareas: false, tareasValidar: false,
    inventario: true, clientes: true, servicios: true, catalogos: true, usuarios: true, roles: true, reportes: true,
  },
  gerencia: {
    dashboard: true, ordenes: true, tareas: true, misTareas: false, tareasValidar: false,
    inventario: true, clientes: true, servicios: true, catalogos: true, usuarios: true, roles: true, reportes: true,
  },
  ingenieria: {
    dashboard: true, ordenes: true, tareas: true, misTareas: false, tareasValidar: false,
    inventario: true, clientes: false, servicios: true, catalogos: false, usuarios: false, roles: false, reportes: false,
  },
  inspector: {
    dashboard: true, ordenes: true, tareas: true, misTareas: false, tareasValidar: false,
    inventario: false, clientes: false, servicios: false, catalogos: false, usuarios: false, roles: false, reportes: false,
  },
  mecanico: {
    dashboard: true, ordenes: false, tareas: false, misTareas: true, tareasValidar: false,
    inventario: false, clientes: false, servicios: false, catalogos: false, usuarios: false, roles: false, reportes: false,
  },
  certificado: {
    dashboard: true, ordenes: false, tareas: false, misTareas: false, tareasValidar: true,
    inventario: false, clientes: false, servicios: false, catalogos: false, usuarios: false, roles: false, reportes: false,
  },
  almacen: {
    dashboard: true, ordenes: false, tareas: false, misTareas: false, tareasValidar: false,
    inventario: true, clientes: false, servicios: false, catalogos: false, usuarios: false, roles: false, reportes: false,
  },
};

const ROLE_ACTIONS: Record<UserRole, ActionPermissions> = {
  admin: {
    crearOrden: true, editarOrden: true, cerrarOrden: true, cancelarOrden: true,
    crearTarea: true, asignarTarea: true, autorizarTarea: true, avanzarTarea: true, validarTarea: true,
    gestionarInventario: true, gestionarClientes: true, gestionarServicios: true,
    gestionarCatalogos: true, gestionarUsuarios: true, verReportes: true,
  },
  gerencia: {
    crearOrden: true, editarOrden: true, cerrarOrden: true, cancelarOrden: true,
    crearTarea: true, asignarTarea: true, autorizarTarea: true, avanzarTarea: false, validarTarea: false,
    gestionarInventario: true, gestionarClientes: true, gestionarServicios: true,
    gestionarCatalogos: true, gestionarUsuarios: true, verReportes: true,
  },
  ingenieria: {
    crearOrden: false, editarOrden: false, cerrarOrden: false, cancelarOrden: false,
    crearTarea: true, asignarTarea: false, autorizarTarea: true, avanzarTarea: false, validarTarea: false,
    gestionarInventario: false, gestionarClientes: false, gestionarServicios: false,
    gestionarCatalogos: false, gestionarUsuarios: false, verReportes: false,
  },
  inspector: {
    crearOrden: false, editarOrden: false, cerrarOrden: false, cancelarOrden: false,
    crearTarea: false, asignarTarea: true, autorizarTarea: false, avanzarTarea: false, validarTarea: false,
    gestionarInventario: false, gestionarClientes: false, gestionarServicios: false,
    gestionarCatalogos: false, gestionarUsuarios: false, verReportes: false,
  },
  mecanico: {
    crearOrden: false, editarOrden: false, cerrarOrden: false, cancelarOrden: false,
    crearTarea: false, asignarTarea: false, autorizarTarea: false, avanzarTarea: true, validarTarea: false,
    gestionarInventario: false, gestionarClientes: false, gestionarServicios: false,
    gestionarCatalogos: false, gestionarUsuarios: false, verReportes: false,
  },
  certificado: {
    crearOrden: false, editarOrden: false, cerrarOrden: false, cancelarOrden: false,
    crearTarea: false, asignarTarea: false, autorizarTarea: false, avanzarTarea: false, validarTarea: true,
    gestionarInventario: false, gestionarClientes: false, gestionarServicios: false,
    gestionarCatalogos: false, gestionarUsuarios: false, verReportes: false,
  },
  almacen: {
    crearOrden: false, editarOrden: false, cerrarOrden: false, cancelarOrden: false,
    crearTarea: false, asignarTarea: false, autorizarTarea: false, avanzarTarea: false, validarTarea: false,
    gestionarInventario: true, gestionarClientes: false, gestionarServicios: false,
    gestionarCatalogos: false, gestionarUsuarios: false, verReportes: false,
  },
};

export const getMenuPermissions = (rol: UserRole): MenuPermissions => ROLE_MENU[rol];
export const getActionPermissions = (rol: UserRole): ActionPermissions => ROLE_ACTIONS[rol];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  gerencia: 'Gerencia',
  ingenieria: 'Ingeniería',
  inspector: 'Inspector',
  mecanico: 'Mecánico',
  certificado: 'Mecánico Certificado',
  almacen: 'Almacén',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#7c3aed',
  gerencia: '#1d4ed8',
  ingenieria: '#0891b2',
  inspector: '#059669',
  mecanico: '#d97706',
  certificado: '#dc2626',
  almacen: '#9333ea',
};
