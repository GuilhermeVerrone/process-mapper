import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333', // A URL do nosso back-end
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const store = localStorage.getItem('auth'); // Supondo que você guardará o auth no localStorage
    if (store) {
      const { token } = JSON.parse(store);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;