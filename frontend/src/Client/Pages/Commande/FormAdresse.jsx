
import React, { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useAuth } from "../../../hook/useAuth";
import { getClientAddresses } from "@/services/ClientService";
import FormControl from "@mui/material/FormControl";
import { InputValidate } from "@/components/InputValidate";
import { createCommandePanier ,updateCommandePanier} from "@/services/ClientService";
import { MdLocationOn, MdAddLocation, MdHome, MdBusiness } from "react-icons/md";
import { usePanier } from "@/Client/context/PanierContext";
import { FaMapMarkerAlt } from "react-icons/fa";
import AddressCard from "@/components/AddressCard";
import { Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Button, Checkbox } from "@mui/material";

//Fonction de comparaison de valeur initial et la valeur modifier
function IsChangedData(current, initial) {
    if (!current || !initial) return true;
    
    const livraisonCurent = current.adresseLivraison || {};
    const facturationCurent = current.adresseFacturation || {};
    const livraisonInitial = initial.adresseLivraison || {};
    const facturationInitial = initial.adresseFacturation || {};
    
    const compare = (curr, init) => {
        if (!curr && !init) return false;
        if (!curr || !init) return true;
        
        return (
            curr.id !== init.id ||
            curr.codePostal !== init.codePostal ||
            (curr.labelle || curr.LabelleAdresse) !== (init.labelle || init.LabelleAdresse) || 
            curr.complement !== init.complement ||
            curr.description !== init.description ||
            curr.lot !== init.lot ||
            curr.quartier !== init.quartier ||
            curr.ville !== init.ville 
        ); 
    };
    
    return compare(livraisonCurent, livraisonInitial) || compare(facturationCurent, facturationInitial);
}

