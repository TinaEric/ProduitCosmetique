import React, { useState, useEffect } from 'react';
import { MdEdit, MdSave, MdCancel, MdDelete, MdAdd, MdLocationOn } from "react-icons/md";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
import { FaUserCheck, FaUserLock } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";

// Composant InputValidate simplifié
const InputValidate = ({ IconComponent, type, placeholder, title, name, value, onChange, error, helperText, ClassIcone }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {title}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IconComponent className={`h-5 w-5 ${ClassIcone}`} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:border-red-600' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      />
    </div>
    {helperText && (
      <p className="mt-1 text-sm text-red-500">{helperText}</p>
    )}
  </div>
);

const ProfilUser = ({ user: initialUser, onProfileUpdate }) => {
  const [user, setUser] = useState(initialUser || {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '0612345678',
    civilite: 'Mr',
    dateNaissance: '1990-01-01',
    addresses: [
      { id: 1, label: 'Domicile', street: '123 Rue de la Paix', city: 'Paris', zipCode: '75001', country: 'France', isDefault: true },
      { id: 2, label: 'Travail', street: '45 Avenue des Champs', city: 'Lyon', zipCode: '69001', country: 'France', isDefault: false }
    ]
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: "", type: "success" });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    zipCode: '',
    country: 'France',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        civilite: user.civilite || '',
        dateNaissance: user.dateNaissance || '',
        addresses: user.addresses || []
      });
    }
  }, [user]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setTimeout(() => {
      setMessage({
        show: true,
        text: "Profil mis à jour avec succès",
        type: "success"
      });
      setIsEditing(false);
      setUser({ ...user, ...formData });
      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }
      setLoading(false);
      setTimeout(() => setMessage({ show: false, text: "", type: "success" }), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      civilite: user.civilite || '',
      dateNaissance: user.dateNaissance || '',
      addresses: user.addresses || []
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = formData.addresses.filter(addr => addr.id !== addressId);
    setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
    setUser(prev => ({ ...prev, addresses: updatedAddresses }));
    setMessage({
      show: true,
      text: "Adresse supprimée avec succès",
      type: "success"
    });
    setTimeout(() => setMessage({ show: false, text: "", type: "success" }), 3000);
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.zipCode) {
      setMessage({
        show: true,
        text: "Veuillez remplir tous les champs de l'adresse",
        type: "error"
      });
      setTimeout(() => setMessage({ show: false, text: "", type: "success" }), 3000);
      return;
    }

    const addressToAdd = {
      ...newAddress,
      id: Date.now()
    };

    const updatedAddresses = [...(formData.addresses || []), addressToAdd];
    setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
    setUser(prev => ({ ...prev, addresses: updatedAddresses }));
    setNewAddress({
      label: '',
      street: '',
      city: '',
      zipCode: '',
      country: 'France',
      isDefault: false
    });
    setShowAddressForm(false);
    setMessage({
      show: true,
      text: "Adresse ajoutée avec succès",
      type: "success"
    });
    setTimeout(() => setMessage({ show: false, text: "", type: "success" }), 3000);
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = formData.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setFormData(prev => ({ ...prev, addresses: updatedAddresses }));
    setUser(prev => ({ ...prev, addresses: updatedAddresses }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* En-tête avec animation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mon Profil
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez vos informations personnelles et vos adresses
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MdEdit className="text-xl" />
                Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <MdSave className="text-xl" />
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MdCancel className="text-xl" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message d'alerte avec animation */}
        {message.show && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg transform animate-slideIn ${
            message.type === "success" 
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-l-4 border-green-500" 
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-l-4 border-red-500"
          }`}>
            {message.text}
          </div>
        )}

        {/* Informations personnelles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <FaUserCheck className="text-blue-500" />
            Informations Personnelles
          </h2>

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Civilité', value: user.civilite },
                { label: 'Nom', value: user.nom },
                { label: 'Prénom', value: user.prenom },
                { label: 'Email', value: user.email },
                { label: 'Téléphone', value: user.telephone }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {item.label}
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.value || 'Non renseigné'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Civilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Civilité
                </label>
                <div className="flex gap-4">
                  {['Mr', 'Mme', 'Mlle'].map((civ) => (
                    <label
                      key={civ}
                      className={`flex-1 cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                        formData.civilite === civ
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="civilite"
                        value={civ}
                        checked={formData.civilite === civ}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="font-medium">{civ}</span>
                    </label>
                  ))}
                </div>
                {errors.civilite && (
                  <p className="mt-1 text-sm text-red-500">{errors.civilite}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputValidate
                  IconComponent={FaUserCheck}
                  type="text"
                  placeholder="Votre nom..."
                  title="Nom"
                  name="nom"
                  value={formData.nom || ""}
                  onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
                  error={!!errors.nom}
                  helperText={errors.nom}
                  ClassIcone="text-blue-500"
                />

                <InputValidate
                  IconComponent={FaUserLock}
                  type="text"
                  placeholder="Votre prénom..."
                  title="Prénom"
                  name="prenom"
                  value={formData.prenom || ""}
                  onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
                  error={!!errors.prenom}
                  helperText={errors.prenom}
                  ClassIcone="text-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputValidate
                  IconComponent={MdOutlineEmail}
                  type="email"
                  placeholder="Votre email..."
                  title="Email"
                  name="email"
                  value={formData.email || ""}
                  onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                  error={!!errors.email}
                  helperText={errors.email}
                  ClassIcone="text-blue-500"
                />

                <InputValidate
                  IconComponent={DevicePhoneMobileIcon}
                  type="text"
                  placeholder="Votre numéro de téléphone..."
                  title="Téléphone"
                  name="telephone"
                  value={formData.telephone || ""}
                  onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
                  error={!!errors.telephone}
                  helperText={errors.telephone}
                  ClassIcone="text-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section Adresses */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MdLocationOn className="text-purple-500" />
              Mes Adresses
            </h2>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <MdAdd className="text-xl" />
              Ajouter une adresse
            </button>
          </div>

          {/* Formulaire d'ajout d'adresse */}
          {showAddressForm && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Nouvelle Adresse
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Label (ex: Domicile, Travail)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                  className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Rue"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Code postal"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                  className="px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddAddress}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des adresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.addresses && formData.addresses.length > 0 ? (
              formData.addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    address.isDefault
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  {address.isDefault && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                      Par défaut
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <MdLocationOn className="text-purple-500 text-2xl mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                        {address.label}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {address.street}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {address.zipCode} {address.city}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {address.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address.id)}
                        className="flex-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all text-sm font-medium"
                      >
                        Définir par défaut
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-medium"
                    >
                      <MdDelete />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
                Aucune adresse enregistrée
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilUser;

// import React, { useState, useEffect } from 'react';
// import { MdEdit, MdSave, MdCancel } from "react-icons/md";
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
// import Alert from "@mui/material/Alert";
// import { useAuth } from "../../../hook/useAuth";

// const ProfilUser = ({ user, onProfileUpdate }) => {
//     const { updateUserProfile } = useAuth();
//     const [isEditing, setIsEditing] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ show: false, text: "", type: "success" });
//     const [formData, setFormData] = useState({});
//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         if (user) {
//             setFormData({
//                 nom: user.nom || '',
//                 prenom: user.prenom || '',
//                 email: user.email || '',
//                 telephone: user.telephone || '',
//                 civilite: user.civilite || '',
//                 dateNaissance: user.dateNaissance || ''
//             });
//         }
//     }, [user]);

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

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         setErrors(prev => ({ ...prev, [name]: "" }));
//     };

//     const handleSave = async () => {
//         if (!validateForm()) return;

//         setLoading(true);
//         try {
//             const result = await updateUserProfile(formData);
//             if (result.success) {
//                 setMessage({
//                     show: true,
//                     text: "Profil mis à jour avec succès",
//                     type: "success"
//                 });
//                 setIsEditing(false);
//                 if (onProfileUpdate) {
//                     onProfileUpdate(formData);
//                 }
//             } else {
//                 setMessage({
//                     show: true,
//                     text: result.error || "Erreur lors de la mise à jour",
//                     type: "error"
//                 });
//             }
//         } catch (error) {
//             setMessage({
//                 show: true,
//                 text: "Erreur lors de la mise à jour du profil",
//                 type: "error"
//             });
//         }
//         setLoading(false);
//     };

//     const handleCancel = () => {
//         setFormData({
//             nom: user.nom || '',
//             prenom: user.prenom || '',
//             email: user.email || '',
//             telephone: user.telephone || '',
//             civilite: user.civilite || '',
//             dateNaissance: user.dateNaissance || ''
//         });
//         setErrors({});
//         setIsEditing(false);
//     };

//     if (!user) return null;

//     return (
//         <div className="w-full p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
//             {/* En-tête avec bouton d'édition */}
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
//                     Mon Profil
//                 </h2>
//                 {!isEditing ? (
//                     <button
//                         onClick={() => setIsEditing(true)}
//                         className="btn btn-outline btn-accent flex items-center gap-2"
//                     >
//                         <MdEdit className="text-lg" />
//                         Modifier le profil
//                     </button>
//                 ) : (
//                     <div className="flex gap-2">
//                         <button
//                             onClick={handleSave}
//                             disabled={loading}
//                             className="btn btn-success flex items-center gap-2"
//                         >
//                             <MdSave className="text-lg" />
//                             {loading ? "Sauvegarde..." : "Sauvegarder"}
//                         </button>
//                         <button
//                             onClick={handleCancel}
//                             className="btn btn-error flex items-center gap-2"
//                         >
//                             <MdCancel className="text-lg" />
//                             Annuler
//                         </button>
//                     </div>
//                 )}
//             </div>

//             {/* Message d'alerte */}
//             {message.show && (
//                 <Alert 
//                     severity={message.type} 
//                     className="mb-4"
//                     onClose={() => setMessage(prev => ({ ...prev, show: false }))}
//                 >
//                     {message.text}
//                 </Alert>
//             )}

//             {/* Affichage du profil */}
//             {!isEditing ? (
//                 <div className="space-y-4">
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                         <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
//                             Civilité:
//                         </div>
//                         <div className="text-gray-800 dark:text-white">
//                             {user.civilite || 'Non renseigné'}
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                         <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
//                             Nom:
//                         </div>
//                         <div className="text-gray-800 dark:text-white">
//                             {user.nom}
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                         <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
//                             Prénom:
//                         </div>
//                         <div className="text-gray-800 dark:text-white">
//                             {user.prenom}
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                         <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
//                             Email:
//                         </div>
//                         <div className="text-gray-800 dark:text-white">
//                             {user.email}
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                         <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
//                             Téléphone:
//                         </div>
//                         <div className="text-gray-800 dark:text-white">
//                             {user.telephone || 'Non renseigné'}
//                         </div>
//                     </div>
//                 </div>
//             ) : (
//                 /* Formulaire d'édition */
//                 <div className="space-y-6">
//                     <FormControl error={!!errors.civilite} className="w-full">
//                         <FormLabel className="text-gray-600 dark:text-slate-300">
//                             Civilité
//                         </FormLabel>
//                         <RadioGroup
//                             row
//                             name="civilite"
//                             value={formData.civilite || ""}
//                             onChange={handleChange}
//                             className="gap-4"
//                         >
//                             <FormControlLabel
//                                 value="Mr"
//                                 control={<Radio />}
//                                 label="Mr"
//                                 className="text-gray-600 dark:text-slate-300"
//                             />
//                             <FormControlLabel
//                                 value="Mme"
//                                 control={<Radio />}
//                                 label="Mme"
//                                 className="text-gray-600 dark:text-slate-300"
//                             />
//                             <FormControlLabel
//                                 value="Mlle"
//                                 control={<Radio />}
//                                 label="Mlle"
//                                 className="text-gray-600 dark:text-slate-300"
//                             />
//                         </RadioGroup>
//                         <FormHelperText>{errors.civilite}</FormHelperText>
//                     </FormControl>

//                     <InputValidate
//                         IconComponent={FaUserCheck}
//                         type="text"
//                         placeholder="Votre nom..."
//                         title="Nom"
//                         name="nom"
//                         value={formData.nom || ""}
//                         onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
//                         error={!!errors.nom}
//                         helperText={errors.nom}
//                         ClassIcone="text-accent"
//                     />

//                     <InputValidate
//                         IconComponent={FaUserLock}
//                         type="text"
//                         placeholder="Votre prénom..."
//                         title="Prénom"
//                         name="prenom"
//                         value={formData.prenom || ""}
//                         onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
//                         error={!!errors.prenom}
//                         helperText={errors.prenom}
//                         ClassIcone="text-accent"
//                     />

//                     <InputValidate
//                         IconComponent={MdOutlineEmail}
//                         type="email"
//                         placeholder="Votre email..."
//                         title="Email"
//                         name="email"
//                         value={formData.email || ""}
//                         onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                         error={!!errors.email}
//                         helperText={errors.email}
//                         ClassIcone="text-accent"
//                     />

//                     <InputValidate
//                         IconComponent={DevicePhoneMobileIcon}
//                         type="text"
//                         placeholder="Votre numéro de téléphone..."
//                         title="Téléphone"
//                         name="telephone"
//                         value={formData.telephone || ""}
//                         onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
//                         error={!!errors.telephone}
//                         helperText={errors.telephone}
//                         ClassIcone="text-accent"
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProfilUser;