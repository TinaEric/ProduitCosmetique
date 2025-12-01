import React, { useEffect, useState, useRef } from "react";
import { Stepper, Step, StepLabel, StepContent, Button, Box, Typography, Paper } from "@mui/material";
import FormAdresse from "./FormAdresse";
import FormInfosPersonnel from "./FormInfosPersonnel";
import { updateCommandePanier,envoieEmail } from "@/services/ClientService";
import FormPaiement from "./FormPaiement"; // Note: changement de nom
import { useAuth } from "../../../hook/useAuth";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { usePanier } from "@/Client/context/PanierContext";
import { MdCloseFullscreen, MdOutlineClose, MdRemoveShoppingCart } from "react-icons/md";

const steps = ["Informations Personnels", "Adresse de Livraison et Facturation", "Service Livraison et Paiement", "Validation Finale"];

export default function CommandeEtape() {
    const { isAuthenticated, user } = useAuth();
    const { items, setItems } = usePanier();
    const initialStep = isAuthenticated ? 0 : 0;
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = React.useState(initialStep);
    const [open, setOpen] = useState(false);
    const [coutLiv, setCoutLiv] = useState(0);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    const commandeDejaEnvoyee = useRef(false);
    const [commandeExistante, setCommandeExistante] = useState(false);
    const [panier, setPanier] = useState(items); 

    // Fonction pour envoyer l'email de confirmation
    const envoyerEmailConfirmation = async (commandeData, clientEmail) => {
        try {
            const emailData = {
                to: clientEmail,
                subject: "Confirmation de votre commande",
                commande: {
                    reference: commandeData.refCommande,
                    items: items,
                    total: NetPayer(),
                    livraison: formData.etape3.methodeLivraison,
                    paiement: formData.etape3.methodePaiement,
                    adresseLivraison: formData.etape2.adresseLivraison,
                    client: {
                        nom: formData.etape1.nom || formData.etape1.nomClient,
                        prenom: formData.etape1.prenom || formData.etape1.prenomClient,
                        email: formData.etape1.email
                    }
                }
            };
            const response = await envoieEmail(emailData);
            if (!response.data) {
                throw new Error('Erreur envoi email');
            }

            const result = await response.json();
            console.log('Email de confirmation envoyé:', result);
            return result;
        } catch (error) {
            console.error('Erreur envoi email confirmation:', error);
            return { success: false, error: error.message };
        }
    };

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
            adresseLivraison: {
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
            adresseFacturation: {
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
        etape3: {
            methodeLivraison: "",
            methodePaiement: "",
            fraisLivraison: "",
        },
    });

    const calculerTotal = () => {
        return items.reduce((total, item) => {
            return total + item.prix * item.quantite;
        }, 0);
    };

    const NetPayer = () => {
        return calculerTotal() + prixlivr(formData.etape3.methodeLivraison);
    };
    const prixlivr = (valeur) => {
        switch (valeur) {
            case "standard":
                return 2000;
            case "express":
                return 5000;
            case "mangasin":
                return 0;
            default:
                return 0;
        }
    };

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
            const valAdresse = JSON.parse(localStorage.getItem("DataAdresse"));
            const refCommande = localStorage.getItem("RefCommande");
            if (valAdresse && refCommande) {
                setFormData((prevData) => ({
                    ...prevData,
                    etape2: {
                        AdresseDifferent: valAdresse.AdresseDifferent,
                        adresseLivraison: {
                            codePostal: valAdresse.adresseLivraison.codePostal,
                            complement: valAdresse.adresseLivraison.complement,
                            description: valAdresse.adresseLivraison.description,
                            estAdresseExistante: valAdresse.adresseLivraison.estAdresseExistante,
                            id: valAdresse.adresseLivraison.id,
                            labelle: valAdresse.adresseLivraison?.labelle || valAdresse.adresseLivraison?.LabelleAdresse || "",
                            lot: valAdresse.adresseLivraison.lot,
                            quartier: valAdresse.adresseLivraison.quartier,
                            refAdresse: valAdresse.adresseLivraison.refAdresse,
                            ville: valAdresse.adresseLivraison.ville,
                        },
                        adresseFacturation: {
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
            const methLivr = localStorage.getItem("methodeLivraison");
            const methPaiement = localStorage.getItem("methodePaiement");
            if (methLivr && methPaiement && refCommande) {
                setFormData((prevData) => ({
                    ...prevData,
                    etape3: {
                        methodeLivraison: methLivr,
                        methodePaiement: methPaiement,
                        fraisLivraison: prixlivr(methLivr),
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
                adresseLivraison: {
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
                adresseFacturation: {
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
            etape3: {
                methodeLivraison: "",
                methodePaiement: "",
                fraisLivraison: "",
            },
        });
    };

    const commandeMisAJour = async () => {
        
        setLoading(true);
        try {
            const panier = JSON.parse(localStorage.getItem("panier")) || items;
            if (panier.length > 0) {
                const commandeExiste = localStorage.getItem("RefCommande");
                let refCommandeNettoyee = null;
                const formatPanier = panier.map(item => {
                    return {
                        produit : item.id,
                        quantite : item.quantite
                    }
                })
                if (commandeExiste) {
                    try {
                        refCommandeNettoyee = JSON.parse(commandeExiste);
                    } catch (e) {
                        refCommandeNettoyee = commandeExiste;
                    }

                    if (typeof refCommandeNettoyee === "string") {
                        refCommandeNettoyee = refCommandeNettoyee.replace(/^"+|"+$/g, "");
                    }
                }

                if (refCommandeNettoyee) {
                    const dataCommandeUpdate = {
                        panier: formatPanier,
                        methodeLivraison: formData.etape3.methodeLivraison,
                        methodePaiement: formData.etape3.methodePaiement,
                        fraisLivraison: formData.etape3.fraisLivraison, 
                        refCommande: refCommandeNettoyee,
                    };
                    console.log("Data: ",dataCommandeUpdate)
                    const response = await updateCommandePanier(dataCommandeUpdate);

                    if (response.data) {
                        // ENVOYER L'EMAIL DE CONFIRMATION
                        const emailResult = await envoyerEmailConfirmation(
                            { refCommande: refCommandeNettoyee },
                            formData.etape1.email
                        );

                        let messageText = "Votre commande a été passée avec succès. En attente de votre paiement.";
                        
                        if (emailResult.success) {
                            messageText += " Un email de confirmation vous a été envoyé.";
                        } else {
                            messageText += " (Note: L'email de confirmation n'a pas pu être envoyé)";
                        }

                        setMessage({
                            ouvre: true,
                            texte: messageText,
                            statut: "success",
                        });
                        console.log("Resultat: ", response.data)
                        setMessage({
                            ouvre: true,
                            texte: "Votre commande a été passé avec succès.En attente de vos paiement",
                            statut: "success",
                        });
                        setOpen(true);
                        localStorage.removeItem('panier');
                        localStorage.removeItem('RefCommande');
                        localStorage.removeItem('DataAdresse');
                        localStorage.removeItem('methodeLivraison');
                        localStorage.removeItem('methodePaiement');
                        setItems([]);
                        handleNext();
                    } else {
                        console.log("Erruer Backend: ",response.error)
                        setMessage({
                            ouvre: true,
                            texte: "Une erreur s'est produit lors du validation de vos commande. Veuillez Attendre quelque minute.",
                            statut: "error",
                        });
                        setOpen(true);
                    }
                } else {
                    console.log("Commande n'existe pas dans localstorage")
                        setMessage({
                            ouvre: true,
                            texte: "Vous n'avez pas de commande à créer!. Veuillez séléctionner vos produit à commander.",
                            statut: "error",
                        });
                        setOpen(true);
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
                return <FormPaiement {...commonProps} />; // Utilisation du nouveau composant
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
                            Adresse Livraison: {formData.etape2.adresseLivraison?.labelle || "Non spécifiée"}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Méthode Livraison: {formData.etape3.methodeLivraison || "Non spécifiée"}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="dark:text-gray-400"
                        >
                            Méthode Paiement: {formData.etape3.methodePaiement || "Non spécifiée"}
                        </Typography>

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
                        className="mb-6 text-center font-bold text-gray-500 dark:text-white"
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
                                                onClick={commandeMisAJour}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                disabled={commandeExistante}
                                            >
                                              {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="loading loading-spinner"></span>
                                                        Vérification de vos informations...
                                                    </div>
                                                ) : (
                                                    "Passer à la caisse"
                                                )} 
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

                {/* Résumé du panier */}
                <Box className="sticky top-48 my-4 h-fit w-full rounded-2xl bg-transparent p-6 shadow-2xl dark:shadow-slate-950 lg:w-1/3">
                    <Typography
                        variant="h5"
                        className="mb-4 flex justify-center border-b border-gray-200 pb-2 font-bold text-gray-500 dark:border-gray-700 dark:text-white"
                    >
                        <span> Résumé du Panier</span>
                    </Typography>

                    {items.length === 0 ? (
                        <div className="flex h-[400px] w-full flex-col items-center justify-center space-y-4 text-slate-500 dark:text-slate-400">
                            <MdRemoveShoppingCart className="text-[70px]" />
                            <p className="text-xl">Votre panier est vide</p>
                        </div>
                    ) : (
                        <Box className="space-y-4">
                            {/* Liste des articles */}
                            {items.map((item, index) => (
                                <Box
                                    key={index}
                                    className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700"
                                >
                                    <Box className="flex items-center space-x-3 pt-2">
                                        {item.image && (
                                            <img
                                                src={`/image/${item.image}`}
                                                alt={item.nom}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        )}
                                        <Box>
                                            <Typography className="font-medium text-gray-700 dark:text-gray-200">{item.nom}</Typography>
                                            <Typography className="text-sm text-gray-500 dark:text-gray-400">Quantité: {item.quantite}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography className="font-medium text-gray-700 dark:text-gray-200">
                                        {(item.prix * item.quantite).toFixed(2)} Ar
                                    </Typography>
                                </Box>
                            ))}

                            {/* Sous-total */}
                            <Box className="border-t border-gray-200 pt-3 dark:border-gray-700">
                                <Box className="flex justify-between">
                                    <Typography className="text-gray-600 dark:text-gray-300">Total :</Typography>
                                    <Typography className="text-gray-600 dark:text-gray-300">{calculerTotal().toFixed(2)} Ar</Typography>
                                </Box>

                                {/* Méthodes sélectionnées */}
                                {formData.etape3.methodeLivraison && (
                                    <Box className="mt-2 flex justify-between">
                                        <Typography className="text-sm text-gray-500 dark:text-gray-400">
                                            Livraison ({formData.etape3.methodeLivraison}):
                                        </Typography>
                                        <Typography className="text-sm text-gray-500 dark:text-gray-400">
                                            {/* Ajouter le prix de livraison si disponible */}+{" "}
                                            {prixlivr(formData.etape3.methodeLivraison).toFixed(2)} Ar
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Total */}
                            <Box className="border-t border-gray-200 pt-3 dark:border-gray-700">
                                <Typography
                                    variant="h6"
                                    className="flex justify-between font-bold text-black dark:text-white"
                                >
                                    <span>Net à payer:</span>
                                    <span>{NetPayer().toFixed(2)} Ar</span>
                                </Typography>
                            </Box>

                            {/* Informations de livraison sélectionnées */}
                            {(formData.etape3.methodeLivraison || formData.etape3.methodePaiement) && (
                                <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
                                    <div className="flex justify-center font-bold text-blue-700 dark:text-blue-300">Options sélectionnées:</div>
                                    {formData.etape3.methodeLivraison && (
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Livraison: {formData.etape3.methodeLivraison}</div>
                                    )}
                                    {formData.etape3.methodePaiement && (
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Paiement: {formData.etape3.methodePaiement}</div>
                                    )}
                                </div>
                            )}
                        </Box>
                    )}

                    {/* Message commande existante */}
                    {commandeExistante && (
                        <Box className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/30">
                            <Typography className="font-medium text-yellow-700 dark:text-yellow-300">⚠️ Commande existante</Typography>
                            <Typography className="text-xs text-yellow-600 dark:text-yellow-400">
                                Vous avez déjà une commande en cours de traitement.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </div>
    );
}
