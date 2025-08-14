import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'; // 1. Adicionado 'createAsyncThunk'
import api from '../../api/axios';
import type { RootState } from '../../app/store'; // 2. Adicionado 'type' na importação


interface Area {
  id: string;
  name: string;
  owner: string;
}

interface NewAreaData {
  name: string;
  owner?: string;
}

interface AreasState {
  items: Area[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface UpdateAreaData {
  id: string;
  name: string;
  owner?: string;
}

const initialState: AreasState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchAreas = createAsyncThunk('areas/fetchAreas', async () => {
  const response = await api.get('/areas');
  return response.data;
});
//
export const createArea = createAsyncThunk(
  'areas/createArea',
  async (newArea: NewAreaData, { rejectWithValue }) => {
    try {
      const response = await api.post('/areas', newArea);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Rejeita a promise com a mensagem de erro da API, se disponível
      return rejectWithValue(err.response?.data || 'Could not create area');
    }
  }
);

export const updateArea = createAsyncThunk(
  'areas/updateArea',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (updatedArea: UpdateAreaData, { rejectWithValue }) => {
    try {
      const { id, name, owner } = updatedArea;
      const response = await api.put<Area>(`/areas/${id}`, { name, owner });
      return response.data;
    
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Could not create area');
    }
  }
);

export const deleteArea = createAsyncThunk(
  'areas/deleteArea',
  async (areaId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/areas/${areaId}`);
      // Retornamos o ID para que o reducer saiba qual área remover do estado
      return areaId; 
           
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Could not create area');
    }
  }
);


const areasSlice = createSlice({
  name: 'areas',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Casos para fetchAreas (buscar áreas)
      .addCase(fetchAreas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAreas.fulfilled, (state, action: PayloadAction<Area[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Could not fetch areas';
      })
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .addCase(createArea.pending, (state) => {
        // Você pode ter um estado de loading específico para criação
        // state.createStatus = 'loading'; 
      })
      .addCase(createArea.fulfilled, (state, action: PayloadAction<Area>) => {
        // Adiciona a nova área à lista existente sem precisar buscar tudo de novo
        state.items.push(action.payload);
        // state.createStatus = 'succeeded';
      })
      .addCase(createArea.rejected, (state, action) => {
        // Salva a mensagem de erro para mostrar na UI
        state.error = action.payload as string;
        // state.createStatus = 'failed';
      })
      .addCase(updateArea.fulfilled, (state, action: PayloadAction<Area>) => {
        const updatedArea = action.payload;
        // Encontra o índice da área que foi atualizada
        const existingAreaIndex = state.items.findIndex((area) => area.id === updatedArea.id);
        if (existingAreaIndex !== -1) {
          // Substitui a área antiga pela nova no array
          state.items[existingAreaIndex] = updatedArea;
        }
      })
      .addCase(deleteArea.fulfilled, (state, action: PayloadAction<string>) => {
        const deletedAreaId = action.payload;
        // Filtra a lista, mantendo apenas as áreas cujo ID é diferente do deletado
        state.items = state.items.filter((area) => area.id !== deletedAreaId);
      });
  },
});

export const selectAllAreas = (state: RootState) => state.areas.items;
export const getAreasStatus = (state: RootState) => state.areas.status;

export default areasSlice.reducer;