import React, { useEffect, useState, useRef } from "react";
import { Stepper, Step, StepLabel, StepContent, Button, Box, Typography, Paper } from "@mui/material";
import FormAdresse from "./FormAdresse";
import FormInfosPersonnel from "./FormInfosPersonnel";
import { createCommandePanier } from "@/services/ClientService";
import FormPaiment from "./FormPaiment";
import { useAuth } from "../../../hook/useAuth";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const steps = ["Informations Personnels", "Adresse de Livraison et Facturation", "Service Livraison et Paiemnt", "Validation Finale"];

export default function CommandeEtape() {
    const { isAuthenticated, user } = useAuth();
    const initialStep = isAuthenticated ? 0 : 0;
    const [activeStep, setActiveStep] = React.useState(initialStep);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    const commandeDejaEnvoyee = useRef(false);
    const [commandeExistante, setCommandeExistante] = useState(false);

    const [formData, setFormData] = React.useState({
        etape1: {
            nom: "",
            email: "",
            nomClient: "",
            prenomClient: "",
            telephoneClient: "",
            dateNaissance: "",
            civiliteClient: "",
            password: "",
        },
        etape2: {
            AdresseDifferent: false,
            adresseLivraison : {
                codePostal: "",
                complement: "",
                description: "",
                id: "",
                labelle: "",
                estAdresseExistante: false,
                lot: "",
                quartier: "",
                refAdresse: "",
                ville: "",
            },
            adresseFacturation : {
                codePostal: "",
                complement: "",
                description: "",
                estAdresseExistante: false,
                id: "",
                labelle: "",
                lot: "",
                quartier: "",
                refAdresse: "",
                ville: "",
            },
            
        },
        etape3: { transactionId: "" },
    });

    // // ✅ Vérifier s'il y a déjà une commande
    // const verifierCommandeExistante = async () => {
    //     try {
    //         // Remplacez cette fonction par votre propre service de vérification
    //         // const commandes = await getUserCommandes(user.id);
    //         // return commandes.length > 0;

    //         // Pour l'instant, on vérifie dans le localStorage
    //         const commandeStockee = localStorage.getItem(`commande_${user.id}`);
    //         return !!commandeStockee;
    //     } catch (error) {
    //         console.error("Erreur vérification commande:", error);
    //         return false;
    //     }
    // };

    // useEffect(() => {
    //     const envoyerPanierSiNecessaire = async () => {
    //         // Conditions d'exécution
    //         if (!isAuthenticated || !user || !user.emailUsers) {
    //             console.log("❌ Utilisateur non connecté");
    //             return;
    //         }

    //         if (commandeDejaEnvoyee.current) {
    //             console.log("✅ Commande déjà envoyée - arrêt");
    //             return;
    //         }

    //         // Vérifier s'il y a déjà une commande
    //         const existeDeja = await verifierCommandeExistante();
    //         if (existeDeja) {
    //             console.log("⚠️ Commande existante détectée - arrêt");
    //             setCommandeExistante(true);
    //             setMessage({
    //                 ouvre: true,
    //                 texte: "Vous avez déjà une commande en cours.",
    //                 statut: "info",
    //             });
    //             setOpen(true);
    //             return;
    //         }

    //         const cart = JSON.parse(localStorage.getItem("panier")) || [];
    //         if (cart.length === 0) {
    //             console.log("🛒 Panier vide - arrêt");
    //             return;
    //         }

    //         console.log("🚀 Conditions remplies - envoi du panier");
    //         commandeDejaEnvoyee.current = true;

    //         const panier = cart.map((item) => ({
    //             idProduit: item.id,
    //             quantite: item.quantite,
    //         }));

    //         await EnvoyerPanier(panier);
    //     };

    //     envoyerPanierSiNecessaire();
    // }, [user, isAuthenticated]);

    // const EnvoyerPanier = async (panier) => {
    //     try {
    //         console.log("📦 Envoi du panier...", panier);
    //         const response = await createCommandePanier(panier);

    //         if (response.data) {
    //             // ✅ Stocker l'info que la commande a été créée
    //             if (user && user.id) {
    //                 localStorage.setItem(`commande_${user.id}`, JSON.stringify({
    //                     date: new Date().toISOString(),
    //                     statut: "en_cours"
    //                 }));
    //             }

    //             // ✅ Vider le panier après envoi réussi
    //             localStorage.removeItem("panier");

    //             setMessage({
    //                 ouvre: true,
    //                 texte: response.data.message || "Commande créée avec succès!",
    //                 statut: "success",
    //             });
    //             setOpen(true);
    //         } else {
    //             console.log("Réponse sans data:", response);
    //             setMessage({
    //                 ouvre: true,
    //                 texte: "Erreur lors de la création de la commande",
    //                 statut: "error",
    //             });
    //             setOpen(true);
    //             // ❌ Réactiver l'envoi en cas d'erreur
    //             commandeDejaEnvoyee.current = false;
    //         }
    //     } catch (error) {
    //         console.log("Erreur de connexion:", error);
    //         setMessage({
    //             ouvre: true,
    //             texte: "Une erreur s'est produite lors de la création de votre commande.",
    //             statut: "error",
    //         });
    //         setOpen(true);
    //         // ❌ Réactiver l'envoi en cas d'erreur
    //         commandeDejaEnvoyee.current = false;
    //     }
    // };

    useEffect(() => {
        if (user && user.emailUsers) {
            setFormData((prevData) => ({
                ...prevData,
                etape1: {
                    nom: user.client?.nomClient || "",
                    email: user.emailUsers || "",
                    nomClient: user.client?.nomClient || "",
                    prenomClient: user.client?.prenomClient || "",
                    telephoneClient: user.client?.telephoneClient || "",
                    dateNaissance: user.client?.dateNaissance || "",
                    civiliteClient: user.client?.civiliteClient || "",
                    password: "",
                },
            }));
            const valAdresse = JSON.parse(localStorage.getItem('DataAdresse'))
            const refCommande = localStorage.getItem('RefCommande')
            if(valAdresse && refCommande){
                setFormData((prevData) => ({
                    ...prevData,
                    etape2: {
                        AdresseDifferent: valAdresse.AdresseDifferent,
                        adresseLivraison : {
                            codePostal: valAdresse.adresseLivraison.codePostal,
                            complement: valAdresse.adresseLivraison.complement,
                            description: valAdresse.adresseLivraison.description,
                            estAdresseExistante:  valAdresse.adresseLivraison.estAdresseExistante,
                            id: valAdresse.adresseLivraison.id,
                            labelle: valAdresse.adresseLivraison?.labelle || valAdresse.adresseLivraison?.LabelleAdresse || "" ,
                            lot: valAdresse.adresseLivraison.lot,
                            quartier: valAdresse.adresseLivraison.quartier,
                            refAdresse: valAdresse.adresseLivraison.refAdresse,
                            ville: valAdresse.adresseLivraison.ville,
                        },
                        adresseFacturation : {
                            codePostal: valAdresse.adresseFacturation.codePostal,
                            complement: valAdresse.adresseFacturation.complement,
                            description: valAdresse.adresseFacturation.description,
                            estAdresseExistante: valAdresse.adresseFacturation.estAdresseExistante,
                            id: valAdresse.adresseFacturation.id,
                            labelle: valAdresse.adresseFacturation?.labelle || valAdresse.adresseFacturation?.LabelleAdresse || "",
                            lot: valAdresse.adresseFacturation.lot,
                            quartier: valAdresse.adresseFacturation.quartier,
                            refAdresse: valAdresse.adresseFacturation.refAdresse,
                            ville: valAdresse.adresseFacturation.ville,
                        },
                        
                    },
                }));
            }
        }
    }, [user]);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const StepICons = (props) => {
        const { active, completed, className } = props;
        const base = "h-8 w-8 items-center justify-center rounded-full text-white";
        const completedStyle = "bg-green-500";
        const activeStyle = "bg-blue-500";
        const defaultStyle = "bg-gray-300";

        const style = completed ? completedStyle : active ? activeStyle : defaultStyle;

        return <div className={`${base} ${style} ${className}`}>{completed ? "V" : props.icon}</div>;
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setFormData({
            etape1: {
                nom: "",
                email: "",
                nomClient: "",
                prenomClient: "",
                telephoneClient: "",
                dateNaissance: "",
                civiliteClient: "",
                password: "",
            },
            etape2: {
                AdresseDifferent: false,
                adresseLivraison : {
                    codePostal: "",
                    complement: "",
                    description: "",
                    id: "",
                    labelle: "",
                    lot: "",
                    quartier: "",
                    refAdresse: "",
                    ville: "",
                },
                adresseFacturation : {
                    codePostal: "",
                    complement: "",
                    description: "",
                    id: "",
                    labelle: "",
                    lot: "",
                    quartier: "",
                    refAdresse: "",
                    ville: "",
                },
                
            },
            etape3: { transactionId: "" },
        });
    };

    const handleStepSubmit = (stepKey, stepData) => {
        let normalizedData = stepData;
        if (stepKey === "etape1") {
            normalizedData = {
                ...stepData,
                nom: stepData.nom || stepData.nomClient || "",
                email: stepData.email || stepData.emailUsers || "",
                prenom: stepData.prenom || stepData.prenomClient || "",
                civilite: stepData.civilite || stepData.civiliteClient || "",
            };
        }

        setFormData((prevData) => ({
            ...prevData,
            [stepKey]: normalizedData,
        }));
        handleNext();
    };

    // Fonction pour obtenir le composant de contenu de l'étape
    function getStepContentComponent(step) {
        let stepKey = `etape${step + 1}`;
        const commonProps = {
            initialData: formData[stepKey],
            onSubmitSuccess: (data) => handleStepSubmit(stepKey, data),
        };

        switch (step) {
            case 0:
                return <FormInfosPersonnel {...commonProps} />;
            case 1:
                return <FormAdresse {...commonProps} />;
            case 2:
                return <FormPaiment {...commonProps} />;
            case 3:
                return (
                    <Box className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <Typography className="mb-2 font-medium dark:text-gray-300">Vérifiez vos informations :</Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Nom: {formData.etape1.nom || formData.etape1.nomClient || "Non spécifié"}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Prénom: {formData.etape1.prenom || formData.etape1.prenomClient || "Non spécifié"}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Email: {formData.etape1.email || "Non spécifié"}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Adresse: {formData.etape2.adresse || "Non spécifiée"}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Paiement: {formData.etape3.transactionId ? "Validé" : "En attente"}
                        </Typography>

                        {/* ✅ Afficher un message si commande existe déjà */}
                        {commandeExistante && (
                            <Alert
                                severity="info"
                                className="mt-4"
                            >
                                Vous avez déjà une commande en cours de traitement.
                            </Alert>
                        )}
                    </Box>
                );
            default:
                return <Typography>Étape Inconnue</Typography>;
        }
    }

    return (
        <div className="flex min-h-screen w-full justify-center bg-gray-100 py-2 dark:bg-slate-900">
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

            {/* ✅ Afficher un bandeau si commande existe déjà */}
            {commandeExistante && (
                <Alert
                    severity="info"
                    className="fixed left-1/2 top-4 z-50 w-11/12 max-w-2xl -translate-x-1/2 transform"
                >
                    Vous avez déjà une commande en cours. Vous ne pouvez pas créer une nouvelle commande.
                </Alert>
            )}

            <Box className="mx-4 flex w-full flex-col gap-6 md:flex-col lg:flex-row">
                {/* Formulaire */}
                <Box className="my-4 w-full rounded-xl bg-transparent p-8 shadow-2xl dark:shadow-black lg:w-2/3">
                    <Typography
                        variant="h4"
                        className="mb-6 text-center font-bold dark:text-white"
                    >
                        Processus de Commande
                    </Typography>

                    <Stepper
                        activeStep={activeStep}
                        orientation="vertical"
                    >
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel>
                                    <span
                                        className={`font-gothic text-[16px] ${activeStep === index ? "font-bold text-blue-600 dark:text-blue-400" : "dark:text-gray-300"}`}
                                    >
                                        {label}
                                    </span>
                                </StepLabel>
                                <StepContent>
                                    {getStepContentComponent(index)}

                                    <Box className="mt-4 flex space-x-2">
                                        {index === steps.length - 1 && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleNext}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                disabled={commandeExistante} // ✅ Désactiver si commande existe
                                            >
                                                Terminer la Commande
                                            </Button>
                                        )}

                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            className="border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            Précédent
                                        </Button>
                                    </Box>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === steps.length && (
                        <Paper
                            elevation={0}
                            className="mt-6 bg-green-50 p-4 dark:bg-green-900/50"
                        >
                            <Typography className="text-lg font-semibold text-green-700 dark:text-green-300">
                                Toutes les étapes sont terminées - Commande en cours de traitement !
                            </Typography>
                            <Button
                                onClick={handleReset}
                                className="mt-2 text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Réinitialiser le formulaire
                            </Button>
                        </Paper>
                    )}
                </Box>

                {/* Résumé du panier*/}
                <Box className="sticky top-48 my-4 h-fit w-full rounded-2xl bg-transparent p-6 shadow-2xl dark:shadow-slate-950 lg:w-1/3">
                    <Typography
                        variant="h5"
                        className="mb-4 border-b border-gray-200 pb-2 font-bold dark:border-gray-700 dark:text-white"
                    >
                        Résumé de la commande
                    </Typography>

                    <Box className="space-y-3 text-sm dark:text-gray-300">
                        <Box>
                            <Typography className="font-medium text-gray-700 dark:text-gray-200">Informations Personnelles:</Typography>
                            <Typography className="ml-2">Civilité: {formData.etape1.civiliteClient || "En attente..."}</Typography>
                            <Typography className="ml-2">Nom: {formData.etape1.nom || formData.etape1.nomClient || "En attente..."}</Typography>
                            <Typography className="ml-2">
                                Prénom: {formData.etape1.prenom || formData.etape1.prenomClient || "En attente..."}
                            </Typography>
                            <Typography className="ml-2">Email: {formData.etape1.email || "En attente..."}</Typography>
                            <Typography className="ml-2">Téléphone: {formData.etape1.telephoneClient || "En attente..."}</Typography>
                            <Typography className="ml-2">Date de naissance: {formData.etape1.dateNaissance || "En attente..."}</Typography>
                            <Typography className="ml-2 text-xs text-gray-500">
                                {user && user.emailUsers ? "(Utilisateur connecté)" : "(Nouvel utilisateur)"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography className="font-medium text-gray-700 dark:text-gray-200">Adresse de Livraison:</Typography>
                            <Typography className="ml-2">{formData.etape2.adresse || "En attente..."}</Typography>
                            <Typography className="ml-2">Préférence: {formData.etape2.preference || "N/A"}</Typography>
                        </Box>

                        <Box>
                            <Typography className="font-medium text-gray-700 dark:text-gray-200">Paiement:</Typography>
                            <Typography className="ml-2">Statut: {formData.etape3.transactionId ? "Validé" : "En attente..."}</Typography>
                        </Box>

                        {/* ✅ Afficher l'état de la commande */}
                        {commandeExistante && (
                            <Box className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/30">
                                <Typography className="font-medium text-yellow-700 dark:text-yellow-300">⚠️ Commande existante</Typography>
                                <Typography className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Vous avez déjà une commande en cours de traitement.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Typography
                        variant="h6"
                        className="mt-6 border-t border-gray-200 pt-4 font-bold dark:border-gray-700 dark:text-white"
                    >
                        Total: 125.00 € (Simulé)
                    </Typography>
                </Box>
            </Box>
        </div>
    );
}

