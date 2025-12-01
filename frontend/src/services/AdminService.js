import api from './api';
import {verifierReponse} from './verifierReponse';

export const getDashboardStats = async () => {
  return await verifierReponse(() =>  api.get(`/api/admin/statHome`));
};

export const getSalesData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { mois: 'Jan', ventes: 4500000, commandes: 45 },
                { mois: 'Fév', ventes: 5200000, commandes: 52 },
                { mois: 'Mar', ventes: 4800000, commandes: 48 },
                { mois: 'Avr', ventes: 6100000, commandes: 61 },
                { mois: 'Mai', ventes: 5800000, commandes: 58 },
                { mois: 'Jun', ventes: 7300000, commandes: 73 },
                { mois: 'Jul', ventes: 6900000, commandes: 69 },
                { mois: 'Aoû', ventes: 7800000, commandes: 78 },
                { mois: 'Sep', ventes: 8200000, commandes: 82 },
                { mois: 'Oct', ventes: 9100000, commandes: 91 },
                { mois: 'Nov', ventes: 9500000, commandes: 95 },
                { mois: 'Déc', ventes: 12540000, commandes: 125 }
            ]);
        }, 500);
    });
};

export const getRecentCommande = async () => {
    return await verifierReponse(() =>  api.get(`/api/admin/recentCommande`));
};

export const getTopProducts = async () => {
    return await verifierReponse(() =>  api.get(`/api/admin/topProduit`));
};