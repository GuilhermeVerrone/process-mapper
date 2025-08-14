import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  type Node, 
  type Edge, 
  type NodeChange,
  type EdgeChange,
  type Connection
} from 'reactflow';
import api from '../../api/axios';

// Interfaces
interface Process {
  id: string;
  name: string;
  description?: string | null;
  owner?: string | null;
  parentId?: string | null;
  positionX?: number | null;
  positionY?: number | null;
  color?: string | null;
  systemsAndTools?: string | null; 
  type?: string | null;
}

// Tipos para os payloads das ações
export type CreateProcessPayload = Omit<Process, 'id'> & { areaId: string };
export type UpdateProcessPayload = Partial<Omit<Process, 'areaId' | 'parentId'>> & { id: string };

interface ProcessesState {
  nodes: Node[];
  edges: Edge[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProcessesState = {
  nodes: [],
  edges: [],
  status: 'idle',
  error: null,
};

// Helper para converter um Processo da API em um Nó do React Flow
const processToNode = (process: Process): Node => ({
  id: process.id,
  type: 'custom',
  data: { label: process.name, color: process.color, processData: process },
  position: { x: process.positionX || 0, y: process.positionY || 0 },
});

// THUNKS ASSÍNCRONOS
export const fetchProcessesByArea = createAsyncThunk('processes/fetchByArea', async (areaId: string) => {
  const response = await api.get<Process[]>(`/processes?areaId=${areaId}`);
  return response.data;
});

export const createProcess = createAsyncThunk('processes/create', async (processData: CreateProcessPayload) => {
  const response = await api.post<Process>('/processes', processData);
  return response.data;
});

export const updateProcess = createAsyncThunk('processes/update', async (processData: UpdateProcessPayload) => {
  const { id, ...dataToUpdate } = processData;
  const response = await api.put<Process>(`/processes/${id}`, dataToUpdate);
  return response.data;
});

export const deleteProcess = createAsyncThunk('processes/delete', async (processId: string) => {
  await api.delete(`/processes/${processId}`);
  return processId; // Retorna o ID do processo deletado
});


const processesSlice = createSlice({
  name: 'processes',
  initialState,
  reducers: {
    handleNodesChange: (state, action: PayloadAction<NodeChange[]>) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
    handleEdgesChange: (state, action: PayloadAction<EdgeChange[]>) => {
      state.edges = applyEdgeChanges(action.payload, state.edges);
    },
    handleConnect: (state, action: PayloadAction<Connection>) => {
      state.edges = addEdge(action.payload, state.edges);
    },
    updateNodePosition: (state, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
        const node = state.nodes.find(n => n.id === action.payload.id);
        if (node) {
            node.position = action.payload.position;
        }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProcessesByArea.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProcessesByArea.rejected, (state) => { state.status = 'failed'; })
      .addCase(fetchProcessesByArea.fulfilled, (state, action: PayloadAction<Process[]>) => {
        const processes = action.payload;
        state.nodes = processes.map(processToNode);
        state.edges = processes
          .filter((proc) => proc.parentId)
          .map((proc) => ({ id: `e-${proc.parentId}-${proc.id}`, source: proc.parentId!, target: proc.id }));
        state.status = 'succeeded';
      })
      
      // ✅ CREATE (Correção do Fundo Colorido)
      .addCase(createProcess.fulfilled, (state, action: PayloadAction<Process>) => {
        const newProcess = action.payload;
        // Adiciona o novo nó e a nova aresta instantaneamente
        state.nodes.push(processToNode(newProcess));
        if (newProcess.parentId) {
          state.edges.push({ id: `e-${newProcess.parentId}-${newProcess.id}`, source: newProcess.parentId, target: newProcess.id });
        }
      })
      
      // ✅ UPDATE
      .addCase(updateProcess.fulfilled, (state, action: PayloadAction<Process>) => {
        const updatedProcess = action.payload;
        const nodeIndex = state.nodes.findIndex(n => n.id === updatedProcess.id);
        if (nodeIndex !== -1) {
          // Atualiza o nó existente com os novos dados
          state.nodes[nodeIndex] = processToNode(updatedProcess);
        }
      })
      
      // ✅ DELETE
      .addCase(deleteProcess.fulfilled, (state, action: PayloadAction<string>) => {
        const deletedProcessId = action.payload;
        // Remove o nó e todas as arestas conectadas a ele
        state.nodes = state.nodes.filter(n => n.id !== deletedProcessId);
        state.edges = state.edges.filter(e => e.source !== deletedProcessId && e.target !== deletedProcessId);
      });
  },
});

export const { updateNodePosition, handleNodesChange, handleEdgesChange, handleConnect } = processesSlice.actions;
export default processesSlice.reducer;