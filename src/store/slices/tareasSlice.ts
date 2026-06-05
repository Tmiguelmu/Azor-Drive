import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Tarea } from '../../types';
import { MOCK_TAREAS } from '../../services/mockData';

interface TareasState {
  tareas: Tarea[];
}

const initialState: TareasState = {
  tareas: MOCK_TAREAS,
};

const tareasSlice = createSlice({
  name: 'tareas',
  initialState,
  reducers: {
    addTarea(state, action: PayloadAction<Tarea>) {
      state.tareas.unshift(action.payload);
    },
    updateTarea(state, action: PayloadAction<Tarea>) {
      const idx = state.tareas.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.tareas[idx] = action.payload;
    },
    deleteTarea(state, action: PayloadAction<string>) {
      state.tareas = state.tareas.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTarea, updateTarea, deleteTarea } = tareasSlice.actions;
export default tareasSlice.reducer;
