import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactFlow, {
  Background, Controls, MiniMap,
  type Node, type OnNodesChange, type OnEdgesChange, type Connection, type OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Box, Typography, Container, CircularProgress, Alert, Menu, MenuItem, 
  TextField, Button, Drawer, IconButton, FormControl, InputLabel, Select, type SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { 
  fetchProcessesByArea, createProcess, updateProcess, deleteProcess,
  updateNodePosition, handleNodesChange, handleEdgesChange, handleConnect, 
  type UpdateProcessPayload, type CreateProcessPayload
} from '../features/processes/processesSlice';
import type { AppDispatch, RootState } from '../app/store';
import api from '../api/axios';
import CustomProcessNode from '../components/CustomProcessNode';

const pastelColors = ['#cfe2f3', '#d9ead3', '#fff2cc', '#fce5cd', '#f4cccc', '#d0e0e3'];

// Otimização: Movido para fora para evitar recriações a cada renderização
const nodeTypes = { custom: CustomProcessNode };

// Interface para os dados do nosso formulário unificado
interface ProcessFormData {
  id?: string;
  name: string;
  owner: string;
  description: string;
  systemsAndTools: string;
  color: string;
  parentId?: string | null;
  type: string;
}

const modalStyle = { /* Estilo do Drawer/Modal, pode ser usado no Drawer */
  width: 400, p: 3
};

const ProcessGraphPage: React.FC<{ areaId: string }> = ({ areaId }) => {
  const dispatch: AppDispatch = useDispatch();
  const { nodes, edges, status, error } = useSelector((state: RootState) => state.processes);
  
  const [menu, setMenu] = useState<{ mouseX: number; mouseY: number; node: Node | null } | null>(null);
  
  // Estado Unificado: Controla a gaveta e os dados do formulário
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProcessFormData>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de filtro com useMemo para performance
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) {
      return nodes.map(node => ({ ...node, style: { opacity: 1 } }));
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return nodes.map(node => {
      const isMatch = node.data.label.toLowerCase().includes(lowerCaseSearch);
      return { ...node, style: { opacity: isMatch ? 1 : 0.3, transition: 'opacity 0.2s' } };
    });
  }, [nodes, searchTerm]);

  useEffect(() => {
    if (areaId && status === 'idle') {
      dispatch(fetchProcessesByArea(areaId)); 
    }
  }, [areaId, status, dispatch]);

  const onNodesChange: OnNodesChange = useCallback((changes) => dispatch(handleNodesChange(changes)), [dispatch]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => dispatch(handleEdgesChange(changes)), [dispatch]);
  const onConnect: OnConnect = useCallback((connection: Connection) => dispatch(handleConnect(connection)), [dispatch]);
  
  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    dispatch(updateNodePosition({ id: node.id, position: node.position }));
    api.patch(`/processes/${node.id}/position`, { positionX: node.position.x, positionY: node.position.y });
  }, [dispatch]);

  // Função unificada para abrir a gaveta
  const openDrawer = (initialData: Partial<ProcessFormData> = {}) => {
    setFormData({
      name: '', owner: '', description: '', systemsAndTools: '', type: 'manual', color: pastelColors[0],
      ...initialData,
    });
    setIsDrawerOpen(true);
  };

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    openDrawer(node.data.processData);
  }, []);

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4, node });
  }, []);

  const handleCloseMenu = () => setMenu(null);
  
  const handleDeleteNode = () => {
    if (menu?.node) {
      const hasChildren = edges.some(edge => edge.source === menu.node!.id);
      if (hasChildren) {
        alert('Não é possível deletar um processo que possui subprocessos.');
      } else if (window.confirm(`Tem certeza que deseja deletar o processo "${menu.node.data.label}"?`)) {
        dispatch(deleteProcess(menu.node.id));
      }
    }
    handleCloseMenu();
  };

  const handleFormSubmit = async () => {
  if (!formData.name || formData.name.trim() === '') {
    alert('O nome do processo é obrigatório.');
    return;
  }

  if (formData.id) { 
    await dispatch(updateProcess(formData as UpdateProcessPayload));
  } else { 
    // Prepara o payload para o console.log
    const payloadParaCriar = { ...formData, areaId }; // Removido parentId para simplificar o log
    
    // ✅ LOG DE DEPURAÇÃO
    console.log("DADOS ENVIADOS PARA A API:", payloadParaCriar);

    await dispatch(createProcess(payloadParaCriar as CreateProcessPayload));
  }
  setIsDrawerOpen(false);
};

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  if (status === 'loading') return <CircularProgress />;
  if (status === 'failed') return <Alert severity="error">{error}</Alert>;
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Container sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" gutterBottom>Gestão de Processos</Typography>
            <Button variant="contained" onClick={() => openDrawer()}>Adicionar Processo Raiz</Button>
          </Box>
          <TextField
            label="Buscar Processo" variant="outlined" fullWidth margin="normal"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Box sx={{ flexGrow: 1, border: '1px solid #ddd', position: 'relative' }}>
            <ReactFlow
              nodes={filteredNodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={onConnect} onNodeDragStop={onNodeDragStop} onNodeContextMenu={handleNodeContextMenu}
              nodeTypes={nodeTypes} fitView onNodeClick={handleNodeClick}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </Box>
        </Container>
      </Box>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box sx={modalStyle} role="presentation">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">{formData.id ? 'Detalhes do Processo' : 'Novo Processo'}</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <TextField name="name" label="Nome do Processo" value={formData.name || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField name="owner" label="Responsável" value={formData.owner || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField name="description" label="Descrição" value={formData.description || ''} onChange={handleFormChange} fullWidth margin="normal" multiline rows={4} />
          <TextField name="systemsAndTools" label="Sistemas e Ferramentas" value={formData.systemsAndTools || ''} onChange={handleFormChange} fullWidth margin="normal" multiline rows={2} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="process-type-label">Tipo de Processo</InputLabel>
            <Select
              labelId="process-type-label" name="type" value={formData.type || 'manual'}
              label="Tipo de Processo" onChange={handleSelectChange}
            >
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="system">Sistêmico</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Cor do Processo</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {pastelColors.map(color => (
              <Box key={color} onClick={() => setFormData(prev => ({ ...prev, color }))}
                sx={{
                  width: 24, height: 24, backgroundColor: color, borderRadius: '50%', cursor: 'pointer',
                  border: formData.color === color ? '2px solid #1976d2' : '1px solid #ccc',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              />
            ))}
          </Box>
          <Button onClick={handleFormSubmit} variant="contained" sx={{ mt: 3 }}>Salvar</Button>
        </Box>
      </Drawer>
      
      <Menu open={menu !== null} onClose={handleCloseMenu} anchorReference="anchorPosition" anchorPosition={menu ? { top: menu.mouseY, left: menu.mouseX } : undefined}>
        <MenuItem disabled>Ações para: {menu?.node?.data.label}</MenuItem>
        <MenuItem onClick={() => { openDrawer({ parentId: menu?.node?.id }); handleCloseMenu(); }}>Adicionar Subprocesso</MenuItem>
        <MenuItem onClick={() => { openDrawer(menu?.node?.data.processData); handleCloseMenu(); }}>Editar</MenuItem>
        <MenuItem onClick={handleDeleteNode} sx={{ color: 'error.main' }}>Deletar</MenuItem>
      </Menu>
    </Box>
  );
};

export default ProcessGraphPage;