import React, { useEffect, useState, useCallback } from "react";
import { ChevronsLeft } from "lucide-react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { CategorieListe } from "../../services/CategorieService";
import ListeSimple from "@/components/ListeSimple";
import { useNavbar } from "../context/NavbarContext";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { BiSolidCategoryAlt } from "react-icons/bi";

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
                flex items-center justify-between w-full p-4 mb-2 rounded-lg transition-all duration-300 ease-in-out
                border-2 cursor-pointer
                ${
                    isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:shadow-sm"
                }
            `,
        };
    };

    return (
        <div className={`min-h-screen flex-col transition-[margin] duration-300 ${collapsed ? "w-[40px] pt-4" : "w-[280px] p-4"} text-white`}>
            <div className={`flex flex-row justify-center items-center mb-2 space-x-4 text-black dark:text-white } `}>
                {!collapsed && (
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <BiSolidCategoryAlt className="text-blue-500" />
                        Catégories
                    </h3>
                )}
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
            </div>
            <div className="w-full pr-16">
                {!collapsed && (
                    <div className="space-y-2">
                        <div
                            key="tous"
                            onClick={() => AffcheProduit("Tous")}
                            {...getItemStyle("Tous")}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-full p-2 ${
                                        filterValue === "Tous" ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                                    }`}
                                >
                                    <HiOutlineChevronDoubleRight
                                        className={filterValue === "Tous" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}
                                    />
                                </div>
                                <span className="font-medium">Tous les produits</span>
                            </div>
                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    filterValue === "Tous"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                            >
                                {catTab.reduce((total, cat) => total + cat.nbrProduit, 0)}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center space-x-2 p-4">
                                <span className="loading loading-dots text-blue-600"></span>
                                <span className="text-gray-500 dark:text-gray-400">Chargement...</span>
                            </div>
                        ) : (
                            catTab
                                .filter((liste) => liste.nbrProduit > 0)
                                .map((liste) => (
                                    <div
                                        key={liste.codeCategorie}
                                        onClick={() => AffcheProduit(liste.codeCategorie)}
                                        {...getItemStyle(liste.codeCategorie)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`rounded-full p-2 ${
                                                    filterValue === liste.codeCategorie
                                                        ? "bg-blue-100 dark:bg-blue-800"
                                                        : "bg-gray-100 dark:bg-gray-700"
                                                }`}
                                            >
                                                <BiSolidCategoryAlt
                                                    className={
                                                        filterValue === liste.codeCategorie
                                                            ? "text-blue-600 dark:text-blue-300"
                                                            : "text-gray-500 dark:text-gray-400"
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <span className="block font-medium">{liste.libelleCategorie}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {liste.nbrProduit} produit{liste.nbrProduit > 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>
                                        {filterValue === liste.codeCategorie && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                                    </div>
                                ))
                        )}
                    </div>
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
