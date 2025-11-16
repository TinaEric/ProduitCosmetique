import Layout from "./layout";
import DashboardPage from "../Pages/dashboard/page";
import { Routes, Route } from "react-router-dom";
import NotFound from "../../layouts/NotFound";
import ListUsers from "../Pages/User/ListUsers";
import CategoriePage from "../Pages/Produit/CategoriePage";
import NewProduit from "../Pages/Produit/NewProduit";
import ProduitPage from "../Pages/Produit/ProduitPage";
import Commande from "../Pages/Commande/Commande";
import Paiement from "../Pages/Commande/Paiement";
import { Command } from "lucide-react";

const RouteBack = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="" element={<DashboardPage />}
                />
                <Route path="analytique"  element={<h1 className="title">Analytics</h1>}
                />
                <Route  path="settings"  element={<h1 className="title">settings</h1>}
                />
                <Route  path="Notification"  element={<h1 className="title">Notification</h1>}
                />
                <Route  path="Users"  element={<ListUsers />}
                />
                <Route  path="commande"  element={<Commande/>}
                />
                <Route  path="paiement"  element={<Paiement/>}
                />
                <Route  path="products"  element={<ProduitPage />}
                />
                <Route path="NewProduit"  element={<NewProduit/>}
                />
                <Route path="categorie"  element={<CategoriePage />}
                />
                <Route  path="Profil" element={<h1 className="title">verified-customers</h1>}
                />
            </Route>
            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    );
};

export default RouteBack;
