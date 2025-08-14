import React from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from './app/store';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import ProcessGraphPage from './pages/processGraph';

function App() {
  const { token } = useSelector((state: RootState) => state.auth);

  if (!token) {
    return <LoginPage />;
  }
  
  const path = window.location.pathname;

  // Rota para o gráfico: /graph/algum-id-de-area
  if (path.startsWith('/graph/')) {
    // Pega o ID da URL, removendo o '/graph/'
    const areaId = path.substring('/graph/'.length);
    if (areaId) {
      // Passa o areaId como uma prop para o componente
      return <ProcessGraphPage areaId={areaId} />;
    }
  }

  // Se a rota não for do gráfico, mostra o dashboard
  // (Isso também cobre a rota "/dashboard" e a rota raiz "/")
  return <DashboardPage />;
}

export default App;