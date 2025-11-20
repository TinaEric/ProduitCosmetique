import api from './api';
import {verifierReponse} from './verifierReponse';


export const commandeService = {
  getAllCommandes: async () => {
     return await verifierReponse(() => api.get('/api/admin/commandes/'));
  },

  getCommande: async (refCommande) => {
    return await verifierReponse(() => api.get(`/api/admin/commandes/${refCommande}`));
  },

  updateStatut: async (refCommande, statut) => {
    return await verifierReponse(() => api.put(`/api/admin/${refCommande}/statut`,{
        statutCommande: statut
      }));
  },

  getCommandesByStatus: async (status) => {
    return await verifierReponse(() => api.get(`/api/admin/commandes/statut/${status}`))
  }
};