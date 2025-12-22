import React, { useEffect, useState, useCallback } from "react";
import { Construction, PencilLine, Trash, NotepadText, Search } from "lucide-react";
import { CategorieListe, suppCategorie, UpdateCategorie } from "../../../services/CategorieService";
import { Footer } from "../../layouts/footer";
import Dialogue from "@/Admin/components/Dialogue";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useSearch } from "../../contexts/SearchContext";
import { InputText } from "@/components/InputGrp";
import { BiSolidCategoryAlt } from "react-icons/bi";

const Filtres = {
    TOUS: "Tous",
    DERNIER_A_JOUR: "Dernier à Jour",
    ALPHABETIQUE: "Alphabetique",
};

const CategoriePage = () => {
    const [CatTab, setCatTab] = useState([]);
    const { searchTerm, filterValue, setFilterValue, setSearchTerm, setFilterStatus, filterStatus } = useSearch();
    const [totalFiltre, setTotalFiltre] = useState(0);
    const [produitsFiltres, setProduitFiltres] = useState([]);
    const [chekTab, setChekTab] = useState([]);
    const [rupture, setRupture] = useState(0);
    const [vide, setVide] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "",
        statut: "success",
    });


    // Drawer states
    const [produitModifier, setProduitModifier] = useState(null);
    const [code, setCode] = useState("");
    const [labelleEdit, setLabelleEdit] = useState("");
    const [descriptEdit, setDescriptEdit] = useState("");

    const [browserClass, setBrowserClass] = useState("");
    useEffect(() => {
        const ua = navigator.userAgent;
        const isEdge = ua.indexOf("Edg/") > -1;
        const isChrome = ua.indexOf("Chrome/") > -1 && !isEdge;
        if (isEdge) setBrowserClass("is-edge");
        else if (isChrome) setBrowserClass("is-chrome");
    }, []);

    // Fetch categories avec useCallback pour éviter les re-renders inutiles
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await CategorieListe();
            if (donnes.data) {
                setCatTab(donnes.data);
            } else {
                setMessage({
                    ouvre: true,
                    texte: donnes.error || "Erreur lors de la récupération des catégories",
                    statut: donnes.statut || "error",
                });
                setOpen(true);
            }
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setMessage({
                ouvre: true,
                texte: error.message || "Une erreur est survenue",
                statut: "error",
            });
            setOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialisation
    useEffect(() => {
        fetchCategories();
        setSearchTerm("");
        setFilterValue("Tous");
        setFilterStatus("tous");
    }, [fetchCategories]);

    // Calcul des statistiques
    useEffect(() => {
        setRupture(CatTab.filter((product) => product.nbrProduit < 5).length);
        setVide(CatTab.filter((product) => product.nbrProduit === 0).length);
    }, [CatTab]);

    // Filtrage et tri des catégories
    useEffect(() => {
        let resultat = [...CatTab];

        // Filtre par statut
        if (filterStatus && filterStatus !== "tous") {
            switch (filterStatus) {
                case "inactive":
                    resultat = resultat.filter((cat) => cat.nbrProduit === 0);
                    break;
                case "à enrichir":
                    resultat = resultat.filter((cat) => cat.nbrProduit > 0 && cat.nbrProduit <= 10);
                    break;
                case "standard":
                    resultat = resultat.filter((cat) => cat.nbrProduit > 10);
                    break;
                default:
                    break;
            }
        }

        // Filtre par recherche
        if (searchTerm) {
            const terme = searchTerm.toLowerCase();
            resultat = resultat.filter((produit) =>
                produit.libelleCategorie.toLowerCase().includes(terme)
            );
        }

        // Tri
        if (filterValue && filterValue !== Filtres.TOUS) {
            switch (filterValue) {
                case Filtres.ALPHABETIQUE:
                    resultat = resultat.sort((a, b) =>
                        a.libelleCategorie.localeCompare(b.libelleCategorie)
                    );
                    break;
                case Filtres.DERNIER_A_JOUR:
                    resultat = resultat.sort(
                        (a, b) =>
                            new Date(b.dateMiseAJourCategorie) - new Date(a.dateMiseAJourCategorie)
                    );
                    break;
                default:
                    break;
            }
        }

        setProduitFiltres(resultat);
        setTotalFiltre(resultat.length);
    }, [CatTab, searchTerm, filterValue, filterStatus]);

    // Gestion de la sélection
    const catSelectionner = useCallback((cat) => {
        setChekTab((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    }, []);

    const toggleSelectAll = useCallback((e) => {
        const isChecked = e.target.checked;
        setChecked(isChecked);
        if (isChecked) {
            setChekTab(produitsFiltres.map((item) => item.codeCategorie));
        } else {
            setChekTab([]);
        }
    }, [produitsFiltres]);

    // Suppression
    const SupprimerTab = async (tab) => {
        console.log("Sélectionner : ", tab);
        try {
            const donnes = await suppCategorie(tab);
            if (donnes.data) {
                setMessage({
                    ouvre: true,
                    texte: donnes.message || "Suppression réussie",
                    statut: donnes.statut || "success",
                });
                setOpen(true);
                console.log("Résultat: ", donnes);
            } else {
                setMessage({
                    ouvre: true,
                    texte: donnes.error || "Erreur lors de la suppression",
                    statut: donnes.statut || "error",
                });
                setOpen(true);
                console.log("Résultat: ", donnes.error);
            }
            setChekTab([]);
            await fetchCategories();
        } catch (error) {
            console.error("Erreur de suppression :", error);
            setMessage({
                ouvre: true,
                texte: error.message || "Une erreur est survenue",
                statut: "error",
            });
            setOpen(true);
        }
    };

    // Gestion du drawer de modification
    const modiferProduit = useCallback((produit) => {
        setProduitModifier(produit);
        setCode(produit.codeCategorie);
        setLabelleEdit(produit.libelleCategorie);
        setDescriptEdit(produit.descriptionCategorie);
        document.getElementById("edit-drawer").checked = true;
    }, []);

    const closeDrawer = useCallback(() => {
        document.getElementById("edit-drawer").checked = false;
        setProduitModifier(null);
        setCode("");
        setLabelleEdit("");
        setDescriptEdit("");
    }, []);

    const ModifierProduitDB = async (e) => {
        e.preventDefault();
        if (!labelleEdit.trim() || !descriptEdit.trim()) {
            setMessage({
                ouvre: true,
                texte: "Tous les champs sont obligatoires!",
                statut: "warning",
            });
            setOpen(true);
            return;
        }

        const category = {
            codeCAT: code,
            labelle: labelleEdit,
            description: descriptEdit,
        };

        console.log(category);
        try {
            const donnes = await UpdateCategorie(category);
            if (donnes.data) {
                setMessage({
                    ouvre: true,
                    texte: donnes.message || "Modification réussie",
                    statut: donnes.statut || "success",
                });
                setOpen(true);
                console.log("Résultat: ", donnes.message);
            } else {
                setMessage({
                    ouvre: true,
                    texte: donnes.error || "Erreur lors de la modification",
                    statut: donnes.statut || "error",
                });
                setOpen(true);
                console.log("Résultat: ", donnes.error);
            }
            await fetchCategories();
            closeDrawer();
        } catch (error) {
            console.error("Erreur de modification :", error);
            setMessage({
                ouvre: true,
                texte: error.message || "Une erreur est survenue",
                statut: "error",
            });
            setOpen(true);
        }
    };

    // Gestion des handlers
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, [setSearchTerm]);

    const handleFilterChange = useCallback((e) => {
        setFilterValue(e.target.value);
    }, [setFilterValue]);

    const handleClose = useCallback((event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    }, []);

    const handleFilterStatusChange = useCallback((status) => {
        setFilterStatus(status);
    }, [setFilterStatus]);

    return (
        <div className="drawer drawer-end min-h-screen">
            <input id="edit-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col gap-1">
                {/* Barre de recherche et filtres */}
                <div className="flex justify-between rounded-lg transition-colors bg-white dark:bg-slate-900 py-2 px-4 shadow">
                    <div className="input border border-slate-500 mr-6 dark:border-slate-600 bg-[#FDFEFF] dark:bg-[#020617]">
                        <Search size={20} className="text-slate-400" />
                        <input
                            type="text"
                            name="search"
                            id="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Recherche..."
                            className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
                        />
                    </div>

                    <div className="flex flex-row items-center w-full gap-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Statut :
                        </span>
                        {["tous", "inactive", "à enrichir", "standard"].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleFilterStatusChange(status)}
                                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap ${
                                    filterStatus === status
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end items-center gap-4 w-full text-slate-950 dark:text-gray-200">
                        <label className="label">
                            <span className="label-text text-slate-950 dark:text-gray-200 whitespace-nowrap">
                                Trier par :
                            </span>
                        </label>
                        <select
                            className="select select-sm rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
                            value={filterValue}
                            onChange={handleFilterChange}
                        >
                            <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
                            <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
                            <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
                        </select>
                    </div>
                </div>

                {/* Bouton de suppression et dialogue */}
                <div>
                    {chekTab.length > 0 && (
                        <button
                            className="btn btn-circle btn-error btn-outline btn-lg fixed right-10 top-20 z-50 shadow-xl"
                            onClick={() => document.getElementById("all").showModal()}
                        >
                            <Trash size={15} />
                            <span>({chekTab.length})</span>
                        </button>
                    )}
                    <Dialogue
                        id="all"
                        titre="Suppression"
                        texte={`Voulez-vous vraiment supprimer ${
                            chekTab.length > 1
                                ? `ces ${chekTab.length} éléments`
                                : "cet élément"
                        } définitivement ainsi que les produits associés ?`}
                        onDelete={SupprimerTab}
                        tab={chekTab}
                    />
                    {message.ouvre && (
                        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
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

                {/* Tableau des catégories */}
                <div className="card">
                    <div className="card-header">
                        <p className="card-title font-bold">Liste des catégories de produits</p>
                    </div>
                    <div className="card-body p-0">
                        {/*voici la modification:  415 chrome  et 500px sur edge*/}
                        <div className={`relative w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin] 
                            ${browserClass === 'is-chrome' ? 'h-[420px]' : 
                            browserClass === 'is-edge' ? 'h-[530px]' : 'h-[530px]'}`}>
                            <table className="table">
                                <thead className="table-header">
                                    <tr className="table-row text-gray-500 dark:text-gray-400">
                                        <th className="table-head">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={toggleSelectAll}
                                                className="checkbox-secondary checkbox"
                                            />
                                        </th>
                                        <th className="table-head">Code Catégorie</th>
                                        <th className="table-head">Libellé</th>
                                        <th className="table-head">Nombre de Produits</th>
                                        <th className="table-head">Statut</th>
                                        <th className="table-head">Modification</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {produitsFiltres && totalFiltre > 0 ? (
                                        produitsFiltres.map((product) => (
                                            <tr key={product.codeCategorie} className="table-row">
                                                <td className="table-cell">
                                                    <input
                                                        type="checkbox"
                                                        checked={chekTab.includes(product.codeCategorie)}
                                                        onChange={() => catSelectionner(product.codeCategorie)}
                                                        className="checkbox-secondary checkbox"
                                                    />
                                                </td>

                                                <td className="table-cell">
                                                    {product.codeCategorie || "Code invalide"}
                                                </td>

                                                <td
                                                    className="table-cell cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
                                                    onClick={() => modiferProduit(product)}
                                                >
                                                    <div className="flex max-w-xs flex-col whitespace-normal break-words">
                                                        <p className="font-medium">
                                                            {product.libelleCategorie || "Libellé non supporté"}
                                                        </p>
                                                        <p className="text-sm font-normal text-slate-600 dark:text-slate-400">
                                                            {product.descriptionCategorie || "Description non valide"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="table-cell">
                                                    <div className="flex items-center justify-center">
                                                        {product.nbrProduit}
                                                    </div>
                                                </td>

                                                <td className="table-cell">
                                                    {product.nbrProduit === 0 ? (
                                                        <div className="badge-soft badge badge-error">Inactive</div>
                                                    ) : product.nbrProduit <= 10 ? (
                                                        <div className="badge-soft badge badge-warning">À enrichir</div>
                                                    ) : (
                                                        <div className="badge-soft badge badge-success">Standard</div>
                                                    )}
                                                </td>

                                                <td className="table-cell">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => modiferProduit(product)}
                                                            className="text-blue-500 hover:text-blue-700 dark:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                            aria-label="Modifier la catégorie"
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
                                                    {loading ? (
                                                        <div className="flex flex-row items-center justify-center gap-2">
                                                            <span className="loading-xl loading loading-dots text-blue-600"></span>
                                                            <span>Chargement des catégories...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Construction strokeWidth={1} className="h-40 w-40" />
                                                            <p className="text-sm mt-4">
                                                                {searchTerm ? (
                                                                    <>
                                                                        Aucune catégorie ne correspond à{" "}
                                                                        <span className="font-bold">"{searchTerm}"</span>
                                                                    </>
                                                                ) : (
                                                                    "Aucune catégorie trouvée pour le moment."
                                                                )}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drawer de modification */}
            <div className="drawer-side z-50">
                <label
                    htmlFor="edit-drawer"
                    aria-label="Fermer le panneau"
                    className="drawer-overlay"
                ></label>
                <div className="min-h-full w-[400px] bg-slate-50 p-6 text-base-content dark:bg-base-100">
                    {produitModifier ? (
                        <form onSubmit={ModifierProduitDB}>
                            <div className="flex w-full items-center justify-center">
                                <h2 className="mb-6 text-2xl font-bold text-accent">
                                    Modification d'une catégorie
                                </h2>
                            </div>
                            <div className="py-10">
                                <InputText
                                    type="text"
                                    IconComponent={BiSolidCategoryAlt}
                                    placeholder="CAT000..."
                                    limite="Valeur positive"
                                    title="Code Catégorie"
                                    active="true"
                                    disabled
                                    saufTitre
                                    value={code}
                                    margY="mb-8"
                                />
                                <InputText
                                    IconComponent={NotepadText}
                                    placeholder="Libellé catégorie..."
                                    limite="Caractères spéciaux non autorisés"
                                    title="Libellé"
                                    value={labelleEdit}
                                    onChange={setLabelleEdit}
                                    margY="my-8"
                                />
                                <label className="mb-5 w-full items-center justify-center">
                                    <div className="label">
                                        <span className="label-text text-gray-800 dark:text-slate-300">
                                            Description
                                        </span>
                                    </div>
                                    <textarea
                                        value={descriptEdit}
                                        onChange={(e) => setDescriptEdit(e.target.value)}
                                        className="textarea textarea-bordered h-[100px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
                                        placeholder="Décrivez cette catégorie..."
                                    ></textarea>
                                </label>
                            </div>
                            <div className="flex w-full flex-row justify-end gap-4 px-2">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="btn btn-outline btn-error w-1/2"
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-accent w-1/2">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <span className="loading-xl loading loading-dots"></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriePage;

// import React, { useEffect, useState, useCallback } from "react";
// import { Construction, PencilLine, Trash, NotepadText, Search } from "lucide-react";
// import { CategorieListe, suppCategorie, UpdateCategorie } from "../../../services/CategorieService";
// import { Footer } from "../../layouts/footer";
// import Dialogue from "@/Admin/components/Dialogue";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { useSearch } from "../../contexts/SearchContext";
// import { InputText } from "@/components/InputGrp";
// import { BiSolidCategoryAlt } from "react-icons/bi";

// const Filtres = {
//     TOUS: "Tous",
//     DERNIER_A_JOUR: "Dernier à Jour",
//     ALPHABETIQUE: "Alphabetique",
// };

// const CategoriePage = () => {
//     const [CatTab, setCatTab] = useState([]);
//     const { searchTerm, filterValue, setFilterValue, setSearchTerm, setFilterStatus, filterStatus } = useSearch();
//     const [totalFiltre, setTotalFiltre] = useState(0);
//     const [produitsFiltres, setProduitFiltres] = useState([]);
//     const [chekTab, setChekTab] = useState([]);
//     const [rupture, setRupture] = useState(0);
//     const [vide, setVide] = useState(0);
//     const [open, setOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [checked, setChecked] = useState(false);
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "",
//         statut: "success",
//     });

//     // Drawer states
//     const [produitModifier, setProduitModifier] = useState(null);
//     const [code, setCode] = useState("");
//     const [labelleEdit, setLabelleEdit] = useState("");
//     const [descriptEdit, setDescriptEdit] = useState("");

//     // Fetch categories avec useCallback pour éviter les re-renders inutiles
//     const fetchCategories = useCallback(async () => {
//         setLoading(true);
//         try {
//             const donnes = await CategorieListe();
//             if (donnes.data) {
//                 setCatTab(donnes.data);
//             } else {
//                 setMessage({
//                     ouvre: true,
//                     texte: donnes.error || "Erreur lors de la récupération des catégories",
//                     statut: donnes.statut || "error",
//                 });
//                 setOpen(true);
//             }
//         } catch (error) {
//             console.error("Erreur de récupération :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message || "Une erreur est survenue",
//                 statut: "error",
//             });
//             setOpen(true);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Initialisation
//     useEffect(() => {
//         fetchCategories();
//         setSearchTerm("");
//         setFilterValue("Tous");
//         setFilterStatus("tous");
//     }, [fetchCategories]);

//     // Calcul des statistiques
//     useEffect(() => {
//         setRupture(CatTab.filter((product) => product.nbrProduit < 5).length);
//         setVide(CatTab.filter((product) => product.nbrProduit === 0).length);
//     }, [CatTab]);

//     // Filtrage et tri des catégories
//     useEffect(() => {
//         let resultat = [...CatTab];

//         // Filtre par statut
//         if (filterStatus && filterStatus !== "tous") {
//             switch (filterStatus) {
//                 case "inactive":
//                     resultat = resultat.filter((cat) => cat.nbrProduit === 0);
//                     break;
//                 case "à enrichir":
//                     resultat = resultat.filter((cat) => cat.nbrProduit > 0 && cat.nbrProduit <= 10);
//                     break;
//                 case "standard":
//                     resultat = resultat.filter((cat) => cat.nbrProduit > 10);
//                     break;
//                 default:
//                     break;
//             }
//         }

//         // Filtre par recherche
//         if (searchTerm) {
//             const terme = searchTerm.toLowerCase();
//             resultat = resultat.filter((produit) =>
//                 produit.libelleCategorie.toLowerCase().includes(terme)
//             );
//         }

//         // Tri
//         if (filterValue && filterValue !== Filtres.TOUS) {
//             switch (filterValue) {
//                 case Filtres.ALPHABETIQUE:
//                     resultat = resultat.sort((a, b) =>
//                         a.libelleCategorie.localeCompare(b.libelleCategorie)
//                     );
//                     break;
//                 case Filtres.DERNIER_A_JOUR:
//                     resultat = resultat.sort(
//                         (a, b) =>
//                             new Date(b.dateMiseAJourCategorie) - new Date(a.dateMiseAJourCategorie)
//                     );
//                     break;
//                 default:
//                     break;
//             }
//         }

//         setProduitFiltres(resultat);
//         setTotalFiltre(resultat.length);
//     }, [CatTab, searchTerm, filterValue, filterStatus]);

//     // Gestion de la sélection
//     const catSelectionner = useCallback((cat) => {
//         setChekTab((prev) =>
//             prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
//         );
//     }, []);

//     const toggleSelectAll = useCallback((e) => {
//         const isChecked = e.target.checked;
//         setChecked(isChecked);
//         if (isChecked) {
//             setChekTab(produitsFiltres.map((item) => item.codeCategorie));
//         } else {
//             setChekTab([]);
//         }
//     }, [produitsFiltres]);

//     // Suppression
//     const SupprimerTab = async (tab) => {
//         console.log("Sélectionner : ", tab);
//         try {
//             const donnes = await suppCategorie(tab);
//             if (donnes.data) {
//                 setMessage({
//                     ouvre: true,
//                     texte: donnes.message || "Suppression réussie",
//                     statut: donnes.statut || "success",
//                 });
//                 setOpen(true);
//                 console.log("Résultat: ", donnes.message);
//             } else {
//                 setMessage({
//                     ouvre: true,
//                     texte: donnes.error || "Erreur lors de la suppression",
//                     statut: donnes.statut || "error",
//                 });
//                 setOpen(true);
//                 console.log("Résultat: ", donnes.error);
//             }
//             setChekTab([]);
//             await fetchCategories();
//         } catch (error) {
//             console.error("Erreur de suppression :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message || "Une erreur est survenue",
//                 statut: "error",
//             });
//             setOpen(true);
//         }
//     };

//     // Gestion du drawer de modification
//     const modiferProduit = useCallback((produit) => {
//         setProduitModifier(produit);
//         setCode(produit.codeCategorie);
//         setLabelleEdit(produit.libelleCategorie);
//         setDescriptEdit(produit.descriptionCategorie);
//         document.getElementById("edit-drawer").checked = true;
//     }, []);

//     const closeDrawer = useCallback(() => {
//         document.getElementById("edit-drawer").checked = false;
//         setProduitModifier(null);
//         setCode("");
//         setLabelleEdit("");
//         setDescriptEdit("");
//     }, []);

//     const ModifierProduitDB = async (e) => {
//         e.preventDefault();
//         if (!labelleEdit.trim() || !descriptEdit.trim()) {
//             setMessage({
//                 ouvre: true,
//                 texte: "Tous les champs sont obligatoires!",
//                 statut: "warning",
//             });
//             setOpen(true);
//             return;
//         }

//         const category = {
//             codeCAT: code,
//             labelle: labelleEdit,
//             description: descriptEdit,
//         };

//         console.log(category);
//         try {
//             const donnes = await UpdateCategorie(category);
//             if (donnes.data) {
//                 setMessage({
//                     ouvre: true,
//                     texte: donnes.message || "Modification réussie",
//                     statut: donnes.statut || "success",
//                 });
//                 setOpen(true);
//                 console.log("Résultat: ", donnes.message);
//             } else {
//                 setMessage({
//                     ouvre: true,
//                     texte: donnes.error || "Erreur lors de la modification",
//                     statut: donnes.statut || "error",
//                 });
//                 setOpen(true);
//                 console.log("Résultat: ", donnes.error);
//             }
//             await fetchCategories();
//             closeDrawer();
//         } catch (error) {
//             console.error("Erreur de modification :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message || "Une erreur est survenue",
//                 statut: "error",
//             });
//             setOpen(true);
//         }
//     };

//     // Gestion des handlers
//     const handleSearchChange = useCallback((e) => {
//         setSearchTerm(e.target.value);
//     }, [setSearchTerm]);

//     const handleFilterChange = useCallback((e) => {
//         setFilterValue(e.target.value);
//     }, [setFilterValue]);

//     const handleClose = useCallback((event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     }, []);

//     const handleFilterStatusChange = useCallback((status) => {
//         setFilterStatus(status);
//     }, [setFilterStatus]);

//     return (
//         <div className="drawer drawer-end min-h-screen">
//             <input id="edit-drawer" type="checkbox" className="drawer-toggle" />

//             <div className="drawer-content flex flex-col gap-1">
//                 {/* Barre de recherche et filtres */}
//                 <div className="flex justify-between rounded-lg transition-colors bg-white dark:bg-slate-900 py-2 px-4 shadow">
//                     <div className="input border border-slate-500 mr-6 dark:border-slate-600 bg-[#FDFEFF] dark:bg-[#020617]">
//                         <Search size={20} className="text-slate-400" />
//                         <input
//                             type="text"
//                             name="search"
//                             id="search"
//                             value={searchTerm}
//                             onChange={handleSearchChange}
//                             placeholder="Recherche..."
//                             className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
//                         />
//                     </div>

//                     <div className="flex flex-row items-center w-full gap-4">
//                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
//                             Statut :
//                         </span>
//                         {["tous", "inactive", "à enrichir", "standard"].map((status) => (
//                             <button
//                                 key={status}
//                                 onClick={() => handleFilterStatusChange(status)}
//                                 className={`rounded-full px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap ${
//                                     filterStatus === status
//                                         ? "bg-blue-500 text-white"
//                                         : "bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 text-gray-700 hover:bg-gray-300"
//                                 }`}
//                             >
//                                 {status.charAt(0).toUpperCase() + status.slice(1)}
//                             </button>
//                         ))}
//                     </div>

//                     <div className="flex justify-end items-center gap-4 w-full text-slate-950 dark:text-gray-200">
//                         <label className="label">
//                             <span className="label-text text-slate-950 dark:text-gray-200 whitespace-nowrap">
//                                 Trier par :
//                             </span>
//                         </label>
//                         <select
//                             className="select select-sm rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
//                             value={filterValue}
//                             onChange={handleFilterChange}
//                         >
//                             <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
//                             <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
//                             <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Bouton de suppression et dialogue */}
//                 <div>
//                     {chekTab.length > 0 && (
//                         <button
//                             className="btn btn-circle btn-error btn-outline btn-lg fixed right-10 top-20 z-50 shadow-xl"
//                             onClick={() => document.getElementById("all").showModal()}
//                         >
//                             <Trash size={15} />
//                             <span>({chekTab.length})</span>
//                         </button>
//                     )}
//                     <Dialogue
//                         id="all"
//                         titre="Suppression"
//                         texte={`Voulez-vous vraiment supprimer ${
//                             chekTab.length > 1
//                                 ? `ces ${chekTab.length} éléments`
//                                 : "cet élément"
//                         } définitivement ainsi que les produits associés ?`}
//                         onDelete={SupprimerTab}
//                         tab={chekTab}
//                     />
//                     {message.ouvre && (
//                         <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
//                             <Alert
//                                 onClose={handleClose}
//                                 severity={message.statut}
//                                 variant="filled"
//                                 sx={{ width: "100%" }}
//                             >
//                                 {message.texte}
//                             </Alert>
//                         </Snackbar>
//                     )}
//                 </div>

//                 {/* Tableau des catégories */}
//                 <div className="card">
//                     <div className="card-header">
//                         <p className="card-title font-bold">Liste des catégories de produits</p>
//                     </div>
//                     <div className="card-body p-0">
//                         <div className="relative h-[415px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                             <table className="table">
//                                 <thead className="table-header">
//                                     <tr className="table-row text-gray-500 dark:text-gray-400">
//                                         <th className="table-head">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={checked}
//                                                 onChange={toggleSelectAll}
//                                                 className="checkbox-secondary checkbox"
//                                             />
//                                         </th>
//                                         <th className="table-head">Code Catégorie</th>
//                                         <th className="table-head">Libellé</th>
//                                         <th className="table-head">Nombre de Produits</th>
//                                         <th className="table-head">Statut</th>
//                                         <th className="table-head">Modification</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="table-body">
//                                     {produitsFiltres && totalFiltre > 0 ? (
//                                         produitsFiltres.map((product) => (
//                                             <tr key={product.codeCategorie} className="table-row">
//                                                 <td className="table-cell">
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={chekTab.includes(product.codeCategorie)}
//                                                         onChange={() => catSelectionner(product.codeCategorie)}
//                                                         className="checkbox-secondary checkbox"
//                                                     />
//                                                 </td>

//                                                 <td className="table-cell">
//                                                     {product.codeCategorie || "Code invalide"}
//                                                 </td>

//                                                 <td
//                                                     className="table-cell cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
//                                                     onClick={() => modiferProduit(product)}
//                                                 >
//                                                     <div className="flex max-w-xs flex-col whitespace-normal break-words">
//                                                         <p className="font-medium">
//                                                             {product.libelleCategorie || "Libellé non supporté"}
//                                                         </p>
//                                                         <p className="text-sm font-normal text-slate-600 dark:text-slate-400">
//                                                             {product.descriptionCategorie || "Description non valide"}
//                                                         </p>
//                                                     </div>
//                                                 </td>

//                                                 <td className="table-cell">
//                                                     <div className="flex items-center justify-center">
//                                                         {product.nbrProduit}
//                                                     </div>
//                                                 </td>

//                                                 <td className="table-cell">
//                                                     {product.nbrProduit === 0 ? (
//                                                         <div className="badge-soft badge badge-error">Inactive</div>
//                                                     ) : product.nbrProduit <= 10 ? (
//                                                         <div className="badge-soft badge badge-warning">À enrichir</div>
//                                                     ) : (
//                                                         <div className="badge-soft badge badge-success">Standard</div>
//                                                     )}
//                                                 </td>

//                                                 <td className="table-cell">
//                                                     <div className="flex items-center justify-center">
//                                                         <button
//                                                             onClick={() => modiferProduit(product)}
//                                                             className="text-blue-500 hover:text-blue-700 dark:text-blue-600 dark:hover:text-blue-400 transition-colors"
//                                                             aria-label="Modifier la catégorie"
//                                                         >
//                                                             <PencilLine size={20} />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="6">
//                                                 <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
//                                                     {loading ? (
//                                                         <div className="flex flex-row items-center justify-center gap-2">
//                                                             <span className="loading-xl loading loading-dots text-blue-600"></span>
//                                                             <span>Chargement des catégories...</span>
//                                                         </div>
//                                                     ) : (
//                                                         <>
//                                                             <Construction strokeWidth={1} className="h-40 w-40" />
//                                                             <p className="text-sm mt-4">
//                                                                 {searchTerm ? (
//                                                                     <>
//                                                                         Aucune catégorie ne correspond à{" "}
//                                                                         <span className="font-bold">"{searchTerm}"</span>
//                                                                     </>
//                                                                 ) : (
//                                                                     "Aucune catégorie trouvée pour le moment."
//                                                                 )}
//                                                             </p>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Drawer de modification */}
//             <div className="drawer-side z-50">
//                 <label
//                     htmlFor="edit-drawer"
//                     aria-label="Fermer le panneau"
//                     className="drawer-overlay"
//                 ></label>
//                 <div className="min-h-full w-[400px] bg-slate-50 p-6 text-base-content dark:bg-base-100">
//                     {produitModifier ? (
//                         <form onSubmit={ModifierProduitDB}>
//                             <div className="flex w-full items-center justify-center">
//                                 <h2 className="mb-6 text-2xl font-bold text-accent">
//                                     Modification d'une catégorie
//                                 </h2>
//                             </div>
//                             <div className="py-10">
//                                 <InputText
//                                     type="text"
//                                     IconComponent={BiSolidCategoryAlt}
//                                     placeholder="CAT000..."
//                                     limite="Valeur positive"
//                                     title="Code Catégorie"
//                                     active="true"
//                                     disabled
//                                     saufTitre
//                                     value={code}
//                                     margY="mb-8"
//                                 />
//                                 <InputText
//                                     IconComponent={NotepadText}
//                                     placeholder="Libellé catégorie..."
//                                     limite="Caractères spéciaux non autorisés"
//                                     title="Libellé"
//                                     value={labelleEdit}
//                                     onChange={setLabelleEdit}
//                                     margY="my-8"
//                                 />
//                                 <label className="mb-5 w-full items-center justify-center">
//                                     <div className="label">
//                                         <span className="label-text text-gray-800 dark:text-slate-300">
//                                             Description
//                                         </span>
//                                     </div>
//                                     <textarea
//                                         value={descriptEdit}
//                                         onChange={(e) => setDescriptEdit(e.target.value)}
//                                         className="textarea textarea-bordered h-[100px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
//                                         placeholder="Décrivez cette catégorie..."
//                                     ></textarea>
//                                 </label>
//                             </div>
//                             <div className="flex w-full flex-row justify-end gap-4 px-2">
//                                 <button
//                                     type="button"
//                                     onClick={closeDrawer}
//                                     className="btn btn-outline btn-error w-1/2"
//                                 >
//                                     Annuler
//                                 </button>
//                                 <button type="submit" className="btn btn-accent w-1/2">
//                                     Enregistrer
//                                 </button>
//                             </div>
//                         </form>
//                     ) : (
//                         <div className="flex items-center justify-center h-full">
//                             <span className="loading-xl loading loading-dots"></span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CategoriePage;
