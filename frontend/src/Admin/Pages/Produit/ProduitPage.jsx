import Dialogue from "@/Admin/components/Dialogue";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { ProduitGroupe, suppProduit, UpdateProduit } from "@/services/produitService";
import { CategorieListe } from "../../../services/CategorieService";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { cn } from "../../utils/cn";
import Card from "../../../components/Card";
import { useSearch } from "../../contexts/SearchContext";
import { InputText } from "@/components/InputGrp";
import { UploadImage } from "@/components/UploadImage";
import React, { useEffect, useState, useCallback } from "react";
import { Construction, SquarePen, NotepadText } from "lucide-react";
import { FaSackDollar } from "react-icons/fa6";
import { RiNumbersFill } from "react-icons/ri";
import { MdOutlineStar } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { AiOutlineProduct } from "react-icons/ai";
import ListeSimple from "@/components/ListeSimple";

const Filtres = {
    TOUS: "Tous",
    DERNIER_A_JOUR: "Dernier à Jour",
    ALPHABETIQUE: "Alphabetique",
    CATEGORIE: "Categorie",
};

const ProduitPage = () => {
    const { searchTerm, setFiltreCat, filtreCat, filterValue, setFilterValue, setSearchTerm, filtreStock, setFiltreStock } = useSearch();
    const [totalFiltre, setTotalFiltre] = useState(0);
    const [ProduitTab, setProduitTab] = useState([]);
    const [categorieTab, setCategorieTab] = useState([]);
    const [produitsFiltres, setProduitFiltres] = useState([]);
    const [produitASupprimer, setproduitASupprimer] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadCategorie, setLoadCategorie] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    var titre = "";
    //Donner ampidirana am le formulaire Drawer
    const [produitModifier, setProduitModifier] = useState(null);
    const [numProduct, setNumProduct] = useState("");
    const [filtreCategorie, setFiltreCategorie] = useState([]);
    const [nomProduct, setNomProduct] = useState("");
    const [stockPoduct, setStockPoduct] = useState("");
    const [descriptionProduct, setDescriptionProduct] = useState("");
    const [prixProduct, setPrixProduct] = useState("");
    const [imageProduct, setImageProduct] = useState(null);
    const [codePromosProduct, setCodePromosProduct] = useState("");
    const [codeCategorie, setCodeCategorie] = useState("");

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

    // useEffect pour le chargement de produit et categorie
    useEffect(() => {
        fetchProduits();
        fetchCategories();
        setSearchTerm("");
        setFilterValue("Tous");
    }, []);

    // filtrage d'affichage (recherche et triage)
    useEffect(() => {
        let resultat = [...ProduitTab];
        let finalProduitsAffiches;

        // Appliquer d'abord le filtre de stock si activé
        if (filtreStock && filtreStock !== "Tous") {
            resultat = resultat
                .map((categorie) => {
                    const produitsFiltres = categorie.produits.filter((produit) => {
                        const stock = produit.stock !== undefined ? produit.stock : produit.stockProduit;
                        
                        switch (filtreStock) {
                            case "enStock":
                                return stock > 0;
                            case "rupture":
                                return stock === 0;
                            case "alerte":
                                return stock <= 10 && stock > 0;
                            default:
                                return true;
                        }
                    });
    
                    return {
                        ...categorie,
                        produits: produitsFiltres,
                    };
                })
                .filter((categorie) => categorie.produits.length > 0);
        }

        //filtre par Recherche
        if (searchTerm) {
            const terme = searchTerm.toLowerCase();
            resultat = resultat
                .map((categorie) => {
                    const produitsFiltres = categorie.produits.filter(
                        (produit) => produit.nom.toLowerCase().includes(terme),
                    );

                    return {
                        ...categorie,
                        produits: produitsFiltres,
                    };
                })
                .filter((vide) => vide.produits.length > 0);
        }

        if (filtreCat && filtreCat !== Filtres.TOUS) {
            // Filtre par code catégorie
            resultat = resultat.filter((categorie) => categorie.codeCategorie === filtreCat);
        }

        if (filterValue === Filtres.TOUS || filterValue === Filtres.ALPHABETIQUE || filterValue === Filtres.DERNIER_A_JOUR) {
            let produitsNonGroupés = resultat.flatMap((groupe) => groupe.produits);
            let libelleAffiche = "Tous les produits";

            switch (filterValue) {
                case Filtres.ALPHABETIQUE:
                    produitsNonGroupés.sort((a, b) => a.nom.localeCompare(b.nom));
                    libelleAffiche = "Résultats triés par ordre alphabétique";
                    break;

                case Filtres.DERNIER_A_JOUR:
                    produitsNonGroupés.sort((a, b) => {
                        const dateA = new Date(a.dateMisAJourProduit);
                        const dateB = new Date(b.dateMisAJourProduit);
                        return dateB - dateA;
                    });
                    libelleAffiche = "Résultats triés par date de mise à jour";
                    break;

                case Filtres.TOUS:
                default:
                    produitsNonGroupés.sort((a, b) => a.nom.localeCompare(b.nom));
                    break;
            }
            finalProduitsAffiches = [
                {
                    codeCategorie: "Tsisy ee",
                    libelle: libelleAffiche,
                    produits: produitsNonGroupés,
                },
            ];
        } else {
            let resultatTri = resultat.map((groupe) => {
                let produitsTriés = [...groupe.produits];
                produitsTriés.sort((a, b) => a.nom.localeCompare(b.nom));
                return { ...groupe, produits: produitsTriés };
            });
            finalProduitsAffiches = resultatTri;
        }

        const nouveauTotal = finalProduitsAffiches.reduce((total, groupe) => {
            return total + groupe.produits.length;
        }, 0);
        setProduitFiltres(finalProduitsAffiches);
        setTotalFiltre(nouveauTotal);
    }, [ProduitTab, searchTerm, filterValue, filtreCat, filtreStock]);

    //fonctoin preparation pour le modal suppression
    const supprimer = (idProduit, nomProduit) => {
        setproduitASupprimer({ id: idProduit, nom: nomProduit });
        document.getElementById("all").showModal();
    };

    //fonction preparation pour le formulaire drawer
    const modiifier = (cat, prod) => {
        titre = prod.nom;
        setNumProduct(prod.id);
        setNomProduct(prod.nom);
        setStockPoduct(prod.stock);
        setPrixProduct(prod.prix);
        setDescriptionProduct(prod.description);
        setImageProduct(prod.image);
        setCodePromosProduct(prod.codePromo);
        setCodeCategorie(prod.idCategory.codeCategorie);

        setProduitModifier({
            id: numProduct,
            nom: nomProduct,
            stock: stockPoduct,
            prix: prixProduct,
            description: descriptionProduct,
            image: imageProduct,
            codePromo: codePromosProduct,
            codeCategory: codeCategorie,
        });
        document.getElementById("edit-drawer").checked = true;
    };

    // supression direct makany am BD
    const SupprimerProduit = async () => {
        if (!produitASupprimer) return;
        const id = produitASupprimer.id;
        const nom = produitASupprimer.nom;
        try {
            const donnes = await suppProduit(id, nom);
            await fetchProduits();
            setMessage({
                ouvre: true,
                texte: `Le produit "${nom}" a été supprimé avec succès.`,
                statut: "success",
            });
            setOpen(true);
        } catch (error) {
            console.error("Erreur de suppression :", error);
            setMessage({
                ouvre: true,
                texte: `Erreur lors de la suppression du produit "${nom}".`,
                statut: "error",
            });
        } finally {
            setproduitASupprimer(null);
            setOpen(true);
        }
    };

    // modification direct maken am BD
    const ModifierProduitDB = async (e) => {
        e.preventDefault();

        if (
            numProduct === "" ||
            nomProduct === "" ||
            stockPoduct === "" ||
            prixProduct === "" ||
            descriptionProduct === "" ||
            imageProduct === "" ||
            codePromosProduct === "" ||
            codeCategorie === ""
        ) {
            setMessage({
                ouvre: true,
                texte: "Le Champ vide n'est pas autorisé",
                statut: "warning",
            });
        }
        const Produit = {
            id: numProduct,
            nom: nomProduct,
            stock: stockPoduct,
            prix: prixProduct,
            description: descriptionProduct,
            image: imageProduct,
            codePromo: codePromosProduct,
            codeCategory: codeCategorie,
        };
        console.log(Produit);
        try {
            const donnes = await UpdateProduit(Produit);
            console.log("resultat: OK");
            setMessage({
                ouvre: true,
                texte: donnes.message,
                statut: donnes.statut,
            });
            console.log(donnes.produit);
            setOpen(true);
            await fetchProduits();
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

    //fonction fermeture Modal
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    // fonction fermerture Drawer
    const closeDrawer = () => {
        document.getElementById("edit-drawer").checked = false;
        setProduitModifier(null);
    };

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
        <div className="drawer drawer-end min-h-screen">
            {/* Checbox qui gerer la fermeture de Drawer */}
            <input
                id="edit-drawer"
                type="checkbox"
                className="drawer-toggle"
            />
            {/* Contenu de la page */}
            <div className="drawer-content flex flex-col gap-1">
                {/* Modale et bouton flottant */}
                <div>
                    <Dialogue
                        id="all"
                        titre="Suppression"
                        texte={
                            produitASupprimer
                                ? `Voulez-vous vraiment supprimer le produit "${produitASupprimer.nom}" définitivement ?`
                                : "Êtes-vous sûr de vouloir supprimer cet élément ?"
                        }
                        onDelete={SupprimerProduit}
                    />
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

                {/* contenu de la page */}
                <div className="flex w-full justify-between">
                    {/* Section Filtres Catégorie - NOUVELLE APPEARANCE */}
                    <div className="w-1/5 gap-y-4 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
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
                                        <div className={`p-2 rounded-full ${
                                            filtreCat === "Tous" 
                                                ? "bg-blue-100 dark:bg-blue-800" 
                                                : "bg-gray-100 dark:bg-gray-700"
                                        }`}>
                                            <HiOutlineChevronDoubleRight className={
                                                filtreCat === "Tous" 
                                                    ? "text-blue-600 dark:text-blue-300" 
                                                    : "text-gray-500 dark:text-gray-400"
                                            } />
                                        </div>
                                        <span className="font-medium">Tous les produits</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        filtreCat === "Tous"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                    }`}>
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
                                                    <div className={`p-2 rounded-full ${
                                                        filtreCat === liste.codeCategorie 
                                                            ? "bg-blue-100 dark:bg-blue-800" 
                                                            : "bg-gray-100 dark:bg-gray-700"
                                                    }`}>
                                                        <BiSolidCategoryAlt className={
                                                            filtreCat === liste.codeCategorie 
                                                                ? "text-blue-600 dark:text-blue-300" 
                                                                : "text-gray-500 dark:text-gray-400"
                                                        } />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium block">{liste.libelleCategorie}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {liste.nbrProduit} produit{liste.nbrProduit > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                {filtreCat === liste.codeCategorie && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section Produits */}
                    <div className="flex w-4/5 flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
                        {totalFiltre > 0 ? (
                            produitsFiltres.map((ParCat) => (
                                <div
                                    key={ParCat.libelle}
                                    className={cn("sidebar-group")}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {ParCat.libelle}
                                        </p>
                                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                            {ParCat.produits.length} produit{ParCat.produits.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
                                        <div className="grid grid-cols-1 place-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {ParCat.produits.map((data) => (
                                                <div key={data.id}>
                                                    <Card
                                                        id={data.id}
                                                        img={data.image}
                                                        titre={data.nom}
                                                        stock={data.stock}
                                                        prix={data.prix}
                                                        categorie={ParCat}
                                                        produit={data}
                                                        onDelete={supprimer}
                                                        onUpdate={modiifier}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-screen flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <span className="loading-xl loading loading-dots text-blue-600"></span>
                                        <span>Chargement des Produits...</span>
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
                                                    Aucun Produit correspond à <span className="font-bold">{searchTerm}</span>{" "}
                                                </p>
                                            ) : (
                                                `Aucun Produit trouvé pour le moment.`
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Drawer:  Formulaire de modification */}
            <div className="drawer-side z-50">
                <label
                    htmlFor="edit-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <div className="min-h-full w-[400px] bg-slate-50 p-6 text-base-content dark:bg-base-100">
                    {produitModifier ? (
                        <form onSubmit={ModifierProduitDB}>
                            <h2 className="mb-3 flex flex-row items-center justify-center gap-2 text-xl font-bold text-accent">
                                <AiOutlineProduct />
                                <span>Modification d'un Produit</span>
                            </h2>
                            <div className="mb-6">
                                <InputText
                                    IconComponent={NotepadText}
                                    placeholder="Nom du produit..."
                                    limite="Caractre speciaux n'est pas autorisé"
                                    title="Labelle"
                                    value={nomProduct}
                                    onChange={setNomProduct}
                                />
                                <div className="flex flex-row items-center justify-start gap-6">
                                    <InputText
                                        type="number"
                                        IconComponent={RiNumbersFill}
                                        placeholder="100..."
                                        limite="Valeur positif"
                                        title="Stock"
                                        value={stockPoduct}
                                        onChange={setStockPoduct}
                                    />
                                    <InputText
                                        type="number"
                                        IconComponent={FaSackDollar}
                                        placeholder="8000...."
                                        limite="Valeur positif"
                                        title="Prix"
                                        value={prixProduct}
                                        onChange={setPrixProduct}
                                    />
                                </div>
                                <label className="mb-5 w-full items-center justify-center">
                                    <div className="label">
                                        <span className="label-text text-gray-800 dark:text-slate-300">Descriprion</span>
                                    </div>
                                    <textarea
                                        value={descriptionProduct}
                                        onChange={(e) => setDescriptionProduct(e.target.value)}
                                        className="textarea textarea-bordered h-[65px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
                                        placeholder="Décrire plus d'information sur ce produit..."
                                    ></textarea>
                                </label>
                                <div className="mb-3 flex flex-row items-center justify-start gap-6 p-3">
                                    <UploadImage
                                        img={imageProduct}
                                        onImageChange={(file) => {
                                            setImageProduct(file.name);
                                            console.log("Taloha : ", imageProduct);
                                            console.log("Vaovao : ", file.name);
                                        }}
                                    />

                                    <div className="flex flex-col items-center justify-start gap-2">
                                        <InputText
                                            type="text"
                                            IconComponent={MdOutlineStar}
                                            placeholder="JP202..."
                                            limite="Valeur positif"
                                            title="Code Promos"
                                            value={codePromosProduct}
                                            onChange={setCodePromosProduct}
                                        />
                                        <InputText
                                            type="text"
                                            IconComponent={BiSolidCategoryAlt}
                                            placeholder="CAT000..."
                                            limite="Valeur positif"
                                            title="Code Catégorie"
                                            active="true"
                                            disabled
                                            saufTitre
                                            value={codeCategorie}
                                            onChange={setCodeCategorie}
                                        />
                                    </div>
                                </div>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-gray-800 dark:text-slate-300">Dans quel Catégoie de Produit ?</legend>
                                    <select
                                        value={codeCategorie}
                                        onChange={(e) => setCodeCategorie(e.target.value)}
                                        className="select mt-2 w-full border-slate-300 bg-white text-black dark:border-slate-500 dark:bg-[rgb(15,19,31)] dark:text-white"
                                    >
                                        {categorieTab.map((grp) => (
                                            <option
                                                key={grp.codeCategorie}
                                                value={grp.codeCategorie}
                                            >
                                                {grp.libelleCategorie}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                            </div>
                            <div className="mt-6 flex w-full flex-row justify-end gap-4 px-2">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="btn btn-error btn-outline w-1/2"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-accent btn-outline w-1/2"
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

export default ProduitPage;

// import Dialogue from "@/Admin/components/Dialogue";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { ProduitGroupe, suppProduit, UpdateProduit } from "@/services/produitService";
// import { CategorieListe } from "../../../services/CategorieService";
// import { HiOutlineChevronDoubleRight } from "react-icons/hi";
// import { cn } from "../../utils/cn";
// import Card from "../../../components/Card";
// import { useSearch } from "../../contexts/SearchContext";
// import { InputText } from "@/components/InputGrp";
// import { UploadImage } from "@/components/UploadImage";
// import React, { useEffect, useState, useCallback } from "react";
// import { Construction, SquarePen, NotepadText } from "lucide-react";
// import { FaSackDollar } from "react-icons/fa6";
// import { RiNumbersFill } from "react-icons/ri";
// import { MdOutlineStar } from "react-icons/md";
// import { BiSolidCategoryAlt } from "react-icons/bi";
// import { AiOutlineProduct } from "react-icons/ai";
// import ListeSimple from "@/components/ListeSimple";
// const Filtres = {
//     TOUS: "Tous",
//     DERNIER_A_JOUR: "Dernier à Jour",
//     ALPHABETIQUE: "Alphabetique",
//     CATEGORIE: "Categorie",
// };

// const ProduitPage = () => {
//     const { searchTerm, setFiltreCat, filtreCat, filterValue, setFilterValue, setSearchTerm, filtreStock,setFiltreStock } = useSearch();
//     const [totalFiltre, setTotalFiltre] = useState(0);
//     const [ProduitTab, setProduitTab] = useState([]);
//     const [categorieTab, setCategorieTab] = useState([]);
//     const [produitsFiltres, setProduitFiltres] = useState([]);
//     const [produitASupprimer, setproduitASupprimer] = useState(null);
//     const [rupture, setRupture] = useState(ProduitTab.filter((product) => product.stockProduit < 5).length);
//     const [vide, setVide] = useState(ProduitTab.filter((product) => product.stockProduit === 0).length);
//     const [open, setOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [loadCategorie, setLoadCategorie] = useState(false);
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });

//     var titre = "";
//     //Donner ampidirana am le formulaire Drawer
//     const [produitModifier, setProduitModifier] = useState(null);
//     const [numProduct, setNumProduct] = useState("");
//     const [filtreCategorie, setFiltreCategorie] = useState([]);
//     const [nomProduct, setNomProduct] = useState("");
//     const [stockPoduct, setStockPoduct] = useState("");
//     const [descriptionProduct, setDescriptionProduct] = useState("");
//     const [prixProduct, setPrixProduct] = useState("");
//     const [imageProduct, setImageProduct] = useState(null);
//     const [codePromosProduct, setCodePromosProduct] = useState("");
//     const [codeCategorie, setCodeCategorie] = useState("");

//     // chargement des produit
//     const fetchProduits = useCallback(async () => {
//         setLoading(true);
//         try {
//             const donnes = await ProduitGroupe();
//             setProduitTab([...donnes]);
//         } catch (error) {
//             console.error("Erreur de récupération :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message,
//                 statut: "error",
//             });
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     //chargement de categorie
//     const fetchCategories = useCallback(async () => {
//         setLoadCategorie(true);
//         try {
//             const donnes = await CategorieListe();
//             if (donnes.data) {
//                 setCategorieTab(donnes.data);
//                 setFiltreCategorie(donnes.data);
//             } else {
//                 setCategorieTab([]);
//                 setFiltreCategorie([]);
//             }
//         } catch (error) {
//             console.error("Erreur de récupération :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message,
//                 statut: "error",
//             });
//         } finally {
//             setLoadCategorie(false);
//         }
//     }, []);

//     // useEffect pour le chargement de produit et categorie
//     useEffect(() => {
//         fetchProduits();
//         fetchCategories();
//         setSearchTerm("");
//         setFilterValue("Tous");
//     }, []);

//     // filtrage d'affichage (recherche et triage)
//     useEffect(() => {
//         let resultat = [...ProduitTab];
//         let finalProduitsAffiches;

//         //filtre par Recherche
//         if (searchTerm) {
//             const terme = searchTerm.toLowerCase();
//             resultat = resultat
//                 .map((categorie) => {
//                     const produitsFiltres = categorie.produits.filter(
//                         (produit) => produit.nom.toLowerCase().includes(terme), // includes(): nom produit mis an lay terme
//                     );

//                     return {
//                         ...categorie,
//                         produits: produitsFiltres,
//                     };
//                 })
//                 .filter((vide) => vide.produits.length > 0); //ignorer les catergorie qui n'ont pas de produit associer
//         }

//         if (filtreCat && filtreCat !== Filtres.TOUS) {
//             // Filtre par code catégorie
//             resultat = resultat.filter((categorie) => categorie.codeCategorie === filtreCat);
//         }

//         if (filterValue === Filtres.TOUS || filterValue === Filtres.ALPHABETIQUE || filterValue === Filtres.DERNIER_A_JOUR) {
//             let produitsNonGroupés = resultat.flatMap((groupe) => groupe.produits);
//             let libelleAffiche = "Tous les produits";

//             switch (filterValue) {
//                 case Filtres.ALPHABETIQUE:
//                     produitsNonGroupés.sort((a, b) => a.nom.localeCompare(b.nom));
//                     libelleAffiche = "Résultats triés par ordre alphabétique";
//                     break;

//                 case Filtres.DERNIER_A_JOUR:
//                     produitsNonGroupés.sort((a, b) => {
//                         const dateA = new Date(a.dateMisAJourProduit);
//                         const dateB = new Date(b.dateMisAJourProduit);
//                         return dateB - dateA;
//                     });
//                     libelleAffiche = "Résultats triés par date de mise à jour";
//                     break;

//                 case Filtres.TOUS:
//                 default:
//                     produitsNonGroupés.sort((a, b) => a.nom.localeCompare(b.nom));
//                     break;
//             }
//             finalProduitsAffiches = [
//                 {
//                     codeCategorie: "Tsisy ee",
//                     libelle: libelleAffiche,
//                     produits: produitsNonGroupés,
//                 },
//             ];
//         } else {
//             let resultatTri = resultat.map((groupe) => {
//                 let produitsTriés = [...groupe.produits];
//                 produitsTriés.sort((a, b) => a.nom.localeCompare(b.nom));
//                 return { ...groupe, produits: produitsTriés };
//             });
//             finalProduitsAffiches = resultatTri;
//         }


//         if (filtreStock && filtreStock !== "Tous"){
//             let resultats = resultat
//                 .map((categorie) => {
//                     const produitsFiltres = categorie.produits.filter(
//                         (produit) =>{
//                             switch (filtreStock) {
//                                 case "enStock":
//                                     return produit.stock > 0;
//                                 case "rupture":
//                                     return produit.stock === 0;
//                                 case "alerte":
//                                     produit.stock <= 10 && produit.stock > 0;
//                                 default:
//                                     return true;
//                             }
//                         }, 
//                     );

//                     return {
//                         ...categorie,
//                         produits: produitsFiltres,
//                     };
//                 });
//                 resultat = resultats.filter((vide) => vide.produits.length > 0);
//                 console.log("filtreStock: ",resultat)
//         }

//         const nouveauTotal = finalProduitsAffiches.reduce((total, groupe) => {
//             return total + groupe.produits.length;
//         }, 0);
//         setProduitFiltres(finalProduitsAffiches);
//         setTotalFiltre(nouveauTotal);
//     }, [ProduitTab, searchTerm, filterValue, filtreCat,filtreStock]);

//     //fonctoin preparation pour le modal suppression
//     const supprimer = (idProduit, nomProduit) => {
//         setproduitASupprimer({ id: idProduit, nom: nomProduit });
//         document.getElementById("all").showModal();
//     };

//     //fonction preparation pour le formulaire drawer
//     const modiifier = (cat, prod) => {
//         titre = prod.nom;
//         setNumProduct(prod.id);
//         setNomProduct(prod.nom);
//         setStockPoduct(prod.stock);
//         setPrixProduct(prod.prix);
//         setDescriptionProduct(prod.description);
//         setImageProduct(prod.image);
//         setCodePromosProduct(prod.codePromo);
//         setCodeCategorie(prod.idCategory.codeCategorie);

//         setProduitModifier({
//             id: numProduct,
//             nom: nomProduct,
//             stock: stockPoduct,
//             prix: prixProduct,
//             description: descriptionProduct,
//             image: imageProduct,
//             codePromo: codePromosProduct,
//             codeCategory: codeCategorie,
//         });
//         document.getElementById("edit-drawer").checked = true;
//     };

//     // supression direct makany am BD
//     const SupprimerProduit = async () => {
//         if (!produitASupprimer) return;
//         const id = produitASupprimer.id;
//         const nom = produitASupprimer.nom;
//         try {
//             const donnes = await suppProduit(id, nom);
//             await fetchProduits();
//             setMessage({
//                 ouvre: true,
//                 texte: `Le produit "${nom}" a été supprimé avec succès.`,
//                 statut: "success",
//             });
//             setOpen(true);
//         } catch (error) {
//             console.error("Erreur de suppression :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: `Erreur lors de la suppression du produit "${nom}".`,
//                 statut: "error",
//             });
//         } finally {
//             setproduitASupprimer(null);
//             setOpen(true);
//         }
//     };

//     // modification direct maken am BD
//     const ModifierProduitDB = async (e) => {
//         e.preventDefault();

//         if (
//             numProduct === "" ||
//             nomProduct === "" ||
//             stockPoduct === "" ||
//             prixProduct === "" ||
//             descriptionProduct === "" ||
//             imageProduct === "" ||
//             codePromosProduct === "" ||
//             codeCategorie === ""
//         ) {
//             setMessage({
//                 ouvre: true,
//                 texte: "Le Champ vide n'est pas autorisé",
//                 statut: "warning",
//             });
//         }
//         const Produit = {
//             id: numProduct,
//             nom: nomProduct,
//             stock: stockPoduct,
//             prix: prixProduct,
//             description: descriptionProduct,
//             image: imageProduct,
//             codePromo: codePromosProduct,
//             codeCategory: codeCategorie,
//         };
//         console.log(Produit);
//         try {
//             const donnes = await UpdateProduit(Produit);
//             console.log("resultat: OK");
//             setMessage({
//                 ouvre: true,
//                 texte: donnes.message,
//                 statut: donnes.statut,
//             });
//             console.log(donnes.produit);
//             setOpen(true);
//             await fetchProduits();
//         } catch (error) {
//             console.error("Erreur de modification :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message,
//                 statut: "error",
//             });
//             setOpen(true);
//         }
//         closeDrawer();
//     };

//     //fonction fermeture Modal
//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     // fonction fermerture Drawer
//     const closeDrawer = () => {
//         document.getElementById("edit-drawer").checked = false;
//         setProduitModifier(null);
//     };

//     const AffcheProduit = (codeCategorie) => {
//         setFiltreCat(codeCategorie);
//     };

//     const getItemStyle = (code) => {
//         const isSelected = filtreCat === code;
//         return {
//             className: `
//                 list-row m-2 flex w-full cursor-pointer items-center justify-start gap-6 p-2 
//                 transition-all duration-300 ease-in-out
//                 hover:bg-blue-50 hover:dark:bg-blue-900/20 
//                 ${
//                     isSelected
//                         ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-sm text-blue-600 dark:text-blue-400  font-bold"
//                         : "hover:divide-y hover:divide-y-reverse"
//                 }
//             `,
//         };
//     };

//     return (
//         <div className="drawer drawer-end min-h-screen">
//             {/* Checbox qui gerer la fermeture de Drawer */}
//             <input
//                 id="edit-drawer"
//                 type="checkbox"
//                 className="drawer-toggle"
//             />
//             {/* Contenu de la page */}
//             <div className="drawer-content flex flex-col gap-1">
//                 {/* Modale et bouton flottant */}
//                 <div>
//                     <Dialogue
//                         id="all"
//                         titre="Suppression"
//                         texte={
//                             produitASupprimer
//                                 ? `Voulez-vous vraiment supprimer le produit "${produitASupprimer.nom}" définitivement ?`
//                                 : "Êtes-vous sûr de vouloir supprimer cet élément ?"
//                         }
//                         onDelete={SupprimerProduit}
//                     />
//                     {message.ouvre && (
//                         <Snackbar
//                             open={open}
//                             autoHideDuration={5000}
//                             onClose={handleClose}
//                         >
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

//                 {/* contenu de la page */}
//                 <div className="flex w-full justify-between">
//                     <div className="w-1/5 gap-y-4 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
//                         <ul className="list bg-transparent text-black dark:text-white">
//                             {/* Élément "Tous" */}
//                             <li
//                                 key="tous"
//                                 onClick={() => AffcheProduit("Tous")}
//                                 {...getItemStyle("Tous")}
//                             >
//                                 <div>
//                                     <HiOutlineChevronDoubleRight />
//                                 </div>
//                                 <div className={filtreCat === "Tous" ? "text-lg transition-all duration-300" : ""}>Tous</div>
//                             </li>

//                             {loadCategorie ? (
//                                 <li
//                                     key="charge"
//                                     className="flex space-x-2 p-2"
//                                 >
//                                     <span className="loading-xl loading loading-dots text-blue-600"></span>
//                                     <span>Chargement...</span>
//                                 </li>
//                             ) : (
//                                 filtreCategorie
//                                     .filter((liste) => liste.nbrProduit > 0)
//                                     .map((liste) => (
//                                         <ListeSimple
//                                             key={liste.codeCategorie}
//                                             labelle={liste.libelleCategorie}
//                                             categorie={liste}
//                                             AffcheProduit={AffcheProduit}
//                                             isSelected={filtreCat === liste.codeCategorie}
//                                         />
//                                     ))
//                             )}
//                         </ul>
//                     </div>
//                     <div className="flex w-4/5 flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
//                         {totalFiltre > 0 ? (
//                             produitsFiltres.map((ParCat) => (
//                                 <div
//                                     key={ParCat.libelle}
//                                     className={cn("sidebar-group")}
//                                 >
//                                     <p className="overflow-hidden text-ellipsis text-sm font-medium text-slate-600 dark:text-slate-400">
//                                         {ParCat.libelle} ({filterValue === "Categorie" ? ParCat.produits.length : totalFiltre})
//                                     </p>
//                                     <div className="overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:_thin]">
//                                         <div className="grid grid-cols-1 place-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                                             {ParCat.produits.map((data) => (
//                                                 <div key={data.id}>
//                                                     <Card
//                                                         id={data.id}
//                                                         img={data.image}
//                                                         titre={data.nom}
//                                                         stock={data.stock}
//                                                         prix={data.prix}
//                                                         categorie={ParCat}
//                                                         produit={data}
//                                                         onDelete={supprimer}
//                                                         onUpdate={modiifier}
//                                                     />
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             <div className="flex h-screen flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
//                                 {loading ? (
//                                     <div className="flex flex-row items-center justify-center gap-2">
//                                         <span className="loading-xl loading loading-dots text-blue-600"></span>
//                                         <span>Chargement des Produits...</span>
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div>
//                                             <Construction
//                                                 strokeWidth={1}
//                                                 className="h-40 w-40"
//                                             />
//                                         </div>
//                                         <p className="text-sm">
//                                             {searchTerm ? (
//                                                 <p>
//                                                     {" "}
//                                                     Aucun Produit correspond à <span className="font-bold">{searchTerm}</span>{" "}
//                                                 </p>
//                                             ) : (
//                                                 `Aucun Produit trouvé pour le moment.`
//                                             )}
//                                         </p>
//                                     </>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             {/* Drawer:  Formulaire de modification */}
//             <div className="drawer-side z-50">
//                 <label
//                     htmlFor="edit-drawer"
//                     aria-label="close sidebar"
//                     className="drawer-overlay"
//                 ></label>
//                 <div className="min-h-full w-[400px] bg-slate-50 p-6 text-base-content dark:bg-base-100">
//                     {produitModifier ? (
//                         <form onSubmit={ModifierProduitDB}>
//                             <h2 className="mb-3 flex flex-row items-center justify-center gap-2 text-xl font-bold text-accent">
//                                 <AiOutlineProduct />
//                                 <span>Modification d'un Produit</span>
//                             </h2>
//                             <div className="mb-6">
//                                 <InputText
//                                     IconComponent={NotepadText}
//                                     placeholder="Nom du produit..."
//                                     limite="Caractre speciaux n'est pas autorisé"
//                                     title="Labelle"
//                                     value={nomProduct}
//                                     onChange={setNomProduct}
//                                 />
//                                 <div className="flex flex-row items-center justify-start gap-6">
//                                     <InputText
//                                         type="number"
//                                         IconComponent={RiNumbersFill}
//                                         placeholder="100..."
//                                         limite="Valeur positif"
//                                         title="Stock"
//                                         value={stockPoduct}
//                                         onChange={setStockPoduct}
//                                     />
//                                     <InputText
//                                         type="number"
//                                         IconComponent={FaSackDollar}
//                                         placeholder="8000...."
//                                         limite="Valeur positif"
//                                         title="Prix"
//                                         value={prixProduct}
//                                         onChange={setPrixProduct}
//                                     />
//                                 </div>
//                                 <label className="mb-5 w-full items-center justify-center">
//                                     <div className="label">
//                                         <span className="label-text text-gray-800 dark:text-slate-300">Descriprion</span>
//                                     </div>
//                                     <textarea
//                                         value={descriptionProduct}
//                                         onChange={(e) => setDescriptionProduct(e.target.value)}
//                                         className="textarea textarea-bordered h-[65px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
//                                         placeholder="Décrire plus d'information sur ce produit..."
//                                     ></textarea>
//                                 </label>
//                                 <div className="mb-3 flex flex-row items-center justify-start gap-6 p-3">
//                                     <UploadImage
//                                         img={imageProduct}
//                                         onImageChange={(file) => {
//                                             setImageProduct(file.name);
//                                             console.log("Taloha : ", imageProduct);
//                                             console.log("Vaovao : ", file.name);
//                                         }}
//                                     />

//                                     <div className="flex flex-col items-center justify-start gap-2">
//                                         <InputText
//                                             type="text"
//                                             IconComponent={MdOutlineStar}
//                                             placeholder="JP202..."
//                                             limite="Valeur positif"
//                                             title="Code Promos"
//                                             value={codePromosProduct}
//                                             onChange={setCodePromosProduct}
//                                         />
//                                         <InputText
//                                             type="text"
//                                             IconComponent={BiSolidCategoryAlt}
//                                             placeholder="CAT000..."
//                                             limite="Valeur positif"
//                                             title="Code Catégorie"
//                                             active="true"
//                                             disabled
//                                             saufTitre
//                                             value={codeCategorie}
//                                             onChange={setCodeCategorie}
//                                         />
//                                     </div>
//                                 </div>
//                                 <fieldset className="fieldset">
//                                     <legend className="fieldset-legend text-gray-800 dark:text-slate-300">Dans quel Catégoie de Produit ?</legend>
//                                     <select
//                                         value={codeCategorie}
//                                         onChange={(e) => setCodeCategorie(e.target.value)}
//                                         className="select mt-2 w-full border-slate-300 bg-white text-black dark:border-slate-500 dark:bg-[rgb(15,19,31)] dark:text-white"
//                                     >
//                                         {categorieTab.map((grp) => (
//                                             <option
//                                                 key={grp.codeCategorie}
//                                                 value={grp.codeCategorie}
//                                             >
//                                                 {grp.libelleCategorie}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </fieldset>
//                             </div>
//                             <div className="mt-6 flex w-full flex-row justify-end gap-4 px-2">
//                                 <button
//                                     type="button"
//                                     onClick={closeDrawer}
//                                     className="btn btn-error btn-outline w-1/2"
//                                 >
//                                     Annuler
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="btn btn-accent btn-outline w-1/2"
//                                 >
//                                     Enregistrer
//                                 </button>
//                             </div>
//                         </form>
//                     ) : (
//                         <span className="loading-xl loading loading-dots"></span>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProduitPage;
