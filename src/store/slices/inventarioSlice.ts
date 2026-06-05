import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Inventario, MovimientoInventario } from '../../types';
import { MOCK_INVENTARIO, MOCK_MOVIMIENTOS } from '../../services/mockData';

interface InventarioState {
  items: Inventario[];
  movimientos: MovimientoInventario[];
}

const initialState: InventarioState = {
  items: MOCK_INVENTARIO,
  movimientos: MOCK_MOVIMIENTOS,
};

const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Inventario>) {
      state.items.unshift(action.payload);
    },
    updateItem(state, action: PayloadAction<Inventario>) {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    addMovimiento(state, action: PayloadAction<MovimientoInventario>) {
      state.movimientos.unshift(action.payload);
      const item = state.items.find((i) => i.id === action.payload.inventarioId);
      if (item) {
        if (action.payload.tipo === 'entrada') {
          item.cantidad += action.payload.cantidad;
        } else {
          item.cantidad = Math.max(0, item.cantidad - action.payload.cantidad);
        }
      }
    },
  },
});

export const { addItem, updateItem, deleteItem, addMovimiento } = inventarioSlice.actions;
export default inventarioSlice.reducer;
