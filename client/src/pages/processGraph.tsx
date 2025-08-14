import React, { useState, useCallback, useEffect } from 'react';
// ✅ CORREÇÃO CRÍTICA: O pacote correto é 'react-redux'
import { useSelector, useDispatch } from 'react-redux';
import ReactFlow, {
  Background, Controls, MiniMap,
  type Node, type OnNodesChange, type OnEdgesChange, type Connection, type OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Box, Typography, Container, CircularProgress, Alert, Menu, MenuItem, 
  Modal, TextField, Button, Drawer, IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import { 
  fetchProcessesByArea, createProcess, updateProcess, deleteProcess,
  updateNodePosition, handleNodesChange, handleEdgesChange, handleConnect, type UpdateProcessPayload, type CreateProcessPayload
} from '../features/processes/processesSlice';
import type { AppDispatch, RootState } from '../app/store';
import api from '../api/axios';
import CustomProcessNode from '../components/CustomProcessNode';

const pastelColors = ['#cfe2f3', '#d9ead3', '#fff2cc', '#fce5cd', '#f4cccc', '#d0e0e3'];

// ✅ OTIMIZAÇÃO: Movido para fora do componente para evitar recriações
const nodeTypes = { custom: CustomProcessNode };

// ✅ INTERFACE UNIFICADA: Para os dados do formulário da gaveta
interface ProcessFormData {
  id?: string;
  name: string;
  owner: string;
  description: string;
  systemsAndTools: string;
  color: string;
  parentId?: string | null;
}

const ProcessGraphPage: React.FC<{ areaId: string }> = ({ areaId }) => {
  const dispatch: AppDispatch = useDispatch();
  const { nodes, edges, status, error } = useSelector((state: RootState) => state.processes);
  
  const [menu, setMenu] = useState<{ mouseX: number; mouseY: number; node: Node | null } | null>(null);
  
  // ✅ ESTADO UNIFICADO: Controla a gaveta e os dados do formulário
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProcessFormData>>({});

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

  // ✅ LÓGICA UNIFICADA PARA ABRIR A GAVETA
  const openDrawer = (mode: 'create' | 'edit', initialData: Partial<ProcessFormData> = {}) => {
    setFormData({
      name: '',
      owner: '',
      description: '',
      systemsAndTools: '',
      color: pastelColors[0],
      ...initialData,
    });
    setIsDrawerOpen(true);
  };

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Abre a gaveta em modo de edição ao clicar
    openDrawer('edit', node.data.processData);
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
        handleCloseMenu();
        return;
      }
      if (window.confirm(`Tem certeza que deseja deletar o processo "${menu.node.data.label}"?`)) {
        dispatch(deleteProcess(menu.node.id));
      }
    }
    handleCloseMenu();
  };

  // ✅ LÓGICA UNIFICADA PARA SALVAR (CRIAR OU EDITAR)
  const handleFormSubmit = async () => {
    // ✅ Verificação de nome antes de qualquer outra coisa
    if (!formData.name || formData.name.trim() === '') {
      alert('O nome do processo é obrigatório.');
      return; // Impede o envio do formulário se o nome estiver vazio
    }

    if (formData.id) { // Editando
      await dispatch(updateProcess(formData as UpdateProcessPayload));
    } else { // Criando
      // Agora é seguro, pois já verificamos que 'name' existe.
      // Usamos a asserção 'as' para confirmar o tipo para o TypeScript.
      await dispatch(createProcess(formData as CreateProcessPayload));
    }
    setIsDrawerOpen(false);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            <Button variant="contained" onClick={() => openDrawer('create')}>Adicionar Processo Raiz</Button>
          </Box>
          <Box sx={{ flexGrow: 1, border: '1px solid #ddd' }}>
            <ReactFlow
              nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
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
        <Box sx={{ width: 400, p: 3 }} role="presentation">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">{formData.id ? 'Detalhes do Processo' : 'Novo Processo'}</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <TextField name="name" label="Nome do Processo" value={formData.name || ''} onChange={handleFormChange} fullWidth margin="normal" variant="outlined" />
          <TextField name="owner" label="Responsável" value={formData.owner || ''} onChange={handleFormChange} fullWidth margin="normal" variant="outlined" />
          <TextField name="description" label="Descrição / Detalhes" value={formData.description || ''} onChange={handleFormChange} fullWidth margin="normal" variant="outlined" multiline rows={4} />
          <TextField name="systemsAndTools" label="Sistemas e Ferramentas" value={formData.systemsAndTools || ''} onChange={handleFormChange} fullWidth margin="normal" variant="outlined" multiline rows={2} />
          
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
          <Button onClick={handleFormSubmit} variant="contained" sx={{ mt: 3 }}>Salvar Alterações</Button>
        </Box>
      </Drawer>
      
      <Menu open={menu !== null} onClose={handleCloseMenu} anchorReference="anchorPosition" anchorPosition={menu ? { top: menu.mouseY, left: menu.mouseX } : undefined}>
        <MenuItem disabled>Ações para: {menu?.node?.data.label}</MenuItem>
        <MenuItem onClick={() => {
          openDrawer('create', { parentId: menu?.node?.id });
          handleCloseMenu();
        }}>Adicionar Subprocesso</MenuItem>
        <MenuItem onClick={() => {
          openDrawer('edit', menu?.node?.data.processData);
          handleCloseMenu();
        }}>Editar</MenuItem>
        <MenuItem onClick={handleDeleteNode} sx={{ color: 'error.main' }}>Deletar</MenuItem>
      </Menu>

    </Box>
  );
};

export default ProcessGraphPage;