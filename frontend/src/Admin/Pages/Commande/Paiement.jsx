import React, { useState, useEffect, useMemo } from "react";
import { CreditCard, DollarSign, Calendar, CheckCircle, XCircle, Clock, Search, Filter, TrendingUp, Wallet } from "lucide-react";
import { MdInfoOutline } from "react-icons/md";
import { getAllPaiement } from "@/services/StripeService"; // Vous devrez créer ce service
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/SearchContext";

const Paiement = () => {
    const [paiements, setPaiements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPaiement, setSelectedPaiement] = useState(null);
    const [filterStatut, setFilterStatut] = useState("tous");
    const [dateFilter, setDateFilter] = useState("tous");
    const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();
    const navigate = useNavigate();

    useEffect(() => {
        loadPaiements();
    }, []);

    const loadPaiements = async () => {
        try {
            setLoading(true);
            const result = await getAllPaiement();
            console.log("Résultat paiements : ", result);
            if (result.data) {
                setPaiements(result.data);
            } else {
                setPaiements([])
                setError("Erreur lors du chargement des paiements");
                console.log("Erreur paiement : ", result.error);
            }
            
        } catch (err) {
            setError(err.message);
            console.log("Erreur paiement : ", err);
        } finally {
            setLoading(false);
        }
    };

    // Fonctions pour le filtrage par date
    const getPaiementDate = (paiement) => {
        const dateStr = paiement.datePaiment;
        if (!dateStr) return null;
        return new Date(dateStr);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isYesterday = (date) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();
    };

    const isThisWeek = (date) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return date >= startOfWeek && date <= endOfWeek;
    };

    // Calcul des statistiques par date
    const dateStats = useMemo(() => {
        const stats = {
            tous: 0,
            aujourdhui: 0,
            hier: 0,
            cetteSemaine: 0
        };

        paiements.forEach(paiement => {
            const paiementDate = getPaiementDate(paiement);
            if (!paiementDate) return;

            stats.tous++;
            
            if (isToday(paiementDate)) {
                stats.aujourdhui++;
            }
            
            if (isYesterday(paiementDate)) {
                stats.hier++;
            }
            
            if (isThisWeek(paiementDate)) {
                stats.cetteSemaine++;
            }
        });

        return stats;
    }, [paiements]);

    // Formattage de date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        
        const mois = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        const date = new Date(dateString);
        const jour = String(date.getDate()).padStart(2, '0');
        const moisIndex = date.getMonth();
        const annee = date.getFullYear();
        
        return `${jour} ${mois[moisIndex]} ${annee}`;
    };

    // Formattage d'heure
    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    // Transformation des statuts
    const transformeStatut = (statut) => {
        switch (statut) {
            case "payée":
                return "Payée";
            case "en_attente":
                return "En attente";
            case "annulée":
                return "Annulée";
            case "refusée":
                return "Refusée";
            case "en_cours":
                return "En cours";
            default:
                return "Non défini";
        }
    };

    const getStatutBadgeClass = (statut) => {
        const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all";

        switch (statut) {
            case "payée":
            case "PAYÉE":
                return `${baseClasses} bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200 dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400 dark:border-green-700`;
            case "en_attente":
            case "EN_ATTENTE":
                return `${baseClasses} bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:text-yellow-400 dark:border-yellow-700`;
            case "annulée":
            case "ANNULEE":
                return `${baseClasses} bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 dark:border-red-700`;
            case "refusée":
            case "REFUSEE":
                return `${baseClasses} bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 dark:border-red-700`;
            case "en_cours":
            case "EN_COURS":
                return `${baseClasses} bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400 dark:border-blue-700`;
            default:
                return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200 dark:from-slate-800/30 dark:to-slate-700/20 dark:text-gray-400 dark:border-slate-700`;
        }
    };

    const getStatutIcon = (statut) => {
        switch (statut) {
            case "payée":
            case "PAYÉE":
                return "✅";
            case "en_attente":
            case "EN_ATTENTE":
                return "⏳";
            case "annulée":
            case "ANNULEE":
                return "❌";
            case "refusée":
            case "REFUSEE":
                return "🚫";
            case "en_cours":
            case "EN_COURS":
                return "🔄";
            default:
                return "📋";
        }
    };

    // Filtrage par date
    const filterByDate = (paiements) => {
        if (dateFilter === "tous") return paiements;
        
        return paiements.filter(paiement => {
            const paiementDate = getPaiementDate(paiement);
            if (!paiementDate) return false;

            switch (dateFilter) {
                case "aujourdhui":
                    return isToday(paiementDate);
                case "hier":
                    return isYesterday(paiementDate);
                case "cetteSemaine":
                    return isThisWeek(paiementDate);
                default:
                    return true;
            }
        });
    };

    // Filtrage combiné
    let filteredPaiements = filterByDate(paiements);
    
    filteredPaiements = filterStatut === "tous" 
        ? filteredPaiements 
        : filteredPaiements.filter((paiement) => 
            paiement.statutPaiment?.toLowerCase() === filterStatut.toLowerCase()
        );

    // Recherche
    if (searchTerm) {
        const terme = searchTerm.toLowerCase();
        filteredPaiements = filteredPaiements.filter(
            (paiement) =>
                paiement.referencePaiment?.toLowerCase().includes(terme) ||
                paiement.commande?.refCommande?.toLowerCase().includes(terme) ||
                paiement.modePaiment?.toLowerCase().includes(terme) ||
                paiement.montantPaye?.toString().includes(terme)
        );
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Calcul des statistiques
    const stats = useMemo(() => {
        const statsData = {
            total: paiements.length,
            payes: paiements.filter(p => 
                p.statutPaiment?.toLowerCase() === "payée" || 
                p.statutPaiment?.toLowerCase() === "payee"
            ).length,
            enAttente: paiements.filter(p => 
                p.statutPaiment?.toLowerCase() === "en_attente" || 
                p.statutPaiment?.toLowerCase() === "en attente"
            ).length,
            annules: paiements.filter(p => 
                p.statutPaiment?.toLowerCase() === "annulée" || 
                p.statutPaiment?.toLowerCase() === "annulee"
            ).length,
            totalMontant: paiements.reduce((sum, p) => {
                const montant = parseFloat(p.montantPaye) || 0;
                return sum + montant;
            }, 0).toFixed(2)
        };

        return statsData;
    }, [paiements]);

    // Réinitialisation des filtres
    useEffect(() => {
        setFilterValue("Tous")
        setSearchTerm("")
    }, []);

    const voirDetails = (paiement) => {
        // Naviguer vers la page de détail du paiement
        navigate("/admin/fichePaiement", { state: paiement });
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 dark:from-slate-950 dark:to-slate-900">

            {/* Statistiques */}
            <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Total Paiements</p>
                            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
                        </div>
                        <CreditCard className="h-12 w-12 text-blue-200" />
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-100">Payés</p>
                            <p className="mt-2 text-3xl font-bold">{stats.payes}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-200" />
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-100">En attente</p>
                            <p className="mt-2 text-3xl font-bold">{stats.enAttente}</p>
                        </div>
                        <Clock className="h-12 w-12 text-yellow-200" />
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-100">Montant total</p>
                            <p className="mt-2 text-3xl font-bold">{stats.totalMontant} €</p>
                        </div>
                        <TrendingUp className="h-12 w-12 text-purple-200" />
                    </div>
                </div>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-md dark:border-red-800 dark:from-red-900/20 dark:to-red-800/10">
                    <MdInfoOutline size={24} className="flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-400">
                        Une erreur de connexion s'est produite. Vérifiez si le serveur est activé.
                    </span>
                </div>
            )}

            {/* Barre de filtres par date */}
            <div className="mb-3 rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-800">
                <div className="mb-3 flex items-center gap-3">
                    <Calendar size={20} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer par date :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: "tous", label: `Tous (${dateStats.tous})` },
                        { id: "aujourdhui", label: `Aujourd'hui (${dateStats.aujourdhui})` },
                        { id: "hier", label: `Hier (${dateStats.hier})` },
                        { id: "cetteSemaine", label: `Cette semaine (${dateStats.cetteSemaine})` }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setDateFilter(tab.id)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                dateFilter === tab.id
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Barre de recherche et filtres de statut */}
            <div className="mb-3 flex flex-col gap-4 rounded-2xl bg-white py-3 px-6 shadow-lg dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between">
                <div className="input border border-slate-500 dark:border-slate-600 bg-[#FDFEFF] dark:bg-[#020617]">
                    <Search
                        size={20}
                        className="text-slate-400"
                    />
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Rechercher un paiement..."
                        className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
                    />
                </div>

                {/* Filtres de statut */}
                <div className="flex flex-wrap items-center gap-3">
                    <Filter size={20} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer par statut :</span>
                    {["tous", "payée", "en_attente", "annulée", "refusée", "en_cours"].map((statut) => {
                        const isActive = filterStatut === statut;
                        return (
                            <button
                                key={statut}
                                onClick={() => setFilterStatut(statut)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                }`}
                            >
                                {transformeStatut(statut)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Résultats de recherche */}
            {searchTerm && (
                <div className="mb-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        {filteredPaiements.length} paiement(s) trouvé(s) pour "{searchTerm}"
                    </p>
                </div>
            )}

            {/* Tableau des paiements */}
            <div className="rounded-2xl bg-white shadow-xl dark:bg-slate-800">
                <div className="relative h-[380px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Référence
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Commande
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Date paiement
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Mode
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Montant
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"></div>
                                            <p className="text-slate-600 dark:text-slate-400">Chargement des paiements...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPaiements && filteredPaiements.length > 0 ? (
                                filteredPaiements.map((paiement) => (
                                    <tr
                                        key={paiement.idPaiement}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400">
                                                <CreditCard size={14} />
                                                {paiement.referencePaiment || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-sm font-semibold text-white">
                                                    {paiement.commande?.refCommande?.charAt(0) || "C"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {paiement.commande?.refCommande || "N/A"}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        Commande associée
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                                                <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                                                {formatDate(paiement.datePaiment)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {formatTime(paiement.datePaiment)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                                                <Wallet size={14} className="text-slate-500 dark:text-slate-400" />
                                                {paiement.modePaiment || "Non spécifié"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={getStatutBadgeClass(paiement.statutPaiment)}>
                                                <span>{getStatutIcon(paiement.statutPaiment)}</span>
                                                {transformeStatut(paiement.statutPaiment)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-50">
                                                <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                                                {parseFloat(paiement.montantPaye || 0).toFixed(2)} €
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => voirDetails(paiement)}
                                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                                                >
                                                    <Search size={16} />
                                                    Voir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-20">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <CreditCard className="h-32 w-32 text-slate-300 dark:text-slate-600" strokeWidth={1} />
                                            <p className="text-center text-slate-600 dark:text-slate-400">
                                                {searchTerm ? (
                                                    <>
                                                        Aucun paiement ne correspond à <span className="font-bold">"{searchTerm}"</span>
                                                    </>
                                                ) : (
                                                    "Aucun paiement trouvé pour le moment."
                                                )}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Paiement;