// ... imports et fonctions utilitaires ...

const FormAdresse = ({ initialData, onSubmitSuccess }) => {
    // ... tous les états existants ...

    // NOUVELLE FONCTION : Gérer spécifiquement la création d'adresse
    const handleCreateAddress = async (e) => {
        e.preventDefault(); // Empêcher la soumission du formulaire principal
        e.stopPropagation(); // Empêcher la propagation de l'événement

        if (validate()) {
            let donneesAdresse;
            
            // Construction des données d'adresse (identique à handleSubmit)
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
            console.log("Création d'adresse:", donneesAdresse);
            
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

                    // Sauvegarder l'ancienne liste d'adresses pour détecter la nouvelle
                    const anciennesAdresses = [...adressesClient];

                    if (refCommandeNettoyee) {
                        // Mise à jour de commande existante
                        const dataCommandeUpdate = {
                            adresse: donneesAdresse,
                            refCommande: refCommandeNettoyee
                        };
                        
                        const response = await updateCommandePanier(dataCommandeUpdate);
                        
                        if (response.data) {
                            console.log("Commande mis à jour avec succès:", response.data);
                            localStorage.setItem('RefCommande', response.data.refCommande);
                            localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                            
                            // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
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
                            
                            // IMPORTANT: Ne pas appeler onSubmitSuccess ici pour rester sur la même étape
                            // onSubmitSuccess(donneesAdresse);
                        } else {
                            console.log("Erreur de commande: ", response.error);
                            setMessage({
                                ouvre: true,
                                texte: "Erreur lors de la création de l'adresse. Veuillez réessayer.",
                                statut: "error",
                            });
                            setOpen(true);
                        }
                    } else {
                        // Créer nouvelle commande
                        const dataCommandeCreate = {
                            adresse: donneesAdresse
                        };
                        
                        const response = await createCommandePanier(dataCommandeCreate);
                        
                        if (response.data) {
                            console.log("Commande créée avec succès:", response.data);
                            localStorage.setItem('RefCommande', response.data.refCommande);
                            localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                            
                            // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
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
                            
                            // IMPORTANT: Ne pas appeler onSubmitSuccess ici pour rester sur la même étape
                            // onSubmitSuccess(donneesAdresse);
                        } else {
                            console.log("Erreur de commande: ", response.error);
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
                console.error(" Erreur création adresse:", error);
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

    // Fonction handleSubmit originale (pour le bouton "Valider la commande")
    const handleSubmit = async (e) => {
        e.preventDefault();
       
        if (validate()) {
            let donneesAdresse;
            
            // Construction des données d'adresse (identique)
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
            console.log("Validation de commande:", donneesAdresse);
            
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

                        // Sauvegarder l'ancienne liste d'adresses pour détecter la nouvelle
                        const anciennesAdresses = [...adressesClient];

                        if (refCommandeNettoyee) {
                            // Mise à jour de commande existante
                            const dataCommandeUpdate = {
                                adresse: donneesAdresse,
                                refCommande: refCommandeNettoyee
                            };
                            
                            const response = await updateCommandePanier(dataCommandeUpdate);
                            
                            if (response.data) {
                                console.log("Commande mis à jour avec succès:", response.data);
                                localStorage.setItem('RefCommande', response.data.refCommande);
                                localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
                                // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
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
                                onSubmitSuccess(donneesAdresse); // Ici on passe à l'étape suivante
                            } else {
                                console.log("Erreur de commande: ", response.error);
                                setMessage({
                                    ouvre: true,
                                    texte: "Erreur lors de la mis à jour de la commande. Veuillez réessayer.",
                                    statut: "error",
                                });
                                setOpen(true);
                            }
                        } else {
                            // Créer nouvelle commande
                            const dataCommandeCreate = {
                                adresse: donneesAdresse
                            };
                            
                            const response = await createCommandePanier(dataCommandeCreate);
                            
                            if (response.data) {
                                console.log("Commande créée avec succès:", response.data);
                                localStorage.setItem('RefCommande', response.data.refCommande);
                                localStorage.setItem('DataAdresse', JSON.stringify(donneesAdresse));
                                
                                // Si une nouvelle adresse a été créée, recharger la liste et la sélectionner automatiquement
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
                                onSubmitSuccess(donneesAdresse); // Ici on passe à l'étape suivante
                            } else {
                                console.log("Erreur de commande: ", response.error);
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
                    console.error(" Erreur création commande:", error);
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

    // ... le reste du code reste inchangé ...

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
            
            {/* FORMULAIRE PRINCIPAL - seulement pour la validation de commande */}
            <form onSubmit={handleSubmit}>
                <div className="flex w-full flex-col px-1">
                    
                    {/* ... tout le contenu existant ... */}

                    {/* Formulaire de nouvelle adresse de livraison */}
                    {!utiliserAdresseExistante && (
                        <div className={`my-3 flex w-full flex-col items-center justify-center py-3 transition-all duration-500 ease-in-out overflow-hidden`}>
                            {/* ... champs du formulaire ... */}
                            
                            {/* Boutons pour le formulaire de nouvelle adresse - UTILISER handleCreateAddress */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button" // IMPORTANT: type="button" pour éviter la soumission du formulaire principal
                                    onClick={handleCancelNewAddress}
                                    className="btn btn-outline btn-error"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button" // IMPORTANT: type="button" pour éviter la soumission du formulaire principal
                                    onClick={handleCreateAddress} // Utiliser handleCreateAddress au lieu de handleSubmit
                                    className="btn btn-primary"
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

                    {/* Formulaire de nouvelle adresse de facturation */}
                    {utiliserFacturationDifferent && !utiliserAdresseFacturationExistante && (
                        <div className={`my-3 flex w-full flex-col shadow-md shadow-slate-300 dark:shadow-black rounded-xl items-center justify-center py-3 transition-colors duration-500 ease-in-out overflow-hidden`}>
                            {/* ... champs du formulaire ... */}
                            
                            {/* Boutons pour le formulaire de nouvelle adresse de facturation - UTILISER handleCreateAddress */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button" // IMPORTANT: type="button" pour éviter la soumission du formulaire principal
                                    onClick={handleCancelNewBillingAddress}
                                    className="btn btn-outline btn-error"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button" // IMPORTANT: type="button" pour éviter la soumission du formulaire principal
                                    onClick={handleCreateAddress} // Utiliser handleCreateAddress au lieu de handleSubmit
                                    className="btn btn-primary"
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

                    {/* Bouton de soumission principal - UTILISER handleSubmit */}
                    {!showNewAddressForm && !showNewBillingAddressForm && (
                        <div className="mt-6 flex justify-center">
                            <button
                                type="submit" // type="submit" pour soumettre le formulaire principal
                                className="btn btn-accent btn-outline btn-wide"
                                disabled={loading}
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