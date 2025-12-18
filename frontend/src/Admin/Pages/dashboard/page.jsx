import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { useTheme } from "../../hooks/use-theme";
import {
    CreditCard,
    DollarSign,
    Construction,
    Package,
    Users,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Star,
    MapPin,
    Calendar,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";
import {
    getDashboardStats,
    getSalesData,
    testeCommande,
    getRecentCommande,
    getTopProducts,
} from "@/services/AdminService";

const DashboardPage = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [loadingStat, setLoadingStat] = useState(true);
    const [produitDetail, setProduitDetail] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [stats, setStats] = useState({
        totalClient: 0,
        totalProduit: 0,
        totalCommande: 0,
        totalRevenue: 0,
    });
    const [salesData, setSalesData] = useState([]);
    const [commandeRecent, setCommandeRecent] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const formatDateAfficher = (dateInput) => {
        if (!dateInput) return null;

        // Si c'est une string au bon format
        if (typeof dateInput === "string" && dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            return dateInput.toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
        if (dateInput && typeof dateInput === "object" && dateInput.date) {
            const dateStr = dateInput.date.split(".")[0];
            return dateStr;
        }

        // Si c'est un timestamp ou autre format
        try {
            const date = new Date(dateInput);
            if (!isNaN(date.getTime())) {
                let form = date.toISOString().replace("T", " ").substring(0, 19);
                return form.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
            }
        } catch (e) {
            console.warn("Erreur de conversion de date :", dateInput, e);
        }

        return null;
    };

    useEffect(() => {
        loadDashboardData();
        getRecentCommandes();
        getTopProduit();
        loadSaleData();
    }, []);

    const getRecentCommandes = async () => {
        try {
            setLoading(true);
            const Result = await getRecentCommande();

            if (Result.data) {
                const nouvelleDonnee = Result.data.recentCommande.map((commande) => ({
                    ...commande,
                    dateCommande: formatDateAfficher(commande.dateCommande),
                }));
                setCommandeRecent(nouvelleDonnee);
            } else {
                console.log("Result.error: ", Result.error);
            }
        } catch (error) {
            console.error("Erreur RecentCommande:", error);
        }
    };

    const getTopProduit = async () => {
        try {
            setLoading(true);
            const Result = await getTopProducts();
            if (Result.data) {
                setTopProducts(Result.data.topProduit);
            } else {
                console.log("Result.error: ", Result.error);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoadingStat(true);
            const Result = await getDashboardStats();
            if (Result.data) {
                console.log("Dashboard Stats: ", Result.data);
                setStats({
                    totalClient: Result.data.totalClient,
                    totalProduit: Result.data.totalProduit,
                    totalCommande: Result.data.totalCommande,
                    totalRevenue: Result.data.totalRevenue,
                });
            } else {
                console.log("Result.error: ", Result.error);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du dashboard:", error);
        } finally {
            setLoadingStat(false);
        }
    };

    const loadSaleData   = async () => {
        try {
            setLoadingStat(true);
            const Result = await getSalesData();
            if (Result.data) {
                setSalesData(Result.data)
            } else {
                console.log("Result.error: ", Result.error);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du graphe:", error);
        } finally {
            setLoadingStat(false);
        }
    }

    useEffect(() => {
        console.log("commandeRecent mis à jour : ", commandeRecent);
        console.log("stats mis à jour : ", stats);
        console.log("top Produit mis à jour : ", topProducts);
        console.log("Dashboard Graphe Data: ", salesData);
    }, [commandeRecent, stats, topProducts,salesData]);

    const totalPaye = (montant, frais) => {
        const total = montant + frais;
        return total;
    };

    const mockStats = {
        revenueGrowth: 12.5,
        customerGrowth: 8.2,
        orderGrowth: 15.7,
        productGrowth: 5.3,
    };

    const mockSalesData = [
        { mois: "Jan", ventes: 4500000, commandes: 45 },
        { mois: "Fév", ventes: 5200000, commandes: 52 },
        { mois: "Mar", ventes: 4800000, commandes: 48 },
        { mois: "Avr", ventes: 6100000, commandes: 61 },
        { mois: "Mai", ventes: 5800000, commandes: 58 },
        { mois: "Jun", ventes: 7300000, commandes: 73 },
        { mois: "Jul", ventes: 6900000, commandes: 69 },
        { mois: "Aoû", ventes: 7800000, commandes: 78 },
        { mois: "Sep", ventes: 8200000, commandes: 82 },
        { mois: "Oct", ventes: 9100000, commandes: 91 },
        { mois: "Nov", ventes: 9500000, commandes: 95 },
        { mois: "Déc", ventes: 12540000, commandes: 125 },
    ];

    const mockRecentOrders = [
        {
            id: 1,
            reference: "CMD-2024-001",
            client: "Marie Rakoto",
            email: "marie.rakoto@email.com",
            montant: 125000,
            statut: "Livrée",
            date: "2024-01-15",
            ville: "Antananarivo",
        },
        {
            id: 2,
            reference: "CMD-2024-002",
            client: "Jean Rabe",
            email: "jean.rabe@email.com",
            montant: 89000,
            statut: "En cours",
            date: "2024-01-14",
            ville: "Toamasina",
        },
        {
            id: 3,
            reference: "CMD-2024-003",
            client: "Sophie Randria",
            email: "sophie.randria@email.com",
            montant: 156000,
            statut: "Confirmée",
            date: "2024-01-14",
            ville: "Antananarivo",
        },
        {
            id: 4,
            reference: "CMD-2024-004",
            client: "Pierre Andria",
            email: "pierre.andria@email.com",
            montant: 67000,
            statut: "En attente",
            date: "2024-01-13",
            ville: "Fianarantsoa",
        },
        {
            id: 5,
            reference: "CMD-2024-005",
            client: "Nirina Razafy",
            email: "nirina.razafy@email.com",
            montant: 234000,
            statut: "Livrée",
            date: "2024-01-13",
            ville: "Mahajanga",
        },
    ];

    const mockTopProducts = [
        {
            id: 1,
            nom: "Crème Hydratante Naturelle",
            description: "Crème visage à l'huile d'argan",
            prix: 45000,
            stock: 45,
            ventes: 156,
            note: 4.8,
            statut: "En stock",
            image: "vitamineCserium.png",
        },
        {
            id: 2,
            nom: "Shampoing Réparateur",
            description: "Shampoing aux plantes médicinales",
            prix: 32000,
            stock: 23,
            ventes: 134,
            note: 4.6,
            statut: "Stock faible",
            image: "acide.png",
        },
        {
            id: 3,
            nom: "Huile Essentielle de Ylang",
            description: "Huile pure 100% naturelle",
            prix: 28000,
            stock: 67,
            ventes: 98,
            note: 4.9,
            statut: "En stock",
            image: "florale.png",
        },
        {
            id: 4,
            nom: "Savon Noir Traditionnel",
            description: "Savon purifiant à l'argile",
            prix: 15000,
            stock: 89,
            ventes: 201,
            note: 4.7,
            statut: "En stock",
            image: "efface.png",
        },
        {
            id: 5,
            nom: "Masque Capillaire",
            description: "Masque réparateur aux huiles",
            prix: 38000,
            stock: 12,
            ventes: 87,
            note: 4.5,
            statut: "Rupture",
            image: "cerave.png",
        },
    ];

    const data = {
        stats: mockStats,
        sales: salesData, 
        orders: mockRecentOrders,
        products: mockTopProducts,
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-MG", {
            style: "currency",
            currency: "MGA",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "LIVREE":
                return "badge-success";
            case "EN_PREPARATION":
                return "badge-primary";
            case "INITIALISE":
                return "badge-warning";
            case "EN_ATTENTE_PAIEMENT":
                return "badge-secondary";
            case "ANNULER":
                return "badge-error";
            case "EXPEDIEE":
                return "badge-info";
            default:
                return "badge-ghost";
        }
    };

    const getStatutNom = (status) => {
        switch (status) {
            case "LIVREE":
                return "Livrée";
            case "EN_PREPARATION":
                return "En preparation";
            case "EXPEDIEE":
                return "Expédié";
            case "EN_ATTENTE_PAIEMENT":
                return "En atente Paiement";
            case "ANNULER":
                return "Annulé";
            case "INITIALISE":
                return "Initialise";
            default:
                return "INVALIDE";
        }
    };

    const afficheInfoProduit = (prod) => {
        ouvrirDetailProduit(prod);
        console.log("produitDetail :", prod);
    };

    const fermerDetailProduit = () => {
        setOpenDetail(false);
        setProduitDetail(null);
    };

    const ouvrirDetailProduit = (prod) => {
        setProduitDetail(prod);
        setOpenDetail(true);
    };

    const getStockColor = (stock) => {
        if (stock >= 10) return "badge-success";
        if (stock > 0 && stock < 10) return "badge-warning";
        if (stock === 0) return "badge-error";
        return "badge-info";
    };

    const getStatutStock = (stock) => {
        if (stock >= 10) return "En stock";
        if (stock > 0 && stock < 10) return "stock faible";
        if (stock === 0) return "Rupture";
        return "...";
    };

    return (
        <div className="space-y-6 p-1">
            {openDetail && produitDetail && (
                <div className="modal modal-open">
                    <div className="modal-box max-h-[60vh] max-w-2xl overflow-y-auto bg-slate-200 dark:bg-gray-800">
                        {/* Header du dialogue */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Détails du Produit</h3>
                            <button
                                onClick={fermerDetailProduit}
                                className="btn btn-circle btn-ghost btn-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenu du dialogue */}
                        <div className="ml-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Image du produit */}
                            <div className="flex items-center">
                                <img
                                    src={`/image/${produitDetail.imageUrlProduit}`}
                                    alt={produitDetail.nomProduit}
                                    className="h-64 w-full rounded-lg object-cover shadow-lg"
                                />
                            </div>

                            {/* Informations détaillées */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{produitDetail.nomProduit}</h4>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {produitDetail.prixProduit?.toLocaleString()} Ar
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Description</h5>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        {produitDetail.descriptionProduit || "Aucune description disponible pour ce produit."}
                                    </p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <span
                                        className={`badge ${produitDetail.stockProduit > 5 ? "badge-success" : produitDetail.stockProduit > 0 ? "badge-warning" : "badge-error"}`}
                                    >
                                        {produitDetail.stockProduit > 5 ? "En stock" : produitDetail.stockProduit > 0 ? "Stock faible" : "Rupture"}
                                    </span>
                                    <span className="badge badge-info">{produitDetail.stockProduit} unités</span>
                                </div>

                                {/* Dernière mise à jour */}
                                {produitDetail.dateMisAJourProduit && (
                                    <div>
                                        <h5 className="mb-1 font-semibold text-gray-700 dark:text-gray-300">Dernière mise à jour</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(produitDetail.dateMisAJourProduit).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                )}
                                <button
                                    onClick={fermerDetailProduit}
                                    className="btn btn-error btn-outline btn-wide"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overlay pour fermer en cliquant à l'extérieur */}
                    <div
                        className="modal-backdrop"
                        onClick={fermerDetailProduit}
                    ></div>
                </div>
            )}

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Produits */}
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loadingStat ? <span className="loading loading-dots loading-sm text-blue-600"></span> : stats.totalProduit}
                                </p>
                            </div>
                            <div
                                className={`flex items-center gap-1 text-sm font-medium ${
                                    data.stats.productGrowth >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {data.stats.productGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {Math.abs(data.stats.productGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commandes */}
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        <ShoppingCart className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loadingStat ? <span className="loading loading-dots loading-sm text-blue-600"></span> : stats.totalCommande}
                                </p>
                            </div>
                            <div
                                className={`flex items-center gap-1 text-sm font-medium ${
                                    data.stats.orderGrowth >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {data.stats.orderGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {Math.abs(data.stats.orderGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients */}
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {loadingStat ? <span className="loading loading-dots loading-sm text-blue-600"></span> : stats.totalClient}
                                </p>
                            </div>
                            <div
                                className={`flex items-center gap-1 text-sm font-medium ${
                                    data.stats.customerGrowth >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {data.stats.customerGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {Math.abs(data.stats.customerGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenu */}
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenu Total</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                            <div
                                className={`flex items-center gap-1 text-sm font-medium ${
                                    data.stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {data.stats.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {Math.abs(data.stats.revenueGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques et Commandes Récentes */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Graphique des ventes */}
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <h3 className="card-title mb-4 text-lg font-semibold text-gray-900 dark:text-white">Évolution des Ventes pour les 5 derniers derniers mois</h3>
                        <div className="h-80">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart data={data.sales}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="opacity-30"
                                    />
                                    <XAxis
                                        dataKey="mois"
                                        stroke={theme === "dark" ? "#94a3b8" : "#475569"}
                                    />
                                    <YAxis
                                        stroke={theme === "dark" ? "#94a3b8" : "#475569"}
                                        tickFormatter={(value) => `${value /1000}M`}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            name === "ventes" ? formatCurrency(value) : value,
                                            name === "ventes" ? "Ventes" : "Commandes",
                                        ]}
                                        labelFormatter={(label) => `Mois: ${label}`}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="ventes"
                                        name="Ventes (Ar)"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="commandes"
                                        name="Nombre de commandes"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Commandes récentes */}
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <h3 className="card-title mb-4 text-lg font-semibold text-gray-900 dark:text-white">Commandes Récentes</h3>
                        <div className="max-h-80 space-y-4 overflow-y-auto">
                            {loading ? (
                                <div className="mt-[100px] flex flex-row items-center justify-center gap-2">
                                    <span className="loading-xl loading loading-dots text-blue-600"></span>
                                    <span>Chargement des commande Recent...</span>
                                </div>
                            ) : commandeRecent.length !== 0 ? (
                                commandeRecent.map((order) => (
                                    <div
                                        key={order[0].refCommande}
                                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                                                    {order[0].client.nomClient
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase() || " "}
                                                    {order[0].client.prenomClient
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase() || " "}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                    {order[0].client.nomClient + " " + order[0].client.prenomClient || " "}
                                                </p>
                                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{order[0].refCommande || " "}</p>
                                                <div className="mt-1 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {order[0].adresseLivraison.ville || " "} - {order[0].adresseLivraison.quartier || " "}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(totalPaye(parseFloat(order.montant), parseFloat(order[0].fraisLivraison)))}
                                            </p>
                                            <div className={`badge badge-xs ${getStatusColor(order[0].statutCommande || "LIVREE")} mt-1`}>
                                                {getStatutNom(order[0].statutCommande)}
                                            </div>
                                            <p className="mt-1 py-1 text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(order[0].dateCommande.date)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Construction
                                        strokeWidth={1}
                                        className="h-40 w-40"
                                    />
                                    <p className="text-gray-600 dark:text-gray-400">Aucune commande récente disponible.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Produits populaires */}
            {topProducts.length !== 0 && (
                <div className="card border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="card-body">
                        <h3 className="card-title mb-6 text-lg font-semibold text-gray-900 dark:text-white">Produits les Plus Vendus</h3>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                        <th className="text-gray-900 dark:text-white">Produit</th>
                                        <th className="text-gray-900 dark:text-white">Prix</th>
                                        <th className="text-gray-900 dark:text-white">Stock</th>
                                        <th className="text-gray-900 dark:text-white">Ventes</th>
                                        <th className="text-gray-900 dark:text-white">Statut</th>
                                        <th className="text-gray-900 dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product) => (
                                        <tr
                                            key={product.numProduit}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-600"
                                        >
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle h-12 w-12">
                                                            <img
                                                                src={`/image/${product.imageUrlProduit}`}
                                                                alt={product.nomProduit}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{product.nomProduit}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.descriptionProduit}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.prixProduit)}</td>
                                            <td>
                                                <span className="font-medium text-gray-900 dark:text-white">{product.stockProduit}</span>
                                            </td>
                                            <td>
                                                <span className="font-medium text-gray-900 dark:text-white">{product.total_ventes || 0}</span>
                                            </td>

                                            <td>
                                                <div className={`badge ${getStockColor(product.stockProduit)}`}>
                                                    {getStatutStock(product.stockProduit)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => afficheInfoProduit(product)}
                                                        className="btn btn-ghost btn-sm items-center text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span>Détails</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
