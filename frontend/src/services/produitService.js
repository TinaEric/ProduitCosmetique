import api from './api'; 

export const ProduitListe = async () => {
    try {
      const response = await api.get('/api/produit');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement de la liste des produits :", error); 
      throw error; 
    }
}


export const ProduitGroupe = async () => {
    try {
      const response = await api.get('/api/produit/ProduitGroupe');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des produits groupés :", error);
      throw error;
    }
}


export const suppProduit = async (id, nom) => {
    try {
      const response = await api.delete(`/api/produit/${id}`); 
      if (response.data) {
        return response.data;
      }
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        throw error; 
    }
};


export const UpdateProduit = async (produit) => {
    try {
      console.log("Données du produit à mettre à jour :", produit);
      const response = await api.put(`/api/produit/${produit.id}`, produit);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        throw error; 
    }
};


export const NewProduitDB = async (data) => {
    try {
      console.log("Données envoyées pour la création :", data);
      const response = await api.post('/api/produit/create', data, {
        headers:{
          'Content-Type' : 'application/json'
        }
      })
        .catch(error => {
            console.error("Backend: ",error.response?.data)
      }); 
      
      console.log("Réponse de création :", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Erreur de création de produit (Network ou 4xx/5xx) :", error);
      if (error.response && error.response.data) {
          return error.response.data; 
      }
      return {
        message: `Une erreur réseau inattendue s'est produite.`,
        statut: 'error'
      };
    }
};