import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// Importar outros reducers aqui

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // areas: areasReducer, (exemplo futuro)
    // processes: processesReducer, (exemplo futuro)
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;