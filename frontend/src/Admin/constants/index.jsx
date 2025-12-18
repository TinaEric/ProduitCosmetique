import { Command, ShieldUser,Bell,LogOut,ChartColumn, Home, NotepadText, Package, PackagePlus, Settings, ShoppingBag, UserCheck, UserPlus, Users } from "lucide-react";
import ProfileImage from "../assets/profile-image.jpg";
import ProductImage from "../assets/product-image.jpg";
import { FaCartShopping } from "react-icons/fa6";
import {GrMoney} from 'react-icons/gr';

export const navbarLinks = [
    {
        title: "Accueil",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/admin",
            },
            // {
            //     label: "Analytique",
            //     icon: ChartColumn,
            //     path: "/admin/analytique",
            // },
            {
                label: "Notifications",
                icon: Bell,
                path: "/admin/Notification",
            },
        ],
    },
    {
        title: "Transaction",
        links: [
            {
                label: "Client",
                icon: Users,
                path: "/admin/Users",
            },
            {
                label: "Commande",
                icon: FaCartShopping,
                path: "/admin/commande",
            },
            // {
            //     label: "Service Paiement",
            //     icon: GrMoney,
            //     path: "/admin/paiement",
            // },
        ],
    },
    {
        title: "Produits",
        links: [
            {
                label: "Catégories",
                icon: NotepadText,
                path: "/admin/categorie",
            },
            {
                label: "Produits",
                icon: Package,
                path: "/admin/products",
            },
            {
                label: "Nouveau Produit",
                icon: PackagePlus,
                path: "/admin/NewProduit",
            },
            
        ],
    },
    {
        title: "Déconnexion",
        links: [
            // {
            //     label: "Paramètre",
            //     icon: Settings,
            //     path: "/admin/settings",
            // },
            // {
            //     label: "Mon Profil",
            //     icon: ShieldUser ,
            //     path: "/admin/Profil",
            // },
            {
                label: "Déconnecter",
                icon: LogOut,
                path: "/admin/login",
            },
        ],
    },
];