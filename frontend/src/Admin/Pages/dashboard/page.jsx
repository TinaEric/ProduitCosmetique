import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { useTheme } from "../../hooks/use-theme";
import { Footer } from "../../layouts/footer";
import { 
    CreditCard, 
    DollarSign, 
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
    Trash2
} from "lucide-react";
import { 
    getDashboardStats, 
    getSalesData, 
    getRecentCommande, 
    getTopProducts 
} from "@/services/AdminService";

const DashboardPage = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
            totalClient : 0,
            totalProduit : 0,
            totalCommande: 0,
            totalRevenue: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [commandeRecent, setCommandeRecent] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const formatDateAfficher = (dateInput) => {
        if (!dateInput) return null;
        
        // Si c'est une string au bon format
        if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            return dateInput;
        }
        
        // Si c'est un doctrine objet {date: "...", timezone: "...", timezone_type: 3}
        if (dateInput && typeof dateInput === 'object' && dateInput.date) {
            // Extraire juste la partie date 
            const dateStr = dateInput.date.split('.')[0];
            return dateStr;
        }
        
        // Si c'est un timestamp ou autre format
        try {
            const date = new Date(dateInput);
            if (!isNaN(date.getTime())) {
                return date.toISOString().replace('T', ' ').substring(0, 19);
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
    }, []);

    const getRecentCommandes = async () => {
        try {
            setLoading(true);
            const Result = await getRecentCommande();
            
            if (Result.data) {
                const nouvelleDonnee = Result.data.recentCommande.map(commande => ({
                    ...commande,
                    dateCommande: formatDateAfficher(commande.dateCommande)
                }));
                setCommandeRecent(nouvelleDonnee);
            }else{
                console.log("Result.error: ", Result.error)
            }
        } catch (error) {
            console.error("Erreur RecentCommande:", error);
        }
    };

    const getTopProduit = async () => {
        try {
            setLoading(true);
            const Result = await getTopProducts()
            if (Result.data){
                setTopProducts(Result.data.topProduit)
            }else{
                console.log("Result.error: ", Result.error)
            }
        } catch (error) {
            console.error("Erreur lors du chargement du dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const Result = await getDashboardStats()
            if (Result.data){
                setStats({
                    totalClient : Result.data.totalClient,
                    totalProduit : Result.data.totalProduit,
                    totalCommande: Result.data.totalCommande,
                    totalRevenue: Result.data.totalRevenus[0].totalRevenus
                })
            }else{
                console.log("Result.error: ", Result.error)
            }
        } catch (error) {
            console.error("Erreur lors du chargement du dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        console.log("commandeRecent mis à jour : ", commandeRecent);
        console.log("stats mis à jour : ", stats);
        console.log("top Produit mis à jour : ", topProducts);
    }, [commandeRecent,stats,topProducts]);

    const totalPaye = (montant, frais) => {
        const total = montant + frais;
       return total;
    }

    const mockStats = {
        totalProducts: 156,
        totalOrders: 342,
        totalCustomers: 289,
        totalRevenue: 12540000,
        revenueGrowth: 12.5,
        customerGrowth: 8.2,
        orderGrowth: 15.7,
        productGrowth: 5.3
    };

    const mockSalesData = [
        { mois: 'Jan', ventes: 4500000, commandes: 45 },
        { mois: 'Fév', ventes: 5200000, commandes: 52 },
        { mois: 'Mar', ventes: 4800000, commandes: 48 },
        { mois: 'Avr', ventes: 6100000, commandes: 61 },
        { mois: 'Mai', ventes: 5800000, commandes: 58 },
        { mois: 'Jun', ventes: 7300000, commandes: 73 },
        { mois: 'Jul', ventes: 6900000, commandes: 69 },
        { mois: 'Aoû', ventes: 7800000, commandes: 78 },
        { mois: 'Sep', ventes: 8200000, commandes: 82 },
        { mois: 'Oct', ventes: 9100000, commandes: 91 },
        { mois: 'Nov', ventes: 9500000, commandes: 95 },
        { mois: 'Déc', ventes: 12540000, commandes: 125 }
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
            ville: "Antananarivo"
        },
        {
            id: 2,
            reference: "CMD-2024-002",
            client: "Jean Rabe",
            email: "jean.rabe@email.com",
            montant: 89000,
            statut: "En cours",
            date: "2024-01-14",
            ville: "Toamasina"
        },
        {
            id: 3,
            reference: "CMD-2024-003",
            client: "Sophie Randria",
            email: "sophie.randria@email.com",
            montant: 156000,
            statut: "Confirmée",
            date: "2024-01-14",
            ville: "Antananarivo"
        },
        {
            id: 4,
            reference: "CMD-2024-004",
            client: "Pierre Andria",
            email: "pierre.andria@email.com",
            montant: 67000,
            statut: "En attente",
            date: "2024-01-13",
            ville: "Fianarantsoa"
        },
        {
            id: 5,
            reference: "CMD-2024-005",
            client: "Nirina Razafy",
            email: "nirina.razafy@email.com",
            montant: 234000,
            statut: "Livrée",
            date: "2024-01-13",
            ville: "Mahajanga"
        }
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
            image: "vitamineCserium.png"
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
            image: "acide.png"
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
            image: "florale.png"
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
            image: "efface.png"
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
            image: "cerave.png"
        }
    ];

    // Utiliser les données mockées en attendant les vraies données
    const data = {
        stats: mockStats,
        sales: mockSalesData,
        orders: mockRecentOrders,
        products: mockTopProducts
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
      
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'LIVREE':
                return 'badge-success';
            case 'EN_COURS':
                return 'badge-primary';
            case 'CONFIRME':
                return 'badge-info';
            case 'EN_ATTENTE_PAIEMENT':
                return 'badge-warning';
            case 'ANNULEE':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    };

    const getStockColor = (stock) => {
        if (stock >= 10) return 'badge-success';
        if (stock > 0 && stock < 10) return 'badge-warning';
        if (stock === 0) return 'badge-error';
        return 'badge-info';
    };
    
    const getStatutStock = (stock) => {
        if (stock >= 10) return 'En stock';
        if (stock > 0 && stock < 10) return 'stock faible';
        if (stock === 0) return 'Rupture';
        return '...';
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <div className="skeleton h-8 w-48"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-32"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="skeleton h-80"></div>
                    <div className="skeleton h-80"></div>
                </div>
                <div className="skeleton h-96"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-1">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Produits */}
                <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Produits
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalProduit}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                data.stats.productGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.stats.productGrowth >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(data.stats.productGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commandes */}
                <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <ShoppingCart className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Commandes
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalCommande}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                data.stats.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.stats.orderGrowth >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(data.stats.orderGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clients */}
                <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Clients
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalClient}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                data.stats.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.stats.customerGrowth >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(data.stats.customerGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenu */}
                <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Revenu Total
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                data.stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {data.stats.revenueGrowth >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(data.stats.revenueGrowth)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques et Commandes Récentes */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Graphique des ventes */}
                <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                        <h3 className="card-title text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Évolution des Ventes
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.sales}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis 
                                        dataKey="mois" 
                                        stroke={theme === "dark" ? "#94a3b8" : "#475569"}
                                    />
                                    <YAxis 
                                        stroke={theme === "dark" ? "#94a3b8" : "#475569"}
                                        tickFormatter={(value) => `${value / 1000000}M`}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => [
                                            name === 'ventes' ? formatCurrency(value) : value,
                                            name === 'ventes' ? 'Ventes' : 'Commandes'
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
                <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                        <h3 className="card-title text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Commandes Récentes
                        </h3>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {commandeRecent.map((order) => (
                                <div key={order[0].refCommande} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {(order[0].client.nomClient.split(' ').map(n => n[0]).join('')).toUpperCase() || " "} 
                                                {(order[0].client.prenomClient.split(' ').map(n => n[0]).join('')).toUpperCase() || " "}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {order[0].client.nomClient + " " + order[0].client.prenomClient  || " "}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {order[0].refCommande  || " "}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {order[0].adresseLivraison.ville || " "} - {order[0].adresseLivraison.quartier || " "}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(totalPaye(parseFloat(order.montant),parseFloat(order[0].fraisLivraison)))}
                                        </p>
                                        <div className={`badge badge-sm ${getStatusColor(order[0].statutCommande || "LIVREE")} mt-1`}>
                                            {order[0].statutCommande}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {
                                            // formatDate(order[0].dateCommande)
                                             console.log(order[0].dateCommande)}
                                             androany
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Produits populaires */}
            <div className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="card-body">
                    <h3 className="card-title text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Produits les Plus Vendus
                    </h3>
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
                                    <tr key={product.numProduit} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img 
                                                            src={`/image/${product.imageUrlProduit}`}
                                                            alt={product.nomProduit}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {product.nomProduit}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {product.descriptionProduit}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(product.prixProduit)}
                                        </td>
                                        <td>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {product.stockProduit}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {product.total_ventes}
                                            </span>
                                        </td>
                                        
                                        <td>
                                            <div className={`badge ${getStockColor(product.stockProduit)}`}>
                                                {getStatutStock(product.stockProduit)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="btn btn-ghost btn-sm text-green-600 hover:text-green-700">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="btn btn-ghost btn-sm text-red-600 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
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
        </div>
    );
};

