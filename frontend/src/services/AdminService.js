import api from './api';
import {verifierReponse} from './verifierReponse';

export const getDashboardStats = async () => {
  return await verifierReponse(() =>  api.get(`/api/admin/statHome`));
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

