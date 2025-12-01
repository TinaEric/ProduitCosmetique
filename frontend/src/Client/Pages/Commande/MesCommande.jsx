import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getMesCommandes } from "@/services/ClientService";
import {
    ShoppingBagIcon,
    CalendarDaysIcon,
    TruckIcon,
    CreditCardIcon,
    MapPinIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FunnelIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const MesCommande = () => {
    const { user, isAuthenticated } = useAuthContext();
    const [commandes, setCommandes] = useState([]);
    const [commandesFiltrees, setCommandesFiltrees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCommande, setExpandedCommande] = useState(null);
    
    // États pour les filtres
    const [filtreStatut, setFiltreStatut] = useState('tous');
    const [showFiltres, setShowFiltres] = useState(false);

    // Options de filtre
    const optionsStatut = [
        { value: 'tous', label: 'Toutes les commandes', count: 0 },
        { value: 'en attente', label: 'En attente', count: 0 },
        { value: 'confirmée', label: 'Confirmées', count: 0 },
        { value: 'en cours de livraison', label: 'En cours de livraison', count: 0 },
        { value: 'livrée', label: 'Livrées', count: 0 },
        { value: 'annulée', label: 'Annulées', count: 0 }
    ];

    useEffect(() => {
        if (isAuthenticated && user?.client) {
            chargerCommandes();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        // Appliquer le filtre quand les commandes ou le filtre changent
        filtrerCommandes();
    }, [commandes, filtreStatut]);

    const chargerCommandes = async () => {
        try {
            setLoading(true);
            const response = await getMesCommandes();
            
            if (response.data) {
                const commandesTriees = response.data.sort((a, b) => 
                    new Date(b.dateCommande) - new Date(a.dateCommande)
                );
                setCommandes(commandesTriees);
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

    const filtrerCommandes = () => {
        if (filtreStatut === 'tous') {
            setCommandesFiltrees(commandes);
        } else {
            const filtrees = commandes.filter(commande => 
                commande.statutCommande?.toLowerCase() === filtreStatut.toLowerCase()
            );
            setCommandesFiltrees(filtrees);
        }
    };

    // Compter les commandes par statut
    const compterCommandesParStatut = () => {
        const counts = {
            'tous': commandes.length,
            'en attente': commandes.filter(c => c.statutCommande === 'EN_ATTENTE_PAIEMENT').length,
            'confirmée': commandes.filter(c => c.statutCommande === 'EN_PREPARATION').length,
            'initialise': commandes.filter(c => c.statutCommande === 'INITIALISE').length,
            'en cours de livraison': commandes.filter(c => c.statutCommande === 'en cours de livraison').length,
            'livrée': commandes.filter(c => c.statutCommande === 'LIVREE').length,
            'annulée': commandes.filter(c => c.statutCommande === 'ANNULEE').length
        };
        
        // Mettre à jour les options avec les counts
        optionsStatut.forEach(option => {
            option.count = counts[option.value] || 0;
        });
    };

    compterCommandesParStatut();

    const handleExpandClick = (refCommande) => {
        setExpandedCommande(expandedCommande === refCommande ? null : refCommande);
    };


    const getStatusColor = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-lg font-semibold";

        switch (status) {
            case "INITIALISE":
                return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
            case "LIVREE":
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            case "EXPEDIEE":
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-600`;
            case "EN_COURS":
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
            case "ANNULER":
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            case "EN_ATTENTE_PAIEMENT":
                return `${baseClasses} bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-blue-200`;
        }
    };

    const getStatusText = (statut) => {
        switch (statut) {
            case "INITIALISE":
                return "Inititalise";
            case "LIVREE":
                return "Livrée";
            case "EXPEDIEE":
                return "Expédiée"; 
            case "EN_COURS":
                return"En cours";
            case "ANNULER":
                return "Annulée";
            case "EN_ATTENTE_PAIEMENT":
                return "En attente paiement";
            default:
                return statut || 'En attente';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculerTotalCommande = (commande) => {
        if (!commande.paniers || commande.paniers.length === 0) return 0;
        
        const totalProduits = commande.paniers.reduce((total, panier) => {
            return total + (panier.produit?.prixProduit || 0) * (panier.quantite || 0);
        }, 0);

        const fraisLivraison = parseFloat(commande.fraisLivraison || 0);
        return totalProduits + fraisLivraison;
    };

    const resetFiltres = () => {
        setFiltreStatut('tous');
        setShowFiltres(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-32">
                <div className="container mx-auto px-4">
                    <div className="alert alert-warning shadow-lg">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Veuillez vous connecter pour voir vos commandes.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-32">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Chargement de vos commandes...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-10">
            <div className="container mx-auto px-4">
                {/* En-tête moderne */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent mb-4">
                        Mes Commandes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                        Consultez l'historique et le statut de vos commandes en toute simplicité
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-4 rounded-full"></div>
                </div>

                {error && (
                    <div className="alert alert-error shadow-lg mb-8">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Barre de filtres */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Résultats et filtre actif */}
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                {commandesFiltrees.length} commande{commandesFiltrees.length !== 1 ? 's' : ''}
                            </h2>
                            
                            {filtreStatut !== 'tous' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 dark:text-gray-300">Filtre :</span>
                                    <div className="badge badge-primary badge-lg gap-2">
                                        {optionsStatut.find(opt => opt.value === filtreStatut)?.label}
                                        <button 
                                            onClick={resetFiltres}
                                            className="btn btn-xs btn-circle btn-ghost"
                                        >
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Boutons de filtre */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Filtre mobile/déroulant */}
                            <div className="dropdown dropdown-end lg:hidden">
                                <label tabIndex={0} className="btn btn-outline gap-2">
                                    <FunnelIcon className="h-4 w-4" />
                                    Filtrer
                                    {filtreStatut !== 'tous' && (
                                        <span className="badge badge-accent badge-sm">
                                            {optionsStatut.find(opt => opt.value === filtreStatut)?.count}
                                        </span>
                                    )}
                                </label>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 z-10">
                                    {optionsStatut.map((option) => (
                                        <li key={option.value}>
                                            <button
                                                className={`flex justify-between ${filtreStatut === option.value ? 'active' : ''}`}
                                                onClick={() => {
                                                    setFiltreStatut(option.value);
                                                    setShowFiltres(false);
                                                }}
                                            >
                                                <span>{option.label}</span>
                                                <span className="badge badge-ghost">{option.count}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Filtres desktop */}
                            <div className="hidden lg:flex flex-wrap gap-2">
                                {optionsStatut.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`btn gap-2 ${filtreStatut === option.value ? 'btn-accent ' : 'btn-outline btn-accent'}`}
                                        onClick={() => setFiltreStatut(option.value)}
                                    >
                                        <span>{option.label}</span>
                                        <span className="badge badge-accent">{option.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Indicateur de filtre actif */}
                    {filtreStatut !== 'tous' && (
                        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FunnelIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Affichage des commandes : <strong>{optionsStatut.find(opt => opt.value === filtreStatut)?.label}</strong>
                                    </span>
                                </div>
                                <button 
                                    onClick={resetFiltres}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Liste des commandes */}
                {commandesFiltrees.length === 0 ? (
                    <div className="card bg-white dark:bg-gray-800 shadow-2xl text-center py-16">
                        <div className="card-body">
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-primary/10 p-6">
                                    <ShoppingBagIcon className="h-16 w-16 text-primary" />
                                </div>
                            </div>
                            
                            {filtreStatut === 'tous' ? (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                                        Aucune commande trouvée
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                                        Vous n'avez pas encore passé de commande. Découvrez nos produits et trouvez ce qui vous plaît !
                                    </p>
                                    <a href="/Produit" className="btn btn-primary btn-lg">
                                        Découvrir nos produits
                                    </a>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                                        Aucune commande {optionsStatut.find(opt => opt.value === filtreStatut)?.label.toLowerCase()}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                                        Vous n'avez aucune commande avec le statut "{optionsStatut.find(opt => opt.value === filtreStatut)?.label}".
                                    </p>
                                    <button 
                                        onClick={resetFiltres}
                                        className="btn btn-primary btn-lg"
                                    >
                                        Voir toutes les commandes
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {commandesFiltrees.map((commande) => (
                            <div key={commande.refCommande} className="card bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                                <div className="card-body p-0">
                                    {/* En-tête de la commande */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                                    Commande <span className="text-accent">{commande.refCommande}</span>
                                                </h3>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <CalendarDaysIcon className="h-4 w-4" />
                                                    <span className="text-sm">{formatDate(commande.dateCommande)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <div className={`${getStatusColor(commande.statutCommande)}`}>
                                                    {getStatusText(commande.statutCommande)}
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                                        {calculerTotalCommande(commande).toFixed(2)} Ar
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    onClick={() => handleExpandClick(commande.refCommande)}
                                                    className="btn btn-ghost btn-circle"
                                                >
                                                    {expandedCommande === commande.refCommande ? (
                                                        <ChevronUpIcon className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Informations rapides */}
                                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <TruckIcon className="h-4 w-4" />
                                                <span>{commande.methodeLivraison || "Non spécifié"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                <CreditCardIcon className="h-4 w-4" />
                                                <span>{commande.methodePaiement || "Non spécifié"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détails de la commande (expandable) */}
                                    <div className={`collapse ${expandedCommande === commande.refCommande ? 'collapse-open' : ''}`}>
                                        <input type="checkbox" className="peer" />
                                        <div className="collapse-content p-0">
                                            <div className="p-6 space-y-6">
                                                {/* Informations de livraison */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                                                            <MapPinIcon className="h-5 w-5 text-primary" />
                                                            Adresse de Livraison
                                                        </h4>
                                                        {commande.adresseLivraison ? (
                                                            <div className="card bg-gray-50 dark:bg-gray-700 p-4">
                                                                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                                                    <p className="font-semibold">{commande.adresseLivraison.labelle}</p>
                                                                    <p>{commande.adresseLivraison.lot}, {commande.adresseLivraison.quartier}</p>
                                                                    <p>{commande.adresseLivraison.codePostal} {commande.adresseLivraison.ville}</p>
                                                                    {commande.adresseLivraison.complement && (
                                                                        <p className="text-sm opacity-75">
                                                                            Complément: {commande.adresseLivraison.complement}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">Aucune adresse de livraison spécifiée</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-white">
                                                            <CreditCardIcon className="h-5 w-5 text-primary" />
                                                            Adresse de Facturation
                                                        </h4>
                                                        {commande.adresseFacturation ? (
                                                            <div className="card bg-gray-50 dark:bg-gray-700 p-4">
                                                                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                                                    <p className="font-semibold">{commande.adresseFacturation.labelle}</p>
                                                                    <p>{commande.adresseFacturation.lot}, {commande.adresseFacturation.quartier}</p>
                                                                    <p>{commande.adresseFacturation.codePostal} {commande.adresseFacturation.ville}</p>
                                                                    {commande.adresseFacturation.complement && (
                                                                        <p className="text-sm opacity-75">
                                                                            Complément: {commande.adresseFacturation.complement}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">Aucune adresse de facturation spécifiée</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="divider"></div>

                                                {/* Produits de la commande */}
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">
                                                        Produits Commandés
                                                    </h4>
                                                    
                                                    {commande.paniers && commande.paniers.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="table table-zebra w-full">
                                                                <thead>
                                                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                                                        <th className="text-gray-800 dark:text-white">Produit</th>
                                                                        <th className="text-center text-gray-800 dark:text-white">Quantité</th>
                                                                        <th className="text-right text-gray-800 dark:text-white">Prix Unitaire</th>
                                                                        <th className="text-right text-gray-800 dark:text-white">Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {commande.paniers.map((panier, index) => (
                                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                            <td>
                                                                                <div className="flex items-center space-x-3">
                                                                                    {panier.produit?.image && (
                                                                                        <div className="avatar">
                                                                                            <div className="mask mask-squircle w-12 h-12">
                                                                                                <img 
                                                                                                    src={`/image/${panier.produit.image}`}
                                                                                                    alt={panier.produit.nom}
                                                                                                    className="object-cover"
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    <div>
                                                                                        <div className="font-bold text-gray-800 dark:text-white">
                                                                                            {panier.produit?.nom || "Produit non disponible"}
                                                                                        </div>
                                                                                        {panier.produit?.description && (
                                                                                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                                                                {panier.produit.description}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <span className="badge badge-outline badge-lg">
                                                                                    {panier.quantite}
                                                                                </span>
                                                                            </td>
                                                                            <td className="text-right font-semibold text-gray-800 dark:text-white">
                                                                                {panier.produit?.prixProduit ? `${panier.produit.prixProduit} Ar` : "N/A"}
                                                                            </td>
                                                                            <td className="text-right font-semibold text-gray-800 dark:text-white">
                                                                                {panier.produit?.prixProduit ? `${(panier.produit.prixProduit * panier.quantite).toFixed(2)} Ar` : "N/A"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                                                        <th colSpan="3" className="text-right text-gray-800 dark:text-white">
                                                                            Frais de livraison:
                                                                        </th>
                                                                        <th className="text-right text-gray-800 dark:text-white">
                                                                            {parseFloat(commande.fraisLivraison || 0).toFixed(2)} Ar
                                                                        </th>
                                                                    </tr>
                                                                    <tr className="bg-primary/10">
                                                                        <th colSpan="3" className="text-right text-lg text-gray-800 dark:text-white">
                                                                            Total:
                                                                        </th>
                                                                        <th className="text-right text-lg text-primary font-bold">
                                                                            {calculerTotalCommande(commande).toFixed(2)} Ar
                                                                        </th>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500">
                                                            Aucun produit dans cette commande
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Informations de paiement */}
                                                {commande.paiements && commande.paiements.length > 0 && (
                                                    <>
                                                        <div className="divider"></div>
                                                        <div className="space-y-4">
                                                            <h4 className="font-bold text-lg text-gray-800 dark:text-white">
                                                                Paiements
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {commande.paiements.map((paiement, index) => (
                                                                    <div key={index} className="card bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                                                        <div className="card-body p-4">
                                                                            <div className="grid grid-cols-1 gap-3">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="font-semibold text-gray-600 dark:text-gray-300">Référence:</span>
                                                                                    <span className="text-gray-800 dark:text-white">{paiement.refPaiement}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="font-semibold text-gray-600 dark:text-gray-300">Montant:</span>
                                                                                    <span className="text-lg font-bold text-primary">
                                                                                        {parseFloat(paiement.montant || 0).toFixed(2)} Ar
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="font-semibold text-gray-600 dark:text-gray-300">Statut:</span>
                                                                                    <span className={`badge ${paiement.statutPaiement === "Payé" ? 'badge-success' : 'badge-ghost'}`}>
                                                                                        {paiement.statutPaiement || "Inconnu"}
                                                                                    </span>
                                                                                </div>
                                                                                {paiement.datePaiement && (
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Date paiement:</span>
                                                                                        <span className="text-gray-800 dark:text-white">{formatDate(paiement.datePaiement)}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Statistiques rapides */}
                {commandes.length > 0 && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                            <div className="stat-figure text-primary">
                                <ShoppingBagIcon className="h-8 w-8" />
                            </div>
                            <div className="stat-title text-gray-600 dark:text-gray-300">Total des commandes</div>
                            <div className="stat-value text-primary">{commandes.length}</div>
                        </div>
                        
                        <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                            <div className="stat-figure text-secondary">
                                <TruckIcon className="h-8 w-8" />
                            </div>
                            <div className="stat-title text-gray-600 dark:text-gray-300">Commandes livrées</div>
                            <div className="stat-value text-secondary">
                                {commandes.filter(c => c.statutCommande?.toLowerCase() === 'livrée').length}
                            </div>
                        </div>
                        
                        <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                            <div className="stat-figure text-accent">
                                <CreditCardIcon className="h-8 w-8" />
                            </div>
                            <div className="stat-title text-gray-600 dark:text-gray-300">En cours</div>
                            <div className="stat-value text-accent">
                                {commandes.filter(c => 
                                    ['en attente', 'confirmée', 'en cours de livraison'].includes(c.statutCommande?.toLowerCase())
                                ).length}
                            </div>
                        </div>

                        <div className="stat bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                            <div className="stat-figure text-info">
                                <CalendarDaysIcon className="h-8 w-8" />
                            </div>
                            <div className="stat-title text-gray-600 dark:text-gray-300">Dépenses totales</div>
                            <div className="stat-value text-info">
                                {commandes.reduce((total, cmd) => total + calculerTotalCommande(cmd), 0).toFixed(2)} Ar
                            </div>
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
//     EyeIcon,
//     EyeSlashIcon,
//     ChevronDownIcon,
//     ChevronUpIcon
// } from "@heroicons/react/24/outline";

// const MesCommande = () => {
//     const { user, isAuthenticated } = useAuthContext();
//     const [commandes, setCommandes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [expandedCommande, setExpandedCommande] = useState(null);

//     useEffect(() => {
//         if (isAuthenticated && user?.client) {
//             chargerCommandes();
//         }
//     }, [isAuthenticated, user]);

//     const Transformestatut = (status) => {
//         switch (status) {
//             case "INITIALISE":
//                 return "Inititalise";
//             case "LIVREE":
//                 return "Livrée";
//             case "EXPEDIEE":
//                 return "Expédiée"; 
//             case "EN_COURS":
//                 return"En cours";
//             case "ANNULER":
//                 return "Annulée";
//             case "EN_ATTENTE_PAIEMENT":
//                 return "En attente paiement";
//             default:
//                 return "Tous";
//         }
//     }

//     const chargerCommandes = async () => {
//         try {
//             setLoading(true);
//             const response = await getMesCommandes();
            
//             if (response.data) {
//                 const commandesTriees = response.data.sort((a, b) => 
//                     new Date(b.dateCommande) - new Date(a.dateCommande)
//                 );
//                 setCommandes(commandesTriees);
//                 console.log("Commandes chargées:", commandesTriees);
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
//             case "EN_COURS":
//                 return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
//             case "ANNULER":
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
//                 return "Inititalise";
//             case "LIVREE":
//                 return "Livrée";
//             case "EXPEDIEE":
//                 return "Expédiée"; 
//             case "EN_COURS":
//                 return"En cours";
//             case "ANNULER":
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

//     if (!isAuthenticated) {
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
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 dark:from-gray-900 dark:to-gray-800 pt-10">
//             <div className="container mx-auto px-4">
//                 {/* En-tête moderne */}
//                 <div className="text-center mb-12">
//                     <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
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

//                 {/* Liste des commandes */}
//                 {commandes.length === 0 ? (
//                     <div className="card bg-white dark:bg-gray-800 shadow-2xl text-center py-16">
//                         <div className="card-body">
//                             <div className="flex justify-center mb-6">
//                                 <div className="rounded-full bg-primary/10 p-6">
//                                     <ShoppingBagIcon className="h-16 w-16 text-primary" />
//                                 </div>
//                             </div>
//                             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
//                                 Aucune commande trouvée
//                             </h2>
//                             <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
//                                 Vous n'avez pas encore passé de commande. Découvrez nos produits et trouvez ce qui vous plaît !
//                             </p>
//                             <a href="/Produit" className="btn btn-primary btn-lg">
//                                 Découvrir nos produits
//                             </a>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="space-y-6">
//                         {commandes.map((commande) => (
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
//                                                 <div className={`${getStatusColor(commande.statutCommande)} `}>
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
//                                     </div>

//                                     {/* Détails de la commande (expandable) */}
//                                     <div className={`collapse ${expandedCommande === commande.refCommande ? 'collapse-open' : ''}`}>
//                                         <input type="checkbox" className="peer" />
//                                         <div className="collapse-content p-0">
//                                             <div className="p-6 space-y-6">
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
//                     <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
//                             <div className="stat-title text-gray-600 dark:text-gray-300">Dépenses totales</div>
//                             <div className="stat-value text-accent">
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
