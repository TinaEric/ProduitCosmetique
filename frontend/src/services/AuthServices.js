import api from './api';
import { useUsers } from "@/Client/context/UserContext";

 

class AuthService {
  
  // Login
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password: password
      });
      // const {setClient} = useUsers(); 
      console.log( 'Réponse login:', response.data);
      if (response.data.token) {
        
        if (response.data.token && response.data.token !== 'undefined') {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.user && response.data.user !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
        } else {
          console.warn(' User non défini dans la réponse');
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur login:', error);
      let erreurMessage = "Erreur de connexion.";
      const status =  error.response.status
      const data = error.response.data
      if (status === 401) {
        erreurMessage = "Identifiants invalides.";
      } else if (status === 403) {
        erreurMessage = "Accès refusé.";
      } else if (status === 404) {
        erreurMessage = "Utilisateur non trouvé.";
      } else if (status === 500) {
        erreurMessage = "Erreur serveur.Veuillez réessayer plus tard.";
      }
      this.logout();
      throw error;
    }
  }

  // Register client
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      // const {setClient} = useUsers(); 
      console.log( 'Réponse Register:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Dans AuthService.js

getStoredUser() {
  try {
      const user = localStorage.getItem('user');
      
      if (!user || user === 'undefined' || user === 'null') {
          return null;
      }
      
      return JSON.parse(user); 
  } catch (error) {
      console.error('Erreur lors du parsing du user depuis localStorage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('panier');
      localStorage.removeItem('RefCommande');
      localStorage.removeItem('DataAdresse');
      localStorage.removeItem('methodeLivraison');
      localStorage.removeItem('methodePaiement');
      return null;
  }
}
  // Récupérer les infos de l'utilisateur connecté
  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération user:', error);
      throw error;
    }
  }

  async getAdresseClient() {
    try {
      const response = await api.get(`/api/client/adresse`);
      if(response.data){

        return response.data;
      }
        return response.error
    } catch (error) {
      console.error('Erreur récupération ADRESSE:', error);
      throw error;
    }
  }
  // Logout
  logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('panier');
      localStorage.removeItem('RefCommande');
      localStorage.removeItem('DataAdresse');
      localStorage.removeItem('methodeLivraison');
      localStorage.removeItem('methodePaiement');
  }

  // Get token
  getToken() {
    const token = localStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  }

  // Get user from localStorage
// getStoredUser() {
//   try {
//     const user = localStorage.getItem('user');
    
//     if (!user || user === 'undefined' || user === 'null') {
//       console.log('Aucun utilisateur trouvé dans le localStorage');
//       return null;
//     }
    
//     return JSON.parse(user);
//   } catch (error) {
//     console.error('Erreur lors du parsing du user depuis localStorage:', error);
    
//     // En cas d'erreur, nettoyez la valeur corrompue
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     localStorage.removeItem('panier');
//     return null;
//   }
// }

  // Vérifier si authentifié
  isAuthenticated() {
    return !!this.getToken();
  }

  // Vérifier si admin
  isAdmin() {
    const user = this.getStoredUser();
    return user && user.roleUsers === 'ROLE_ADMIN';
  }

  // Vérifier si client
  isClient() {
    const user = this.getStoredUser();
    return user && user.roleUsers === 'ROLE_USER';
  }

  // Méthode pour les requêtes authentifiées (alternative à l'intercepteur)
  authApi() {
    return api;
  }
}

export default new AuthService();