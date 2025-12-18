import React, { useState, useEffect } from "react"; // Ajout de useEffect
import { User, Mail, Phone, Calendar, MapPin, Trash2, Edit, ArrowLeft, FileText, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";


import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { MdInfoOutline } from "react-icons/md";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Avatar, FormHelperText, Stack } from "@mui/material";
import { InputValidate } from "@/components/InputValidate";
import { MdOutlineEmail } from "react-icons/md";
import { UpdateClient} from "@/services/AdminService";
import { FaUser, FaPhone, FaBirthdayCake } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";

const FicheClient = () => {
    const [messageError, setMessageError] = useState(null);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    // const client = location.state;
    const [client, setCLient] = useState(location.state);
    const retourVersClient = () => {
        navigate("/admin/Users");
    };
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditClientModal, setShowEditClientModal] = useState(false); // Ancien showRoleModal
    const [registerErrors, setRegisterErrors] = useState({}); // L'état pour les erreurs de validation
    const [editData, setEditData] = useState({
        civiliteClient: client?.civiliteClient || "",
        nomClient: client?.nomClient || "",
        prenomClient: client?.prenomClient || "",
        telephoneClient: client?.telephoneClient || "",
        dateNaissance: client?.dateNaissance ? client.dateNaissance.split('T')[0] : "", // Format YYYY-MM-DD pour input type="date"
        email: client?.user?.emailUsers || "",
    });
               
         console.log(client)       
    // Fonction utilitaire pour le formatage des dates
    const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
        const mois = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const str = String(dateTimeString);
        if (str.includes("T")) {
            const [date] = dateTimeString.split('T');
            if (extract === 'date') {
                if (format) {
                    const daty = new Date(dateTimeString);
                    const jour = String(daty.getDate()).padStart(2, '0');
                    const moisIndex = daty.getMonth();
                    const annee = daty.getFullYear();
                    return `${jour} ${mois[moisIndex]} ${annee}`;
                }
                return new Date(date).toLocaleDateString('fr-FR');
            }
        }
        return dateTimeString;
    };

    // Logique pour ouvrir la modal de modification client
    const openEditClientModal = () => {
        // Réinitialiser les données pour l'édition (au cas où on ouvre/ferme plusieurs fois)
        setEditData({
            civiliteClient: client?.civiliteClient || "",
            nomClient: client?.nomClient || "",
            prenomClient: client?.prenomClient || "",
            telephoneClient: client?.telephoneClient || "",
            dateNaissance: client?.dateNaissance ? client.dateNaissance.split('T')[0] : "",
            email: client?.user?.emailUsers || "",
            password: "",
        });
        setRegisterErrors({});
        setMessageError(null);
        setShowEditClientModal(true); // Ouvre la modal
    };

    // Logique pour fermer la modal de modification client
    const closeEditClientModal = () => {
        setShowEditClientModal(false);
        setMessageError(null);
    };

    const getRole = (role) => {
        switch(role){
            case "ROLE_USER":
                return 'Utilisateur Simple'
            case 'ROLE_ADMIN':
                return "Utilisateur Admin"
            default:
                return "Aucun Role"
        }
    }

    // Gestion des changements pour la modification client (réutilisation de la logique d'inscription mais sur `editData`)
    const handleEditClientChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({ ...prevData, [name]: value }));
        setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    // Fonction de validation 
    const validateEditClient = () => {
        let isValid = true;
        let errors = {};
        if (!editData.nomClient) {
            errors.nomClient = "Le nom est requis.";
            isValid = false;
        }
        if (!editData.email) {
            errors.email = "L'email est requis.";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
             errors.email = "Format d'email invalide.";
             isValid = false;
        }
        // Pour l'édition, le mot de passe n'est requis que s'il est rempli, ou vous pouvez le rendre toujours requis si le backend l'exige
        // Je le laisse non requis pour la démonstration de l'édition d'infos générales.
        setRegisterErrors(errors);
        return isValid;
    };

    // Soumission modification client (à implémenter)
    const handleEditClientSubmit = async (e) => {
        e.preventDefault();
        setMessageError(null);
        if (validateEditClient()) {
            const updatedClientData = {
                id:client.user.idUsers,
                refCLient: client.refClient,
                nom: editData.nomClient,
                prenom: editData.prenomClient,
                telephone: editData.telephoneClient,
                civilite: editData.civiliteClient,
                dateNaissance: editData.dateNaissance,
                email: editData.email,
                emailIsModified: false
            };
            console.log("Modification client: ", updatedClientData);

            setLoading(true);
            try {
                                                  const result = await UpdateClient(updatedClientData);
                                                  if (result.data){
                                                    setMessage({
                                                        ouvre: true,
                                                        texte: "L'information du client a été modifiée avec succès.",
                                                        statut: "success",
                                                    });
                                                      setOpen(true);
                                                        setCLient(result.data.client)
                                                      navigate(location.pathname, { state: result.data.client, replace: true });
                                                      console.log("Update avec succes: ",result.data)
                                                  }else{
                                                      setMessage({
                                                          ouvre: true,
                                                          texte: "Une erreur s'est produit lors de la Modification CLient",
                                                          statut: "error",
                                                      });
                                                      setOpen(true);
                                                      console.log("Update Profil: ", result.error)
                                                  }
                closeEditClientModal();
                setOpen(true);
            } catch (error) {
                console.error("Erreur de modification client:", error);
                setMessageError(error.message || "Erreur lors de la modification du client.");
                setMessage({
                    ouvre: true,
                    texte: error.message || "Erreur lors de la modification du client.",
                    statut: "error",
                });
                setOpen(true);
            } finally {
                setLoading(false);
            }
        }
    };


    // Logique pour la suppression (inchangée)
    const handleDeleteClient = () => {
        console.log("Suppression du client:", client.refClient);
        setShowDeleteModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        className="flex items-center gap-2 self-start rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                        onClick={retourVersClient}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Retour à la liste</span>
                    </button>

                    <div className="flex gap-2">
                        {/* Le bouton "Modifier Rôle" appelle maintenant la modal de modification client */}
                        <button
                            onClick={openEditClientModal} // Modifié pour ouvrir la modal de modification client
                            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Modifier Infos Client</span>
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Supprimer</span>
                        </button>
                    </div>
                </div>

                {/* Title Card */}
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-300 to-blue-200 p-6 shadow-xl" style={{ '--accent': '#3b82f6' }}> {/* Utilisation d'un style inline pour simuler l'accent si nécessaire */}
                    <div className="flex items-center gap-3 text-white">
                        <FileText className="h-8 w-8" />
                        <h1 className="text-2xl font-bold md:text-3xl">Fiche Client Détaillée</h1>
                    </div>
                    <p className="mt-2 text-blue-100">Référence: {client.refClient}</p>
                </div>

                {/* Main Content Grid (Inchagagé) */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Client Information Card */}
                    <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-blue-100 p-3">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Information Client
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Référence</span>
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                                    {client.refClient}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Nom complet</span>
                                <span className="text-right font-medium text-gray-800">
                                    {client.civiliteClient} {client.nomClient} {client.prenomClient}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    Naissance
                                </span>
                                <span className="font-medium text-gray-800">
                                    {ExtractionDate(client.dateNaissance, "date", true)}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    Téléphone
                                </span>
                                <span className="font-medium text-gray-800">
                                    {client.telephoneClient}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Account Card */}
                    <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-purple-100 p-3">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Compte Utilisateur
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">ID utilisateur</span>
                                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                                    #{client.user.idUsers}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </span>
                                <span className="text-right font-medium text-gray-800">
                                    {client.user.emailUsers}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="flex items-center gap-2 font-semibold text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    Inscription
                                </span>
                                <span className="font-medium text-gray-800">
                                    {ExtractionDate(client.dateInscription, "date", true)}
                                </span>
                            </div>

                            <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                                <span className="font-semibold text-gray-600">Rôle</span>
                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                                    {getRole(client.user.roleUsers)}

                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Addresses Section (Inchagangé) */}
                {client.adresses && client.adresses.length > 0 && (
                    <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
                            <div className="rounded-lg bg-green-100 p-3">
                                <MapPin className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                adresses ({client.adresses.length})
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {client.adresses.map((adresses, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-400 hover:shadow-md"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                            {adresses.labelleadresses}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Réf: {adresses.refadresses}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-gray-800">
                                            {adresses.quartier}
                                        </p>
                                        <p className="text-gray-600">
                                            {adresses.ville}, {adresses.codePostal}
                                        </p>
                                        {adresses.complementadresses && (
                                            <p className="text-gray-500">
                                                {adresses.complementadresses}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de suppression  */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex justify-center gap-3 items-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-800">
                                Confirmer la suppression
                            </h3>
                        </div>
                        <p className="mb-6 text-gray-600">
                            Êtes-vous sûr de vouloir supprimer le client{" "}
                            <strong className="text-gray-800">
                                {client.nomClient} {client.prenomClient}
                            </strong>{" "}
                            ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteClient}
                                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de modification client */}
            <dialog
                id="edit_client_modal"
                className={`modal ${showEditClientModal ? "modal-open" : ""}`}
            >
                <div className="modal-box max-w-2xl bg-slate-200 dark:bg-gray-800">
                    <form method="dialog">
                        <button
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={closeEditClientModal}
                        >
                            ✕
                        </button>
                    </form>

                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Modifier les Informations Client {client.refClient}</h3>
                
                    <form onSubmit={handleEditClientSubmit}>
                        {messageError && (
                            <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
                                <MdInfoOutline size={20} />
                                <span> {messageError}</span>
                            </div>
                        )}
                            
                        <div className="mb-5 flex h-[400px] flex-col items-center justify-center overflow-y-auto px-4">
                            
                            <div className="mt-4 w-2/3 items-start">
                                <FormControl error={!!registerErrors.civiliteClient}>
                                    <FormLabel
                                        id="choix-label"
                                        className="text-gray-600 dark:text-slate-300"
                                    >
                                        Civilité du Client
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="civiliteClient"
                                        value={editData.civiliteClient || ""}
                                        className="gap-5 text-gray-600 dark:text-slate-300"
                                        onChange={handleEditClientChange}
                                    >
                                        <FormControlLabel
                                            value="Mr"
                                            control={<Radio />}
                                            label="Mr"
                                        />
                                        <FormControlLabel
                                            value="Mme"
                                            control={<Radio />}
                                            label="Mme"
                                        />
                                        <FormControlLabel
                                            value="Mlle"
                                            control={<Radio />}
                                            label="Mlle"
                                        />
                                    </RadioGroup>
                                    <FormHelperText>{registerErrors.civiliteClient}</FormHelperText>
                                </FormControl>
                            </div>

                            <InputValidate
                                IconComponent={FaUser}
                                type="text"
                                largeur="full"
                                placeholder="Nom du client..."
                                title="Nom"
                                name="nomClient"
                                value={editData.nomClient}
                                onChange={(val) => handleEditClientChange({ target: { name: "nomClient", value: val } })}
                                error={!!registerErrors.nomClient}
                                helperText={registerErrors.nomClient}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                            <InputValidate
                                IconComponent={IoPerson}
                                type="text"
                                largeur="full"
                                placeholder="Prénom du client..."
                                title="Prénom"
                                name="prenomClient"
                                value={editData.prenomClient}
                                onChange={(val) => handleEditClientChange({ target: { name: "prenomClient", value: val } })}
                                error={!!registerErrors.prenomClient}
                                helperText={registerErrors.prenomClient}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />

                            <InputValidate
                                IconComponent={FaPhone}
                                type="tel"
                                largeur="full"
                                placeholder="Numéro de téléphone du client..."
                                title="Téléphone"
                                name="telephoneClient"
                                value={editData.telephoneClient}
                                onChange={(val) => handleEditClientChange({ target: { name: "telephoneClient", value: val } })}
                                error={!!registerErrors.telephoneClient}
                                helperText={registerErrors.telephoneClient}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />

                            <InputValidate
                                IconComponent={CalendarDateRangeIcon}
                                type="date"
                                largeur="full"
                                placeholder="Date de naissance du client..."
                                title="Date de naissance"
                                value={editData.dateNaissance || ""}
                                onChange={(val) => handleEditClientChange({ target: { name: "dateNaissance", value: val } })}
                                error={!!registerErrors.dateNaissance}
                                helperText={registerErrors.dateNaissance}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                            <InputValidate
                                IconComponent={MdOutlineEmail}
                                type="email"
                                largeur="full"
                                placeholder="Email du client..."
                                title="Email"
                                name="email"
                                value={editData.email}
                                onChange={(val) => handleEditClientChange({ target: { name: "email", value: val } })}
                                error={!!registerErrors.email}
                                helperText={registerErrors.email}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />

                        </div>

                        <div className="modal-action justify-center">
                            <button
                                type="button"
                                onClick={closeEditClientModal}
                                className="btn btn-error px-4 btn-outline btn-wide"
                            >
                               Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn btn-accent px-4 btn-outline btn-wide"
                            >
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <span className="loading loading-spinner text-accent"></span>
                                        <span>Modification en cours...</span>
                                    </div>
                                ) : (
                                    "Modifier"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Backdrop pour fermer le modal */}
                <form
                    method="dialog"
                    className="modal-backdrop"
                >
                    <button onClick={closeEditClientModal}>close</button>
                </form>
            </dialog>
            {/* Snackbar pour les messages (à adapter si vous voulez l'utiliser) */}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity={message.statut}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {message.texte}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default FicheClient;

// import React, { useState } from "react";
// import { User, Mail, Phone, Calendar, MapPin, Trash2, Edit, ArrowLeft, FileText, Shield } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";


// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import Logo from "../../image/Logo.png";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import logoBleu from "@/image/logoBleu.png";
// import { MdInfoOutline } from "react-icons/md";
// import { IoMdSearch } from "react-icons/io";
// import { FaCartShopping } from "react-icons/fa6";
// import DarkMode from "./DarkMode";
// import { LoginVerifier,RegistreVerifier } from "@/services/ClientService";
// import { Link } from "react-router-dom";
// import { useNavbar } from "../context/NavbarContext";
// import { MdOutlineStarRate } from "react-icons/md";
// import Panier from "../Pages/Commande/Panier";
// import { RiHome5Fill } from "react-icons/ri";
// import { MdBookmarkBorder } from "react-icons/md";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import { Avatar, FormHelperText, Stack } from "@mui/material";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { InputValidate } from "@/components/InputValidate";
// import { MdOutlineEmail } from "react-icons/md";
// import { RiKeyFill } from "react-icons/ri";
// import { FaUser, FaPhone, FaBirthdayCake } from "react-icons/fa";
// import { IoPerson } from "react-icons/io5";

// const FicheClient = () => {
//         const { user, login, logout, isAuthenticated, register } = useAuthContext();
//         const [ouvrePanier, setOuvrePanier] = useState(false);
//         const [messageError, setMessageError] = useState(null);
//         const [open, setOpen] = useState(false);
//         const [message, setMessage] = useState({
//             ouvre: false,
//             texte: "vide",
//             statut: "success",
//         });
//         const [loading, setLoading] = useState(false);
//         const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

//     const location = useLocation();
//     const navigate = useNavigate();
//     const client = location.state;
//     const retourVersClient = () => {
//         navigate("/admin/Users");
//     };


//     const openRegisterModal = () => {
//         setIsRegisterModalOpen(true);
//         setRegisterErrors({});
//         setMessageError(null)
//     };

//         // Soumission inscription
//         const handleRegisterSubmit = async (e) => {
//             e.preventDefault();
//             setMessageError(null)
//             if (validateRegister()) {
//                 const NewUser = {
//                     nom: registerData.nomClient,
//                     prenom: registerData.prenomClient,
//                     telephone: registerData.telephoneClient,
//                     civilite: registerData.civiliteClient,
//                     dateNaissance: registerData.dateNaissance,
//                     email: registerData.email,
//                     password: registerData.password,
//                 };
//                 console.log("Nouvelle inscription: ", NewUser);
//                 setLoading(true);
//                 const dataVerifier = {
//                     email: NewUser.email,
//                     role: "ROLE_USER",
//                     password: NewUser.password,
//                 };
//                 setLoading(true);
//                 try {
//                     const response = await RegistreVerifier(dataVerifier);
//                     if (response.data) {
//                         const enregistre = await register(NewUser);
//                         if (enregistre.success) {
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "La création de votre Compte est réussie.",
//                                 statut: "success",
//                             });
//                             setRegisterData({
//                                 civiliteClient: "",
//                                 nomClient: "",
//                                 prenomClient: "",
//                                 email: "",
//                                 password: "",
//                                 telephoneClient: "",
//                                 dateNaissance: "",
//                             });
//                             setIsRegisterModalOpen(false);
//                             setOpen(true);
//                             setLoading(false);
//                         } else {
//                             setMessageError(enregistre.error, "Erreur de connexion.");
//                             setMessage({
//                                 ouvre: true,
//                                 texte: enregistre.error || "Erreur de connexion.",
//                                 statut: "error",
//                             });
//                             setOpen(true);
//                             console.log(" Registre NavBar: ", enregistre.error);
//                             setLoading(false);
//                         }
//                     } else {
//                         setMessageError("Votre email est déjà utilisé par un autre compte");
//                         setMessage({
//                             ouvre: true,
//                             texte: "Votre email est utilisé par un autre compte",
//                             statut: "error",
//                         });
//                         setOpen(true);
//                         console.log("RegistreVerifier Navbar: ",response.error)
//                     }
//                     setLoading(false);
//                 } catch (error) {
//                     console.error("Erreur d'inscription:", error);
//                 }
//             }
//         };

//             // Gestion des changements pour l'inscription
//     const handleRegisterChange = (e) => {
//         const { name, value } = e.target;
//         setRegisterData((prevData) => ({ ...prevData, [name]: value }));
//         setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     };

//     const closeRegisterModal = () => {
//         setIsRegisterModalOpen(false);
//         setRegisterData({
//             civiliteClient: "",
//             nomClient: "",
//             prenomClient: "",
//             email: "",
//             password: "",
//             telephoneClient: "",
//             dateNaissance: "",
//         });
//     };
//     console.log("Données client reçues: ", client);

//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [showRoleModal, setShowRoleModal] = useState(false);
//     const [selectedRole, setSelectedRole] = useState(client?.user?.roleUsers || "client");

//     const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
//         const mois = [
//             'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
//             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
//         ];
//         const str = String(dateTimeString);
//         if (str.includes("T")) {
//             const [date] = dateTimeString.split('T');
//             if (extract === 'date') {
//                 if (format) {
//                     const daty = new Date(dateTimeString);
//                     const jour = String(daty.getDate()).padStart(2, '0');
//                     const moisIndex = daty.getMonth();
//                     const annee = daty.getFullYear();
//                     return `${jour} ${mois[moisIndex]} ${annee}`;
//                 }
//                 return new Date(date).toLocaleDateString('fr-FR');
//             }
//         }
//         return dateTimeString;
//     };

//     const handleDeleteClient = () => {
//         console.log("Suppression du client:", client.refClient);
//         alert(`Client ${client.refClient} supprimé avec succès !`);
//         setShowDeleteModal(false);
//     };

//     const handleChangeRole = () => {
//         console.log("Changement de rôle vers:", selectedRole);
//         alert(`Rôle modifié vers: ${selectedRole}`);
//         setShowRoleModal(false);
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
//             <div className="mx-auto max-w-7xl">
//                 {/* Header */}
//                 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//                     <button
//                         className="flex items-center gap-2 self-start rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
//                         onClick={retourVersClient}
//                     >
//                         <ArrowLeft className="h-5 w-5" />
//                         <span className="font-medium">Retour à la liste</span>
//                     </button>

//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => setShowRoleModal(true)}
//                             className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
//                         >
//                             <Edit className="h-4 w-4" />
//                             <span className="hidden sm:inline">Modifier Rôle</span>
//                         </button>
//                         <button
//                             onClick={() => setShowDeleteModal(true)}
//                             className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg"
//                         >
//                             <Trash2 className="h-4 w-4" />
//                             <span className="hidden sm:inline">Supprimer</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Title Card */}
//                 <div className="mb-6 rounded-2xl bg-gradient-to-r from-accent to-accent p-6 shadow-xl">
//                     <div className="flex items-center gap-3 text-white">
//                         <FileText className="h-8 w-8" />
//                         <h1 className="text-2xl font-bold md:text-3xl">Fiche Client Détaillée</h1>
//                     </div>
//                     <p className="mt-2 text-blue-100">Référence: {client.refClient}</p>
//                 </div>

//                 {/* Main Content Grid */}
//                 <div className="grid gap-6 lg:grid-cols-2">
//                     {/* Client Information Card */}
//                     <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-blue-100 p-3">
//                                 <User className="h-6 w-6 text-blue-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">
//                                 Information Client
//                             </h2>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Référence</span>
//                                 <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
//                                     {client.refClient}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Nom complet</span>
//                                 <span className="text-right font-medium text-gray-800">
//                                     {client.civiliteClient} {client.nomClient} {client.prenomClient}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Calendar className="h-4 w-4" />
//                                     Naissance
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {ExtractionDate(client.dateNaissance, "date", true)}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Phone className="h-4 w-4" />
//                                     Téléphone
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {client.telephoneClient}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* User Account Card */}
//                     <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-purple-100 p-3">
//                                 <Shield className="h-6 w-6 text-purple-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">
//                                 Compte Utilisateur
//                             </h2>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">ID utilisateur</span>
//                                 <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
//                                     #{client.user.idUsers}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Mail className="h-4 w-4" />
//                                     Email
//                                 </span>
//                                 <span className="text-right font-medium text-gray-800">
//                                     {client.user.emailUsers}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="flex items-center gap-2 font-semibold text-gray-600">
//                                     <Calendar className="h-4 w-4" />
//                                     Inscription
//                                 </span>
//                                 <span className="font-medium text-gray-800">
//                                     {ExtractionDate(client.dateInscription, "date", true)}
//                                 </span>
//                             </div>

//                             <div className="flex items-start justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
//                                 <span className="font-semibold text-gray-600">Rôle</span>
//                                 <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold uppercase text-green-700">
//                                     {client.user.roleUsers}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Addresses Section */}
//                 {client.adresses && client.adresses.length > 0 && (
//                     <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg">
//                         <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
//                             <div className="rounded-lg bg-green-100 p-3">
//                                 <MapPin className="h-6 w-6 text-green-600" />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">
//                                 adresses ({client.adresses.length})
//                             </h2>
//                         </div>

//                         <div className="grid gap-4 md:grid-cols-2">
//                             {client.adresses.map((adresses, index) => (
//                                 <div
//                                     key={index}
//                                     className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-400 hover:shadow-md"
//                                 >
//                                     <div className="mb-2 flex items-center justify-between">
//                                         <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
//                                             {adresses.labelleadresses}
//                                         </span>
//                                         <span className="text-xs text-gray-500">
//                                             Réf: {adresses.refadresses}
//                                         </span>
//                                     </div>
//                                     <div className="space-y-1 text-sm">
//                                         <p className="font-semibold text-gray-800">
//                                             {adresses.quartier}
//                                         </p>
//                                         <p className="text-gray-600">
//                                             {adresses.ville}, {adresses.codePostal}
//                                         </p>
//                                         {adresses.complementadresses && (
//                                             <p className="text-gray-500">
//                                                 {adresses.complementadresses}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Modal de suppression */}
//             {showDeleteModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//                     <div className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">
//                         <div className="flex justify-center gap-3 items-center">
//                             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                                 <Trash2 className="h-6 w-6 text-red-600" />
//                             </div>
//                             <h3 className="mb-2 text-xl font-bold text-gray-800">
//                                 Confirmer la suppression
//                             </h3>
//                         </div>
//                         <p className="mb-6 text-gray-600">
//                             Êtes-vous sûr de vouloir supprimer le client{" "}
//                             <strong className="text-gray-800">
//                                 {client.nomClient} {client.prenomClient}
//                             </strong>{" "}
//                             ? Cette action est irréversible.
//                         </p>
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setShowDeleteModal(false)}
//                                 className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={handleDeleteClient}
//                                 className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
//                             >
//                                 Supprimer
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <dialog
//                 id="register_modal"
//                 className={`modal ${showRoleModal ? "modal-open" : ""}`}
//             >
//                 <div className="modal-box max-w-2xl bg-slate-200 dark:bg-gray-800">
//                     <form method="dialog">
//                         <button
//                             className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
//                             onClick={closeRegisterModal}
//                         >
//                             ✕
//                         </button>
//                     </form>

//                     <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Créez votre compte</h3>

//                     <form onSubmit={handleRegisterSubmit}>
//                         {messageError && (
//                                 <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
//                                 <MdInfoOutline size={20} />
//                                 <span> {messageError}</span>
//                             </div>
//                         )} 
                            
//                         <div className="mb-5 flex h-[400px] flex-col items-center justify-center overflow-y-auto px-4">
                            
//                             <div className="mt-4 w-2/3 items-start">
//                                 <FormControl error={!!registerErrors.civiliteClient}>
//                                     <FormLabel
//                                         id="choix-label"
//                                         className="text-gray-600 dark:text-slate-300"
//                                     >
//                                         Civilité du Client
//                                     </FormLabel>
//                                     <RadioGroup
//                                         row
//                                         aria-labelledby="demo-row-radio-buttons-group-label"
//                                         name="civiliteClient"
//                                         value={registerData.civiliteClient || ""}
//                                         className="gap-5 text-gray-600 dark:text-slate-300"
//                                         onChange={handleRegisterChange}
//                                     >
//                                         <FormControlLabel
//                                             value="Mr"
//                                             control={<Radio />}
//                                             label="Mr"
//                                         />
//                                         <FormControlLabel
//                                             value="Mme"
//                                             control={<Radio />}
//                                             label="Mme"
//                                         />
//                                         <FormControlLabel
//                                             value="Mlle"
//                                             control={<Radio />}
//                                             label="Mlle"
//                                         />
//                                     </RadioGroup>
//                                     <FormHelperText>{registerErrors.civiliteClient}</FormHelperText>
//                                 </FormControl>
//                             </div>

//                             <InputValidate
//                                 IconComponent={FaUser}
//                                 type="text"
//                                 largeur="full"
//                                 placeholder="Votre nom..."
//                                 title="Nom"
//                                 name="nomClient"
//                                 value={registerData.nomClient}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "nomClient", value: val } })}
//                                 error={!!registerErrors.nomClient}
//                                 helperText={registerErrors.nomClient}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                             <InputValidate
//                                 IconComponent={IoPerson}
//                                 type="text"
//                                 largeur="full"
//                                 placeholder="Votre prénom..."
//                                 title="Prénom"
//                                 name="prenomClient"
//                                 value={registerData.prenomClient}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "prenomClient", value: val } })}
//                                 error={!!registerErrors.prenomClient}
//                                 helperText={registerErrors.prenomClient}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />

//                             <InputValidate
//                                 IconComponent={FaPhone}
//                                 type="tel"
//                                 largeur="full"
//                                 placeholder="Votre numéro de téléphone..."
//                                 title="Téléphone"
//                                 name="telephoneClient"
//                                 value={registerData.telephoneClient}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "telephoneClient", value: val } })}
//                                 error={!!registerErrors.telephoneClient}
//                                 helperText={registerErrors.telephoneClient}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />

//                             <InputValidate
//                                 IconComponent={CalendarDateRangeIcon}
//                                 type="date"
//                                 largeur="full"
//                                 placeholder="Entrez votre date de naissance..."
//                                 title="Date de naissance"
//                                 value={registerData.dateNaissance || ""}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "dateNaissance", value: val } })}
//                                 error={!!registerErrors.dateNaissance}
//                                 helperText={registerErrors.dateNaissance}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                             <InputValidate
//                                 IconComponent={MdOutlineEmail}
//                                 type="email"
//                                 largeur="full"
//                                 placeholder="Entrez votre Email..."
//                                 title="Email"
//                                 name="email"
//                                 value={registerData.email}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "email", value: val } })}
//                                 error={!!registerErrors.email}
//                                 helperText={registerErrors.email}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />

//                             <InputValidate
//                                 IconComponent={RiKeyFill}
//                                 type="password"
//                                 largeur="full"
//                                 placeholder="Créez votre mot de passe..."
//                                 title="Mot de Passe"
//                                 name="password"
//                                 value={registerData.password}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "password", value: val } })}
//                                 error={!!registerErrors.password}
//                                 helperText={registerErrors.password}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                         </div>

//                         <div className="modal-action justify-center">
//                             <button
//                                 type="submit"
//                                 className="btn btn-accent btn-outline btn-wide"
//                             >
//                                 {loading ? (
//                                     <div className="flex flex-row items-center justify-center gap-2">
//                                         <span className="loading loading-spinner text-accent"></span>
//                                         <span>Modification en cours...</span>
//                                     </div>
//                                 ) : (
//                                     "Modifier l'information du client"
//                                 )}
//                             </button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Backdrop pour fermer le modal */}
//                 <form
//                     method="dialog"
//                     className="modal-backdrop"
//                 >
//                     <button onClick={closeRegisterModal}>close</button>
//                 </form>
//             </dialog>

//             {/* Modal de modification du rôle (ancienne) <= modifer ici par le modal au dessus pour une modal de Mofication infos client */}
//             {showRoleModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//                     <div className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl">
//                         <div className="flex justify-center gap-3 items-center">
//                             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
//                                 <Edit className="h-6 w-6 text-blue-600" />
//                             </div>
//                             <h3 className="mb-2 text-xl font-bold text-gray-800">
//                                     Modifier le rôle
//                             </h3>
//                         </div>
//                         <p className="mb-4 text-gray-600">
//                             Sélectionnez le nouveau rôle pour{" "}
//                             <strong className="text-gray-800">
//                                 {client.nomClient} {client.prenomClient}
//                             </strong>
//                         </p>
//                         <select
//                             value={selectedRole}
//                             onChange={(e) => setSelectedRole(e.target.value)}
//                             className="mb-6 w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-800 focus:border-blue-500 focus:outline-none"
//                         >
//                             <option value="ROLE_USER">Client</option>
//                             <option value="ROLE_ADMIN">Administrateur</option>
//                         </select>
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setShowRoleModal(false)}
//                                 className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={handleChangeRole}
//                                 className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
//                             >
//                                 Confirmer
//                             </button>
//                         </div>
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

// export default FicheClient;

// import { string } from "prop-types";
// import React from "react";
// import { FaCartShopping, FaLocationArrow, FaShopify, FaUserTag } from "react-icons/fa6";
// import { GrDocumentText } from "react-icons/gr";
// import { IoMdArrowRoundBack } from "react-icons/io";
// import { MdLocationOn, MdOutlineMonetizationOn } from "react-icons/md";
// import { RiMoneyDollarCircleFill } from "react-icons/ri";
// import { useLocation, useNavigate } from "react-router-dom";
// // import { string } from 'prop-types';

// const FicheClient = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const client = location.state;
//     const retourVersClient = () => {
//         navigate("/admin/Users");
//     };

//     console.log("Données client reçues: ", client);

//     const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
//         const mois = [
//             'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
//             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
//           ];
//         const str = String(dateTimeString); 
//         if (str.includes("T")){
//             const [date, fullTime] = dateTimeString.split('T');
//             const time = fullTime.split('+')[0];
    
//             if (extract === 'date') {
//                 if (format) {
//                     const daty = new Date(dateTimeString);
//                     const jour = String(daty.getDate()).padStart(2, '0');
//                     const moisIndex = daty.getMonth();
//                     const annee = daty.getFullYear();
//                     return `${jour} ${mois[moisIndex]} ${annee}`;
//                 }
//                 return new Date(date).toLocaleDateString('fr-FR');
//             } else if (extract === 'time') {
//                 return time;
//             } else {
//                 return new Date(date).toLocaleDateString('fr-FR');
//             }
//         } else {
//             const ddd = String(dateTimeString.date); 
//             const date = ddd.slice(0,10);
//             const time = ddd.slice(11,19);
//             if (extract === 'date') {
//                 if (format) {
//                                 const daty = new Date(date);
//                                 const jour = String(daty.getDate()).padStart(2, '0');
//                                 const moisIndex = daty.getMonth();
//                                 const annee = daty.getFullYear();
//                                 return `${jour} ${mois[moisIndex]} ${annee}`;
//                 }
//                 return new Date(date).toLocaleDateString('fr-FR');
//             } else if (extract === 'time') {
//                 return time;
//             }
//         }
//     }

//     return (
//         <div className="rounded-lg bg-white p-2 text-black transition-colors dark:bg-slate-900 dark:text-white">
//             <div className="flex flex-col items-start">
//                 <button
//                     className="btn btn-accent btn-ghost btn-sm"
//                     onClick={retourVersClient}
//                 >
//                     <IoMdArrowRoundBack /> Retour à la Liste Client{" "}
//                 </button>
//                 <div className="mb-4 flex w-full items-center justify-center">
//                     <h1 className="flex items-center gap-2 font-bold text-accent">
//                         {" "}
//                         <GrDocumentText /> DETAILS DU CLIENT
//                     </h1>
//                 </div>
//                 <div className="mb-4 gap-4 flex w-full flex-col px-3 md:flex-col lg:flex-row">
//                     <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
//                         <h1 className="mb-2 pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
//                             <FaUserTag /> Information sur le client
//                         </h1>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Référence client</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{client.refClient}</span>
//                         </div>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Nom complet</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 {" "}
//                                 {client.civiliteClient} {client.nomClient} {client.prenomClient}
//                             </span>
//                         </div>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Date de Naissance</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ExtractionDate(client.dateNaissance,"date",true)}</span>
//                         </div>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Téléphone</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{client.telephoneClient}</span>
//                         </div>
//                     </div>
//                     <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 p-2 dark:border-slate-800 md:w-full lg:w-1/2">
//                         <h1 className="mb-2 pt-1 flex items-center gap-2 font-bold text-gray-600 dark:text-gray-200">
//                             <FaUserTag /> Information sur le compte utilisateur
//                         </h1>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">ID utilisateur</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{client.user.idUsers}</span>
//                         </div>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Email Utilisateur</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 {client.user.emailUsers}
//                             </span>
//                         </div>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Date d'inscription</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ExtractionDate(client.dateInscription,"date",true)}</span>
//                         </div>
//                         <div className="flex w-full items-center justify-between px-1 py-1">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Role User</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{client.user.roleUsers}</span>
//                         </div>
//                     </div>
//                 </div>
//                 {/* suite d'affichage */}
                
//             </div>
//         </div>
//     );
// };

// export default FicheClient;

// voici le format de donnée recu par le navigateur via le state:  
// client: {
//   idClient: 1,
//   refClient: "CLT-0001",
//   nomClient: "Doe",
//   prenomClient: "John",
//   civiliteClient: "M.",
//   dateNaissance: "1990-01-15T00:00:00+00:00",
//   telephoneClient: "+33123456789",
//   dateInscription: "2023-10-01T10:30:00+00:00",
//   user: {
//     idUsers: 101,
//     emailUsers: "email.gmail.com",
//     roleUsers: "client"
//   }
//   adresses: [
//     1:{
//         refadresses: 201,
//         quartier: "123 Rue Exemple",
//         ville: "Paris",
//         codePostal: "75001",
//         labelleadresses: "France",
//         complementadresses: "Appartement 4B"
//     }
//     2:{
//         refadresses: 201,
//         quartier: "123 Rue Exemple",
//         ville: "Paris",
//         codePostal: "75001",
//         labelleadresses: "France",
//         complementadresses: "Appartement 4B"
//     }
//  .....
// ]
// }