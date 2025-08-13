import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
}

// Tenta carregar o estado inicial do localStorage
const loadAuthFromStorage = (): AuthState => {
  try {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error("Could not load auth from local storage", error);
  }
  return { user: null, token: null };
};


const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: any; token: string }>) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      // Salva no localStorage para persistir o login
      localStorage.setItem('auth', JSON.stringify({ user, token }));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;