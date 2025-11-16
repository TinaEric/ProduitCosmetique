import api from './api'; 
import {verifierReponse} from './verifierReponse';


export const CategorieListe = async () => {
      return await verifierReponse(() => api.get('/api/categorie'));
  }

export const NewCategorie = async (newProduit) => {
    return await verifierReponse(() => api.post('/api/categorie/newCategorie', newProduit));
};

export const UpdateCategorie = async (category) => {
  return await verifierReponse(() =>  api.put(`/api/categorie/${category.codeCAT}`, category));
      
};

export const suppCategorie = async (tabCategorie) => {
  return await verifierReponse(() =>  api.post('/api/categorie/deleteAll',{codes : tabCategorie} ));
    
};


