import axios from 'axios';

const API_URL = 'http://localhost:8000/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//  Ajoute du token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//  Gestion de l'expiration du token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Token expiré. Déconnexion.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('panier');
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;