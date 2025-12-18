import React, { useState, useEffect, useMemo } from "react";
import { Construction, Package, Calendar, Truck, DollarSign, Eye, Filter, Search, ShoppingCart } from "lucide-react";
import { MdInfoOutline } from "react-icons/md";
import { commandeService } from "@/services/CommandeService";
import { data } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/SearchContext";
import { 
    RefreshCw, 
    CheckCircle, 
    Hourglass, 
    XCircle, 
    CreditCard, 
    Box 
} from 'lucide-react'; 

const Commande = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCommande, setSelectedCommande] = useState(null);
    const [filterStatus, setFilterStatus] = useState("tous");
    const [dateFilter, setDateFilter] = useState("tous"); // Nouvel état pour le filtre par date
    const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();
    const navigate = useNavigate();

    useEffect(() => {
        loadCommandes();
    }, []);

    const loadCommandes = async () => {
        try {
            setLoading(true);
            const result = await commandeService.getAllCommandes();
            console.log("resultat commande : ", result);
            if (result.data) {
                setCommandes(result.data);
            } else {
                console.log("Erreur commande : ", result.error);
                setCommandes([])
            }
        } catch (err) {
            setError(err.message);
            console.log("Erreur cmd : ", err);
        } finally {
            setLoading(false);
        }
    };

    const afficheDetailCommande = (commande) => {
        navigate("/admin/ficheCommande", { state: commande });
    };

    const statutTransforme = (status) => {
        switch (status) {
            case "inititalise":
                return "INITIALISE";
            case "en attente":
                return "EN_ATTENTE_PAIEMENT";
            case "en preparation":
                return "EN_PREPARATION";
            case "expediée":
                return "EXPEDIEE";
            case "livrée":
                return "LIVREE";
            case "annulée":
                return "ANNULER";
            default:
                return "tous";
        }
    };

    const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
        const mois = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const str = String(dateTimeString.date);
        const date = str.slice(0, 10);
        const time = str.slice(11, 19);
        if (extract === 'date') {
            if (format) {
                const daty = new Date(date);
                const jour = String(daty.getDate()).padStart(2, '0');
                const moisIndex = daty.getMonth();
                const annee = daty.getFullYear();
                return `${jour} ${mois[moisIndex]} ${annee}`;
            }
            return new Date(date).toLocaleDateString('fr-FR');
        } else if (extract === 'time') {
            return time;
        }
    };

    // Fonctions pour le filtrage par date
    const getCommandeDate = (commande) => {
        const dateStr = commande.dateCommande?.date;
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
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche de cette semaine
        
        return date >= startOfWeek && date <= endOfWeek;
    };

    const methPaiement = (methode) => {
        const iconProps = { size: 14, className: "ml-2" };
        switch (methode) {
            case "stripe":
                return (
                    <div className="flex items-center">
                        <DollarSign {...iconProps} color="#007bff" />
                        <span>Bancaire</span>
                    </div>
                );
            case "espece":
                return (
                    <div>
                        <Truck {...iconProps} color="#007bff" />
                        <span>A la livraison</span>
                    </div>
                );
            default:
                return "Tous";
        }
    }

    // Calcul des statistiques par date
    const dateStats = useMemo(() => {
        const stats = {
            tous: 0,
            aujourdhui: 0,
            hier: 0,
            cetteSemaine: 0
        };

        commandes.forEach(commande => {
            const commandeDate = getCommandeDate(commande);
            if (!commandeDate) return;

            stats.tous++;
            
            if (isToday(commandeDate)) {
                stats.aujourdhui++;
            }
            
            if (isYesterday(commandeDate)) {
                stats.hier++;
            }
            
            if (isThisWeek(commandeDate)) {
                stats.cetteSemaine++;
            }
        });

        return stats;
    }, [commandes]);

    const Transformestatut = (status) => {
        switch (status) {
            case "INITIALISE":
                return "Initialisé";
            case "EN_ATTENTE_PAIEMENT":
                return "En attente paiement";
            case "EN_PREPARATION":
                return "En preparation";
            case "EXPEDIEE":
                return "Expédiée";
            case "LIVREE":
                return "Livrée";
            case "ANNULER":
                return "Annulée";
            default:
                return "Tous";
        }
    };

    const getStatusBadgeClass = (status) => {
        const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all";

        switch (status) {
            case "INITIALISE":
                return `${baseClasses} bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border border-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 dark:text-orange-400 dark:border-orange-700`;
            case "LIVREE":
                return `${baseClasses} bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200 dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400 dark:border-green-700`;
            case "EXPEDIEE":
                return `${baseClasses} bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400 dark:border-blue-700`;
            case "EN_PREPARATION":
                return `${baseClasses} bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:text-yellow-400 dark:border-yellow-700`;
            case "ANNULER":
                return `${baseClasses} bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 dark:border-red-700`;
            case "EN_ATTENTE_PAIEMENT":
                return `${baseClasses} bg-gradient-to-r from-violet-100 to-violet-50 text-violet-700 border border-violet-200 dark:from-violet-900/30 dark:to-violet-800/20 dark:text-violet-400 dark:border-violet-700`;
            default:
                return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200 dark:from-slate-800/30 dark:to-slate-700/20 dark:text-gray-400 dark:border-slate-700`;
        }
    };

    useEffect(() => {
        setFilterValue("Tous")
        setSearchTerm("")
    }, [])

    const getStatusIcon = (status) => {
        const iconProps = { size: 18, className: "ml-2" };
    
        switch (status) {
            case "INITIALISE":
                return <RefreshCw {...iconProps} />; 
                
            case "LIVREE":
                return <CheckCircle {...iconProps} color="green" />;
    
            case "EXPEDIEE":
                return <Truck {...iconProps} color="#007bff" />; 
                
            case "EN_PREPARATION":
                return <Hourglass {...iconProps} color="orange" />; 
                
            case "ANNULER":
                return <XCircle {...iconProps} color="red" />;
                
            case "EN_ATTENTE_PAIEMENT":
                return <CreditCard {...iconProps} color="gray" />;
                
            default:
                return <Box {...iconProps} />;
        }
    };

    // Filtrage des commandes par date
    const filterByDate = (commandes) => {
        if (dateFilter === "tous") return commandes;
        
        return commandes.filter(commande => {
            const commandeDate = getCommandeDate(commande);
            if (!commandeDate) return false;

            switch (dateFilter) {
                case "aujourdhui":
                    return isToday(commandeDate);
                case "hier":
                    return isYesterday(commandeDate);
                case "cetteSemaine":
                    return isThisWeek(commandeDate);
                default:
                    return true;
            }
        });
    };

    // Filtrage combiné: date → statut → recherche
    let filteredCommandes = filterByDate(commandes);
    
    filteredCommandes = filterStatus === "tous" 
        ? filteredCommandes 
        : filteredCommandes.filter((commande) => commande.statutCommande === filterStatus);

    // Recherche
    if (searchTerm) {
        const terme = searchTerm.toLowerCase();
        filteredCommandes = filteredCommandes.filter(
            (commande) =>
                commande.refCommande.toLowerCase().includes(terme) ||
                commande.client.nomClient.toLowerCase().includes(terme) ||
                commande.client.prenomClient.toLowerCase().includes(terme) ||
                commande.client.user.emailUsers.toLowerCase().includes(terme)
        );
    }
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Statistiques
    const stats = {
        total: commandes.length,
        enCours: commandes.filter(c => c.statutCommande === "EN_PREPARATION").length,
        livrees: commandes.filter(c => c.statutCommande === "LIVREE").length,
        enAttente: commandes.filter(c => c.statutCommande === "EN_ATTENTE_PAIEMENT").length
    };

    // overflow-hidden min-h-screen 
    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 dark:from-slate-950 dark:to-slate-900">

            {/* Statistiques */}
            <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Total Commandes</p>
                            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
                        </div>
                        <ShoppingCart className="h-12 w-12 text-blue-200" />
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-100">En preparation</p>
                            <p className="mt-2 text-3xl font-bold">{stats.enCours}</p>
                        </div>
                        <Package className="h-12 w-12 text-yellow-200" />
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-100">Livrées</p>
                            <p className="mt-2 text-3xl font-bold">{stats.livrees}</p>
                        </div>
                        <Truck className="h-12 w-12 text-green-200" />
                    </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-violet-100">En attente</p>
                            <p className="mt-2 text-3xl font-bold">{stats.enAttente}</p>
                        </div>
                        <DollarSign className="h-12 w-12 text-violet-200" />
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
            <div className="mb-3 flex justify-center gap-6 items-center rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-800">
                <div className="mb-3 flex items-center gap-3">
                    <Calendar size={20} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer par date :</span>
                </div>
                <div className="flex flex-wrap gap-4">
                   {[
                        { key: "tous", label: "Tous", count: dateStats.tous },
                        { key: "aujourdhui", label: "Aujourd'hui", count: dateStats.aujourdhui },
                        { key: "hier", label: "Hier", count: dateStats.hier },
                        { key: "cetteSemaine", label: "Cette semaine", count: dateStats.semaine }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setDateFilter(tab.key)}
                            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                                dateFilter === tab.key
                                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg scale-105"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                dateFilter === tab.key
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
                            }`}>
                                {tab.count}
                            </span>
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
                        placeholder="Recherche..."
                        className="w-full  bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
                    />
                </div>

                {/* Filtres de statut */}
                <div className="flex flex-wrap items-center gap-1">
                    <Filter size={20} className="text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer par statut :</span>
                    {["tous", "en attente", "inititalise", "en preparation", "expediée", "livrée", "annulée"].map((status) => {
                        const statusValue = statutTransforme(status);
                        const isActive = filterStatus === statusValue;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(statusValue)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Résultats de recherche */}
            {searchTerm && (
                <div className="mb-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        {filteredCommandes.length} commande(s) trouvée(s) pour "{searchTerm}"
                    </p>
                </div>
            )}

            {/* Tableau des commandes */}
            <div className=" rounded-2xl bg-white shadow-xl dark:bg-slate-800">
                <div className="relative h-[380px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Référence
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Date commande
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Livraison
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Paiement
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
                                            <p className="text-slate-600 dark:text-slate-400">Chargement des commandes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCommandes && filteredCommandes.length > 0 ? (
                                filteredCommandes.map((commande) => (
                                    <tr
                                        key={commande.refCommande}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400">
                                                <Package size={14} />
                                                {commande.refCommande}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-sm font-semibold text-white">
                                                    {commande.client.nomClient.charAt(0)}{commande.client.prenomClient.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {commande.client.nomClient} {commande.client.prenomClient}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {commande.client.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                                                <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                                                {ExtractionDate(commande.dateCommande, "date", true)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {ExtractionDate(commande.dateCommande, "time")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={getStatusBadgeClass(commande.statutCommande)}>
                                                <span>{getStatusIcon(commande.statutCommande)}</span>
                                                {Transformestatut(commande.statutCommande)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                                                <Truck size={14} className="text-slate-500 dark:text-slate-400" />
                                                {commande.methodeLivraison || "En cours..."}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-50">
                                                {/* <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                                                {commande.fraisLivraison || "En cours..."} */}
                                                {methPaiement(commande.methodePaiement)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => afficheDetailCommande(commande)}
                                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                                                >
                                                    <Eye size={16} />
                                                    Détails
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-20">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Construction className="h-32 w-32 text-slate-300 dark:text-slate-600" strokeWidth={1} />
                                            <p className="text-center text-slate-600 dark:text-slate-400">
                                                {searchTerm ? (
                                                    <>
                                                        Aucune commande ne correspond à <span className="font-bold">"{searchTerm}"</span>
                                                    </>
                                                ) : (
                                                    "Aucune commande trouvée pour le moment."
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

export default Commande;

// import React, { useState, useEffect } from "react";
// import { Construction, Package, Calendar, Truck, DollarSign, Eye, Filter, Search, ShoppingCart } from "lucide-react";
// import { MdInfoOutline } from "react-icons/md";
// import { commandeService } from "@/services/CommandeService";
// import { data } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import { useSearch } from "../../contexts/SearchContext";



// const Commande = () => {
//     const [commandes, setCommandes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedCommande, setSelectedCommande] = useState(null);
//     const [filterStatus, setFilterStatus] = useState("tous");
//     const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();
//     const navigate = useNavigate();

//     useEffect(() => {
//         loadCommandes();
//     }, []);

//     const loadCommandes = async () => {
//         try {
//             setLoading(true);
//             const result = await commandeService.getAllCommandes();
//             console.log("resultat commande : ", result);
//             if (result.data) {
//                 setCommandes(result.data);
//             } else {
//                 setError("Erreur lors du chargement des commandes");
//                 console.log("Erreur commande : ", result.error);
//             }
//         } catch (err) {
//             setError(err.message);
//             console.log("Erreur cmd : ", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const afficheDetailCommande = (commande) => {
//         navigate("/admin/ficheCommande",{state: commande});
//     };

//     const handleStatusChange = async (refCommande, newStatus) => {
//         try {
//             const result = await commandeService.updateStatut(refCommande, newStatus);
//             if (result.success) {
//                 setCommandes((prevCommandes) =>
//                     prevCommandes.map((commande) => 
//                         commande.refCommande === refCommande 
//                             ? { ...commande, statutCommande: newStatus } 
//                             : commande
//                     )
//                 );

//                 if (selectedCommande && selectedCommande.refCommande === refCommande) {
//                     setSelectedCommande((prev) => ({ ...prev, statutCommande: newStatus }));
//                 }
//             }
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     const statutTransforme = (status) => {
//         switch (status) {
//             case "inititalise":
//                 return "INITIALISE";
//             case "livrée":
//                 return "LIVREE";
//             case "payée":
//                 return "PAYÉE";
//             case "en cours":
//                 return "EN_COURS";
//             case "annulée":
//                 return "ANNULER";
//             case "en attente":
//                 return "EN_ATTENTE_PAIEMENT";
//             default:
//                 return "tous";
//         }
//     };

//     const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
//         const mois = [
//             'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
//             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
//         ];
//         const str = String(dateTimeString.date);
//         const date = str.slice(0, 10);
//         const time = str.slice(11, 19);
//         if (extract === 'date') {
//             if (format) {
//                 const daty = new Date(date);
//                 const jour = String(daty.getDate()).padStart(2, '0');
//                 const moisIndex = daty.getMonth();
//                 const annee = daty.getFullYear();
//                 return `${jour} ${mois[moisIndex]} ${annee}`;
//             }
//             return new Date(date).toLocaleDateString('fr-FR');
//         } else if (extract === 'time') {
//             return time;
//         }
//     };

//     const Transformestatut = (status) => {
//         switch (status) {
//             case "INITIALISE":
//                 return "Initialisé";
//             case "LIVREE":
//                 return "Livrée";
//             case "PAYÉE":
//                 return "Payée";
//             case "EN_COURS":
//                 return "En cours";
//             case "ANNULER":
//                 return "Annulée";
//             case "EN_ATTENTE_PAIEMENT":
//                 return "En attente paiement";
//             default:
//                 return "Tous";
//         }
//     };

//     const getStatusBadgeClass = (status) => {
//         const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all";

//         switch (status) {
//             case "INITIALISE":
//                 return `${baseClasses} bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 border border-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 dark:text-orange-400 dark:border-orange-700`;
//             case "LIVREE":
//                 return `${baseClasses} bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200 dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400 dark:border-green-700`;
//             case "PAYÉE":
//                 return `${baseClasses} bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400 dark:border-blue-700`;
//             case "EN_COURS":
//                 return `${baseClasses} bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/20 dark:text-yellow-400 dark:border-yellow-700`;
//             case "ANNULER":
//                 return `${baseClasses} bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 dark:border-red-700`;
//             case "EN_ATTENTE_PAIEMENT":
//                 return `${baseClasses} bg-gradient-to-r from-violet-100 to-violet-50 text-violet-700 border border-violet-200 dark:from-violet-900/30 dark:to-violet-800/20 dark:text-violet-400 dark:border-violet-700`;
//             default:
//                 return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200 dark:from-slate-800/30 dark:to-slate-700/20 dark:text-gray-400 dark:border-slate-700`;
//         }
//     };
//         useEffect(()=>{
//             setFilterValue("Tous")
//             setSearchTerm("")
//         },[])

//     const getStatusIcon = (status) => {
//         switch (status) {
//             case "INITIALISE":
//                 return "🔄";
//             case "LIVREE":
//                 return "✅";
//             case "PAYÉE":
//                 return "💳";
//             case "EN_COURS":
//                 return "⏳";
//             case "ANNULER":
//                 return "❌";
//             case "EN_ATTENTE_PAIEMENT":
//                 return "⏸️";
//             default:
//                 return "📦";
//         }
//     };

//     // Filtrage des commandes
//     let filteredCommandes = filterStatus === "tous" ? commandes : commandes.filter((commande) => commande.statutCommande === filterStatus);

//     // Recherche
//     if (searchTerm) {
//         const terme = searchTerm.toLowerCase();
//         filteredCommandes = filteredCommandes.filter(
//             (commande) =>
//                 commande.refCommande.toLowerCase().includes(terme) ||
//                 commande.client.nomClient.toLowerCase().includes(terme) ||
//                 commande.client.prenomClient.toLowerCase().includes(terme) ||
//                 commande.client.user.emailUsers.toLowerCase().includes(terme)
//         );
//     }
//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     // Statistiques
//     const stats = {
//         total: commandes.length,
//         enCours: commandes.filter(c => c.statutCommande === "EN_COURS").length,
//         livrees: commandes.filter(c => c.statutCommande === "LIVREE").length,
//         enAttente: commandes.filter(c => c.statutCommande === "EN_ATTENTE_PAIEMENT").length
//     };
// // overflow-hidden min-h-screen 
//     return (
//         <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 dark:from-slate-950 dark:to-slate-900">

//             {/* Statistiques */}
//             <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-4">
//                 <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-blue-100">Total Commandes</p>
//                             <p className="mt-2 text-3xl font-bold">{stats.total}</p>
//                         </div>
//                         <ShoppingCart className="h-12 w-12 text-blue-200" />
//                     </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-yellow-100">En cours</p>
//                             <p className="mt-2 text-3xl font-bold">{stats.enCours}</p>
//                         </div>
//                         <Package className="h-12 w-12 text-yellow-200" />
//                     </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-green-100">Livrées</p>
//                             <p className="mt-2 text-3xl font-bold">{stats.livrees}</p>
//                         </div>
//                         <Truck className="h-12 w-12 text-green-200" />
//                     </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-lg">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm font-medium text-violet-100">En attente</p>
//                             <p className="mt-2 text-3xl font-bold">{stats.enAttente}</p>
//                         </div>
//                         <DollarSign className="h-12 w-12 text-violet-200" />
//                     </div>
//                 </div>
//             </div>

//             {/* Message d'erreur */}
//             {error && (
//                 <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-md dark:border-red-800 dark:from-red-900/20 dark:to-red-800/10">
//                     <MdInfoOutline size={24} className="flex-shrink-0 text-red-600 dark:text-red-400" />
//                     <span className="text-sm font-medium text-red-800 dark:text-red-400">
//                         Une erreur de connexion s'est produite. Vérifiez si le serveur est activé.
//                     </span>
//                 </div>
//             )}

//             {/* Barre de recherche et filtres */}
//             <div className="mb-3 flex justify-between items-center rounded-2xl bg-white py-3 px-6 shadow-lg dark:bg-slate-800">
//                 <div className="input border border-slate-500 dark:border-slate-600 bg-[#FDFEFF] dark:bg-[#020617]">
//                             <Search
//                                 size={20}
//                                 className="text-slate-400"
//                             />
//                             <input
//                                 type="text"
//                                 name="search"
//                                 id="search"
//                                 value={searchTerm} 
//                                 onChange={handleSearchChange}
//                                 placeholder="Recherche..."
//                                 className="w-full  bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
//                             />
//                         </div>

//                 {/* Filtres de statut */}
//                 <div className="flex flex-wrap items-center gap-3">
//                     <Filter size={20} className="text-slate-600 dark:text-slate-400" />
//                     <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtrer par statut :</span>
//                     {["tous", "en attente", "inititalise", "en cours", "payée", "livrée", "annulée"].map((status) => {
//                         const statusValue = statutTransforme(status);
//                         const isActive = filterStatus === statusValue;
//                         return (
//                             <button
//                                 key={status}
//                                 onClick={() => setFilterStatus(statusValue)}
//                                 className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
//                                     isActive
//                                         ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
//                                         : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
//                                 }`}
//                             >
//                                 {status.charAt(0).toUpperCase() + status.slice(1)}
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* Résultats de recherche */}
                
//             </div>

//             {/* Tableau des commandes */}
//             <div className=" rounded-2xl bg-white shadow-xl dark:bg-slate-800">
//             <div className="relative h-[380px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                     <table className="w-full">
//                         <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800">
//                             <tr>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Référence
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Client
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Date commande
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Statut
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Livraison
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Frais
//                                 </th>
//                                 <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
//                                     Actions
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan="7" className="py-20">
//                                         <div className="flex flex-col items-center justify-center gap-4">
//                                             <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"></div>
//                                             <p className="text-slate-600 dark:text-slate-400">Chargement des commandes...</p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : filteredCommandes && filteredCommandes.length > 0 ? (
//                                 filteredCommandes.map((commande) => (
//                                     <tr
//                                         key={commande.refCommande}
//                                         className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
//                                     >
//                                         <td className="px-6 py-4">
//                                             <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400">
//                                                 <Package size={14} />
//                                                 {commande.refCommande}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-sm font-semibold text-white">
//                                                     {commande.client.nomClient.charAt(0)}{commande.client.prenomClient.charAt(0)}
//                                                 </div>
//                                                 <div>
//                                                     <div className="font-semibold text-slate-900 dark:text-white">
//                                                         {commande.client.nomClient} {commande.client.prenomClient}
//                                                     </div>
//                                                     <div className="text-xs text-slate-500 dark:text-slate-400">
//                                                         {commande.client.email}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
//                                                 <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
//                                                 {ExtractionDate(commande.dateCommande, "date", true)}
//                                             </div>
//                                             <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                                                 {ExtractionDate(commande.dateCommande, "time")}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={getStatusBadgeClass(commande.statutCommande)}>
//                                                 <span>{getStatusIcon(commande.statutCommande)}</span>
//                                                 {Transformestatut(commande.statutCommande)}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-50">
//                                                 <Truck size={14} className="text-slate-500 dark:text-slate-400" />
//                                                 {commande.methodeLivraison || "En cours..."}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-50">
//                                                 <DollarSign size={14} className="text-green-600 dark:text-green-400" />
//                                                 {commande.fraisLivraison || "En cours..."}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center justify-center">
//                                                 <button
//                                                     onClick={() => afficheDetailCommande(commande)}
//                                                     className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
//                                                 >
//                                                     <Eye size={16} />
//                                                     Détails
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="7" className="py-20">
//                                         <div className="flex flex-col items-center justify-center gap-4">
//                                             <Construction className="h-32 w-32 text-slate-300 dark:text-slate-600" strokeWidth={1} />
//                                             <p className="text-center text-slate-600 dark:text-slate-400">
//                                                 {searchTerm ? (
//                                                     <>
//                                                         Aucune commande ne correspond à <span className="font-bold">"{searchTerm}"</span>
//                                                     </>
//                                                 ) : (
//                                                     "Aucune commande trouvée pour le moment."
//                                                 )}
//                                             </p>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//             </div>
//             </div>
//         </div>
//     );
// };

// export default Commande;

// import React, { useState, useEffect } from "react";
// import { commandeService } from "@/services/CommandeService";
// import { data } from "react-router-dom";
// import { Construction, PencilLine, Trash, NotepadText } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { MdInfoOutline } from "react-icons/md";
// const Commande = () => {
//     const [commandes, setCommandes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedCommande, setSelectedCommande] = useState(null);
//     const [filterStatus, setFilterStatus] = useState("tous");
//     const navigate = useNavigate();

//     useEffect(() => {
//         loadCommandes();
//     }, []);

//     const loadCommandes = async () => {
//         try {
//             setLoading(true);
//             const result = await commandeService.getAllCommandes();
//             console.log("resultat commande : ", result);
//             if (result.data) {
//                 setCommandes(result.data);
//             } else {
//                 setError("Erreur lors du chargement des commandes");
//                 console.log("Erreur commande : ", result.error);
//             }
//         } catch (err) {
//             setError(err.message);
//             console.log("Erreur cmd : ", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const afficheDetailCommande = (commande) => {
//         navigate("/admin/ficheCommande",{state: commande});
//     }

//     const handleStatusChange = async (refCommande, newStatus) => {
//         try {
//             const result = await commandeService.updateStatut(refCommande, newStatus);
//             if (result.success) {
//                 setCommandes((prevCommandes) =>
//                     prevCommandes.map((commande) => (commande.refCommande === refCommande ? { ...commande, statutCommande: newStatus } : commande)),
//                 );

//                 // Mettre à jour aussi la commande sélectionnée si c'est la même
//                 if (selectedCommande && selectedCommande.refCommande === refCommande) {
//                     setSelectedCommande((prev) => ({ ...prev, statutCommande: newStatus }));
//                 }
//             }
//         } catch (err) {
//             alert(err.message);
//         }
//     };
//     const statutTransforme = (status) => {
//       switch (status) {
//             case "inititalise":
//               return "INITIALISE";
//           case "livrée":
//               return "LIVREE";
//           case "payée":
//               return "PAYÉE"; 
//           case "en cours":
//               return"EN_COURS";
//           case "annulée":
//               return "ANNULER";
//           case "en attente":
//               return "EN_ATTENTE_PAIEMENT";
//           default:
//               return "tous";
//       }
//   };

//   const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
//         const mois = [
//             'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
//             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
//         ];
//         const str = String(dateTimeString.date); 
//             const date = str.slice(0,10);
//             const time = str.slice(11,19);
//             if (extract === 'date') {
//                 if (format) {
//                     const daty = new Date(date);
//                     const jour = String(daty.getDate()).padStart(2, '0');
//                     const moisIndex = daty.getMonth();
//                     const annee = daty.getFullYear();
//                     return `${jour} ${mois[moisIndex]} ${annee}`;
//     }
//                 return new Date(date).toLocaleDateString('fr-FR');
//             } else if (extract === 'time') {
//                 return time;
//             }
//   }

//   const Transformestatut = (status) => {
//     switch (status) {
//         case "INITIALISE":
//             return "Inititalise";
//         case "LIVREE":
//             return "Livrée";
//         case "PAYÉE":
//             return "Payée"; 
//         case "EN_COURS":
//             return"En cours";
//         case "ANNULER":
//             return "Annulée";
//         case "EN_ATTENTE_PAIEMENT":
//             return "En attente paiement";
//         default:
//             return "Tous";
//     }
// };
//     const getStatusBadgeClass = (status) => {
//         const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";

//         switch (status) {
//             case "INITIALISE":
//                 return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
//             case "LIVREE":
//                 return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
//             case "PAYÉE":
//                 return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-600`;
//             case "EN_COURS":
//                 return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
//             case "ANNULER":
//                 return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
//             case "EN_ATTENTE_PAIEMENT":
//                 return `${baseClasses} bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200`;
//             default:
//                 return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-blue-200`;
//         }
//     };

//     const filteredCommandes = filterStatus === "tous" ? commandes : commandes.filter((commande) => commande.statutCommande === filterStatus);

//     return (
//         <div className="">
            
//             {error && (
//                 <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-400">
//                     <MdInfoOutline size={20} />
//                     <span>Une erreur de connexion s'est produit. Vérifier si le serveur est désactivé'</span>
//                 </div>
//             )}
//             {/* Filtres */}
//             <div className="mb-3 rounded-lg transition-colors bg-white dark:bg-slate-900 p-4 shadow">
//                 <div className="flex flex-wrap items-center gap-4">
//                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par statut :</span>
//                     {["tous", "en attente","inititalise", "en cours", "payée", "livrée", "annulée"].map((status) => (
//                         <button
//                             key={status}
//                             onClick={() => setFilterStatus(statutTransforme(status))}
//                             className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
//                                 filterStatus === statutTransforme(status) ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 text-gray-700 hover:bg-gray-300"
//                             }`}
//                         >
//                             {status.charAt(0).toUpperCase() + status.slice(1)}
//                         </button>
//                     ))}
//                 </div>
//             </div>
//             <div className="flex flex-col gap-y-4 rounded-lg border border-slate-300 bg-white p-2 transition-colors dark:border-slate-700 dark:bg-slate-900">
//                 <div className="flex flex-col gap-y-2 rounded-lg p-1">
//                     <div className="relative h-[450px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className=" w-full text-slate-900 dark:text-slate-50">
//                             <thead className="table-header">
//                                 <tr className="table-row text-gray-500 dark:text-gray-400">
//                                     <th className="table-head">ID Commande</th>
//                                     <th className="table-head">Nom Client</th>
//                                     <th className="table-head">Date commande</th>
//                                     <th className="table-head">Statut Commande</th>
//                                     <th className="table-head">Livraison</th>
//                                     <th className="table-head">Frais de Livraison</th>
//                                     <th className="table-head">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="">
//                               { filteredCommandes ? (
//                                   filteredCommandes.map((commande) => (
//                                         <tr
//                                             key={commande.refCommande}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell ">
//                                                 <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{commande.refCommande}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {commande.client.nomClient} {commande.client.prenomClient}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">{commande.client.email}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">{ExtractionDate(commande.dateCommande,"date",true)}</div>
//                                                 <div className="text-sm text-gray-500">{ExtractionDate(commande.dateCommande,"time")}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <span className={getStatusBadgeClass(commande.statutCommande)}>{Transformestatut(commande.statutCommande)}</span>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm font-medium text-gray-900 dark:text-slate-50">
//                                                     {commande.methodeLivraison || "En cours..."}
//                                                 </div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm font-medium text-gray-900 dark:text-slate-50">
//                                                   {commande.fraisLivraison || "En cours..."}
//                                                 </div>
//                                             </td>
//                                             <td className="table-cell">
//                                                     <button
//                                                         onClick={() => afficheDetailCommande(commande)}
//                                                         className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
//                                                     >
//                                                         Détails
//                                                     </button>
//                                             </td>
//                                         </tr>
//                                   ))
//                                 ) : (
//                                     <tr key="vide">
//                                           <td colSpan="7">
//                                               <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
//                                                   {loading ? (
//                                                       <div className="flex flex-row  h-64 items-center  gap-2 justify-center">
//                                                           <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
//                                                           <span>Chargement des commandes...</span>
//                                                       </div>
//                                                   ) : (
//                                                     <>

//                                                     <div>
//                                                         <Construction
//                                                             strokeWidth={1}
//                                                             className="h-40 w-40"
//                                                         />
//                                                         </div>
//                                                         <p className="text-sm py-8 text-center">
//                                                         {filteredCommandes === null ? (
//                                                             <span className="text-gray-500">Aucun commande trouvé pour le moment.</span>
//                                                         ) : (
//                                                           searchTerm ? (
//                                                               <p>
//                                                                   {console.log("Aucun resulat")}
//                                                                   Aucun commande correspond à{" "}
//                                                                   <span className="font-bold">{searchTerm}</span>{" "}
//                                                               </p>
//                                                           ) : (
//                                                               `Aucun commande trouvé pour le moment.`
//                                                           )
//                                                         )}
                                                            
//                                                         </p>
//                                                     </>
//                                                   )}
//                                               </div>
//                                           </td>
//                                       </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div> 
//             </div>
//     );
// };

// export default Commande;
