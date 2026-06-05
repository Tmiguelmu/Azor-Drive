import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Cliente, Servicio, AgrupacionFacturacion, User } from '../../types';
import { MOCK_CLIENTES, MOCK_SERVICIOS, MOCK_AGRUPACIONES, MOCK_USERS } from '../../services/mockData';

interface CatalogosState {
  clientes: Cliente[];
  servicios: Servicio[];
  agrupaciones: AgrupacionFacturacion[];
  usuarios: User[];
}

const initialState: CatalogosState = {
  clientes: MOCK_CLIENTES,
  servicios: MOCK_SERVICIOS,
  agrupaciones: MOCK_AGRUPACIONES,
  usuarios: MOCK_USERS,
};

const catalogosSlice = createSlice({
  name: 'catalogos',
  initialState,
  reducers: {
    // Clientes
    addCliente(state, action: PayloadAction<Cliente>) { state.clientes.unshift(action.payload); },
    updateCliente(state, action: PayloadAction<Cliente>) {
      const idx = state.clientes.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.clientes[idx] = action.payload;
    },
    deleteCliente(state, action: PayloadAction<string>) {
      state.clientes = state.clientes.filter((c) => c.id !== action.payload);
    },
    // Servicios
    addServicio(state, action: PayloadAction<Servicio>) { state.servicios.unshift(action.payload); },
    updateServicio(state, action: PayloadAction<Servicio>) {
      const idx = state.servicios.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) state.servicios[idx] = action.payload;
    },
    deleteServicio(state, action: PayloadAction<string>) {
      state.servicios = state.servicios.filter((s) => s.id !== action.payload);
    },
    // Agrupaciones
    addAgrupacion(state, action: PayloadAction<AgrupacionFacturacion>) { state.agrupaciones.unshift(action.payload); },
    updateAgrupacion(state, action: PayloadAction<AgrupacionFacturacion>) {
      const idx = state.agrupaciones.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) state.agrupaciones[idx] = action.payload;
    },
    deleteAgrupacion(state, action: PayloadAction<string>) {
      state.agrupaciones = state.agrupaciones.filter((a) => a.id !== action.payload);
    },
    // Usuarios
    addUsuario(state, action: PayloadAction<User>) { state.usuarios.unshift(action.payload); },
    updateUsuario(state, action: PayloadAction<User>) {
      const idx = state.usuarios.findIndex((u) => u.id === action.payload.id);
      if (idx !== -1) state.usuarios[idx] = action.payload;
    },
    deleteUsuario(state, action: PayloadAction<string>) {
      state.usuarios = state.usuarios.filter((u) => u.id !== action.payload);
    },
  },
});

export const {
  addCliente, updateCliente, deleteCliente,
  addServicio, updateServicio, deleteServicio,
  addAgrupacion, updateAgrupacion, deleteAgrupacion,
  addUsuario, updateUsuario, deleteUsuario,
} = catalogosSlice.actions;
export default catalogosSlice.reducer;
