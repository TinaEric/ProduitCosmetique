import { TrendingUp,AlertCircle, Eye, Heart, ShoppingCart, TrendingDown } from "lucide-react";
import React, { useState } from "react";

const CartProduit = ({ product,addPanier, onInfos ,onDispo,img}) => {
    const [hoveredProduct, setHoveredProduct] = useState(null);

    const getStockBadge = (stock) => {
        if (stock >= 10) return { text: "En stock", class: "bg-green-500" };
        if (stock > 0) return { text: "Stock limité", class: "bg-orange-500" };
        return { text: "Rupture", class: "bg-red-500" };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-MG", {
            style: "currency",
            currency: "MGA",
            minimumFractionDigits: 0,
        }).format(amount);
    };
    const imagePath = `/image/${product.image}`;
    const defaultImage = "/image/image.png";
    const stockBadge = getStockBadge(product.stock);
    const index = product.id
    return (
        //  max-h-[30rem] w-[150px]
        <div
            key={product.id}
            className="group relative mx-5 my-3 max-h-[30rem] w-[200px]"
            onMouseEnter={() => setHoveredProduct(index)}
            onMouseLeave={() => setHoveredProduct(null)}
        >
            {/* Ranking Badge */}
            <div className="absolute -left-3 -top-3 z-20">
                <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg dark:border-gray-800 ">
                    <span className="text-lg font-bold text-white">#{index + 1}</span>
                </div>
            </div>

            {/* Product Card */}
            <div className="relative h-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Image Container h-64  h-[130px] w-[150px]*/}
                <div className="relative  h-[150px] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        onClick={() => onInfos(product)}
                        src={imagePath}
                        alt={product.nom}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                        }}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Stock Badge */}
                    <div className={`absolute right-4 top-4 ${stockBadge.class} rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg`}>
                        {stockBadge.text}
                    </div>

                    {/* Overlay Actions */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 ${hoveredProduct === index ? "opacity-100" : "opacity-0"}`}
                    >
                        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                            <button
                                onClick={() => onInfos(product)}
                                className="flex transform items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white"
                            >
                                <Eye className="h-4 w-4" />
                                <span className="text-sm font-medium">Voir</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3 p-4">
                    {/* Product Name */}
                    <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{product.nom}</h3>

                    {/* Description */}
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{product.description}</p>

                    {/* Sales Info */}
                    { product.ventes === 0 ? (
                        <div className="flex items-center text-red-500 gap-2 text-sm ">
                            <TrendingDown className="h-4 w-4 " />
                            <span className="font-medium">{product.ventes || 0} Vente</span>
                        </div>
                    ):(
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{product.ventes || 0} Ventes</span>
                        </div>
                    )}

                    {/* Price and Action */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                        <div>
                            <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent ">
                                {formatCurrency(product.prix)}
                            </p>
                        </div>
                        {product.stock > 0 ? (
                        <button
                            onClick={() => addPanier(product)}
                            className="flex transform items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#1E40AF] hover:to-pink-700 hover:shadow-xl "
                        >
                           +  <ShoppingCart className="h-4 w-4" />
                        </button>
                         ) : (
                             <button
                                onClick={() => onDispo(product.nom)}
                                className="flex transform items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-red-500 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-300 hover:to-red-400 hover:shadow-xl dark:from-amber-500 dark:to-red-600 "
                             >
                              <AlertCircle className="h-4 w-4" /> Épuisé
                            </button>
                         )}
                    </div>
                </div>

                {/* Shine Effect */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
                </div>
            </div>
             {/* Styles CSS pour les animations */}
             <style jsx>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(2deg);
                    }
                }

                @keyframes pulse-slow {
                    0%,
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.9;
                        transform: scale(1.02);
                    }
                }

                @keyframes scroll-single {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(calc(-50% - 24px));
                    }
                }

                .animate-scroll-single {
                    animation: scroll-single 45s linear infinite;
                    animation-play-state: running;
                }

                /* Pause l'animation au hover */
                .animate-scroll-single:hover {
                    animation-play-state: paused;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .animate-scroll-single {
                        animation-duration: 30s;
                    }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
export default CartProduit;
