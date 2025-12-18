import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getMesCommandes } from "@/services/ClientService";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { telechargerFacture, verifierFactureDisponible } from "@/services/FactureService";
import {
    ShoppingBagIcon,
    CalendarDaysIcon,
    TruckIcon,
    CreditCardIcon,
    MapPinIcon,
    ChevronRightIcon,
    FunnelIcon,
    XMarkIcon,
    DocumentArrowDownIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const MesCommande = () => {
    const { user, isAuthenticated } = useAuthContext();
    const [commandes, setCommandes] = useState([]);
    const [commandesFiltrees, setCommandesFiltrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
    const [dejaConnecte, setDejaConnecte] = useState(false);
    const [filtreStatut, setFiltreStatut] = useState('tous');
    const [telechargementFacture, setTelechargementFacture] = useState({});
    const [factureDisponibleCache, setFactureDisponibleCache] = useState({});
    const [verificationEnCours, setVerificationEnCours] = useState({});
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
            ouvre: false,
            texte: "vide",
            statut: "success",
        });

    const [optionsStatut, setOptionsStatut] = useState([
        { value: 'tous', label: 'Toutes', count: 0, icon: ShoppingBagIcon },
        { value: 'EN_ATTENTE_PAIEMENT', label: 'En attente', count: 0, icon: ClockIcon },
        { value: 'EN_PREPARATION', label: 'En préparation', count: 0, icon: ClockIcon },
        { value: 'EXPEDIEE', label: 'Expédiées', count: 0, icon: TruckIcon },
        { value: 'LIVREE', label: 'Livrées', count: 0, icon: CheckCircleIcon },
        { value: 'ANNULER', label: 'Annulées', count: 0, icon: XCircleIcon }
    ]);

    useEffect(() => {
        if (isAuthenticated && user?.client) {
            chargerCommandes();
        }
    }, [isAuthenticated, user]);

    
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    useEffect(() => {
        const chargementUser = () => {
            const local = localStorage.getItem('user');
            if (local) {
                const parsedUser = JSON.parse(local);
                if (parsedUser && parsedUser.client) {
                    setDejaConnecte(true);
                    chargerCommandes();
                }
            }
        };
        chargementUser();
    }, []);
    
    useEffect(() => {
        filtrerCommandes();
    }, [commandes, filtreStatut]);

    
        const getStatutPaiements = (status) => {
            switch (status) {
                case "INITIALISE":
                    return "Non Payé"; 
                    
                case "LIVREE":
                    return "Payé";
        
                case "EXPEDIEE":
                    return "Payé"; 
                    
                case "EN_PREPARATION":
                    return "Payé"; 
                    
                case "ANNULER":
                    return "Non Terminé";
                    
                case "EN_ATTENTE_PAIEMENT":
                    return "En attente";
                    
                default:
                    return "Valide";
            }
        };

    const chargerCommandes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMesCommandes();
            
            if (response.data) {
                const commandesTriees = response.data.sort((a, b) => 
                    new Date(b.dateCommande?.date || b.dateCommande) - new Date(a.dateCommande?.date || a.dateCommande)
                );
                setCommandes(commandesTriees);
                console.log(response.data)
                // Vérifier la disponibilité des factures pour chaque commande
                verifierFacturesDisponibles(commandesTriees);
            } else {
                setCommandes([]);
                setError(response.message || "Erreur lors du chargement des commandes");
            }
        } catch (err) {
            console.error("Erreur lors du chargement des commandes:", err);
            setError(err.message || "Erreur lors du chargement de vos commandes");
        } finally {
            setLoading(false);
        }
    };

    const verifierFacturesDisponibles = async (commandesListe) => {
        const cache = {};
        for (const commande of commandesListe) {
            // Pour les statuts autorisés, vérifier avec le backend
            const statutsAvecFacture = ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];
            if (statutsAvecFacture.includes(commande.statutCommande)) {
                try {
                    setVerificationEnCours(prev => ({ ...prev, [commande.refCommande]: true }));
                    // Utiliser l'ID de la commande ou la référence comme fallback
                    const commandeId = commande.id || commande.refCommande;
                    const result = await verifierFactureDisponible(commandeId);
                    cache[commande.refCommande] = result.disponible || false;
                } catch (error) {
                    console.warn(`Impossible de vérifier la facture pour ${commande.refCommande}:`, error);
                    cache[commande.refCommande] = false;
                } finally {
                    setVerificationEnCours(prev => ({ ...prev, [commande.refCommande]: false }));
                }
            } else {
                cache[commande.refCommande] = false;
            }
        }
        setFactureDisponibleCache(cache);
    };

    const filtrerCommandes = () => {
        if (filtreStatut === 'tous') {
            setCommandesFiltrees(commandes);
        } else {
            const filtrees = commandes.filter(commande => 
                commande.statutCommande === filtreStatut
            );
            setCommandesFiltrees(filtrees);
        }
    };

    useEffect(() => {
        if (commandes.length > 0) {
            const counts = {
                'tous': commandes.length,
                'EN_ATTENTE_PAIEMENT': commandes.filter(c => c.statutCommande === 'EN_ATTENTE_PAIEMENT').length,
                'EN_PREPARATION': commandes.filter(c => c.statutCommande === 'EN_PREPARATION').length,
                'EXPEDIEE': commandes.filter(c => c.statutCommande === 'EXPEDIEE').length,
                'LIVREE': commandes.filter(c => c.statutCommande === 'LIVREE').length,
                'ANNULER': commandes.filter(c => c.statutCommande === 'ANNULEE' || c.statutCommande === 'ANNULER').length
            };
            
            setOptionsStatut(prev => prev.map(option => ({
                ...option,
                count: counts[option.value] || 0
            })));
        }
    }, [commandes]);

    const telechargerFactureCommande = async (commandeId, refCommande, e) => {
        if (e) {
            e.stopPropagation();
        }
        
        try {
            // Mettre à jour l'état de téléchargement
            setTelechargementFacture(prev => ({
                ...prev,
                [commandeId]: true
            }));

            // Télécharger la facture
            const result = await telechargerFacture(commandeId);
            console.log(result)
            // Succès - optionnel: afficher un toast ou notification
            console.log(`Facture ${refCommande} téléchargée avec succès`);
            
        } catch (error) {
            console.error("Erreur lors du téléchargement:", error);
            
            // Afficher un message d'erreur
            let errorMessage = error.message || "Erreur lors du téléchargement";
            
            // Gestion des erreurs spécifiques
            if (errorMessage.includes('non disponible') || errorMessage.includes('400')) {
                setMessage({
                    ouvre: true,
                    texte: `La facture n'est pas encore disponible pour la commande ${refCommande}.`,
                    statut: "error",
                });
                setOpen(true);
            } else if (errorMessage.includes('accès') || errorMessage.includes('403')) {
                setMessage({
                    ouvre: true,
                    texte: "Vous n'avez pas l'autorisation de télécharger cette facture.",
                    statut: "error",
                });
                setOpen(true);
            } else if (errorMessage.includes('non trouvée') || errorMessage.includes('404')) {
                setMessage({
                    ouvre: true,
                    texte: `Commande non trouvée avec le reference ${refCommande}.`,
                    statut: "error",
                });
                setOpen(true);
            } else {
                setMessage({
                    ouvre: true,
                    texte: `Une probleme s'est produit lors de generation de vos facture`,
                    statut: "error",
                });
                setOpen(true);
                console.log(`Erreur: ${errorMessage}`);
            }
            
            // Mettre à jour le cache
            setFactureDisponibleCache(prev => ({
                ...prev,
                [refCommande]: false
            }));
            
        } finally {
            // Réinitialiser l'état de téléchargement
            setTelechargementFacture(prev => ({
                ...prev,
                [commandeId]: false
            }));
        }
    };

    const peutAvoirFacture = (commande) => {
        // Vérifier d'abord le cache
        if (factureDisponibleCache[commande.refCommande] !== undefined) {
            return factureDisponibleCache[commande.refCommande];
        }
        
        // Sinon, vérifier par statut
        const statutsAvecFacture = ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];
        return statutsAvecFacture.includes(commande.statutCommande);
    };

    const getStatusConfig = (status) => {
        const configs = {
            "INITIALISE": {
                color: "bg-orange-50 text-orange-600 border-orange-200",
                darkColor: "dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
                dotColor: "bg-orange-500",
                text: "Initialisé"
            },
            "LIVREE": {
                color: "bg-emerald-50 text-emerald-600 border-emerald-200",
                darkColor: "dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
                dotColor: "bg-emerald-500",
                text: "Livrée"
            },
            "EXPEDIEE": {
                color: "bg-blue-50 text-blue-600 border-blue-200",
                darkColor: "dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                dotColor: "bg-blue-500",
                text: "Expédiée"
            },
            "EN_PREPARATION": {
                color: "bg-amber-50 text-amber-600 border-amber-200",
                darkColor: "dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
                dotColor: "bg-amber-500",
                text: "En Préparation"
            },
            "ANNULER": {
                color: "bg-red-50 text-red-600 border-red-200",
                darkColor: "dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                dotColor: "bg-red-500",
                text: "Annulée"
            },
            "EN_ATTENTE_PAIEMENT": {
                color: "bg-purple-50 text-purple-600 border-purple-200",
                darkColor: "dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
                dotColor: "bg-purple-500",
                text: "En attente paiement"
            }
        };
        
        return configs[status] || {
            color: "bg-gray-50 text-gray-600 border-gray-200",
            darkColor: "dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
            dotColor: "bg-gray-500",
            text: status || 'En attente'
        };
    };

    const formatDate = (dateObj) => {
        if (!dateObj) return 'Date non disponible';
        
        try {
            // Gérer les différents formats de date
            const dateString = dateObj.date || dateObj;
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }
            
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'Date non disponible';
        }
    };

    const formatDateComplete = (dateObj) => {
        if (!dateObj) return 'Date non disponible';
        
        try {
            const dateString = dateObj.date || dateObj;
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return 'Date invalide';
            }
            
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Date non disponible';
        }
    };

    const calculerTotalCommande = (commande) => {
        if (!commande.paniers || commande.paniers.length === 0) {
            return parseFloat(commande.montantTotal || commande.fraisLivraison || 0);
        }
        
        const totalProduits = commande.paniers.reduce((total, panier) => {
            const prix = parseFloat(panier.prixUnitaire || panier.produit?.prixProduit || 0);
            const quantite = parseInt(panier.quantite || 0);
            return total + (prix * quantite);
        }, 0);

        const fraisLivraison = parseFloat(commande.fraisLivraison || 0);
        return totalProduits + fraisLivraison;
    };

    const getProduitImage = (produit) => {
        if (!produit) return null;
        
        if (produit.imageUrlProduit) {
            return `/image/${produit.imageUrlProduit}`;
        }
        if (produit.image) {
            return `/image/${produit.image}`;
        }
        return null;
    };

    const getProduitNom = (produit) => {
        if (!produit) return "Produit non disponible";
        
        return produit.nomProduit || produit.nom || "Produit";
    };

    const getProduitPrix = (produit, panier) => {
        return parseFloat(panier?.prixUnitaire || produit?.prixProduit || 0);
    };

    const getStatutPaiement = (paiement) => {
        if (!paiement) return "Non spécifié";
        
        const statuts = {
            "EN_ATTENTE_LIVRAISON": "En attente",
            "PAYE": "Payé",
            "EN_ATTENTE_PAIEMENT": "En attente",
            "ANNULER": "Annulé"
        };
        
        return statuts[paiement.statutPaiment] || paiement.statutPaiment || "Inconnu";
    };

    if (!isAuthenticated && !dejaConnecte) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 pt-32">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBagIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Connexion requise</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Veuillez vous connecter pour accéder à vos commandes</p>
                    <button 
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4 pb-12">
            <div className=" px-4 sm:px-6 lg:px-8">
                {/* Header max-w-7xl mx-auto */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mes commandes</h1>
                    <p className="text-gray-600 dark:text-gray-400">Suivez et gérez toutes vos commandes</p>
                </div>
                 {/* message notification */}
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

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Filtres */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max">
                        {optionsStatut.map((option) => {
                            const Icon = option.icon;
                            const isActive = filtreStatut === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setFiltreStatut(option.value)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{option.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {option.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Indicateur de filtre actif */}
                {filtreStatut !== 'tous' && (
                    <div className="mb-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                                Filtre actif: <strong>{optionsStatut.find(opt => opt.value === filtreStatut)?.label}</strong>
                            </span>
                        </div>
                        <button 
                            onClick={() => setFiltreStatut('tous')}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Effacer le filtre
                        </button>
                    </div>
                )}

                {/* Liste des commandes */}
                {commandesFiltrees.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBagIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {filtreStatut === 'tous' ? 'Aucune commande' : 'Aucune commande correspondante'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {filtreStatut === 'tous' 
                                ? 'Vous n\'avez pas encore passé de commande'
                                : 'Aucune commande ne correspond à ce filtre'
                            }
                        </p>
                        {filtreStatut === 'tous' ? (
                            <Link to="/Produit" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95">
                                Découvrir nos produits
                                <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                        ) : (
                            <button 
                                onClick={() => setFiltreStatut('tous')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                            >
                                Voir toutes les commandes
                            </button>
                        )}
                    </div>
                ) : (
                    loading ? (
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-32">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Chargement de vos commandes...</p>
                            </div>
                        </div>
                    ) : (
                    <div className="space-y-4">
                        {commandesFiltrees.map((commande) => {
                            const statusConfig = getStatusConfig(commande.statutCommande);
                            const isSelected = commandeSelectionnee === commande.refCommande;
                            const commandeId = commande.id || commande.refCommande;
                            const factureDisponible = peutAvoirFacture(commande);
                            const telechargementEnCours = telechargementFacture[commandeId];
                            const verificationEnCoursRef = verificationEnCours[commande.refCommande];
                            
                            return (
                                <div key={commande.refCommande} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Carte principale - cliquable */}
                                    <button
                                        onClick={() => setCommandeSelectionnee(isSelected ? null : commande.refCommande)}
                                        className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            {/* Info principale */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                                                        #{commande.refCommande}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color} ${statusConfig.darkColor}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}></span>
                                                        {statusConfig.text}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <CalendarDaysIcon className="h-4 w-4" />
                                                    <span>{formatDate(commande.dateCommande)}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <ShoppingBagIcon className="h-4 w-4" />
                                                        <span>{commande.paniers?.length || 0} article{commande.paniers?.length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                    {commande.methodeLivraison && (
                                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                            <TruckIcon className="h-4 w-4" />
                                                            <span>{commande.methodeLivraison}</span>
                                                        </div>
                                                    )}
                                                    {commande.methodePaiement && (
                                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                            <CreditCardIcon className="h-4 w-4" />
                                                            <span>{commande.methodePaiement}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Prix et actions */}
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {calculerTotalCommande(commande).toFixed(2)} Ar
                                                    </div>

                                                    {/* Bouton facture */}
                                                    {factureDisponible && (
                                                        <button
                                                            onClick={(e) => telechargerFactureCommande(commandeId, commande.refCommande, e)}
                                                            disabled={telechargementEnCours || verificationEnCoursRef}
                                                            className={`mt-2 text-xs flex items-center gap-1 ${
                                                                telechargementEnCours || verificationEnCoursRef
                                                                    ? 'text-gray-400 cursor-not-allowed'
                                                                    : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                                                            }`}
                                                        >
                                                            {telechargementEnCours ? (
                                                                <>
                                                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                                    Téléchargement...
                                                                </>
                                                            ) : verificationEnCoursRef ? (
                                                                <>
                                                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                                    Vérification...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DocumentArrowDownIcon className="h-3 w-3" />
                                                                    Télécharger la facture
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <ChevronRightIcon className={`h-5 w-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Détails expandables */}
                                    {isSelected && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="p-6 space-y-6">
                                                {/* Informations générales */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Informations commande</h4>
                                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex justify-between">
                                                                <span>Date commande:</span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {formatDateComplete(commande.dateCommande)}
                                                                </span>
                                                            </div>
                                                            {commande.dateLivraison && (
                                                                <div className="flex justify-between">
                                                                    <span>Date livraison:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                                        {formatDateComplete(commande.dateLivraison)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between">
                                                                <span>Méthode paiement:</span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {commande.methodePaiement || "Non spécifié"}
                                                                </span>
                                                            </div>
                                                            {commande.paiement && (
                                                                <div className="flex justify-between">
                                                                    <span>Statut paiement:</span>
                                                                    <span className={`font-medium ${
                                                                        commande.paiement.statutPaiment === 'PAYE'
                                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                                            : 'text-amber-600 dark:text-amber-400'
                                                                    }`}>
                                                                        {getStatutPaiements(commande.statutCommande)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Informations client</h4>
                                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                            {commande.client && (
                                                                <>
                                                                    <div className="flex justify-between">
                                                                        <span>Client:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {commande.client.nomClient} {commande.client.prenomClient}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Téléphone:</span>
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {commande.client.telephoneClient}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Produits */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Produits commandés</h4>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {commande.paniers?.length || 0} article{commande.paniers?.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {commande.paniers?.map((panier, index) => {
                                                            const produit = panier.produit;
                                                            const image = getProduitImage(produit);
                                                            const nom = getProduitNom(produit);
                                                            const prix = getProduitPrix(produit, panier);
                                                            const total = prix * (panier.quantite || 0);
                                                            
                                                            return (
                                                                <div key={index} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl">
                                                                    {image && (
                                                                        <img 
                                                                            src={image}
                                                                            alt={nom}
                                                                            className="w-16 h-16 object-cover rounded-lg"
                                                                        />
                                                                    )}
                                                                    {!image && (
                                                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                                            <ShoppingBagIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                                                            {nom}
                                                                        </p>
                                                                        {produit?.descriptionProduit && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                                {produit.descriptionProduit.substring(0, 60)}...
                                                                            </p>
                                                                        )}
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                            Quantité: {panier.quantite || 1}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                                            {total.toFixed(2)} Ar
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {prix.toFixed(2)} Ar / unité
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Adresses */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {commande.adresseLivraison && (
                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <MapPinIcon className="h-4 w-4 text-gray-500" />
                                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Adresse de livraison</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                                <p className="font-medium text-gray-900 dark:text-white">{commande.adresseLivraison.labelle}</p>
                                                                <p>{commande.adresseLivraison.lot}, {commande.adresseLivraison.quartier}</p>
                                                                <p>{commande.adresseLivraison.codePostal} {commande.adresseLivraison.ville}</p>
                                                                {commande.adresseLivraison.complement && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Complément: {commande.adresseLivraison.complement}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {commande.adresseFacturation && (
                                                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <CreditCardIcon className="h-4 w-4 text-gray-500" />
                                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Adresse de facturation</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                                <p className="font-medium text-gray-900 dark:text-white">{commande.adresseFacturation.labelle}</p>
                                                                <p>{commande.adresseFacturation.lot}, {commande.adresseFacturation.quartier}</p>
                                                                <p>{commande.adresseFacturation.codePostal} {commande.adresseFacturation.ville}</p>
                                                                {commande.adresseFacturation.complement && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Complément: {commande.adresseFacturation.complement}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Total et bouton facture */}
                                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex justify-between items-end mb-6">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400 mr-2">Sous-total produits</span>
                                                                <span className="text-gray-900 dark:text-white">
                                                                    {(calculerTotalCommande(commande) - parseFloat(commande.fraisLivraison || 0)).toFixed(2)} Ar
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">Frais de livraison</span>
                                                                <span className="text-gray-900 dark:text-white">
                                                                    {parseFloat(commande.fraisLivraison || 0).toFixed(2)} Ar
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                <span className="text-gray-900 dark:text-white">Total</span>
                                                                <span className="text-gray-900 dark:text-white">
                                                                    {calculerTotalCommande(commande).toFixed(2)} Ar
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Bouton facture large */}
                                                        {factureDisponible && (
                                                            <button
                                                                onClick={(e) => telechargerFactureCommande(commandeId, commande.refCommande, e)}
                                                                disabled={telechargementEnCours || verificationEnCoursRef}
                                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                                                    telechargementEnCours || verificationEnCoursRef
                                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                                                }`}
                                                            >
                                                                {telechargementEnCours ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                        Téléchargement en cours...
                                                                    </>
                                                                ) : verificationEnCoursRef ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                        Vérification...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <DocumentArrowDownIcon className="h-5 w-5" />
                                                                        Télécharger la facture PDF
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Message d'info si facture non disponible */}
                                                    {!factureDisponible && commande.statutCommande && 
                                                     !['EN_PREPARATION', 'EXPEDIEE', 'LIVREE'].includes(commande.statutCommande) && (
                                                        <div className="text-center text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                                            La facture sera disponible une fois la commande en préparation
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    )
                )}

                {/* Stats en bas */}
                {commandes.length > 0 && (
                    <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{commandes.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Commandes totales</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                {commandes.filter(c => c.statutCommande === 'LIVREE').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Livrées</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {commandes.filter(c => c.statutCommande === 'EXPEDIEE').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Expédiées</div>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {commandes.reduce((total, cmd) => total + calculerTotalCommande(cmd), 0).toFixed(0)} Ar
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Montant total</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MesCommande;

// import React, { useState, useEffect } from "react";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { getMesCommandes } from "@/services/ClientService";
// import {
//     ShoppingBagIcon,
//     CalendarDaysIcon,
//     TruckIcon,
//     CreditCardIcon,
//     MapPinIcon,
//     ChevronDownIcon,
//     ChevronUpIcon,
//     FunnelIcon,
//     XMarkIcon,
//     DocumentArrowDownIcon
// } from "@heroicons/react/24/outline";

// const MesCommande = () => {
//     const { user, isAuthenticated } = useAuthContext();
//     const [commandes, setCommandes] = useState([]);
//     const [commandesFiltrees, setCommandesFiltrees] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [expandedCommande, setExpandedCommande] = useState(null);
//     const [dejaConnecte, setDejaConnecte] = useState(false);
//     // États pour les filtres
//     const [filtreStatut, setFiltreStatut] = useState('tous');
//     const [showFiltres, setShowFiltres] = useState(false);
//     const [telechargementFacture, setTelechargementFacture] = useState({});

//     // Options de filtre - CORRIGÉ : valeurs cohérentes
//     const [optionsStatut, setOptionsStatut] = useState([
//         { value: 'tous', label: 'Toutes les commandes', count: 0 },
//         { value: 'EN_ATTENTE_PAIEMENT', label: 'En attente', count: 0 },
//         { value: 'EN_PREPARATION', label: 'En préparation', count: 0 },
//         { value: 'EXPEDIEE', label: 'En cours de livraison', count: 0 },
//         { value: 'LIVREE', label: 'Livrées', count: 0 },
//         { value: 'ANNULEE', label: 'Annulées', count: 0 }
//     ]);

//     useEffect(() => {
//         if (isAuthenticated && user?.client) {
//             chargerCommandes();
//         }
//     }, [isAuthenticated, user]);

//     useEffect(() => {
//         const chargementUser = () => {
//             const local = localStorage.getItem('user');
//             if (local) {
//                 const parsedUser = JSON.parse(local);
//                 if (parsedUser && parsedUser.client) {
//                     console.log("Utilisateur déjà connecté (MesCommande), chargement des commandes: ", parsedUser);
//                     setDejaConnecte(true);
//                     chargerCommandes();
//                 }
//             }
//         };
//         chargementUser();
//     }, []);
    
//     useEffect(() => {
//         filtrerCommandes();
//     }, [commandes, filtreStatut]);

//     const chargerCommandes = async () => {
//         try {
//             setLoading(true);
//             const response = await getMesCommandes();
            
//             if (response.data) {
//                 const commandesTriees = response.data.sort((a, b) => 
//                     new Date(b.dateCommande) - new Date(a.dateCommande)
//                 );
//                 setCommandes(commandesTriees);
//             } else {
//                 setCommandes([]);
//                 setError(response.message || "Erreur lors du chargement des commandes");
//             }
//         } catch (err) {
//             console.error("Erreur lors du chargement des commandes:", err);
//             setError(err.message || "Erreur lors du chargement de vos commandes");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filtrerCommandes = () => {
//         if (filtreStatut === 'tous') {
//             setCommandesFiltrees(commandes);
//         } else {
//             const filtrees = commandes.filter(commande => 
//                 commande.statutCommande === filtreStatut
//             );
//             setCommandesFiltrees(filtrees);
//         }
//     };

//     // Compter les commandes par statut - CORRIGÉ
//     useEffect(() => {
//         if (commandes.length > 0) {
//             const counts = {
//                 'tous': commandes.length,
//                 'EN_ATTENTE_PAIEMENT': commandes.filter(c => c.statutCommande === 'EN_ATTENTE_PAIEMENT').length,
//                 'EN_PREPARATION': commandes.filter(c => c.statutCommande === 'EN_PREPARATION').length,
//                 'EXPEDIEE': commandes.filter(c => c.statutCommande === 'EXPEDIEE').length,
//                 'LIVREE': commandes.filter(c => c.statutCommande === 'LIVREE').length,
//                 'ANNULEE': commandes.filter(c => c.statutCommande === 'ANNULEE' || c.statutCommande === 'ANNULER').length
//             };
            
//             // Mettre à jour les options avec les counts
//             setOptionsStatut(prev => prev.map(option => ({
//                 ...option,
//                 count: counts[option.value] || 0
//             })));
//         }
//     }, [commandes]);

//     // Fonction pour télécharger la facture
//     const telechargerFacture = async (commandeId, refCommande) => {
//         try {
//             // Mettre à jour l'état de téléchargement pour cette commande
//             setTelechargementFacture(prev => ({
//                 ...prev,
//                 [commandeId]: true
//             }));

//             // TODO: Implémenter l'appel API pour récupérer la facture
//             // Exemple d'appel API :
//             // const response = await getFactureCommande(commandeId);
            
//             // Simulation de téléchargement (à remplacer par votre logique)
//             console.log(`Téléchargement de la facture pour la commande ${refCommande}`);
            
//             // Créer un blob factice (à remplacer par le PDF réel de l'API)
//             const factureContent = `Facture pour la commande ${refCommande}\n\nClient: ${user?.client?.nom || 'Client'}\nDate: ${new Date().toLocaleDateString()}\nTotal: ...`;
//             const blob = new Blob([factureContent], { type: 'application/pdf' });
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `facture-${refCommande}.pdf`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);

//             // Simuler un délai de téléchargement
//             await new Promise(resolve => setTimeout(resolve, 1000));
            
//         } catch (error) {
//             console.error("Erreur lors du téléchargement de la facture:", error);
//             alert("Erreur lors du téléchargement de la facture. Veuillez réessayer.");
//         } finally {
//             // Réinitialiser l'état de téléchargement
//             setTelechargementFacture(prev => ({
//                 ...prev,
//                 [commandeId]: false
//             }));
//         }
//     };

//     // Vérifier si une commande peut avoir une facture
//     const peutAvoirFacture = (statut) => {
//         const statutsAvecFacture = ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];
//         return statutsAvecFacture.includes(statut);
//     };

//     const handleExpandClick = (refCommande) => {
//         setExpandedCommande(expandedCommande === refCommande ? null : refCommande);
//     };

//     const getStatusColor = (status) => {
//         const baseClasses = "px-2 py-1 rounded-full text-lg font-semibold";

//         switch (status) {
//             case "INITIALISE":
//                 return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
//             case "LIVREE":
//                 return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
//             case "EXPEDIEE":
//                 return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-600`;
//             case "EN_PREPARATION":
//                 return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
//             case "ANNULER":
//             case "ANNULEE":
//                 return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
//             case "EN_ATTENTE_PAIEMENT":
//                 return `${baseClasses} bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-200`;
//             default:
//                 return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-blue-200`;
//         }
//     };

//     const getStatusText = (statut) => {
//         switch (statut) {
//             case "INITIALISE":
//                 return "Initialisé";
//             case "LIVREE":
//                 return "Livrée";
//             case "EXPEDIEE":
//                 return "Expédiée"; 
//             case "EN_PREPARATION":
//                 return "En Préparation";
//             case "ANNULER":
//             case "ANNULEE":
//                 return "Annulée";
//             case "EN_ATTENTE_PAIEMENT":
//                 return "En attente paiement";
//             default:
//                 return statut || 'En attente';
//         }
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         return new Date(dateString).toLocaleDateString('fr-FR', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     const calculerTotalCommande = (commande) => {
//         if (!commande.paniers || commande.paniers.length === 0) return 0;
        
//         const totalProduits = commande.paniers.reduce((total, panier) => {
//             return total + (panier.produit?.prixProduit || 0) * (panier.quantite || 0);
//         }, 0);

//         const fraisLivraison = parseFloat(commande.fraisLivraison || 0);
//         return totalProduits + fraisLivraison;
//     };

//     const resetFiltres = () => {
//         setFiltreStatut('tous');
//         setShowFiltres(false);
//     };

//     if (!isAuthenticated && !dejaConnecte) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-32">
//                 <div className="container mx-auto px-4">
//                     <div className="alert alert-warning shadow-lg">
//                         <div>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                             </svg>
//                             <span>Veuillez vous connecter pour voir vos commandes.</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-32">
//                 <div className="container mx-auto px-4">
//                     <div className="flex flex-col items-center justify-center py-20">
//                         <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
//                         <p className="text-gray-600 dark:text-gray-300 text-lg">
//                             Chargement de vos commandes...
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className=" bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-10">
//             <div className="container mx-auto px-4">
//                 {/* En-tête moderne */}
//                 <div className="text-center mb-8">
//                     <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent mb-4">
//                         Mes Commandes
//                     </h1>
//                     <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
//                         Consultez l'historique et le statut de vos commandes en toute simplicité
//                     </p>
//                     <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-4 rounded-full"></div>
//                 </div>

//                 {error && (
//                     <div className="alert alert-error shadow-lg mb-8">
//                         <div>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <span>{error}</span>
//                         </div>
//                     </div>
//                 )}

//                 {/* Barre de filtres */}
//                 <div className="mb-8">
//                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                         {/* Résultats et filtre actif */}
//                         <div className="flex items-center gap-4">
//                             <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
//                                 {commandesFiltrees.length} commande{commandesFiltrees.length !== 1 ? 's' : ''}
//                             </h2>
                            
//                             {filtreStatut !== 'tous' && (
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-gray-600 dark:text-gray-300">Filtre :</span>
//                                     <div className="badge badge-primary badge-lg gap-2">
//                                         {optionsStatut.find(opt => opt.value === filtreStatut)?.label}
//                                         <button 
//                                             onClick={resetFiltres}
//                                             className="btn btn-xs btn-circle btn-ghost"
//                                         >
//                                             <XMarkIcon className="h-3 w-3" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Boutons de filtre */}
//                         <div className="flex flex-col sm:flex-row gap-3">
//                             {/* Filtre mobile/déroulant */}
//                             <div className="dropdown dropdown-end lg:hidden">
//                                 <label tabIndex={0} className="btn btn-outline gap-2">
//                                     <FunnelIcon className="h-4 w-4" />
//                                     Filtrer
//                                     {filtreStatut !== 'tous' && (
//                                         <span className="badge badge-accent badge-sm">
//                                             {optionsStatut.find(opt => opt.value === filtreStatut)?.count}
//                                         </span>
//                                     )}
//                                 </label>
//                                 <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 z-10">
//                                     {optionsStatut.map((option) => (
//                                         <li key={option.value}>
//                                             <button
//                                                 className={`flex justify-between ${filtreStatut === option.value ? 'active' : ''}`}
//                                                 onClick={() => {
//                                                     setFiltreStatut(option.value);
//                                                     setShowFiltres(false);
//                                                 }}
//                                             >
//                                                 <span>{option.label}</span>
//                                                 <span className="badge badge-ghost">{option.count}</span>
//                                             </button>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>

//                             {/* Filtres desktop */}
//                             <div className="hidden lg:flex flex-wrap gap-2">
//                                 {optionsStatut.map((option) => (
//                                     <button
//                                         key={option.value}
//                                         className={`btn gap-2 ${filtreStatut === option.value ? 'btn-accent ' : 'btn-outline btn-accent'}`}
//                                         onClick={() => setFiltreStatut(option.value)}
//                                     >
//                                         <span>{option.label}</span>
//                                         <span className="badge badge-accent">{option.count}</span>
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Indicateur de filtre actif */}
//                     {filtreStatut !== 'tous' && (
//                         <div className="mt-4 p-3 bg-primary/10 rounded-lg">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <FunnelIcon className="h-4 w-4 text-primary" />
//                                     <span className="text-sm text-gray-700 dark:text-gray-300">
//                                         Affichage des commandes : <strong>{optionsStatut.find(opt => opt.value === filtreStatut)?.label}</strong>
//                                     </span>
//                                 </div>
//                                 <button 
//                                     onClick={resetFiltres}
//                                     className="btn btn-ghost btn-sm"
//                                 >
//                                     <XMarkIcon className="h-4 w-4" />
//                                     Réinitialiser
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Liste des commandes */}
//                 {commandesFiltrees.length === 0 ? (
//                     <div className="card bg-white dark:bg-gray-800 shadow-2xl text-center py-16">
//                         <div className="card-body">
//                             <div className="flex justify-center mb-6">
//                                 <div className="rounded-full bg-primary/10 p-6">
//                                     <ShoppingBagIcon className="h-16 w-16 text-primary" />
//                                 </div>
//                             </div>
                            
//                             {filtreStatut === 'tous' ? (
//                                 <>
//                                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
//                                         Aucune commande trouvée
//                                     </h2>
//                                     <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
//                                         Vous n'avez pas encore passé de commande. Découvrez nos produits et trouvez ce qui vous plaît !
//                                     </p>
//                                     <a href="/Produit" className="btn btn-primary btn-lg">
//                                         Découvrir nos produits
//                                     </a>
//                                 </>
//                             ) : (
//                                 <>
//                                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
//                                         Aucune commande {optionsStatut.find(opt => opt.value === filtreStatut)?.label.toLowerCase()}
//                                     </h2>
//                                     <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
//                                         Vous n'avez aucune commande avec le statut "{optionsStatut.find(opt => opt.value === filtreStatut)?.label}".
//                                     </p>
//                                     <button 
//                                         onClick={resetFiltres}
//                                         className="btn btn-primary btn-lg"
//                                     >
//                                         Voir toutes les commandes
//                                     </button>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="space-y-6">
//                         {commandesFiltrees.map((commande) => (
//                             <div key={commande.refCommande} className="card bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
//                                 <div className="card-body p-0">
//                                     {/* En-tête de la commande */}
//                                     <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6">
//                                         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                                             <div className="flex-1">
//                                                 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
//                                                     Commande <span className="text-accent">{commande.refCommande}</span>
//                                                 </h3>
//                                                 <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
//                                                     <CalendarDaysIcon className="h-4 w-4" />
//                                                     <span className="text-sm">{formatDate(commande.dateCommande)}</span>
//                                                 </div>
//                                             </div>
                                            
//                                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//                                                 <div className={`${getStatusColor(commande.statutCommande)}`}>
//                                                     {getStatusText(commande.statutCommande)}
//                                                 </div>
                                                
//                                                 <div className="text-right">
//                                                     <div className="text-2xl font-bold text-gray-800 dark:text-white">
//                                                         {calculerTotalCommande(commande).toFixed(2)} Ar
//                                                     </div>
//                                                 </div>
                                                
//                                                 <button
//                                                     onClick={() => handleExpandClick(commande.refCommande)}
//                                                     className="btn btn-ghost btn-circle"
//                                                 >
//                                                     {expandedCommande === commande.refCommande ? (
//                                                         <ChevronUpIcon className="h-5 w-5" />
//                                                     ) : (
//                                                         <ChevronDownIcon className="h-5 w-5" />
//                                                     )}
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Informations rapides */}
//                                         <div className="flex flex-wrap gap-4 mt-4 text-sm">
//                                             <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
//                                                 <TruckIcon className="h-4 w-4" />
//                                                 <span>{commande.methodeLivraison || "Non spécifié"}</span>
//                                             </div>
//                                             <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
//                                                 <CreditCardIcon className="h-4 w-4" />
//                                                 <span>{commande.methodePaiement || "Non spécifié"}</span>
//                                             </div>
//                                         </div>

//                                         {/* Bouton Obtenir Facture - Visible seulement pour certains statuts */}
//                                         {peutAvoirFacture(commande.statutCommande) && (
//                                             <div className="mt-4">
//                                                 <button
//                                                     onClick={() => telechargerFacture(commande.id || commande.refCommande, commande.refCommande)}
//                                                     disabled={telechargementFacture[commande.id || commande.refCommande]}
//                                                     className="btn btn-success btn-sm gap-2"
//                                                 >
//                                                     {telechargementFacture[commande.id || commande.refCommande] ? (
//                                                         <>
//                                                             <span className="loading loading-spinner loading-xs"></span>
//                                                             Téléchargement...
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <DocumentArrowDownIcon className="h-4 w-4" />
//                                                             Obtenir Facture
//                                                         </>
//                                                     )}
//                                                 </button>
//                                                 <p className="text-xs text-gray-500 mt-1">
//                                                     Disponible pour les commandes {getStatusText(commande.statutCommande).toLowerCase()}
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Détails de la commande (expandable) */}
//                                     <div className={`collapse ${expandedCommande === commande.refCommande ? 'collapse-open' : ''}`}>
//                                         <input type="checkbox" className="peer" />
//                                         <div className="collapse-content p-0">
//                                             <div className="p-6 space-y-6">
//                                                 {/* Section Actions - Bouton facture visible aussi dans les détails */}
//                                                 <div className="flex justify-end">
//                                                     {peutAvoirFacture(commande.statutCommande) && (
//                                                         <button
//                                                             onClick={() => telechargerFacture(commande.id || commande.refCommande, commande.refCommande)}
//                                                             disabled={telechargementFacture[commande.id || commande.refCommande]}
//                                                             className="btn btn-success gap-2"
//                                                         >
//                                                             {telechargementFacture[commande.id || commande.refCommande] ? (
//                                                                 <>
//                                                                     <span className="loading loading-spinner loading-sm"></span>
//                                                                     Téléchargement de la facture...
//                                                                 </>
//                                                             ) : (
//                                                                 <>
//                                                                     <DocumentArrowDownIcon className="h-5 w-5" />
//                                                                     Télécharger la Facture
//                                                                 </>
//                                                             )}
//                                                         </button>
//                                                     )}
//                                                 </div>

//                                                 {/* Informations de livraison */}
//                                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                                     <div className="space-y-3">
//                                                         <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
//                                                             <MapPinIcon className="h-5 w-5 text-primary" />
//                                                             Adresse de Livraison
//                                                         </h4>
//                                                         {commande.adresseLivraison ? (
//                                                             <div className="card bg-gray-50 dark:bg-gray-700 p-4">
//                                                                 <div className="space-y-1 text-gray-700 dark:text-gray-300">
//                                                                     <p className="font-semibold">{commande.adresseLivraison.labelle}</p>
//                                                                     <p>{commande.adresseLivraison.lot}, {commande.adresseLivraison.quartier}</p>
//                                                                     <p>{commande.adresseLivraison.codePostal} {commande.adresseLivraison.ville}</p>
//                                                                     {commande.adresseLivraison.complement && (
//                                                                         <p className="text-sm opacity-75">
//                                                                             Complément: {commande.adresseLivraison.complement}
//                                                                         </p>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         ) : (
//                                                             <p className="text-gray-500 italic">Aucune adresse de livraison spécifiée</p>
//                                                         )}
//                                                     </div>

//                                                     <div className="space-y-3">
//                                                         <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
//                                                             <CreditCardIcon className="h-5 w-5 text-primary" />
//                                                             Adresse de Facturation
//                                                         </h4>
//                                                         {commande.adresseFacturation ? (
//                                                             <div className="card bg-gray-50 dark:bg-gray-700 p-4">
//                                                                 <div className="space-y-1 text-gray-700 dark:text-gray-300">
//                                                                     <p className="font-semibold">{commande.adresseFacturation.labelle}</p>
//                                                                     <p>{commande.adresseFacturation.lot}, {commande.adresseFacturation.quartier}</p>
//                                                                     <p>{commande.adresseFacturation.codePostal} {commande.adresseFacturation.ville}</p>
//                                                                     {commande.adresseFacturation.complement && (
//                                                                         <p className="text-sm opacity-75">
//                                                                             Complément: {commande.adresseFacturation.complement}
//                                                                         </p>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         ) : (
//                                                             <p className="text-gray-500 italic">Aucune adresse de facturation spécifiée</p>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 <div className="divider"></div>

//                                                 {/* Produits de la commande */}
//                                                 <div className="space-y-4">
//                                                     <h4 className="font-bold text-lg text-gray-800 dark:text-white">
//                                                         Produits Commandés
//                                                     </h4>
                                                    
//                                                     {commande.paniers && commande.paniers.length > 0 ? (
//                                                         <div className="overflow-x-auto">
//                                                             <table className="table table-zebra w-full">
//                                                                 <thead>
//                                                                     <tr className="bg-gray-100 dark:bg-gray-700">
//                                                                         <th className="text-gray-800 dark:text-white">Produit</th>
//                                                                         <th className="text-center text-gray-800 dark:text-white">Quantité</th>
//                                                                         <th className="text-right text-gray-800 dark:text-white">Prix Unitaire</th>
//                                                                         <th className="text-right text-gray-800 dark:text-white">Total</th>
//                                                                     </tr>
//                                                                 </thead>
//                                                                 <tbody>
//                                                                     {commande.paniers.map((panier, index) => (
//                                                                         <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
//                                                                             <td>
//                                                                                 <div className="flex items-center space-x-3">
//                                                                                     {panier.produit?.image && (
//                                                                                         <div className="avatar">
//                                                                                             <div className="mask mask-squircle w-12 h-12">
//                                                                                                 <img 
//                                                                                                     src={`/image/${panier.produit.image}`}
//                                                                                                     alt={panier.produit.nom}
//                                                                                                     className="object-cover"
//                                                                                                 />
//                                                                                             </div>
//                                                                                         </div>
//                                                                                     )}
//                                                                                     <div>
//                                                                                         <div className="font-bold text-gray-800 dark:text-white">
//                                                                                             {panier.produit?.nom || "Produit non disponible"}
//                                                                                         </div>
//                                                                                         {panier.produit?.description && (
//                                                                                             <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
//                                                                                                 {panier.produit.description}
//                                                                                             </div>
//                                                                                         )}
//                                                                                     </div>
//                                                                                 </div>
//                                                                             </td>
//                                                                             <td className="text-center">
//                                                                                 <span className="badge badge-outline badge-lg">
//                                                                                     {panier.quantite}
//                                                                                 </span>
//                                                                             </td>
//                                                                             <td className="text-right font-semibold text-gray-800 dark:text-white">
//                                                                                 {panier.produit?.prixProduit ? `${panier.produit.prixProduit} Ar` : "N/A"}
//                                                                             </td>
//                                                                             <td className="text-right font-semibold text-gray-800 dark:text-white">
//                                                                                 {panier.produit?.prixProduit ? `${(panier.produit.prixProduit * panier.quantite).toFixed(2)} Ar` : "N/A"}
//                                                                             </td>
//                                                                         </tr>
//                                                                     ))}
//                                                                 </tbody>
//                                                                 <tfoot>
//                                                                     <tr className="bg-gray-50 dark:bg-gray-700">
//                                                                         <th colSpan="3" className="text-right text-gray-800 dark:text-white">
//                                                                             Frais de livraison:
//                                                                         </th>
//                                                                         <th className="text-right text-gray-800 dark:text-white">
//                                                                             {parseFloat(commande.fraisLivraison || 0).toFixed(2)} Ar
//                                                                         </th>
//                                                                     </tr>
//                                                                     <tr className="bg-primary/10">
//                                                                         <th colSpan="3" className="text-right text-lg text-gray-800 dark:text-white">
//                                                                             Total:
//                                                                         </th>
//                                                                         <th className="text-right text-lg text-primary font-bold">
//                                                                             {calculerTotalCommande(commande).toFixed(2)} Ar
//                                                                         </th>
//                                                                     </tr>
//                                                                 </tfoot>
//                                                             </table>
//                                                         </div>
//                                                     ) : (
//                                                         <div className="text-center py-8 text-gray-500">
//                                                             Aucun produit dans cette commande
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 {/* Informations de paiement */}
//                                                 {commande.paiements && commande.paiements.length > 0 && (
//                                                     <>
//                                                         <div className="divider"></div>
//                                                         <div className="space-y-4">
//                                                             <h4 className="font-bold text-lg text-gray-800 dark:text-white">
//                                                                 Paiements
//                                                             </h4>
//                                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                                 {commande.paiements.map((paiement, index) => (
//                                                                     <div key={index} className="card bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
//                                                                         <div className="card-body p-4">
//                                                                             <div className="grid grid-cols-1 gap-3">
//                                                                                 <div className="flex justify-between items-center">
//                                                                                     <span className="font-semibold text-gray-600 dark:text-gray-300">Référence:</span>
//                                                                                     <span className="text-gray-800 dark:text-white">{paiement.refPaiement}</span>
//                                                                                 </div>
//                                                                                 <div className="flex justify-between items-center">
//                                                                                     <span className="font-semibold text-gray-600 dark:text-gray-300">Montant:</span>
//                                                                                     <span className="text-lg font-bold text-primary">
//                                                                                         {parseFloat(paiement.montant || 0).toFixed(2)} Ar
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 <div className="flex justify-between items-center">
//                                                                                     <span className="font-semibold text-gray-600 dark:text-gray-300">Statut:</span>
//                                                                                     <span className={`badge ${paiement.statutPaiement === "Payé" ? 'badge-success' : 'badge-ghost'}`}>
//                                                                                         {paiement.statutPaiement || "Inconnu"}
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 {paiement.datePaiement && (
//                                                                                     <div className="flex justify-between items-center">
//                                                                                         <span className="font-semibold text-gray-600 dark:text-gray-300">Date paiement:</span>
//                                                                                         <span className="text-gray-800 dark:text-white">{formatDate(paiement.datePaiement)}</span>
//                                                                                     </div>
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 ))}
//                                                             </div>
//                                                         </div>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Statistiques rapides */}
//                 {commandes.length > 0 && (
//                     <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
//                         <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//                             <div className="stat-figure text-primary">
//                                 <ShoppingBagIcon className="h-8 w-8" />
//                             </div>
//                             <div className="stat-title text-gray-600 dark:text-gray-300">Total des commandes</div>
//                             <div className="stat-value text-primary">{commandes.length}</div>
//                         </div>
                        
//                         <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//                             <div className="stat-figure text-secondary">
//                                 <TruckIcon className="h-8 w-8" />
//                             </div>
//                             <div className="stat-title text-gray-600 dark:text-gray-300">Commandes livrées</div>
//                             <div className="stat-value text-secondary">
//                                 {commandes.filter(c => c.statutCommande?.toLowerCase() === 'livrée').length}
//                             </div>
//                         </div>
                        
//                         <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//                             <div className="stat-figure text-accent">
//                                 <CreditCardIcon className="h-8 w-8" />
//                             </div>
//                             <div className="stat-title text-gray-600 dark:text-gray-300">Avec facture disponible</div>
//                             <div className="stat-value text-accent">
//                                 {commandes.filter(c => peutAvoirFacture(c.statutCommande)).length}
//                             </div>
//                         </div>

//                         <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//                             <div className="stat-figure text-info">
//                                 <CalendarDaysIcon className="h-8 w-8" />
//                             </div>
//                             <div className="stat-title text-gray-600 dark:text-gray-300">Dépenses totales</div>
//                             <div className="stat-value text-info">
//                                 {commandes.reduce((total, cmd) => total + calculerTotalCommande(cmd), 0).toFixed(2)} Ar
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default MesCommande;

