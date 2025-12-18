import { Link } from "react-router-dom";
import home from "../../../image/home.png";
import { FaCartShopping, FaArrowDown, FaStar, FaFire } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { TrendingUp, Eye, Heart, ShoppingCart } from "lucide-react";
import { getTopProducts, getAllProduit } from "@/services/ClientService";
import { usePanier } from "@/Client/context/PanierContext";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";
import prod1 from "@/image/prod1.png";
import prod2 from "@/image/prod2.png";
import cerave from "@/image/cerave.png";
import ModalDetailProduit from "./ModalDetailProduit";

export default function Home() {
     const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [currentCatalogueIndex, setCurrentCatalogueIndex] = useState(0);
    const [topProducts, setTopProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { ajouteAuPanier } = usePanier();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [productImages, setProductImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true); 
    const loadAllProductImages = async () => {
        try {
            setIsLoadingImages(true);
            const response = await getAllProduit();
            if (response.data) {
                console.log(response.data.allProduit);
                setProductImages(response.data.allProduit);
            } else {
                console.log(response);
                setProductImages([
                    ...catalogueImages,
                    { src: prod1, title: "Soin Visage" },
                    { src: prod2, title: "Maquillage" },
                    { src: cerave, title: "Crème Corps" },
                ]);
            }
        } catch (error) {
            console.error("Erreur chargement images:", error);
        } finally {
            setIsLoadingImages(false);
        }
    };

    // Images du catalogue
    const catalogueImages = [
        { src: prod1, title: "Soins Visage", description: "Naturels & Doux" },
        { src: prod2, title: "Maquillage", description: "Éclat Naturel" },
        { src: cerave, title: "Corps & Bain", description: "Détente Absolue" },
        { src: prod2, title: "Cheveux", description: "Brillance Naturelle" },
        { src: prod1, title: "Parfums", description: "Fragrances Uniques" },
        { src: prod2, title: "Accessoires", description: "Élégance & Style" },
    ];

    useEffect(() => {
        setIsVisible(true);
        loadTopProducts();
        loadAllProductImages();
        // Animation automatique du carrousel
        const interval = setInterval(() => {
            setCurrentCatalogueIndex((prev) => (prev === catalogueImages.length - 1 ? 0 : prev + 1));
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const loadTopProducts = async () => {
        try {
            setLoadingProducts(true);
            const result = await getTopProducts();
            if (result.data) {
                setTopProducts(result.data.topProduit.slice(0, 5));
            }
        } catch (error) {
            console.error("Erreur chargement top produits:", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    // Fonction pour ouvrir le modal
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const addpanier = (product) => {
        console.log(`Ajout  ${product.nomProduit} au panier`);
        const prod = {
            id: product.numProduit,
            nom: product.nomProduit,
            prix: product.prixProduit,
            image: product.imageUrlProduit,
            description: product.descriptionProduit,
            stock: product.stockProduit,
            quantite: 1,
        };
        ajouteAuPanier(prod);
        setMessage({
            ouvre: true,
            texte: `Le produit ${product.nomProduit} est ajouté au panier!`,
            statut: "info",
        });
        setOpen(true);
    };

    // Fonction pour fermer le modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-MG", {
            style: "currency",
            currency: "MGA",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStockBadge = (stock) => {
        if (stock >= 10) return { text: "En stock", class: "bg-green-500" };
        if (stock > 0) return { text: "Stock limité", class: "bg-orange-500" };
        return { text: "Rupture", class: "bg-red-500" };
    };

    return (
        <div
            id="Home"
            className="relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden bg-[#EDECF2] text-black dark:bg-[#0E121E] dark:text-white"
        >
            {/* Section principale */}
            <div className="flex flex-col-reverse items-center justify-center pb-5 pt-14 md:flex-row">
                <div
                    className={`flex flex-col transition-all duration-1000 ease-out ${
                        isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
                    }`}
                >
                    <h1 className="mt-4 text-center text-5xl font-bold md:mt-0 md:text-left md:text-6xl">
                        Produit de qualité, <br /> 100% Naturels avec Ma<span className=" font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Beauté</span>
                    </h1>

                    <p className="text-md my-4 text-gray-800 dark:text-gray-200 text-center md:text-left">
                        Découvrez notre univers beauté: <br />
                        raffinée de cosmétiques naturels, innovants
                        <br /> et éthiques, pensés pour sublimer chaque peau.
                    </p>

                <Link
                        to="/Produit"
                        className="group relative mb-5 inline-flex items-center justify-center p-[2px] md:w-fit transition-transform duration-100 hover:scale-105"
                        >
                        <span className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600"></span>
                        <span className="relative flex items-center gap-2 rounded-3xl px-6 py-2 transition-all duration-100 
                            bg-[#EDECF2] dark:bg-[#0f172a] 
                            group-hover:bg-transparent"
                        >
                            <span className="font-bold transition-colors duration-100
                            bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent 
                            group-hover:text-white"
                            >
                            Commandez Maintenant
                            </span>
                            <FaCartShopping className="transition-all duration-100 text-purple-600 group-hover:text-white group-hover:scale-110" />
                        </span>
                        </Link>
                </div> 
            <div className="md:ml-60">
                <img
                    src={home}
                    alt=""
                    className={`h-96 w-96 border-8 border-transparent object-cover shadow-xl transition-all duration-1000 ease-out ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
                    style={{
                        borderRadius: "30% 70% 70% 30% / 67% 62% 38% 33%",
                        backgroundImage: "linear-gradient(var(--img-bg-color), var(--img-bg-color)), linear-gradient(to right, #2563eb, #9333ea)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "content-box, border-box",
                    }}
                />
            </div>
            </div>

            {/* Section Catalogue Animée */}
            <div
                className={`mx-auto w-full max-w-6xl py-1 transition-all delay-500 duration-1000 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
            >
                <h2 className="mb-4 text-center text-4xl font-bold">
                    Explorez Notre <span className=" font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Produit</span>
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600 dark:text-gray-400">
                    Découvrez notre collection exclusive de produits de beauté naturels, soigneusement sélectionnés pour votre bien-être.
                </p>

                {/* Section Galerie Produits Défilante - MODIFIÉE */}
                <div
                    className={`w-full overflow-hidden py-5 transition-all delay-700 duration-1000 ${
                        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                >
                    {isLoadingImages ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des produits...</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Une seule ligne qui défile */}
                            <div className="animate-scroll-single flex space-x-6 py-4">
                                {[...productImages, ...productImages].map((product, index) => {
                                     const stockBadge = getStockBadge(product.stockProduit);
                                     return(
                                    <div
                                        key={`gallery-${index}-${product.numProduit}`}
                                        className="group relative flex-shrink-0 max-w-[200px] transform cursor-pointer overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-2xl"
                                    >
                                            {/* Ranking Badge */}
                                        <div className="absolute -left-3 -top-3 z-20">
                                            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg dark:border-gray-800 dark:from-blue-400 dark:to-purple-400">
                                                <span className="text-lg font-bold text-white">#{index + 1}</span>
                                            </div>
                                        </div>

                                        {/* Product Card */}
                                        <div className="relative h-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                                            {/* Image Container */}
                                            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                <img
                                                    src={`/image/${product.imageUrlProduit}`}
                                                    alt={product.nomProduit}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />

                                                {/* Stock Badge */}
                                                <div
                                                    className={`absolute right-4 top-4 ${stockBadge.class} rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg`}
                                                >
                                                    {stockBadge.text}
                                                </div>

                                                {/* Overlay Actions */}
                                                <div
                                                    className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 ${hoveredProduct === index ? "opacity-100" : "opacity-0"}`}
                                                >
                                                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleViewProduct(product)}
                                                            className="flex transform items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Voir</span>
                                                        </button>

                                                        <button className="flex h-10 w-10 transform items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white">
                                                            <ShoppingCart className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="space-y-3 p-4">
                                                {/* Product Name */}
                                                <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold text-gray-900 dark:text-white">
                                                    {product.nomProduit}
                                                </h3>

                                                {/* Description */}
                                                {/* <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{product.stockProduit}</p> */}

                                                {/* Sales Info */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium">{product.stockProduit || 0} stocks</span>
                                                </div>

                                                {/* Price and Action */}
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                                                    <div>
                                                        <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent ">
                                                            {formatCurrency(product.prixProduit)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => addpanier(product)}
                                                        className="flex transform items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#1E40AF] hover:to-pink-700 hover:shadow-xl "
                                                    >
                                                       +  <ShoppingCart className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Shine Effect */}
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
                                            </div>
                                        </div>
                                    </div> 
                                     )
                                })}
                            </div>

                            {/* Overlay gradient pour effet de fondu */}
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#EDECF2] to-transparent dark:from-[#0E121E]"></div>
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#EDECF2] to-transparent dark:from-[#0E121E]"></div>
                        </div>
                       
                    )}
                </div>
            </div>

            {/* Top 5 Produits les Plus Vendus */}
            <div
                className={`mx-auto w-full max-w-7xl px-4 py-8 transition-all delay-700 duration-1000 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="gap-2bg-gradient-to-r mb-4 inline-flex items-center rounded-full from-blue-600 to-purple-600 bg-clip-text px-4 py-2 text-orange-600 shadow-lg  dark:text-orange-400">
                        <FaFire className="h-5 w-5 animate-pulse" />
                        <span className="text-sm font-semibold">Les Plus Populaires</span>
                    </div>
                    <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ">
                            Nos Best-Sellers
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
                        Découvrez les produits préférés de nos clients. Ces articles ont conquis le cœur de milliers de personnes !
                    </p>
                </div>

                {/* Loading State */}
                {loadingProducts ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des best-sellers...</p>
                    </div>
                ) : (
                    <>
                        {/* Products Grid */}
                        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {topProducts.map((product, index) => {
                                const stockBadge = getStockBadge(product.stockProduit);
                                return (
                                    <div
                                        key={product.numProduit}
                                        className="group relative max-w-[200px]"
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
                                            {/* Image Container */}
                                            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                <img
                                                    src={`/image/${product.imageUrlProduit}`}
                                                    alt={product.nomProduit}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />

                                                {/* Stock Badge */}
                                                <div
                                                    className={`absolute right-4 top-4 ${stockBadge.class} rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg`}
                                                >
                                                    {stockBadge.text}
                                                </div>

                                                {/* Overlay Actions */}
                                                <div
                                                    className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 ${hoveredProduct === index ? "opacity-100" : "opacity-0"}`}
                                                >
                                                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleViewProduct(product)}
                                                            className="flex transform items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="text-sm font-medium">Voir</span>
                                                        </button>

                                                        {/* <button className="flex h-10 w-10 transform items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white">
                                                            <ShoppingCart className="h-5 w-5" />
                                                        </button> */}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="space-y-3 p-4">
                                                {/* Product Name */}
                                                <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold text-gray-900 dark:text-white">
                                                    {product.nomProduit}
                                                </h3>

                                                {/* Description */}
                                                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{product.descriptionProduit}</p>

                                                {/* Sales Info */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium">{product.total_ventes || 0} ventes</span>
                                                </div>

                                                {/* Price and Action */}
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                                                    <div>
                                                        <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent ">
                                                            {formatCurrency(product.prixProduit)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => addpanier(product)}
                                                        className="flex transform items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#1E40AF] hover:to-pink-700 hover:shadow-xl "
                                                    >
                                                       +  <ShoppingCart className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Shine Effect */}
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                                <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="text-center">
                            <Link
                                to="/Produit"
                                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            >
                                <span className="relative z-10">Découvrir tous nos produits</span>
                                <FaArrowDown className="relative z-10 transition-transform duration-300 group-hover:translate-y-1" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Section services */}
            <div
                className={`mb-5 flex w-full items-center justify-center gap-4 p-2 transition-all delay-300 duration-1000 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
            >
                <span>Agence Commerciale</span>
                <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
                <span>Service Client</span>
                <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
                <span>Livraison</span>
                <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
                <span>Paiement Rapide</span>
            </div>

            {/* Modal d'affichage detail produit */}
            <ModalDetailProduit
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            {/* modal message */}
            {message.ouvre && (
                <Snackbar
                    open={open}
                    autoHideDuration={1500}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
                :root {
                    --img-bg-color: #EDECF2;
                }

                .dark {
                    --img-bg-color: #0f172a; /* Votre couleur de fond sombre */
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
}


    //  {/* Conteneur image */}

//      <div className="relative h-48 w-48">
//      {/* Image */}
//      <div className="h-48 w-48 overflow-hidden rounded-xl">
//          <img
//              src={`/image/${item.imageUrlProduit}`}
//              alt={item.nomProduit}
//              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
//          />
//      </div>

//      {/* Overlay de survol avec prix */}
//      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
//          <div className="absolute inset-0 flex items-center justify-center">
//              <span className="rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white">
//                  {formatCurrency(item.prixProduit || 0)}
//              </span>
//          </div>
//      </div>

//      {/* Titre superposé en bas de l'image */}
//      <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent p-2">
//          <p className="truncate text-center text-sm font-semibold text-white">{item.nomProduit}</p>
//          <p className="mt-1 line-clamp-1 text-center text-xs text-gray-200">{item.descriptionProduit}</p>
//      </div>
//  </div>
// import { Link } from "react-router-dom";
// import home from "../../../image/home.png";
// import { FaCartShopping, FaArrowDown, FaStar, FaFire } from "react-icons/fa6";
// import { useEffect, useState } from "react";
// import { TrendingUp, Eye, Heart, ShoppingCart } from "lucide-react";
// import { getTopProducts,getAllProduit } from "@/services/ClientService";
// import { usePanier } from "@/Client/context/PanierContext";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";

// import prod1 from "@/image/prod1.png";
// import prod2 from "@/image/prod2.png";
// import cerave from "@/image/cerave.png";
// import ModalDetailProduit from "./ModalDetailProduit";

// export default function Home() {
//     const [isVisible, setIsVisible] = useState(false);
//     const [currentCatalogueIndex, setCurrentCatalogueIndex] = useState(0);
//     const [topProducts, setTopProducts] = useState([]);
//     const [loadingProducts, setLoadingProducts] = useState(true);
//     const [hoveredProduct, setHoveredProduct] = useState(null);
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const { ajouteAuPanier } = usePanier();
//     const [open, setOpen] = useState(false);
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });
// const [productImages, setProductImages] = useState([]);
// const [isLoadingImages, setIsLoadingImages] = useState(true);

// const loadAllProductImages = async () => {
//   try {
//     setIsLoadingImages(true);
//     const response = await getAllProduit();
//     if (response.data) {
//       console.log(response.data.allProduit)
//       setProductImages(response.data.allProduit);
//     } else {
//       console.log(response)
//       setProductImages([
//         ...catalogueImages,
//         { src: prod1, title: "Soin Visage" },
//         { src: prod2, title: "Maquillage" },
//         { src: cerave, title: "Crème Corps" },
//       ]);
//     }
//   } catch (error) {
//     console.error("Erreur chargement images:", error);
//   } finally {
//     setIsLoadingImages(false);
//   }
// };
//     // Images du catalogue
//     const catalogueImages = [
//         { src: prod1, title: "Soins Visage", description: "Naturels & Doux" },
//         { src: prod2, title: "Maquillage", description: "Éclat Naturel" },
//         { src: cerave, title: "Corps & Bain", description: "Détente Absolue" },
//         { src: prod2, title: "Cheveux", description: "Brillance Naturelle" },
//         { src: prod1, title: "Parfums", description: "Fragrances Uniques" },
//         { src: prod2, title: "Accessoires", description: "Élégance & Style" },
//     ];

//     useEffect(() => {
//         setIsVisible(true);
//         loadTopProducts();
//         loadAllProductImages();
//         // Animation automatique du carrousel
//         const interval = setInterval(() => {
//             setCurrentCatalogueIndex((prev) => (prev === catalogueImages.length - 1 ? 0 : prev + 1));
//         }, 4000);

//         return () => clearInterval(interval);
//     }, []);

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     const loadTopProducts = async () => {
//         try {
//             setLoadingProducts(true);
//             const result = await getTopProducts();
//             if (result.data) {
//                 setTopProducts(result.data.topProduit.slice(0, 5));
//             }
//         } catch (error) {
//             console.error("Erreur chargement top produits:", error);
//         } finally {
//             setLoadingProducts(false);
//         }
//     };

//     // Fonction pour ouvrir le modal
//     const handleViewProduct = (product) => {
//         setSelectedProduct(product);
//         setIsModalOpen(true);
//     };

//     const addpanier = (product) => {
//         console.log(`Ajout  ${product.nomProduit} au panier`);
//         const prod = {
//             id: product.numProduit,
//             nom: product.nomProduit,
//             prix: product.prixProduit,
//             image: product.imageUrlProduit,
//             description: product.descriptionProduit,
//             stock: product.stockProduit,
//             quantite: 1,
//         };
//         ajouteAuPanier(prod);
//         setMessage({
//             ouvre: true,
//             texte: `Le produit ${product.nomProduit} est ajouté au panier!`,
//             statut: "info",
//         });
//         setOpen(true);
//     };

//     // Fonction pour fermer le modal
//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setSelectedProduct(null);
//     };

//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat("fr-MG", {
//             style: "currency",
//             currency: "MGA",
//             minimumFractionDigits: 0,
//         }).format(amount);
//     };

//     const getStockBadge = (stock) => {
//         if (stock >= 10) return { text: "En stock", class: "bg-green-500" };
//         if (stock > 0) return { text: "Stock limité", class: "bg-orange-500" };
//         return { text: "Rupture", class: "bg-red-500" };
//     };

//     return (
//         <div
//             id="Home"
//             className="relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden bg-[#EDECF2] text-black dark:bg-[#0E121E] dark:text-white"
//         >
//             {/* Section principale */}
//             <div className="flex flex-col-reverse items-center justify-center pb-5 pt-14 md:flex-row">
//                 <div
//                     className={`flex flex-col transition-all duration-1000 ease-out ${
//                         isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
//                     }`}
//                 >
//                     <h1 className="mt-4 text-center text-5xl font-bold md:mt-0 md:text-left md:text-6xl">
//                         Produit de qualité, <br /> 100% Naturels avec Ma<span className="text-[#2563EB]">Beauté</span>
//                     </h1>

//                     <p className="text-md my-4 text-center md:text-left">
//                         Découvrez notre univers beauté: <br />
//                         raffinée de cosmétiques naturels, innovants
//                         <br /> et éthiques, pensés pour sublimer chaque peau.
//                     </p>

//                     <Link
//                         to="/Produit"
//                         className="btn btn-accent btn-outline mb-5 transform px-4 py-2 font-bold transition-transform duration-300 hover:scale-105 md:w-fit"
//                     >
//                         <span>Commandez Maintenant</span>
//                         <FaCartShopping className="cursor-pointer" />
//                     </Link>
//                 </div>

//                 <div className="md:ml-60">
//                     <img
//                         src={home}
//                         alt=""
//                         className={`h-96 w-96 border-8 border-[#2563EB] object-cover shadow-xl transition-all duration-1000 ease-out ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} `}
//                         style={{
//                             borderRadius: "30% 70% 70% 30% / 67% 62% 38% 33%",
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* Section Catalogue Animée */}
//             <div
//                 className={`mx-auto w-full max-w-6xl py-4 transition-all delay-500 duration-1000 ${
//                     isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//                 }`}
//             >
//                 <h2 className="mb-4 text-center text-4xl font-bold">
//                     Explorez Notre <span className="text-[#2563EB]">Produit</span>
//                 </h2>
//                 <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600 dark:text-gray-400">
//                     Découvrez notre collection exclusive de produits de beauté naturels, soigneusement sélectionnés pour votre bien-être.
//                 </p>
//               <div
//                 className={`w-full overflow-hidden py-10 transition-all delay-700 duration-1000 ${
//                   isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//                 }`}
//               >

//                 {isLoadingImages ? (
//                   <div className="flex justify-center py-8">
//                     <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
//                   </div>
//                 ) : (
//                   <div className="relative">
//                     {/* Premier défilement */}
//                     <div className="animate-scroll flex space-x-6 py-4">
//                       {productImages.map((item, index) => (
//                         <div
//                           key={`scroll1-${item.numProduit || index}`}
//                           className="group relative flex-shrink-0 transform overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
//                         >
//                           <div className="h-40 w-40 overflow-hidden">
//                             <img
//                               src={`/image/${item.imageUrlProduit}`}
//                               alt={item.nomProduit}
//                               className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
//                             />

//                           </div>
//                           {/*opacity-0 group-hover: */}
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent  transition-opacity duration-500 opacity-100">
//                             <div className="absolute bottom-2 left-3">
//                               <p className="text-sm font-semibold text-white">{item.nomProduit}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Deuxième défilement (inverse) */}
//                     <div className="animate-scroll-reverse flex space-x-6 py-4">
//                       {productImages.concat(productImages).map((item, index) => (
//                         <div
//                           key={`scroll2-${item.numProduit || index}`}
//                           className="group relative flex-shrink-0 transform overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
//                         >
//                           <div className="h-36 w-36 overflow-hidden">
//                             <img
//                               src={`/image/${item.imageUrlProduit}`}
//                               alt={item.nomProduit}
//                               className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
//                             />
//                           </div>
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
//                             <div className="absolute bottom-2 left-3">
//                               <p className="text-xs font-semibold text-white">{item.nomProduit}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Overlay gradient pour effet de fondu */}
//                     <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#EDECF2] to-transparent dark:from-[#0E121E]"></div>
//                     <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#EDECF2] to-transparent dark:from-[#0E121E]"></div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Top 5 Produits les Plus Vendus */}
//             <div
//                 className={`mx-auto w-full max-w-7xl px-4 py-8 transition-all delay-700 duration-1000 ${
//                     isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//                 }`}
//             >
//                 {/* Header */}
//                 <div className="mb-12 text-center">
//                     <div className="gap-2bg-gradient-to-r mb-4 inline-flex items-center rounded-full from-blue-600 to-purple-600 bg-clip-text px-4 py-2 text-orange-600 shadow-lg dark:from-blue-400 dark:to-purple-400 dark:text-orange-400">
//                         <FaFire className="h-5 w-5 animate-pulse" />
//                         <span className="text-sm font-semibold">Les Plus Populaires</span>
//                     </div>
//                     <h2 className="mb-4 text-4xl font-bold md:text-5xl">
//                         <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
//                             Nos Best-Sellers
//                         </span>
//                     </h2>
//                     <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
//                         Découvrez les produits préférés de nos clients. Ces articles ont conquis le cœur de milliers de personnes !
//                     </p>
//                 </div>

//                 {/* Loading State */}
//                 {loadingProducts ? (
//                     <div className="flex flex-col items-center justify-center py-20">
//                         <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
//                         <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des best-sellers...</p>
//                     </div>
//                 ) : (
//                     <>
//                         {/* Products Grid */}
//                         <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
//                             {topProducts.map((product, index) => {
//                                 const stockBadge = getStockBadge(product.stockProduit);
//                                 return (
//                                     <div
//                                         key={product.numProduit}
//                                         className="group relative"
//                                         onMouseEnter={() => setHoveredProduct(index)}
//                                         onMouseLeave={() => setHoveredProduct(null)}
//                                     >
//                                         {/* Ranking Badge */}
//                                         <div className="absolute -left-3 -top-3 z-20">
//                                             <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg dark:border-gray-800 dark:from-blue-400 dark:to-purple-400">
//                                                 <span className="text-lg font-bold text-white">#{index + 1}</span>
//                                             </div>
//                                         </div>

//                                         {/* Product Card */}
//                                         <div className="relative h-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800">
//                                             {/* Image Container */}
//                                             <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
//                                                 <img
//                                                     src={`/image/${product.imageUrlProduit}`}
//                                                     alt={product.nomProduit}
//                                                     className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//                                                 />

//                                                 {/* Stock Badge */}
//                                                 <div
//                                                     className={`absolute right-4 top-4 ${stockBadge.class} rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg`}
//                                                 >
//                                                     {stockBadge.text}
//                                                 </div>

//                                                 {/* Overlay Actions */}
//                                                 <div
//                                                     className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 ${hoveredProduct === index ? "opacity-100" : "opacity-0"}`}
//                                                 >
//                                                     <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
//                                                         <button
//                                                             onClick={() => handleViewProduct(product)}
//                                                             className="flex transform items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white"
//                                                         >
//                                                             <Eye className="h-4 w-4" />
//                                                             <span className="text-sm font-medium">Voir</span>
//                                                         </button>

//                                                         <button className="flex h-10 w-10 transform items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#2563EB] hover:text-white dark:bg-gray-800 dark:text-white">
//                                                             <ShoppingCart className="h-5 w-5" />
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Product Info */}
//                                             <div className="space-y-3 p-4">
//                                                 {/* Product Name */}
//                                                 <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold text-gray-900 dark:text-white">
//                                                     {product.nomProduit}
//                                                 </h3>

//                                                 {/* Description */}
//                                                 <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{product.descriptionProduit}</p>

//                                                 {/* Sales Info */}
//                                                 <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
//                                                     <TrendingUp className="h-4 w-4 text-green-500" />
//                                                     <span className="font-medium">{product.total_ventes || 0} ventes</span>
//                                                 </div>

//                                                 {/* Price and Action */}
//                                                 <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
//                                                     <div>
//                                                         <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
//                                                             {formatCurrency(product.prixProduit)}
//                                                         </p>
//                                                     </div>
//                                                     <button
//                                                         onClick={() =>
//                                                           addpanier(product)
//                                                         }
//                                                         className="flex transform items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-[#1E40AF] hover:to-pink-700 hover:shadow-xl dark:from-blue-400 dark:to-purple-400"
//                                                     >
//                                                         <ShoppingCart className="h-4 w-4" />
//                                                     </button>
//                                                 </div>
//                                             </div>

//                                             {/* Shine Effect */}
//                                             <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
//                                                 <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                         <div className="text-center">
//                             <Link
//                                 to="/Produit"
//                                 className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
//                             >
//                                 <span className="relative z-10">Découvrir tous nos produits</span>
//                                 <FaArrowDown className="relative z-10 transition-transform duration-300 group-hover:translate-y-1" />
//                                 <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
//                             </Link>
//                         </div>
//                     </>
//                 )}
//             </div>

//             {/* Section services */}
//             <div
//                 className={`mb-5 flex w-full items-center justify-center gap-4 p-2 transition-all delay-300 duration-1000 ${
//                     isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//                 }`}
//             >
//                 <span>Agence Commerciale</span>
//                 <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//                 <span>Service Client</span>
//                 <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//                 <span>Livraison</span>
//                 <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//                 <span>Paiement Rapide</span>
//             </div>

//             <ModalDetailProduit
//                 product={selectedProduct}
//                 isOpen={isModalOpen}
//                 onClose={handleCloseModal}
//             />

//             {/* modal message */}
//             {message.ouvre && (
//                 <Snackbar
//                     open={open}
//                     autoHideDuration={1500}
//                     onClose={handleClose}
//                     anchorOrigin={{ vertical: "top", horizontal: "center" }}
//                 >
//                     <Alert
//                         onClose={handleClose}
//                         severity={message.statut}
//                         variant="filled"
//                         sx={{ width: "100%" }}
//                     >
//                         {message.texte}
//                     </Alert>
//                 </Snackbar>
//             )}

//             {/* Styles CSS pour les animations */}
//             <style jsx>{`
//                 @keyframes float {
//                     0%,
//                     100% {
//                         transform: translateY(0px) rotate(0deg);
//                     }
//                     50% {
//                         transform: translateY(-20px) rotate(2deg);
//                     }
//                 }

//                 @keyframes pulse-slow {
//                     0%,
//                     100% {
//                         opacity: 1;
//                         transform: scale(1);
//                     }
//                     50% {
//                         opacity: 0.9;
//                         transform: scale(1.02);
//                     }
//                 }

//               @keyframes scroll {
//   0% {
//     transform: translateX(0);
//   }
//   100% {
//     transform: translateX(calc(-50% - 24px));
//   }
// }

// @keyframes scroll-reverse {
//   0% {
//     transform: translateX(calc(-50% - 24px));
//   }
//   100% {
//     transform: translateX(0);
//   }
// }

// .animate-scroll {
//   animation: scroll 40s linear infinite;
//   animation-play-state: running;
// }

// .animate-scroll-reverse {
//   animation: scroll-reverse 35s linear infinite;
//   animation-play-state: running;
// }

// /* Pause l'animation au hover */
// .animate-scroll:hover,
// .animate-scroll-reverse:hover {
//   animation-play-state: paused;
// }

// /* Responsive */
// @media (max-width: 768px) {
//   .animate-scroll,
//   .animate-scroll-reverse {
//     animation-duration: 25s;
//   }
// }
//                 .animate-float {
//                     animation: float 6s ease-in-out infinite;
//                 }

//                 .animate-pulse-slow {
//                     animation: pulse-slow 3s ease-in-out infinite;
//                 }
//             `}</style>
//         </div>
//     );
// }

// import { Link } from "react-router-dom";
// import home from "../../../image/home.png"
// import { FaCartShopping, FaArrowDown, FaStar } from "react-icons/fa6";
// import { useEffect, useState } from "react";

// // Importe tes images de catalogue - remplace par tes vraies images
// import prod1 from "@/image/prod1.png";
// import prod2 from "@/image/prod2.png";
// import cerave from '@/image/cerave.png'

// export default function Home() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [currentCatalogueIndex, setCurrentCatalogueIndex] = useState(0);

//   // Images du catalogue
//   const catalogueImages = [
//     { src: prod1, title: "Soins Visage", description: "Naturels & Doux" },
//     { src: prod2, title: "Maquillage", description: "Éclat Naturel" },
//     { src: cerave, title: "Corps & Bain", description: "Détente Absolue" },
//     { src: prod2, title: "Cheveux", description: "Brillance Naturelle" },
//     { src: prod1, title: "Parfums", description: "Fragrances Uniques" },
//     { src: prod2, title: "Accessoires", description: "Élégance & Style" },
//   ];

//   useEffect(() => {
//     setIsVisible(true);

//     // Animation automatique du carrousel
//     const interval = setInterval(() => {
//       setCurrentCatalogueIndex((prev) =>
//         prev === catalogueImages.length - 1 ? 0 : prev + 1
//       );
//     }, 4000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div id="Home" className="
//         bg-[#EDECF2] dark:bg-[#0E121E]
//         text-black dark:text-white
//         flex flex-col justify-center items-center
//         min-h-screen
//         gap-16
//         relative
//         overflow-hidden
//     ">
//       {/* Section principale */}
//       <div className="flex flex-col-reverse md:flex-row justify-center items-center pt-14 pb-5">
//         <div className={`flex flex-col transition-all duration-1000 ease-out ${
//           isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
//         }`}>
//           <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left mt-4 md:mt-0">
//             Produit de qualité, <br /> 100% Naturels avec {" "}
//             Ma<span className="text-[#2563EB]">Beauté</span>
//           </h1>

//           <p className="my-4 text-md text-center md:text-left">
//             Découvrez notre univers beauté: <br />
//             raffinée de cosmétiques naturels, innovants<br /> et éthiques,
//             pensés pour sublimer chaque peau.
//           </p>

//           <Link
//             to="/Produit"
//             className="btn btn-outline btn-accent font-bold py-2 px-4 mb-5 md:w-fit transform hover:scale-105 transition-transform duration-300"
//           >
//             <span>Commandez Maintenant</span>
//             <FaCartShopping className="cursor-pointer" />
//           </Link>
//         </div>

//         <div className="md:ml-60">
//           <img
//             src={home}
//             alt=""
//             className={`
//                             w-96 h-96
//                             object-cover
//                             border-8 border-[#2563EB]
//                             shadow-xl
//                             transition-all duration-1000 ease-out
//                             ${
//                         isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
//                       }`}
//             style={{
//               borderRadius: "30% 70% 70% 30% / 67% 62% 38% 33%"
//             }}
//           />
//         </div>
//       </div>
//       {/* Section Catalogue Animée */}
//       <div className={`w-full max-w-6xl mx-auto px-4 py-4 transition-all duration-1000 delay-500 ${
//         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//       }`}>
//         <h2 className="text-4xl font-bold text-center mb-4">
//           Explorez Notre <span className="text-[#2563EB]">Produit</span>
//         </h2>
//         <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
//           Découvrez notre collection exclusive de produits de beauté naturels,
//           soigneusement sélectionnés pour votre bien-être.
//         </p>

//         {/* Grille du catalogue */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
//           {catalogueImages.map((item, index) => (
//             <div
//               key={index}
//               className={`
//                 group relative overflow-hidden rounded-2xl shadow-lg
//                 transform transition-all duration-700 ease-out
//                 hover:scale-105 hover:shadow-2xl
//                 ${index === currentCatalogueIndex ? 'ring-4 ring-[#2563EB] scale-105' : 'scale-95'}
//               `}
//               style={{
//                 animationDelay: `${index * 200}ms`,
//                 animation: index === currentCatalogueIndex ? 'pulse 2s infinite' : 'none'
//               }}
//               onMouseEnter={() => setCurrentCatalogueIndex(index)}
//             >
//               {/* Image de fond */}
//               <div
//                 className="w-full h-32 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
//                 style={{ backgroundImage: `url(${item.src})` }}
//               />

//               {/* Overlay avec informations */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3">
//                 <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
//                 <p className="text-gray-300 text-xs">{item.description}</p>
//               </div>

//               {/* Indicateur de sélection */}
//               {index === currentCatalogueIndex && (
//                 <div className="absolute top-2 right-2">
//                   <FaStar className="text-yellow-400 animate-pulse" />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Points indicateurs */}
//         <div className="flex justify-center space-x-3 ">
//           {catalogueImages.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentCatalogueIndex(index)}
//               className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                 index === currentCatalogueIndex
//                   ? 'bg-[#2563EB] scale-125'
//                   : 'bg-gray-400 hover:bg-gray-600'
//               }`}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Section produit mis en avant (carrousel automatique) */}
//       <div className={`w-full max-w-4xl mx-auto px-4 transition-all duration-1000 delay-700 ${
//         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//       }`}>
//         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 shadow-2xl">
//           <h3 className="text-2xl font-bold text-center mb-6">
//             Produit du Moment
//             <span className="text-[#2563EB] ml-2">
//               {catalogueImages[currentCatalogueIndex]?.title}
//             </span>
//           </h3>

//           <div className="flex flex-col md:flex-row items-center gap-6">
//             <div className="flex-1">
//               <div
//                 className="w-full h-64 bg-cover bg-center rounded-2xl shadow-lg animate-pulse-slow"
//                 style={{
//                   backgroundImage: `url(${catalogueImages[currentCatalogueIndex]?.src})`,
//                   animation: 'pulse 3s ease-in-out infinite'
//                 }}
//               />
//             </div>

//             <div className="flex-1 text-center md:text-left">
//               <h4 className="text-xl font-bold mb-3">
//                 {catalogueImages[currentCatalogueIndex]?.title}
//               </h4>
//               <p className="text-gray-600 dark:text-gray-400 mb-4">
//                 {catalogueImages[currentCatalogueIndex]?.description} -
//                 Découvrez notre collection exclusive pour une beauté naturelle et rayonnante.
//               </p>
//               <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <FaStar key={star} className="text-yellow-400 text-sm" />
//                 ))}
//                 <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">(4.9/5)</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bouton Voir les produits */}
//       <div className={`mt-8 transition-all duration-1000 delay-1000 ${
//         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//       }`}>
//         <Link
//           to="/Produit"
//           className="
//             group
//             bg-gradient-to-r from-[#2563EB] to-[#1E40AF]
//             hover:from-[#1E40AF] hover:to-[#1E3A8A]
//             text-white
//             font-bold
//             py-4 px-8
//             rounded-full
//             shadow-2xl
//             shadow-blue-500/30
//             transform
//             hover:scale-110
//             hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)]
//             transition-all
//             duration-500
//             ease-in-out
//             flex
//             items-center
//             gap-3
//             animate-pulse
//           "
//         >
//           <span>Voir tous les produits</span>
//           <FaArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
//         </Link>
//       </div>

//       {/* Section services */}
//       <div className={`w-full flex justify-center items-center gap-4 p-2 mb-5 transition-all duration-1000 delay-300 ${
//         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//       }`}>
//         <span>Agence Commerciale</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Service Client</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Livraison</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Paiement Rapide</span>
//       </div>

//       {/* Styles CSS pour les animations */}
//       <style jsx>{`
//         @keyframes float {
//           0%, 100% {
//             transform: translateY(0px) rotate(0deg);
//           }
//           50% {
//             transform: translateY(-20px) rotate(2deg);
//           }
//         }

//         @keyframes pulse-slow {
//           0%, 100% {
//             opacity: 1;
//             transform: scale(1);
//           }
//           50% {
//             opacity: 0.9;
//             transform: scale(1.02);
//           }
//         }

//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }

//         .animate-pulse-slow {
//           animation: pulse-slow 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
