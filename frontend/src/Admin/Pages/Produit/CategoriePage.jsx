import React, { useEffect, useState, useCallback } from "react";
import { Construction, PencilLine, Trash, NotepadText } from "lucide-react";
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
    const { searchTerm, filterValue, setFilterValue, setSearchTerm } = useSearch();
    const [totalFiltre, setTotalFiltre] = useState(0);
    const [produitsFiltres, setProduitFiltres] = useState([]);
    const [chekTab, setChekTab] = useState([]);
    const [rupture, setRupture] = useState(CatTab.filter((product) => product.nbrProduit < 5).length);
    const [vide, setVide] = useState(CatTab.filter((product) => product.nbrProduit === 0).length);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    // Rendre fetchCategories réutilisable avec useCallback
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await CategorieListe();
            if (donnes.data){
                setCatTab(donnes.data);
            }else{
                setMessage({
                    ouvre: true,
                    texte: donnes.error,
                    statut: donnes.statut,
                });
                setOpen(true);
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
        setSearchTerm("");
        setFilterValue("Tous");
    }, []);

    useEffect(() => {
        let resultat = [...CatTab];

        //filtre par Recherche
        if (searchTerm) {
            const terme = searchTerm.toLowerCase();
            resultat = resultat.filter(
                (produit) => produit.libelleCategorie.toLowerCase().includes(terme), // includes(): nom produit mis an lay terme
            );
        }

        if (filterValue && filterValue !== Filtres.TOUS) {
            switch (filterValue) {
                case Filtres.ALPHABETIQUE:
                    resultat = resultat.sort((a, b) => a.libelleCategorie.localeCompare(b.libelleCategorie));
                    break;
                case Filtres.DERNIER_A_JOUR:
                    resultat = resultat.sort((a, b) => new Date(b.dateMiseAJourCategorie) - new Date(a.dateMiseAJourCategorie));
                    break;
            }
        }

        setProduitFiltres(resultat);
        setTotalFiltre(resultat.length);
    }, [CatTab, searchTerm, filterValue]);

    const catSelectionner = (cat) => {
        setChekTab((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    };
    
    const SupprimerTab = async (tab) => {
        console.log("Selectionner : ", tab);
        try {
            const donnes = await suppCategorie(tab);
            if (donnes.data){
                setMessage({
                    ouvre: true,
                    texte: donnes.message,
                    statut: donnes.statut,
                });
                setOpen(true);
                console.log("resultat: ", donnes.message);
            }else{
                setMessage({
                    ouvre: true,
                    texte: donnes.error,
                    statut: donnes.statut,
                });
                setOpen(true);
                console.log("resultat: ", donnes.error);
            }
            
            setChekTab([]);
            await fetchCategories();
        } catch (error) {
            console.error("Erreur de suppression :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
            setOpen(true);
        }
    };

    useEffect(() => {
        setRupture(CatTab.filter((product) => product.nbrProduit < 5).length);
        setVide(CatTab.filter((product) => product.nbrProduit === 0).length);
    }, [CatTab]);

    // notification
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    // Drawer contient le formulaire de modification
    const [produitModifier, setProduitModifier] = useState(null);
    const [code, setCode] = useState("");
    const [labelleEdit, setLabelleEdit] = useState("");
    const [descriptEdit, setDescriptEdit] = useState("");

    const modiferProduit = (produit) => {
        setProduitModifier(produit);
        setCode(produit.codeCategorie);
        setLabelleEdit(produit.libelleCategorie);
        setDescriptEdit(produit.descriptionCategorie);
        document.getElementById("edit-drawer").checked = true;
    };
    const closeDrawer = () => {
        document.getElementById("edit-drawer").checked = false;
        setProduitModifier(null);
    };

    const ModifierProduitDB = async (e) => {
        e.preventDefault();
        if (labelleEdit === "" || descriptEdit === "") {
            console.log("Champ obligatoire");
            setMessage({
                ouvre: true,
                texte: "Champ vide n'est pas autorisé!",
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
            if (donnes.data){
                setMessage({
                    ouvre: true,
                    texte: donnes.message,
                    statut: donnes.statut,
                });
                setOpen(true);
                console.log("resultat: ", donnes.message);
            }else{
                setMessage({
                    ouvre: true,
                    texte: donnes.error,
                    statut: donnes.statut,
                });
                setOpen(true);
                console.log("resultat: ", donnes.error);
            }
            await fetchCategories();
        } catch (error) {
            console.error("Erreur de modification :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
            setOpen(true);
        }
        closeDrawer();
    };

    const toggleSelectAll = (e) => {
        setChecked(e.target.checked);
        if (e.target.checked) {
          setChekTab(CatTab.map(item => item.codeCategorie || item.id));
        } else {
          setChekTab([]);
        }
      };
    return (
        <div className="drawer drawer-end min-h-screen">
            <input
                id="edit-drawer"
                type="checkbox"
                className="drawer-toggle"
            />

            <div className="drawer-content flex flex-col gap-5">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row justify-start gap-5">
                        <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 text-info transition-colors dark:border-slate-700 dark:bg-slate-900">
                            <span className="font-bold">Total :</span>
                            <span>{CatTab.length}</span>
                        </div>
                        <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 text-warning transition-colors dark:border-slate-700 dark:bg-slate-900">
                            <span className="font-bold">A rembourser :</span>
                            <span>{rupture}</span>
                        </div>
                        <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 text-error transition-colors dark:border-slate-700 dark:bg-slate-900">
                            <span className="font-bold"> Vide :</span>
                            <span>{vide}</span>
                        </div>
                    </div>
                    <div>
                        {chekTab.length > 0 && (
                            <button
                                className="top-13 btn btn-circle btn-error btn-outline btn-lg fixed right-10 z-50 shadow-xl"
                                onClick={() => document.getElementById("all").showModal()}
                            >
                                <Trash size={15} />
                                <span>({chekTab.length})</span>
                            </button>
                        )}
                        <Dialogue
                            id="all"
                            titre="Suppression"
                            texte={
                                "Voulez vous vraiment supprimer " +
                                (chekTab.length > 1 ? "ces " + chekTab.length + " élements" : "cet élement") +
                                "  definitivement et les produits associés ?"
                            }
                            onDelete={SupprimerTab}
                            tab={chekTab}
                        />
                    </div>
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
                <div className="card">
                    <div className="card-header">
                        <p className="card-title font-bold">Liste de catégorie des produits</p>
                    </div>
                    <div className="card-body p-0">
                        <div className="relative h-[480px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table">
                                <thead className="table-header">
                                    <tr className="table-row text-gray-500 dark:text-gray-400">
                                        <th className="table-head">
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                checked={checked}
                                                onChange={toggleSelectAll}
                                                className="checkbox-secondary checkbox"
                                            />
                                        </th>
                                        <th className="table-head">Code Categorie</th>
                                        <th className="table-head">Labelle</th>
                                        <th className="table-head">Nombre de Produit</th>
                                        <th className="table-head">Statut</th>
                                        <th className="table-head">Modification</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {produitsFiltres && totalFiltre > 0 ? (
                                        produitsFiltres.map((product) => (
                                            <tr
                                                key={product.codeCategorie}
                                                className="table-row"
                                            >
                                                <td className="table-cell">
                                                    <input
                                                        type="checkbox"
                                                        checked={chekTab.includes(product.codeCategorie)}
                                                        onChange={() => catSelectionner(product.codeCategorie)}
                                                        className="checkbox-secondary checkbox"
                                                    />
                                                </td>

                                                <td className="table-cell">{product.codeCategorie || "code invalide"}</td>

                                                <td
                                                    className="table-cell"
                                                    onClick={() => modiferProduit(product)}
                                                >
                                                    {/* <div className="flex w-max gap-x-4"> */}
                                                    <div className="flex max-w-xs flex-col whitespace-normal break-words">
                                                        <p>{product.libelleCategorie || "Labelle non supporté"}</p>
                                                        <p className="font-normal text-slate-600 dark:text-slate-400">
                                                            {product.descriptionCategorie || "Description non valide"}
                                                        </p>
                                                    </div>
                                                    {/* </div> */}
                                                </td>

                                                <td className="table-cell">
                                                    <div className="flex items-center justify-center">{product.nbrProduit}</div>
                                                </td>
                                                <td className="table-cell">
                                                    {product.nbrProduit < 5 ? (
                                                        <div className="badge-soft badge badge-error">à rembourser</div>
                                                    ) : (
                                                        <div className="badge-soft badge badge-success">moyenne</div>
                                                    )}
                                                </td>

                                                <td className="table-cell">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => modiferProduit(product)}
                                                            className="text-blue-500 dark:text-blue-600"
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr key="vide">
                                            <td colSpan="6">
                                                <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
                                                    {loading ? (
                                                        <div className="flex flex-row items-center justify-center gap-2">
                                                            <span className="loading-xl loading loading-dots text-blue-600"></span>
                                                            <span>Chargement des catégories...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <Construction
                                                                    strokeWidth={1}
                                                                    className="h-40 w-40"
                                                                />
                                                            </div>
                                                            <p className="text-sm">
                                                                {searchTerm ? (
                                                                    <p>
                                                                        {" "}
                                                                        Aucun Catégorie correspond à{" "}
                                                                        <span className="font-bold">{searchTerm}</span>{" "}
                                                                    </p>
                                                                ) : (
                                                                    `Aucun Catégorie trouvé pour le moment.`
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
                <Footer />
            </div>

            <div className="drawer-side z-50">
                <label
                    htmlFor="edit-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <div className="min-h-full w-[400px] bg-slate-50 p-6 text-base-content dark:bg-base-100">
                    {produitModifier ? (
                        <form onSubmit={ModifierProduitDB}>
                            <div className="flex w-full items-center justify-center">
                                <h2 className="mb-6 text-2xl font-bold text-accent">Modification d'un catégorie</h2>
                            </div>
                            <div className="py-10">
                                <InputText
                                    type="text"
                                    IconComponent={BiSolidCategoryAlt}
                                    placeholder="CAT000..."
                                    limite="Valeur positif"
                                    title="Code Catégorie"
                                    active="true"
                                    disabled
                                    saufTitre
                                    value={code}
                                    margY="mb-8"
                                />
                                <InputText
                                    IconComponent={NotepadText}
                                    placeholder="labelle catégorie..."
                                    limite="Caractre speciaux n'est pas autorisé"
                                    title="Labelle"
                                    value={labelleEdit}
                                    onChange={setLabelleEdit}
                                    margY="my-8"
                                />
                                <label className="mb-5 w-full items-center justify-center">
                                    <div className="label">
                                        <span className="label-text text-gray-800 dark:text-slate-300">Descriprion</span>
                                    </div>
                                    <textarea
                                        value={descriptEdit}
                                        onChange={(e) => setDescriptEdit(e.target.value)}
                                        className="textarea textarea-bordered h-[100px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
                                        placeholder="Décrire plus d'information sur ce produit..."
                                    ></textarea>
                                </label>
                            </div>
                            <div className=" flex w-full flex-row justify-end gap-4 px-2">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="btn btn-outline btn-error w-1/2"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-accent w-1/2"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    ) : (
                        <span className="loading-xl loading loading-dots"></span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriePage;
