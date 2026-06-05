# Azor Drive - Memoria del Agente

## Stack tecnologico
- React 18 + TypeScript + Vite
- PrimeReact 10 (UI components)
- Redux Toolkit + redux-persist (estado global)
- react-router-dom v7
- recharts (graficas - instalado Jun 2026)
- xlsx + file-saver (exportar Excel)
- react-hot-toast (notificaciones)

## Arquitectura del proyecto
- `src/types/index.ts` - Tipos globales (User, OrdenTrabajo, Tarea, etc.)
- `src/store/` - Redux slices: auth, ordenes, tareas, inventario, catalogos, theme
- `src/utils/permissions.ts` - Permisos por rol (MenuPermissions, ActionPermissions)
- `src/utils/helpers.ts` - Helpers (formatDate, formatCurrency, getEstadoLabel, etc.)
- `src/hooks/` - useAuth, useTheme, useAppDispatch
- `src/components/layout/` - Sidebar, Header, AppLayout, AzorLogo
- `src/components/common/` - ProtectedRoute, NotFoundPage, FileUploader

## Paleta de colores
- Navy primario: #1B2A4A
- Acento dorado: #D4A843 (--color-gold-500)
- Sidebar: --bg-sidebar = #1B2A4A
- Active sidebar border: dorado #D4A843

## Sidebar
- Ancho 280px (--sidebar-width)
- Secciones: Principal, Operaciones, Almacen, Catalogos, Administracion
- Badges de contador en items
- Seccion dorada de acento en titulos

## Rutas registradas
/dashboard, /ordenes, /tareas, /mis-tareas, /validar-tareas, /inventario,
/clientes, /servicios, /catalogos, /usuarios, /roles, /reportes

## Permisos de menu
MenuPermissions incluye campo `roles: boolean` (agregado Jun 2026)
Solo admin y gerencia tienen roles: true

## Componentes clave creados/mejorados
- FileUploader.tsx: drag&drop, base64, preview grid, tipos imagen/pdf/otro
- RolesPage.tsx: CRUD roles, matriz permisos por modulo, vista previa menu
- ReportesPage.tsx: recharts (Bar, Pie, Area, Line), tabs, export Excel mock
- OrdenesPage.tsx: vista Cards + Tabla toggle, detalle con Stepper, FileUploader en Evidencias
- TareasPage.tsx: KPIs mini, FileUploader en avance del mecanico
- DashboardPage.tsx: recharts BarChart + PieChart + AreaChart

## Estilos CSS clave (index.css)
- font-size base: 15px
- .p-inputtext min-height: 44px
- .p-button padding: 0.7rem 1.5rem
- DataTable rows min-height: 48px
- .stat-card, .surface-card, .ot-card - componentes de card
- .file-drop-zone, .file-preview-grid - FileUploader
- .stepper, .stepper-dot, .stepper-line - Stepper horizontal
- .card-border-info/warning/success/danger - bordes izquierdos
- .erp-fieldset, .form-grid-2, .form-grid-3 - formularios
- .sidebar-item.active usa border-left dorado en lugar de ::before

## Preferencias del usuario
- Idioma: Espanol en UI y en el codigo
- Estilo ERP corporativo denso, tipo SAP/Oracle
- Sin emojis en el codigo
