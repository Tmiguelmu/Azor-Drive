import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrdenTrabajo } from '../../types';
import { MOCK_ORDENES } from '../../services/mockData';

interface OrdenesState {
  ordenes: OrdenTrabajo[];
}

const initialState: OrdenesState = {
  ordenes: MOCK_ORDENES,
};

const ordenesSlice = createSlice({
  name: 'ordenes',
  initialState,
  reducers: {
    addOrden(state, action: PayloadAction<OrdenTrabajo>) {
      state.ordenes.unshift(action.payload);
    },
    updateOrden(state, action: PayloadAction<OrdenTrabajo>) {
      const idx = state.ordenes.findIndex((o) => o.id === action.payload.id);
      if (idx !== -1) state.ordenes[idx] = action.payload;
    },
    deleteOrden(state, action: PayloadAction<string>) {
      state.ordenes = state.ordenes.filter((o) => o.id !== action.payload);
    },
  },
});

export const { addOrden, updateOrden, deleteOrden } = ordenesSlice.actions;
export default ordenesSlice.reducer;
