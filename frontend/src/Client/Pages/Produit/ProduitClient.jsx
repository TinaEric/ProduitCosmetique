// import Dialogue from "@/Admin/components/Dialogue";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { ProduitGroupe,suppProduit,UpdateProduit } from "@/services/produitService";
import { CategorieListe } from "../../../services/CategorieService";
import { cn } from "../../../Admin/utils/cn";
import CardClient from "../../../components/CardClient";
import { useNavbar } from "../../context/NavbarContext";
import { usePanier } from "@/Client/context/PanierContext";
import { InputText } from '@/components/InputGrp';
import { UploadImage } from '@/components/UploadImage';
import React, { useEffect, useState, useCallback ,useRef} from "react";
import { Construction,SquarePen ,NotepadText} from "lucide-react";
import { FaSackDollar,FaCartShopping } from "react-icons/fa6";
import { RiNumbersFill } from "react-icons/ri";
import { MdOutlineStar } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { AiOutlineProduct } from "react-icons/ai";

const Filtres = {
    TOUS: "Tous",
    DERNIER_A_JOUR: "Dernier à Jour",
    ALPHABETIQUE: "Alphabetique",
    CATEGORIE: "Categorie",
};


const ProduitClient = () => {
    const { searchTerm, filterValue,setFilterValue,setSearchTerm} = useNavbar();
    const {ajouteAuPanier,items} = usePanier()
    const [totalFiltre, setTotalFiltre] = useState(0);
    const [ProduitTab, setProduitTab] = useState([]);
    const [categorieTab, setCategorieTab] = useState([]);
    const [produitsFiltres, setProduitFiltres] = useState([]);
    const [produitASupprimer, setproduitASupprimer] = useState(null);
    const [rupture, setRupture] = useState(ProduitTab.filter((product) => product.stockProduit < 5).length);
    const [vide, setVide] = useState(ProduitTab.filter((product) => product.stockProduit === 0).length);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [produitDetail, setProduitDetail] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
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
     const [nomProduct, setNomProduct] = useState("");
     const [stockPoduct, setStockPoduct] = useState("");
     const [descriptionProduct, setDescriptionProduct] = useState("");
     const [prixProduct,setPrixProduct] = useState("");
     const [imageProduct,setImageProduct] = useState(null);
     const [codePromosProduct, setCodePromosProduct] =useState("");
     const [codeCategorie, setCodeCategorie] = useState("");
 
     // chargement des produit
    const fetchProduits = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await ProduitGroupe();
            if (donnes){
                setProduitTab(donnes);
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
        } finally {
            setLoading(false); 
        }
    }, []);

    //chargement de categorie
    const fetchCategories = useCallback(async () => {
            
        setLoadCategorie(true);
            try {
                const donnes = await CategorieListe();
                if (donnes.data){
                    setCategorieTab(donnes.data);
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
            } finally {
                setLoadCategorie(false); 
            }
        }, []);

    // useEffect pour le chargement de produit et categorie
    useEffect(() => {
        fetchProduits();
        fetchCategories();
        setSearchTerm('');
        setFilterValue('Tous');
    }, []);

  // filtrage d'affichage (recherche et triage)
    useEffect(() => {
        let resultat = [...ProduitTab];
        let finalProduitsAffiches;

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

        // Filtre par catégorie spécifique
        if (filterValue && filterValue !== Filtres.TOUS && filterValue !== Filtres.ALPHABETIQUE && filterValue !== Filtres.DERNIER_A_JOUR) {
            // Filtre par code catégorie
            resultat = resultat.filter(categorie => 
                categorie.codeCategorie === filterValue
            );
        }

        // Application des tris
        if (filterValue === Filtres.ALPHABETIQUE || filterValue === Filtres.DERNIER_A_JOUR || filterValue === Filtres.TOUS) {
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
                    codeCategorie: 'tous',
                    libelle: libelleAffiche,
                    produits: produitsNonGroupés
                },
            ];
        } else {
            // Pour le filtrage par catégorie, on garde la structure groupée
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
        
    }, [ProduitTab, searchTerm, filterValue]);
    
    const afficheInfoProduit = (prod) => {
        ouvrirDetailProduit(prod);
        console.log("produitDetail :",prod)
    };

    const AjouterPanier = (prod) => {
        ajouteAuPanier(prod)
        setMessage({
            ouvre: true,
            texte: `Un produit est ajouté à votre paner`,
            statut: "info",
        });
        setOpen(true);
    }

    //fonction fermeture Modal
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    // fonction fermerture Drawer
    const closeDrawer = () => {
        document.getElementById("info-drawer").checked = false;
        setProduitModifier(null);
    };
        
    // Fonction pour ouvrir le dialogue de détails
    const ouvrirDetailProduit = (prod) => {
        setProduitDetail(prod);
        
        setOpenDetail(true);
       
    };

    // Fonction pour fermer le dialogue
    const fermerDetailProduit = () => {
        setOpenDetail(false);
        setProduitDetail(null);
    };
    return (
        <div className="drawer drawer-end min-h-screen">
            {/* Checbox qui gerer la fermeture de Drawer */}
            <input
                id="info-drawer"
                type="checkbox"
                className="drawer-toggle"
            />
            {/* Contenu de la page */}
            <div className="drawer-content flex flex-col gap-1">
                {/* Modale et bouton flottant */}
                <div>
                   {/* Dialogue de détails du produit */}
                    {openDetail && produitDetail && (
                        <div className="modal modal-open">
                            <div className="modal-box max-w-4xl max-h-[90vh] bg-slate-200 dark:bg-gray-800 overflow-y-auto">
                                {/* Header du dialogue */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Détails du Produit
                                    </h3>
                                    <button 
                                        onClick={fermerDetailProduit}
                                        className="btn btn-sm btn-circle btn-ghost"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Contenu du dialogue */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Image du produit */}
                                    <div className="flex flex-col items-center">
                                        <img 
                                            src={`/image/${produitDetail.image}`} 
                                            alt={produitDetail.nom}
                                            className="w-full h-64 object-cover rounded-lg shadow-lg"
                                        />
                                        <div className="mt-4 flex gap-2">
                                            <span className={`badge ${produitDetail.stock > 5 ? 'badge-success' : produitDetail.stock > 0 ? 'badge-warning' : 'badge-error'}`}>
                                                {produitDetail.stock > 5 ? 'En stock' : produitDetail.stock > 0 ? 'Stock faible' : 'Rupture'}
                                            </span>
                                            <span className="badge badge-info">
                                                {produitDetail.stock} unités
                                            </span>
                                        </div>
                                    </div>

                                    {/* Informations détaillées */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                {produitDetail.nom}
                                            </h4>
                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {produitDetail.prix?.toLocaleString()} Ar
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Description
                                            </h5>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                {produitDetail.description || "Aucune description disponible pour ce produit."}
                                            </p>
                                        </div>

                                        {/* Caractéristiques */}
                                        {/* <div className="grid grid-cols-2 gap-4 w-full">
                                            <div>
                                                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                    Catégorie
                                                </h5>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm w-full">
                                                    <span className="font-bold">{produitDetail.idCategory?.libelleCategorie || "Non spécifiée"} :</span> 
                                                    <span className="italic ml-2 w-full">{produitDetail.idCategory?.descriptionCategorie || "Non spécifiée" }</span>
                                                </p>
                                            </div>
                                         */}
                                        {/* </div> */}
                                        {/* Caractéristiques */}
                                    <div className="w-full">
                                        <div className="mb-4">
                                            <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Catégorie
                                            </h5>
                                            <div className="w-full">
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 w-full">
                                                <span className="font-bold">{produitDetail.idCategory?.libelleCategorie || "Non spécifiée"} : </span> {produitDetail.idCategory?.descriptionCategorie || "Aucune description de catégorie disponible"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                        {/* Dernière mise à jour */}
                                        {produitDetail.dateMisAJourProduit && (
                                            <div>
                                                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                    Dernière mise à jour
                                                </h5>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {new Date(produitDetail.dateMisAJourProduit).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    AjouterPanier(produitDetail);
                                                    fermerDetailProduit();
                                                }}
                                                disabled={produitDetail.stock === 0}
                                                className={`btn flex-1 gap-2  ${
                                                    produitDetail.stock === 0 
                                                        ? 'btn-disabled' 
                                                        : 'btn-accent'
                                                }`}
                                            >
                                                <FaCartShopping
                                                    className=""
                                                    size={20}
                                                />
                                                <span>
                                                    {produitDetail.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                                                </span>
                                                
                                            </button>
                                            <button
                                                onClick={fermerDetailProduit}
                                                className="btn btn-outline btn-error"
                                            >
                                                Fermer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Overlay pour fermer en cliquant à l'extérieur */}
                            <div 
                                className="modal-backdrop" 
                                onClick={fermerDetailProduit}
                            ></div>
                        </div>
                    )}
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
                <div className="flex w-full flex-col gap-y-1 overflow-y-auto overflow-x-hidden [scrollbar-width:_thin]">
                    { totalFiltre > 0 ? (
                         produitsFiltres.map((ParCat) => (
                            <div
                                key={ParCat.libelle}
                                className="sidebar-group"
                                // className={cn("sidebar-group")}
                            >
                                {/* <p className="overflow-hidden text-ellipsis text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {ParCat.libelle} ({ (filterValue === "Categorie") ? (ParCat.produits.length) : totalFiltre})
                                </p> */}
                                <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                    {ParCat.produits.map((data) => (
                                        <div key={data.id} 
                                        >
                                            <CardClient
                                                id={data.id}
                                                img={data.image}
                                                titre={data.nom}
                                                stock={data.stock}
                                                prix={data.prix}
                                                categorie={ParCat}
                                                produit={data}
                                                onInfos={afficheInfoProduit}
                                                addPanier={AjouterPanier}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center h-screen justify-center p-5 text-gray-500 dark:text-gray-500">
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
                                        {searchTerm ? <p> Aucun Produit correspond à <span className="font-bold">{searchTerm}</span> </p>  : `Aucun Produit trouvé pour le moment.`}
                                    </p>
                                </>
                             )} 
                        </div>
                    )}
                </div>

            </div>
            {/* Drawer:  Formulaire de modification */}
            <div className="drawer-side z-50">
                <label
                    htmlFor="info-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={() => console.log(false)}
                ></label>
                <div className="min-h-full w-[400px] bg-slate-50 dark:bg-base-100  p-6 text-base-content">
                    {produitModifier ? (
                        <form >
                            <h2 className="mb-3 text-xl font-bold flex flex-row justify-center items-center gap-2 text-accent">
                                <AiOutlineProduct /> 
                                <span>Modification d'un Produit</span>
                            </h2>
                            <div className="mb-6">

                                <InputText 
                                    IconComponent={NotepadText}
                                    placeholder='Nom du produit...'
                                    limite="Caractre speciaux n'est pas autorisé"
                                    title='Labelle'
                                    value={nomProduct}
                                    onChange={setNomProduct}
                                />
                                <div className="flex flex-row justify-start items-center gap-6">
                                    <InputText 
                                        type="number"
                                        IconComponent={RiNumbersFill}
                                        placeholder='100...'
                                        limite="Valeur positif"
                                        title='Stock'
                                        value={stockPoduct}
                                        onChange={setStockPoduct}
                                    />
                                    <InputText 
                                        type="number"
                                        IconComponent={FaSackDollar}
                                        placeholder='8000....'
                                        limite="Valeur positif"
                                        title='Prix'
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
                                <div className="flex flex-row justify-start items-center gap-6 p-3 mb-3">
                                    <UploadImage
                                        img={imageProduct}
                                        onImageChange={(file) => {
                                            setImageProduct(file.name);
                                            console.log("Taloha : ", imageProduct)
                                            console.log("Vaovao : ", file.name)
                                        }}
                                    />
                                    
                                    <div className="flex flex-col items-center gap-2 justify-start">
                                        <InputText 
                                            type="text"
                                            IconComponent={MdOutlineStar}
                                            placeholder='JP202...'
                                            limite="Valeur positif"
                                            title='Code Promos'
                                            value={codePromosProduct}
                                            onChange={setCodePromosProduct}
                                        />
                                            <InputText 
                                            type="text"
                                            IconComponent={BiSolidCategoryAlt}
                                            placeholder='CAT000...'
                                            limite="Valeur positif"
                                            title='Code Catégorie'
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
                                        className="
                                            select mt-2 w-full border-slate-300 dark:border-slate-500
                                          bg-white dark:bg-[rgb(15,19,31)] text-black dark:text-white 
                                        ">
                                            {categorieTab.map((grp) => (
                                                <option key={grp.codeCategorie} value={grp.codeCategorie}>{grp.libelleCategorie}</option>
                                            ))}
                                    </select>
                                </fieldset>
                                
                            </div>
                            <div className="mt-6 flex w-full flex-row justify-end gap-4 px-2">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="btn btn-outline btn-error w-1/2"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-outline btn-accent w-1/2"
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

export default ProduitClient;
