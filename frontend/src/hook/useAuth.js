import { useState, useEffect,useCallback } from 'react';
import AuthService from '../services/AuthServices';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializeAuth = useCallback( async () => {
    try {
      const token = AuthService.getToken();
      const storedUser = AuthService.getStoredUser(); 
      
      // console.log('Initialisation auth - Token:', !!token, 'User:', !!storedUser);
      
      if (token && storedUser) {
        setUser(storedUser);
        
      }
    } catch (error) {
      console.error(' Erreur lors de l\'initialisation auth:', error);
      AuthService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    initializeAuth();
    const handleStorageChange = (e) => {
        if (e.key === 'token' || e.key === 'user') {
            console.log('Changement de stockage détecté, réinitialisation de l\'auth.');
            initializeAuth();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, [initializeAuth]); 

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, user: null, error: error.message || 'Erreur de connexion' };
    }
  };

  const register = async (userData) => {
    try {
      const data = await AuthService.register(userData);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message || "Erreur d'inscription" };
    }
  };

  const gatAdresseClient = async () => {
    try {
      const data = await AuthService.getAdresseClient();
      setUser(data.adresse);
      return { success: true, user: data.adresse };
    } catch (error) {
      return { success: false, error: error.message || "Erreur de récupération d'adresse" };
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  // Méthodes de vérification des rôles basées sur le state local
  const isAdmin = () => {
    return user && user.roleUsers === 'ROLE_ADMIN';
  };

  const isClient = () => {
    return user && user.roleUsers === 'ROLE_USER';
  };

  const isAuthenticated = () => {
    return !!user;
    // return !!user && !!AuthService.getToken();
  };

  const value = {
    user,
    loading,
    gatAdresseClient,
    login,
    register,
    logout,
    refreshUser: initializeAuth,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isClient: isClient(),
  };

  return value;
};
