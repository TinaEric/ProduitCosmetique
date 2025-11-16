import api from './api'; 
import {verifierReponse} from './verifierReponse';


export const ListeCLient = async () => {
      return await verifierReponse((eric
        
      ) => api.get('/api/client'));
  }

export const NewClient = async (client) => {
  try {
      const response = await  api.post('/api/auth/register', client);
      if(response.data){
        return response.data;
      }
        console.log("Registre" , response?.error?.message)
        return response.error
    } catch (error) {
      console.error('Erreur REGISTRE CLIENT:', error);
      throw error;
    }
};

export const getClientAddresses = async (clientId) => {
  try {
      const response = await api.get(`/api/client/adresse/`);
      return response.data;
  } catch (error) {
      console.error("Erreur lors de la récupération des adresses:", error);
      return [];
  }
};

export const LoginVerifier = async (client) => {
  return await verifierReponse(() => api.post('/api/client/loginVerifier', client));
 
};

export const UpdateClient = async (client) => {
  return await verifierReponse(() =>  api.put(`/api/categorie/${client.id}`, client));
      
};

export const DeleteClient = async (refClient) => {
  return await verifierReponse(() =>  api.post('/api/categorie/deleteAll',{codes : refClient} ));
    
};


export const createCommandePanier = async (dataCommande) => {
  return await verifierReponse(() =>  api.post('/api/client/initialeCommande', dataCommande));
    
};

export const updateCommandePanier = async (dataCommande) => {
  return await verifierReponse(() =>  api.put('/api/client/updateCommande', dataCommande));
    
};