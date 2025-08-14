import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import areasReducer from '../features/areas/areasSlice';
import processesReducer from '../features/processes/processesSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,
    areas: areasReducer,
    processes: processesReducer, // ✅ ADICIONE
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;