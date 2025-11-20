import React, { useEffect, useState, useCallback } from "react";
import { ChevronsLeft } from "lucide-react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { CategorieListe } from "../../services/CategorieService";
import ListeSimple from "@/components/ListeSimple";
import { useNavbar } from "../context/NavbarContext";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";

const SideBar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [catTab, setCatTab] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { searchTerm, setSearchTerm, filterValue, setFilterValue, openPanier, setOpenPanier, setNouveauteBtn } = useNavbar();

    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await CategorieListe();
            if (donnes.data) {
                setCatTab(donnes.data);
            } else {
                setCatTab([]);
            }
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
            setOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const AffcheProduit = (codeCategorie) => {
        setFilterValue(codeCategorie);
    };

    // Styles pour l'élément sélectionné
    const getItemStyle = (code) => {
        const isSelected = filterValue === code;
        return {
            className: `
                list-row m-2 flex w-full cursor-pointer items-center justify-start gap-6 p-2 
                transition-all duration-300 ease-in-out
                hover:bg-blue-50 hover:dark:bg-blue-900/20 
                ${isSelected ? 
                    'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400 font-bold scale-105' : 
                    'hover:divide-y hover:divide-y-reverse'
                }
            `
        };
    };

    return (
        <div className={`min-h-screen flex-col transition-[margin] duration-300 ${collapsed ? "w-[40px] pt-4" : "w-[280px] p-4"} text-white`}>
            <div className={`flex flex-row items-center text-black dark:text-white ${collapsed ? "gap-10" : "mr-10 gap-6"} `}>
                {!collapsed && <h1 className="text-lg font-bold">Filtrage par catégorie</h1>}
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
            </div>
            <div className="w-full">
                {!collapsed && (
                    <ul className="list bg-transparent text-black dark:text-white">
                        {/* Élément "Tous" */}
                        <li
                            key="tous"
                            onClick={() => AffcheProduit('Tous')} 
                            {...getItemStyle('Tous')}
                        >
                            <div>
                                <HiOutlineChevronDoubleRight />
                            </div>
                            <div className={filterValue === 'Tous' ? 'text-lg transition-all duration-300' : ''}>
                                Tous
                            </div>
                        </li>
                        
                        {loading ? (
                            <li key="charge" className="flex space-x-2 p-2">
                                <span className="loading-xl loading loading-dots text-blue-600"></span>
                                <span>Chargement...</span> 
                            </li>
                        ) : (
                            catTab
                                .filter(liste => liste.nbrProduit > 0)
                                .map((liste) => (
                                    <ListeSimple
                                        key={liste.codeCategorie}
                                        labelle={liste.libelleCategorie}
                                        categorie={liste}
                                        AffcheProduit={AffcheProduit}
                                        isSelected={filterValue === liste.codeCategorie}
                                    />
                                ))
                        )}
                    </ul>
                )}
            </div>
            {message.ouvre && (
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={handleClose}
                >
                    <Alert
                        onClose={handleClose}
                        severity={message.statut}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {message.texte}
                    </Alert>
                </Snackbar>
            )}
        </div>
    );
};

export default SideBar;