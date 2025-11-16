import React, { createContext, useContext } from 'react';
import { useAuth } from '../hook/useAuth'; // Assurez-vous que le chemin vers votre hook useAuth est correct

// 1. Création du Context
// Initialiser avec null ou la structure d'objet par défaut si vous le souhaitez.
const AuthContext = createContext(null);

// 2. Hook personnalisé pour faciliter l'utilisation (c'est ce que votre Navbar appelle)
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    
    // Vérification de sécurité: assure que le hook est appelé à l'intérieur du Provider
    if (!context) {
        throw new Error('useAuthContext doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};


// 3. Le composant Provider lui-même
export const AuthProvider = ({ children }) => {
    
    // Utilise votre hook de logique pour obtenir toutes les données et fonctions
    const auth = useAuth(); 

    // Fournit l'objet 'auth' (contenant user, isAuthenticated, login, logout, etc.)
    // à tous les composants enfants.
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};