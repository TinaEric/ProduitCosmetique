import api from './api'; 
import {verifierReponse} from './verifierReponse';


export const ListeCLient = async () => {
      return await verifierReponse((eric
        
      ) => api.get('/api/client'));
  }

  export const UserListe = async () => {
    return await verifierReponse(() => api.get('/api/user/userAdmin'));
  }

  export const ClientListe = async () => {
    return await verifierReponse(() => api.get('/api/client'));
  }
  
  export const suppClient = async (tabClient) => {
    return await verifierReponse(() => api.post('/api/client/supprimer',{codes : tabClient}));
  }

  export const creerClient = async (NewClient) => {
    return await verifierReponse(() => api.post('/api/client/creerClient',NewClient));
  }

  
  
  
export const registerUser = async (userData) => {
  try {
    console.log(userData)
    const response = await api.post('/api/auth/admin/register', userData); 
    if (response.data){
      return response.data;
    }
    return response.error;

  } catch (error) {
    console.log(" Loza : " + error.message)
    console.log("Trop be :  " + response.data)
    throw error; 
  }
};

