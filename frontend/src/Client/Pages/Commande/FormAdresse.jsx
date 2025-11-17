import React, { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useAuth } from "../../../hook/useAuth";
import { getClientAddresses, updateClientAddress } from "@/services/ClientService";
import FormControl from "@mui/material/FormControl";
import { InputValidate } from "@/components/InputValidate";
import { createCommandePanier, updateCommandePanier } from "@/services/ClientService";
import { MdLocationOn, MdAddLocation, MdHome, MdBusiness } from "react-icons/md";
import { usePanier } from "@/Client/context/PanierContext";
import { FaMapMarkerAlt } from "react-icons/fa";
import AddressCard from "@/components/AddressCard";
import { Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Button, Checkbox } from "@mui/material";

// Fonction de comparaison de valeur initial et la valeur modifier
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

// Fonction utilitaire pour trouver la nouvelle adresse créée
const findNewAddress = (oldList, newList) => {
    if (!oldList || !newList || newList.length <= oldList.length) return null;
    
    // Trouver l'adresse qui n'était pas dans l'ancienne liste
    for (let newAddr of newList) {
        const existsInOld = oldList.some(oldAddr => oldAddr.id === newAddr.id);
        if (!existsInOld) {
            return newAddr;
        }
    }
    return newList[0]; // Fallback: première adresse de la nouvelle liste
};

