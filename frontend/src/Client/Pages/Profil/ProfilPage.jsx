import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaMapMarkerAlt, FaPlus, FaTrash, FaStar } from 'react-icons/fa';
import { MdEmail, MdPhone, MdPerson, MdCalendarToday, MdSave, MdCancel, MdLocationOn, MdAddLocation, MdInfoOutline } from 'react-icons/md';
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { InputValidate } from "@/components/InputValidate";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
import { FaUserCheck, FaUserLock } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { getClientAddresses ,CreateNewAdresse, deleteAdresse, updateClientAddress, UpdateClient } from "@/services/ClientService";

const ProfilePage = () => {
    const { user, isAuthenticated, logout, updateUserProfile } = useAuthContext();
    const navigate = useNavigate();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openEditAddressDialog, setOpenEditAddressDialog] = useState(false);
    const [loadDelete, setLoadDelete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    
    // États pour la gestion des adresses
    const [refClient, setRefClient] = useState('');
    const [adressesClient, setAdressesClient] = useState([]);
    const [chargementAdresses, setChargementAdresses] = useState(false);
    const [initialEmail, setInitialEmail] = useState('');
    const [newAddress, setNewAddress] = useState({
        labelle: '',
        ville: '',
        codePostal: '',
        quartier: '',
        lot: '',
        complement: '',
    });
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressErrors, setAddressErrors] = useState({});

    // États pour le dialogue de suppression
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Rediriger si non authentifié
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Initialiser les données du formulaire
    useEffect(() => {
        if (user && user.client) {
            setFormData({
                id: user.idUsers,
                nom: user.client.nomClient || '',
                prenom: user.client.prenomClient || '',
                email: user.emailUsers || user.email || '',
                telephone: user.client.telephoneClient || '',
                civilite: user.client.civiliteClient || '',
                dateNaissance: user.client.dateNaissance || '',
                emailIsModified: false
            });
            setInitialEmail(user.emailUsers);
            setRefClient(user.client.refClient)
        }
    }, [user]);

    // Charger les adresses du client
    const getAdresses = async () => {
        if (isAuthenticated && user.client) {
            setChargementAdresses(true);
            try {
                const reponseAdresses = await getClientAddresses();
                const listeAdresses = reponseAdresses.adresse;
                if (listeAdresses && listeAdresses.length > 0) {
                    const adressesTriees = listeAdresses.sort((a, b) => b.id - a.id);
                    setAdressesClient(adressesTriees);
                } else {
                    setAdressesClient([]);
                }
            } catch (erreur) {
                console.log("Erreur de chargement des adresses:", erreur);
                setMessage({
                    ouvre: true,
                    texte: "Erreur lors du chargement des adresses",
                    statut: "error",
                });
                setOpen(true);
            } finally {
                setChargementAdresses(false);
            }
        }
    };

    useEffect(() => {
        getAdresses();
    }, [isAuthenticated, user]);

    // Fonction pour gérer la modification d'adresse
    const handleEditAddress = async (editedAddress) => {
        try {
            console.log("Adresse à modifier: ", editedAddress);
            const response = await updateClientAddress(editedAddress);
            if (response) {
                await getAdresses();
                setMessage({
                    ouvre: true,
                    texte: "Adresse modifiée avec succès",
                    statut: "success",
                });
                setOpen(true);
                setOpenEditAddressDialog(false);
                setEditingAddress(null);
            }
        } catch (error) {
            console.error("Erreur lors de la modification de l'adresse:", error);
            setMessage({
                ouvre: true,
                texte: "Erreur lors de la modification de l'adresse",
                statut: "error",
            });
            setOpen(true);
        }
    };

    // Fonction pour ouvrir la modal d'édition d'adresse
    const handleOpenEditAddress = (address) => {
        setEditingAddress(address);
        setOpenEditAddressDialog(true);
    };

    // Fonction pour ouvrir le dialogue de suppression
    const handleDeleteAddressClick = (addressId) => {
        setAddressToDelete(addressId);
        setIsDeleteModalOpen(true);
    };

    // Fonction pour confirmer la suppression
    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        
        setLoadDelete(true);
        try {
            const result = await deleteAdresse(refClient, addressToDelete)
            if (result.data){
                await getAdresses()
                setMessage({
                    ouvre: true,
                    texte: "Adresse supprimée avec succès",
                    statut: "success",
                });
                setOpen(true);
                console.log(result.data)
            }
            else{
                console.log(result)
                setMessage({
                    ouvre: true,
                    texte: "Erreur de suppression Adresse",
                    statut: "warning",
                });
                setOpen(true);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'adresse:", error);
            setMessage({
                ouvre: true,
                texte: "Erreur lors de la suppression de l'adresse",
                statut: "error",
            });
            setOpen(true);
        } finally {
            setLoadDelete(false);
            setIsDeleteModalOpen(false);
            setAddressToDelete(null);
        }
    };

    // Fonction pour fermer le dialogue de suppression
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setAddressToDelete(null);
    };

    // Fonction pour définir une adresse comme principale
    const handleSetPrincipalAddress = (addressId) => {
        setAdressesClient(prev => prev.map(addr => ({
            ...addr,
            principal: addr.id === addressId
        })));
        setMessage({
            ouvre: true,
            texte: "Adresse principale mise à jour",
            statut: "success",
        });
        setOpen(true);
    };

    const validateEmailFormat = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.civilite) {
            tempErrors.civilite = "La civilité est requise";
            isValid = false;
        }
        if (!formData.nom || formData.nom.trim() === "") {
            tempErrors.nom = "Le nom est requis";
            isValid = false;
        }
        if (!formData.prenom || formData.prenom.trim() === "") {
            tempErrors.prenom = "Le prénom est requis";
            isValid = false;
        }
        if (!formData.email || !validateEmailFormat(formData.email)) {
            tempErrors.email = "Une adresse email valide est requise";
            isValid = false;
        }
        if (!formData.dateNaissance) {
            tempErrors.dateNaissance = "Veuillez choisir votre date de naissance";
            isValid = false;
        }
        if (!formData.telephone || formData.telephone.trim() === "") {
            tempErrors.telephone = "Le numéro de téléphone est requis";
            isValid = false;
        } else if (!/^\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
            tempErrors.telephone = "Numéro de téléphone invalide";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const validateAddressForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!newAddress.ville || newAddress.ville.trim() === "") {
            tempErrors.ville = "La ville est requise";
            isValid = false;
        }
        if (!newAddress.labelle || newAddress.labelle.trim() === "") {
            tempErrors.labelle = "Mentionner le label de votre adresse, ce champ est requis.";
            isValid = false;
        }
        if (!newAddress.codePostal || !/^\d+$/.test(newAddress.codePostal)) {
            tempErrors.codePostal = "Le code postal est requis et doit contenir uniquement des chiffres";
            isValid = false;
        }
        if (!newAddress.quartier || newAddress.quartier.trim() === "") {
            tempErrors.quartier = "Le quartier est requis";
            isValid = false;
        }
        if (!newAddress.lot || newAddress.lot.trim() === "") {
            tempErrors.lot = "Le lot est requis";
            isValid = false;
        }
        if (!newAddress.complement || newAddress.complement.trim() === "") {
            tempErrors.complement = "La description est requise";
            isValid = false;
        }

        setAddressErrors(tempErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleAddressChange = (field, value) => {
        setNewAddress(prev => ({ ...prev, [field]: value }));
        setAddressErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleEditAddressChange = (field, value) => {
        setEditingAddress(prev => ({ ...prev, [field]: value }));
        setAddressErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleSaveProfile = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            console.log("Profil à modifier: ", formData);
            const result = await UpdateClient(formData);
            if (result.data) {
                setMessage({
                    ouvre: true,
                    texte: "Profil mis à jour avec succès",
                    statut: "success",
                });
                setOpen(true);
                console.log("Update avec succès: ", result.data);
                const users = result.data;
                setFormData({
                    id: users.idUsers,
                    nom: users.client.nomClient || '',
                    prenom: users.client.prenomClient || '',
                    email: users.emailUsers || '',
                    telephone: users.client.telephoneClient || '',
                    civilite: users.client.civiliteClient || '',
                    dateNaissance: users.client.dateNaissance || '',
                    emailIsModified: false
                });
                localStorage.removeItem('user');
                localStorage.setItem('user', JSON.stringify(result.data));
            } else {
                setMessage({
                    ouvre: true,
                    texte: "Une erreur s'est produite lors de la mise à jour du profil",
                    statut: "error",
                });
                setOpen(true);
                console.log("Update Profil: ", result.error);
            }
            setOpenEditDialog(false);
        } catch (error) {
            setMessage({
                ouvre: true,
                texte: "Erreur lors de la mise à jour du profil",
                statut: "error",
            });
            setOpen(true);
        }
        setLoading(false);
    };

    const handleAddAddress = async () => {
        if (!validateAddressForm()) return;

        setLoading(true);
        try {
            const newAdresse = {
                ville: newAddress.ville,
                quartier: newAddress.quartier,
                lot: newAddress.lot,
                description: newAddress.complement,
                labelle: newAddress.labelle,
                codePostal: newAddress.codePostal
            }
            const result = await CreateNewAdresse(newAdresse)
            if (result.data){
                setMessage({
                    ouvre: true,
                    texte: "Adresse ajoutée avec succès",
                    statut: "success",
                });
                setOpen(true);
                console.log("result CreateADresse:", result.data)
                await getAdresses()
            }else{
                setMessage({
                    ouvre: true,
                    texte: "Probleme lors de l'ajout de l'adresse",
                    statut: "error",
                });
                setOpen(true);
                console.log("Erreur create adresse: ", result)
            }
            setNewAddress({
                labelle: '',
                ville: '',
                codePostal: '',
                quartier: '',
                lot: '',
                complement: '',
            });
            setOpenAddressDialog(false);
        } catch (error) {
            setMessage({
                ouvre: true,
                texte: "Erreur lors de l'ajout de l'adresse",
                statut: "error",
            });
            setOpen(true);
            console.log("Erreur create adresse (try/catch): ", error)
        }finally{
            setLoading(false);
        }
    };

    const handleSaveEditedAddress = async () => {
        if (!editingAddress) return;
        
        setLoading(true);
        try {
            await handleEditAddress(editingAddress);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'adresse modifiée:", error);
            setMessage({
                ouvre: true,
                texte: "Erreur lors de la modification de l'adresse",
                statut: "error",
            });
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        Veuillez vous connecter
                    </h2>
                    <Link to="/" className="btn btn-accent">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-10 pb-10">
            <div className=" px-2">
                {/* En-tête moderne avec animation */}
                <div className="mb-8 text-center transform hover:scale-[1.02] transition-all duration-300">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent mb-3 animate-gradient">
                        Mon Profil
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Gérez vos informations personnelles et vos adresses de livraison
                    </p>
                </div>

                {/* Message d'alerte avec animation */}
                <div>
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
                                className="shadow-2xl"
                            >
                                {message.texte}
                            </Alert>
                        </Snackbar>
                    )}
                </div>

                <div className="flex mx-6 flex-col space-y-5">
                    {/* Carte Informations personnelles */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-accent rounded-xl">
                                    <MdPerson className="text-white text-2xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Informations personnelles
                                </h2>
                            </div>
                            <button
                                onClick={() => setOpenEditDialog(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <FaEdit />
                                <span className="font-medium">Modifier</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { icon: MdPerson, label: 'Civilité', value: formData.civilite },
                                { icon: MdPerson, label: 'Nom', value: formData.nom },
                                { icon: MdPerson, label: 'Prénom', value: formData.prenom },
                                { icon: MdEmail, label: 'Email', value: formData.email },
                                { icon: MdPhone, label: 'Téléphone', value: formData.telephone },
                                { icon: MdCalendarToday, label: 'Date de naissance', value: formData.dateNaissance ? new Date(formData.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée' }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="group p-5 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-accent/10 rounded-lg">
                                            <item.icon className="text-accent text-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                {item.label}
                                            </p>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                                                {item.value || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Carte Adresses */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-accent rounded-xl">
                                    <MdLocationOn className="text-white text-2xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Mes adresses
                                </h2>
                            </div>
                            <button
                                onClick={() => setOpenAddressDialog(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <FaPlus />
                                <span className="font-medium">Ajouter</span>
                            </button>
                        </div>

                        {chargementAdresses ? (
                            <div className="flex justify-center py-12">
                                <div className="flex items-center gap-3">
                                    <div className="loading loading-spinner loading-lg text-accent"></div>
                                    <span className="text-gray-600 dark:text-gray-300 text-lg">Chargement des adresses...</span>
                                </div>
                            </div>
                        ) : adressesClient.length > 0 ? (
                            <div className="space-y-4">
                                {adressesClient.map((address) => (
                                    <div
                                        key={address.id}
                                        className={`relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            address.principal
                                                ? 'border-accent bg-accent/5 shadow-lg'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-accent/50 hover:shadow-md'
                                        }`}
                                    >
                                        {address.principal && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-full shadow-lg">
                                                <FaStar className="text-xs" />
                                                <span>Par défaut</span>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-2.5 bg-accent rounded-lg">
                                                <MdLocationOn className="text-white text-2xl" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">
                                                    {address.labelle}
                                                </h3>
                                                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                                                    <p className="text-sm"><span className="font-semibold">Lot:</span> {address.lot}</p>
                                                    <p className="text-sm"><span className="font-semibold">Quartier:</span> {address.quartier}</p>
                                                    <p className="text-sm"><span className="font-semibold">Ville:</span> {address.ville} - {address.codePostal}</p>
                                                    {address.complement && (
                                                        <p className="text-sm italic mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                                            {address.complement}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <button
                                                onClick={() => handleOpenEditAddress(address)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                                            >
                                                <FaEdit />
                                                Modifier
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDeleteAddressClick(address.id)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                                            >
                                                <FaTrash />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <FaMapMarkerAlt className="text-5xl text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg font-medium">
                                    Aucune adresse enregistrée
                                </p>
                                <div className="flex justify-center">
                                    <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-accent">
                                        <MdInfoOutline size={20} />
                                        <span className="text-sm">Ajoutez votre première adresse pour faciliter vos commandes</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Colonne de droite */}
                    <div className="flex space-x-3">
                        {/* Carte Actions rapides */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transform hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-2 bg-accent rounded-lg">
                                    <span className="text-white text-xl">⚡</span>
                                </div>
                                Actions rapides
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/MesCommande"
                                    className="btn btn-outline w-full justify-start hover:bg-accent/10 transition-all duration-200 border-2"
                                >
                                    <div className="p-1.5 bg-accent/10 rounded mr-2">
                                        <span className="text-accent">📦</span>
                                    </div>
                                    <span className="font-medium">Mes commandes</span>
                                </Link>
                                <Link
                                    to="/Produit"
                                    className="btn btn-outline w-full justify-start hover:bg-accent/10 transition-all duration-200 border-2"
                                >
                                    <div className="p-1.5 bg-accent/10 rounded mr-2">
                                        <span className="text-accent">🛍️</span>
                                    </div>
                                    <span className="font-medium">Continuer mes achats</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="btn btn-outline w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border-2 text-red-600 dark:text-red-400"
                                >
                                    <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded mr-2">
                                        <span className="text-red-600 dark:text-red-400">🚪</span>
                                    </div>
                                    <span className="font-medium">Se déconnecter</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Carte Statut du compte */}
                        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl p-6 transform hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                                <div className="p-2 bg-accent/20 dark:bg-accent/30 rounded-lg">
                                    <span className="text-accent dark:text-accent text-xl">👤</span>
                                </div>
                                Statut du compte
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/20 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm text-gray-700 dark:text-gray-200">
                                    <span className="font-medium">Membre depuis</span>
                                    <span className="font-bold">
                                        {new Date().toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/20 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm text-gray-700 dark:text-gray-200">
                                    <span className="font-medium">Statut</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <span className="text-green-500 dark:text-green-400">✓</span> Actif
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/20 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm text-gray-700 dark:text-gray-200">
                                    <span className="font-medium">Adresses</span>
                                    <span className="font-bold text-lg text-accent dark:text-accent">
                                        {adressesClient.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal d'édition du profil */}
                {openEditDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 animate-scaleIn">
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent rounded-lg">
                                        <FaEdit className="text-white text-xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Modifier mon profil
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setOpenEditDialog(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <MdCancel className="text-2xl text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Civilité */}
                                    
                                        <FormControl error={!!errors.civilite}>
                                            <FormLabel
                                                id="choix-label"
                                                className="text-gray-600 dark:text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <MdPerson className="text-accent" />
                                                    Civilité 
                                                </div>
                                            </FormLabel>
                                            <RadioGroup
                                                row
                                                aria-labelledby="demo-row-radio-buttons-group-label"
                                                name="civilite"
                                                value={formData.civilite || ''}
                                                onChange={handleChange}
                                                className="gap-5 text-gray-600 dark:text-slate-300"
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
                                            <FormHelperText>{errors.civilite}</FormHelperText>
                                        </FormControl>
                                    {/* Date de naissance */}
                                    <div>
                                        <InputValidate
                                            IconComponent={CalendarDateRangeIcon}
                                            type="date"
                                            title="Date de naissance"
                                            value={formData.dateNaissance || ''}
                                            onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
                                            error={!!errors.dateNaissance}
                                            helperText={errors.dateNaissance}
                                            placeholder="JJ/MM/AAAA"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Nom */}
                                    <div>
                                        <InputValidate
                                            IconComponent={FaUserCheck}
                                            type="text"
                                            title="Nom"
                                            value={formData.nom || ''}
                                            onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
                                            error={!!errors.nom}
                                            helperText={errors.nom}
                                            placeholder="Votre nom"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Prénom */}
                                    <div>
                                        <InputValidate
                                            IconComponent={FaUserCheck}
                                            type="text"
                                            title="Prénom"
                                            value={formData.prenom || ''}
                                            onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
                                            error={!!errors.prenom}
                                            helperText={errors.prenom}
                                            placeholder="Votre prénom"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="md:col-span-2">
                                        <InputValidate
                                            IconComponent={MdOutlineEmail}
                                            type="email"
                                            title="Adresse email"
                                            value={formData.email || ''}
                                            onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            placeholder="votre@email.com"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Téléphone */}
                                    <div className="md:col-span-2">
                                        <InputValidate
                                            IconComponent={DevicePhoneMobileIcon}
                                            type="tel"
                                            title="Numéro de téléphone"
                                            value={formData.telephone || ''}
                                            onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
                                            error={!!errors.telephone}
                                            helperText={errors.telephone}
                                            placeholder="032 XX XXX XX"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end rounded-b-2xl">
                                <button
                                    onClick={() => setOpenEditDialog(false)}
                                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <MdCancel />
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading loading-spinner loading-sm"></div>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave />
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal d'ajout d'adresse */}
                {openAddressDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 animate-scaleIn">
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent rounded-lg">
                                        <MdAddLocation className="text-white text-xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Nouvelle adresse
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setOpenAddressDialog(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <MdCancel className="text-2xl text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Label de l'adresse */}
                                    <div className="md:col-span-2">
                                        <InputValidate
                                            IconComponent={FaMapMarkerAlt}
                                            type="text"
                                            title="Label de l'adresse"
                                            value={newAddress.labelle || ''}
                                            onChange={(val) => handleAddressChange('labelle', val)}
                                            error={!!addressErrors.labelle}
                                            helperText={addressErrors.labelle}
                                            placeholder="Nommez votre adresse (Ex: Maison, Bureau, etc.)"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Ville */}
                                    <div>
                                        <InputValidate
                                            IconComponent={MdLocationOn}
                                            type="text"
                                            title="Ville"
                                            value={newAddress.ville || ''}
                                            onChange={(val) => handleAddressChange('ville', val)}
                                            error={!!addressErrors.ville}
                                            helperText={addressErrors.ville}
                                            placeholder="Votre ville"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Code Postal */}
                                    <div>
                                        <InputValidate
                                            IconComponent={FaMapMarkerAlt}
                                            type="text"
                                            title="Code Postal"
                                            value={newAddress.codePostal || ''}
                                            onChange={(val) => handleAddressChange('codePostal', val)}
                                            error={!!addressErrors.codePostal}
                                            helperText={addressErrors.codePostal}
                                            placeholder="XXX"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Quartier */}
                                    <div>
                                        <InputValidate
                                            IconComponent={MdLocationOn}
                                            type="text"
                                            title="Quartier"
                                            value={newAddress.quartier || ''}
                                            onChange={(val) => handleAddressChange('quartier', val)}
                                            error={!!addressErrors.quartier}
                                            helperText={addressErrors.quartier}
                                            placeholder="Votre quartier"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Lot */}
                                    <div>
                                        <InputValidate
                                            IconComponent={MdLocationOn}
                                            type="text"
                                            title="Lot"
                                            value={newAddress.lot || ''}
                                            onChange={(val) => handleAddressChange('lot', val)}
                                            error={!!addressErrors.lot}
                                            helperText={addressErrors.lot}
                                            placeholder="Numéro de lot"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Complément d'adresse */}
                                    <div className="md:col-span-2">
                                        <label className="block mb-2">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                                <MdInfoOutline className="text-accent" />
                                                Description complémentaire *
                                            </div>
                                        </label>
                                        <textarea
                                            value={newAddress.complement || ''}
                                            onChange={(e) => handleAddressChange('complement', e.target.value)}
                                            placeholder="Décrivez plus précisément votre adresse (références, bâtiment, étage, etc.)"
                                            className={`w-full h-32 p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                                addressErrors.complement 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            }`}
                                        />
                                        {addressErrors.complement && (
                                            <p className="text-red-500 text-sm mt-2">{addressErrors.complement}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-accent/10 p-4 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <MdInfoOutline className="text-accent text-xl mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                💡 Conseil
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Renseignez une description précise pour faciliter la livraison de vos commandes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        setOpenAddressDialog(false);
                                        setNewAddress({
                                            labelle: '',
                                            ville: '',
                                            codePostal: '',
                                            quartier: '',
                                            lot: '',
                                            complement: '',
                                            type: 'home'
                                        });
                                        setAddressErrors({});
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <MdCancel />
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddAddress}
                                    disabled={loading}
                                    className="px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading loading-spinner loading-sm"></div>
                                            Ajout en cours...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave />
                                            Ajouter l'adresse
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal d'édition d'adresse */}
                {openEditAddressDialog && editingAddress && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 animate-scaleIn">
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent rounded-lg">
                                        <FaEdit className="text-white text-xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Modifier l'adresse
                                    </h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setOpenEditAddressDialog(false);
                                        setEditingAddress(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <MdCancel className="text-2xl text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Label de l'adresse */}
                                    <div className="md:col-span-2">
                                        <InputValidate
                                            IconComponent={FaMapMarkerAlt}
                                            type="text"
                                            title="Label de l'adresse *"
                                            value={editingAddress.labelle || ''}
                                            onChange={(val) => handleEditAddressChange('labelle', val)}
                                            error={!!addressErrors.labelle}
                                            helperText={addressErrors.labelle}
                                            placeholder="Nommez votre adresse (Ex: Maison, Bureau, etc.)"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Ville */}
                                    <div>
                                        <InputValidate
                                            IconComponent={MdLocationOn}
                                            type="text"
                                            title="Ville *"
                                            value={editingAddress.ville || ''}
                                            onChange={(val) => handleEditAddressChange('ville', val)}
                                            error={!!addressErrors.ville}
                                            helperText={addressErrors.ville}
                                            placeholder="Votre ville"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Code Postal */}
                                    <div>
                                        <InputValidate
                                            IconComponent={FaMapMarkerAlt}
                                            type="text"
                                            title="Code Postal *"
                                            value={editingAddress.codePostal || ''}
                                            onChange={(val) => handleEditAddressChange('codePostal', val)}
                                            error={!!addressErrors.codePostal}
                                            helperText={addressErrors.codePostal}
                                            placeholder="XXX"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Quartier */}
                                    <div>
                                        <InputValidate
                                            IconComponent={MdLocationOn}
                                            type="text"
                                            title="Quartier *"
                                            value={editingAddress.quartier || ''}
                                            onChange={(val) => handleEditAddressChange('quartier', val)}
                                            error={!!addressErrors.quartier}
                                            helperText={addressErrors.quartier}
                                            placeholder="Votre quartier"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Lot */}
                                    <div>
                                        <InputValidate
                                            IconComponent={MdLocationOn}
                                            type="text"
                                            title="Lot *"
                                            value={editingAddress.lot || ''}
                                            onChange={(val) => handleEditAddressChange('lot', val)}
                                            error={!!addressErrors.lot}
                                            helperText={addressErrors.lot}
                                            placeholder="Numéro de lot"
                                            largeur="full"
                                            ClassIcone="text-accent"
                                        />
                                    </div>

                                    {/* Complément d'adresse */}
                                    <div className="md:col-span-2">
                                        <label className="block mb-2">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                                <MdInfoOutline className="text-accent" />
                                                Description complémentaire *
                                            </div>
                                        </label>
                                        <textarea
                                            value={editingAddress.complement || ''}
                                            onChange={(e) => handleEditAddressChange('complement', e.target.value)}
                                            placeholder="Décrivez plus précisément votre adresse (références, bâtiment, étage, etc.)"
                                            className={`w-full h-32 p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                                addressErrors.complement 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            }`}
                                        />
                                        {addressErrors.complement && (
                                            <p className="text-red-500 text-sm mt-2">{addressErrors.complement}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-accent/10 p-4 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <MdInfoOutline className="text-accent text-xl mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                💡 Conseil
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Renseignez une description précise pour faciliter la livraison de vos commandes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        setOpenEditAddressDialog(false);
                                        setEditingAddress(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <MdCancel />
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveEditedAddress}
                                    disabled={loading}
                                    className="px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading loading-spinner loading-sm"></div>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave />
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmation de suppression d'adresse */}
                <dialog
                    id="delete_address_modal"
                    className={`modal ${isDeleteModalOpen ? "modal-open" : ""}`}
                >
                    <div className="modal-box bg-slate-200 dark:bg-gray-800">
                        
                        <form method="dialog">
                            <button
                                className="btn btn-circle btn-ghost btn-sm absolute right-4 top-4"
                                onClick={closeDeleteModal}
                            >
                                ✕
                            </button>
                        </form>
                        <div className=' flex gap-3 justify-center mb-6  items-center'>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                        <FaTrash className="text-xl text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className=" text-center text-lg font-bold text-gray-900 dark:text-white">
                                Confirmer la suppression
                            </h3>
                            
                        </div>

                        <form>
                            <div className="mb-4 text-center">
                                
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Voulez-vous vraiment supprimer cette adresse ? Cette action est irréversible.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 justify-end mx-5">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="btn btn-accent btn-outline"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeleteAddress}
                                    className="btn btn-error btn-wide text-white"
                                >
                                    {loadDelete ? (
                                        <div className="flex flex-row items-center justify-center gap-2">
                                            <span className="loading loading-spinner"></span>
                                            <span>Suppression...</span>
                                        </div>
                                    ) : (
                                        "Supprimer"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Backdrop pour fermer le modal */}
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={closeDeleteModal}>Fermer</button>
                    </form>
                </dialog>
            </div>

            {/* Ajout de styles CSS pour les animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;

// import React, { useState, useEffect } from 'react';
// import { useAuthContext } from '@/contexts/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaEdit, FaMapMarkerAlt, FaPlus, FaTrash, FaStar } from 'react-icons/fa';
// import { MdEmail, MdPhone, MdPerson, MdCalendarToday, MdSave, MdCancel, MdLocationOn, MdAddLocation, MdInfoOutline } from 'react-icons/md';
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { InputValidate } from "@/components/InputValidate";
// import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
// import { FaUserCheck, FaUserLock } from "react-icons/fa6";
// import { MdOutlineEmail } from "react-icons/md";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import FormHelperText from "@mui/material/FormHelperText";
// import { getClientAddresses ,CreateNewAdresse, deleteAdresse, updateClientAddress, UpdateClient } from "@/services/ClientService";

// const ProfilePage = () => {
//     const { user, isAuthenticated, logout, updateUserProfile } = useAuthContext();
//     const navigate = useNavigate();
//     const [openEditDialog, setOpenEditDialog] = useState(false);
//     const [openAddressDialog, setOpenAddressDialog] = useState(false);
//     const [openEditAddressDialog, setOpenEditAddressDialog] = useState(false);
//     const [loadDelete, setLoadDelete] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [open, setOpen] = useState(false);
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });
//     const [formData, setFormData] = useState({});
//     const [errors, setErrors] = useState({});
    
//     // États pour la gestion des adresses
//     const [refClient, setRefClient] = useState('');
//     const [adressesClient, setAdressesClient] = useState([]);
//     const [chargementAdresses, setChargementAdresses] = useState(false);
//     const [initialEmail, setInitialEmail] = useState('');
//     const [newAddress, setNewAddress] = useState({
//         labelle: '',
//         ville: '',
//         codePostal: '',
//         quartier: '',
//         lot: '',
//         complement: '',
//     });
//     const [editingAddress, setEditingAddress] = useState(null);
//     const [addressErrors, setAddressErrors] = useState({});

//     // Rediriger si non authentifié
//     useEffect(() => {
//         if (!isAuthenticated) {
//             navigate('/');
//         }
//     }, [isAuthenticated, navigate]);

//     // Initialiser les données du formulaire
//     useEffect(() => {
//         if (user && user.client) {
//             setFormData({
//                 id: user.idUsers,
//                 nom: user.client.nomClient || '',
//                 prenom: user.client.prenomClient || '',
//                 email: user.emailUsers || user.email || '',
//                 telephone: user.client.telephoneClient || '',
//                 civilite: user.client.civiliteClient || '',
//                 dateNaissance: user.client.dateNaissance || '',
//                 emailIsModified: false
//             });
//             setInitialEmail(user.emailUsers);
//             setRefClient(user.client.refClient)
//         }
//     }, [user]);

//     // Charger les adresses du client
//     const getAdresses = async () => {
//         if (isAuthenticated && user.client) {
//             setChargementAdresses(true);
//             try {
//                 const reponseAdresses = await getClientAddresses();
//                 const listeAdresses = reponseAdresses.adresse;
//                 if (listeAdresses && listeAdresses.length > 0) {
//                     const adressesTriees = listeAdresses.sort((a, b) => b.id - a.id);
//                     setAdressesClient(adressesTriees);
//                 } else {
//                     setAdressesClient([]);
//                 }
//             } catch (erreur) {
//                 console.log("Erreur de chargement des adresses:", erreur);
//                 setMessage({
//                     ouvre: true,
//                     texte: "Erreur lors du chargement des adresses",
//                     statut: "error",
//                 });
//                 setOpen(true);
//             } finally {
//                 setChargementAdresses(false);
//             }
//         }
//     };

//     useEffect(() => {
//         getAdresses();
//     }, [isAuthenticated, user]);

//     // Fonction pour gérer la modification d'adresse
//     const handleEditAddress = async (editedAddress) => {
//         try {
//             console.log("Adresse à modifier: ", editedAddress);
//             const response = await updateClientAddress(editedAddress);
//             if (response) {
//                 await getAdresses();
//                 setMessage({
//                     ouvre: true,
//                     texte: "Adresse modifiée avec succès",
//                     statut: "success",
//                 });
//                 setOpen(true);
//                 setOpenEditAddressDialog(false);
//                 setEditingAddress(null);
//             }
//         } catch (error) {
//             console.error("Erreur lors de la modification de l'adresse:", error);
//             setMessage({
//                 ouvre: true,
//                 texte: "Erreur lors de la modification de l'adresse",
//                 statut: "error",
//             });
//             setOpen(true);
//         }
//     };

//     // Fonction pour ouvrir la modal d'édition d'adresse
//     const handleOpenEditAddress = (address) => {
//         setEditingAddress(address);
//         setOpenEditAddressDialog(true);
//     };

//     // Fonction pour supprimer une adresse
//     const handleDeleteAddress = async (addressId) => {
//         setLoadDelete(true)
//         try {
//             const result = await deleteAdresse(refClient, addressId)
//             if (result.data){
//                 await getAdresses()
//                 setMessage({
//                     ouvre: true,
//                     texte: "Adresse supprimée avec succès",
//                     statut: "success",
//                 });
//                 setOpen(true);
//                 console.log(result.data)
//             }
//             else{
//                 console.log(result)
//                 setMessage({
//                     ouvre: true,
//                     texte: "Erreur de suppression Adresse",
//                     statut: "warning",
//                 });
//                 setOpen(true);
//             }
//             setLoadDelete(false)
//         } catch (error) {
//             console.error("Erreur lors de la suppression de l'adresse:", error);
//             setMessage({
//                 ouvre: true,
//                 texte: "Erreur lors de la suppression de l'adresse",
//                 statut: "error",
//             });
//             setOpen(true);
//         }finally{
//             setLoadDelete(false)
//         }
//     };

//     // Fonction pour définir une adresse comme principale
//     const handleSetPrincipalAddress = (addressId) => {
//         setAdressesClient(prev => prev.map(addr => ({
//             ...addr,
//             principal: addr.id === addressId
//         })));
//         setMessage({
//             ouvre: true,
//             texte: "Adresse principale mise à jour",
//             statut: "success",
//         });
//         setOpen(true);
//     };

//     const validateEmailFormat = (email) => {
//         const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return regex.test(email);
//     };

//     const validateForm = () => {
//         let tempErrors = {};
//         let isValid = true;

//         if (!formData.civilite) {
//             tempErrors.civilite = "La civilité est requise";
//             isValid = false;
//         }
//         if (!formData.nom || formData.nom.trim() === "") {
//             tempErrors.nom = "Le nom est requis";
//             isValid = false;
//         }
//         if (!formData.prenom || formData.prenom.trim() === "") {
//             tempErrors.prenom = "Le prénom est requis";
//             isValid = false;
//         }
//         if (!formData.email || !validateEmailFormat(formData.email)) {
//             tempErrors.email = "Une adresse email valide est requise";
//             isValid = false;
//         }
//         if (!formData.dateNaissance) {
//             tempErrors.dateNaissance = "Veuillez choisir votre date de naissance";
//             isValid = false;
//         }
//         if (!formData.telephone || formData.telephone.trim() === "") {
//             tempErrors.telephone = "Le numéro de téléphone est requis";
//             isValid = false;
//         } else if (!/^\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
//             tempErrors.telephone = "Numéro de téléphone invalide";
//             isValid = false;
//         }

//         setErrors(tempErrors);
//         return isValid;
//     };

//     const validateAddressForm = () => {
//         let tempErrors = {};
//         let isValid = true;

//         if (!newAddress.ville || newAddress.ville.trim() === "") {
//             tempErrors.ville = "La ville est requise";
//             isValid = false;
//         }
//         if (!newAddress.labelle || newAddress.labelle.trim() === "") {
//             tempErrors.labelle = "Mentionner le label de votre adresse, ce champ est requis.";
//             isValid = false;
//         }
//         if (!newAddress.codePostal || !/^\d+$/.test(newAddress.codePostal)) {
//             tempErrors.codePostal = "Le code postal est requis et doit contenir uniquement des chiffres";
//             isValid = false;
//         }
//         if (!newAddress.quartier || newAddress.quartier.trim() === "") {
//             tempErrors.quartier = "Le quartier est requis";
//             isValid = false;
//         }
//         if (!newAddress.lot || newAddress.lot.trim() === "") {
//             tempErrors.lot = "Le lot est requis";
//             isValid = false;
//         }
//         if (!newAddress.complement || newAddress.complement.trim() === "") {
//             tempErrors.complement = "La description est requise";
//             isValid = false;
//         }

//         setAddressErrors(tempErrors);
//         return isValid;
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         setErrors(prev => ({ ...prev, [name]: "" }));
//     };

//     const handleAddressChange = (field, value) => {
//         setNewAddress(prev => ({ ...prev, [field]: value }));
//         setAddressErrors(prev => ({ ...prev, [field]: "" }));
//     };

//     const handleEditAddressChange = (field, value) => {
//         setEditingAddress(prev => ({ ...prev, [field]: value }));
//         setAddressErrors(prev => ({ ...prev, [field]: "" }));
//     };

//     const handleSaveProfile = async () => {
//         if (!validateForm()) return;
//         setLoading(true);
//         try {
//             console.log("Profil à modifier: ", formData);
//             const result = await UpdateClient(formData);
//             if (result.data) {
//                 setMessage({
//                     ouvre: true,
//                     texte: "Profil mis à jour avec succès",
//                     statut: "success",
//                 });
//                 setOpen(true);
//                 console.log("Update avec succès: ", result.data);
//                 const users = result.data;
//                 setFormData({
//                     id: users.idUsers,
//                     nom: users.client.nomClient || '',
//                     prenom: users.client.prenomClient || '',
//                     email: users.emailUsers || '',
//                     telephone: users.client.telephoneClient || '',
//                     civilite: users.client.civiliteClient || '',
//                     dateNaissance: users.client.dateNaissance || '',
//                     emailIsModified: false
//                 });
//                 localStorage.removeItem('user');
//                 localStorage.setItem('user', JSON.stringify(result.data));
//             } else {
//                 setMessage({
//                     ouvre: true,
//                     texte: "Une erreur s'est produite lors de la mise à jour du profil",
//                     statut: "error",
//                 });
//                 setOpen(true);
//                 console.log("Update Profil: ", result.error);
//             }
//             setOpenEditDialog(false);
//         } catch (error) {
//             setMessage({
//                 ouvre: true,
//                 texte: "Erreur lors de la mise à jour du profil",
//                 statut: "error",
//             });
//             setOpen(true);
//         }
//         setLoading(false);
//     };

//     const handleAddAddress = async () => {
//         if (!validateAddressForm()) return;

//         setLoading(true);
//         try {
//             const newAdresse = {
//                 ville: newAddress.ville,
//                 quartier: newAddress.quartier,
//                 lot: newAddress.lot,
//                 description: newAddress.complement,
//                 labelle: newAddress.labelle,
//                 codePostal: newAddress.codePostal
//             }
//             const result = await CreateNewAdresse(newAdresse)
//             if (result.data){
//                 setMessage({
//                     ouvre: true,
//                     texte: "Adresse ajoutée avec succès",
//                     statut: "success",
//                 });
//                 setOpen(true);
//                 console.log("result CreateADresse:", result.data)
//                 await getAdresses()
//             }else{
//                 setMessage({
//                     ouvre: true,
//                     texte: "Probleme lors de l'ajout de l'adresse",
//                     statut: "error",
//                 });
//                 setOpen(true);
//                 console.log("Erreur create adresse: ", result)
//             }
//             setNewAddress({
//                 labelle: '',
//                 ville: '',
//                 codePostal: '',
//                 quartier: '',
//                 lot: '',
//                 complement: '',
//             });
//             setOpenAddressDialog(false);
//         } catch (error) {
//             setMessage({
//                 ouvre: true,
//                 texte: "Erreur lors de l'ajout de l'adresse",
//                 statut: "error",
//             });
//             setOpen(true);
//             console.log("Erreur create adresse (try/catch): ", error)
//         }finally{
//             setLoading(false);
//         }
//     };

//     const handleSaveEditedAddress = async () => {
//         if (!editingAddress) return;
        
//         setLoading(true);
//         try {
//             await handleEditAddress(editingAddress);
//         } catch (error) {
//             console.error("Erreur lors de la sauvegarde de l'adresse modifiée:", error);
//             setMessage({
//                 ouvre: true,
//                 texte: "Erreur lors de la modification de l'adresse",
//                 statut: "error",
//             });
//             setOpen(true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     if (!isAuthenticated || !user) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
//                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
//                         Veuillez vous connecter
//                     </h2>
//                     <Link to="/" className="btn btn-accent">
//                         Retour à l'accueil
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen pt-10 pb-10">
//             <div className=" px-2">
//                 {/* En-tête moderne avec animation */}
//                 <div className="mb-8 text-center transform hover:scale-[1.02] transition-all duration-300">
//                     <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent mb-3 animate-gradient">
//                         Mon Profil
//                     </h1>
//                     <p className="text-gray-600 dark:text-gray-300 text-lg">
//                         Gérez vos informations personnelles et vos adresses de livraison
//                     </p>
//                 </div>

//                 {/* Message d'alerte avec animation */}
//                 <div>
//                     {message.ouvre && (
//                         <Snackbar
//                             open={open}
//                             autoHideDuration={5000}
//                             onClose={handleClose}
//                             anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//                         >
//                             <Alert
//                                 onClose={handleClose}
//                                 severity={message.statut}
//                                 variant="filled"
//                                 sx={{ width: "100%" }}
//                                 className="shadow-2xl"
//                             >
//                                 {message.texte}
//                             </Alert>
//                         </Snackbar>
//                     )}
//                 </div>

//                     <div className="flex mx-6 flex-col space-y-5">
//                         {/* Carte Informations personnelles */}
//                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
//                             <div className="flex justify-between items-center mb-6">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-3 bg-accent rounded-xl">
//                                         <MdPerson className="text-white text-2xl" />
//                                     </div>
//                                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                         Informations personnelles
//                                     </h2>
//                                 </div>
//                                 <button
//                                     onClick={() => setOpenEditDialog(true)}
//                                     className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//                                 >
//                                     <FaEdit />
//                                     <span className="font-medium">Modifier</span>
//                                 </button>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {[
//                                     { icon: MdPerson, label: 'Civilité', value: formData.civilite },
//                                     { icon: MdPerson, label: 'Nom', value: formData.nom },
//                                     { icon: MdPerson, label: 'Prénom', value: formData.prenom },
//                                     { icon: MdEmail, label: 'Email', value: formData.email },
//                                     { icon: MdPhone, label: 'Téléphone', value: formData.telephone },
//                                     { icon: MdCalendarToday, label: 'Date de naissance', value: formData.dateNaissance ? new Date(formData.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée' }
//                                 ].map((item, index) => (
//                                     <div
//                                         key={index}
//                                         className="group p-5 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] border border-gray-200 dark:border-gray-600"
//                                     >
//                                         <div className="flex items-start gap-4">
//                                             <div className="p-2.5 bg-accent/10 rounded-lg">
//                                                 <item.icon className="text-accent text-xl" />
//                                             </div>
//                                             <div className="flex-1">
//                                                 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
//                                                     {item.label}
//                                                 </p>
//                                                 <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
//                                                     {item.value || 'Non renseigné'}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Carte Adresses  */}
//                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
//                             <div className="flex justify-between items-center mb-6">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-3 bg-accent rounded-xl">
//                                         <MdLocationOn className="text-white text-2xl" />
//                                     </div>
//                                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                         Mes adresses
//                                     </h2>
//                                 </div>
//                                 <button
//                                     onClick={() => setOpenAddressDialog(true)}
//                                     className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//                                 >
//                                     <FaPlus />
//                                     <span className="font-medium">Ajouter</span>
//                                 </button>
//                             </div>

//                             {chargementAdresses ? (
//                                 <div className="flex justify-center py-12">
//                                     <div className="flex items-center gap-3">
//                                         <div className="loading loading-spinner loading-lg text-accent"></div>
//                                         <span className="text-gray-600 dark:text-gray-300 text-lg">Chargement des adresses...</span>
//                                     </div>
//                                 </div>
//                             ) : adressesClient.length > 0 ? (
//                                 <div className="space-y-4">
//                                     {adressesClient.map((address) => (
//                                         <div
//                                             key={address.id}
//                                             className={`relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
//                                                 address.principal
//                                                     ? 'border-accent bg-accent/5 shadow-lg'
//                                                     : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-accent/50 hover:shadow-md'
//                                             }`}
//                                         >
//                                             {address.principal && (
//                                                 <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-full shadow-lg">
//                                                     <FaStar className="text-xs" />
//                                                     <span>Par défaut</span>
//                                                 </div>
//                                             )}
//                                             <div className="flex items-start gap-3 mb-4">
//                                                 <div className="p-2.5 bg-accent rounded-lg">
//                                                     <MdLocationOn className="text-white text-2xl" />
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">
//                                                         {address.labelle}
//                                                     </h3>
//                                                     <div className="space-y-1 text-gray-600 dark:text-gray-300">
//                                                         <p className="text-sm"><span className="font-semibold">Lot:</span> {address.lot}</p>
//                                                         <p className="text-sm"><span className="font-semibold">Quartier:</span> {address.quartier}</p>
//                                                         <p className="text-sm"><span className="font-semibold">Ville:</span> {address.ville} - {address.codePostal}</p>
//                                                         {address.complement && (
//                                                             <p className="text-sm italic mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
//                                                                 {address.complement}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="flex flex-wrap gap-2 mt-4">
//                                                 <button
//                                                     onClick={() => handleOpenEditAddress(address)}
//                                                     className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
//                                                 >
//                                                     <FaEdit />
//                                                     Modifier
//                                                 </button>
                                                
//                                                 <button
//                                                     onClick={() => handleDeleteAddress(address.id)}
//                                                     className="flex items-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
//                                                 >
//                                                     {loadDelete ? (
//                                                         <div className="flex items-center gap-2">
//                                                             <span className="loading loading-spinner"></span>
//                                                             Suppression...
//                                                         </div>
//                                                     ): (
//                                                         <div className="flex items-center gap-2">
//                                                              <FaTrash />
//                                                              Supprimer
//                                                         </div>
//                                                     )}
                                                   
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-xl">
//                                     <FaMapMarkerAlt className="text-5xl text-gray-400 mx-auto mb-4" />
//                                     <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg font-medium">
//                                         Aucune adresse enregistrée
//                                     </p>
//                                     <div className="flex justify-center">
//                                         <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-3 text-accent">
//                                             <MdInfoOutline size={20} />
//                                             <span className="text-sm">Ajoutez votre première adresse pour faciliter vos commandes</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                          {/* Colonne de droite  */}
//                         <div className="flex space-x-3">
//                             {/* Carte Actions rapides */}
//                             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transform hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
//                                 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
//                                     <div className="p-2 bg-accent rounded-lg">
//                                         <span className="text-white text-xl">⚡</span>
//                                     </div>
//                                     Actions rapides
//                                 </h3>
//                                 <div className="space-y-3">
//                                     <Link
//                                         to="/MesCommande"
//                                         className="btn btn-outline w-full justify-start hover:bg-accent/10 transition-all duration-200 border-2"
//                                     >
//                                         <div className="p-1.5 bg-accent/10 rounded mr-2">
//                                             <span className="text-accent">📦</span>
//                                         </div>
//                                         <span className="font-medium">Mes commandes</span>
//                                     </Link>
//                                     <Link
//                                         to="/Produit"
//                                         className="btn btn-outline w-full justify-start hover:bg-accent/10 transition-all duration-200 border-2"
//                                     >
//                                         <div className="p-1.5 bg-accent/10 rounded mr-2">
//                                             <span className="text-accent">🛍️</span>
//                                         </div>
//                                         <span className="font-medium">Continuer mes achats</span>
//                                     </Link>
//                                     <button
//                                         onClick={logout}
//                                         className="btn btn-outline w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border-2 text-red-600 dark:text-red-400"
//                                     >
//                                         <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded mr-2">
//                                             <span className="text-red-600 dark:text-red-400">🚪</span>
//                                         </div>
//                                         <span className="font-medium">Se déconnecter</span>
//                                     </button>
//                                 </div>
//                             </div>
                            
//                             {/* Carte Statut du compte */}
//                             <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl p-6 transform hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
//                                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
//                                     <div className="p-2 bg-accent/20 dark:bg-accent/30 rounded-lg">
//                                         <span className="text-accent dark:text-accent text-xl">👤</span>
//                                     </div>
//                                     Statut du compte
//                                 </h3>
//                                 <div className="space-y-3">
//                                     <div className="flex justify-between items-center p-3 bg-white/20 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm text-gray-700 dark:text-gray-200">
//                                         <span className="font-medium">Membre depuis</span>
//                                         <span className="font-bold">
//                                             {new Date().toLocaleDateString('fr-FR')}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between items-center p-3 bg-white/20 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm text-gray-700 dark:text-gray-200">
//                                         <span className="font-medium">Statut</span>
//                                         <span className="font-bold flex items-center gap-1">
//                                             <span className="text-green-500 dark:text-green-400">✓</span> Actif
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between items-center p-3 bg-white/20 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm text-gray-700 dark:text-gray-200">
//                                         <span className="font-medium">Adresses</span>
//                                         <span className="font-bold text-lg text-accent dark:text-accent">
//                                             {adressesClient.length}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>    

//                 {/* Modal d'édition du profil */}
//                 {openEditDialog && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
//                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 animate-scaleIn">
//                             <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center rounded-t-2xl">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-2.5 bg-accent rounded-lg">
//                                         <FaEdit className="text-white text-xl" />
//                                     </div>
//                                     <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                         Modifier mon profil
//                                     </h3>
//                                 </div>
//                                 <button
//                                     onClick={() => setOpenEditDialog(false)}
//                                     className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                                 >
//                                     <MdCancel className="text-2xl text-gray-500 dark:text-gray-400" />
//                                 </button>
//                             </div>

//                             <div className="p-6 space-y-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* Civilité */}
//                                     <FormControl component="fieldset" error={!!errors.civilite}>
//                                         <FormLabel component="legend" className="!text-gray-700 dark:!text-gray-300 !mb-3 !font-semibold">
//                                             <div className="flex items-center gap-2">
//                                                 <MdPerson className="text-accent" />
//                                                 Civilité 
//                                             </div>
//                                         </FormLabel>
//                                         <RadioGroup
//                                             row
//                                             name="civilite"
//                                             value={formData.civilite || ''}
//                                             onChange={handleChange}
//                                             className="gap-4"
//                                         >
//                                             <FormControlLabel 
//                                                 value="Monsieur" 
//                                                 control={<Radio className="text-accent" />} 
//                                                 label="Monsieur" 
//                                                 className="!mx-0"
//                                             />
//                                             <FormControlLabel 
//                                                 value="Madame" 
//                                                 control={<Radio className="text-accent" />} 
//                                                 label="Madame" 
//                                                 className="!mx-0"
//                                             />
//                                         </RadioGroup>
//                                         {errors.civilite && (
//                                             <FormHelperText className="!text-red-500 !mt-2">
//                                                 {errors.civilite}
//                                             </FormHelperText>
//                                         )}
//                                     </FormControl>

//                                     {/* Date de naissance */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={CalendarDateRangeIcon}
//                                             type="date"
//                                             title="Date de naissance"
//                                             value={formData.dateNaissance || ''}
//                                             onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
//                                             error={!!errors.dateNaissance}
//                                             helperText={errors.dateNaissance}
//                                             placeholder="JJ/MM/AAAA"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Nom */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={FaUserCheck}
//                                             type="text"
//                                             title="Nom"
//                                             value={formData.nom || ''}
//                                             onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
//                                             error={!!errors.nom}
//                                             helperText={errors.nom}
//                                             placeholder="Votre nom"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Prénom */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={FaUserCheck}
//                                             type="text"
//                                             title="Prénom"
//                                             value={formData.prenom || ''}
//                                             onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
//                                             error={!!errors.prenom}
//                                             helperText={errors.prenom}
//                                             placeholder="Votre prénom"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Email */}
//                                     <div className="md:col-span-2">
//                                         <InputValidate
//                                             IconComponent={MdOutlineEmail}
//                                             type="email"
//                                             title="Adresse email"
//                                             value={formData.email || ''}
//                                             onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                                             error={!!errors.email}
//                                             helperText={errors.email}
//                                             placeholder="votre@email.com"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Téléphone */}
//                                     <div className="md:col-span-2">
//                                         <InputValidate
//                                             IconComponent={DevicePhoneMobileIcon}
//                                             type="tel"
//                                             title="Numéro de téléphone"
//                                             value={formData.telephone || ''}
//                                             onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
//                                             error={!!errors.telephone}
//                                             helperText={errors.telephone}
//                                             placeholder="032 XX XXX XX"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end rounded-b-2xl">
//                                 <button
//                                     onClick={() => setOpenEditDialog(false)}
//                                     className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center gap-2"
//                                 >
//                                     <MdCancel />
//                                     Annuler
//                                 </button>
//                                 <button
//                                     onClick={handleSaveProfile}
//                                     disabled={loading}
//                                     className="px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <div className="loading loading-spinner loading-sm"></div>
//                                             Enregistrement...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <MdSave />
//                                             Enregistrer
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Modal d'ajout d'adresse */}
//                 {openAddressDialog && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
//                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 animate-scaleIn">
//                             <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center rounded-t-2xl">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-2.5 bg-accent rounded-lg">
//                                         <MdAddLocation className="text-white text-xl" />
//                                     </div>
//                                     <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                         Nouvelle adresse
//                                     </h3>
//                                 </div>
//                                 <button
//                                     onClick={() => setOpenAddressDialog(false)}
//                                     className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                                 >
//                                     <MdCancel className="text-2xl text-gray-500 dark:text-gray-400" />
//                                 </button>
//                             </div>

//                             <div className="p-6 space-y-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* Label de l'adresse */}
//                                     <div className="md:col-span-2">
//                                         <InputValidate
//                                             IconComponent={FaMapMarkerAlt}
//                                             type="text"
//                                             title="Label de l'adresse"
//                                             value={newAddress.labelle || ''}
//                                             onChange={(val) => handleAddressChange('labelle', val)}
//                                             error={!!addressErrors.labelle}
//                                             helperText={addressErrors.labelle}
//                                             placeholder="Nommez votre adresse (Ex: Maison, Bureau, etc.)"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Ville */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             title="Ville"
//                                             value={newAddress.ville || ''}
//                                             onChange={(val) => handleAddressChange('ville', val)}
//                                             error={!!addressErrors.ville}
//                                             helperText={addressErrors.ville}
//                                             placeholder="Votre ville"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Code Postal */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={FaMapMarkerAlt}
//                                             type="text"
//                                             title="Code Postal"
//                                             value={newAddress.codePostal || ''}
//                                             onChange={(val) => handleAddressChange('codePostal', val)}
//                                             error={!!addressErrors.codePostal}
//                                             helperText={addressErrors.codePostal}
//                                             placeholder="XXX"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Quartier */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             title="Quartier"
//                                             value={newAddress.quartier || ''}
//                                             onChange={(val) => handleAddressChange('quartier', val)}
//                                             error={!!addressErrors.quartier}
//                                             helperText={addressErrors.quartier}
//                                             placeholder="Votre quartier"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Lot */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             title="Lot"
//                                             value={newAddress.lot || ''}
//                                             onChange={(val) => handleAddressChange('lot', val)}
//                                             error={!!addressErrors.lot}
//                                             helperText={addressErrors.lot}
//                                             placeholder="Numéro de lot"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Complément d'adresse */}
//                                     <div className="md:col-span-2">
//                                         <label className="block mb-2">
//                                             <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
//                                                 <MdInfoOutline className="text-accent" />
//                                                 Description complémentaire *
//                                             </div>
//                                         </label>
//                                         <textarea
//                                             value={newAddress.complement || ''}
//                                             onChange={(e) => handleAddressChange('complement', e.target.value)}
//                                             placeholder="Décrivez plus précisément votre adresse (références, bâtiment, étage, etc.)"
//                                             className={`w-full h-32 p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
//                                                 addressErrors.complement 
//                                                     ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
//                                                     : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
//                                             }`}
//                                         />
//                                         {addressErrors.complement && (
//                                             <p className="text-red-500 text-sm mt-2">{addressErrors.complement}</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="bg-accent/10 p-4 rounded-xl">
//                                     <div className="flex items-start gap-3">
//                                         <MdInfoOutline className="text-accent text-xl mt-1" />
//                                         <div>
//                                             <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
//                                                 💡 Conseil
//                                             </p>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 Renseignez une description précise pour faciliter la livraison de vos commandes.
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end rounded-b-2xl">
//                                 <button
//                                     onClick={() => {
//                                         setOpenAddressDialog(false);
//                                         setNewAddress({
//                                             labelle: '',
//                                             ville: '',
//                                             codePostal: '',
//                                             quartier: '',
//                                             lot: '',
//                                             complement: '',
//                                             type: 'home'
//                                         });
//                                         setAddressErrors({});
//                                     }}
//                                     className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center gap-2"
//                                 >
//                                     <MdCancel />
//                                     Annuler
//                                 </button>
//                                 <button
//                                     onClick={handleAddAddress}
//                                     disabled={loading}
//                                     className="px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <div className="loading loading-spinner loading-sm"></div>
//                                             Ajout en cours...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <MdSave />
//                                             Ajouter l'adresse
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Modal d'édition d'adresse */}
//                 {openEditAddressDialog && editingAddress && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
//                         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 animate-scaleIn">
//                             <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center rounded-t-2xl">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-2.5 bg-accent rounded-lg">
//                                         <FaEdit className="text-white text-xl" />
//                                     </div>
//                                     <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                         Modifier l'adresse
//                                     </h3>
//                                 </div>
//                                 <button
//                                     onClick={() => {
//                                         setOpenEditAddressDialog(false);
//                                         setEditingAddress(null);
//                                     }}
//                                     className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                                 >
//                                     <MdCancel className="text-2xl text-gray-500 dark:text-gray-400" />
//                                 </button>
//                             </div>

//                             <div className="p-6 space-y-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* Label de l'adresse */}
//                                     <div className="md:col-span-2">
//                                         <InputValidate
//                                             IconComponent={FaMapMarkerAlt}
//                                             type="text"
//                                             title="Label de l'adresse *"
//                                             value={editingAddress.labelle || ''}
//                                             onChange={(val) => handleEditAddressChange('labelle', val)}
//                                             error={!!addressErrors.labelle}
//                                             helperText={addressErrors.labelle}
//                                             placeholder="Nommez votre adresse (Ex: Maison, Bureau, etc.)"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Ville */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             title="Ville *"
//                                             value={editingAddress.ville || ''}
//                                             onChange={(val) => handleEditAddressChange('ville', val)}
//                                             error={!!addressErrors.ville}
//                                             helperText={addressErrors.ville}
//                                             placeholder="Votre ville"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Code Postal */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={FaMapMarkerAlt}
//                                             type="text"
//                                             title="Code Postal *"
//                                             value={editingAddress.codePostal || ''}
//                                             onChange={(val) => handleEditAddressChange('codePostal', val)}
//                                             error={!!addressErrors.codePostal}
//                                             helperText={addressErrors.codePostal}
//                                             placeholder="XXX"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Quartier */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             title="Quartier *"
//                                             value={editingAddress.quartier || ''}
//                                             onChange={(val) => handleEditAddressChange('quartier', val)}
//                                             error={!!addressErrors.quartier}
//                                             helperText={addressErrors.quartier}
//                                             placeholder="Votre quartier"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Lot */}
//                                     <div>
//                                         <InputValidate
//                                             IconComponent={MdLocationOn}
//                                             type="text"
//                                             title="Lot *"
//                                             value={editingAddress.lot || ''}
//                                             onChange={(val) => handleEditAddressChange('lot', val)}
//                                             error={!!addressErrors.lot}
//                                             helperText={addressErrors.lot}
//                                             placeholder="Numéro de lot"
//                                             largeur="full"
//                                             ClassIcone="text-accent"
//                                         />
//                                     </div>

//                                     {/* Complément d'adresse */}
//                                     <div className="md:col-span-2">
//                                         <label className="block mb-2">
//                                             <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
//                                                 <MdInfoOutline className="text-accent" />
//                                                 Description complémentaire *
//                                             </div>
//                                         </label>
//                                         <textarea
//                                             value={editingAddress.complement || ''}
//                                             onChange={(e) => handleEditAddressChange('complement', e.target.value)}
//                                             placeholder="Décrivez plus précisément votre adresse (références, bâtiment, étage, etc.)"
//                                             className={`w-full h-32 p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
//                                                 addressErrors.complement 
//                                                     ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
//                                                     : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
//                                             }`}
//                                         />
//                                         {addressErrors.complement && (
//                                             <p className="text-red-500 text-sm mt-2">{addressErrors.complement}</p>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="bg-accent/10 p-4 rounded-xl">
//                                     <div className="flex items-start gap-3">
//                                         <MdInfoOutline className="text-accent text-xl mt-1" />
//                                         <div>
//                                             <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
//                                                 💡 Conseil
//                                             </p>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                 Renseignez une description précise pour faciliter la livraison de vos commandes.
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end rounded-b-2xl">
//                                 <button
//                                     onClick={() => {
//                                         setOpenEditAddressDialog(false);
//                                         setEditingAddress(null);
//                                     }}
//                                     className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center gap-2"
//                                 >
//                                     <MdCancel />
//                                     Annuler
//                                 </button>
//                                 <button
//                                     onClick={handleSaveEditedAddress}
//                                     disabled={loading}
//                                     className="px-6 py-3 bg-accent text-white rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <div className="loading loading-spinner loading-sm"></div>
//                                             Enregistrement...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <MdSave />
//                                             Enregistrer
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                  {/* Modal de supression */}
//                             <dialog
//                                 id="login_modal"
//                                 className={`modal ${isLoginModalOpen ? "modal-open" : ""}`}
//                             >
//                                 <div className="modal-box bg-slate-200 dark:bg-gray-800">
//                                     <form method="dialog">
//                                         <button
//                                             className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
//                                             onClick={closeLoginModal}
//                                         >
//                                             ✕
//                                         </button>
//                                     </form>
                
//                                     <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Connectez-vous à votre compte</h3>
                
//                                     <form onSubmit={() => handleDeleteAddress(address.id)}>
//                                         {messageError && (
//                                                 <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
//                                                 <MdInfoOutline size={20} />
//                                                 <span> {messageError}</span>
//                                             </div>
//                                         )} 
                                       
                
//                                         <div className="mb-4 text-center">
//                                             <p className="text-lg text-gray-600 dark:text-gray-300">
//                                                Voulez vous vraiment supprimer cette d'adresse ?
//                                             </p>
//                                         </div>
                
//                                         <div className="modal-action justify-center">
//                                             <button
//                                                 type="button"
//                                                 className="btn btn-error btn-outline btn-wide"
//                                             >
//                                                 Annuler
//                                             </button>
//                                             <button
//                                                 type="submit"
//                                                 className="btn btn-accent btn-outline btn-wide"
//                                             >
//                                                 {loading ? (
//                                                     <div className="flex flex-row items-center justify-center gap-2">
//                                                         <span className="loading loading-spinner text-accent"></span>
//                                                         <span> Suppression...</span>
//                                                     </div>
//                                                 ) : (
//                                                     "Supprimer"
//                                                 )}
//                                             </button>
//                                         </div>
//                                     </form>
//                                 </div>
                
//                                 {/* Backdrop pour fermer le modal */}
//                                 <form
//                                     method="dialog"
//                                     className="modal-backdrop"
//                                 >
//                                     <button onClick={closeLoginModal}>Fermer</button>
//                                 </form>
//                             </dialog>
//             </div>

//             {/* Ajout de styles CSS pour les animations */}
//             <style jsx>{`
//                 @keyframes fadeIn {
//                     from { opacity: 0; }
//                     to { opacity: 1; }
//                 }
                
//                 @keyframes scaleIn {
//                     from { transform: scale(0.95); opacity: 0; }
//                     to { transform: scale(1); opacity: 1; }
//                 }
                
//                 .animate-fadeIn {
//                     animation: fadeIn 0.3s ease-out;
//                 }
                
//                 .animate-scaleIn {
//                     animation: scaleIn 0.3s ease-out;
//                 }
                
//                 .animate-gradient {
//                     animation: gradient 3s ease infinite;
//                     background-size: 200% 200%;
//                 }
                
//                 @keyframes gradient {
//                     0% { background-position: 0% 50%; }
//                     50% { background-position: 100% 50%; }
//                     100% { background-position: 0% 50%; }
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default ProfilePage;

