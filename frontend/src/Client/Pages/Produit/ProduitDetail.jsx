import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, ArrowLeft, Star, Truck, Shield, RefreshCw, TrendingUp, Package, Users, CheckCircle } from 'lucide-react';
import { usePanier } from '../../context/PanierContext'; 
import { useLocation, useNavigate } from "react-router-dom"
import { ProduitSimulaire } from "@/services/produitService";

const ProduitDetail = () => {;
    const location = useLocation();
    const navigate = useNavigate();
    const [produit,setProduit] = useState(location.state);
    const id =  produit.id
    const imagePath = `/image/${produit.image}`;
    const defaultImage = "/image/image.png";
    const { ajouteAuPanier, PlusQuantite, MoinsQuantite, getQuantite, items } = usePanier();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [loading, setLoading] = useState(false);
    const [quantite, setQuantite] = useState(1);
    const [produitsSimilaires, setProduitsSimilaires] = useState([]);
    const [messageAjout, setMessageAjout] = useState('');
    const [estDansPanier, setEstDansPanier] = useState(false);
    const [quantitePanier, setQuantitePanier] = useState(0);

    useEffect(() => {
        // Initialiser la quantité depuis le panier si produit déjà présent
        const quantiteDansPanier = getQuantite(parseInt(id));
        setQuantite(quantiteDansPanier);
        
        const produitDansPanier = items.find(item => item.id === parseInt(id));
        setEstDansPanier(!!produitDansPanier);
        setQuantitePanier(produitDansPanier ? produitDansPanier.quantite : 0);
        
        fetchProduitsSimilaires();
    }, [id, items]);

    console.log("produit recue: ",produit)

    useEffect(() => {
        if (location.state) {
            setProduit(location.state);
            window.scrollTo(0, 0);
        }
      }, [location.state]);

    const fetchProduitsSimilaires = async () => {
    setLoading(true);
        try {
            const data = {
                codeCategorie: produit.idCategory.codeCategorie,
                numProduit: produit.id,
            }
            const donnes = await ProduitSimulaire(data);
            if (donnes){
                console.log(donnes.data)
                setProduitsSimilaires(donnes.data);
            }else{
                setMessage({
                    ouvre: true,
                    texte: donnes.error,
                    statut: donnes.statut,
                });
                setOpen(true);
                setProduitsSimilaires([]);
            }
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setMessage({
                ouvre: true,
                texte: "Une erreur s'est produit , veuillez attendre quelque minute",
                statut: "error",
            });
        } finally {
            setLoading(false); 
        }
    };

    const handleAjouterAuPanier = () => {
        if (produit.stock > 0) {
            const produitAvecQuantite = {
                ...produit,
                quantite: quantite
            };
            
            ajouteAuPanier(produitAvecQuantite);
            
            // Afficher message de confirmation
            setMessageAjout(`${quantite} ${produit.nom} ajouté(s) au panier !`);
            setEstDansPanier(true);
            setQuantitePanier(quantite);
            
            // Cacher le message après 3 secondes
            setTimeout(() => {
                setMessageAjout('');
            }, 3000);
        }
    };

    const handleIncrementerPanier = () => {
        if (estDansPanier && quantitePanier < produit.stock) {
            PlusQuantite(produit.id, produit.stock, quantitePanier);
            setQuantitePanier(prev => prev + 1);
            setQuantite(prev => prev + 1);
        } else if (!estDansPanier && quantite < produit.stock) {
            setQuantite(quantite + 1);
        }
    };

    const handleDecrementerPanier = () => {
        if (estDansPanier && quantitePanier > 1) {
            MoinsQuantite(produit.id);
            setQuantitePanier(prev => prev - 1);
            setQuantite(prev => prev - 1);
        } else if (!estDansPanier && quantite > 1) {
            setQuantite(quantite - 1);
        } else if (estDansPanier && quantitePanier === 1) {
            // Supprimer du panier si quantité devient 0
            setEstDansPanier(false);
            setQuantitePanier(0);
            setQuantite(1);
        }
    };

    const formatPrix = (amount) => {
        return new Intl.NumberFormat("fr-MG", {
            style: "currency",
            currency: "MGA",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const afficheAutreProduit = (prod) => {
         navigate("/produitDetail", { state:  prod})
    }
    const calculerPourcentageVentes = (ventes) => {
        const maxVentes = 100;
        return Math.min((ventes / maxVentes) * 100, 100);
    };

    const calculerStockDisponible = () => {
        const produitDansPanier = items.find(item => item.id === parseInt(id));
        const quantiteReservee = produitDansPanier ? produitDansPanier.quantite : 0;
        return produit.stock - quantiteReservee;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-2 pb-8 px-2">
            <div className="">
                {/* Bouton retour */}
                <button
                    onClick={() => navigate("/Produit")}
                    className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Retour aux produits
                </button>

                {/* Message de confirmation */}
                {messageAjout && (
                    <div className="mb-6 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                        <CheckCircle className="h-5 w-5" />
                        {messageAjout}
                    </div>
                )}

                

                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Section image */}
                    {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"> */}
                    <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 self-start">
                        <div className="relative">
                            {/* Badge best-seller */}
                            {produit.ventes > 10 && (
                                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                                    BEST-SELLER
                                </div>
                            )}
                            
                            <div className="aspect-square overflow-hidden rounded-xl mb-4">
                                <img
                                     src={imagePath}
                                     alt={produit.nom}
                                     onError={(e) => {
                                         e.target.onerror = null;
                                         e.target.src = defaultImage;
                                     }}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                        
                        {/* Badge promo */}
                        {produit.codePromo && (
                            <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-3">
                                PROMO: {produit.codePromo}
                            </div>
                        )}

                        {/* Statistiques de vente */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-gray-900 dark:text-white">Popularité</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {produit.ventes}
                                </span>
                            </div>
                            
                            {/* Barre de progression */}
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                                <div 
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                                    style={{ width: `${calculerPourcentageVentes(produit.ventes)}%` }}
                                ></div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {produit.ventes} unités vendues
                            </p>
                        </div>
                    </div>

                    {/* Section informations */}
                    {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"> */}
                    <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        {/* Catégorie */}
                        <div className="mb-4 flex items-center justify-between">
                            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                                {produit.idCategory.libelleCategorie}
                            </span>
                            
                            {/* Étoiles de popularité */}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star}
                                        className={`h-4 w-4 ${
                                            star <= Math.min(Math.floor(produit.ventes / 10), 5)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    />
                                ))}
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    ({produit.ventes} ventes)
                                </span>
                            </div>
                        </div>

                        {/* Nom du produit */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {produit.nom}
                        </h1>

                        {/* Prix et indicateur de vente */}
                        <div className="mb-6 flex items-end justify-between">
                            <div>
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                    {formatPrix(produit.prix)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">MGA</span>
                            </div>
                            
                            {/* Indicateur de disponibilité */}
                            <div className="text-right">
                                <div className="flex items-center gap-2">
                                    {produit.stock > 0 ? (
                                        <>
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                {calculerStockDisponible()} disponibles
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                                            <span className="text-red-600 dark:text-red-400 font-medium">
                                                Épuisé
                                            </span>
                                        </>
                                    )}
                                </div>
                                {estDansPanier && produit.stock > 0 && (
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                        {quantitePanier} dans votre panier
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Description
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {produit.description}
                            </p>
                            <p className="mt-4 text-gray-700 dark:text-gray-300">
                                {produit.idCategory.descriptionCategorie}
                            </p>
                        </div>

                        {/* Statistiques avancées */}
                        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock total</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {produit.stock}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Ventes totales</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {produit.ventes}
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Taux de vente</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {produit.ventes > 0 ? Math.round((produit.ventes / (produit.stock + produit.ventes)) * 100) : 0}%
                                </p>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Votre panier</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {quantitePanier}
                                </p>
                            </div>
                        </div>

                        {/* Sélecteur quantité */}
                        {produit.stock > 0 && (
                            <div className="mb-8">
                                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                                    Quantité {estDansPanier && "(dans panier)"}
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                        <button
                                            onClick={handleDecrementerPanier}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantite <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 text-gray-900 dark:text-white font-medium min-w-[60px] text-center">
                                            {quantite}
                                        </span>
                                        <button
                                            onClick={handleIncrementerPanier}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={quantite >= produit.stock || (estDansPanier && quantitePanier >= produit.stock)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Maximum: {produit.stock}
                                        </span>
                                        {estDansPanier && (
                                            <div className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                <ShoppingCart className="h-4 w-4" />
                                                Déjà {quantitePanier} dans le panier
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            {produit.stock > 0 ? (
                                <>
                                    <button
                                        onClick={handleAjouterAuPanier}
                                        disabled={quantite > produit.stock}
                                        className={`flex-1 flex items-center justify-center gap-3 font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                                            estDansPanier 
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        {estDansPanier ? 'Mettre à jour le panier' : 'Ajouter au panier'} ({quantite})
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleAjouterAuPanier();
                                            navigate('/passerCommande');
                                        }}
                                        className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 font-semibold py-4 px-6 rounded-xl transition-colors"
                                    >
                                        Acheter maintenant
                                    </button>
                                </>
                            ) : (
                                <div className="w-full">
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-red-500 text-gray-900 font-semibold py-4 px-6 rounded-xl cursor-not-allowed shadow-lg"
                                    >
                                        <AlertCircle className="h-5 w-5" />
                                        Épuisé - {produit.ventes} ventes réalisées
                                    </button>
                                    <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                                        Ce produit a été très populaire ! Réapprovisionnement prévu bientôt.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Livraison gratuite</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Dès 2 000 Ar</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Paiement sécurisé</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Garantie 100%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Retours faciles</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Sous 30 jours</p>
                                </div>
                            </div>
                        </div>
                        {/* Indicateur produit dans panier */}
                        {estDansPanier && (
                            
                            <div className="flex justify-center p-4 mt-2 rounded-xl text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
                                <ShoppingCart className="h-5 w-5" />
                                Ce produit est déjà dans votre panier ({quantitePanier} unité{quantitePanier > 1 ? 's' : ''})
                            </div>
                        )}
                    </div>
                </div>

                {/* Section produits similaires */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Produits similaires (même catégorie)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {produitsSimilaires.map((produitSim) => {
                            const estDansPanierSim = items.find(item => item.id === produitSim.id);
                            const quantitePanierSim = estDansPanierSim ? estDansPanierSim.quantite : 0;
                            
                            return (
                                <div 
                                    key={produitSim.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                                    onClick={() => afficheAutreProduit(produitSim)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {produitSim.nom}
                                        </h3>
                                        <div className="flex gap-2">
                                            {produitSim.ventes > 20 && (
                                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                                                    Populaire
                                                </span>
                                            )}
                                            {estDansPanierSim && (
                                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                                    {quantitePanierSim} dans panier
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {formatPrix(produitSim.prix)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {produitSim.ventes} ventes
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Disponibilité</span>
                                            <span className={produitSim.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {produitSim.stock > 0 ? `${produitSim.stock} unités` : 'Épuisé'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProduitDetail;