export default DashboardPage;
// import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// import { useTheme } from "../../hooks/use-theme";

// import { overviewData, recentSalesData, topProducts } from "../../constants";

// import { Footer } from "../../layouts/footer";

// import { CreditCard, DollarSign, Package, PencilLine, Star, Trash, TrendingUp, Users } from "lucide-react";

// const DashboardPage = () => {
//     const { theme } = useTheme();

//     return (
//         <div className="flex flex-col gap-y-4">
//             <h1 className="title">Dashboard</h1>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                <div className="card">
//                     <div className="card-header">
//                         <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
//                             <Package size={26} />
//                         </div>
//                         <p className="card-title">Total Products</p>
//                     </div>
//                     <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
//                         <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">25,154</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
//                             <TrendingUp size={18} />
//                             25%
//                         </span>
//                     </div>
//                 </div> 
//                 <div className="card">
//                     <div className="card-header">
//                         <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
//                             <DollarSign size={26} />
//                         </div>
//                         <p className="card-title">Total Paid Orders</p>
//                     </div>
//                     <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
//                         <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">$16,000</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
//                             <TrendingUp size={18} />
//                             12%
//                         </span>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <div className="card-header">
//                         <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
//                             <Users size={26} />
//                         </div>
//                         <p className="card-title">Total Customers</p>
//                     </div>
//                     <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
//                         <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">15,400k</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
//                             <TrendingUp size={18} />
//                             15%
//                         </span>
//                     </div>
//                 </div>
//                 <div className="card">
//                     <div className="card-header">
//                         <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
//                             <CreditCard size={26} />
//                         </div>
//                         <p className="card-title">Sales</p>
//                     </div>
//                     <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
//                         <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">12,340</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
//                             <TrendingUp size={18} />
//                             19%
//                         </span>
//                     </div>
//                 </div>
//             </div>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
//                 <div className="card col-span-1 md:col-span-2 lg:col-span-4">
//                     <div className="card-header">
//                         <p className="card-title">Overview</p>
//                     </div>
//                     <div className="card-body p-0">
//                         <ResponsiveContainer
//                             width="100%"
//                             height={300}
//                         >
//                             <AreaChart
//                                 data={overviewData}
//                                 margin={{
//                                     top: 0,
//                                     right: 0,
//                                     left: 0,
//                                     bottom: 0,
//                                 }}
//                             >
//                                 <defs>
//                                     <linearGradient
//                                         id="colorTotal"
//                                         x1="0"
//                                         y1="0"
//                                         x2="0"
//                                         y2="1"
//                                     >
//                                         <stop
//                                             offset="5%"
//                                             stopColor="#2563eb"
//                                             stopOpacity={0.8}
//                                         />
//                                         <stop
//                                             offset="95%"
//                                             stopColor="#2563eb"
//                                             stopOpacity={0}
//                                         />
//                                     </linearGradient>
//                                 </defs>
//                                 <Tooltip
//                                     cursor={false}
//                                     formatter={(value) => `$${value}`}
//                                 />

