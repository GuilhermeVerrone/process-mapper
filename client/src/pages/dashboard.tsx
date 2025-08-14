import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
// ✅ Importa as ações de update e delete
import { 
  fetchAreas, 
  createArea, 
  updateArea, 
  deleteArea, 
  selectAllAreas, 
  
  getAreasStatus 
} from '../features/areas/areasSlice';
import { logout } from '../features/auth/authSlice';
import { 
  Container, Typography, Box, List, ListItem, ListItemText, CircularProgress, 
  Button, AppBar, Toolbar, TextField, Collapse, Alert, ListItemButton, IconButton 
} from '@mui/material';
// ✅ Importa os ícones de Editar e Deletar
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// ✅ Interface para tipar o objeto 'area'
interface Area {
  id: string;
  name: string;
  owner?: string | null;
}

const DashboardPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const areas = useSelector(selectAllAreas);
  const status = useSelector(getAreasStatus);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaOwner, setAreaOwner] = useState('');
  const [formError, setFormError] = useState('');

  // ✅ Estado para controlar qual área está em modo de edição
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAreas());
    }
  }, [status, dispatch]);
  
  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  }

  // ✅ Função para abrir o formulário em modo de EDIÇÃO
  const handleEditClick = (area: Area) => {
    setEditingArea(area);
    setAreaName(area.name);
    setAreaOwner(area.owner || '');
    setFormError('');
    setShowForm(true);
  };

  // ✅ Função para abrir o formulário em modo de CRIAÇÃO
  const handleAddNewClick = () => {
    setEditingArea(null);
    setAreaName('');
    setAreaOwner('');
    setFormError('');
    setShowForm(true);
  }

  // ✅ Função para DELETAR uma área (com confirmação)
  const handleDelete = (areaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta área? Todos os processos dentro dela também serão removidos.')) {
      dispatch(deleteArea(areaId));
    }
  };
  
  // ✅ Função para CANCELAR a edição/criação
  const handleCancel = () => {
    setShowForm(false);
    setEditingArea(null);
    setAreaName('');
    setAreaOwner('');
    setFormError('');
  };

  // ✅ Função de SUBMIT que agora lida com CRIAR e EDITAR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) {
      setFormError('O nome da área não pode estar em branco.');
      return;
    }
    
    setFormError('');

    if (editingArea) {
      // Se estiver editando, despacha a ação de UPDATE
      await dispatch(updateArea({ id: editingArea.id, name: areaName, owner: areaOwner }));
    } else {
      // Se não, despacha a ação de CREATE
      await dispatch(createArea({ name: areaName, owner: areaOwner }));
    }
    
    handleCancel(); // Limpa e fecha o formulário
  };

  let content;
  if (status === 'loading') {
    content = <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  } else if (status === 'succeeded') {
    content = (
      <List>
      {areas.map((area) => (
        <ListItem
          key={area.id}
          divider
          // Os botões de ação continuam aqui
          secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={(e) => { e.stopPropagation(); handleEditClick(area); }} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDelete(area.id); }}>
                <DeleteIcon />
              </IconButton>
            </>
          }
          // Removemos o padding para o ListItemButton ocupar todo o espaço
          disablePadding 
        >
          {/* ✅ O ListItemButton agora é o elemento clicável e o link */}
          <ListItemButton component="a" href={`/graph/${area.id}`}>
            {/* O texto fica dentro do botão */}
            <ListItemText primary={area.name} secondary={`Responsável: ${area.owner || 'Não definido'}`} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    );
  } else if (status === 'failed') {
    content = <Typography color="error">Erro ao carregar áreas.</Typography>;
  }

  return (
    <Box sx={{ width: '100%'}}>
      <AppBar position="static">
        <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Dashboard de Processos
            </Typography>
            <Typography sx={{ mr: 2 }}>Olá, {user?.name}</Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Áreas da Empresa
            </Typography>
            {/* ✅ Botão de "Nova Área" agora usa sua própria função */}
            <Button variant="contained" onClick={handleAddNewClick}>
              Nova Área
            </Button>
        </Box>

        {/* Formulário que aparece e desaparece */}
        <Collapse in={showForm}>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: 'background.paper' }}
          >
            {/* ✅ Título do formulário muda dependendo da ação */}
            <Typography variant="h6">{editingArea ? 'Editar Área' : 'Criar Nova Área'}</Typography>
            <TextField
              label="Nome da Área"
              variant="outlined"
              fullWidth
              margin="normal"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              required
            />
            <TextField
              label="Responsável (Opcional)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={areaOwner}
              onChange={(e) => setAreaOwner(e.target.value)}
            />
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {editingArea ? 'Salvar Alterações' : 'Criar Área'}
              </Button>
              <Button onClick={handleCancel} sx={{ ml: 1 }}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Collapse>

        <Box sx={{ mt: 2 }}>{content}</Box>
      </Container>
    </Box>
  );
};

export default DashboardPage;