const FormAdresse = ({ initialData, onSubmitSuccess }) => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const {items} = usePanier();
    const [data, setData] = useState(
        initialData?.adresseLivraison);
    const [donneesFacturation, setDonneesFacturation] = useState(
        initialData?.adresseFacturation?.estAdresseExistante ? {} : 
            initialData?.adresseFacturation
    );
    const [errors, setErrors] = useState({});
    const [errorInfos, setErrorInfos] = useState(null);
    const [open, setOpen] = useState(false);
    const initial = useRef(initialData)
    // Autres états en français
    const [descriptionAdresse, setDescriptionAdresse] = useState(initialData?.adresseLivraison?.description || "");
    const [adressesClient, setAdressesClient] = useState([]);
    const [chargementAdresses, setChargementAdresses] = useState(false);

    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    

    const [adresseSelectionnee, setAdresseSelectionnee] = useState(
        initialData?.adresseLivraison?.estAdresseExistante && initialData?.adresseLivraison?.id 
            ? initialData.adresseLivraison
            : null
    );
    
    const [utiliserAdresseExistante, setUtiliserAdresseExistante] = useState(
        initialData?.adresseLivraison?.estAdresseExistante || false
    );

    const [utiliserFacturationDifferent, setUtiliserFacturationDifferent] = useState(
        initialData?.AdresseDifferent || false
    );

    const [adresseFacturationSelectionnee, setAdresseFacturationSelectionnee] = useState(
        initialData?.adresseFacturation?.estAdresseExistante && initialData?.adresseFacturation?.id 
            ? initialData.adresseFacturation
            : null
    );

    
    const [utiliserAdresseFacturationExistante, setUtiliserAdresseFacturationExistante] = useState(
        initialData?.adresseFacturation?.estAdresseExistante || false
    );

    const [erreursFacturation, setErreursFacturation] = useState({});

    const [descriptionFacturation, setDescriptionFacturation] = useState(
        initialData?.adresseFacturation?.description || ""
    );
    
   

    const isUserConnected = isAuthenticated;

    useEffect(() => {
        getAdresses();
    }, [isUserConnected, user]);

    useEffect(() => {
        if (initialData && adressesClient.length > 0) {
            if (initialData.adresseLivraison?.estAdresseExistante && initialData.adresseLivraison?.id) {
                const adresseTrouvee = adressesClient.find(adresse => 
                    adresse.id === initialData.adresseLivraison.id
                );
                if (adresseTrouvee) {
                    setAdresseSelectionnee(adresseTrouvee);
                }
            }

            if (initialData.adresseFacturation?.estAdresseExistante && initialData.adresseFacturation?.id) {
                const adresseFacturationTrouvee = adressesClient.find(adresse => 
                    adresse.id === initialData.adresseFacturation.id
                );
                if (adresseFacturationTrouvee) {
                    setAdresseFacturationSelectionnee(adresseFacturationTrouvee);
                }
            }
        }
    }, [initialData, adressesClient]);

    const getAdresses = async () => {
        if (isUserConnected && user.client) {
            setChargementAdresses(true)
            try {
                const reponseAdresses = await getClientAddresses();
                const listeAdresses = reponseAdresses.adresse;
                if (listeAdresses) {
                    setAdressesClient(listeAdresses);
                    
                    if (!initialData && listeAdresses.length > 0) {
                        setUtiliserAdresseExistante(true);
                        setAdresseSelectionnee(listeAdresses[0]);
                        setAdresseFacturationSelectionnee(listeAdresses[0]);
                    }
                    
                    if (initialData) {
                        if (initialData.adresseLivraison?.estAdresseExistante && initialData.adresseLivraison?.id) {
                            const adresseTrouvee = listeAdresses.find(adresse => 
                                adresse.id === initialData.adresseLivraison.id
                            );
                            if (adresseTrouvee) {
                                setAdresseSelectionnee(adresseTrouvee);
                            }
                        }
                        
                        if (initialData.adresseFacturation?.estAdresseExistante && initialData.adresseFacturation?.id) {
                            const adresseFacturationTrouvee = listeAdresses.find(adresse => 
                                adresse.id === initialData.adresseFacturation.id
                            );
                            if (adresseFacturationTrouvee) {
                                setAdresseFacturationSelectionnee(adresseFacturationTrouvee);
                            }
                        }
                    }
                    setChargementAdresses(false)
                }else{
                    setUtiliserAdresseExistante(false)
                    setUtiliserAdresseFacturationExistante(false)
                }
            } catch (erreur) {
                console.log("Erreur de connexion:", erreur);
                setMessage({
                    ouvre: true,
                    texte: `Échec de la connexion. Vérifiez votre connexion.`,
                    statut: "error",
                });
                setOpen(true);
                setChargementAdresses(false)
            }
            finally{
                setChargementAdresses(false)
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
        setErrors((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
    };

    const gererChangementFacturation = (e) => {
        const { name, value } = e.target;
        setDonneesFacturation((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
        setErreursFacturation((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
    };

    const gererSelectionAdresse = (adresse) => {
        setAdresseSelectionnee(adresse);
    };

    const gererSelectionAdresseFacturation = (adresse) => {
        setAdresseFacturationSelectionnee(adresse);
    };

    const gererChangementAdresseExistante = (evenement) => {
        const utiliserExistante = evenement.target.value === "true";
        setUtiliserAdresseExistante(utiliserExistante);

        if (!utiliserExistante) {
            setAdresseSelectionnee(null);
            setData(initialData?.adresseLivraison || {});
        }
    };

    const gererChangementAdresseFacturationExistante = (evenement) => {
        const utiliserExistante = evenement.target.value === "true";
        setUtiliserAdresseFacturationExistante(utiliserExistante);

        if (!utiliserExistante) {
            setAdresseFacturationSelectionnee(null);
            setDonneesFacturation(initialData?.adresseFacturation || {});
        }
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        if (utiliserAdresseExistante && adresseSelectionnee) {
            if (!adresseSelectionnee) {
                tempErrors.adresse = "Veuillez sélectionner une adresse";
                isValid = false;
            }
        } else {
            if (!data.labelle || data.labelle.trim() === "") {
                tempErrors.labelle = "Mentionner le labelle de votre adresse, Ce champ est requis.";
                isValid = false;
            }
            if (!data.ville || data.ville.trim() === "") {
                tempErrors.ville = "Obligatoire, Le nom du ville doit être existe.";
                isValid = false;
            }
            if (!data.codePostal || !/\d+$/.test(data.codePostal)) {
                tempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
                isValid = false;
            }
            if (!data.quartier || data.quartier.trim() === "") {
                tempErrors.quartier = "Nous ne pouvons livré votre produit sans quartier, cette champ est requis.";
                isValid = false;
            }
            if (!data.lot || data.lot.trim() === "") {
                tempErrors.lot = "Obligatoire, c'est important pour nous connaitre votre adresse précis";
                isValid = false;
            }
            if (!descriptionAdresse || descriptionAdresse.trim() === "") {
                setErrorInfos("La description doit contient au moins 4 caractères.");
                isValid = false;
            }
        }

        setErrors(tempErrors);

        if (utiliserFacturationDifferent) {
            let factureTempErrors = {};

            if (utiliserAdresseFacturationExistante && adresseFacturationSelectionnee) {
                if (!adresseFacturationSelectionnee) {
                    factureTempErrors.adresseFacturation = "Veuillez sélectionner une adresse de facturation";
                    isValid = false;
                }
            } else {
                if (!donneesFacturation.labelle || donneesFacturation.labelle.trim() === "") {
                    factureTempErrors.labelle = "Mentionner le labelle de votre adresse de facturation, Ce champ est requis.";
                    isValid = false;
                }
                if (!donneesFacturation.ville || donneesFacturation.ville.trim() === "") {
                    factureTempErrors.ville = "Obligatoire pour la facturation, Le nom du ville doit être existe.";
                    isValid = false;
                }
                if (!donneesFacturation.codePostal || !/\d+$/.test(donneesFacturation.codePostal)) {
                    factureTempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
                    isValid = false;
                }
                if (!donneesFacturation.quartier || donneesFacturation.quartier.trim() === "") {
                    factureTempErrors.quartier = "Le quartier est requis pour la facturation.";
                    isValid = false;
                }
                if (!donneesFacturation.lot || donneesFacturation.lot.trim() === "") {
                    factureTempErrors.lot = "Obligatoire pour la facturation, c'est important pour nous connaitre votre adresse précis";
                    isValid = false;
                }
                if (!descriptionFacturation || descriptionFacturation.trim() === "") {
                    factureTempErrors.description = "La description de l'adresse de facturation doit contient au moins 4 caractères.";
                    isValid = false;
                }
            }

            setErreursFacturation(factureTempErrors);
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
       
        if (validate()) {
            let donneesAdresse;
            // nisafidy tam le adresse efa  ao ve
            if (utiliserAdresseExistante && adresseSelectionnee) {
                donneesAdresse = {
                    adresseLivraison: {
                        ...adresseSelectionnee,
                        estAdresseExistante: true,
                        refAdresse: adresseSelectionnee.id,
                        description: descriptionAdresse,
                    },
                    adresseFacturation: utiliserFacturationDifferent ?  // ni-cocher an le checkbox ve ? (autre adresse pour le facturation ?)
                        (utiliserAdresseFacturationExistante && adresseFacturationSelectionnee ? {   // nisafidy tam le efa  ao ve
                            ...adresseFacturationSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseFacturationSelectionnee.id,
                            description: descriptionFacturation,
                        } : {
                            ...donneesFacturation,
                            estAdresseExistante: false,
                            refAdresse: null,
                            description: descriptionFacturation,
                        }) : {
                            ...adresseSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseSelectionnee.id,
                            description: descriptionAdresse,
                        },
                    AdresseDifferent: utiliserFacturationDifferent
                };
            } else {
                donneesAdresse = {
                    adresseLivraison: {
                        ...data,
                        estAdresseExistante: false,
                        refAdresse: null,
                        description: descriptionAdresse,
                    },
                    adresseFacturation: utiliserFacturationDifferent ? {
                        ...donneesFacturation,
                        estAdresseExistante: false,
                        refAdresse: null,
                        description: descriptionFacturation,
                    } : {
                        ...data,
                        estAdresseExistante: false,
                        description: descriptionAdresse,
                    },
                    AdresseDifferent: utiliserFacturationDifferent
                };
            }
            setLoading(true)
            console.log("livraison current: ",donneesAdresse)
            console.log("livraison initial: ",initialData)
            console.log("Donnes Changer :", IsChangedData(donneesAdresse,initialData)) 
            if(IsChangedData(donneesAdresse,initialData)){
                try {
                    // const panier = JSON.parse(localStorage.getItem("panier")) || items;
                    // if (panier.length > 0) {
                    //     const panierFormat = panier.map((item) => ({
                    //         idProduit: item.id,
                    //         quantite: item.quantite,
                    //     }));
                        const commandeExiste = (localStorage.getItem('RefCommande')) || null
                        console.log('ID: ', commandeExiste)
                        if(commandeExiste){
                            //Mis à jour 
                            const dataCommandeUpdate = {
                                // panier: panierFormat,
                                adresse: donneesAdresse,
                                refCommande : commandeExiste
                            };
                            const response = await updateCommandePanier(dataCommandeUpdate);
                            if (response.data) {
                                console.log("Commande mis à jour avec succès:", response.data);
                                localStorage.setItem('RefCommande', JSON.stringify(response.data.refCommande));
                                localStorage.setItem('DataAdresse',JSON.stringify(donneesAdresse))
                                setMessage({
                                    ouvre: true,
                                    texte: "Votre commande a été mis à jour avec succès.",
                                    statut: "success",
                                });
                                setOpen(true);
                                onSubmitSuccess(donneesAdresse);
                            }else{
                                console.log("Erreur de commande: ",response.error)
                                setMessage({
                                    ouvre: true,
                                    texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer." ,
                                    statut: "error",
                                });
                                setOpen(true);
                            }
                        }else{
                            // Creer nouveau commande
                            const dataCommandeCreate = {
                                // panier: panierFormat,
                                adresse: donneesAdresse
                            };
                            console.log("format Data :" , dataCommandeCreate)
                            const response = await createCommandePanier(dataCommandeCreate);
                            if (response.data) {
                                console.log("Commande créée avec succès:", response.data);
                                localStorage.setItem('RefCommande', response.data.refCommande);
                                localStorage.setItem('DataAdresse',JSON.stringify(donneesAdresse))
                                setMessage({
                                    ouvre: true,
                                    texte: "Votre commande a été créée avec succès.",
                                    statut: "success",
                                });
                                setOpen(true);
                                onSubmitSuccess(donneesAdresse);
                            }else{
                                console.log("Erreur de commande: ",response.error)
                                setMessage({
                                    ouvre: true,
                                    texte: "Erreur lors de la création de la commande. Veuillez réessayer." ,
                                    statut: "error",
                                });
                                setOpen(true);
                            }
                        }

                    // }else{
                    //     setMessage({
                    //         ouvre: true,
                    //         texte:"Votre panier est vide , Veuillez selectionner votre produit commander.",
                    //         statut: "warning",
                    //     });
                    //     setOpen(true);
                    // }
                    setLoading(false)
                } catch (error) {
                    console.error(" Erreur création commande:", error);
                    setMessage({
                        ouvre: true,
                        texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
                        statut: "error",
                    });
                    setOpen(true);
                    setLoading(false)
                }finally{
                    setLoading(false)
                }
            }else{
                onSubmitSuccess(initialData)
            }
        
        }
    };

    
    return (
        <div className="w-full bg-transparent">
            <div>
                {message.ouvre && (
                    <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
                        <Alert onClose={() => setOpen(false)} severity={message.statut} variant="filled" sx={{ width: "100%" }}>
                            {message.texte}
                        </Alert>
                    </Snackbar>
                )}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="flex w-full flex-col px-1">
                {( adressesClient.length > 0) && (
                    <div className="mb-6 flex items-center justify-center gap-4 text-xl">
                        <MdLocationOn className="text-accent" />
                        <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Livraison</span>
                    </div>

                )}

                    {isUserConnected && adressesClient.length > 0 && (
                        <div className="flex w-full items-center justify-center">
                            <FormControl component="fieldset">
                                <RadioGroup
                                    value={utiliserAdresseExistante.toString()}
                                    onChange={gererChangementAdresseExistante}
                                    className="gap-4"
                                >
                                    <div className="w-full rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                        <FormControlLabel
                                            value="true"
                                            control={<Radio />}
                                            label={
                                                <div>
                                                    <Typography className="font-semibold">Utiliser une de mes adresses enregistrées</Typography>
                                                    <Typography variant="body2" className="text-gray-600">
                                                        Choisissez parmi vos adresses existantes
                                                    </Typography>
                                                </div>
                                            }
                                        />

                                        {utiliserAdresseExistante && (
                                            <div className="mx-8 mt-3">
                                                {chargementAdresses ? ( 
                                                    <div className="flex justify-center py-4">
                                                        <div className="loading loading-spinner  loading-xl text-accent"></div>
                                                        <span className="ml-2">Récuperation de vos adresses...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex w-full flex-col items-start justify-center gap-4">
                                                        {adressesClient.map((adresse) => (
                                                            <AddressCard
                                                                key={adresse.id}
                                                                address={adresse}
                                                                isSelected={adresseSelectionnee?.id === adresse.id}
                                                                onSelect={gererSelectionAdresse}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                        <FormControlLabel
                                            value="false"
                                            control={<Radio />}
                                            label={
                                                <div>
                                                    <Typography className="font-semibold">Utiliser une nouvelle adresse</Typography>
                                                    <Typography variant="body2" className="text-gray-600">
                                                        Saisir une nouvelle adresse de livraison
                                                    </Typography>
                                                </div>
                                            }
                                        />
                                    </div>
                                </RadioGroup>
                            </FormControl>
                        </div>
                    )}

                    {!utiliserAdresseExistante && (
                       
                        <div className={`my-3 flex w-full flex-col items-center justify-center py-3 transition-all duration-500 ease-in-out overflow-hidden`}>
                        <div className="mb-4 flex items-center justify-center gap-2 text-lg">
                            <MdLocationOn className="text-accent" />
                            <span className="font-gothic text-black opacity-70 dark:text-white">Nouvelle Adresse de Livraison</span>
                        </div>
                        
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            largeur="2/3"
                            placeholder="Ex: Fianarantsoa..."
                            title="Ville"
                            name="ville"
                            value={data.ville || ""}
                            onChange={(val) => handleChange({ target: { name: "ville", value: val } })}
                            error={!!errors.ville}
                            helperText={errors.ville}
                            ClassIcone="text-accent"
                        />
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            largeur="2/3"
                            placeholder="Ex: 301..."
                            title="Code Postal"
                            name="codePostal"
                            value={data.codePostal || ""}
                            onChange={(val) => handleChange({ target: { name: "codePostal", value: val } })}
                            error={!!errors.codePostal}
                            helperText={errors.codePostal}
                            ClassIcone="text-accent"
                        />
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            largeur="2/3"
                            placeholder="Ex: AV13/3609..."
                            title="Lot d'Adresse"
                            name="lot"
                            value={data.lot || ""}
                            onChange={(val) => handleChange({ target: { name: "lot", value: val } })}
                            error={!!errors.lot}
                            helperText={errors.lot}
                            ClassIcone="text-accent"
                        />
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            largeur="2/3"
                            placeholder="Ex: Imandry..."
                            title="Quartier"
                            name="quartier"
                            value={data.quartier || ""}
                            onChange={(val) => handleChange({ target: { name: "quartier", value: val } })}
                            error={!!errors.quartier}
                            helperText={errors.quartier}
                            ClassIcone="text-accent"
                        />
                       
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            largeur="2/3"
                            optionel
                            placeholder="Ex: Chez moi..."
                            title="Labelle d'Adresse"
                            name="labelle"
                            value={data.labelle  || ""}
                            onChange={(val) => handleChange({ target: { name: "labelle", value: val } })}
                            error={!!errors.labelle}
                            helperText={errors.labelle}
                            ClassIcone="text-accent"
                        />
                        <div className="flex w-full items-center justify-center">
                            <label className="mb-5 w-2/3 items-center justify-center">
                                <div className="label">
                                    <span className={`label-text ${errorInfos ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
                                        Complement d'Adresse <span className="text-red-500">*</span>
                                    </span>
                                </div>
                                <textarea
                                    value={descriptionAdresse}
                                    onChange={(e) => setDescriptionAdresse(e.target.value)}
                                    className={`textarea textarea-bordered h-[100px] w-full border ${errorInfos ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
                                    placeholder="Décrire plus d'information sur votre adresse..."
                                ></textarea>
                                {errorInfos && <p className="text-sm text-red-500">{errorInfos}</p>}
                            </label>
                        </div>
                    </div>
                    )}

                    <div className="my-6 flex justify-center">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <Checkbox
                                checked={utiliserFacturationDifferent}
                                onChange={(e) => setUtiliserFacturationDifferent(e.target.checked)}
                                color="primary"
                            />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                Utiliser une autre adresse pour l'adresse de facturation
                            </span>
                        </label>
                    </div>

                    {utiliserFacturationDifferent && (
                        <div className="mt-4 p-4 ">
                            {( adressesClient.length > 0) && (
                            <div className="mb-4 flex items-center justify-center gap-4 text-xl">
                                <MdBusiness className="text-blue-500" />
                                <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Facturation</span>
                            </div>

                            )}

                            {isUserConnected && adressesClient.length > 0 && (
                                <div className="flex w-full items-center justify-center mb-4">
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            value={utiliserAdresseFacturationExistante.toString()}
                                            onChange={gererChangementAdresseFacturationExistante}
                                            className="gap-4"
                                        >
                                            <div className="w-full rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                                <FormControlLabel
                                                    value="true"
                                                    control={<Radio />}
                                                    label={
                                                        <div>
                                                            <Typography className="font-semibold">Utiliser une adresse existante</Typography>
                                                            <Typography variant="body2" className="text-gray-600">
                                                                Choisissez parmi vos adresses enregistrées
                                                            </Typography>
                                                        </div>
                                                    }
                                                />

                                                {utiliserAdresseFacturationExistante && (
                                                    <div className="mx-8 mt-3">
                                                        <div className="flex w-full flex-col items-start justify-center gap-4">
                                                            {adressesClient.map((adresse) => (
                                                                <AddressCard
                                                                    key={adresse.id + "-facturation"}
                                                                    address={adresse}
                                                                    isSelected={adresseFacturationSelectionnee?.id === adresse.id}
                                                                    onSelect={gererSelectionAdresseFacturation}
                                                                    isBilling={true}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                                <FormControlLabel
                                                    value="false"
                                                    control={<Radio />}
                                                    label={
                                                        <div>
                                                            <Typography className="font-semibold">Nouvelle adresse de facturation</Typography>
                                                            <Typography variant="body2" className="text-gray-600">
                                                                Saisir une nouvelle adresse
                                                            </Typography>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            )}

                            {!utiliserAdresseFacturationExistante && (
                              
                            <div className={`my-3 flex w-full flex-col shadow-md shadow-slate-300 dark:shadow-black rounded-xl items-center justify-center py-3 transition-colors duration-500 ease-in-out overflow-hidden`}>
                                <div className="mb-4 flex items-center justify-center gap-2 text-lg">
                                    <MdLocationOn className="text-accent" />
                                    <span className="font-bold text-black opacity-80 dark:text-white">Nouvelle Adresse de Facturation</span>
                                </div>
                               
                                
                                <InputValidate
                                    IconComponent={MdLocationOn}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Ex: Fianarantsoa..."
                                    title="Ville"
                                    name="ville"
                                    value={donneesFacturation.ville || ""}
                                    onChange={(val) => gererChangementFacturation({ target: { name: "ville", value: val } })}
                                    error={!!erreursFacturation.ville}
                                    helperText={erreursFacturation.ville}
                                    ClassIcone="text-accent"
                                />
                                <InputValidate
                                    IconComponent={MdLocationOn}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Ex: 301..."
                                    title="Code Postal"
                                    name="codePostal"
                                    value={donneesFacturation.codePostal || ""}
                                    onChange={(val) => gererChangementFacturation({ target: { name: "codePostal", value: val } })}
                                    error={!!erreursFacturation.codePostal}
                                    helperText={erreursFacturation.codePostal}
                                    ClassIcone="text-accent"
                                />
                                <InputValidate
                                    IconComponent={MdLocationOn}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Ex: AV13/3609..."
                                    title="Lot d'Adresse"
                                    name="lot"
                                    value={donneesFacturation.lot || ""}
                                    onChange={(val) => gererChangementFacturation({ target: { name: "lot", value: val } })}
                                    error={!!erreursFacturation.lot}
                                    helperText={erreursFacturation.lot}
                                    ClassIcone="text-accent"
                                />
                                <InputValidate
                                    IconComponent={MdLocationOn}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Ex: Imandry..."
                                    title="Quartier"
                                    name="quartier"
                                    value={donneesFacturation.quartier || ""}
                                    onChange={(val) => gererChangementFacturation({ target: { name: "quartier", value: val } })}
                                    error={!!erreursFacturation.quartier}
                                    helperText={erreursFacturation.quartier}
                                    ClassIcone="text-accent"
                                />
                               
                                <InputValidate
                                    IconComponent={MdLocationOn}
                                    type="text"
                                    largeur="2/3"
                                    optionel
                                    placeholder="Ex: Chez moi..."
                                    title="Labelle d'Adresse"
                                    name="labelle"
                                    value={donneesFacturation.labelle  || ""}
                                    onChange={(val) => gererChangementFacturation({ target: { name: "labelle", value: val } })}
                                    error={!!erreursFacturation.labelle}
                                    helperText={erreursFacturation.labelle}
                                    ClassIcone="text-accent"
                                />
                                <div className="flex w-full items-center justify-center">
                                    <label className="mb-5 w-2/3 items-center justify-center">
                                        <div className="label">
                                            <span className={`label-text ${erreursFacturation.description ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
                                                Complement d'Adresse <span className="text-red-500">*</span>
                                            </span>
                                        </div>
                                        <textarea
                                            value={descriptionFacturation}
                                            onChange={(e) => setDescriptionFacturation(e.target.value)}
                                            className={`textarea textarea-bordered h-[100px] w-full border ${erreursFacturation.description ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
                                            placeholder="Décrire plus d'information sur votre adresse..."
                                        ></textarea>
                                        {erreursFacturation.description && <p className="text-sm text-red-500">{erreursFacturation.description}</p>}
                                    </label>
                                </div>
                            </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="btn btn-accent btn-outline btn-wide"
                        >
                            {loading ? ( 
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <span className="loading loading-spinner text-accent"></span>
                                    <span>Validation en cours...</span>
                                </div>
                                    ) : (
                                        utiliserAdresseExistante && adresseSelectionnee ? "Utiliser cette adresse" : "Valider les adresses"
                                    )}
                        </button>
                    </div>
                    
                </div>
            </form>
        </div>
    );
};

export default FormAdresse;


