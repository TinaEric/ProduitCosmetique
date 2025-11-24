import React, { useEffect, useState, useCallback } from "react";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { useSearch } from "../contexts/SearchContext";
import { CategorieListe } from "@/services/CategorieService";
import { ProduitGroupe, suppProduit, UpdateProduit } from "@/services/produitService";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export const SideProduit = () => {
    const { setFiltreCat, filtreCat } = useSearch();
    const [ProduitTab, setProduitTab] = useState([]);
    const [filtreCategorie, setFiltreCategorie] = useState([]);
    const [loadCategorie, setLoadCategorie] = useState(false);
        const [categorieTab, setCategorieTab] = useState([]);
        const [produitsFiltres, setProduitFiltres] = useState([]);
        const [loading, setLoading] = useState(false);
    
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
            ouvre: false,
            texte: "vide",
            statut: "success",
        });
    // chargement des produit
    const fetchProduits = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await ProduitGroupe();
            setProduitTab([...donnes]);
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    //chargement de categorie
    const fetchCategories = useCallback(async () => {
        setLoadCategorie(true);
        try {
            const donnes = await CategorieListe();
            if (donnes.data) {
                setCategorieTab(donnes.data);
                setFiltreCategorie(donnes.data);
            } else {
                setCategorieTab([]);
                setFiltreCategorie([]);
            }
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
        } finally {
            setLoadCategorie(false);
        }
    }, []);

    useEffect(() => {
        fetchProduits();
        fetchCategories();
    }, []);

    const AffcheProduit = (codeCategorie) => {
        setFiltreCat(codeCategorie);
    };

    const getItemStyle = (code) => {
        const isSelected = filtreCat === code;
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
        <div className="gap-y-4 overflow-y-auto overflow-x-hidden p-2 [scrollbar-width:_thin]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                    <BiSolidCategoryAlt className="text-blue-500" />
                    Catégories
                </h3>

                <div className="space-y-2">
                    {/* Élément "Tous" */}
                    <div
                        key="tous"
                        onClick={() => AffcheProduit("Tous")}
                        {...getItemStyle("Tous")}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-full p-2 ${
                                    filtreCat === "Tous" ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                                }`}
                            >
                                <HiOutlineChevronDoubleRight
                                    className={filtreCat === "Tous" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}
                                />
                            </div>
                            <span className="font-medium">Tous les produits</span>
                        </div>
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                filtreCat === "Tous"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                        >
                            {ProduitTab.reduce((total, cat) => total + cat.produits.length, 0)}
                        </span>
                    </div>

                    {loadCategorie ? (
                        <div className="flex items-center justify-center space-x-2 p-4">
                            <span className="loading loading-dots text-blue-600"></span>
                            <span className="text-gray-500 dark:text-gray-400">Chargement...</span>
                        </div>
                    ) : (
                        filtreCategorie
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
                                                filtreCat === liste.codeCategorie ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                                            }`}
                                        >
                                            <BiSolidCategoryAlt
                                                className={
                                                    filtreCat === liste.codeCategorie
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
                                    {filtreCat === liste.codeCategorie && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                                </div>
                            ))
                    )}
                </div>
            </div>
            {/* Modale et bouton flottant */}
                            <div>
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
        </div>
    );
};
