import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from './ClientLayout';
import Home from '../Pages/Accueil/Home';
import ProfilPage from '../Pages/Profil/ProfilPage';
import Produit from '../Pages/Produit/Produit';
import MesCommande from '../Pages/Commande/MesCommande';
import NotFound from '../../layouts/NotFound';
import Inscription from '../Pages/Profil/Inscription';
import ProduitClient from '../Pages/Produit/ProduitClient';
import CommandeEtape from '../Pages/Commande/CommandeEtape';

const AdminRoute = () => {
    return (
        <Routes>
            <Route element={<ClientLayout />}>
                <Route path='' element={<Home />}/>
                <Route path='profile' element={<ProfilPage />}/>
                <Route path='produit' element={<ProduitClient />}/>
                <Route path='inscription' element={<Inscription />}/>
                <Route path='mesCommande' element={<MesCommande />}/>
                <Route path='passerCommande' element={<CommandeEtape />}/>
            </Route>
            <Route path='*' element={<NotFound />}/>
        </Routes>
    );
};

export default AdminRoute;