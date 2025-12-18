import { useTheme } from "../hooks/use-theme";
import {CircleUser,  ChevronsLeft, Moon, Search,Calendar, Sun } from "lucide-react";
import profileImg from "../assets/profile-image.jpg";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { useLocation } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { MdAdminPanelSettings, MdOutlineAdminPanelSettings } from "react-icons/md";

const Filtres = {
    TOUS: "Tous",
    DERNIER_A_JOUR: "Dernier à Jour",
    ALPHABETIQUE: "Alphabetique",
    CATEGORIE: "Categorie",
};

export function GetTitre ({path}) {
    switch(path){
        case "/admin": 
            return(
                <div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Tableau de Bord
                    </h1>

                </div>
            )
        case "/admin/commande":
            return(
                <div className="">
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Gestion des Commandes
                </h1>
            </div>
            )
        case "/admin/Notification":
            return(
                <div className="">
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Notification
                </h1>
            </div>
            )
        case "/admin/products":
            return(
                <div className="">
                <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                Gestion des produits
            </h1>
        </div>
            )
        case "/admin/categorie":
            return(
                <div className="">
                <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                Gestion des catégories
            </h1>
        </div>
            )
        case "/admin/Users":
            return(
                <div className="">
                <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                Gestion des clients
            </h1>
        </div>
            )
        case "/admin/paiement":
            return(
                <div className="">
                <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                Gestion des paiements
            </h1>
        </div>
            )
        case "/admin/NewProduit":
                return(
                    <div className="">
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Nouveau Produit
                </h1>
            </div>
                )
        case "/admin/ficheCommande" :
            return (
                <div className="">
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Fiche Commande
                </h1>
            </div>
            )
        case "/admin/ficheClient" :
            return (
                <div className="">
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Fiche Client
                </h1>
            </div>
            )
        default : 
            return(
                <div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                    Tableau de Bord
                    </h1>

                </div>
            )
    }
   }
// Définition des valeurs pour le filtre de stock
const FiltreStockValues = {
    TOUS: "Tous",
    EN_STOCK: "enStock", 
    RUPTURE: "rupture",
    ALERTE: "alerte"
};

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const [User, setUser] = useState(null);
    const { searchTerm, setSearchTerm, filterValue, filtreStock, setFiltreStock, setFilterValue } = useSearch();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

   useEffect(() => {
       const storedUser = localStorage.getItem("user");
       if (storedUser) {
           setUser(JSON.parse(storedUser));
       }
   }, []);

   
   const location = useLocation();
   const currentPath = location.pathname;
   const [path,setPath] = useState("/admin/olo")
   
    return (
        <header className="relative z-10 flex pr-6 items-center flex-col p-4 bg-white px-4 shadow-md transition-colors dark:bg-slate-900 h-[70px]">
            <div className=" w-full justify-between flex">
                <div className="flex  items-center gap-x-3">
                    <button
                        className="btn-ghost size-10"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronsLeft className={collapsed && "rotate-180"} />
                    </button>
                    <GetTitre path={currentPath} />
                
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date().toLocaleDateString('fr-FR', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden text-accent"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block text-accent"
                    />
                </button>
                
                    {User ? (
                    <div className="flex items-center gap-x-4">
                        <span className="text-[#b9bbc5] font-bold">{User.emailUsers}</span>
                        <button className=" size-10overflow-hidden rounded-full">
                        <MdOutlineAdminPanelSettings  className="size-10 text-accent"/>
                        </button>
                    </div>
                    ):(
                    <div className="flex items-center gap-x-2">
                        <span className="text-[#6D6F79] font-bold">Admin Compte</span>
                        <button className="size-10 overflow-hidden rounded-full">
                        <CircleUser />
                        </button>
                    </div>
                    )}
                    
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
