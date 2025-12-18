import React, { useState } from "react";
import { 
    ShoppingCart, Package, User, Mail, Phone, Calendar, MapPin, 
    CreditCard, Truck, ArrowLeft, FileText, DollarSign, Edit, Trash2,
    CheckCircle, XCircle, Clock, PackageCheck,
    FileChartColumnIcon,
    Download
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {commandeService} from '@/services/CommandeService'
import { telechargerFactureAdmin } from "@/services/FactureService"; 
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const FicheCommande = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [commande,setCommande] = useState(location.state);
    const [loading,setLoading] = useState(false);
    const [telechargementEnCours, setTelechargementEnCours] = useState(false);
    const [open, setOpen] = useState(false);
    const [newStatut, setNewStatut] = useState("")
    const status = commande.statutCommande;
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(commande.statutCommande);

    
    const retourVersClient = () => {
        navigate("/admin/commande");
    };



    // Fonction pour télécharger la facture
    const handleTelechargerFacture = async () => {
        try {
            setTelechargementEnCours(true);
            
            // Appeler le service de téléchargement de facture
            await telechargerFactureAdmin(commande.refCommande);
            
            // Notification de succès
            setMessage({
                ouvre: true,
                texte: `Facture de la commande ${commande.refCommande} téléchargée avec succès!`,
                statut: "success",
            });
            setOpen(true);
            
        } catch (error) {
            console.error("Erreur lors du téléchargement de la facture:", error);
            
            let errorMessage = "Erreur lors du téléchargement de la facture";
            if (error.message.includes('non disponible')) {
                errorMessage = "La facture n'est pas encore disponible pour cette commande";
            } else if (error.message.includes('accès') || error.message.includes('403')) {
                errorMessage = "Vous n'avez pas l'autorisation de télécharger cette facture";
            } else if (error.message.includes('404')) {
                errorMessage = "Commande non trouvée";
            } else {
                errorMessage = error.message || errorMessage;
            }
            
            setMessage({
                ouvre: true,
                texte: errorMessage,
                statut: "error",
            });
            setOpen(true);
            
        } finally {
            setTelechargementEnCours(false);
        }
    };

    // Vérifier si la facture est disponible pour cette commande
    const factureDisponible = () => {
        const statutsAvecFacture = ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];
        return statutsAvecFacture.includes(commande.statutCommande);
    };

     // Règles de transition de statut
     const getStatusTransitions = (currentStatus) => {
        const transitions = {
            'INITIALISE': [
                'EN_ATTENTE_PAIEMENT', 
                'EN_PREPARATION', 
                'EXPEDIEE', 
                'LIVREE', 
                'ANNULER'
            ],
            'EN_ATTENTE_PAIEMENT': [
                'EN_PREPARATION', 
                'ANNULER'
            ],
            'EN_PREPARATION': [
                'EXPEDIEE', 
                'ANNULER'
            ],
            'EXPEDIEE': [
                'LIVREE', 
                'ANNULER'
            ],
            'LIVREE': [], 
            'ANNULER': [], 
        };
        return transitions[currentStatus] || [];
    };

    // Vérifier si le statut actuel peut être modifié
    const canEditStatus = () => {
        const nonEditableStatuses = ['LIVREE', 'ANNULER'];
        return !nonEditableStatuses.includes(commande.statutCommande);
    };

    const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
        const mois = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        if (!dateTimeString || !dateTimeString.date) return "Non spécifié";
        
        const str = String(dateTimeString.date); 
            const date = str.slice(0,10);
            const time = str.slice(11,19);
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
            return "Non spécifié";
  }
    
    const Transformestatut = (status) => {
        const statuts = {
            "INITIALISE": { label: "Initialisée", color: "bg-gray-100 text-gray-700", icon: Clock },
            "LIVREE": { label: "Livrée", color: "bg-green-100 text-green-700", icon: CheckCircle },
            "EXPEDIEE": { label: "Expédiée", color: "bg-blue-100 text-blue-700", icon: PackageCheck },
            "EN_PREPARATION": { label: "En préparation", color: "bg-yellow-100 text-yellow-700", icon: Package },
            "ANNULER": { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
            "ANNULEE": { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
            "EN_ATTENTE_PAIEMENT": { label: "En attente paiement", color: "bg-orange-100 text-orange-700", icon: Clock }
        };
        return statuts[status] || { label: "Tous", color: "bg-gray-100 text-gray-700", icon: Package };
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const calculerTotal = () => {
        if (!commande.paniers || commande.paniers.length === 0) return 0;
        
        return commande.paniers.reduce((total, item) => {
            const prix = item.produit?.prixProduit || 0;
            const quantite = item.quantite || 0;
            return total + prix * quantite;
        }, 0);
    };

    const NetPayer = () => {
        const totalProduits = calculerTotal();
        const fraisLivraison = parseFloat(commande.fraisLivraison || 0);
        return totalProduits + fraisLivraison;
    };

    const handleDeleteCommande = () => {
        console.log("Suppression de la commande:", commande.refCommande);
        setLoading(true)
        try{
            const result = commandeService.supprimerCommande(commande.refCommande)
            console.log("result: ",result)
            if (result.data){
                console.log("suppression succes")
                setMessage({
                    ouvre: true,
                    texte: `La suppression de la commande ${commande.refCommande} est terminé avec succés!`,
                    statut: "success",
                });
                setOpen(true);
                // mis a jour de l'etat de navigateur
                setCommande({})
                navigate(location.pathname, { state: null, replace: true });
                
                navigate("/admin/commande");
            }
            else{
                console.log("Erreur delete result: ",result)
                setMessage({
                    ouvre: true,
                    texte: `Un probleme de suppression de la commande s'est produit!`,
                    statut: "error",
                });
                setOpen(true);
            }
            setLoading(false)
        }catch(error){
            console.log("Erreur suppression: ",error)
        }finally{
            setLoading(false)
        }
        setShowDeleteModal(false);
    };

    const handleChangeStatus = async (e) => {
        e.preventDefault();
        setLoading(true)
        try{
            console.log("Statut modifier: ", newStatut)
            const update = await commandeService.updateStatut(commande.refCommande, newStatut)
            if (update.data){
                console.log("UPDATE SUCCES: ", update.data)

                const updatedCommande = {
                    ...commande, 
                    statutCommande: selectedStatus,
                };
                setCommande(updatedCommande);
                // mis à jour de l'etat dans le navigateur
                navigate(location.pathname, { state: updatedCommande, replace: true });
                
                setMessage({
                    ouvre: true,
                    texte: `La modification de commande ${commande.refCommande} est terminé avec succés!`,
                    statut: "success",
                });
                setOpen(true);
                
            }else{
                console.log("UPDATE ERROR: ", update.error)
                setMessage({
                    ouvre: true,
                    texte: `Une problème est servenu lors de modification de la commande ${commande.refCommande}!`,
                    statut: "error",
                });
                setOpen(true);
            }
            setLoading(false)
        }catch(error){
            console.log(" ERROR try/catch: ",error)
                setMessage({
                    ouvre: true,
                    texte: `Une erreur s'est produit, veuillez attendre quelque minute`,
                    statut: "error",
                });
                setOpen(true);
        }finally{
            setShowStatusModal(false);
            setLoading(false)
        }
    };

    const statusInfo = Transformestatut(commande.statutCommande);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* message notification */}
                <div>
                    {message.ouvre && (
                        <Snackbar
                            open={open}
                            autoHideDuration={5000}
                            onClose={handleClose}
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
                </div>
                
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        className="flex items-center gap-2 self-start rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                        onClick={retourVersClient}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Retour aux commandes</span>
                    </button>

                    <div className="flex flex-wrap gap-2">
                        {/* Bouton Obtenir Facture */}
                        {factureDisponible() && (
                        <button
                            onClick={handleTelechargerFacture}
                            disabled={!factureDisponible() || telechargementEnCours}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium shadow-md transition-all ${
                                factureDisponible() && !telechargementEnCours
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:bg-emerald-600 hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {telechargementEnCours ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span className="hidden sm:inline">Téléchargement...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {factureDisponible() ? 'Obtenir Facture' : 'Facture non disponible'}
                                    </span>
                                </>
                            )}
                        </button>

                        )}

                        {(commande.statutCommande !== "ANNULER" && commande.statutCommande !== "LIVREE" && commande.statutCommande !== "ANNULEE") && (
                            <button
                                onClick={() => setShowStatusModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
                            >
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline">Modifier Statut</span>
                            </button>
                        )}
                        
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Supprimer Commande</span>
                        </button>
                    </div>
                </div>

                {/* Title Card */}
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-300 to-blue-200 p-6 shadow-xl">
                    <div className="flex items-center gap-3 text-white">
                        <FileText className="h-8 w-8" />
                        <div>
                            <h1 className="text-2xl font-bold md:text-3xl">Fiche Commande</h1>
                            <p className="mt-1 text-purple-100">Référence: {commande.refCommande}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${statusInfo.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {statusInfo.label}
                        </span>
                        
                        {/* Indicateur de disponibilité de facture */}
                        {factureDisponible() ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                <FileChartColumnIcon className="h-3 w-3" />
                                Facture disponible
                            </span>
                        ) : (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-600">
                                Facture non disponible
                            </span>
                        )}
                    </div>
                </div>

                {/* First Row - Order & Client Info */}
                <div className="mb-6 grid gap-6 lg:grid-cols-2">
                    {/* Order Information */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-purple-100 p-3">
                                <Package className="h-6 w-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Information Commande</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">ID Commande</span>
                                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                                    {commande.refCommande}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Statut</span>
                                <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Truck className="h-4 w-4" />
                                    Livraison
                                </span>
                                <span className="font-medium capitalize text-gray-800">
                                    {commande.methodeLivraison || "Non spécifié"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Frais Livraison</span>
                                <span className="font-medium text-gray-800">
                                    {parseFloat(commande.fraisLivraison || 0).toLocaleString()} Ar
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    Date Création
                                </span>
                                <span className="text-right font-medium text-gray-800">
                                    {ExtractionDate(commande.dateCommande, "date", true)}
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {ExtractionDate(commande.dateCommande, "time")}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Client Information */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-blue-100 p-3">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Information Client</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Référence</span>
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                                    {commande.client?.refClient || "Non spécifié"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Nom complet</span>
                                <span className="text-right font-medium text-gray-800">
                                    {commande.client?.civiliteClient || ""} {commande.client?.nomClient || ""} {commande.client?.prenomClient || ""}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    Naissance
                                </span>
                                <span className="font-medium text-gray-800">
                                    {commande.client?.dateNaissance ? 
                                        ExtractionDate(commande.client.dateNaissance, "date", true) : 
                                        "Non spécifié"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    Téléphone
                                </span>
                                <span className="font-medium text-gray-800">
                                    {commande.client?.telephoneClient || "Non spécifié"}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </span>
                                <span className="text-right font-medium text-gray-800">
                                    {commande.client?.user?.emailUsers || "Non spécifié"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row - Addresses */}
                <div className="mb-6 grid gap-6 lg:grid-cols-2">
                    {/* Delivery Address */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-green-100 p-3">
                                <MapPin className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Adresse de Livraison</h2>
                        </div>

                        <div className="space-y-3">
                            {commande.adresseLivraison ? (
                                <div className="rounded-lg bg-green-50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                            {commande.adresseLivraison.libelleAdresse || "Adresse"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Réf: {commande.adresseLivraison.refAdresse}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-gray-800">
                                            {commande.adresseLivraison.quartier}
                                        </p>
                                        <p className="text-gray-600">
                                            {commande.adresseLivraison.ville}, {commande.adresseLivraison.codePostal}
                                        </p>
                                        <p className="text-gray-600">Lot: {commande.adresseLivraison.lot}</p>
                                        {commande.adresseLivraison.complementAdresse && (
                                            <p className="text-gray-500">{commande.adresseLivraison.complementAdresse}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Aucune adresse de livraison spécifiée</p>
                            )}
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="rounded-2xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-orange-100 p-3">
                                <MapPin className="h-6 w-6 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Adresse de Facturation</h2>
                        </div>

                        <div className="space-y-3">
                            {commande.adresseFacturation ? (
                                <div className="rounded-lg bg-orange-50 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                            {commande.adresseFacturation.libelleAdresse || "Adresse"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Réf: {commande.adresseFacturation.refAdresse}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-gray-800">
                                            {commande.adresseFacturation.quartier}
                                        </p>
                                        <p className="text-gray-600">
                                            {commande.adresseFacturation.ville}, {commande.adresseFacturation.codePostal}
                                        </p>
                                        <p className="text-gray-600">Lot: {commande.adresseFacturation.lot}</p>
                                        {commande.adresseFacturation.complementAdresse && (
                                            <p className="text-gray-500">{commande.adresseFacturation.complementAdresse}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Aucune adresse de facturation spécifiée</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Third Row - Products & Payment */}
                {commande.paniers && commande.paniers.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Products */}
                        <div className="rounded-2xl bg-white p-6 shadow-lg">
                            <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                                <div className="rounded-lg bg-indigo-100 p-3">
                                    <ShoppingCart className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Produits Commandés ({commande.paniers.length})
                                </h2>
                            </div>

                            <div className="max-h-[400px] space-y-3 overflow-auto">
                                {commande.paniers.map((panier, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-all hover:border-indigo-400 hover:shadow-md"
                                    >
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200">
                                            <Package className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {panier.produit?.nomProduit || "Produit non disponible"}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-medium">
                                                        {parseFloat(panier.produit?.prixProduit || 0).toLocaleString()} Ar
                                                    </span>
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                                        Stock: {panier.produit?.stockProduit || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-sm">
                                                <span className="font-semibold text-gray-600">Qté: {panier.quantite || 0}</span>
                                                <span className="font-bold text-indigo-600">
                                                    {(parseFloat(panier.produit?.prixProduit || 0) * (panier.quantite || 0)).toLocaleString()} Ar
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment */}
                        {commande.paiement && (
                            <div className="rounded-2xl bg-white p-6 shadow-lg">
                                <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                                    <div className="rounded-lg bg-emerald-100 p-3">
                                        <DollarSign className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">Résumé Transaction</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                        <span className="flex items-center gap-2 font-semibold text-gray-600">
                                            <CreditCard className="h-4 w-4" />
                                            Méthode
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            {commande.paiement?.modePaiment || "Non spécifié"}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                        <span className="flex items-center gap-2 font-semibold text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            Date Paiement
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            {commande.paiement?.datePaiment 
                                                ? ExtractionDate(commande.paiement.datePaiment, "date", true)
                                                : "Non spécifié"}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                        <span className="font-semibold text-gray-600">Statut Paiement</span>
                                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                                            commande.paiement?.statutPaiment === "PAYE" || commande.paiement?.statutPaiment === "VALIDE"
                                                ? "bg-green-100 text-green-700" 
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                            {commande.paiement?.statutPaiment || "Non spécifié"}
                                        </span>
                                    </div>

                                    <div className="border-t-2 border-gray-300 pt-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <span className="font-semibold text-gray-600">Sous-total</span>
                                            <span className="font-medium text-gray-800">
                                                {calculerTotal().toLocaleString()} Ar
                                            </span>
                                        </div>

                                        <div className="mb-4 flex items-start justify-between">
                                            <span className="flex items-center gap-2 font-semibold text-gray-600">
                                                <Truck className="h-4 w-4" />
                                                Frais Livraison
                                            </span>
                                            <span className="font-medium text-gray-800">
                                                + {parseFloat(commande.fraisLivraison || 0).toLocaleString()} Ar
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between rounded-lg bg-emerald-50 p-4">
                                            <span className="text-lg font-bold text-emerald-700">Net à Payer</span>
                                            <span className="text-xl font-bold text-emerald-600">
                                                {NetPayer().toLocaleString()} Ar
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>    
                        )}
                    </div>
                )}
            </div>
            
            {/* Modal de suppression */}
            {showDeleteModal && (
                <dialog
                    id="register_modal"
                    className={`modal ${showDeleteModal ? "modal-open" : ""}`}
                >
                    <div className="modal-box max-w-xl bg-slate-200 dark:bg-gray-800">
                        <form method="dialog">
                            <button
                                className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ✕
                            </button>
                        </form>
                        <div className="flex justify-center gap-3 items-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-800">
                                Confirmer la suppression
                            </h3>
                        </div>
                        <p className="mb-6 text-gray-600 text-center">
                            Êtes-vous sûr de vouloir supprimer la commande{" "}
                            <strong className="text-gray-800">{commande.refCommande}</strong> ?
                            Cette action est irréversible.
                        </p>
                        <form method="dialog" className="modal-backdrop">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteCommande}
                                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                                >
                                    {loading ? (
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            <span className="loading loading-spinner text-accent"></span>
                                            <span>Suppression...</span>
                                        </div>
                                    ) : (
                                        "Supprimer"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}

            {/* Modal de modification du statut */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex justify-center gap-3 items-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Edit className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-800">
                                Modifier le statut
                            </h3>
                        </div>
                        <p className="mb-4 text-gray-600">
                            Sélectionnez le nouveau statut pour la commande{" "}
                            <strong className="text-gray-800">{commande.refCommande}</strong>
                        </p>

                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setNewStatut(e.target.value)
                                setSelectedStatus(e.target.value)
                            }}
                            className="mb-6 w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-800 focus:border-blue-500 focus:outline-none"
                        >
                            <option value={status} disabled>{Transformestatut(status).label}</option>
                            {getStatusTransitions(status).map((stat) => (
                                <option key={stat} value={stat}>
                                    {Transformestatut(stat).label}
                                </option>
                            ))}
                        </select>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleChangeStatus}
                                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                            >
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <span className="loading loading-spinner text-white"></span>
                                        <span>Confirmation...</span>
                                    </div>
                                ) : (
                                    "Confirmer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default FicheCommande;

// import React, { useState } from "react";
// import { 
//     ShoppingCart, Package, User, Mail, Phone, Calendar, MapPin, 
//     CreditCard, Truck, ArrowLeft, FileText, DollarSign, Edit, Trash2,
//     CheckCircle, XCircle, Clock, PackageCheck,
//     FileChartColumnIcon
// } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {commandeService} from '@/services/CommandeService'
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";

// const FicheCommande = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const [commande,setCommande] = useState(location.state);
//     const [loading,setLoading] = useState(false)
//     const [open, setOpen] = useState(false);
//     const [newStatut, setNewStatut] = useState("")
//     const status = commande.statutCommande;
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [showStatusModal, setShowStatusModal] = useState(false);
//     const [selectedStatus, setSelectedStatus] = useState(commande.statutCommande);

    
//     const retourVersClient = () => {
//         navigate("/admin/commande");
//     };

//      // Règles de transition de statut
//      const getStatusTransitions = (currentStatus) => {
//         const transitions = {
//             'INITIALISE': [
//                 'EN_ATTENTE_PAIEMENT', 
//                 'EN_PREPARATION', 
//                 'EXPEDIEE', 
//                 'LIVREE', 
//                 'ANNULER'
//             ],
//             'EN_ATTENTE_PAIEMENT': [
//                 'EN_PREPARATION', 
//                 'ANNULER'
//             ],
//             'EN_PREPARATION': [
//                 'EXPEDIEE', 
//                 'ANNULER'
//             ],
//             'EXPEDIEE': [
//                 'LIVREE', 
//                 'ANNULER'
//             ],
//             'LIVREE': [], 
//             'ANNULER': [], 
//         };
//         return transitions[currentStatus] || [];
//     };

//     // Vérifier si le statut actuel peut être modifié
//     const canEditStatus = () => {
//         const nonEditableStatuses = ['LIVREE', 'ANNULER'];
//         return !nonEditableStatuses.includes(commande.statutCommande);
//     };

//     const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
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
//     const Transformestatut = (status) => {
//         const statuts = {
//             "INITIALISE": { label: "Initialisée", color: "bg-gray-100 text-gray-700", icon: Clock },
//             "LIVREE": { label: "Livrée", color: "bg-green-100 text-green-700", icon: CheckCircle },
//             "EXPEDIEE": { label: "Expédiée", color: "bg-blue-100 text-blue-700", icon: PackageCheck },
//             "EN_PREPARATION": { label: "En preparation", color: "bg-yellow-100 text-yellow-700", icon: Package },
//             "ANNULER": { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
//             "EN_ATTENTE_PAIEMENT": { label: "En attente paiement", color: "bg-orange-100 text-orange-700", icon: Clock }
//         };
//         return statuts[status] || { label: "Tous", color: "bg-gray-100 text-gray-700", icon: Package };
//     };

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     const calculerTotal = () => {
//         return commande.paniers.reduce((total, item) => {
//             return total + item.produit.prixProduit * item.quantite;
//         }, 0);
//     };

//     const NetPayer = () => {
//         return calculerTotal() + commande.fraisLivraison;
//     };

//     const handleDeleteCommande = () => {
//         console.log("Suppression de la commande:", commande.refCommande);
//         setLoading(true)
//         try{
//             const result = commandeService.supprimerCommande(commande.refCommande)
//             console.log("result: ",result)
//             if (result.data){
//                 console.log("suppression succes")
//                 setMessage({
//                     ouvre: true,
//                     texte: `La suppression de la commande ${commande.refCommande} est terminé avec succés!`,
//                     statut: "success",
//                 });
//                 setOpen(true);
//                 // mis a jour de l'etat de navigateur
//                 setCommande({})
//                 navigate(location.pathname, { state: null, replace: true });
                
//                 navigate("/admin/commande");
//             }
//             else{
//                 console.log("Erreur delete result: ",result)
//                 setMessage({
//                     ouvre: true,
//                     texte: `Un probleme de suppression de la commande s'est produit!`,
//                     statut: "error",
//                 });
//                 setOpen(true);
//             }
//             setLoading(false)
//         }catch(error){
//             console.log("Erreur suppression: ",error)
//         }finally{
//             setLoading(false)
//         }
//         setShowDeleteModal(false);
//     };

//     const handleChangeStatus = async (e) => {
//         e.preventDefault();
//         setLoading(true)
//         try{
//             console.log("Statut modifier: ", newStatut)
//             const update = await commandeService.updateStatut(commande.refCommande, newStatut)
//             if (update.data){
//                 console.log("UPDATE SUCCES: ", update.data)

//                 const updatedCommande = {
//                     ...commande, 
//                     statutCommande: selectedStatus,
//                 };
//                 setCommande(updatedCommande);
//                 // mis à jour de l'etat dans le navigateur
//                 navigate(location.pathname, { state: updatedCommande, replace: true });
                
//                 setMessage({
//                     ouvre: true,
//                     texte: `La modification de commande ${commande.refCommande} est terminé avec succés!`,
//                     statut: "success",
//                 });
//                 setOpen(true);
                
//             }else{
//                 console.log("UPDATE ERROR: ", update.error)
//                 setMessage({
//                     ouvre: true,
//                     texte: `Une problème est servenu lors de modification de la commande ${commande.refCommande}!`,
//                     statut: "error",
//                 });
//                 setOpen(true);
//             }
//             setLoading(false)
//         }catch(error){
//             console.log(" ERROR try/catch: ",error)
//                 setMessage({
//                     ouvre: true,
//                     texte: `Une erreur s'est produit, veuillez attendre quelque minute`,
//                     statut: "error",
//                 });
//                 setOpen(true);
//         }finally{
//             setShowStatusModal(false);
//             setLoading(false)
//         }
//     };

//     const statusInfo = Transformestatut(commande.statutCommande);
//     const StatusIcon = statusInfo.icon;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
//             <div className="mx-auto max-w-7xl">
//                 {/* message notification */}
//                 <div>
//                     {message.ouvre && (
//                                             <Snackbar
//                                                 open={open}
//                                                 autoHideDuration={5000}
//                                                 onClose={handleClose}
//                                             >
//                                                 <Alert
//                                                     onClose={handleClose}
//                                                     severity={message.statut}
//                                                     variant="filled"
//                                                     sx={{ width: "100%" }}
//                                                 >
//                                                     {message.texte}
//                                                 </Alert>
//                                             </Snackbar>
//                                         )}
//                 </div>
//                 {/* Header */}
//                 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                     <button
//                         className="flex items-center gap-2 self-start rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
//                         onClick={retourVersClient}
//                     >
//                         <ArrowLeft className="h-5 w-5" />
//                         <span className="font-medium">Retour aux commandes</span>
//                     </button>

//                     <div className="flex gap-2">
//                         <button
//                             // onClick={() => setShowStatusModal(true)}
//                             className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-green-600 hover:shadow-lg"
//                         >
//                             <FileChartColumnIcon className="h-4 w-4" />
//                             <span className="hidden sm:inline">Obtenir Facture</span>
//                         </button>

//                         {(commande.statutCommande !== "ANNULER" && commande.statutCommande !== "LIVREE") && (
//                             <button
//                             onClick={() => setShowStatusModal(true)}
//                             className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
//                         >
//                             <Edit className="h-4 w-4" />
//                             <span className="hidden sm:inline">Modifier Statut</span>
//                         </button>
//                         )}
//                         <button
//                             onClick={() => setShowDeleteModal(true)}
//                             className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg"
//                         >
//                             <Trash2 className="h-4 w-4" />
//                             <span className="hidden sm:inline">Supprimer Commande</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Title Card */}
//                 <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-300 to-blue-200 p-6 shadow-xl">
//                     <div className="flex items-center gap-3 text-white">
//                         <FileText className="h-8 w-8" />
//                         <div>
//                             <h1 className="text-2xl font-bold md:text-3xl">Fiche Commande</h1>
//                             <p className="mt-1 text-purple-100">Référence: {commande.refCommande}</p>
//                         </div>
//                     </div>
//                     <div className="mt-4 flex items-center gap-2">
//                         <span className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${statusInfo.color}`}>
//                             <StatusIcon className="h-4 w-4" />
//                             {statusInfo.label}
//                         </span>
//                     </div>
//                 </div>

//                 {/* First Row - Order & Client Info */}
//                 <div className="mb-6 grid gap-6 lg:grid-cols-2">
//                     {/* Order Information */}
//                     <div className="rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-purple-100 p-3">
//                                 <Package className="h-6 w-6 text-purple-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Information Commande</h2>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">ID Commande</span>
//                                 <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
//                                     {commande.refCommande}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Statut</span>
//                                 <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusInfo.color}`}>
//                                     {statusInfo.label}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Truck className="h-4 w-4" />
//                                     Livraison
//                                 </span>
//                                 <span className="font-medium capitalize text-gray-800">
//                                     {commande.methodeLivraison }
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Frais Livraison</span>
//                                 <span className="font-medium text-gray-800">
//                                     {commande.fraisLivraison} Ar
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Calendar className="h-4 w-4" />
//                                     Date Création
//                                 </span>
//                                 <span className="text-right font-medium text-gray-800">
//                                     {ExtractionDate(commande.dateCommande, "date", true)}
//                                     <br />
//                                     <span className="text-xs text-gray-500">
//                                         {ExtractionDate(commande.dateCommande, "time")}
//                                     </span>
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Client Information */}
//                     <div className="rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-blue-100 p-3">
//                                 <User className="h-6 w-6 text-blue-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Information Client</h2>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Référence</span>
//                                 <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
//                                     {commande.client.refClient}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Nom complet</span>
//                                 <span className="text-right font-medium text-gray-800">
//                                     {commande.client.civiliteClient} {commande.client.nomClient} {commande.client.prenomClient}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Calendar className="h-4 w-4" />
//                                     Naissance
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {ExtractionDate(commande.client.dateNaissance, "date", true)}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Phone className="h-4 w-4" />
//                                     Téléphone
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {commande.client.telephoneClient}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Mail className="h-4 w-4" />
//                                     Email
//                                 </span>
//                                 <span className="text-right font-medium text-gray-800">
//                                     {commande.client.user.emailUsers}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Second Row - Addresses */}
//                 <div className="mb-6 grid gap-6 lg:grid-cols-2">
//                     {/* Delivery Address */}
//                     <div className="rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-green-100 p-3">
//                                 <MapPin className="h-6 w-6 text-green-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Adresse de Livraison</h2>
//                         </div>

//                         <div className="space-y-3">
//                             <div className="rounded-lg bg-green-50 p-4">
//                                 <div className="mb-2 flex items-center justify-between">
//                                     <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
//                                         {commande.adresseLivraison.libelleAdresse}
//                                     </span>
//                                     <span className="text-xs text-gray-500">
//                                         Réf: {commande.adresseLivraison.refAdresse}
//                                     </span>
//                                 </div>
//                                 <div className="space-y-1 text-sm">
//                                     <p className="font-semibold text-gray-800">
//                                         {commande.adresseLivraison.quartier}
//                                     </p>
//                                     <p className="text-gray-600">
//                                         {commande.adresseLivraison.ville}, {commande.adresseLivraison.codePostal}
//                                     </p>
//                                     <p className="text-gray-600">Lot: {commande.adresseLivraison.lot}</p>
//                                     <p className="text-gray-500">{commande.adresseLivraison.complementAdresse}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Billing Address */}
//                     <div className="rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-orange-100 p-3">
//                                 <MapPin className="h-6 w-6 text-orange-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Adresse de Facturation</h2>
//                         </div>

//                         <div className="space-y-3">
//                             <div className="rounded-lg bg-orange-50 p-4">
//                                 <div className="mb-2 flex items-center justify-between">
//                                     <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
//                                         {commande.adresseFacturation.libelleAdresse}
//                                     </span>
//                                     <span className="text-xs text-gray-500">
//                                         Réf: {commande.adresseFacturation.refAdresse}
//                                     </span>
//                                 </div>
//                                 <div className="space-y-1 text-sm">
//                                     <p className="font-semibold text-gray-800">
//                                         {commande.adresseFacturation.quartier}
//                                     </p>
//                                     <p className="text-gray-600">
//                                         {commande.adresseFacturation.ville}, {commande.adresseFacturation.codePostal}
//                                     </p>
//                                     <p className="text-gray-600">Lot: {commande.adresseFacturation.lot}</p>
//                                     <p className="text-gray-500">{commande.adresseFacturation.complementAdresse}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Third Row - Products & Payment */}
//             {commande.paniers.length > 0 && (
//                 <div className="grid gap-6 lg:grid-cols-2">
//                     {/* Products */}
//                     <div className="rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-indigo-100 p-3">
//                                 <ShoppingCart className="h-6 w-6 text-indigo-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">
//                                 Produits Commandés ({commande.paniers.length})
//                             </h2>
//                         </div>

//                         <div className="max-h-[400px] space-y-3 overflow-auto">
//                             {commande.paniers.map((panier, index) => (
//                                 <div
//                                     key={index}
//                                     className="flex gap-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 transition-all hover:border-indigo-400 hover:shadow-md"
//                                 >
//                                     <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200">
//                                         <Package className="h-8 w-8 text-indigo-600" />
//                                     </div>
//                                     <div className="flex flex-1 flex-col justify-between">
//                                         <div>
//                                             <p className="font-bold text-gray-800">{panier.produit.nomProduit}</p>
//                                             <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
//                                                 <span className="font-medium">
//                                                     {panier.produit.prixProduit.toLocaleString()} Ar
//                                                 </span>
//                                                 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
//                                                     Stock: {panier.produit.stockProduit}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <div className="mt-2 flex items-center justify-between text-sm">
//                                             <span className="font-semibold text-gray-600">Qté: {panier.quantite}</span>
//                                             <span className="font-bold text-indigo-600">
//                                                 {(panier.produit.prixProduit * panier.quantite).toLocaleString()} Ar
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Payment */}
//                     {commande.paiement && (
                    
//                     <div className="rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-emerald-100 p-3">
//                                 <DollarSign className="h-6 w-6 text-emerald-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Résumé Transaction</h2>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <CreditCard className="h-4 w-4" />
//                                     Méthode
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {commande.paiement?.modePaiment || "Non spécifié"}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Calendar className="h-4 w-4" />
//                                     Date Paiement
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {commande.paiement 
//                                         ? ExtractionDate(commande.paiement.datePaiment, "date", true)
//                                         : "Non spécifié"}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Statut Paiement</span>
//                                 <span className={`rounded-full px-3 py-1 text-sm font-bold ${
//                                     commande.paiement?.statutPaiment === "VALIDE" 
//                                         ? "bg-green-100 text-green-700" 
//                                         : "bg-yellow-100 text-yellow-700"
//                                 }`}>
//                                     {commande.paiement?.statutPaiment || "Non spécifié"}
//                                 </span>
//                             </div>

//                             <div className="border-t-2 border-gray-300 pt-4">
//                                 <div className="mb-3 flex items-start justify-between">
//                                     <span className="font-semibold text-gray-600">Sous-total</span>
//                                     <span className="font-medium text-gray-800">
//                                         {calculerTotal().toLocaleString()} Ar
//                                     </span>
//                                 </div>

//                                 <div className="mb-4 flex items-start justify-between">
//                                     <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                         <Truck className="h-4 w-4" />
//                                         Frais Livraison
//                                     </span>
//                                     <span className="font-medium text-gray-800">
//                                         + {commande.fraisLivraison ? commande.fraisLivraison.toLocaleString() : 0.00} Ar
//                                     </span>
//                                 </div>

//                                 <div className="flex items-start justify-between rounded-lg bg-emerald-50 p-4">
//                                     <span className="text-lg font-bold text-emerald-700">Net à Payer</span>
//                                     <span className="text-xl font-bold text-emerald-600">
//                                         {NetPayer().toLocaleString()} Ar
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>    
//                     )}
//                 </div>
//             )}
//             </div>
//             {showDeleteModal && (
//             <dialog
//                 id="register_modal"
//                 className={`modal ${showDeleteModal ? "modal-open" : ""}`}
//             >
//                 <div className="modal-box max-w-xl bg-slate-200 dark:bg-gray-800">
//                     <form method="dialog">
//                         <button
//                             className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
//                             onClick={() => setShowDeleteModal(false)}
//                         >
//                             ✕
//                         </button>
//                     </form>
//                     <div className="flex justify-center gap-3 items-center">
//                         <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <Trash2 className="h-6 w-6 text-red-600" />
//                         </div>
//                         <h3 className="mb-2 text-xl font-bold text-gray-800">
//                             Confirmer la suppression
//                         </h3>
//                     </div>
//                         <p className="mb-6 text-gray-600 text-center">
//                             Êtes-vous sûr de vouloir supprimer la commande{" "}
//                             <strong className="text-gray-800">{commande.refCommande}</strong> ?
//                             Cette action est irréversible.
//                         </p>
//                     <form
//                     method="dialog"
//                     className="modal-backdrop"
//                     >
//                        <button
//                                 onClick={() => setShowDeleteModal(false)}
//                                 className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={handleDeleteCommande}
//                                 className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
//                             >
//                                 {loading ? (
//                                             <div className="flex flex-row items-center justify-center gap-2">
//                                                 <span className="loading loading-spinner text-accent"></span>
//                                                 <span>Suppression...</span>
//                                             </div>
//                                         ) : (
//                                             "Supprimer"
//                                         )}
//                             </button>
//                     </form>
//                 </div>
//             </dialog>
//                 )}
//             {/* Modal de suppression */}
//             {/* {showDeleteModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//                     <div className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">
                    
//                     <div className="flex justify-center gap-3 items-center">
//                         <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <Trash2 className="h-6 w-6 text-red-600" />
//                         </div>
//                         <h3 className="mb-2 text-xl font-bold text-gray-800">
//                             Confirmer la suppression
//                         </h3>
//                     </div>
//                         <p className="mb-6 text-gray-600">
//                             Êtes-vous sûr de vouloir supprimer la commande{" "}
//                             <strong className="text-gray-800">{commande.refCommande}</strong> ?
//                             Cette action est irréversible.
//                         </p>
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setShowDeleteModal(false)}
//                                 className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={handleDeleteCommande}
//                                 className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
//                             >
//                                 Confirmer
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )} */}

//             {/* Modal de modification du statut */}
//             {showStatusModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//                     <div className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">
//                     <div className="flex justify-center gap-3 items-center">
//                         <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
//                             <Edit className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <h3 className="mb-2 text-xl font-bold text-gray-800">
//                             Modifier le statut
//                         </h3>
//                         </div>
//                         <p className="mb-4 text-gray-600">
//                             Sélectionnez le nouveau statut pour la commande{" "}
//                             <strong className="text-gray-800">{commande.refCommande}</strong>
//                         </p>

//                             <select
//                                 value={selectedStatus}
//                                 onChange={(e) => {
//                                     setNewStatut(e.target.value)
//                                     setSelectedStatus(e.target.value)
//                                 }}
//                                 className="mb-6 w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-800 focus:border-blue-500 focus:outline-none"
//                             >
//                                 <option value={status} disabled>{Transformestatut(status).label}</option>
//                                 {getStatusTransitions(status).map((stat) => (
//                                             <option
//                                                 key={stat}
//                                                 value={stat}
//                                             >
//                                                 {Transformestatut(stat).label}
//                                             </option>
//                                 ))}
                                
//                                 </select>
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setShowStatusModal(false)}
//                                     className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
//                                 >
//                                     Annuler
//                                 </button>
//                                 <button
//                                     onClick={handleChangeStatus}
//                                     className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
//                                 >
//                                      {loading ? (
//                                             <div className="flex flex-row items-center justify-center gap-2">
//                                                 <span className="loading loading-spinner text-white"></span>
//                                                 <span>Confirmation...</span>
//                                             </div>
//                                         ) : (
//                                             "Confirmer"
//                                         )}
                                    
//                                 </button>
//                             </div>
//                     </div>
//                 </div>
//             )}
            
//             <style jsx>{`
//                 @keyframes scale-in {
//                     from {
//                         opacity: 0;
//                         transform: scale(0.9);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: scale(1);
//                     }
//                 }
//             `}</style>
//         </div>
//     );
// };
// export default FicheCommande;

