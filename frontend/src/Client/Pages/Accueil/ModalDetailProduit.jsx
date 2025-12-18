import React, { useState ,useEffect} from "react";
import { X, ShoppingCart, Heart, Star, Package, TrendingUp, Info } from "lucide-react";
import { usePanier } from "@/Client/context/PanierContext";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Produit from "../Produit/Produit";

const ModalDetailProduit = ({ product, isOpen, onClose }) => {
    
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const {ajoutePanierModal,getQuantite} = usePanier()
    const [quantity, setQuantity] = useState(1);
       const [open, setOpen] = useState(false);
        const [message, setMessage] = useState({
            ouvre: false,
            texte: "vide",
            statut: "success",
        });

    useEffect(() => { 
        if (product && product.numProduit) {
            setQuantity(getQuantite(product.numProduit))
        } else {
            setQuantity(1); 
        }
    }, [product, getQuantite]);

    if (!isOpen || !product) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(amount);
    };

    console.log(product)

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const getStockInfo = (stock) => {
        if (stock >= 10) return { 
            text: 'En stock', 
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            icon: '✓'
        };
        if (stock > 0) return { 
            text: 'Stock limité', 
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            icon: '⚠'
        };
        return { 
            text: 'Rupture de stock', 
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            icon: '✕'
        };
    };

    const stockInfo = getStockInfo(product.stockProduit);

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= product.stockProduit) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        
        console.log(`Ajout de ${quantity} ${product.nomProduit} au panier`);
        const prod = {
            id: product.numProduit,
            nom: product.nomProduit,
            prix:product.prixProduit,
            image: product.imageUrlProduit,
            description: product.descriptionProduit,
            stock: product.stockProduit,
            quantite: quantity
        }
        ajoutePanierModal(prod)
        setMessage({
            ouvre: true,
            texte: `Le produit ${product.nomProduit} est ajouté au panier!`,
            statut: "info",
        });
        setOpen(true);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        console.log(`Produit ${isFavorite ? 'retiré des' : 'ajouté aux'} favoris`);
        
    };

    // Images du produit (pour la galerie)
    const productImages = [
        `/image/${product.imageUrlProduit}`,
        `/image/${product.imageUrlProduit}`, // Dupliquer si vous n'avez qu'une image
    ];

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={onClose}
            />
            {/* modal message */}
             {message.ouvre && (
                                    <Snackbar
                                        open={open}
                                        autoHideDuration={5000}
                                        onClose={handleClose}
                                        
                                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div 
                    className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
                    >
                        <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                        {/* Left Column - Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-xl">
                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.nomProduit}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Favorite Button */}
                                <button
                                    onClick={toggleFavorite}
                                    className={`absolute top-4 left-4 p-3 rounded-full shadow-lg transition-all duration-300 ${
                                        isFavorite 
                                            ? 'bg-pink-500 text-white scale-110' 
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110'
                                    }`}
                                >
                                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>

                                {/* Stock Badge */}
                                <div className={`absolute top-4 right-4 ${stockInfo.bgColor} ${stockInfo.color} px-4 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2`}>
                                    <span>{stockInfo.icon}</span>
                                    <span>{stockInfo.text}</span>
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {productImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                            selectedImage === index 
                                                ? 'border-blue-500 scale-110 shadow-lg' 
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.nomProduit} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="space-y-6">
                            {/* Product Name */}
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {product.nomProduit}
                                </h2>
                                
                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className="h-5 w-5 fill-yellow-400 text-yellow-400" 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        (4.9/5) · {product.total_ventes || 0} ventes
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prix</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {formatCurrency(product.prixProduit)}
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Description
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {product.descriptionProduit || "Aucune description disponible pour ce produit."}
                                </p>
                            </div>

                            {/* Product Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Stock
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {product.stockProduit}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">unités disponibles</p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Ventes
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {product.total_ventes || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">produits vendus</p>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Quantité
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-bold text-xl"
                                    >
                                        -
                                    </button>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stockProduit}
                                        className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stockProduit === 0}
                                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        <ShoppingCart className="h-5 w-5" />
                                        <span>Ajouter au panier</span>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>

                                <button
                                    onClick={toggleFavorite}
                                    className={`sm:w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
                                        isFavorite 
                                            ? 'bg-pink-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Additional Info */}
                            {product.dateMisAJourProduit && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Dernière mise à jour: {new Date(product.dateMisAJourProduit).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles pour les animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </>
    );
};

export default ModalDetailProduit;