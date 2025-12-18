import api from './api';
import {verifierReponse} from './verifierReponse';

export const getDashboardStats = async () => {
  return await verifierReponse(() =>  api.get(`/api/admin/statHome`));
};

export const getSalesData = async () => {
    return await verifierReponse(() =>  api.get(`/api/admin/dashboard/chartData`));
};

export const getRecentCommande = async () => {
    return await verifierReponse(() =>  api.get(`/api/admin/recentCommande`));
};

export const getTopProducts = async () => {
    return await verifierReponse(() =>  api.get(`/api/admin/topProduit`));
};

export const getNotification = async ()  => {
    return await verifierReponse(() =>  api.get(`/api/admin/notifications`));
};

export const testeCommande = async ()  => {
      try {
          const response = await api.get(`/api/admin/commandes/test`);
          return response.data;
      } catch (error) {
          console.error("Erreur lors de la récupération des adresses:", error);
          return [];
      }
};

export const UpdateClient = async (client) => {
  return await verifierReponse(() =>  api.post('/api/admin/updateClient', client));
      
};
