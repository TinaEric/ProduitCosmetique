import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaMapMarkerAlt, FaPlus, FaHome, FaBuilding, FaTrash } from 'react-icons/fa';
import { MdEmail, MdPhone, MdPerson, MdCalendarToday } from 'react-icons/md';
import { Alert } from "@mui/material";
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
import { getClientAddresses, updateClientAddress } from "@/services/ClientService";
import { MdLocationOn, MdAddLocation, MdInfoOutline } from "react-icons/md";
import AddressCard from "@/components/AddressCard";

const ProfilePage = () => {
    const { user, isAuthenticated, logout, updateUserProfile } = useAuthContext();
    const navigate = useNavigate();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ show: false, text: "", type: "success" });
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    
    // États pour la gestion des adresses
    const [adressesClient, setAdressesClient] = useState([]);
    const [chargementAdresses, setChargementAdresses] = useState(false);
    const [newAddress, setNewAddress] = useState({
        labelle: '',
        ville: '',
        codePostal: '',
        quartier: '',
        lot: '',
        complement: '',
        type: 'home'
    });
    const [addressErrors, setAddressErrors] = useState({});

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
                nom: user.client.nomClient || '',
                prenom: user.client.prenomClient || '',
                email: user.emailUsers || user.email || '',
                telephone: user.client.telephoneClient || '',
                civilite: user.client.civiliteClient || '',
                dateNaissance: user.client.dateNaissance || ''
            });
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
                    show: true,
                    text: "Erreur lors du chargement des adresses",
                    type: "error",
                });
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
            const response = await updateClientAddress(editedAddress);
            if (response) {
                // Recharger la liste des adresses
                await getAdresses();
                setMessage({
                    show: true,
                    text: "Adresse modifiée avec succès",
                    type: "success",
                });
            }
        } catch (error) {
            console.error("Erreur lors de la modification de l'adresse:", error);
            setMessage({
                show: true,
                text: "Erreur lors de la modification de l'adresse",
                type: "error",
            });
        }
    };

    // Fonction pour supprimer une adresse
    const handleDeleteAddress = async (addressId) => {
        try {
            setAdressesClient(prev => prev.filter(addr => addr.id !== addressId));
            setMessage({
                show: true,
                text: "Adresse supprimée avec succès",
                type: "success",
            });
        } catch (error) {
            console.error("Erreur lors de la suppression de l'adresse:", error);
            setMessage({
                show: true,
                text: "Erreur lors de la suppression de l'adresse",
                type: "error",
            });
        }
    };

    // Fonction pour définir une adresse comme principale
    const handleSetPrincipalAddress = (addressId) => {
        setAdressesClient(prev => prev.map(addr => ({
            ...addr,
            principal: addr.id === addressId
        })));
        setMessage({
            show: true,
            text: "Adresse principale mise à jour",
            type: "success",
        });
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
            tempErrors.dateNaissance = "veuiller choisir votre date de naissance";
            isValid = false;
        }
        if (!formData.telephone || formData.telephone.trim() === "") {
            tempErrors.telephone = "Le numéro de téléphone est requis";
            isValid = false;
        } else if (!/\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
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
            tempErrors.labelle = "Mentionner le labelle de votre adresse, Ce champ est requis.";
            isValid = false;
        }
        if (!newAddress.codePostal || !/\d+$/.test(newAddress.codePostal)) {
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

    const handleSaveProfile = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Simuler la mise à jour du profil
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage({
                show: true,
                text: "Profil mis à jour avec succès",
                type: "success"
            });
            
            setOpenEditDialog(false);
            
        } catch (error) {
            setMessage({
                show: true,
                text: "Erreur lors de la mise à jour du profil",
                type: "error"
            });
        }
        setLoading(false);
    };

    const handleAddAddress = async () => {
        if (!validateAddressForm()) return;

        setLoading(true);
        try {
            // Simuler la création d'adresse
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newAddr = {
                id: Date.now(), // ID temporaire
                ...newAddress,
                principal: adressesClient.length === 0,
                createdAt: new Date().toISOString()
            };

            setAdressesClient(prev => [newAddr, ...prev]);
            setNewAddress({
                labelle: '',
                ville: '',
                codePostal: '',
                quartier: '',
                lot: '',
                complement: '',
                type: 'home'
            });
            setOpenAddressDialog(false);
            setMessage({
                show: true,
                text: "Adresse ajoutée avec succès",
                type: "success"
            });
        } catch (error) {
            setMessage({
                show: true,
                text: "Erreur lors de l'ajout de l'adresse",
                type: "error"
            });
        }
        setLoading(false);
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-10">
            <div className="container mx-auto px-4">
                {/* En-tête */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Mon Profil
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Gérez vos informations personnelles et vos adresses
                    </p>
                </div>
                {/* Message d'alerte */}
                {message.show && (
                    <div className="max-w-4xl mx-auto mb-6">
                        <Alert 
                            severity={message.type}
                            onClose={() => setMessage(prev => ({ ...prev, show: false }))}
                        >
                            {message.text}
                        </Alert>
                    </div>
                )}

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne de gauche - Informations personnelles */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Carte Informations personnelles */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Informations personnelles
                                </h2>
                                <button
                                    onClick={() => setOpenEditDialog(true)}
                                    className="btn btn-outline btn-accent flex items-center gap-2"
                                >
                                    <FaEdit />
                                    Modifier
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MdPerson className="text-accent text-xl" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Civilité</p>
                                            <p className="text-gray-800 dark:text-white font-medium">
                                                {user.client.civiliteClient || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MdPerson className="text-accent text-xl" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                                            <p className="text-gray-800 dark:text-white font-medium">
                                                {user.client.nomClient}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MdPerson className="text-accent text-xl" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Prénom</p>
                                            <p className="text-gray-800 dark:text-white font-medium">
                                                {user.client.prenomClient}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MdEmail className="text-accent text-xl" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-gray-800 dark:text-white font-medium">
                                                {user.emailUsers || user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MdPhone className="text-accent text-xl" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                                            <p className="text-gray-800 dark:text-white font-medium">
                                                {user.client.telephoneClient || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MdCalendarToday className="text-accent text-xl" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
                                            <p className="text-gray-800 dark:text-white font-medium">
                                                {user.client.dateNaissance ? new Date(user.client.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carte Adresses */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    Mes adresses
                                </h2>
                                <button
                                    onClick={() => setOpenAddressDialog(true)}
                                    className="btn btn-accent flex items-center gap-2"
                                >
                                    <FaPlus />
                                    Ajouter une adresse
                                </button>
                            </div>

                            {chargementAdresses ? (
                                <div className="flex justify-center py-8">
                                    <div className="flex items-center gap-3">
                                        <div className="loading loading-spinner text-accent"></div>
                                        <span className="text-gray-600 dark:text-gray-300">Chargement des adresses...</span>
                                    </div>
                                </div>
                            ) : adressesClient.length > 0 ? (
                                <div className="space-y-4">
                                    {adressesClient.map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={handleEditAddress}
                                            onDelete={handleDeleteAddress}
                                            onSetPrincipal={handleSetPrincipalAddress}
                                            showActions={true}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Aucune adresse enregistrée
                                    </p>
                                    <div className="flex justify-center space-x-1 rounded-lg bg-blue-50 p-3 text-blue-800 dark:bg-blue-800/5 dark:text-blue-500">
                                        <MdInfoOutline size={20} />
                                        <span>Ajoutez votre première adresse pour faciliter vos commandes</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne de droite - Actions rapides */}
                    <div className="space-y-6">
                        {/* Carte Actions rapides */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                Actions rapides
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/MesCommande"
                                    className="btn btn-outline btn-accent w-full justify-start"
                                >
                                    📦 Mes commandes
                                </Link>
                                <Link
                                    to="/Produit"
                                    className="btn btn-outline btn-accent w-full justify-start"
                                >
                                    🛍️ Continuer mes achats
                                </Link>
                                <button
                                    onClick={logout}
                                    className="btn btn-outline btn-error w-full justify-start"
                                >
                                    🚪 Se déconnecter
                                </button>
                            </div>
                        </div>

                        {/* Carte Statut du compte */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                Statut du compte
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Membre depuis</span>
                                    <span className="text-gray-800 dark:text-white font-medium">
                                        {new Date().toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Statut</span>
                                    <span className="text-green-500 font-medium">✓ Actif</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Adresses enregistrées</span>
                                    <span className="text-gray-800 dark:text-white font-medium">
                                        {adressesClient.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de modification du profil - DaisyUI */}
            <dialog className={`modal ${openEditDialog ? 'modal-open' : ''}`}>
                <div className="modal-box bg-slate-200 dark:bg-gray-800 max-w-2xl">
                    <form method="dialog">
                        <button 
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={() => setOpenEditDialog(false)}
                        >
                            ✕
                        </button>
                    </form>

                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">
                        Modifier mon profil
                    </h3>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-4">
                        <FormControl error={!!errors.civilite} className="w-full">
                            <FormLabel className="text-gray-600 dark:text-slate-300 mb-3">
                                Civilité *
                            </FormLabel>
                            <RadioGroup
                                row
                                name="civilite"
                                value={formData.civilite || ""}
                                onChange={handleChange}
                                className="gap-4"
                            >
                                <FormControlLabel
                                    value="Mr"
                                    control={<Radio />}
                                    label="Mr"
                                    className="text-gray-600 dark:text-slate-300"
                                />
                                <FormControlLabel
                                    value="Mme"
                                    control={<Radio />}
                                    label="Mme"
                                    className="text-gray-600 dark:text-slate-300"
                                />
                                <FormControlLabel
                                    value="Mlle"
                                    control={<Radio />}
                                    label="Mlle"
                                    className="text-gray-600 dark:text-slate-300"
                                />
                            </RadioGroup>
                            <FormHelperText>{errors.civilite}</FormHelperText>
                        </FormControl>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputValidate
                                IconComponent={FaUserCheck}
                                type="text"
                                placeholder="Votre nom..."
                                title="Nom *"
                                name="nom"
                                value={formData.nom || ""}
                                onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
                                error={!!errors.nom}
                                helperText={errors.nom}
                                ClassIcone="text-accent"
                            />

                            <InputValidate
                                IconComponent={FaUserLock}
                                type="text"
                                placeholder="Votre prénom..."
                                title="Prénom *"
                                name="prenom"
                                value={formData.prenom || ""}
                                onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
                                error={!!errors.prenom}
                                helperText={errors.prenom}
                                ClassIcone="text-accent"
                            />
                        </div>

                        <InputValidate
                            IconComponent={MdOutlineEmail}
                            type="email"
                            placeholder="Votre email..."
                            title="Email *"
                            name="email"
                            value={formData.email || ""}
                            onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                            error={!!errors.email}
                            helperText={errors.email}
                            ClassIcone="text-accent"
                        />

                        <InputValidate
                            IconComponent={DevicePhoneMobileIcon}
                            type="text"
                            placeholder="Votre numéro de téléphone..."
                            title="Téléphone *"
                            name="telephone"
                            value={formData.telephone || ""}
                            onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
                            error={!!errors.telephone}
                            helperText={errors.telephone}
                            ClassIcone="text-accent"
                        />
                        <InputValidate
                                                            IconComponent={CalendarDateRangeIcon}
                                                            type="date"
                                                            placeholder="Entrez votre date de naissance..."
                                                            title="Date de naissance"
                                                            value={formData.dateNaissance || ""}
                                                            onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
                                                            error={!!errors.dateNaissance}
                                                            helperText={errors.dateNaissance}
                                                            ClassIcone="text-accent"
                                                        />
                    </div>

                    <div className="modal-action justify-center gap-3 mt-6">
                        <button
                            onClick={() => setOpenEditDialog(false)}
                            className="btn btn-outline btn-error"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="btn btn-accent"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner"></span>
                                    Sauvegarde...
                                </div>
                            ) : (
                                "Sauvegarder"
                            )}
                        </button>
                    </div>
                </div>

                {/* Backdrop pour fermer le modal */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setOpenEditDialog(false)}>Fermer</button>
                </form>
            </dialog>

            {/* Modal d'ajout d'adresse - DaisyUI */}
            <dialog className={`modal ${openAddressDialog ? 'modal-open' : ''}`}>
                <div className="modal-box bg-slate-200 dark:bg-gray-800 max-w-2xl">
                    <form method="dialog">
                        <button 
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={() => setOpenAddressDialog(false)}
                        >
                            ✕
                        </button>
                    </form>

                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">
                        Ajouter une adresse
                    </h3>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputValidate
                                IconComponent={MdLocationOn}
                                type="text"
                                placeholder="Quartier..."
                                title="Quartier"
                                value={newAddress.quartier}
                                onChange={(val) => handleAddressChange('quartier', val)}
                                error={!!addressErrors.quartier}
                                helperText={addressErrors.quartier}
                                ClassIcone="text-accent"
                            />
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            placeholder="Lot et numéro..."
                            title="Lot"
                            value={newAddress.lot}
                            onChange={(val) => handleAddressChange('lot', val)}
                            error={!!addressErrors.lot}
                            helperText={addressErrors.lot}
                            ClassIcone="text-accent"
                        />
                        </div>

                        

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            placeholder="Nom de la ville..."
                            title="Ville"
                            value={newAddress.ville}
                            onChange={(val) => handleAddressChange('ville', val)}
                            error={!!addressErrors.ville}
                            helperText={addressErrors.ville}
                            ClassIcone="text-accent"
                        />
                            <InputValidate
                                IconComponent={MdLocationOn}
                                type="text"
                                placeholder="Code postal..."
                                title="Code postal"
                                value={newAddress.codePostal}
                                onChange={(val) => handleAddressChange('codePostal', val)}
                                error={!!addressErrors.codePostal}
                                helperText={addressErrors.codePostal}
                                ClassIcone="text-accent"
                            />

                            
                        </div>

                         <InputValidate
                                type="text"
                                placeholder="Label (ex: Maison, Bureau...)"
                                title="Label"
                                value={newAddress.labelle}
                                onChange={(val) => handleAddressChange('labelle', val)}
                                error={!!addressErrors.labelle}
                                helperText={addressErrors.labelle}
                                ClassIcone="text-accent"
                            />
                            <div className="flex w-full items-center justify-center">
                                                    <label className="mb-5 w-full items-center justify-center">
                                                        <div className="label">
                                                            <span
                                                                className={`label-text ${addressErrors.complement ? "text-red-500" : "text-gray-800 dark:text-slate-300"} `}
                                                            >
                                                                Complement d'Adresse <span className="text-red-500">*</span>
                                                            </span>
                                                        </div>
                                                        <textarea
                                                             value={newAddress.complement}
                                                             onChange={(e) => handleAddressChange('complement', e.target.value)}
                                                            className={`textarea textarea-bordered h-[100px] w-full border ${addressErrors.complement ? "border-red-500" : "border-slate-500 dark:border-slate-600"} bg-transparent text-base text-black focus:border-blue-600 dark:text-white`}
                                                            placeholder="Décrire plus d'information sur votre adresse..."
                                                        ></textarea>
                                                         {addressErrors.complement && (
                                                            <p className="text-sm text-red-500">{addressErrors.complement}</p>
                                                        )}
                                                    </label>
                                                </div>
                        {/* <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description / Complément d'adresse *
                            </label>
                            <textarea
                                value={newAddress.complement}
                                onChange={(e) => handleAddressChange('complement', e.target.value)}
                                className={`textarea textarea-bordered w-full h-24 bg-white dark:bg-gray-700 ${
                                    addressErrors.complement ? 'border-red-500' : ''
                                }`}
                                placeholder="Décrivez plus précisément votre adresse (étage, bâtiment, repères...)"
                            />
                            {addressErrors.complement && (
                                <p className="text-red-500 text-sm mt-1">{addressErrors.complement}</p>
                            )}
                        </div> */}
                    </div>

                    <div className="modal-action justify-center gap-3 mt-6">
                        <button
                            onClick={() => setOpenAddressDialog(false)}
                            className="btn btn-outline btn-error"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleAddAddress}
                            className="btn btn-accent flex items-center gap-2"
                            disabled={loading}
                        >
                            <MdAddLocation className="text-lg" />
                            {loading ? "Ajout en cours..." : "Ajouter l'adresse"}
                        </button>
                    </div>
                </div>

                {/* Backdrop pour fermer le modal */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setOpenAddressDialog(false)}>Fermer</button>
                </form>
            </dialog>
        </div>
    );
};

export default ProfilePage;

// import React, { useState, useEffect } from 'react';
// import { useAuthContext } from '@/contexts/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaEdit, FaMapMarkerAlt, FaPlus, FaHome, FaBuilding, FaTrash } from 'react-icons/fa';
// import { MdEmail, MdPhone, MdPerson, MdCalendarToday } from 'react-icons/md';
// import { Dialog, DialogContent, DialogTitle, IconButton, Slide, Alert } from '@mui/material';
// import { MdClose, MdSave, MdCancel } from "react-icons/md";
// import { InputValidate } from "@/components/InputValidate";
// import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
// import { FaUserCheck, FaUserLock } from "react-icons/fa6";
// import { MdOutlineEmail } from "react-icons/md";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import FormHelperText from "@mui/material/FormHelperText";
// import { getClientAddresses, updateClientAddress } from "@/services/ClientService";
// import { MdLocationOn, MdAddLocation, MdInfoOutline } from "react-icons/md";
// import AddressCard from "@/components/AddressCard";

// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

// const ProfilePage = () => {
//     const { user, isAuthenticated, logout, updateUserProfile } = useAuthContext();
//     const navigate = useNavigate();
//     const [openEditDialog, setOpenEditDialog] = useState(false);
//     const [openAddressDialog, setOpenAddressDialog] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ show: false, text: "", type: "success" });
//     const [formData, setFormData] = useState({});
//     const [errors, setErrors] = useState({});
    
//     // États pour la gestion des adresses
//     const [adressesClient, setAdressesClient] = useState([]);
//     const [chargementAdresses, setChargementAdresses] = useState(false);
//     const [newAddress, setNewAddress] = useState({
//         labelle: '',
//         ville: '',
//         codePostal: '',
//         quartier: '',
//         lot: '',
//         complement: '',
//         type: 'home'
//     });
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
//                 nom: user.client.nomClient || '',
//                 prenom: user.client.prenomClient || '',
//                 email: user.emailUsers || user.email || '',
//                 telephone: user.client.telephoneClient || '',
//                 civilite: user.client.civiliteClient || '',
//                 dateNaissance: user.client.dateNaissance || ''
//             });
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
//                     // Trier par ID décroissant pour avoir les plus récentes en premier
//                     const adressesTriees = listeAdresses.sort((a, b) => b.id - a.id);
//                     setAdressesClient(adressesTriees);
//                 } else {
//                     setAdressesClient([]);
//                 }
//             } catch (erreur) {
//                 console.log("Erreur de chargement des adresses:", erreur);
//                 setMessage({
//                     show: true,
//                     texte: "Erreur lors du chargement des adresses",
//                     type: "error",
//                 });
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
//             const response = await updateClientAddress(editedAddress);
//             if (response) {
//                 // Recharger la liste des adresses
//                 await getAdresses();
//                 setMessage({
//                     show: true,
//                     texte: "Adresse modifiée avec succès",
//                     type: "success",
//                 });
//             }
//         } catch (error) {
//             console.error("Erreur lors de la modification de l'adresse:", error);
//             setMessage({
//                 show: true,
//                 texte: "Erreur lors de la modification de l'adresse",
//                 type: "error",
//             });
//         }
//     };

//     // Fonction pour supprimer une adresse
//     const handleDeleteAddress = async (addressId) => {
//         try {
//             // Ici vous devriez implémenter la suppression d'adresse via votre API
//             // Pour l'instant, nous allons simplement filtrer la liste localement
//             setAdressesClient(prev => prev.filter(addr => addr.id !== addressId));
//             setMessage({
//                 show: true,
//                 texte: "Adresse supprimée avec succès",
//                 type: "success",
//             });
//         } catch (error) {
//             console.error("Erreur lors de la suppression de l'adresse:", error);
//             setMessage({
//                 show: true,
//                 texte: "Erreur lors de la suppression de l'adresse",
//                 type: "error",
//             });
//         }
//     };

//     // Fonction pour définir une adresse comme principale
//     const handleSetPrincipalAddress = (addressId) => {
//         setAdressesClient(prev => prev.map(addr => ({
//             ...addr,
//             principal: addr.id === addressId
//         })));
//         setMessage({
//             show: true,
//             texte: "Adresse principale mise à jour",
//             type: "success",
//         });
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
//         if (!formData.telephone || formData.telephone.trim() === "") {
//             tempErrors.telephone = "Le numéro de téléphone est requis";
//             isValid = false;
//         } else if (!/\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
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
//         if (!newAddress.codePostal || !/\d+$/.test(newAddress.codePostal)) {
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

//     const handleSaveProfile = async () => {
//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             // Simuler la mise à jour du profil
//             await new Promise(resolve => setTimeout(resolve, 1000));
            
//             setMessage({
//                 show: true,
//                 text: "Profil mis à jour avec succès",
//                 type: "success"
//             });
            
//             setOpenEditDialog(false);
            
//         } catch (error) {
//             setMessage({
//                 show: true,
//                 text: "Erreur lors de la mise à jour du profil",
//                 type: "error"
//             });
//         }
//         setLoading(false);
//     };

//     const handleAddAddress = async () => {
//         if (!validateAddressForm()) return;

//         setLoading(true);
//         try {
//             // Simuler la création d'adresse
//             await new Promise(resolve => setTimeout(resolve, 1000));
            
//             const newAddr = {
//                 id: Date.now(), // ID temporaire
//                 ...newAddress,
//                 principal: adressesClient.length === 0,
//                 createdAt: new Date().toISOString()
//             };

//             setAdressesClient(prev => [newAddr, ...prev]);
//             setNewAddress({
//                 labelle: '',
//                 ville: '',
//                 codePostal: '',
//                 quartier: '',
//                 lot: '',
//                 complement: '',
//                 type: 'home'
//             });
//             setOpenAddressDialog(false);
//             setMessage({
//                 show: true,
//                 text: "Adresse ajoutée avec succès",
//                 type: "success"
//             });
//         } catch (error) {
//             setMessage({
//                 show: true,
//                 text: "Erreur lors de l'ajout de l'adresse",
//                 type: "error"
//             });
//         }
//         setLoading(false);
//     };

//     if (!isAuthenticated || !user) {
//         return (
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//                 <div className="text-center">
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
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-10">
//             <div className="container mx-auto px-4">
//                 {/* En-tête */}
//                 <div className="mb-8 text-center">
//                     <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
//                         Mon Profil
//                     </h1>
//                     <p className="text-gray-600 dark:text-gray-300">
//                         Gérez vos informations personnelles et vos adresses
//                     </p>
//                 </div>

//                 {/* Message d'alerte */}
//                 {message.show && (
//                     <div className="max-w-4xl mx-auto mb-6">
//                         <Alert 
//                             severity={message.type}
//                             onClose={() => setMessage(prev => ({ ...prev, show: false }))}
//                         >
//                             {message.text}
//                         </Alert>
//                     </div>
//                 )}

//                 <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Colonne de gauche - Informations personnelles */}
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* Carte Informations personnelles */}
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                     Informations personnelles
//                                 </h2>
//                                 <button
//                                     onClick={() => setOpenEditDialog(true)}
//                                     className="btn btn-outline btn-accent flex items-center gap-2"
//                                 >
//                                     <FaEdit />
//                                     Modifier
//                                 </button>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div className="space-y-4">
//                                     <div className="flex items-center gap-3">
//                                         <MdPerson className="text-accent text-xl" />
//                                         <div>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">Civilité</p>
//                                             <p className="text-gray-800 dark:text-white font-medium">
//                                                 {user.client.civiliteClient || 'Non renseigné'}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3">
//                                         <MdPerson className="text-accent text-xl" />
//                                         <div>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
//                                             <p className="text-gray-800 dark:text-white font-medium">
//                                                 {user.client.nomClient}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3">
//                                         <MdPerson className="text-accent text-xl" />
//                                         <div>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">Prénom</p>
//                                             <p className="text-gray-800 dark:text-white font-medium">
//                                                 {user.client.prenomClient}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-4">
//                                     <div className="flex items-center gap-3">
//                                         <MdEmail className="text-accent text-xl" />
//                                         <div>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
//                                             <p className="text-gray-800 dark:text-white font-medium">
//                                                 {user.emailUsers || user.email}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3">
//                                         <MdPhone className="text-accent text-xl" />
//                                         <div>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
//                                             <p className="text-gray-800 dark:text-white font-medium">
//                                                 {user.client.telephoneClient || 'Non renseigné'}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-3">
//                                         <MdCalendarToday className="text-accent text-xl" />
//                                         <div>
//                                             <p className="text-sm text-gray-500 dark:text-gray-400">Date de naissance</p>
//                                             <p className="text-gray-800 dark:text-white font-medium">
//                                                 {user.client.dateNaissance ? new Date(user.client.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Carte Adresses */}
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//                                     Mes adresses
//                                 </h2>
//                                 <button
//                                     onClick={() => setOpenAddressDialog(true)}
//                                     className="btn btn-accent flex items-center gap-2"
//                                 >
//                                     <FaPlus />
//                                     Ajouter une adresse
//                                 </button>
//                             </div>

//                             {chargementAdresses ? (
//                                 <div className="flex justify-center py-8">
//                                     <div className="flex items-center gap-3">
//                                         <div className="loading loading-spinner text-accent"></div>
//                                         <span className="text-gray-600 dark:text-gray-300">Chargement des adresses...</span>
//                                     </div>
//                                 </div>
//                             ) : adressesClient.length > 0 ? (
//                                 <div className="space-y-4">
//                                     {adressesClient.map((address) => (
//                                         <AddressCard
//                                             key={address.id}
//                                             address={address}
//                                             onEdit={handleEditAddress}
//                                             onDelete={handleDeleteAddress}
//                                             onSetPrincipal={handleSetPrincipalAddress}
//                                             showActions={true}
//                                         />
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-8">
//                                     <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-4" />
//                                     <p className="text-gray-500 dark:text-gray-400 mb-4">
//                                         Aucune adresse enregistrée
//                                     </p>
//                                     <div className="flex justify-center space-x-1 rounded-lg bg-blue-50 p-3 text-blue-800 dark:bg-blue-800/5 dark:text-blue-500">
//                                         <MdInfoOutline size={20} />
//                                         <span>Ajoutez votre première adresse pour faciliter vos commandes</span>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Colonne de droite - Actions rapides */}
//                     <div className="space-y-6">
//                         {/* Carte Actions rapides */}
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
//                             <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
//                                 Actions rapides
//                             </h3>
//                             <div className="space-y-3">
//                                 <Link
//                                     to="/MesCommande"
//                                     className="btn btn-outline btn-accent w-full justify-start"
//                                 >
//                                     📦 Mes commandes
//                                 </Link>
//                                 <Link
//                                     to="/Produit"
//                                     className="btn btn-outline btn-accent w-full justify-start"
//                                 >
//                                     🛍️ Continuer mes achats
//                                 </Link>
//                                 <button
//                                     onClick={logout}
//                                     className="btn btn-outline btn-error w-full justify-start"
//                                 >
//                                     🚪 Se déconnecter
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Carte Statut du compte */}
//                         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
//                             <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
//                                 Statut du compte
//                             </h3>
//                             <div className="space-y-2">
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600 dark:text-gray-300">Membre depuis</span>
//                                     <span className="text-gray-800 dark:text-white font-medium">
//                                         {new Date().toLocaleDateString('fr-FR')}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600 dark:text-gray-300">Statut</span>
//                                     <span className="text-green-500 font-medium">✓ Actif</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-gray-600 dark:text-gray-300">Adresses enregistrées</span>
//                                     <span className="text-gray-800 dark:text-white font-medium">
//                                         {adressesClient.length}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Dialogue de modification du profil */}
//             <Dialog
//                 open={openEditDialog}
//                 onClose={() => setOpenEditDialog(false)}
//                 TransitionComponent={Transition}
//                 maxWidth="md"
//                 fullWidth
//             >
//                 <DialogTitle className="bg-gradient-to-r from-primary to-accent text-white dark:from-gray-800 dark:to-gray-700">
//                     <div className="flex justify-between items-center">
//                         <span className="text-xl font-bold">Modifier mon profil</span>
//                         <IconButton
//                             onClick={() => setOpenEditDialog(false)}
//                             className="text-white hover:bg-white hover:bg-opacity-20"
//                             size="large"
//                         >
//                             <MdClose />
//                         </IconButton>
//                     </div>
//                 </DialogTitle>

//                 <DialogContent className="bg-white dark:bg-gray-800 p-6">
//                     <div className="space-y-6">
//                         <FormControl error={!!errors.civilite} className="w-full">
//                             <FormLabel className="text-gray-600 dark:text-slate-300 mb-3">
//                                 Civilité *
//                             </FormLabel>
//                             <RadioGroup
//                                 row
//                                 name="civilite"
//                                 value={formData.civilite || ""}
//                                 onChange={handleChange}
//                                 className="gap-4"
//                             >
//                                 <FormControlLabel
//                                     value="Mr"
//                                     control={<Radio />}
//                                     label="Mr"
//                                     className="text-gray-600 dark:text-slate-300"
//                                 />
//                                 <FormControlLabel
//                                     value="Mme"
//                                     control={<Radio />}
//                                     label="Mme"
//                                     className="text-gray-600 dark:text-slate-300"
//                                 />
//                                 <FormControlLabel
//                                     value="Mlle"
//                                     control={<Radio />}
//                                     label="Mlle"
//                                     className="text-gray-600 dark:text-slate-300"
//                                 />
//                             </RadioGroup>
//                             <FormHelperText>{errors.civilite}</FormHelperText>
//                         </FormControl>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <InputValidate
//                                 IconComponent={FaUserCheck}
//                                 type="text"
//                                 placeholder="Votre nom..."
//                                 title="Nom *"
//                                 name="nom"
//                                 value={formData.nom || ""}
//                                 onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
//                                 error={!!errors.nom}
//                                 helperText={errors.nom}
//                                 ClassIcone="text-accent"
//                             />

//                             <InputValidate
//                                 IconComponent={FaUserLock}
//                                 type="text"
//                                 placeholder="Votre prénom..."
//                                 title="Prénom *"
//                                 name="prenom"
//                                 value={formData.prenom || ""}
//                                 onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
//                                 error={!!errors.prenom}
//                                 helperText={errors.prenom}
//                                 ClassIcone="text-accent"
//                             />
//                         </div>

//                         <InputValidate
//                             IconComponent={MdOutlineEmail}
//                             type="email"
//                             placeholder="Votre email..."
//                             title="Email *"
//                             name="email"
//                             value={formData.email || ""}
//                             onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                             error={!!errors.email}
//                             helperText={errors.email}
//                             ClassIcone="text-accent"
//                         />

//                         <InputValidate
//                             IconComponent={DevicePhoneMobileIcon}
//                             type="text"
//                             placeholder="Votre numéro de téléphone..."
//                             title="Téléphone *"
//                             name="telephone"
//                             value={formData.telephone || ""}
//                             onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
//                             error={!!errors.telephone}
//                             helperText={errors.telephone}
//                             ClassIcone="text-accent"
//                         />

//                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
//                             <button
//                                 onClick={() => setOpenEditDialog(false)}
//                                 className="btn btn-outline btn-error flex items-center gap-2"
//                                 disabled={loading}
//                             >
//                                 <MdCancel className="text-lg" />
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={handleSaveProfile}
//                                 disabled={loading}
//                                 className="btn btn-accent flex items-center gap-2"
//                             >
//                                 <MdSave className="text-lg" />
//                                 {loading ? "Sauvegarde..." : "Sauvegarder"}
//                             </button>
//                         </div>
//                     </div>
//                 </DialogContent>
//             </Dialog>

//             {/* Dialogue d'ajout d'adresse */}
//             <Dialog
//                 open={openAddressDialog}
//                 onClose={() => setOpenAddressDialog(false)}
//                 TransitionComponent={Transition}
//                 maxWidth="md"
//                 fullWidth
//             >
//                 <DialogTitle className="bg-gradient-to-r from-primary to-accent text-white dark:from-gray-800 dark:to-gray-700">
//                     <div className="flex justify-between items-center">
//                         <span className="text-xl font-bold">Ajouter une adresse</span>
//                         <IconButton
//                             onClick={() => setOpenAddressDialog(false)}
//                             className="text-white hover:bg-white hover:bg-opacity-20"
//                             size="large"
//                         >
//                             <MdClose />
//                         </IconButton>
//                     </div>
//                 </DialogTitle>

//                 <DialogContent className="bg-white dark:bg-gray-800 p-6">
//                     <div className="space-y-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Type d'adresse
//                                 </label>
//                                 <select
//                                     value={newAddress.type}
//                                     onChange={(e) => handleAddressChange('type', e.target.value)}
//                                     className="select select-bordered w-full"
//                                 >
//                                     <option value="home">🏠 Domicile</option>
//                                     <option value="work">🏢 Travail</option>
//                                     <option value="other">📦 Autre</option>
//                                 </select>
//                             </div>

//                             <InputValidate
//                                 type="text"
//                                 placeholder="Label (ex: Maison, Bureau...)"
//                                 title="Label"
//                                 value={newAddress.labelle}
//                                 onChange={(val) => handleAddressChange('labelle', val)}
//                                 ClassIcone="text-accent"
//                             />
//                         </div>

//                         <InputValidate
//                             IconComponent={MdLocationOn}
//                             type="text"
//                             placeholder="Nom de la ville..."
//                             title="Ville *"
//                             value={newAddress.ville}
//                             onChange={(val) => handleAddressChange('ville', val)}
//                             error={!!addressErrors.ville}
//                             helperText={addressErrors.ville}
//                             ClassIcone="text-accent"
//                         />

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <InputValidate
//                                 IconComponent={MdLocationOn}
//                                 type="text"
//                                 placeholder="Code postal..."
//                                 title="Code postal *"
//                                 value={newAddress.codePostal}
//                                 onChange={(val) => handleAddressChange('codePostal', val)}
//                                 error={!!addressErrors.codePostal}
//                                 helperText={addressErrors.codePostal}
//                                 ClassIcone="text-accent"
//                             />

//                             <InputValidate
//                                 IconComponent={MdLocationOn}
//                                 type="text"
//                                 placeholder="Quartier..."
//                                 title="Quartier *"
//                                 value={newAddress.quartier}
//                                 onChange={(val) => handleAddressChange('quartier', val)}
//                                 error={!!addressErrors.quartier}
//                                 helperText={addressErrors.quartier}
//                                 ClassIcone="text-accent"
//                             />
//                         </div>

//                         <InputValidate
//                             IconComponent={MdLocationOn}
//                             type="text"
//                             placeholder="Lot et numéro..."
//                             title="Lot *"
//                             value={newAddress.lot}
//                             onChange={(val) => handleAddressChange('lot', val)}
//                             error={!!addressErrors.lot}
//                             helperText={addressErrors.lot}
//                             ClassIcone="text-accent"
//                         />

//                         <div className="w-full">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                 Description / Complément d'adresse *
//                             </label>
//                             <textarea
//                                 value={newAddress.complement}
//                                 onChange={(e) => handleAddressChange('complement', e.target.value)}
//                                 className={`textarea textarea-bordered w-full h-24 ${
//                                     addressErrors.complement ? 'border-red-500' : ''
//                                 }`}
//                                 placeholder="Décrivez plus précisément votre adresse (étage, bâtiment, repères...)"
//                             />
//                             {addressErrors.complement && (
//                                 <p className="text-red-500 text-sm mt-1">{addressErrors.complement}</p>
//                             )}
//                         </div>

//                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
//                             <button
//                                 onClick={() => setOpenAddressDialog(false)}
//                                 className="btn btn-outline btn-error"
//                             >
//                                 Annuler
//                             </button>
//                             <button
//                                 onClick={handleAddAddress}
//                                 className="btn btn-accent flex items-center gap-2"
//                                 disabled={loading}
//                             >
//                                 <MdAddLocation className="text-lg" />
//                                 {loading ? "Ajout en cours..." : "Ajouter l'adresse"}
//                             </button>
//                         </div>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };

// export default ProfilePage;