const FormAdresse = ({ initialData, onSubmitSuccess }) => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const { items } = usePanier();
    
    // États pour les nouvelles adresses (toujours vides au début)
    const [data, setData] = useState({});
    const [donneesFacturation, setDonneesFacturation] = useState({});
    
    const [errors, setErrors] = useState({});
    const [errorInfos, setErrorInfos] = useState(null);
    const [open, setOpen] = useState(false);
    const initial = useRef(initialData);
    
    const [descriptionAdresse, setDescriptionAdresse] = useState("");
    const [adressesClient, setAdressesClient] = useState([]);
    const [chargementAdresses, setChargementAdresses] = useState(false);

    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    // États pour gérer l'affichage des formulaires
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [showNewBillingAddressForm, setShowNewBillingAddressForm] = useState(false);

    // États de sélection
    const [adresseSelectionnee, setAdresseSelectionnee] = useState(null);
    const [adresseFacturationSelectionnee, setAdresseFacturationSelectionnee] = useState(null);

    const [utiliserFacturationDifferent, setUtiliserFacturationDifferent] = useState(
        initialData?.AdresseDifferent || false
    );

    const [erreursFacturation, setErreursFacturation] = useState({});
    const [descriptionFacturation, setDescriptionFacturation] = useState("");

    const isUserConnected = isAuthenticated;

    useEffect(() => {
        getAdresses();
    }, [isUserConnected, user]);

    useEffect(() => {
        if (initialData && adressesClient.length > 0) {
            // Initialiser l'adresse de livraison depuis les données initiales
            if (initialData.adresseLivraison?.estAdresseExistante && initialData.adresseLivraison?.id) {
                const adresseTrouvee = adressesClient.find(adresse => 
                    adresse.id === initialData.adresseLivraison.id
                );
                if (adresseTrouvee) {
                    setAdresseSelectionnee(adresseTrouvee);
                }
            }

            // Initialiser l'adresse de facturation depuis les données initiales
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
            setChargementAdresses(true);
            try {
                const reponseAdresses = await getClientAddresses();
                const listeAdresses = reponseAdresses.adresse;
                if (listeAdresses && listeAdresses.length > 0) {
                    // Trier par ID décroissant pour avoir les plus récentes en premier
                    const adressesTriees = listeAdresses.sort((a, b) => b.id - a.id);
                    setAdressesClient(adressesTriees);
                    
                    // Si pas de données initiales, sélectionner la première adresse par défaut
                    if (!initialData && adressesTriees.length > 0) {
                        setAdresseSelectionnee(adressesTriees[0]);
                        setAdresseFacturationSelectionnee(adressesTriees[0]);
                    }
                    
                    setChargementAdresses(false);
                    return adressesTriees;
                } else {
                    setAdressesClient([]);
                    setChargementAdresses(false);
                    return [];
                }
            } catch (erreur) {
                console.log("Erreur de connexion:", erreur);
                setMessage({
                    ouvre: true,
                    texte: `Échec de la connexion. Vérifiez votre connexion.`,
                    statut: "error",
                });
                setOpen(true);
                setChargementAdresses(false);
                return [];
            } finally {
                setChargementAdresses(false);
            }
        }
        return [];
    };

    // Fonction pour gérer la modification d'adresse
    const handleEditAddress = async (editedAddress) => {
        try {
            const response = await updateClientAddress(editedAddress);
            if (response) {
                // Mettre à jour la liste des adresses
                await getAdresses();
                
                // Mettre à jour la sélection si l'adresse modifiée est actuellement sélectionnée
                if (adresseSelectionnee && adresseSelectionnee.id === editedAddress.id) {
                    setAdresseSelectionnee(editedAddress);
                }
                if (adresseFacturationSelectionnee && adresseFacturationSelectionnee.id === editedAddress.id) {
                    setAdresseFacturationSelectionnee(editedAddress);
                }
                
                setMessage({
                    ouvre: true,
                    texte: "Adresse modifiée avec succès",
                    statut: "success",
                });
                setOpen(true);
            }
        } catch (error) {
            console.error("Erreur lors de la modification de l'adresse:", error);
            setMessage({
                ouvre: true,
                texte: "Erreur lors de la modification de l'adresse",
                statut: "error",
            });
            setOpen(true);
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

    // Fonction pour gérer l'ajout d'une nouvelle adresse
    const handleAddNewAddress = () => {
        setShowNewAddressForm(true);
        setAdresseSelectionnee(null);
        setData({});
        setDescriptionAdresse("");
    };

    // Fonction pour annuler la création d'une nouvelle adresse
    const handleCancelNewAddress = () => {
        setShowNewAddressForm(false);
        if (adressesClient.length > 0 && !adresseSelectionnee) {
            setAdresseSelectionnee(adressesClient[0]);
        }
    };

    // Fonction pour gérer l'ajout d'une nouvelle adresse de facturation
    const handleAddNewBillingAddress = () => {
        setShowNewBillingAddressForm(true);
        setAdresseFacturationSelectionnee(null);
        setDonneesFacturation({});
        setDescriptionFacturation("");
    };

    // Fonction pour annuler la création d'une nouvelle adresse de facturation
    const handleCancelNewBillingAddress = () => {
        setShowNewBillingAddressForm(false);
        if (adressesClient.length > 0 && !adresseFacturationSelectionnee) {
            setAdresseFacturationSelectionnee(adressesClient[0]);
        }
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        // Validation adresse de livraison
        if (showNewAddressForm) {
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
        } else {
            if (!adresseSelectionnee) {
                tempErrors.adresse = "Veuillez sélectionner une adresse";
                isValid = false;
            }
        }

        setErrors(tempErrors);

        // Validation adresse de facturation
        if (utiliserFacturationDifferent) {
            let factureTempErrors = {};

            if (showNewBillingAddressForm) {
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
            } else {
                if (!adresseFacturationSelectionnee) {
                    factureTempErrors.adresseFacturation = "Veuillez sélectionner une adresse de facturation";
                    isValid = false;
                }
            }

            setErreursFacturation(factureTempErrors);
        }

        return isValid;
    };

    // Fonction pour créer une adresse sans passer à l'étape suivante
    const handleCreateAddress = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (validate()) {
            let donneesAdresse;
            
            if (showNewAddressForm) {
                donneesAdresse = {
                    adresseLivraison: {
                        ...data,
                        estAdresseExistante: false,
                        refAdresse: null,
                        description: descriptionAdresse,
                    },
                    adresseFacturation: utiliserFacturationDifferent ? 
                        (showNewBillingAddressForm ? {
                            ...donneesFacturation,
                            estAdresseExistante: false,
                            refAdresse: null,
                            description: descriptionFacturation,
                        } : {
                            ...adresseFacturationSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseFacturationSelectionnee.id,
                            description: descriptionFacturation || adresseFacturationSelectionnee.complement,
                        }) : {
                            ...data,
                            estAdresseExistante: false,
                            description: descriptionAdresse,
                        },
                    AdresseDifferent: utiliserFacturationDifferent
                };
            } else {
                donneesAdresse = {
                    adresseLivraison: {
                        ...adresseSelectionnee,
                        estAdresseExistante: true,
                        refAdresse: adresseSelectionnee.id,
                        description: descriptionAdresse || adresseSelectionnee.complement,
                    },
                    adresseFacturation: utiliserFacturationDifferent ? 
                        (showNewBillingAddressForm ? {
                            ...donneesFacturation,
                            estAdresseExistante: false,
                            refAdresse: null,
                            description: descriptionFacturation,
                        } : {
                            ...adresseFacturationSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseFacturationSelectionnee.id,
                            description: descriptionFacturation || adresseFacturationSelectionnee.complement,
                        }) : {
                            ...adresseSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseSelectionnee.id,
                            description: descriptionAdresse || adresseSelectionnee.complement,
                        },
                    AdresseDifferent: utiliserFacturationDifferent
                };
            }
            
            setLoading(true);
            
            try {
                const panier = JSON.parse(localStorage.getItem("panier")) || items;
                if (panier.length > 0) {
                    const commandeExiste = localStorage.getItem('RefCommande');
                    let refCommandeNettoyee = null;
                    
                    if (commandeExiste) {
                        try {
                            refCommandeNettoyee = JSON.parse(commandeExiste);
                        } catch (e) {
                            refCommandeNettoyee = commandeExiste;
                        }
                        
                        if (typeof refCommandeNettoyee === 'string') {
                            refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
                        }
                    }

                    const anciennesAdresses = [...adressesClient];

                    if (refCommandeNettoyee) {
                        const dataCommandeUpdate = {
                            adresse: donneesAdresse,
                            refCommande: refCommandeNettoyee
                        };
                        
                        const response = await updateCommandePanier(dataCommandeUpdate);
                        
                        if (response.data) {
                            localStorage.setItem('RefCommande', response.data.refCommande);
                            localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                            
                            if (showNewAddressForm || showNewBillingAddressForm) {
                                const nouvellesAdresses = await getAdresses();
                                if (nouvellesAdresses && nouvellesAdresses.length > 0) {
                                    const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                    
                                    if (showNewAddressForm) {
                                        setAdresseSelectionnee(nouvelleAdresse);
                                    }
                                    if (showNewBillingAddressForm && utiliserFacturationDifferent) {
                                        setAdresseFacturationSelectionnee(nouvelleAdresse);
                                    }
                                }
                            }
                            
                            setShowNewAddressForm(false);
                            setShowNewBillingAddressForm(false);
                            
                            setMessage({
                                ouvre: true,
                                texte: "Votre adresse a été créée et sélectionnée avec succès.",
                                statut: "success",
                            });
                            setOpen(true);
                        } else {
                            setMessage({
                                ouvre: true,
                                texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
                                statut: "error",
                            });
                            setOpen(true);
                        }
                    } else {
                        const dataCommandeCreate = {
                            adresse: donneesAdresse
                        };
                        
                        const response = await createCommandePanier(dataCommandeCreate);
                        
                        if (response.data) {
                            localStorage.setItem('RefCommande', response.data.refCommande);
                            localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                            
                            if (showNewAddressForm || showNewBillingAddressForm) {
                                const nouvellesAdresses = await getAdresses();
                                if (nouvellesAdresses && nouvellesAdresses.length > 0) {
                                    const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                    
                                    if (showNewAddressForm) {
                                        setAdresseSelectionnee(nouvelleAdresse);
                                    }
                                    if (showNewBillingAddressForm && utiliserFacturationDifferent) {
                                        setAdresseFacturationSelectionnee(nouvelleAdresse);
                                    }
                                }
                            }
                            
                            setShowNewAddressForm(false);
                            setShowNewBillingAddressForm(false);
                            
                            setMessage({
                                ouvre: true,
                                texte: "Votre adresse a été créée et sélectionnée avec succès.",
                                statut: "success",
                            });
                            setOpen(true);
                        } else {
                            setMessage({
                                ouvre: true,
                                texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
                                statut: "error",
                            });
                            setOpen(true);
                        }
                    }
                } else {
                    setMessage({
                        ouvre: true,
                        texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
                        statut: "warning",
                    });
                    setOpen(true);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erreur création adresse:", error);
                setMessage({
                    ouvre: true,
                    texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
                    statut: "error",
                });
                setOpen(true);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }
    };

    // Fonction pour valider la commande et passer à l'étape suivante
    const handleSubmit = async (e) => {
        e.preventDefault();
       
        if (validate()) {
            let donneesAdresse;
            
            if (showNewAddressForm) {
                donneesAdresse = {
                    adresseLivraison: {
                        ...data,
                        estAdresseExistante: false,
                        refAdresse: null,
                        description: descriptionAdresse,
                    },
                    adresseFacturation: utiliserFacturationDifferent ? 
                        (showNewBillingAddressForm ? {
                            ...donneesFacturation,
                            estAdresseExistante: false,
                            refAdresse: null,
                            description: descriptionFacturation,
                        } : {
                            ...adresseFacturationSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseFacturationSelectionnee.id,
                            description: descriptionFacturation || adresseFacturationSelectionnee.complement,
                        }) : {
                            ...data,
                            estAdresseExistante: false,
                            description: descriptionAdresse,
                        },
                    AdresseDifferent: utiliserFacturationDifferent
                };
            } else {
                donneesAdresse = {
                    adresseLivraison: {
                        ...adresseSelectionnee,
                        estAdresseExistante: true,
                        refAdresse: adresseSelectionnee.id,
                        description: descriptionAdresse || adresseSelectionnee.complement,
                    },
                    adresseFacturation: utiliserFacturationDifferent ? 
                        (showNewBillingAddressForm ? {
                            ...donneesFacturation,
                            estAdresseExistante: false,
                            refAdresse: null,
                            description: descriptionFacturation,
                        } : {
                            ...adresseFacturationSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseFacturationSelectionnee.id,
                            description: descriptionFacturation || adresseFacturationSelectionnee.complement,
                        }) : {
                            ...adresseSelectionnee,
                            estAdresseExistante: true,
                            refAdresse: adresseSelectionnee.id,
                            description: descriptionAdresse || adresseSelectionnee.complement,
                        },
                    AdresseDifferent: utiliserFacturationDifferent
                };
            }
            
            setLoading(true);
            
            if (IsChangedData(donneesAdresse, initialData)) {
                try {
                    const panier = JSON.parse(localStorage.getItem("panier")) || items;
                    if (panier.length > 0) {
                        const commandeExiste = localStorage.getItem('RefCommande');
                        let refCommandeNettoyee = null;
                        
                        if (commandeExiste) {
                            try {
                                refCommandeNettoyee = JSON.parse(commandeExiste);
                            } catch (e) {
                                refCommandeNettoyee = commandeExiste;
                            }
                            
                            if (typeof refCommandeNettoyee === 'string') {
                                refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
                            }
                        }

                        const anciennesAdresses = [...adressesClient];

                        if (refCommandeNettoyee) {
                            const dataCommandeUpdate = {
                                adresse: donneesAdresse,
                                refCommande: refCommandeNettoyee
                            };
                            
                            const response = await updateCommandePanier(dataCommandeUpdate);
                            
                            if (response.data) {
                                localStorage.setItem('RefCommande', response.data.refCommande);
                                localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
                                if (showNewAddressForm || showNewBillingAddressForm) {
                                    const nouvellesAdresses = await getAdresses();
                                    if (nouvellesAdresses && nouvellesAdresses.length > 0) {
                                        const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                        
                                        if (showNewAddressForm) {
                                            setAdresseSelectionnee(nouvelleAdresse);
                                        }
                                        if (showNewBillingAddressForm && utiliserFacturationDifferent) {
                                            setAdresseFacturationSelectionnee(nouvelleAdresse);
                                        }
                                    }
                                }
                                
                                setShowNewAddressForm(false);
                                setShowNewBillingAddressForm(false);
                                
                                setMessage({
                                    ouvre: true,
                                    texte: "Votre commande a été mis à jour avec succès.",
                                    statut: "success",
                                });
                                setOpen(true);
                                onSubmitSuccess(donneesAdresse);
                            } else {
                                setMessage({
                                    ouvre: true,
                                    texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer.",
                                    statut: "error",
                                });
                                setOpen(true);
                            }
                        } else {
                            const dataCommandeCreate = {
                                adresse: donneesAdresse
                            };
                            
                            const response = await createCommandePanier(dataCommandeCreate);
                            
                            if (response.data) {
                                localStorage.setItem('RefCommande', response.data.refCommande);
                                localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
                                if (showNewAddressForm || showNewBillingAddressForm) {
                                    const nouvellesAdresses = await getAdresses();
                                    if (nouvellesAdresses && nouvellesAdresses.length > 0) {
                                        const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                        
                                        if (showNewAddressForm) {
                                            setAdresseSelectionnee(nouvelleAdresse);
                                        }
                                        if (showNewBillingAddressForm && utiliserFacturationDifferent) {
                                            setAdresseFacturationSelectionnee(nouvelleAdresse);
                                        }
                                    }
                                }
                                
                                setShowNewAddressForm(false);
                                setShowNewBillingAddressForm(false);
                                
                                setMessage({
                                    ouvre: true,
                                    texte: "Votre commande a été créée avec succès.",
                                    statut: "success",
                                });
                                setOpen(true);
                                onSubmitSuccess(donneesAdresse);
                            } else {
                                setMessage({
                                    ouvre: true,
                                    texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
                                    statut: "error",
                                });
                                setOpen(true);
                            }
                        }
                    } else {
                        setMessage({
                            ouvre: true,
                            texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
                            statut: "warning",
                        });
                        setOpen(true);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Erreur création commande:", error);
                    setMessage({
                        ouvre: true,
                        texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
                        statut: "error",
                    });
                    setOpen(true);
                    setLoading(false);
                } finally {
                    setLoading(false);
                }
            } else {
                onSubmitSuccess(initialData);
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
                    
                    {/* Section Adresse de Livraison */}
                    <div className="mb-6 flex items-center justify-center gap-4 text-xl">
                        <MdLocationOn className="text-accent" />
                        <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Livraison</span>
                    </div>

                    {isUserConnected && (
                        <div className="flex w-full items-center justify-center">
                            <div className="w-full">
                                {!showNewAddressForm ? (
                                    <div className="w-full">
                                        {chargementAdresses ? ( 
                                            <div className="flex justify-center py-4">
                                                <div className="loading loading-spinner loading-xl text-accent"></div>
                                                <span className="ml-2">Récupération de vos adresses...</span>
                                            </div>
                                        ) : adressesClient.length > 0 ? (
                                            <div>
                                                <div className="flex w-full flex-col items-start justify-center gap-4 mb-4">
                                                    {adressesClient.map((adresse) => (
                                                        <AddressCard
                                                            key={adresse.id}
                                                            address={adresse}
                                                            isSelected={adresseSelectionnee?.id === adresse.id}
                                                            onSelect={gererSelectionAdresse}
                                                            onEdit={handleEditAddress}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex justify-center mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddNewAddress}
                                                        className="btn btn-outline btn-accent"
                                                    >
                                                        <MdAddLocation className="mr-2" />
                                                        Ajouter une nouvelle adresse
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                                <Typography className="text-yellow-700 mb-4">
                                                    Vous n'avez pas d'adresse enregistrée.
                                                </Typography>
                                                <button
                                                    type="button"
                                                    onClick={handleAddNewAddress}
                                                    className="btn btn-accent"
                                                >
                                                    <MdAddLocation className="mr-2" />
                                                    Créer votre première adresse
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
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

                                        <div className="flex gap-4 mt-4">
                                            <button
                                                type="button"
                                                onClick={handleCancelNewAddress}
                                                className="btn btn-outline btn-error"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreateAddress}
                                                className="btn btn-accent"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="loading loading-spinner"></span>
                                                        Création...
                                                    </div>
                                                ) : (
                                                    "Créer l'adresse"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                        <div className="mt-4 p-4">
                            <div className="mb-4 flex items-center justify-center gap-4 text-xl">
                                <MdBusiness className="text-blue-500" />
                                <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Facturation</span>
                            </div>

                            {isUserConnected && (
                                <div className="flex w-full items-center justify-center mb-4">
                                    <div className="w-full">
                                        {!showNewBillingAddressForm ? (
                                            <div className="w-full">
                                                {adressesClient.length > 0 ? (
                                                    <div>
                                                        <div className="flex w-full flex-col items-start justify-center gap-4 mb-4">
                                                            {adressesClient.map((adresse) => (
                                                                <AddressCard
                                                                    key={adresse.id + "-facturation"}
                                                                    address={adresse}
                                                                    isSelected={adresseFacturationSelectionnee?.id === adresse.id}
                                                                    onSelect={gererSelectionAdresseFacturation}
                                                                    onEdit={handleEditAddress}
                                                                    isBilling={true}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-center mt-4">
                                                            <button
                                                                type="button"
                                                                onClick={handleAddNewBillingAddress}
                                                                className="btn btn-outline btn-accent"
                                                            >
                                                                <MdAddLocation className="mr-2" />
                                                                Ajouter une nouvelle adresse de facturation
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                                        <Typography className="text-yellow-700 mb-4">
                                                            Vous n'avez pas d'adresse enregistrée.
                                                        </Typography>
                                                        <button
                                                            type="button"
                                                            onClick={handleAddNewBillingAddress}
                                                            className="btn btn-accent"
                                                        >
                                                            <MdAddLocation className="mr-2" />
                                                            Créer une adresse de facturation
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
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

                                                <div className="flex gap-4 mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelNewBillingAddress}
                                                        className="btn btn-outline btn-error"
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateAddress}
                                                        className="btn btn-accent"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="loading loading-spinner"></span>
                                                                Création...
                                                            </div>
                                                        ) : (
                                                            "Créer l'adresse de facturation"
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!showNewAddressForm && !showNewBillingAddressForm && (
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
                                    "Valider la commande"
                                )}
                            </button>
                        </div>
                    )}
                    
                </div>
            </form>
        </div>
    );
};

export default FormAdresse;










// import React, { useEffect, useRef, useState } from "react";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { useAuth } from "../../../hook/useAuth";
// import { getClientAddresses, updateClientAddress } from "@/services/ClientService";
// import FormControl from "@mui/material/FormControl";
// import { InputValidate } from "@/components/InputValidate";
// import { createCommandePanier, updateCommandePanier } from "@/services/ClientService";
// import { MdLocationOn, MdAddLocation, MdHome, MdBusiness } from "react-icons/md";
// import { usePanier } from "@/Client/context/PanierContext";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import AddressCard from "@/components/AddressCard";
// import { Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Button, Checkbox } from "@mui/material";

// // Fonction de comparaison de valeur initial et la valeur modifier
// function IsChangedData(current, initial) {
//     if (!current || !initial) return true;
    
//     const livraisonCurent = current.adresseLivraison || {};
//     const facturationCurent = current.adresseFacturation || {};
//     const livraisonInitial = initial.adresseLivraison || {};
//     const facturationInitial = initial.adresseFacturation || {};
    
//     const compare = (curr, init) => {
//         if (!curr && !init) return false;
//         if (!curr || !init) return true;
        
//         return (
//             curr.id !== init.id ||
//             curr.codePostal !== init.codePostal ||
//             (curr.labelle || curr.LabelleAdresse) !== (init.labelle || init.LabelleAdresse) || 
//             curr.complement !== init.complement ||
//             curr.description !== init.description ||
//             curr.lot !== init.lot ||
//             curr.quartier !== init.quartier ||
//             curr.ville !== init.ville 
//         ); 
//     };
    
//     return compare(livraisonCurent, livraisonInitial) || compare(facturationCurent, facturationInitial);
// }

// // Fonction utilitaire pour trouver la nouvelle adresse créée
// const findNewAddress = (oldList, newList) => {
//     if (!oldList || !newList || newList.length <= oldList.length) return null;
    
//     // Trouver l'adresse qui n'était pas dans l'ancienne liste
//     for (let newAddr of newList) {
//         const existsInOld = oldList.some(oldAddr => oldAddr.id === newAddr.id);
//         if (!existsInOld) {
//             return newAddr;
//         }
//     }
//     return newList[0]; // Fallback: première adresse de la nouvelle liste
// };

// const FormAdresse = ({ initialData, onSubmitSuccess }) => {
//     const { user, isAuthenticated } = useAuth();
//     const [loading, setLoading] = useState(false);
//     const { items } = usePanier();
    
//     // États pour les nouvelles adresses (toujours vides au début)
//     const [data, setData] = useState({});
//     const [donneesFacturation, setDonneesFacturation] = useState({});
    
//     const [errors, setErrors] = useState({});
//     const [errorInfos, setErrorInfos] = useState(null);
//     const [open, setOpen] = useState(false);
//     const initial = useRef(initialData);
    
//     const [descriptionAdresse, setDescriptionAdresse] = useState("");
//     const [adressesClient, setAdressesClient] = useState([]);
//     const [chargementAdresses, setChargementAdresses] = useState(false);

//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });

//     // États pour gérer l'affichage des formulaires
//     const [showNewAddressForm, setShowNewAddressForm] = useState(false);
//     const [showNewBillingAddressForm, setShowNewBillingAddressForm] = useState(false);

//     // États de sélection
//     const [adresseSelectionnee, setAdresseSelectionnee] = useState(null);
//     const [adresseFacturationSelectionnee, setAdresseFacturationSelectionnee] = useState(null);

//     const [utiliserFacturationDifferent, setUtiliserFacturationDifferent] = useState(
//         initialData?.AdresseDifferent || false
//     );

//     const [erreursFacturation, setErreursFacturation] = useState({});
//     const [descriptionFacturation, setDescriptionFacturation] = useState("");

//     const isUserConnected = isAuthenticated;

//     useEffect(() => {
//         getAdresses();
//     }, [isUserConnected, user]);

//     useEffect(() => {
//         if (initialData && adressesClient.length > 0) {
//             // Initialiser l'adresse de livraison depuis les données initiales
//             if (initialData.adresseLivraison?.estAdresseExistante && initialData.adresseLivraison?.id) {
//                 const adresseTrouvee = adressesClient.find(adresse => 
//                     adresse.id === initialData.adresseLivraison.id
//                 );
//                 if (adresseTrouvee) {
//                     setAdresseSelectionnee(adresseTrouvee);
//                 }
//             }

//             // Initialiser l'adresse de facturation depuis les données initiales
//             if (initialData.adresseFacturation?.estAdresseExistante && initialData.adresseFacturation?.id) {
//                 const adresseFacturationTrouvee = adressesClient.find(adresse => 
//                     adresse.id === initialData.adresseFacturation.id
//                 );
//                 if (adresseFacturationTrouvee) {
//                     setAdresseFacturationSelectionnee(adresseFacturationTrouvee);
//                 }
//             }
//         }
//     }, [initialData, adressesClient]);

//     const getAdresses = async () => {
//         if (isUserConnected && user.client) {
//             setChargementAdresses(true);
//             try {
//                 const reponseAdresses = await getClientAddresses();
//                 const listeAdresses = reponseAdresses.adresse;
//                 if (listeAdresses && listeAdresses.length > 0) {
//                     // Trier par ID décroissant pour avoir les plus récentes en premier
//                     const adressesTriees = listeAdresses.sort((a, b) => b.id - a.id);
//                     setAdressesClient(adressesTriees);
                    
//                     // Si pas de données initiales, sélectionner la première adresse par défaut
//                     if (!initialData && adressesTriees.length > 0) {
//                         setAdresseSelectionnee(adressesTriees[0]);
//                         setAdresseFacturationSelectionnee(adressesTriees[0]);
//                     }
                    
//                     setChargementAdresses(false);
//                     return adressesTriees; // Retourner les adresses
//                 } else {
//                     setAdressesClient([]);
//                     setChargementAdresses(false);
//                     return [];
//                 }
//             } catch (erreur) {
//                 console.log("Erreur de connexion:", erreur);
//                 setMessage({
//                     ouvre: true,
//                     texte: `Échec de la connexion. Vérifiez votre connexion.`,
//                     statut: "error",
//                 });
//                 setOpen(true);
//                 setChargementAdresses(false);
//                 return [];
//             } finally {
//                 setChargementAdresses(false);
//             }
//         }
//         return [];
//     };

//     // Fonction pour gérer la modification d'adresse
//     const handleEditAddress = async (editedAddress) => {
//         try {
//             const response = await updateClientAddress(editedAddress);
//             if (response) {
//                 // Mettre à jour la liste des adresses
//                 await getAdresses();
                
//                 // Mettre à jour la sélection si l'adresse modifiée est actuellement sélectionnée
//                 if (adresseSelectionnee && adresseSelectionnee.id === editedAddress.id) {
//                     setAdresseSelectionnee(editedAddress);
//                 }
//                 if (adresseFacturationSelectionnee && adresseFacturationSelectionnee.id === editedAddress.id) {
//                     setAdresseFacturationSelectionnee(editedAddress);
//                 }
                
//                 setMessage({
//                     ouvre: true,
//                     texte: "Adresse modifiée avec succès",
//                     statut: "success",
//                 });
//                 setOpen(true);
//             }
//         } catch (error) {
//             console.error("Erreur lors de la modification de l'adresse:", error);
//             setMessage({
//                 ouvre: true,
//                 texte: "Erreur lors de la modification de l'adresse",
//                 statut: "error",
//             });
//             setOpen(true);
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setData((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
//         setErrors((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
//     };

//     const gererChangementFacturation = (e) => {
//         const { name, value } = e.target;
//         setDonneesFacturation((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
//         setErreursFacturation((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
//     };

//     const gererSelectionAdresse = (adresse) => {
//         setAdresseSelectionnee(adresse);
//     };

//     const gererSelectionAdresseFacturation = (adresse) => {
//         setAdresseFacturationSelectionnee(adresse);
//     };

//     // Fonction pour gérer l'ajout d'une nouvelle adresse
//     const handleAddNewAddress = () => {
//         setShowNewAddressForm(true);
//         setAdresseSelectionnee(null); // Désélectionner toute adresse existante
//         setData({}); // Vider le formulaire
//         setDescriptionAdresse("");
//     };

//     // Fonction pour annuler la création d'une nouvelle adresse
//     const handleCancelNewAddress = () => {
//         setShowNewAddressForm(false);
//         // Resélectionner la première adresse si disponible
//         if (adressesClient.length > 0 && !adresseSelectionnee) {
//             setAdresseSelectionnee(adressesClient[0]);
//         }
//     };

//     // Fonction pour gérer l'ajout d'une nouvelle adresse de facturation
//     const handleAddNewBillingAddress = () => {
//         setShowNewBillingAddressForm(true);
//         setAdresseFacturationSelectionnee(null);
//         setDonneesFacturation({});
//         setDescriptionFacturation("");
//     };

//     // Fonction pour annuler la création d'une nouvelle adresse de facturation
//     const handleCancelNewBillingAddress = () => {
//         setShowNewBillingAddressForm(false);
//         // Resélectionner la première adresse si disponible
//         if (adressesClient.length > 0 && !adresseFacturationSelectionnee) {
//             setAdresseFacturationSelectionnee(adressesClient[0]);
//         }
//     };

//     const validate = () => {
//         let tempErrors = {};
//         let isValid = true;

//         // Validation adresse de livraison
//         if (showNewAddressForm) {
//             // Validation pour nouvelle adresse
//             if (!data.labelle || data.labelle.trim() === "") {
//                 tempErrors.labelle = "Mentionner le labelle de votre adresse, Ce champ est requis.";
//                 isValid = false;
//             }
//             if (!data.ville || data.ville.trim() === "") {
//                 tempErrors.ville = "Obligatoire, Le nom du ville doit être existe.";
//                 isValid = false;
//             }
//             if (!data.codePostal || !/\d+$/.test(data.codePostal)) {
//                 tempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
//                 isValid = false;
//             }
//             if (!data.quartier || data.quartier.trim() === "") {
//                 tempErrors.quartier = "Nous ne pouvons livré votre produit sans quartier, cette champ est requis.";
//                 isValid = false;
//             }
//             if (!data.lot || data.lot.trim() === "") {
//                 tempErrors.lot = "Obligatoire, c'est important pour nous connaitre votre adresse précis";
//                 isValid = false;
//             }
//             if (!descriptionAdresse || descriptionAdresse.trim() === "") {
//                 setErrorInfos("La description doit contient au moins 4 caractères.");
//                 isValid = false;
//             }
//         } else {
//             // Validation pour adresse existante
//             if (!adresseSelectionnee) {
//                 tempErrors.adresse = "Veuillez sélectionner une adresse";
//                 isValid = false;
//             }
//         }

//         setErrors(tempErrors);

//         // Validation adresse de facturation
//         if (utiliserFacturationDifferent) {
//             let factureTempErrors = {};

//             if (showNewBillingAddressForm) {
//                 // Validation pour nouvelle adresse de facturation
//                 if (!donneesFacturation.labelle || donneesFacturation.labelle.trim() === "") {
//                     factureTempErrors.labelle = "Mentionner le labelle de votre adresse de facturation, Ce champ est requis.";
//                     isValid = false;
//                 }
//                 if (!donneesFacturation.ville || donneesFacturation.ville.trim() === "") {
//                     factureTempErrors.ville = "Obligatoire pour la facturation, Le nom du ville doit être existe.";
//                     isValid = false;
//                 }
//                 if (!donneesFacturation.codePostal || !/\d+$/.test(donneesFacturation.codePostal)) {
//                     factureTempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
//                     isValid = false;
//                 }
//                 if (!donneesFacturation.quartier || donneesFacturation.quartier.trim() === "") {
//                     factureTempErrors.quartier = "Le quartier est requis pour la facturation.";
//                     isValid = false;
//                 }
//                 if (!donneesFacturation.lot || donneesFacturation.lot.trim() === "") {
//                     factureTempErrors.lot = "Obligatoire pour la facturation, c'est important pour nous connaitre votre adresse précis";
//                     isValid = false;
//                 }
//                 if (!descriptionFacturation || descriptionFacturation.trim() === "") {
//                     factureTempErrors.description = "La description de l'adresse de facturation doit contient au moins 4 caractères.";
//                     isValid = false;
//                 }
//             } else {
//                 // Validation pour adresse de facturation existante
//                 if (!adresseFacturationSelectionnee) {
//                     factureTempErrors.adresseFacturation = "Veuillez sélectionner une adresse de facturation";
//                     isValid = false;
//                 }
//             }

//             setErreursFacturation(factureTempErrors);
//         }

//         return isValid;
//     };

//     //  Gérer spécifiquement la création d'adresse
//     const handleCreateAddress = async (e) => {
//         e.preventDefault(); 
//         e.stopPropagation();

//         if (validate()) {
//             let donneesAdresse;
            
//             // Construction des données d'adresse (identique à handleSubmit)
//             if (showNewAddressForm) {
//                 donneesAdresse = {
//                     adresseLivraison: {
//                         ...data,
//                         estAdresseExistante: false,
//                         refAdresse: null,
//                         description: descriptionAdresse,
//                     },
//                     adresseFacturation: utiliserFacturationDifferent ? 
//                         (showNewBillingAddressForm ? {
//                             ...donneesFacturation,
//                             estAdresseExistante: false,
//                             refAdresse: null,
//                             description: descriptionFacturation,
//                         } : {
//                             ...adresseFacturationSelectionnee,
//                             estAdresseExistante: true,
//                             refAdresse: adresseFacturationSelectionnee.id,
//                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
//                         }) : {
//                             ...data,
//                             estAdresseExistante: false,
//                             description: descriptionAdresse,
//                         },
//                     AdresseDifferent: utiliserFacturationDifferent
//                 };
//             } else {
//                 donneesAdresse = {
//                     adresseLivraison: {
//                         ...adresseSelectionnee,
//                         estAdresseExistante: true,
//                         refAdresse: adresseSelectionnee.id,
//                         description: descriptionAdresse || adresseSelectionnee.complement,
//                     },
//                     adresseFacturation: utiliserFacturationDifferent ? 
//                         (showNewBillingAddressForm ? {
//                             ...donneesFacturation,
//                             estAdresseExistante: false,
//                             refAdresse: null,
//                             description: descriptionFacturation,
//                         } : {
//                             ...adresseFacturationSelectionnee,
//                             estAdresseExistante: true,
//                             refAdresse: adresseFacturationSelectionnee.id,
//                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
//                         }) : {
//                             ...adresseSelectionnee,
//                             estAdresseExistante: true,
//                             refAdresse: adresseSelectionnee.id,
//                             description: descriptionAdresse || adresseSelectionnee.complement,
//                         },
//                     AdresseDifferent: utiliserFacturationDifferent
//                 };
//             }
            
//             setLoading(true);
//             console.log("Création d'adresse:", donneesAdresse);
            
//             try {
//                 const panier = JSON.parse(localStorage.getItem("panier")) || items;
//                 if (panier.length > 0) {
//                     const commandeExiste = localStorage.getItem('RefCommande');
//                     let refCommandeNettoyee = null;
                    
//                     if (commandeExiste) {
//                         try {
//                             refCommandeNettoyee = JSON.parse(commandeExiste);
//                         } catch (e) {
//                             refCommandeNettoyee = commandeExiste;
//                         }
                        
//                         if (typeof refCommandeNettoyee === 'string') {
//                             refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
//                         }
//                     }

//                     // Sauvegarder l'ancienne liste d'adresses pour détecter la nouvelle
//                     const anciennesAdresses = [...adressesClient];

//                     if (refCommandeNettoyee) {
//                         // Mise à jour de commande existante
//                         const dataCommandeUpdate = {
//                             adresse: donneesAdresse,
//                             refCommande: refCommandeNettoyee
//                         };
                        
//                         const response = await updateCommandePanier(dataCommandeUpdate);
                        
//                         if (response.data) {
//                             console.log("Commande mis à jour avec succès:", response.data);
//                             localStorage.setItem('RefCommande', response.data.refCommande);
//                             localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                            
//                             // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
//                             if (showNewAddressForm || showNewBillingAddressForm) {
//                                 const nouvellesAdresses = await getAdresses();
//                                 if (nouvellesAdresses && nouvellesAdresses.length > 0) {
//                                     const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                    
//                                     if (showNewAddressForm) {
//                                         setAdresseSelectionnee(nouvelleAdresse);
//                                     }
//                                     if (showNewBillingAddressForm && utiliserFacturationDifferent) {
//                                         setAdresseFacturationSelectionnee(nouvelleAdresse);
//                                     }
//                                 }
//                             }
                            
//                             setShowNewAddressForm(false);
//                             setShowNewBillingAddressForm(false);
                            
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "Votre adresse a été créée et sélectionnée avec succès.",
//                                 statut: "success",
//                             });
//                             setOpen(true);
//                         } else {
//                             console.log("Erreur de commande: ", response.error);
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
//                                 statut: "error",
//                             });
//                             setOpen(true);
//                         }
//                     } else {
//                         // Créer nouvelle commande
//                         const dataCommandeCreate = {
//                             adresse: donneesAdresse
//                         };
                        
//                         const response = await createCommandePanier(dataCommandeCreate);
                        
//                         if (response.data) {
//                             console.log("Commande créée avec succès:", response.data);
//                             localStorage.setItem('RefCommande', response.data.refCommande);
//                             localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                            
//                             // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
//                             if (showNewAddressForm || showNewBillingAddressForm) {
//                                 const nouvellesAdresses = await getAdresses();
//                                 if (nouvellesAdresses && nouvellesAdresses.length > 0) {
//                                     const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                    
//                                     if (showNewAddressForm) {
//                                         setAdresseSelectionnee(nouvelleAdresse);
//                                     }
//                                     if (showNewBillingAddressForm && utiliserFacturationDifferent) {
//                                         setAdresseFacturationSelectionnee(nouvelleAdresse);
//                                     }
//                                 }
//                             }
                            
//                             setShowNewAddressForm(false);
//                             setShowNewBillingAddressForm(false);
                            
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "Votre adresse a été créée et sélectionnée avec succès.",
//                                 statut: "success",
//                             });
//                             setOpen(true);
//                         } else {
//                             console.log("Erreur de commande: ", response.error);
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
//                                 statut: "error",
//                             });
//                             setOpen(true);
//                         }
//                     }
//                 } else {
//                     setMessage({
//                         ouvre: true,
//                         texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
//                         statut: "warning",
//                     });
//                     setOpen(true);
//                 }
//                 setLoading(false);
//             } catch (error) {
//                 console.error(" Erreur création adresse:", error);
//                 setMessage({
//                     ouvre: true,
//                     texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
//                     statut: "error",
//                 });
//                 setOpen(true);
//                 setLoading(false);
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     // const handleSubmit = async (e) => {
//     //     e.preventDefault();
//     //     if (validate()) {
//     //         let donneesAdresse;
//     //         // Construction des données d'adresse
//     //         if (showNewAddressForm) {
//     //             // Utiliser la nouvelle adresse créée
//     //             donneesAdresse = {
//     //                 adresseLivraison: {
//     //                     ...data,
//     //                     estAdresseExistante: false,
//     //                     refAdresse: null,
//     //                     description: descriptionAdresse,
//     //                 },
//     //                 adresseFacturation: utiliserFacturationDifferent ? 
//     //                     (showNewBillingAddressForm ? {
//     //                         ...donneesFacturation,
//     //                         estAdresseExistante: false,
//     //                         refAdresse: null,
//     //                         description: descriptionFacturation,
//     //                     } : {
//     //                         ...adresseFacturationSelectionnee,
//     //                         estAdresseExistante: true,
//     //                         refAdresse: adresseFacturationSelectionnee.id,
//     //                         description: descriptionFacturation || adresseFacturationSelectionnee.complement,
//     //                     }) : {
//     //                         ...data,
//     //                         estAdresseExistante: false,
//     //                         description: descriptionAdresse,
//     //                     },
//     //                 AdresseDifferent: utiliserFacturationDifferent
//     //             };
//     //         } else {
//     //             // Utiliser l'adresse existante sélectionnée
//     //             donneesAdresse = {
//     //                 adresseLivraison: {
//     //                     ...adresseSelectionnee,
//     //                     estAdresseExistante: true,
//     //                     refAdresse: adresseSelectionnee.id,
//     //                     description: descriptionAdresse || adresseSelectionnee.complement,
//     //                 },
//     //                 adresseFacturation: utiliserFacturationDifferent ? 
//     //                     (showNewBillingAddressForm ? {
//     //                         ...donneesFacturation,
//     //                         estAdresseExistante: false,
//     //                         refAdresse: null,
//     //                         description: descriptionFacturation,
//     //                     } : {
//     //                         ...adresseFacturationSelectionnee,
//     //                         estAdresseExistante: true,
//     //                         refAdresse: adresseFacturationSelectionnee.id,
//     //                         description: descriptionFacturation || adresseFacturationSelectionnee.complement,
//     //                     }) : {
//     //                         ...adresseSelectionnee,
//     //                         estAdresseExistante: true,
//     //                         refAdresse: adresseSelectionnee.id,
//     //                         description: descriptionAdresse || adresseSelectionnee.complement,
//     //                     },
//     //                 AdresseDifferent: utiliserFacturationDifferent
//     //             };
//     //         }
//     //         setLoading(true);
//     //         console.log("Données adresse à envoyer:", donneesAdresse);
//     //         if (IsChangedData(donneesAdresse, initialData)) {
//     //             try {
//     //                 const panier = JSON.parse(localStorage.getItem("panier")) || items;
//     //                 if (panier.length > 0) {
//     //                     const commandeExiste = localStorage.getItem('RefCommande');
//     //                     let refCommandeNettoyee = null;
                        
//     //                     if (commandeExiste) {
//     //                         try {
//     //                             refCommandeNettoyee = JSON.parse(commandeExiste);
//     //                         } catch (e) {
//     //                             refCommandeNettoyee = commandeExiste;
//     //                         }
                            
//     //                         if (typeof refCommandeNettoyee === 'string') {
//     //                             refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
//     //                         }
//     //                     }

//     //                     // Sauvegarder l'ancienne liste d'adresses pour détecter la nouvelle
//     //                     const anciennesAdresses = [...adressesClient];

//     //                     if (refCommandeNettoyee) {
//     //                         // Mise à jour de commande existante
//     //                         const dataCommandeUpdate = {
//     //                             adresse: donneesAdresse,
//     //                             refCommande: refCommandeNettoyee
//     //                         };
                            
//     //                         const response = await updateCommandePanier(dataCommandeUpdate);
                            
//     //                         if (response.data) {
//     //                             console.log("Commande mis à jour avec succès:", response.data);
//     //                             localStorage.setItem('RefCommande', response.data.refCommande);
//     //                             localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
//     //                             // CORRECTION : Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
//     //                             if (showNewAddressForm || showNewBillingAddressForm) {
//     //                                 const nouvellesAdresses = await getAdresses();
//     //                                 if (nouvellesAdresses && nouvellesAdresses.length > 0) {
//     //                                     const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                        
//     //                                     if (showNewAddressForm) {
//     //                                         setAdresseSelectionnee(nouvelleAdresse);
//     //                                     }
//     //                                     if (showNewBillingAddressForm && utiliserFacturationDifferent) {
//     //                                         setAdresseFacturationSelectionnee(nouvelleAdresse);
//     //                                     }
//     //                                 }
//     //                             }
                                
//     //                             setShowNewAddressForm(false);
//     //                             setShowNewBillingAddressForm(false);
                                
//     //                             setMessage({
//     //                                 ouvre: true,
//     //                                 texte: "Votre commande a été mis à jour avec succès.",
//     //                                 statut: "success",
//     //                             });
//     //                             setOpen(true);
//     //                             onSubmitSuccess(donneesAdresse);
//     //                         } else {
//     //                             console.log("Erreur de commande: ", response.error);
//     //                             setMessage({
//     //                                 ouvre: true,
//     //                                 texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer.",
//     //                                 statut: "error",
//     //                             });
//     //                             setOpen(true);
//     //                         }
//     //                     } else {
//     //                         // Créer nouvelle commande
//     //                         const dataCommandeCreate = {
//     //                             adresse: donneesAdresse
//     //                         };
                            
//     //                         const response = await createCommandePanier(dataCommandeCreate);
                            
//     //                         if (response.data) {
//     //                             console.log("Commande créée avec succès:", response.data);
//     //                             localStorage.setItem('RefCommande', response.data.refCommande);
//     //                             localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
//     //                             // CORRECTION : Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
//     //                             if (showNewAddressForm || showNewBillingAddressForm) {
//     //                                 const nouvellesAdresses = await getAdresses();
//     //                                 if (nouvellesAdresses && nouvellesAdresses.length > 0) {
//     //                                     const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                        
//     //                                     if (showNewAddressForm) {
//     //                                         setAdresseSelectionnee(nouvelleAdresse);
//     //                                     }
//     //                                     if (showNewBillingAddressForm && utiliserFacturationDifferent) {
//     //                                         setAdresseFacturationSelectionnee(nouvelleAdresse);
//     //                                     }
//     //                                 }
//     //                             }
                                
//     //                             setShowNewAddressForm(false);
//     //                             setShowNewBillingAddressForm(false);
                                
//     //                             setMessage({
//     //                                 ouvre: true,
//     //                                 texte: "Votre commande a été créée avec succès.",
//     //                                 statut: "success",
//     //                             });
//     //                             setOpen(true);
//     //                             onSubmitSuccess(donneesAdresse);
//     //                         } else {
//     //                             console.log("Erreur de commande: ", response.error);
//     //                             setMessage({
//     //                                 ouvre: true,
//     //                                 texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
//     //                                 statut: "error",
//     //                             });
//     //                             setOpen(true);
//     //                         }
//     //                     }
//     //                 } else {
//     //                     setMessage({
//     //                         ouvre: true,
//     //                         texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
//     //                         statut: "warning",
//     //                     });
//     //                     setOpen(true);
//     //                 }
//     //                 setLoading(false);
//     //             } catch (error) {
//     //                 console.error(" Erreur création commande:", error);
//     //                 setMessage({
//     //                     ouvre: true,
//     //                     texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
//     //                     statut: "error",
//     //                 });
//     //                 setOpen(true);
//     //                 setLoading(false);
//     //             } finally {
//     //                 setLoading(false);
//     //             }
//     //         } else {
//     //             onSubmitSuccess(initialData);
//     //         }
//     //     }
//     // };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
       
//         if (validate()) {
//             let donneesAdresse;
            
//             // Construction des données d'adresse (identique)
//             if (showNewAddressForm) {
//                 donneesAdresse = {
//                     adresseLivraison: {
//                         ...data,
//                         estAdresseExistante: false,
//                         refAdresse: null,
//                         description: descriptionAdresse,
//                     },
//                     adresseFacturation: utiliserFacturationDifferent ? 
//                         (showNewBillingAddressForm ? {
//                             ...donneesFacturation,
//                             estAdresseExistante: false,
//                             refAdresse: null,
//                             description: descriptionFacturation,
//                         } : {
//                             ...adresseFacturationSelectionnee,
//                             estAdresseExistante: true,
//                             refAdresse: adresseFacturationSelectionnee.id,
//                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
//                         }) : {
//                             ...data,
//                             estAdresseExistante: false,
//                             description: descriptionAdresse,
//                         },
//                     AdresseDifferent: utiliserFacturationDifferent
//                 };
//             } else {
//                 donneesAdresse = {
//                     adresseLivraison: {
//                         ...adresseSelectionnee,
//                         estAdresseExistante: true,
//                         refAdresse: adresseSelectionnee.id,
//                         description: descriptionAdresse || adresseSelectionnee.complement,
//                     },
//                     adresseFacturation: utiliserFacturationDifferent ? 
//                         (showNewBillingAddressForm ? {
//                             ...donneesFacturation,
//                             estAdresseExistante: false,
//                             refAdresse: null,
//                             description: descriptionFacturation,
//                         } : {
//                             ...adresseFacturationSelectionnee,
//                             estAdresseExistante: true,
//                             refAdresse: adresseFacturationSelectionnee.id,
//                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
//                         }) : {
//                             ...adresseSelectionnee,
//                             estAdresseExistante: true,
//                             refAdresse: adresseSelectionnee.id,
//                             description: descriptionAdresse || adresseSelectionnee.complement,
//                         },
//                     AdresseDifferent: utiliserFacturationDifferent
//                 };
//             }
            
//             setLoading(true);
//             console.log("Validation de commande:", donneesAdresse);
            
//             if (IsChangedData(donneesAdresse, initialData)) {
//                 try {
//                     const panier = JSON.parse(localStorage.getItem("panier")) || items;
//                     if (panier.length > 0) {
//                         const commandeExiste = localStorage.getItem('RefCommande');
//                         let refCommandeNettoyee = null;
                        
//                         if (commandeExiste) {
//                             try {
//                                 refCommandeNettoyee = JSON.parse(commandeExiste);
//                             } catch (e) {
//                                 refCommandeNettoyee = commandeExiste;
//                             }
                            
//                             if (typeof refCommandeNettoyee === 'string') {
//                                 refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
//                             }
//                         }

//                         // Sauvegarder l'ancienne liste d'adresses pour détecter la nouvelle
//                         const anciennesAdresses = [...adressesClient];

//                         if (refCommandeNettoyee) {
//                             // Mise à jour de commande existante
//                             const dataCommandeUpdate = {
//                                 adresse: donneesAdresse,
//                                 refCommande: refCommandeNettoyee
//                             };
//                             console.log("Commande à modifier:", dataCommandeUpdate);
//                             const response = await updateCommandePanier(dataCommandeUpdate);
                            
//                             if (response.data) {
//                                 console.log("Commande mis à jour avec succès:", response.data);
//                                 localStorage.setItem('RefCommande', response.data.refCommande);
//                                 localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
//                                 // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
//                                 if (showNewAddressForm || showNewBillingAddressForm) {
//                                     const nouvellesAdresses = await getAdresses();
//                                     if (nouvellesAdresses && nouvellesAdresses.length > 0) {
//                                         const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                        
//                                         if (showNewAddressForm) {
//                                             setAdresseSelectionnee(nouvelleAdresse);
//                                         }
//                                         if (showNewBillingAddressForm && utiliserFacturationDifferent) {
//                                             setAdresseFacturationSelectionnee(nouvelleAdresse);
//                                         }
//                                     }
//                                 }
                                
//                                 setShowNewAddressForm(false);
//                                 setShowNewBillingAddressForm(false);
                                
//                                 setMessage({
//                                     ouvre: true,
//                                     texte: "Votre commande a été mis à jour avec succès.",
//                                     statut: "success",
//                                 });
//                                 setOpen(true);
//                                 onSubmitSuccess(donneesAdresse); 
//                             } else {
//                                 console.log("Erreur de commande: ", response.error);
//                                 setMessage({
//                                     ouvre: true,
//                                     texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer.",
//                                     statut: "error",
//                                 });
//                                 setOpen(true);
//                             }
//                         } else {
//                             // Créer nouvelle commande
//                             const dataCommandeCreate = {
//                                 adresse: donneesAdresse
//                             };
                            
//                             const response = await createCommandePanier(dataCommandeCreate);
                            
//                             if (response.data) {
//                                 console.log("Commande créée avec succès:", response.data);
//                                 localStorage.setItem('RefCommande', response.data.refCommande);
//                                 localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
//                                 // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
//                                 if (showNewAddressForm || showNewBillingAddressForm) {
//                                     const nouvellesAdresses = await getAdresses();
//                                     if (nouvellesAdresses && nouvellesAdresses.length > 0) {
//                                         const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
                                        
//                                         if (showNewAddressForm) {
//                                             setAdresseSelectionnee(nouvelleAdresse);
//                                         }
//                                         if (showNewBillingAddressForm && utiliserFacturationDifferent) {
//                                             setAdresseFacturationSelectionnee(nouvelleAdresse);
//                                         }
//                                     }
//                                 }
                                
//                                 setShowNewAddressForm(false);
//                                 setShowNewBillingAddressForm(false);
                                
//                                 setMessage({
//                                     ouvre: true,
//                                     texte: "Votre commande a été créée avec succès.",
//                                     statut: "success",
//                                 });
//                                 setOpen(true);
//                                 onSubmitSuccess(donneesAdresse); // Ici on passe à l'étape suivante
//                             } else {
//                                 console.log("Erreur de commande: ", response.error);
//                                 setMessage({
//                                     ouvre: true,
//                                     texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
//                                     statut: "error",
//                                 });
//                                 setOpen(true);
//                             }
//                         }
//                     } else {
//                         setMessage({
//                             ouvre: true,
//                             texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
//                             statut: "warning",
//                         });
//                         setOpen(true);
//                     }
//                     setLoading(false);
//                 } catch (error) {
//                     console.error(" Erreur création commande:", error);
//                     setMessage({
//                         ouvre: true,
//                         texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
//                         statut: "error",
//                     });
//                     setOpen(true);
//                     setLoading(false);
//                 } finally {
//                     setLoading(false);
//                 }
//             } else {
//                 onSubmitSuccess(initialData);
//             }
//         }
//     };

//     return (
//         <div className="w-full bg-transparent">
//             <div>
//                 {message.ouvre && (
//                     <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
//                         <Alert onClose={() => setOpen(false)} severity={message.statut} variant="filled" sx={{ width: "100%" }}>
//                             {message.texte}
//                         </Alert>
//                     </Snackbar>
//                 )}
//             </div>
//             <form onSubmit={handleSubmit}>
//                 <div className="flex w-full flex-col px-1">
                    
//                     {/* Section Adresse de Livraison */}
//                     <div className="mb-6 flex items-center justify-center gap-4 text-xl">
//                         <MdLocationOn className="text-accent" />
//                         <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Livraison</span>
//                     </div>

//                     {isUserConnected && (
//                         <div className="flex w-full items-center justify-center">
//                             <div className="w-full">
//                                 {/* Affichage par défaut : liste des adresses existantes */}
//                                 {!showNewAddressForm ? (
//                                     <div className="w-full">
//                                         {chargementAdresses ? ( 
//                                             <div className="flex justify-center py-4">
//                                                 <div className="loading loading-spinner loading-xl text-accent"></div>
//                                                 <span className="ml-2">Récupération de vos adresses...</span>
//                                             </div>
//                                         ) : adressesClient.length > 0 ? (
//                                             <div>
//                                                 <div className="flex w-full flex-col items-start justify-center gap-4 mb-4">
//                                                     {adressesClient.map((adresse) => (
//                                                         <AddressCard
//                                                             key={adresse.id}
//                                                             address={adresse}
//                                                             isSelected={adresseSelectionnee?.id === adresse.id}
//                                                             onSelect={gererSelectionAdresse}
//                                                             onEdit={handleEditAddress}
//                                                         />
//                                                     ))}
//                                                 </div>
//                                                 {/* Bouton pour ajouter une nouvelle adresse */}
//                                                 <div className="flex justify-center mt-4">
//                                                     <button
//                                                         type="button"
//                                                         onClick={handleAddNewAddress}
//                                                         className="btn btn-outline btn-accent"
//                                                     >
//                                                         <MdAddLocation className="mr-2" />
//                                                         Ajouter une nouvelle adresse
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             // Cas où l'utilisateur n'a aucune adresse
//                                             <div className="justify-center items-center space-y-2">
//                                                         <div className="text-center p-4 bg-yellow-50 rounded-lg">
//                                                             <Typography className="text-yellow-700 mb-4">
//                                                                 Vous n'avez pas d'adresse enregistrée.
//                                                             </Typography>
//                                                         </div>
//                                                         <div className="w-full flex justify-center items-center">
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={handleAddNewAddress}
//                                                                 className="btn btn-outline btn-accent"
//                                                             >
//                                                                 <MdAddLocation className="mr-2" />
//                                                                 Créer votre première adresse
//                                                             </button>
//                                                         </div>
                                                       
//                                                     </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     /* Formulaire de nouvelle adresse (uniquement quand showNewAddressForm est true) */
//                                     <div className={`my-3 flex w-full flex-col items-center justify-center py-3 transition-all duration-500 ease-in-out overflow-hidden`}>
//                                         <div className="mb-4 flex items-center justify-center gap-2 text-lg">
//                                             <MdLocationOn className="text-accent" />
//                                             <span className="font-gothic text-black opacity-70 dark:text-white">Nouvelle Adresse de Livraison</span>
//                                         </div>
                                        
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             largeur="2/3"
//                                             placeholder="Ex: Fianarantsoa..."
//                                             title="Ville"
//                                             name="ville"
//                                             value={data.ville || ""}
//                                             onChange={(val) => handleChange({ target: { name: "ville", value: val } })}
//                                             error={!!errors.ville}
//                                             helperText={errors.ville}
//                                             ClassIcone="text-accent"
//                                         />
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             largeur="2/3"
//                                             placeholder="Ex: 301..."
//                                             title="Code Postal"
//                                             name="codePostal"
//                                             value={data.codePostal || ""}
//                                             onChange={(val) => handleChange({ target: { name: "codePostal", value: val } })}
//                                             error={!!errors.codePostal}
//                                             helperText={errors.codePostal}
//                                             ClassIcone="text-accent"
//                                         />
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             largeur="2/3"
//                                             placeholder="Ex: AV13/3609..."
//                                             title="Lot d'Adresse"
//                                             name="lot"
//                                             value={data.lot || ""}
//                                             onChange={(val) => handleChange({ target: { name: "lot", value: val } })}
//                                             error={!!errors.lot}
//                                             helperText={errors.lot}
//                                             ClassIcone="text-accent"
//                                         />
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             largeur="2/3"
//                                             placeholder="Ex: Imandry..."
//                                             title="Quartier"
//                                             name="quartier"
//                                             value={data.quartier || ""}
//                                             onChange={(val) => handleChange({ target: { name: "quartier", value: val } })}
//                                             error={!!errors.quartier}
//                                             helperText={errors.quartier}
//                                             ClassIcone="text-accent"
//                                         />
                                       
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             largeur="2/3"
//                                             optionel
//                                             placeholder="Ex: Chez moi..."
//                                             title="Labelle d'Adresse"
//                                             name="labelle"
//                                             value={data.labelle  || ""}
//                                             onChange={(val) => handleChange({ target: { name: "labelle", value: val } })}
//                                             error={!!errors.labelle}
//                                             helperText={errors.labelle}
//                                             ClassIcone="text-accent"
//                                         />
//                                         <div className="flex w-full items-center justify-center">
//                                             <label className="mb-5 w-2/3 items-center justify-center">
//                                                 <div className="label">
//                                                     <span className={`label-text ${errorInfos ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
//                                                         Complement d'Adresse <span className="text-red-500">*</span>
//                                                     </span>
//                                                 </div>
//                                                 <textarea
//                                                     value={descriptionAdresse}
//                                                     onChange={(e) => setDescriptionAdresse(e.target.value)}
//                                                     className={`textarea textarea-bordered h-[100px] w-full border ${errorInfos ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
//                                                     placeholder="Décrire plus d'information sur votre adresse..."
//                                                 ></textarea>
//                                                 {errorInfos && <p className="text-sm text-red-500">{errorInfos}</p>}
//                                             </label>
//                                         </div>

//                                         {/* Boutons pour le formulaire de nouvelle adresse */}
//                                         <div className="flex gap-4 mt-4">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleCancelNewAddress}
//                                                 className="btn btn-outline btn-error"
//                                             >
//                                                 Annuler
//                                             </button>
//                                             <button
//                                                 type="button" 
//                                                 className="btn btn-success"
//                                                 disabled={loading}
//                                                 onClick={handleCreateAddress}
//                                             >
//                                                 {loading ? (
//                                                     <div className="flex items-center gap-2">
//                                                         <span className="loading loading-spinner"></span>
//                                                         Création...
//                                                     </div>
//                                                 ) : (
//                                                     "Créer l'adresse"
//                                                 )}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Checkbox pour adresse de facturation différente */}
//                     <div className="my-6 flex justify-center">
//                         <label className="flex items-center space-x-3 cursor-pointer">
//                             <Checkbox
//                                 checked={utiliserFacturationDifferent}
//                                 onChange={(e) => setUtiliserFacturationDifferent(e.target.checked)}
//                                 color="accent"
//                             />
//                             <span className="text-gray-700 dark:text-gray-300 font-medium">
//                                 Utiliser une autre adresse pour l'adresse de facturation
//                             </span>
//                         </label>
//                     </div>

//                     {/* Section Adresse de Facturation */}
//                     {utiliserFacturationDifferent && (
//                         <div className="mt-4 p-4">
//                             <div className="mb-4 flex items-center justify-center gap-4 text-xl">
//                                 <MdBusiness className="text-blue-500" />
//                                 <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Facturation</span>
//                             </div>

//                             {isUserConnected && (
//                                 <div className="flex w-full items-center justify-center mb-4">
//                                     <div className="w-full">
//                                         {/* Affichage par défaut : liste des adresses existantes pour la facturation */}
//                                         {!showNewBillingAddressForm ? (
//                                             <div className="w-full">
//                                                 {adressesClient.length > 0 ? (
//                                                     <div>
//                                                         <div className="flex w-full flex-col items-start justify-center gap-4 mb-4">
//                                                             {adressesClient.map((adresse) => (
//                                                                 <AddressCard
//                                                                     key={adresse.id + "-facturation"}
//                                                                     address={adresse}
//                                                                     isSelected={adresseFacturationSelectionnee?.id === adresse.id}
//                                                                     onSelect={gererSelectionAdresseFacturation}
//                                                                     onEdit={handleEditAddress}
//                                                                     isBilling={true}
//                                                                 />
//                                                             ))}
//                                                         </div>
//                                                         {/* Bouton pour ajouter une nouvelle adresse de facturation */}
//                                                         <div className="flex justify-center mt-4">
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={handleAddNewBillingAddress}
//                                                                 className="btn btn-outline btn-accent"
//                                                             >
//                                                                 <MdAddLocation className="mr-2" />
//                                                                 Ajouter une nouvelle adresse de facturation
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     // Cas où l'utilisateur n'a aucune adresse
//                                                     <div className="justify-center items-center space-y-2">
//                                                         <div className="text-center p-4 bg-yellow-50 rounded-lg">
//                                                             <Typography className="text-yellow-700 mb-4">
//                                                                 Vous n'avez pas d'adresse enregistrée.
//                                                             </Typography>
//                                                         </div>
//                                                         <div className="w-full flex justify-center items-center">
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={handleAddNewBillingAddress}
//                                                                 className="btn btn-outline btn-accent"
//                                                             >
//                                                                 <MdAddLocation className="mr-2" />
//                                                                 Créer une adresse de facturation
//                                                             </button>
//                                                         </div>
                                                       
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             /* Formulaire de nouvelle adresse de facturation */
//                                             <div className={`my-3 flex w-full flex-col shadow-md shadow-slate-300 dark:shadow-black rounded-xl items-center justify-center py-3 transition-colors duration-500 ease-in-out overflow-hidden`}>
//                                                 <div className="mb-4 flex items-center justify-center gap-2 text-lg">
//                                                     <MdLocationOn className="text-accent" />
//                                                     <span className="font-bold text-black opacity-80 dark:text-white">Nouvelle Adresse de Facturation</span>
//                                                 </div>
                                               
//                                                 <InputValidate
//                                                     IconComponent={MdLocationOn}
//                                                     type="text"
//                                                     largeur="2/3"
//                                                     placeholder="Ex: Fianarantsoa..."
//                                                     title="Ville"
//                                                     name="ville"
//                                                     value={donneesFacturation.ville || ""}
//                                                     onChange={(val) => gererChangementFacturation({ target: { name: "ville", value: val } })}
//                                                     error={!!erreursFacturation.ville}
//                                                     helperText={erreursFacturation.ville}
//                                                     ClassIcone="text-accent"
//                                                 />
//                                                 <InputValidate
//                                                     IconComponent={MdLocationOn}
//                                                     type="text"
//                                                     largeur="2/3"
//                                                     placeholder="Ex: 301..."
//                                                     title="Code Postal"
//                                                     name="codePostal"
//                                                     value={donneesFacturation.codePostal || ""}
//                                                     onChange={(val) => gererChangementFacturation({ target: { name: "codePostal", value: val } })}
//                                                     error={!!erreursFacturation.codePostal}
//                                                     helperText={erreursFacturation.codePostal}
//                                                     ClassIcone="text-accent"
//                                                 />
//                                                 <InputValidate
//                                                     IconComponent={MdLocationOn}
//                                                     type="text"
//                                                     largeur="2/3"
//                                                     placeholder="Ex: AV13/3609..."
//                                                     title="Lot d'Adresse"
//                                                     name="lot"
//                                                     value={donneesFacturation.lot || ""}
//                                                     onChange={(val) => gererChangementFacturation({ target: { name: "lot", value: val } })}
//                                                     error={!!erreursFacturation.lot}
//                                                     helperText={erreursFacturation.lot}
//                                                     ClassIcone="text-accent"
//                                                 />
//                                                 <InputValidate
//                                                     IconComponent={MdLocationOn}
//                                                     type="text"
//                                                     largeur="2/3"
//                                                     placeholder="Ex: Imandry..."
//                                                     title="Quartier"
//                                                     name="quartier"
//                                                     value={donneesFacturation.quartier || ""}
//                                                     onChange={(val) => gererChangementFacturation({ target: { name: "quartier", value: val } })}
//                                                     error={!!erreursFacturation.quartier}
//                                                     helperText={erreursFacturation.quartier}
//                                                     ClassIcone="text-accent"
//                                                 />
                                               
//                                                 <InputValidate
//                                                     IconComponent={MdLocationOn}
//                                                     type="text"
//                                                     largeur="2/3"
//                                                     optionel
//                                                     placeholder="Ex: Chez moi..."
//                                                     title="Labelle d'Adresse"
//                                                     name="labelle"
//                                                     value={donneesFacturation.labelle  || ""}
//                                                     onChange={(val) => gererChangementFacturation({ target: { name: "labelle", value: val } })}
//                                                     error={!!erreursFacturation.labelle}
//                                                     helperText={erreursFacturation.labelle}
//                                                     ClassIcone="text-accent"
//                                                 />
//                                                 <div className="flex w-full items-center justify-center">
//                                                     <label className="mb-5 w-2/3 items-center justify-center">
//                                                         <div className="label">
//                                                             <span className={`label-text ${erreursFacturation.description ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
//                                                                 Complement d'Adresse <span className="text-red-500">*</span>
//                                                             </span>
//                                                         </div>
//                                                         <textarea
//                                                             value={descriptionFacturation}
//                                                             onChange={(e) => setDescriptionFacturation(e.target.value)}
//                                                             className={`textarea textarea-bordered h-[100px] w-full border ${erreursFacturation.description ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
//                                                             placeholder="Décrire plus d'information sur votre adresse..."
//                                                         ></textarea>
//                                                         {erreursFacturation.description && <p className="text-sm text-red-500">{erreursFacturation.description}</p>}
//                                                     </label>
//                                                 </div>

//                                                 {/* Boutons pour le formulaire de nouvelle adresse de facturation */}
//                                                 <div className="flex gap-4 mt-4">
//                                                     <button
//                                                         type="button"
//                                                         onClick={handleCancelNewBillingAddress}
//                                                         className="btn btn-outline btn-error"
//                                                     >
//                                                         Annuler
//                                                     </button>
//                                                     <button
//                                                        type="button" // IMPORTANT: type="button" pour éviter la soumission du formulaire principal
//                                                        onClick={handleCreateAddress} // Utiliser handleCreateAddress au lieu de handleSubmit                   
//                                                         className="btn btn-success"
//                                                         disabled={loading}
//                                                     >
//                                                         {loading ? (
//                                                             <div className="flex items-center gap-2">
//                                                                 <span className="loading loading-spinner"></span>
//                                                                 Création...
//                                                             </div>
//                                                         ) : (
//                                                             "Créer l'adresse de facturation"
//                                                         )}
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Bouton de soumission principal */}
//                     {!showNewAddressForm && !showNewBillingAddressForm && (
//                         <div className="mt-6 flex justify-center">
//                             <button
//                                 type="submit"
//                                 className="btn btn-accent btn-outline btn-wide"
//                                 disabled={loading}
//                             >
//                                 {loading ? ( 
//                                     <div className="flex flex-row justify-center items-center gap-2">
//                                         <span className="loading loading-spinner text-accent"></span>
//                                         <span>Validation en cours...</span>
//                                     </div>
//                                 ) : (
//                                     "Valider la commande"
//                                 )}
//                             </button>
//                         </div>
//                     )}
                    
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default FormAdresse;













// // import React, { useEffect, useRef, useState } from "react";
// // import Alert from "@mui/material/Alert";
// // import Snackbar from "@mui/material/Snackbar";
// // import { useAuth } from "../../../hook/useAuth";
// // import { getClientAddresses, updateClientAddress } from "@/services/ClientService";
// // import FormControl from "@mui/material/FormControl";
// // import { InputValidate } from "@/components/InputValidate";
// // import { createCommandePanier, updateCommandePanier } from "@/services/ClientService";
// // import { MdLocationOn, MdAddLocation, MdHome, MdBusiness } from "react-icons/md";
// // import { usePanier } from "@/Client/context/PanierContext";
// // import { FaMapMarkerAlt } from "react-icons/fa";
// // import AddressCard from "@/components/AddressCard";
// // import { Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Button, Checkbox } from "@mui/material";

// // // Fonction de comparaison de valeur initial et la valeur modifier
// // function IsChangedData(current, initial) {
// //     if (!current || !initial) return true;
    
// //     const livraisonCurent = current.adresseLivraison || {};
// //     const facturationCurent = current.adresseFacturation || {};
// //     const livraisonInitial = initial.adresseLivraison || {};
// //     const facturationInitial = initial.adresseFacturation || {};
    
// //     const compare = (curr, init) => {
// //         if (!curr && !init) return false;
// //         if (!curr || !init) return true;
        
// //         return (
// //             curr.id !== init.id ||
// //             curr.codePostal !== init.codePostal ||
// //             (curr.labelle || curr.LabelleAdresse) !== (init.labelle || init.LabelleAdresse) || 
// //             curr.complement !== init.complement ||
// //             curr.description !== init.description ||
// //             curr.lot !== init.lot ||
// //             curr.quartier !== init.quartier ||
// //             curr.ville !== init.ville 
// //         ); 
// //     };
    
// //     return compare(livraisonCurent, livraisonInitial) || compare(facturationCurent, facturationInitial);
// // }

// // const FormAdresse = ({ initialData, onSubmitSuccess }) => {
// //     const { user, isAuthenticated } = useAuth();
// //     const [loading, setLoading] = useState(false);
// //     const { items } = usePanier();
    
// //     // États pour les nouvelles adresses (toujours vides au début)
// //     const [data, setData] = useState({});
// //     const [donneesFacturation, setDonneesFacturation] = useState({});
    
// //     const [errors, setErrors] = useState({});
// //     const [errorInfos, setErrorInfos] = useState(null);
// //     const [open, setOpen] = useState(false);
// //     const initial = useRef(initialData);
    
// //     const [descriptionAdresse, setDescriptionAdresse] = useState("");
// //     const [adressesClient, setAdressesClient] = useState([]);
// //     const [chargementAdresses, setChargementAdresses] = useState(false);

// //     const [message, setMessage] = useState({
// //         ouvre: false,
// //         texte: "vide",
// //         statut: "success",
// //     });

// //     //  États pour gérer l'affichage des formulaires
// //     const [showNewAddressForm, setShowNewAddressForm] = useState(false);
// //     const [showNewBillingAddressForm, setShowNewBillingAddressForm] = useState(false);

// //     // États de sélection
// //     const [adresseSelectionnee, setAdresseSelectionnee] = useState(null);
// //     const [adresseFacturationSelectionnee, setAdresseFacturationSelectionnee] = useState(null);

// //     const [utiliserFacturationDifferent, setUtiliserFacturationDifferent] = useState(
// //         initialData?.AdresseDifferent || false
// //     );

// //     const [erreursFacturation, setErreursFacturation] = useState({});
// //     const [descriptionFacturation, setDescriptionFacturation] = useState("");

// //     const isUserConnected = isAuthenticated;

// //     useEffect(() => {
// //         getAdresses();
// //     }, [isUserConnected, user]);

// //     useEffect(() => {
// //         if (initialData && adressesClient.length > 0) {
// //             // Initialiser l'adresse de livraison depuis les données initiales
// //             if (initialData.adresseLivraison?.estAdresseExistante && initialData.adresseLivraison?.id) {
// //                 const adresseTrouvee = adressesClient.find(adresse => 
// //                     adresse.id === initialData.adresseLivraison.id
// //                 );
// //                 if (adresseTrouvee) {
// //                     setAdresseSelectionnee(adresseTrouvee);
// //                 }
// //             }

// //             // Initialiser l'adresse de facturation depuis les données initiales
// //             if (initialData.adresseFacturation?.estAdresseExistante && initialData.adresseFacturation?.id) {
// //                 const adresseFacturationTrouvee = adressesClient.find(adresse => 
// //                     adresse.id === initialData.adresseFacturation.id
// //                 );
// //                 if (adresseFacturationTrouvee) {
// //                     setAdresseFacturationSelectionnee(adresseFacturationTrouvee);
// //                 }
// //             }
// //         }
// //     }, [initialData, adressesClient]);

// //     const getAdresses = async () => {
// //         if (isUserConnected && user.client) {
// //             setChargementAdresses(true);
// //             try {
// //                 const reponseAdresses = await getClientAddresses();
// //                 const listeAdresses = reponseAdresses.adresse;
// //                 if (listeAdresses && listeAdresses.length > 0) {
// //                     setAdressesClient(listeAdresses);
                    
// //                     // Si pas de données initiales, sélectionner la première adresse par défaut
// //                     if (!initialData && listeAdresses.length > 0) {
// //                         setAdresseSelectionnee(listeAdresses[0]);
// //                         setAdresseFacturationSelectionnee(listeAdresses[0]);
// //                     }
                    
// //                     setChargementAdresses(false);
// //                 } else {
// //                     setAdressesClient([]);
// //                     setChargementAdresses(false);
// //                 }
// //             } catch (erreur) {
// //                 console.log("Erreur de connexion:", erreur);
// //                 setMessage({
// //                     ouvre: true,
// //                     texte: `Échec de la connexion. Vérifiez votre connexion.`,
// //                     statut: "error",
// //                 });
// //                 setOpen(true);
// //                 setChargementAdresses(false);
// //             } finally {
// //                 setChargementAdresses(false);
// //             }
// //         }
// //     };

// //     // Fonction pour gérer la modification d'adresse
// //     const handleEditAddress = async (editedAddress) => {
// //         try {
// //             const response = await updateClientAddress(editedAddress);
// //             if (response) {
// //                 // Mettre à jour la liste des adresses
// //                 await getAdresses();
                
// //                 // Mettre à jour la sélection si l'adresse modifiée est actuellement sélectionnée
// //                 if (adresseSelectionnee && adresseSelectionnee.id === editedAddress.id) {
// //                     setAdresseSelectionnee(editedAddress);
// //                 }
// //                 if (adresseFacturationSelectionnee && adresseFacturationSelectionnee.id === editedAddress.id) {
// //                     setAdresseFacturationSelectionnee(editedAddress);
// //                 }
                
// //                 setMessage({
// //                     ouvre: true,
// //                     texte: "Adresse modifiée avec succès",
// //                     statut: "success",
// //                 });
// //                 setOpen(true);
// //             }
// //         } catch (error) {
// //             console.error("Erreur lors de la modification de l'adresse:", error);
// //             setMessage({
// //                 ouvre: true,
// //                 texte: "Erreur lors de la modification de l'adresse",
// //                 statut: "error",
// //             });
// //             setOpen(true);
// //         }
// //     };

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setData((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
// //         setErrors((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
// //     };

// //     const gererChangementFacturation = (e) => {
// //         const { name, value } = e.target;
// //         setDonneesFacturation((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
// //         setErreursFacturation((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
// //     };

// //     const gererSelectionAdresse = (adresse) => {
// //         setAdresseSelectionnee(adresse);
// //     };

// //     const gererSelectionAdresseFacturation = (adresse) => {
// //         setAdresseFacturationSelectionnee(adresse);
// //     };

// //     // Fonction pour gérer l'ajout d'une nouvelle adresse
// //     const handleAddNewAddress = () => {
// //         setShowNewAddressForm(true);
// //         setAdresseSelectionnee(null); // Désélectionner toute adresse existante
// //         setData({}); // Vider le formulaire
// //         setDescriptionAdresse("");
// //     };

// //     // Fonction pour annuler la création d'une nouvelle adresse
// //     const handleCancelNewAddress = () => {
// //         setShowNewAddressForm(false);
// //         // Resélectionner la première adresse si disponible
// //         if (adressesClient.length > 0 && !adresseSelectionnee) {
// //             setAdresseSelectionnee(adressesClient[0]);
// //         }
// //     };

// //     //  Fonction pour gérer l'ajout d'une nouvelle adresse de facturation
// //     const handleAddNewBillingAddress = () => {
// //         setShowNewBillingAddressForm(true);
// //         setAdresseFacturationSelectionnee(null);
// //         setDonneesFacturation({});
// //         setDescriptionFacturation("");
// //     };

// //     // Fonction pour annuler la création d'une nouvelle adresse de facturation
// //     const handleCancelNewBillingAddress = () => {
// //         setShowNewBillingAddressForm(false);
// //         // Resélectionner la première adresse si disponible
// //         if (adressesClient.length > 0 && !adresseFacturationSelectionnee) {
// //             setAdresseFacturationSelectionnee(adressesClient[0]);
// //         }
// //     };

// //     const validate = () => {
// //         let tempErrors = {};
// //         let isValid = true;

// //         // Validation adresse de livraison
// //         if (showNewAddressForm) {
// //             // Validation pour nouvelle adresse
// //             if (!data.labelle || data.labelle.trim() === "") {
// //                 tempErrors.labelle = "Mentionner le labelle de votre adresse, Ce champ est requis.";
// //                 isValid = false;
// //             }
// //             if (!data.ville || data.ville.trim() === "") {
// //                 tempErrors.ville = "Obligatoire, Le nom du ville doit être existe.";
// //                 isValid = false;
// //             }
// //             if (!data.codePostal || !/\d+$/.test(data.codePostal)) {
// //                 tempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
// //                 isValid = false;
// //             }
// //             if (!data.quartier || data.quartier.trim() === "") {
// //                 tempErrors.quartier = "Nous ne pouvons livré votre produit sans quartier, cette champ est requis.";
// //                 isValid = false;
// //             }
// //             if (!data.lot || data.lot.trim() === "") {
// //                 tempErrors.lot = "Obligatoire, c'est important pour nous connaitre votre adresse précis";
// //                 isValid = false;
// //             }
// //             if (!descriptionAdresse || descriptionAdresse.trim() === "") {
// //                 setErrorInfos("La description doit contient au moins 4 caractères.");
// //                 isValid = false;
// //             }
// //         } else {
// //             // Validation pour adresse existante
// //             if (!adresseSelectionnee) {
// //                 tempErrors.adresse = "Veuillez sélectionner une adresse";
// //                 isValid = false;
// //             }
// //         }

// //         setErrors(tempErrors);

// //         // Validation adresse de facturation
// //         if (utiliserFacturationDifferent) {
// //             let factureTempErrors = {};

// //             if (showNewBillingAddressForm) {
// //                 // Validation pour nouvelle adresse de facturation
// //                 if (!donneesFacturation.labelle || donneesFacturation.labelle.trim() === "") {
// //                     factureTempErrors.labelle = "Mentionner le labelle de votre adresse de facturation, Ce champ est requis.";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.ville || donneesFacturation.ville.trim() === "") {
// //                     factureTempErrors.ville = "Obligatoire pour la facturation, Le nom du ville doit être existe.";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.codePostal || !/\d+$/.test(donneesFacturation.codePostal)) {
// //                     factureTempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.quartier || donneesFacturation.quartier.trim() === "") {
// //                     factureTempErrors.quartier = "Le quartier est requis pour la facturation.";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.lot || donneesFacturation.lot.trim() === "") {
// //                     factureTempErrors.lot = "Obligatoire pour la facturation, c'est important pour nous connaitre votre adresse précis";
// //                     isValid = false;
// //                 }
// //                 if (!descriptionFacturation || descriptionFacturation.trim() === "") {
// //                     factureTempErrors.description = "La description de l'adresse de facturation doit contient au moins 4 caractères.";
// //                     isValid = false;
// //                 }
// //             } else {
// //                 // Validation pour adresse de facturation existante
// //                 if (!adresseFacturationSelectionnee) {
// //                     factureTempErrors.adresseFacturation = "Veuillez sélectionner une adresse de facturation";
// //                     isValid = false;
// //                 }
// //             }

// //             setErreursFacturation(factureTempErrors);
// //         }

// //         return isValid;
// //     };

// //     // Ajoutez cette fonction utilitaire pour comparer les adresses
// // const findNewAddress = (oldList, newList) => {
// //     if (!oldList || !newList || newList.length <= oldList.length) return null;
    
// //     // Trouver l'adresse qui n'était pas dans l'ancienne liste
// //     for (let newAddr of newList) {
// //         const existsInOld = oldList.some(oldAddr => oldAddr.id === newAddr.id);
// //         if (!existsInOld) {
// //             return newAddr;
// //         }
// //     }
// //     return newList[0]; // Fallback: première adresse de la nouvelle liste
// // };

// // // Puis modifiez la partie après getAdresses() :
// // if (showNewAddressForm) {
// //     const anciennesAdresses = adressesClient; // Sauvegarder l'ancienne liste
// //     const nouvellesAdresses = await getAdresses();
// //     if (nouvellesAdresses && nouvellesAdresses.length > 0) {
// //         // Trouver et sélectionner la nouvelle adresse créée
// //         const nouvelleAdresse = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
// //         setAdresseSelectionnee(nouvelleAdresse);
        
// //         // Si on n'utilise pas d'adresse de facturation différente, mettre à jour aussi l'adresse de facturation
// //         if (!utiliserFacturationDifferent) {
// //             setAdresseFacturationSelectionnee(nouvelleAdresse);
// //         }
// //     }
// //     setShowNewAddressForm(false);
// // }

// // if (showNewBillingAddressForm) {
// //     const anciennesAdresses = adressesClient; // Sauvegarder l'ancienne liste
// //     const nouvellesAdresses = await getAdresses();
// //     if (nouvellesAdresses && nouvellesAdresses.length > 0) {
// //         // Trouver et sélectionner la nouvelle adresse de facturation créée
// //         const nouvelleAdresseFacturation = findNewAddress(anciennesAdresses, nouvellesAdresses) || nouvellesAdresses[0];
// //         setAdresseFacturationSelectionnee(nouvelleAdresseFacturation);
// //     }
// //     setShowNewBillingAddressForm(false);
// // }

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
       
// //         if (validate()) {
// //             let donneesAdresse;
            
// //             // Construction des données d'adresse
// //             if (showNewAddressForm) {
// //                 // Utiliser la nouvelle adresse créée
// //                 donneesAdresse = {
// //                     adresseLivraison: {
// //                         ...data,
// //                         estAdresseExistante: false,
// //                         refAdresse: null,
// //                         description: descriptionAdresse,
// //                     },
// //                     adresseFacturation: utiliserFacturationDifferent ? 
// //                         (showNewBillingAddressForm ? {
// //                             ...donneesFacturation,
// //                             estAdresseExistante: false,
// //                             refAdresse: null,
// //                             description: descriptionFacturation,
// //                         } : {
// //                             ...adresseFacturationSelectionnee,
// //                             estAdresseExistante: true,
// //                             refAdresse: adresseFacturationSelectionnee.id,
// //                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
// //                         }) : {
// //                             ...data,
// //                             estAdresseExistante: false,
// //                             description: descriptionAdresse,
// //                         },
// //                     AdresseDifferent: utiliserFacturationDifferent
// //                 };
// //             } else {
// //                 // Utiliser l'adresse existante sélectionnée
// //                 donneesAdresse = {
// //                     adresseLivraison: {
// //                         ...adresseSelectionnee,
// //                         estAdresseExistante: true,
// //                         refAdresse: adresseSelectionnee.id,
// //                         description: descriptionAdresse || adresseSelectionnee.complement,
// //                     },
// //                     adresseFacturation: utiliserFacturationDifferent ? 
// //                         (showNewBillingAddressForm ? {
// //                             ...donneesFacturation,
// //                             estAdresseExistante: false,
// //                             refAdresse: null,
// //                             description: descriptionFacturation,
// //                         } : {
// //                             ...adresseFacturationSelectionnee,
// //                             estAdresseExistante: true,
// //                             refAdresse: adresseFacturationSelectionnee.id,
// //                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
// //                         }) : {
// //                             ...adresseSelectionnee,
// //                             estAdresseExistante: true,
// //                             refAdresse: adresseSelectionnee.id,
// //                             description: descriptionAdresse || adresseSelectionnee.complement,
// //                         },
// //                     AdresseDifferent: utiliserFacturationDifferent
// //                 };
// //             }
            
// //             setLoading(true);
// //             console.log("Données adresse à envoyer:", donneesAdresse);
            
// //             if (IsChangedData(donneesAdresse, initialData)) {
// //                 try {
// //                     const panier = JSON.parse(localStorage.getItem("panier")) || items;
// //                     if (panier.length > 0) {
// //                         const commandeExiste = localStorage.getItem('RefCommande');
// //                         let refCommandeNettoyee = null;
                        
// //                         if (commandeExiste) {
// //                             try {
// //                                 refCommandeNettoyee = JSON.parse(commandeExiste);
// //                             } catch (e) {
// //                                 refCommandeNettoyee = commandeExiste;
// //                             }
                            
// //                             if (typeof refCommandeNettoyee === 'string') {
// //                                 refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
// //                             }
// //                         }

// //                         if (refCommandeNettoyee) {
// //                             // Mise à jour de commande existante
// //                             const dataCommandeUpdate = {
// //                                 adresse: donneesAdresse,
// //                                 refCommande: refCommandeNettoyee
// //                             };
                            
// //                             const response = await updateCommandePanier(dataCommandeUpdate);
                            
// //                             if (response.data) {
// //                                 console.log("Commande mis à jour avec succès:", response.data);
// //                                 localStorage.setItem('RefCommande', response.data.refCommande);
// //                                 localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
// //                                 //  Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
// //                                 if (showNewAddressForm) {
// //                                     await getAdresses();
// //                                     // La nouvelle adresse sera automatiquement disponible dans la liste
// //                                     setShowNewAddressForm(false);
// //                                 }
// //                                 if (showNewBillingAddressForm) {
// //                                     setShowNewBillingAddressForm(false);
// //                                 }
                                
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Votre commande a été mis à jour avec succès.",
// //                                     statut: "success",
// //                                 });
// //                                 setOpen(true);
// //                                 onSubmitSuccess(donneesAdresse);
// //                             } else {
// //                                 console.log("Erreur de commande: ", response.error);
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer.",
// //                                     statut: "error",
// //                                 });
// //                                 setOpen(true);
// //                             }
// //                         } else {
// //                             // Créer nouvelle commande
// //                             const dataCommandeCreate = {
// //                                 adresse: donneesAdresse
// //                             };
                            
// //                             const response = await createCommandePanier(dataCommandeCreate);
                            
// //                             if (response.data) {
// //                                 console.log("Commande créée avec succès:", response.data);
// //                                 localStorage.setItem('RefCommande', response.data.refCommande);
// //                                 localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
// //                                 // Si une nouvelle adresse a été créée, recharger la liste
// //                                 if (showNewAddressForm || showNewBillingAddressForm) {
// //                                     await getAdresses();
// //                                     setShowNewAddressForm(false);
// //                                     setShowNewBillingAddressForm(false);
// //                                 }
                                
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Votre commande a été créée avec succès.",
// //                                     statut: "success",
// //                                 });
// //                                 setOpen(true);
// //                                 onSubmitSuccess(donneesAdresse);
// //                             } else {
// //                                 console.log("Erreur de commande: ", response.error);
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
// //                                     statut: "error",
// //                                 });
// //                                 setOpen(true);
// //                             }
// //                         }
// //                     } else {
// //                         setMessage({
// //                             ouvre: true,
// //                             texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
// //                             statut: "warning",
// //                         });
// //                         setOpen(true);
// //                     }
// //                     setLoading(false);
// //                 } catch (error) {
// //                     console.error(" Erreur création commande:", error);
// //                     setMessage({
// //                         ouvre: true,
// //                         texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
// //                         statut: "error",
// //                     });
// //                     setOpen(true);
// //                     setLoading(false);
// //                 } finally {
// //                     setLoading(false);
// //                 }
// //             } else {
// //                 onSubmitSuccess(initialData);
// //             }
// //         }
// //     };

// //     return (
// //         <div className="w-full bg-transparent">
// //             <div>
// //                 {message.ouvre && (
// //                     <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
// //                         <Alert onClose={() => setOpen(false)} severity={message.statut} variant="filled" sx={{ width: "100%" }}>
// //                             {message.texte}
// //                         </Alert>
// //                     </Snackbar>
// //                 )}
// //             </div>
// //             <form onSubmit={handleSubmit}>
// //                 <div className="flex w-full flex-col px-1">
                    
// //                     {/* Section Adresse de Livraison */}
// //                     <div className="mb-6 flex items-center justify-center gap-4 text-xl">
// //                         <MdLocationOn className="text-accent" />
// //                         <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Livraison</span>
// //                     </div>

// //                     {isUserConnected && (
// //                         <div className="flex w-full items-center justify-center">
// //                             <div className="w-full">
// //                                 {/* Affichage par défaut : liste des adresses existantes */}
// //                                 {!showNewAddressForm ? (
// //                                     <div className="w-full">
// //                                         {chargementAdresses ? ( 
// //                                             <div className="flex justify-center py-4">
// //                                                 <div className="loading loading-spinner loading-xl text-accent"></div>
// //                                                 <span className="ml-2">Récupération de vos adresses...</span>
// //                                             </div>
// //                                         ) : adressesClient.length > 0 ? (
// //                                             <div>
// //                                                 <div className="flex w-full flex-col items-start justify-center gap-4 mb-4">
// //                                                     {adressesClient.map((adresse) => (
// //                                                         <AddressCard
// //                                                             key={adresse.id}
// //                                                             address={adresse}
// //                                                             isSelected={adresseSelectionnee?.id === adresse.id}
// //                                                             onSelect={gererSelectionAdresse}
// //                                                             onEdit={handleEditAddress}
// //                                                         />
// //                                                     ))}
// //                                                 </div>
// //                                                 {/* Bouton pour ajouter une nouvelle adresse */}
// //                                                 <div className="flex justify-center mt-4">
// //                                                     <button
// //                                                         type="button"
// //                                                         onClick={handleAddNewAddress}
// //                                                         className="btn btn-outline btn-accent"
// //                                                     >
// //                                                         <MdAddLocation className="mr-2" />
// //                                                         Ajouter une nouvelle adresse
// //                                                     </button>
// //                                                 </div>
// //                                             </div>
// //                                         ) : (
// //                                             // Cas où l'utilisateur n'a aucune adresse
// //                                             <div className="text-center p-4 bg-yellow-50 rounded-lg">
// //                                                 <Typography className="text-yellow-700 mb-4">
// //                                                     Vous n'avez pas d'adresse enregistrée.
// //                                                 </Typography>
// //                                                 <button
// //                                                     type="button"
// //                                                     onClick={handleAddNewAddress}
// //                                                     className="btn btn-accent"
// //                                                 >
// //                                                     <MdAddLocation className="mr-2" />
// //                                                     Créer votre première adresse
// //                                                 </button>
// //                                             </div>
// //                                         )}
// //                                     </div>
// //                                 ) : (
// //                                     /* Formulaire de nouvelle adresse (uniquement quand showNewAddressForm est true) */
// //                                     <div className={`my-3 flex w-full flex-col items-center justify-center py-3 transition-all duration-500 ease-in-out overflow-hidden`}>
// //                                         <div className="mb-4 flex items-center justify-center gap-2 text-lg">
// //                                             <MdLocationOn className="text-accent" />
// //                                             <span className="font-gothic text-black opacity-70 dark:text-white">Nouvelle Adresse de Livraison</span>
// //                                         </div>
                                        
// //                                         <InputValidate
// //                                             IconComponent={MdLocationOn}
// //                                             type="text"
// //                                             largeur="2/3"
// //                                             placeholder="Ex: Fianarantsoa..."
// //                                             title="Ville"
// //                                             name="ville"
// //                                             value={data.ville || ""}
// //                                             onChange={(val) => handleChange({ target: { name: "ville", value: val } })}
// //                                             error={!!errors.ville}
// //                                             helperText={errors.ville}
// //                                             ClassIcone="text-accent"
// //                                         />
// //                                         <InputValidate
// //                                             IconComponent={MdLocationOn}
// //                                             type="text"
// //                                             largeur="2/3"
// //                                             placeholder="Ex: 301..."
// //                                             title="Code Postal"
// //                                             name="codePostal"
// //                                             value={data.codePostal || ""}
// //                                             onChange={(val) => handleChange({ target: { name: "codePostal", value: val } })}
// //                                             error={!!errors.codePostal}
// //                                             helperText={errors.codePostal}
// //                                             ClassIcone="text-accent"
// //                                         />
// //                                         <InputValidate
// //                                             IconComponent={MdLocationOn}
// //                                             type="text"
// //                                             largeur="2/3"
// //                                             placeholder="Ex: AV13/3609..."
// //                                             title="Lot d'Adresse"
// //                                             name="lot"
// //                                             value={data.lot || ""}
// //                                             onChange={(val) => handleChange({ target: { name: "lot", value: val } })}
// //                                             error={!!errors.lot}
// //                                             helperText={errors.lot}
// //                                             ClassIcone="text-accent"
// //                                         />
// //                                         <InputValidate
// //                                             IconComponent={MdLocationOn}
// //                                             type="text"
// //                                             largeur="2/3"
// //                                             placeholder="Ex: Imandry..."
// //                                             title="Quartier"
// //                                             name="quartier"
// //                                             value={data.quartier || ""}
// //                                             onChange={(val) => handleChange({ target: { name: "quartier", value: val } })}
// //                                             error={!!errors.quartier}
// //                                             helperText={errors.quartier}
// //                                             ClassIcone="text-accent"
// //                                         />
                                       
// //                                         <InputValidate
// //                                             IconComponent={MdLocationOn}
// //                                             type="text"
// //                                             largeur="2/3"
// //                                             optionel
// //                                             placeholder="Ex: Chez moi..."
// //                                             title="Labelle d'Adresse"
// //                                             name="labelle"
// //                                             value={data.labelle  || ""}
// //                                             onChange={(val) => handleChange({ target: { name: "labelle", value: val } })}
// //                                             error={!!errors.labelle}
// //                                             helperText={errors.labelle}
// //                                             ClassIcone="text-accent"
// //                                         />
// //                                         <div className="flex w-full items-center justify-center">
// //                                             <label className="mb-5 w-2/3 items-center justify-center">
// //                                                 <div className="label">
// //                                                     <span className={`label-text ${errorInfos ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
// //                                                         Complement d'Adresse <span className="text-red-500">*</span>
// //                                                     </span>
// //                                                 </div>
// //                                                 <textarea
// //                                                     value={descriptionAdresse}
// //                                                     onChange={(e) => setDescriptionAdresse(e.target.value)}
// //                                                     className={`textarea textarea-bordered h-[100px] w-full border ${errorInfos ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
// //                                                     placeholder="Décrire plus d'information sur votre adresse..."
// //                                                 ></textarea>
// //                                                 {errorInfos && <p className="text-sm text-red-500">{errorInfos}</p>}
// //                                             </label>
// //                                         </div>

// //                                         {/* Boutons pour le formulaire de nouvelle adresse */}
// //                                         <div className="flex gap-4 mt-4">
// //                                             <button
// //                                                 type="button"
// //                                                 onClick={handleCancelNewAddress}
// //                                                 className="btn btn-outline btn-error"
// //                                             >
// //                                                 Annuler
// //                                             </button>
// //                                             <button
// //                                                 type="submit"
// //                                                 className="btn btn-accent"
// //                                                 disabled={loading}
// //                                             >
// //                                                 {loading ? (
// //                                                     <div className="flex items-center gap-2">
// //                                                         <span className="loading loading-spinner"></span>
// //                                                         Création...
// //                                                     </div>
// //                                                 ) : (
// //                                                     "Créer l'adresse"
// //                                                 )}
// //                                             </button>
// //                                         </div>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     )}

// //                     {/* Checkbox pour adresse de facturation différente */}
// //                     <div className="my-6 flex justify-center">
// //                         <label className="flex items-center space-x-3 cursor-pointer">
// //                             <Checkbox
// //                                 checked={utiliserFacturationDifferent}
// //                                 onChange={(e) => setUtiliserFacturationDifferent(e.target.checked)}
// //                                 color="accent"
// //                             />
// //                             <span className="text-gray-700 dark:text-gray-300 font-medium">
// //                                 Utiliser une autre adresse pour l'adresse de facturation
// //                             </span>
// //                         </label>
// //                     </div>

// //                     {/* Section Adresse de Facturation */}
// //                     {utiliserFacturationDifferent && (
// //                         <div className="mt-4 p-4">
// //                             <div className="mb-4 flex items-center justify-center gap-4 text-xl">
// //                                 <MdBusiness className="text-blue-500" />
// //                                 <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Facturation</span>
// //                             </div>

// //                             {isUserConnected && (
// //                                 <div className="flex w-full items-center justify-center mb-4">
// //                                     <div className="w-full">
// //                                         {/* Affichage par défaut : liste des adresses existantes pour la facturation */}
// //                                         {!showNewBillingAddressForm ? (
// //                                             <div className="w-full">
// //                                                 {adressesClient.length > 0 ? (
// //                                                     <div>
// //                                                         <div className="flex w-full flex-col items-start justify-center gap-4 mb-4">
// //                                                             {adressesClient.map((adresse) => (
// //                                                                 <AddressCard
// //                                                                     key={adresse.id + "-facturation"}
// //                                                                     address={adresse}
// //                                                                     isSelected={adresseFacturationSelectionnee?.id === adresse.id}
// //                                                                     onSelect={gererSelectionAdresseFacturation}
// //                                                                     onEdit={handleEditAddress}
// //                                                                     isBilling={true}
// //                                                                 />
// //                                                             ))}
// //                                                         </div>
// //                                                         {/* Bouton pour ajouter une nouvelle adresse de facturation */}
// //                                                         <div className="flex justify-center mt-4">
// //                                                             <button
// //                                                                 type="button"
// //                                                                 onClick={handleAddNewBillingAddress}
// //                                                                 className="btn btn-outline btn-accent"
// //                                                             >
// //                                                                 <MdAddLocation className="mr-2" />
// //                                                                 Ajouter une nouvelle adresse de facturation
// //                                                             </button>
// //                                                         </div>
// //                                                     </div>
// //                                                 ) : (
// //                                                     // Cas où l'utilisateur n'a aucune adresse
// //                                                     <div className="text-center p-4 bg-yellow-50 rounded-lg">
// //                                                         <Typography className="text-yellow-700 mb-4">
// //                                                             Vous n'avez pas d'adresse enregistrée.
// //                                                         </Typography>
// //                                                         <button
// //                                                             type="button"
// //                                                             onClick={handleAddNewBillingAddress}
// //                                                             className="btn btn-accent"
// //                                                         >
// //                                                             <MdAddLocation className="mr-2" />
// //                                                             Créer une adresse de facturation
// //                                                         </button>
// //                                                     </div>
// //                                                 )}
// //                                             </div>
// //                                         ) : (
// //                                             /* Formulaire de nouvelle adresse de facturation */
// //                                             <div className={`my-3 flex w-full flex-col shadow-md shadow-slate-300 dark:shadow-black rounded-xl items-center justify-center py-3 transition-colors duration-500 ease-in-out overflow-hidden`}>
// //                                                 <div className="mb-4 flex items-center justify-center gap-2 text-lg">
// //                                                     <MdLocationOn className="text-accent" />
// //                                                     <span className="font-bold text-black opacity-80 dark:text-white">Nouvelle Adresse de Facturation</span>
// //                                                 </div>
                                               
// //                                                 <InputValidate
// //                                                     IconComponent={MdLocationOn}
// //                                                     type="text"
// //                                                     largeur="2/3"
// //                                                     placeholder="Ex: Fianarantsoa..."
// //                                                     title="Ville"
// //                                                     name="ville"
// //                                                     value={donneesFacturation.ville || ""}
// //                                                     onChange={(val) => gererChangementFacturation({ target: { name: "ville", value: val } })}
// //                                                     error={!!erreursFacturation.ville}
// //                                                     helperText={erreursFacturation.ville}
// //                                                     ClassIcone="text-accent"
// //                                                 />
// //                                                 <InputValidate
// //                                                     IconComponent={MdLocationOn}
// //                                                     type="text"
// //                                                     largeur="2/3"
// //                                                     placeholder="Ex: 301..."
// //                                                     title="Code Postal"
// //                                                     name="codePostal"
// //                                                     value={donneesFacturation.codePostal || ""}
// //                                                     onChange={(val) => gererChangementFacturation({ target: { name: "codePostal", value: val } })}
// //                                                     error={!!erreursFacturation.codePostal}
// //                                                     helperText={erreursFacturation.codePostal}
// //                                                     ClassIcone="text-accent"
// //                                                 />
// //                                                 <InputValidate
// //                                                     IconComponent={MdLocationOn}
// //                                                     type="text"
// //                                                     largeur="2/3"
// //                                                     placeholder="Ex: AV13/3609..."
// //                                                     title="Lot d'Adresse"
// //                                                     name="lot"
// //                                                     value={donneesFacturation.lot || ""}
// //                                                     onChange={(val) => gererChangementFacturation({ target: { name: "lot", value: val } })}
// //                                                     error={!!erreursFacturation.lot}
// //                                                     helperText={erreursFacturation.lot}
// //                                                     ClassIcone="text-accent"
// //                                                 />
// //                                                 <InputValidate
// //                                                     IconComponent={MdLocationOn}
// //                                                     type="text"
// //                                                     largeur="2/3"
// //                                                     placeholder="Ex: Imandry..."
// //                                                     title="Quartier"
// //                                                     name="quartier"
// //                                                     value={donneesFacturation.quartier || ""}
// //                                                     onChange={(val) => gererChangementFacturation({ target: { name: "quartier", value: val } })}
// //                                                     error={!!erreursFacturation.quartier}
// //                                                     helperText={erreursFacturation.quartier}
// //                                                     ClassIcone="text-accent"
// //                                                 />
                                               
// //                                                 <InputValidate
// //                                                     IconComponent={MdLocationOn}
// //                                                     type="text"
// //                                                     largeur="2/3"
// //                                                     optionel
// //                                                     placeholder="Ex: Chez moi..."
// //                                                     title="Labelle d'Adresse"
// //                                                     name="labelle"
// //                                                     value={donneesFacturation.labelle  || ""}
// //                                                     onChange={(val) => gererChangementFacturation({ target: { name: "labelle", value: val } })}
// //                                                     error={!!erreursFacturation.labelle}
// //                                                     helperText={erreursFacturation.labelle}
// //                                                     ClassIcone="text-accent"
// //                                                 />
// //                                                 <div className="flex w-full items-center justify-center">
// //                                                     <label className="mb-5 w-2/3 items-center justify-center">
// //                                                         <div className="label">
// //                                                             <span className={`label-text ${erreursFacturation.description ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
// //                                                                 Complement d'Adresse <span className="text-red-500">*</span>
// //                                                             </span>
// //                                                         </div>
// //                                                         <textarea
// //                                                             value={descriptionFacturation}
// //                                                             onChange={(e) => setDescriptionFacturation(e.target.value)}
// //                                                             className={`textarea textarea-bordered h-[100px] w-full border ${erreursFacturation.description ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
// //                                                             placeholder="Décrire plus d'information sur votre adresse..."
// //                                                         ></textarea>
// //                                                         {erreursFacturation.description && <p className="text-sm text-red-500">{erreursFacturation.description}</p>}
// //                                                     </label>
// //                                                 </div>

// //                                                 {/* Boutons pour le formulaire de nouvelle adresse de facturation */}
// //                                                 <div className="flex gap-4 mt-4">
// //                                                     <button
// //                                                         type="button"
// //                                                         onClick={handleCancelNewBillingAddress}
// //                                                         className="btn btn-outline btn-error"
// //                                                     >
// //                                                         Annuler
// //                                                     </button>
// //                                                     <button
// //                                                         type="submit"
// //                                                         className="btn btn-accent"
// //                                                         disabled={loading}
// //                                                     >
// //                                                         {loading ? (
// //                                                             <div className="flex items-center gap-2">
// //                                                                 <span className="loading loading-spinner"></span>
// //                                                                 Création...
// //                                                             </div>
// //                                                         ) : (
// //                                                             "Créer l'adresse de facturation"
// //                                                         )}
// //                                                     </button>
// //                                                 </div>
// //                                             </div>
// //                                         )}
// //                                     </div>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     )}

// //                     {/* Bouton de soumission principal */}
// //                     {!showNewAddressForm && !showNewBillingAddressForm && (
// //                         <div className="mt-6 flex justify-center">
// //                             <button
// //                                 type="submit"
// //                                 className="btn btn-accent btn-outline btn-wide"
// //                                 disabled={loading}
// //                             >
// //                                 {loading ? ( 
// //                                     <div className="flex flex-row justify-center items-center gap-2">
// //                                         <span className="loading loading-spinner text-accent"></span>
// //                                         <span>Validation en cours...</span>
// //                                     </div>
// //                                 ) : (
// //                                     "Valider la commande"
// //                                 )}
// //                             </button>
// //                         </div>
// //                     )}
                    
// //                 </div>
// //             </form>
// //         </div>
// //     );
// // };

// // export default FormAdresse;








// // import React, { useEffect, useRef, useState } from "react";
// // import Alert from "@mui/material/Alert";
// // import Snackbar from "@mui/material/Snackbar";
// // import { useAuth } from "../../../hook/useAuth";
// // import { getClientAddresses, updateClientAddress } from "@/services/ClientService";
// // import FormControl from "@mui/material/FormControl";
// // import { InputValidate } from "@/components/InputValidate";
// // import { createCommandePanier, updateCommandePanier } from "@/services/ClientService";
// // import { MdLocationOn, MdAddLocation, MdHome, MdBusiness } from "react-icons/md";
// // import { usePanier } from "@/Client/context/PanierContext";
// // import { FaMapMarkerAlt } from "react-icons/fa";
// // import AddressCard from "@/components/AddressCard";
// // import { Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Button, Checkbox } from "@mui/material";

// // // Fonction de comparaison de valeur initial et la valeur modifier
// // function IsChangedData(current, initial) {
// //     if (!current || !initial) return true;
    
// //     const livraisonCurent = current.adresseLivraison || {};
// //     const facturationCurent = current.adresseFacturation || {};
// //     const livraisonInitial = initial.adresseLivraison || {};
// //     const facturationInitial = initial.adresseFacturation || {};
    
// //     const compare = (curr, init) => {
// //         if (!curr && !init) return false;
// //         if (!curr || !init) return true;
        
// //         return (
// //             curr.id !== init.id ||
// //             curr.codePostal !== init.codePostal ||
// //             (curr.labelle || curr.LabelleAdresse) !== (init.labelle || init.LabelleAdresse) || 
// //             curr.complement !== init.complement ||
// //             curr.description !== init.description ||
// //             curr.lot !== init.lot ||
// //             curr.quartier !== init.quartier ||
// //             curr.ville !== init.ville 
// //         ); 
// //     };
    
// //     return compare(livraisonCurent, livraisonInitial) || compare(facturationCurent, facturationInitial);
// // }

// // const FormAdresse = ({ initialData, onSubmitSuccess }) => {
// //     const { user, isAuthenticated } = useAuth();
// //     const [loading, setLoading] = useState(false);
// //     const { items } = usePanier();
    
// //     // CORRECTION: Initialiser avec des objets vides pour les nouvelles adresses
// //     const [data, setData] = useState({});
// //     const [donneesFacturation, setDonneesFacturation] = useState({});
    
// //     const [errors, setErrors] = useState({});
// //     const [errorInfos, setErrorInfos] = useState(null);
// //     const [open, setOpen] = useState(false);
// //     const initial = useRef(initialData);
    
// //     const [descriptionAdresse, setDescriptionAdresse] = useState("");
// //     const [adressesClient, setAdressesClient] = useState([]);
// //     const [chargementAdresses, setChargementAdresses] = useState(false);

// //     const [message, setMessage] = useState({
// //         ouvre: false,
// //         texte: "vide",
// //         statut: "success",
// //     });

// //     // CORRECTION: Initialiser correctement les sélections
// //     const [adresseSelectionnee, setAdresseSelectionnee] = useState(null);
// //     const [utiliserAdresseExistante, setUtiliserAdresseExistante] = useState(false);

// //     const [utiliserFacturationDifferent, setUtiliserFacturationDifferent] = useState(
// //         initialData?.AdresseDifferent || false
// //     );

// //     const [adresseFacturationSelectionnee, setAdresseFacturationSelectionnee] = useState(null);
// //     const [utiliserAdresseFacturationExistante, setUtiliserAdresseFacturationExistante] = useState(false);

// //     const [erreursFacturation, setErreursFacturation] = useState({});
// //     const [descriptionFacturation, setDescriptionFacturation] = useState("");

// //     const isUserConnected = isAuthenticated;

// //     useEffect(() => {
// //         getAdresses();
// //     }, [isUserConnected, user]);

// //     useEffect(() => {
// //         if (initialData && adressesClient.length > 0) {
// //             // Initialiser l'adresse de livraison
// //             if (initialData.adresseLivraison?.estAdresseExistante && initialData.adresseLivraison?.id) {
// //                 const adresseTrouvee = adressesClient.find(adresse => 
// //                     adresse.id === initialData.adresseLivraison.id
// //                 );
// //                 if (adresseTrouvee) {
// //                     setAdresseSelectionnee(adresseTrouvee);
// //                     setUtiliserAdresseExistante(true);
// //                 }
// //             } else if (initialData.adresseLivraison && !initialData.adresseLivraison.estAdresseExistante) {
// //                 // Si c'est une nouvelle adresse, on ne pré-remplit pas le formulaire
// //                 setUtiliserAdresseExistante(false);
// //                 setData({});
// //                 setDescriptionAdresse("");
// //             }

// //             // Initialiser l'adresse de facturation
// //             if (initialData.adresseFacturation?.estAdresseExistante && initialData.adresseFacturation?.id) {
// //                 const adresseFacturationTrouvee = adressesClient.find(adresse => 
// //                     adresse.id === initialData.adresseFacturation.id
// //                 );
// //                 if (adresseFacturationTrouvee) {
// //                     setAdresseFacturationSelectionnee(adresseFacturationTrouvee);
// //                     setUtiliserAdresseFacturationExistante(true);
// //                 }
// //             } else if (initialData.adresseFacturation && !initialData.adresseFacturation.estAdresseExistante) {
// //                 setUtiliserAdresseFacturationExistante(false);
// //                 setDonneesFacturation({});
// //                 setDescriptionFacturation("");
// //             }
// //         }
// //     }, [initialData, adressesClient]);

// //     const getAdresses = async () => {
// //         if (isUserConnected && user.client) {
// //             setChargementAdresses(true);
// //             try {
// //                 const reponseAdresses = await getClientAddresses();
// //                 const listeAdresses = reponseAdresses.adresse;
// //                 if (listeAdresses && listeAdresses.length > 0) {
// //                     setAdressesClient(listeAdresses);
                    
// //                     // CORRECTION: Ne pas automatiquement sélectionner la première adresse
// //                     // Laisser l'utilisateur choisir ou créer une nouvelle adresse
// //                     if (!initialData) {
// //                         setUtiliserAdresseExistante(true);
// //                         // Ne pas auto-sélectionner, laisser l'utilisateur choisir
// //                     }
                    
// //                     setChargementAdresses(false);
// //                 } else {
// //                     setAdressesClient([]);
// //                     setUtiliserAdresseExistante(false);
// //                     setUtiliserAdresseFacturationExistante(false);
// //                     setChargementAdresses(false);
// //                 }
// //             } catch (erreur) {
// //                 console.log("Erreur de connexion:", erreur);
// //                 setMessage({
// //                     ouvre: true,
// //                     texte: `Échec de la connexion. Vérifiez votre connexion.`,
// //                     statut: "error",
// //                 });
// //                 setOpen(true);
// //                 setChargementAdresses(false);
// //             } finally {
// //                 setChargementAdresses(false);
// //             }
// //         }
// //     };

// //     // CORRECTION: Fonction pour gérer la modification d'adresse
// //     const handleEditAddress = async (editedAddress) => {
// //         try {
// //             const response = await updateClientAddress(editedAddress);
// //             if (response) {
// //                 // Mettre à jour la liste des adresses
// //                 await getAdresses();
                
// //                 // Mettre à jour la sélection si l'adresse modifiée est actuellement sélectionnée
// //                 if (adresseSelectionnee && adresseSelectionnee.id === editedAddress.id) {
// //                     setAdresseSelectionnee(editedAddress);
// //                 }
// //                 if (adresseFacturationSelectionnee && adresseFacturationSelectionnee.id === editedAddress.id) {
// //                     setAdresseFacturationSelectionnee(editedAddress);
// //                 }
                
// //                 setMessage({
// //                     ouvre: true,
// //                     texte: "Adresse modifiée avec succès",
// //                     statut: "success",
// //                 });
// //                 setOpen(true);
// //             }
// //         } catch (error) {
// //             console.error("Erreur lors de la modification de l'adresse:", error);
// //             setMessage({
// //                 ouvre: true,
// //                 texte: "Erreur lors de la modification de l'adresse",
// //                 statut: "error",
// //             });
// //             setOpen(true);
// //         }
// //     };

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setData((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
// //         setErrors((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
// //     };

// //     const gererChangementFacturation = (e) => {
// //         const { name, value } = e.target;
// //         setDonneesFacturation((donneesPrecedentes) => ({ ...donneesPrecedentes, [name]: value }));
// //         setErreursFacturation((erreursPrecedentes) => ({ ...erreursPrecedentes, [name]: "" }));
// //     };

// //     const gererSelectionAdresse = (adresse) => {
// //         setAdresseSelectionnee(adresse);
// //     };

// //     const gererSelectionAdresseFacturation = (adresse) => {
// //         setAdresseFacturationSelectionnee(adresse);
// //     };

// //     const gererChangementAdresseExistante = (evenement) => {
// //         const utiliserExistante = evenement.target.value === "true";
// //         setUtiliserAdresseExistante(utiliserExistante);

// //         if (!utiliserExistante) {
// //             setAdresseSelectionnee(null);
// //             // CORRECTION: Réinitialiser le formulaire de nouvelle adresse
// //             setData({});
// //             setDescriptionAdresse("");
// //         }
// //     };

// //     const gererChangementAdresseFacturationExistante = (evenement) => {
// //         const utiliserExistante = evenement.target.value === "true";
// //         setUtiliserAdresseFacturationExistante(utiliserExistante);

// //         if (!utiliserExistante) {
// //             setAdresseFacturationSelectionnee(null);
// //             // CORRECTION: Réinitialiser le formulaire de nouvelle adresse de facturation
// //             setDonneesFacturation({});
// //             setDescriptionFacturation("");
// //         }
// //     };

// //     const validate = () => {
// //         let tempErrors = {};
// //         let isValid = true;

// //         if (utiliserAdresseExistante) {
// //             if (!adresseSelectionnee) {
// //                 tempErrors.adresse = "Veuillez sélectionner une adresse";
// //                 isValid = false;
// //             }
// //         } else {
// //             if (!data.labelle || data.labelle.trim() === "") {
// //                 tempErrors.labelle = "Mentionner le labelle de votre adresse, Ce champ est requis.";
// //                 isValid = false;
// //             }
// //             if (!data.ville || data.ville.trim() === "") {
// //                 tempErrors.ville = "Obligatoire, Le nom du ville doit être existe.";
// //                 isValid = false;
// //             }
// //             if (!data.codePostal || !/\d+$/.test(data.codePostal)) {
// //                 tempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
// //                 isValid = false;
// //             }
// //             if (!data.quartier || data.quartier.trim() === "") {
// //                 tempErrors.quartier = "Nous ne pouvons livré votre produit sans quartier, cette champ est requis.";
// //                 isValid = false;
// //             }
// //             if (!data.lot || data.lot.trim() === "") {
// //                 tempErrors.lot = "Obligatoire, c'est important pour nous connaitre votre adresse précis";
// //                 isValid = false;
// //             }
// //             if (!descriptionAdresse || descriptionAdresse.trim() === "") {
// //                 setErrorInfos("La description doit contient au moins 4 caractères.");
// //                 isValid = false;
// //             }
// //         }

// //         setErrors(tempErrors);

// //         if (utiliserFacturationDifferent) {
// //             let factureTempErrors = {};

// //             if (utiliserAdresseFacturationExistante) {
// //                 if (!adresseFacturationSelectionnee) {
// //                     factureTempErrors.adresseFacturation = "Veuillez sélectionner une adresse de facturation";
// //                     isValid = false;
// //                 }
// //             } else {
// //                 if (!donneesFacturation.labelle || donneesFacturation.labelle.trim() === "") {
// //                     factureTempErrors.labelle = "Mentionner le labelle de votre adresse de facturation, Ce champ est requis.";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.ville || donneesFacturation.ville.trim() === "") {
// //                     factureTempErrors.ville = "Obligatoire pour la facturation, Le nom du ville doit être existe.";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.codePostal || !/\d+$/.test(donneesFacturation.codePostal)) {
// //                     factureTempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.quartier || donneesFacturation.quartier.trim() === "") {
// //                     factureTempErrors.quartier = "Le quartier est requis pour la facturation.";
// //                     isValid = false;
// //                 }
// //                 if (!donneesFacturation.lot || donneesFacturation.lot.trim() === "") {
// //                     factureTempErrors.lot = "Obligatoire pour la facturation, c'est important pour nous connaitre votre adresse précis";
// //                     isValid = false;
// //                 }
// //                 if (!descriptionFacturation || descriptionFacturation.trim() === "") {
// //                     factureTempErrors.description = "La description de l'adresse de facturation doit contient au moins 4 caractères.";
// //                     isValid = false;
// //                 }
// //             }

// //             setErreursFacturation(factureTempErrors);
// //         }

// //         return isValid;
// //     };

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
       
// //         if (validate()) {
// //             let donneesAdresse;
            
// //             if (utiliserAdresseExistante && adresseSelectionnee) {
// //                 donneesAdresse = {
// //                     adresseLivraison: {
// //                         ...adresseSelectionnee,
// //                         estAdresseExistante: true,
// //                         refAdresse: adresseSelectionnee.id,
// //                         description: descriptionAdresse || adresseSelectionnee.complement,
// //                     },
// //                     adresseFacturation: utiliserFacturationDifferent ? 
// //                         (utiliserAdresseFacturationExistante && adresseFacturationSelectionnee ? {
// //                             ...adresseFacturationSelectionnee,
// //                             estAdresseExistante: true,
// //                             refAdresse: adresseFacturationSelectionnee.id,
// //                             description: descriptionFacturation || adresseFacturationSelectionnee.complement,
// //                         } : {
// //                             ...donneesFacturation,
// //                             estAdresseExistante: false,
// //                             refAdresse: null,
// //                             description: descriptionFacturation,
// //                         }) : {
// //                             ...adresseSelectionnee,
// //                             estAdresseExistante: true,
// //                             refAdresse: adresseSelectionnee.id,
// //                             description: descriptionAdresse || adresseSelectionnee.complement,
// //                         },
// //                     AdresseDifferent: utiliserFacturationDifferent
// //                 };
// //             } else {
// //                 donneesAdresse = {
// //                     adresseLivraison: {
// //                         ...data,
// //                         estAdresseExistante: false,
// //                         refAdresse: null,
// //                         description: descriptionAdresse,
// //                     },
// //                     adresseFacturation: utiliserFacturationDifferent ? {
// //                         ...donneesFacturation,
// //                         estAdresseExistante: false,
// //                         refAdresse: null,
// //                         description: descriptionFacturation,
// //                     } : {
// //                         ...data,
// //                         estAdresseExistante: false,
// //                         description: descriptionAdresse,
// //                     },
// //                     AdresseDifferent: utiliserFacturationDifferent
// //                 };
// //             }
            
// //             setLoading(true);
// //             console.log("livraison current: ", donneesAdresse);
// //             console.log("livraison initial: ", initialData);
// //             console.log("Donnes Changer :", IsChangedData(donneesAdresse, initialData));
            
// //             if (IsChangedData(donneesAdresse, initialData)) {
// //                 try {
// //                     const panier = JSON.parse(localStorage.getItem("panier")) || items;
// //                     if (panier.length > 0) {
// //                         const commandeExiste = localStorage.getItem('RefCommande');
// //                         let refCommandeNettoyee = null;
                        
// //                         if (commandeExiste) {
// //                             try {
// //                                 refCommandeNettoyee = JSON.parse(commandeExiste);
// //                             } catch (e) {
// //                                 refCommandeNettoyee = commandeExiste;
// //                             }
                            
// //                             if (typeof refCommandeNettoyee === 'string') {
// //                                 refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, '');
// //                             }
// //                         }

// //                         if (refCommandeNettoyee) {
// //                             // Mise à jour de commande existante
// //                             const dataCommandeUpdate = {
// //                                 adresse: donneesAdresse,
// //                                 refCommande: refCommandeNettoyee
// //                             };
                            
// //                             console.log('donnee modifier : ', dataCommandeUpdate);
// //                             const response = await updateCommandePanier(dataCommandeUpdate);
                            
// //                             if (response.data) {
// //                                 console.log("Commande mis à jour avec succès:", response.data);
// //                                 localStorage.setItem('RefCommande', response.data.refCommande);
// //                                 localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
// //                                 // CORRECTION: Recharger les adresses après création d'une nouvelle adresse
// //                                 if (!utiliserAdresseExistante || (utiliserFacturationDifferent && !utiliserAdresseFacturationExistante)) {
// //                                     await getAdresses();
// //                                 }
                                
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Votre commande a été mis à jour avec succès.",
// //                                     statut: "success",
// //                                 });
// //                                 setOpen(true);
// //                                 onSubmitSuccess(donneesAdresse);
// //                             } else {
// //                                 console.log("Erreur de commande: ", response.error);
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer.",
// //                                     statut: "error",
// //                                 });
// //                                 setOpen(true);
// //                             }
// //                         } else {
// //                             // Créer nouvelle commande
// //                             const dataCommandeCreate = {
// //                                 adresse: donneesAdresse
// //                             };
                            
// //                             console.log("donnee créer :", dataCommandeCreate);
// //                             const response = await createCommandePanier(dataCommandeCreate);
                            
// //                             if (response.data) {
// //                                 console.log("Commande créée avec succès:", response.data);
// //                                 localStorage.setItem('RefCommande', response.data.refCommande);
// //                                 localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
// //                                 // CORRECTION: Recharger les adresses après création d'une nouvelle adresse
// //                                 await getAdresses();
                                
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Votre commande a été créée avec succès.",
// //                                     statut: "success",
// //                                 });
// //                                 setOpen(true);
// //                                 onSubmitSuccess(donneesAdresse);
// //                             } else {
// //                                 console.log("Erreur de commande: ", response.error);
// //                                 setMessage({
// //                                     ouvre: true,
// //                                     texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
// //                                     statut: "error",
// //                                 });
// //                                 setOpen(true);
// //                             }
// //                         }
// //                     } else {
// //                         setMessage({
// //                             ouvre: true,
// //                             texte: "Votre panier est vide , Veuillez selectionner votre produit commander.",
// //                             statut: "warning",
// //                         });
// //                         setOpen(true);
// //                     }
// //                     setLoading(false);
// //                 } catch (error) {
// //                     console.error(" Erreur création commande:", error);
// //                     setMessage({
// //                         ouvre: true,
// //                         texte: "Erreur lors de la création de la commande. Veuillez réessayer.",
// //                         statut: "error",
// //                     });
// //                     setOpen(true);
// //                     setLoading(false);
// //                 } finally {
// //                     setLoading(false);
// //                 }
// //             } else {
// //                 onSubmitSuccess(initialData);
// //             }
// //         }
// //     };

// //     return (
// //         <div className="w-full bg-transparent">
// //             <div>
// //                 {message.ouvre && (
// //                     <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
// //                         <Alert onClose={() => setOpen(false)} severity={message.statut} variant="filled" sx={{ width: "100%" }}>
// //                             {message.texte}
// //                         </Alert>
// //                     </Snackbar>
// //                 )}
// //             </div>
// //             <form onSubmit={handleSubmit}>
// //                 <div className="flex w-full flex-col px-1">
                    
// //                     {/* Section Adresse de Livraison */}
// //                     <div className="mb-6 flex items-center justify-center gap-4 text-xl">
// //                         <MdLocationOn className="text-accent" />
// //                         <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Livraison</span>
// //                     </div>

// //                     {isUserConnected && (
// //                         <div className="flex w-full items-center justify-center">
// //                             <FormControl component="fieldset">
// //                                 <RadioGroup
// //                                     value={utiliserAdresseExistante.toString()}
// //                                     onChange={gererChangementAdresseExistante}
// //                                     className="gap-4"
// //                                 >
// //                                     {/* Option: Utiliser adresse existante */}
// //                                     <div className="w-full rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
// //                                         <FormControlLabel
// //                                             value="true"
// //                                             control={<Radio />}
// //                                             label={
// //                                                 <div>
// //                                                     <Typography className="font-semibold">Utiliser une de mes adresses enregistrées</Typography>
// //                                                     <Typography variant="body2" className="text-gray-600">
// //                                                         Choisissez parmi vos adresses existantes
// //                                                     </Typography>
// //                                                 </div>
// //                                             }
// //                                         />

// //                                         {utiliserAdresseExistante && (
// //                                             <div className="mx-8 mt-3">
// //                                                 {chargementAdresses ? ( 
// //                                                     <div className="flex justify-center py-4">
// //                                                         <div className="loading loading-spinner loading-xl text-accent"></div>
// //                                                         <span className="ml-2">Récuperation de vos adresses...</span>
// //                                                     </div>
// //                                                 ) : adressesClient.length > 0 ? (
// //                                                     <div className="flex w-full flex-col items-start justify-center gap-4">
// //                                                         {adressesClient.map((adresse) => (
// //                                                             <AddressCard
// //                                                                 key={adresse.id}
// //                                                                 address={adresse}
// //                                                                 isSelected={adresseSelectionnee?.id === adresse.id}
// //                                                                 onSelect={gererSelectionAdresse}
// //                                                                 onEdit={handleEditAddress}
// //                                                             />
// //                                                         ))}
// //                                                     </div>
// //                                                 ) : (
// //                                                     // CORRECTION: Message quand pas d'adresse
// //                                                     <div className="text-center p-4 bg-yellow-50 rounded-lg">
// //                                                         <Typography className="text-yellow-700">
// //                                                             Vous n'avez pas d'adresse enregistrée. Veuillez créer une nouvelle adresse.
// //                                                         </Typography>
// //                                                     </div>
// //                                                 )}
// //                                             </div>
// //                                         )}
// //                                     </div>

// //                                     {/* Option: Créer nouvelle adresse */}
// //                                     <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
// //                                         <FormControlLabel
// //                                             value="false"
// //                                             control={<Radio />}
// //                                             label={
// //                                                 <div>
// //                                                     <Typography className="font-semibold">Utiliser une nouvelle adresse</Typography>
// //                                                     <Typography variant="body2" className="text-gray-600">
// //                                                         Saisir une nouvelle adresse de livraison
// //                                                     </Typography>
// //                                                 </div>
// //                                             }
// //                                         />
// //                                     </div>
// //                                 </RadioGroup>
// //                             </FormControl>
// //                         </div>
// //                     )}

// //                     {/* Formulaire nouvelle adresse de livraison */}
// //                     {!utiliserAdresseExistante && (
// //                         <div className={`my-3 flex w-full flex-col items-center justify-center py-3 transition-all duration-500 ease-in-out overflow-hidden`}>
// //                             <div className="mb-4 flex items-center justify-center gap-2 text-lg">
// //                                 <MdLocationOn className="text-accent" />
// //                                 <span className="font-gothic text-black opacity-70 dark:text-white">Nouvelle Adresse de Livraison</span>
// //                             </div>
                            
// //                             <InputValidate
// //                                 IconComponent={MdLocationOn}
// //                                 type="text"
// //                                 largeur="2/3"
// //                                 placeholder="Ex: Fianarantsoa..."
// //                                 title="Ville"
// //                                 name="ville"
// //                                 value={data.ville || ""}
// //                                 onChange={(val) => handleChange({ target: { name: "ville", value: val } })}
// //                                 error={!!errors.ville}
// //                                 helperText={errors.ville}
// //                                 ClassIcone="text-accent"
// //                             />
// //                             <InputValidate
// //                                 IconComponent={MdLocationOn}
// //                                 type="text"
// //                                 largeur="2/3"
// //                                 placeholder="Ex: 301..."
// //                                 title="Code Postal"
// //                                 name="codePostal"
// //                                 value={data.codePostal || ""}
// //                                 onChange={(val) => handleChange({ target: { name: "codePostal", value: val } })}
// //                                 error={!!errors.codePostal}
// //                                 helperText={errors.codePostal}
// //                                 ClassIcone="text-accent"
// //                             />
// //                             <InputValidate
// //                                 IconComponent={MdLocationOn}
// //                                 type="text"
// //                                 largeur="2/3"
// //                                 placeholder="Ex: AV13/3609..."
// //                                 title="Lot d'Adresse"
// //                                 name="lot"
// //                                 value={data.lot || ""}
// //                                 onChange={(val) => handleChange({ target: { name: "lot", value: val } })}
// //                                 error={!!errors.lot}
// //                                 helperText={errors.lot}
// //                                 ClassIcone="text-accent"
// //                             />
// //                             <InputValidate
// //                                 IconComponent={MdLocationOn}
// //                                 type="text"
// //                                 largeur="2/3"
// //                                 placeholder="Ex: Imandry..."
// //                                 title="Quartier"
// //                                 name="quartier"
// //                                 value={data.quartier || ""}
// //                                 onChange={(val) => handleChange({ target: { name: "quartier", value: val } })}
// //                                 error={!!errors.quartier}
// //                                 helperText={errors.quartier}
// //                                 ClassIcone="text-accent"
// //                             />
                           
// //                             <InputValidate
// //                                 IconComponent={MdLocationOn}
// //                                 type="text"
// //                                 largeur="2/3"
// //                                 optionel
// //                                 placeholder="Ex: Chez moi..."
// //                                 title="Labelle d'Adresse"
// //                                 name="labelle"
// //                                 value={data.labelle  || ""}
// //                                 onChange={(val) => handleChange({ target: { name: "labelle", value: val } })}
// //                                 error={!!errors.labelle}
// //                                 helperText={errors.labelle}
// //                                 ClassIcone="text-accent"
// //                             />
// //                             <div className="flex w-full items-center justify-center">
// //                                 <label className="mb-5 w-2/3 items-center justify-center">
// //                                     <div className="label">
// //                                         <span className={`label-text ${errorInfos ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
// //                                             Complement d'Adresse <span className="text-red-500">*</span>
// //                                         </span>
// //                                     </div>
// //                                     <textarea
// //                                         value={descriptionAdresse}
// //                                         onChange={(e) => setDescriptionAdresse(e.target.value)}
// //                                         className={`textarea textarea-bordered h-[100px] w-full border ${errorInfos ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
// //                                         placeholder="Décrire plus d'information sur votre adresse..."
// //                                     ></textarea>
// //                                     {errorInfos && <p className="text-sm text-red-500">{errorInfos}</p>}
// //                                 </label>
// //                             </div>
// //                         </div>
// //                     )}

// //                     {/* Checkbox pour adresse de facturation différente */}
// //                     <div className="my-6 flex justify-center">
// //                         <label className="flex items-center space-x-3 cursor-pointer">
// //                             <Checkbox
// //                                 checked={utiliserFacturationDifferent}
// //                                 onChange={(e) => setUtiliserFacturationDifferent(e.target.checked)}
// //                                 color="accent"
// //                             />
// //                             <span className="text-gray-700 dark:text-gray-300 font-medium">
// //                                 Utiliser une autre adresse pour l'adresse de facturation
// //                             </span>
// //                         </label>
// //                     </div>

// //                     {/* Section Adresse de Facturation */}
// //                     {utiliserFacturationDifferent && (
// //                         <div className="mt-4 p-4">
// //                             <div className="mb-4 flex items-center justify-center gap-4 text-xl">
// //                                 <MdBusiness className="text-blue-500" />
// //                                 <span className="font-gothic text-black opacity-70 dark:text-white">Adresse de Facturation</span>
// //                             </div>

// //                             {isUserConnected && (
// //                                 <div className="flex w-full items-center justify-center mb-4">
// //                                     <FormControl component="fieldset">
// //                                         <RadioGroup
// //                                             value={utiliserAdresseFacturationExistante.toString()}
// //                                             onChange={gererChangementAdresseFacturationExistante}
// //                                             className="gap-4"
// //                                         >
// //                                             {/* Option: Utiliser adresse existante pour facturation */}
// //                                             <div className="w-full rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
// //                                                 <FormControlLabel
// //                                                     value="true"
// //                                                     control={<Radio />}
// //                                                     label={
// //                                                         <div>
// //                                                             <Typography className="font-semibold">Utiliser une adresse existante</Typography>
// //                                                             <Typography variant="body2" className="text-gray-600">
// //                                                                 Choisissez parmi vos adresses enregistrées
// //                                                             </Typography>
// //                                                         </div>
// //                                                     }
// //                                                 />

// //                                                 {utiliserAdresseFacturationExistante && (
// //                                                     <div className="mx-8 mt-3">
// //                                                         {adressesClient.length > 0 ? (
// //                                                             <div className="flex w-full flex-col items-start justify-center gap-4">
// //                                                                 {adressesClient.map((adresse) => (
// //                                                                     <AddressCard
// //                                                                         key={adresse.id + "-facturation"}
// //                                                                         address={adresse}
// //                                                                         isSelected={adresseFacturationSelectionnee?.id === adresse.id}
// //                                                                         onSelect={gererSelectionAdresseFacturation}
// //                                                                         onEdit={handleEditAddress}
// //                                                                         isBilling={true}
// //                                                                     />
// //                                                                 ))}
// //                                                             </div>
// //                                                         ) : (
// //                                                             <div className="text-center p-4 bg-yellow-50 rounded-lg">
// //                                                                 <Typography className="text-yellow-700">
// //                                                                     Vous n'avez pas d'adresse enregistrée. Veuillez créer une nouvelle adresse.
// //                                                                 </Typography>
// //                                                             </div>
// //                                                         )}
// //                                                     </div>
// //                                                 )}
// //                                             </div>

// //                                             {/* Option: Créer nouvelle adresse de facturation */}
// //                                             <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
// //                                                 <FormControlLabel
// //                                                     value="false"
// //                                                     control={<Radio />}
// //                                                     label={
// //                                                         <div>
// //                                                             <Typography className="font-semibold">Nouvelle adresse de facturation</Typography>
// //                                                             <Typography variant="body2" className="text-gray-600">
// //                                                                 Saisir une nouvelle adresse
// //                                                             </Typography>
// //                                                         </div>
// //                                                     }
// //                                                 />
// //                                             </div>
// //                                         </RadioGroup>
// //                                     </FormControl>
// //                                 </div>
// //                             )}

// //                             {/* Formulaire nouvelle adresse de facturation */}
// //                             {!utiliserAdresseFacturationExistante && (
// //                                 <div className={`my-3 flex w-full flex-col shadow-md shadow-slate-300 dark:shadow-black rounded-xl items-center justify-center py-3 transition-colors duration-500 ease-in-out overflow-hidden`}>
// //                                     <div className="mb-4 flex items-center justify-center gap-2 text-lg">
// //                                         <MdLocationOn className="text-accent" />
// //                                         <span className="font-bold text-black opacity-80 dark:text-white">Nouvelle Adresse de Facturation</span>
// //                                     </div>
                                   
// //                                     <InputValidate
// //                                         IconComponent={MdLocationOn}
// //                                         type="text"
// //                                         largeur="2/3"
// //                                         placeholder="Ex: Fianarantsoa..."
// //                                         title="Ville"
// //                                         name="ville"
// //                                         value={donneesFacturation.ville || ""}
// //                                         onChange={(val) => gererChangementFacturation({ target: { name: "ville", value: val } })}
// //                                         error={!!erreursFacturation.ville}
// //                                         helperText={erreursFacturation.ville}
// //                                         ClassIcone="text-accent"
// //                                     />
// //                                     <InputValidate
// //                                         IconComponent={MdLocationOn}
// //                                         type="text"
// //                                         largeur="2/3"
// //                                         placeholder="Ex: 301..."
// //                                         title="Code Postal"
// //                                         name="codePostal"
// //                                         value={donneesFacturation.codePostal || ""}
// //                                         onChange={(val) => gererChangementFacturation({ target: { name: "codePostal", value: val } })}
// //                                         error={!!erreursFacturation.codePostal}
// //                                         helperText={erreursFacturation.codePostal}
// //                                         ClassIcone="text-accent"
// //                                     />
// //                                     <InputValidate
// //                                         IconComponent={MdLocationOn}
// //                                         type="text"
// //                                         largeur="2/3"
// //                                         placeholder="Ex: AV13/3609..."
// //                                         title="Lot d'Adresse"
// //                                         name="lot"
// //                                         value={donneesFacturation.lot || ""}
// //                                         onChange={(val) => gererChangementFacturation({ target: { name: "lot", value: val } })}
// //                                         error={!!erreursFacturation.lot}
// //                                         helperText={erreursFacturation.lot}
// //                                         ClassIcone="text-accent"
// //                                     />
// //                                     <InputValidate
// //                                         IconComponent={MdLocationOn}
// //                                         type="text"
// //                                         largeur="2/3"
// //                                         placeholder="Ex: Imandry..."
// //                                         title="Quartier"
// //                                         name="quartier"
// //                                         value={donneesFacturation.quartier || ""}
// //                                         onChange={(val) => gererChangementFacturation({ target: { name: "quartier", value: val } })}
// //                                         error={!!erreursFacturation.quartier}
// //                                         helperText={erreursFacturation.quartier}
// //                                         ClassIcone="text-accent"
// //                                     />
                                   
// //                                     <InputValidate
// //                                         IconComponent={MdLocationOn}
// //                                         type="text"
// //                                         largeur="2/3"
// //                                         optionel
// //                                         placeholder="Ex: Chez moi..."
// //                                         title="Labelle d'Adresse"
// //                                         name="labelle"
// //                                         value={donneesFacturation.labelle  || ""}
// //                                         onChange={(val) => gererChangementFacturation({ target: { name: "labelle", value: val } })}
// //                                         error={!!erreursFacturation.labelle}
// //                                         helperText={erreursFacturation.labelle}
// //                                         ClassIcone="text-accent"
// //                                     />
// //                                     <div className="flex w-full items-center justify-center">
// //                                         <label className="mb-5 w-2/3 items-center justify-center">
// //                                             <div className="label">
// //                                                 <span className={`label-text ${erreursFacturation.description ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}>
// //                                                     Complement d'Adresse <span className="text-red-500">*</span>
// //                                                 </span>
// //                                             </div>
// //                                             <textarea
// //                                                 value={descriptionFacturation}
// //                                                 onChange={(e) => setDescriptionFacturation(e.target.value)}
// //                                                 className={`textarea textarea-bordered h-[100px] w-full border ${erreursFacturation.description ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
// //                                                 placeholder="Décrire plus d'information sur votre adresse..."
// //                                             ></textarea>
// //                                             {erreursFacturation.description && <p className="text-sm text-red-500">{erreursFacturation.description}</p>}
// //                                         </label>
// //                                     </div>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     )}

// //                     {/* Bouton de soumission */}
// //                     <div className="mt-6 flex justify-center">
// //                         <button
// //                             type="submit"
// //                             className="btn btn-accent btn-outline btn-wide"
// //                             disabled={loading}
// //                         >
// //                             {loading ? ( 
// //                                 <div className="flex flex-row justify-center items-center gap-2">
// //                                     <span className="loading loading-spinner text-accent"></span>
// //                                     <span>Validation en cours...</span>
// //                                 </div>
// //                             ) : (
// //                                 utiliserAdresseExistante && adresseSelectionnee ? "Utiliser cette adresse" : "Valider les adresses"
// //                             )}
// //                         </button>
// //                     </div>
                    
// //                 </div>
// //             </form>
// //         </div>
// //     );
// // };

// // export default FormAdresse;