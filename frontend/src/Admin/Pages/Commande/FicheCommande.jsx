import React from "react";
import { FaCartShopping, FaLocationArrow, FaShopify, FaUserTag } from "react-icons/fa6";
import { GrDocumentText } from "react-icons/gr";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdLocationOn, MdOutlineMonetizationOn } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const FicheCommande = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const commande = location.state;
    const retourVersCommande = () => {
        navigate("/admin/commande");
    };
    const prixlivr = (valeur) => {
        switch (valeur) {
            case "standard":
                return 2000;
            case "express":
                return 5000;
            case "mangasin":
                return 0;
            default:
                return 0;
        }
    };
    const NetPayer = () => {
        return calculerTotal() + prixlivr(commande.methodeLivraison);
    };
    const calculerTotal = () => {
        return commande.paniers.reduce((total, item) => {
            return total + item.produit.prixProduit * item.quantite;
        }, 0);
    };
    return (
        <div className="rounded-lg bg-white p-2 text-black transition-colors dark:bg-slate-900 dark:text-white">
            <div className="flex flex-col items-start">
                <button
                    className="btn btn-accent btn-ghost btn-sm"
                    onClick={retourVersCommande}
                >
                    <IoMdArrowRoundBack /> Retour au commande{" "}
                </button>
                <div className="mb-4 flex w-full items-center justify-center">
                    <h1 className="flex items-center gap-2 font-bold text-accent">
                        {" "}
                        <GrDocumentText /> FICHE COMMANDE
                    </h1>
                </div>
                <div className="mb-4 gap-4 flex w-full flex-col px-3 md:flex-col lg:flex-row">
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
                        <h1 className="mb-2 pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
                            <FaShopify /> Information sur le commande
                        </h1>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">ID Commande</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300"> {commande.refCommande}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Statut Commande</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300"> {commande.statutCommande}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Méthode de Livraison</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {" "}
                                {commande.methodeLivraison || "En cours..."}
                            </span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Frais de Livraison</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {" "}
                                {commande.fraisLivraison ? commande.fraisLivraison + " Ar" : "En cours..."}
                            </span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Date Creation</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300"> {commande.dateCommande}</span>
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
                        <h1 className="mb-2 pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
                            <FaUserTag /> Information sur le client
                        </h1>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Référence client</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.client.refClient}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Nom complet</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {" "}
                                {commande.client.civiliteClient} {commande.client.nomClient} {commande.client.prenomClient}
                            </span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Date de Naissance</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.client.dateNaissance}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Téléphone</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.client.telephoneClient}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Email</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300"> {commande.client.user.emailUsers}</span>
                        </div>
                    </div>
                </div>
                <div className="mb-4 gap-4 flex w-full flex-col px-3 md:flex-col lg:flex-row">
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
                        <h1 className="mb-2 pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
                            <MdLocationOn/> Information sur l'Adresse de Livraison
                        </h1>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Référence Adresse</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.refAdresse}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Ville</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.ville}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Code Postal</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.codePostal}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Quartier</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.quartier}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Lot d'adresse</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.lot}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Labelle d'adresse</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.libelleAdresse}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Complement d'adresse</span>
                            <span className="text-end text-sm font-medium text-gray-700 dark:text-gray-300">
                                {commande.adresseLivraison.complementAdresse}
                            </span>
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
                        <h1 className="mb-2 pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
                            <FaLocationArrow /> Information sur l'Adresse de Facturation
                        </h1>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Référence Adresse</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseFacturation.refAdresse}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Ville</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseFacturation.ville}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Code Postal</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseFacturation.codePostal}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Quartier</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseFacturation.quartier}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Lot d'adresse</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseLivraison.lot}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Labelle d'adresse</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.adresseFacturation.libelleAdresse}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Complement d'adresse</span>
                            <span className="text-end text-sm font-medium text-gray-700 dark:text-gray-300">
                                {commande.adresseFacturation.complementAdresse}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mb-4 gap-4 flex w-full flex-col px-3 md:flex-col lg:flex-row">
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
                        <h1 className="pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
                            <FaCartShopping />
                            Produit commandé
                        </h1>
                        <div className="h-[200px] w-full overflow-auto px-2">
                            {commande.paniers.map((panier) => (
                                <div
                                    key={panier.produit.numProduit}
                                    className="flex w-full items-center justify-between gap-x-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-300 p-1 mb-2 dark:border-slate-700"
                                >
                                    <div className="flex items-center gap-x-4">
                                        <img
                                            src={`/image/${panier.produit.imageUrlProduit}`}
                                            alt={panier.produit.nomProduit}
                                            className="size-10 flex-shrink-0 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{panier.produit.nomProduit}</p>
                                            <p className="text-sm flex items-center text-slate-600 dark:text-slate-400 gap-2">
                                                <span>{panier.produit.prixProduit} Ar</span>
                                                <span className="px-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-slate-800 text-blue-600">
                                                    {panier.produit.stockProduit} unités
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Quantité: {panier.quantite}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Sub Total: {panier.produit.prixProduit * panier.quantite} Ar{" "}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
                        <h1 className="mb-2 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
                            <MdOutlineMonetizationOn /> Résultat Transaction
                        </h1>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Méthode Paiement</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.paiements.methodePaiement || "non defini"}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-2 border-b border-slate-300 dark:border-slate-600">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Statut Paiement</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{commande.paiements.statutPaiement || "non defini"}</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Total Produit</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{calculerTotal().toFixed(2)} Ar</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-2 border-b border-slate-300 dark:border-slate-600">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Frais de Livraison</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">+ {commande.fraisLivraison} Ar</span>
                        </div>
                        <div className="flex w-full items-center justify-between px-1 py-1">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Net à Payer</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{NetPayer().toFixed(2)} Ar</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FicheCommande;
