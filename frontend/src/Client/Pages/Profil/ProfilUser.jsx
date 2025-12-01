import React, { useState, useEffect } from 'react';
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { InputValidate } from "@/components/InputValidate";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
import { FaUserCheck, FaUserLock } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Alert from "@mui/material/Alert";
import { useAuth } from "../../../hook/useAuth";

const ProfilUser = ({ user, onProfileUpdate }) => {
    const { updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ show: false, text: "", type: "success" });
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                nom: user.nom || '',
                prenom: user.prenom || '',
                email: user.email || '',
                telephone: user.telephone || '',
                civilite: user.civilite || '',
                dateNaissance: user.dateNaissance || ''
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
        } else if (!/\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
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
        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                setMessage({
                    show: true,
                    text: "Profil mis à jour avec succès",
                    type: "success"
                });
                setIsEditing(false);
                if (onProfileUpdate) {
                    onProfileUpdate(formData);
                }
            } else {
                setMessage({
                    show: true,
                    text: result.error || "Erreur lors de la mise à jour",
                    type: "error"
                });
            }
        } catch (error) {
            setMessage({
                show: true,
                text: "Erreur lors de la mise à jour du profil",
                type: "error"
            });
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            civilite: user.civilite || '',
            dateNaissance: user.dateNaissance || ''
        });
        setErrors({});
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* En-tête avec bouton d'édition */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Mon Profil
                </h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-outline btn-accent flex items-center gap-2"
                    >
                        <MdEdit className="text-lg" />
                        Modifier le profil
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="btn btn-success flex items-center gap-2"
                        >
                            <MdSave className="text-lg" />
                            {loading ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="btn btn-error flex items-center gap-2"
                        >
                            <MdCancel className="text-lg" />
                            Annuler
                        </button>
                    </div>
                )}
            </div>

            {/* Message d'alerte */}
            {message.show && (
                <Alert 
                    severity={message.type} 
                    className="mb-4"
                    onClose={() => setMessage(prev => ({ ...prev, show: false }))}
                >
                    {message.text}
                </Alert>
            )}

            {/* Affichage du profil */}
            {!isEditing ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
                            Civilité:
                        </div>
                        <div className="text-gray-800 dark:text-white">
                            {user.civilite || 'Non renseigné'}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
                            Nom:
                        </div>
                        <div className="text-gray-800 dark:text-white">
                            {user.nom}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
                            Prénom:
                        </div>
                        <div className="text-gray-800 dark:text-white">
                            {user.prenom}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
                            Email:
                        </div>
                        <div className="text-gray-800 dark:text-white">
                            {user.email}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 min-w-[100px]">
                            Téléphone:
                        </div>
                        <div className="text-gray-800 dark:text-white">
                            {user.telephone || 'Non renseigné'}
                        </div>
                    </div>
                </div>
            ) : (
                /* Formulaire d'édition */
                <div className="space-y-6">
                    <FormControl error={!!errors.civilite} className="w-full">
                        <FormLabel className="text-gray-600 dark:text-slate-300">
                            Civilité
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
                        ClassIcone="text-accent"
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
                        ClassIcone="text-accent"
                    />

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
                        ClassIcone="text-accent"
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
                        ClassIcone="text-accent"
                    />
                </div>
            )}
        </div>
    );
};

export default ProfilUser;