//                                 <XAxis
//                                     dataKey="name"
//                                     strokeWidth={0}
//                                     stroke={theme === "light" ? "#475569" : "#94a3b8"}
//                                     tickMargin={6}
//                                 />
//                                 <YAxis
//                                     dataKey="total"
//                                     strokeWidth={0}
//                                     stroke={theme === "light" ? "#475569" : "#94a3b8"}
//                                     tickFormatter={(value) => `$${value}`}
//                                     tickMargin={6}
//                                 />

//                                 <Area
//                                     type="monotone"
//                                     dataKey="total"
//                                     stroke="#2563eb"
//                                     fillOpacity={1}
//                                     fill="url(#colorTotal)"
//                                 />
//                             </AreaChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </div>
//                 <div className="card col-span-1 md:col-span-2 lg:col-span-3">
//                     <div className="card-header">
//                         <p className="card-title">Recent Sales</p>
//                     </div>
//                     <div className="card-body h-[300px] overflow-auto p-0">
//                         {recentSalesData.map((sale) => (
//                             <div
//                                 key={sale.id}
//                                 className="flex items-center justify-between gap-x-4 py-2 pr-2"
//                             >
//                                 <div className="flex items-center gap-x-4">
//                                     <img
//                                         src={sale.image}
//                                         alt={sale.name}
//                                         className="size-10 flex-shrink-0 rounded-full object-cover"
//                                     />
//                                     <div className="flex flex-col gap-y-2">
//                                         <p className="font-medium text-slate-900 dark:text-slate-50">{sale.name}</p>
//                                         <p className="text-sm text-slate-600 dark:text-slate-400">{sale.email}</p>
//                                     </div>
//                                 </div>
//                                 <p className="font-medium text-slate-900 dark:text-slate-50">${sale.total}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//             <div className="card"> 
//                  <div className="card-header">
//                     <p className="card-title">Top Orders</p>
//                 </div>
//                 <div className="card-body p-0">
//                     <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="table">
//                             <thead className="table-header">
//                                 <tr className="table-row">
//                                     <th className="table-head">#</th>
//                                     <th className="table-head">Product</th>
//                                     <th className="table-head">Price</th>
//                                     <th className="table-head">Status</th>
//                                     <th className="table-head">Rating</th>
//                                     <th className="table-head">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="table-body">
//                                 {topProducts.map((product) => (
//                                     <tr
//                                         key={product.number}
//                                         className="table-row"
//                                     >
//                                         <td className="table-cell">{product.number}</td>
//                                         <td className="table-cell">
//                                             <div className="flex w-max gap-x-4">
//                                                 <img
//                                                     src={product.image}
//                                                     alt={product.name}
//                                                     className="size-14 rounded-lg object-cover"
//                                                 />
//                                                 <div className="flex flex-col">
//                                                     <p>{product.name}</p>
//                                                     <p className="font-normal text-slate-600 dark:text-slate-400">{product.description}</p>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="table-cell">${product.price}</td>
//                                         <td className="table-cell">{product.status}</td>
//                                         <td className="table-cell">
//                                             <div className="flex items-center gap-x-2">
//                                                 <Star
//                                                     size={18}
//                                                     className="fill-yellow-600 stroke-yellow-600"
//                                                 />
//                                                 {product.rating}
//                                             </div>
//                                         </td>
//                                         <td className="table-cell">
//                                             <div className="flex items-center gap-x-4">
//                                                 <button className="text-blue-500 dark:text-blue-600">
//                                                     <PencilLine size={20} />
//                                                 </button>
//                                                 <button className="text-red-500">
//                                                     <Trash size={20} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                  </div>
//             </div>
//             <Footer />
//         </div>
//     );
// };

// export default DashboardPage;
