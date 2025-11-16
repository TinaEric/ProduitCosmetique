import { InputText } from "@/components/InputGrp";
import React, { useEffect, useState, useCallback,useMemo } from "react";
import { UploadImage ,UploadImages} from "@/components/UploadImage";

import image from "../../../image/image.png";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
    ShieldUser,
    Bell,
    LogOut,
    ChartColumn,
    Home,
    NotepadText,
    Package,
    PackagePlus,
    Settings,
    ShoppingBag,
    UserCheck,
    UserPlus,
    Users,
    Construction,
    SquarePen,
} from "lucide-react";
import { NewProduitDB } from "../../../services/produitService";
import { CategorieListe, NewCategorie } from "../../../services/CategorieService";
import { FaSackDollar } from "react-icons/fa6";
import { RiNumbersFill } from "react-icons/ri";
import { MdOutlineStar } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { AiOutlineProduct } from "react-icons/ai";

const NewProduit = () => {
    const [categorieTab, setCategorieTab] = useState([]);
    const [choix, setChoix] = useState('');
    const [loading, setLoading] = useState(false);
    const [infoCategorie, setInfoCategorie] = useState("");
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    const [nomProd, setNomProd] = useState("");
    const [codePromo, setCodePromo] = useState("");
    const [stockProd, setStockProd] = useState("");
    const [prixProd, setPrixProd] = useState("");
    const [descriptionProd, setDescriptionProd] = useState("");
    const [codeCat, setCodeCat] = useState("");
    const [loadCategorie, setLoadCategorie] = useState(false);
    const [imageFile, setImageFile] = useState(null); 
    const [labelleCategory, setLabelleCategory] = useState('')
    const [descriptionCategory, setDescriptionCategory] = useState('')
    
    const imagePreviewUrl = useMemo(() => {
        if (imageFile instanceof File) {
            return URL.createObjectURL(imageFile);
        }
        return null;
    }, [imageFile]);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);


    const fetchCategories = useCallback(async () => {
        setLoadCategorie(true);
        try {
            const donnes = await CategorieListe();
            
            if (donnes.data){
                console.log("resultat: ", donnes.message);
                setCategorieTab(donnes.data);
                setChoix("option1")
            }else{
                setMessage({
                    ouvre: true,
                    texte: donnes.error,
                    statut: donnes.statut,
                });
                setOpen(true);
                console.log("resultat: ", donnes.error);
                setCategorieTab([])
                setChoix('option2')
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
        fetchCategories();
        setChoix(  categorieTab.length > 0 ? "option2" : "option1")
    }, []);

    useEffect(() => {
        if (categorieTab.length > 0 && codeCat === "") {
            setCodeCat(categorieTab[0].codeCategorie);
        }
        const info = () => {
            const selectedCategory = categorieTab.find(grp => grp.codeCategorie === codeCat);
            setInfoCategorie(selectedCategory ? selectedCategory.descriptionCategorie : "");
       };
       info();
    }, [categorieTab, codeCat]);



    const enregistrePoduit = async (e) => {
      
        const champ = {
            'labelle': nomProd,
            'Code promos' : codePromo ,
            'Stock' : stockProd ,
            'Prix' : prixProd,
            'Description' : descriptionProd ,
            'Image' : imageFile ,
            'Code categorie' : codeCat 
        } 
        for (const [nomDuChamp, valeur] of Object.entries(champ)) {
            if (valeur === null || valeur === undefined || valeur === "" || (typeof valeur === 'string' && valeur.trim() === '')) {
                setMessage({
                    ouvre: true,
                    texte: `Le Champ " ${nomDuChamp} " vide n'eset pas autorisé par le système! `,
                    statut: "warning",
                });
                setOpen(true);
                return;
            }
        }
        const data = {
            nom: nomProd,
            stock: stockProd,
            prix: prixProd,
            description: descriptionProd,
            image: imageFile.name,
            codePromo: codePromo,
            codeCategory: codeCat,
        };
        setLoading(true);
        try {
            const donnes = await NewProduitDB(data);
            console.log("resultat: ",data);
            setMessage({
                ouvre: true,
                texte: donnes.message,
                statut: donnes.statut,
            });
            console.log(donnes.message);
            setOpen(true);
        } catch (error) {
            console.error("Erreur de modification :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
            setOpen(true);
            setLoading(false);
        }
        finally{
            setCodePromo("")
            setImageFile(null)
            setNomProd("")
            setStockProd('')
            setPrixProd("")
            setDescriptionProd("")
            setLoading(false);
        }
    };

    const enregistreCategorie = async (e) => {
        
        const champ = {
            'labelle': nomProd,
            'Code promos' : codePromo ,
            'Stock' : stockProd ,
            'Prix' : prixProd,
            'Description' : descriptionProd ,
            'Image' : imageFile ,
            'labelle Categorie' : labelleCategory,
            'description Categorie' : descriptionCategory
        } 
        for (const [nomDuChamp, valeur] of Object.entries(champ)) {
            if (valeur === null || valeur === undefined || valeur === "" || (typeof valeur === 'string' && valeur.trim() === '')) {
                setMessage({
                    ouvre: true,
                    texte: `Le Champ " ${nomDuChamp} " vide n'est pas autorisé par le système! `,
                    statut: "warning",
                });
                setOpen(true);
                return;
            }
        }

        const data = {
            'labelle' : labelleCategory,
            'description' : descriptionCategory
        }
        setLoading(true);
        try {
            console.log( "donnee: ",data)

            const valeur = await NewCategorie(data);
            var newCode = "";
            if (valeur.data){
                newCode = valeur.data
                console.log("resultat: ", valeur.message);
            }else{
                setMessage({
                    ouvre: true,
                    texte: valeur.error,
                    statut: valeur.statut,
                });
                setOpen(true);
                console.log("resultat: ", valeur.error);
                setLoading(false);
                return;
            }
            const produit = {
                nom: nomProd,
                stock: stockProd,
                prix: prixProd,
                description: descriptionProd,
                image: imageFile.name,
                codePromo: codePromo,
                codeCategory: newCode,
            };
            const donnes = await NewProduitDB(produit);
            console.log("resultat: ",produit);
            setMessage({
                ouvre: true,
                texte: donnes.message,
                statut: donnes.statut,
            });
            console.log(donnes.message);
            await fetchCategories();
            setOpen(true);
        } catch (error) {
            console.error("Erreur de modification :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
            setOpen(true);
            setLoading(false);
        }
        finally{
            setCodePromo("")
            setImageFile(null)
            setNomProd("")
            setStockProd('')
            setPrixProd("")
            setDescriptionProd("")
            setDescriptionCategory("")
            setLabelleCategory("")
            setLoading(false);
        }
    };


    //fonction fermeture Modal
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const handleImageChange = (file) => {
        setImageFile(file);
        console.log("Nouveau fichier sélectionné :", file.name, file);
    };
    return (
        <div className="card">
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
            <form
                action=""
                className="px-14 py-3 "
            >
                <div className="mb-5 flex w-full items-center justify-center gap-2 text-black dark:text-white">
                    <Package className="text-accent"/>
                    <h1 className="text-xl font-semibold ">Créer un nouveau Produit</h1>
                </div>
                <div className="flex flex-col md:flex-col lg:flex-row xl:flex-row items-center justify-between xl:gap-10 lg:gap-10">
                    <InputText
                        IconComponent={NotepadText}
                        placeholder="libelé du produit"
                        limite="Caractre speciaux n'est pas autorisé"
                        title="Nom Produit"
                        value={nomProd}
                        onChange={setNomProd}
                        ClassIcone="text-accent"
                    />
                    <InputText
                        type="text"
                        IconComponent={MdOutlineStar}
                        placeholder="JP202..."
                        limite="Valeur positif"
                        title="Code Promos"
                        value={codePromo}
                        onChange={setCodePromo}
                        ClassIcone="text-accent"
                    />
                </div>
                <div className="flex  flex-col md:flex-row lg:flex-row xl:flex-row  items-center justify-between md:gap-10 xl:gap-10 lg:gap-10">
                    <InputText
                        type="number"
                        IconComponent={RiNumbersFill}
                        placeholder="100..."
                        limite="Valeur positif"
                        title="Stock"
                        value={stockProd}
                        onChange={setStockProd}
                        ClassIcone="text-accent"
                    />
                    <InputText
                        type="number"
                        IconComponent={FaSackDollar}
                        placeholder="8000...."
                        limite="Valeur positif"
                        title="Prix"
                        value={prixProd}
                        onChange={setPrixProd}
                        ClassIcone="text-accent"
                    />
                </div>
                <div className="flex flex-col md:flex-col lg:flex-row xl:flex-row w-full items-center justify-between gap-5">
                    <label className="mb-5 w-full items-center justify-center">
                        <div className="label">
                            <span className="label-text text-gray-800 dark:text-slate-300">Descriprion</span>
                        </div>
                        <textarea
                            value={descriptionProd}
                            onChange={(e) => setDescriptionProd(e.target.value)}
                            className="textarea textarea-bordered h-[100px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
                            placeholder="Décrire plus d'information sur ce produit..."
                        ></textarea>
                    </label>
                    <div className=" flex w-full flex-col items-center justify-start gap-2">
                        
                        <UploadImage
                            img={imagePreviewUrl}
                            onImageChange={handleImageChange}
                            label="Changer la photo"
                            addImageLabel="Ajouter l'image du produit"
                        />
                    </div>
                </div>
                <div className="divider mb-10 flex w-full items-center justify-center gap-2 text-black dark:text-white">
                    <Package className="text-accent" />
                    <h1 className="text-xl font-semibold">A quelle groupe de Catégorie ? </h1>
                </div>

                <div className="mb-5 flex flex-col md:flex-row gap-4 md:gap-0">
                    {/* <div className="flex w-1/2 items-center justify-center gap-4"> */}
                    <div className="flex w-full md:w-1/2 items-center justify-start md:justify-center gap-4">    
                        <input
                            type="radio"
                            value="option1"
                            checked={choix === "option1"}
                            onChange={() => setChoix("option1")}
                            name="radio-9"
                            id="existe"
                            className="radio-accent dark:radio dark:radio-accent"
                            
                        />
                        <label
                            htmlFor="existe"
                            className={choix === "option1" ? "cursor-pointer text-black dark:text-white" : "cursor-pointer dark:text-gray-500"}
                        >
                            Utiliser le Categorie existant
                        </label>
                    </div>
                    {/* <div className="flex w-1/2 items-center justify-center gap-4"> */}
                    <div className="flex w-full md:w-1/2 items-center justify-start md:justify-center gap-4">
                        <input
                            type="radio"
                            value="option2"
                            checked={choix === "option2"}
                            onChange={() => setChoix("option2")}
                            name="radio-9"
                            id="new"
                            className="radio-accent dark:radio dark:radio-accent"
                        />
                        <label
                            htmlFor="new"
                            className={choix === "option2" ? "cursor-pointer text-black dark:text-white" : "cursor-pointer dark:text-gray-500"}
                        >
                            Créer un nouveau Categorie{" "}
                        </label>
                    </div>
                </div>
                <div className="mb-4 flex flex-col md:flex-row w-full justify-normal gap-10">
                {/* <div className="mb-4 flex w-full justify-normal gap-10"> */}
                    <div className="w-full md:w-1/2">
                        <div className="flex w-full flex-col justify-start">
                            <fieldset className="fieldset mb-6 w-full">
                                <legend
                                    className={`fieldset-legend text-gray-900 ${choix !== "option1" ? "text-slate-400 dark:text-slate-600" : ""} dark:text-slate-300`}
                                >
                                    labelle
                                </legend>
                                <select
                                    disabled={choix !== "option1"}
                                    value={codeCat}
                                    onChange={(e) => setCodeCat(e.target.value)}
                                    className={` ${choix !== "option1" ? "rounded-lg border border-slate-200 p-3 text-slate-500 dark:border-slate-700 dark:text-slate-400" : "select border border-slate-400 text-black dark:text-white"} mt-2 w-full border-slate-300 bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
                                >
                                    {loadCategorie || categorieTab.length === 0 ? (
                                        <option className="font-gothic text-red-600">
                                            Aucune Categorie Trouvé pour le moment....
                                        </option>
                                    ) : (
                                        categorieTab.map((grp) => (
                                            <option
                                                key={grp.codeCategorie}
                                                value={grp.codeCategorie}
                                            >
                                                {grp.libelleCategorie}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </fieldset>
                            <label className="mb-5 w-full items-center justify-center">
                                <div className="label">
                                    <span
                                        className={`label-text text-gray-900 ${choix !== "option1" ? "text-slate-400 dark:text-slate-600" : ""} dark:text-slate-300`}
                                    >
                                        Plus d'information
                                    </span>
                                </div>
                                <div
                                    className={`textarea h-[100px] ${choix !== "option1" ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-300"} bg-[#f9f9f9] text-base dark:bg-[#181f33]`}
                                >
                                    <p>{infoCategorie}</p>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="divider md:divider-horizontal">ou</div>
                    <div className="w-full md:w-1/2">
                        <div className="flex w-full flex-col justify-start">
                            <InputText
                                IconComponent={NotepadText}
                                placeholder="Type de Categoorie..."
                                limite="Caractre speciaux n'est pas autorisé"
                                title="Type de Catégorie"
                                value={labelleCategory}
                                onChange={setLabelleCategory}
                                disabled={choix !== "option2"}
                                className={`${choix !== "option2" ? "text-slate-500 dark:text-slate-500" : "text-black dark:text-white"} `}
                            />
                            <label className="mb-5 w-full items-center justify-center">
                                <div className="label">
                                    <span
                                        className={`label-text text-gray-900 ${choix !== "option2" ? "text-slate-400 dark:text-slate-600" : ""} dark:text-slate-300`}
                                    >
                                        Descriprion
                                    </span>
                                </div>
                                <textarea
                                    value={descriptionCategory} 
                                    onChange={(e) => setDescriptionCategory(e.target.value)}  
                                    disabled={choix !== "option2"}
                                    className={`h-[100px] w-full ${choix !== "option2" ? "rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-500 dark:border-slate-800 dark:text-slate-500" : "textarea textarea-bordered border border-slate-500 dark:border-slate-600"} bg-white text-base text-black focus:border-blue-600 dark:border-slate-500 dark:bg-transparent dark:text-white`}
                                    placeholder="Décrire plus d'information sur ce produit..."
                                ></textarea>
                            </label>
                        </div>
                    </div>
                </div>

                {/* button */}
                <div className="flex w-full items-center justify-end">
                    {choix === "option1" ? (
                        <button
                            type="button"
                            onClick={() => enregistrePoduit()}
                            className="btn btn-accent btn-outline w-1/3"
                        >
                             {loading ? ( 
                                    <div className="flex flex-row justify-center items-center gap-2">
                                        <span className="loading loading-spinner text-white"></span>
                                        <span>Enregistrement en cours...</span></div>
                                 ) : "Enregistrer"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => enregistreCategorie()}
                            className="btn btn-accent btn-outline w-1/3"
                        >
                                {loading ? ( 
                                    <div className="flex flex-row justify-center items-center gap-2">
                                        <span className="loading loading-spinner text-white"></span>
                                        <span>Enregistrement en cours...</span></div>
                                 ) : "Enregistrer"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default NewProduit;
