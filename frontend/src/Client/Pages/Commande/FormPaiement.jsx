import React, { useState, useEffect } from "react";
import { Typography, Alert } from "@mui/material";
import { FaCircleInfo, FaInfo } from "react-icons/fa6";
import { MdInfoOutline } from "react-icons/md";

const FormPaiement = ({ initialData, onSubmitSuccess }) => {
    const [formData, setFormData] = useState({
        methodeLivraison: "",
        methodePaiement: "",
        ...initialData,
    });

    const [errors, setErrors] = useState({});

    // Options pour les méthodes de livraison
    const methodesLivraison = [
        { value: "", label: "Choisissez une méthode de livraison", disabled: true },
        { value: "standard", label: "Livraison à Standard (3-5 jours) - 2000.0 Ar", prix: 2000.0 },
        { value: "express", label: "Livraison Express (24h) - 5000.0 Ar", prix: 5000.0 },
        { value: "mangasin", label: "Point de vente - Gratuit", prix: 0.0 },
    ];

    // Options pour les méthodes de paiement
    const methodesPaiement = [
        { value: "", label: "Choisissez une méthode de paiement", disabled: true },
        { value: "mvola", label: "MVola Avance" },
        { value: "paypal", label: "PayPal" },
        { value: "especes", label: "Paiement en espèces à la livraison" },
    ];

    useEffect(() => {
        if (initialData) {
            setFormData((prev) => ({
                ...prev,
                ...initialData,
            }));
        }
    }, [initialData]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
            fraisLivraison: getPrixLivraison(),
        }));

        // Effacer l'erreur du champ modifié
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };
    

    const validateForm = () => {
        const newErrors = {};

        if (!formData.methodeLivraison) {
            newErrors.methodeLivraison = "Veuillez sélectionner une méthode de livraison";
        }

        if (!formData.methodePaiement) {
            newErrors.methodePaiement = "Veuillez sélectionner une méthode de paiement";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateForm()) {
            // Sauvegarder les données dans le localStorage
            localStorage.setItem("methodeLivraison", formData.methodeLivraison);
            localStorage.setItem("methodePaiement", formData.methodePaiement);
            console.log("formData : ",formData)
            onSubmitSuccess(formData);
        }
    };

    const getPrixLivraison = () => {
        const methode = methodesLivraison.find((m) => m.value === formData.methodeLivraison);
        return methode ? methode.prix : 0;
    };

    const getLabelLivraison = () => {
        const methode = methodesLivraison.find((m) => m.value === formData.methodeLivraison);
        return methode ? methode.label : "";
    };

    const getLabelPaiement = () => {
        const methode = methodesPaiement.find((m) => m.value === formData.methodePaiement);
        return methode ? methode.label : "";
    };

    return (
        <div className="bg-transparent p-4">
            <div className="">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Méthode de Livraison */}
                        <fieldset className="fieldset mb-6 w-full">
                            <legend
                                className={`fieldset-legend text-gray-900 dark:text-slate-300`}
                            >
                                Méthode de Livraison
                            </legend>
                            <select
                                 value={formData.methodeLivraison}
                                 onChange={handleChange("methodeLivraison")}
                                className={`select border border-slate-400 ${errors.methodeLivraison ? "select-error" : ""} text-black dark:text-white mt-2 w-full  bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
                            >
                                {methodesLivraison.map((methode) => (
                                <option
                                    key={methode.value}
                                    value={methode.value}
                                    disabled={methode.disabled}
                                >
                                    {methode.label}
                                </option>
                            ))}
                            </select>
                            {errors.methodeLivraison && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.methodeLivraison}</span>
                            </label>
                        )}
                        </fieldset>
                  

                    {/* Méthode de Paiement */}
                    <fieldset className="fieldset mb-6 w-full">
                            <legend
                                className={`fieldset-legend text-gray-900 dark:text-slate-300`}
                            >
                                Méthode de Paiement
                            </legend>
                            <select
                                 value={formData.methodePaiement}
                                 onChange={handleChange("methodePaiement")}
                                className={`select border border-slate-400 ${errors.methodePaiement ? "select-error" : ""} text-black dark:text-white mt-2 w-full  bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
                            >
                                {methodesPaiement.map((methode) => (
                                <option
                                    key={methode.value}
                                    value={methode.value}
                                    disabled={methode.disabled}
                                >
                                    {methode.label}
                                </option>
                            ))}
                            </select>
                            {errors.methodePaiement && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.methodePaiement}</span>
                            </label>
                        )}
                        </fieldset>

                    {formData.methodePaiement === "mvola" && ( // bg-slate-50 dark:bg-transparent"
                        <div className="flex flex-col  p-4 shadow-xl dark:shadow-slate-950 rounded-xl  text-blue-800 bg-blue-50  dark:text-blue-500 dark:bg-blue-800/5 " >
                            <div className="mb-2 space-x-1 flex items-center justify-center">
                                 <MdInfoOutline size={20}/>
                                <span className=" font-semibold ">Informations sur nos compte Mvola</span>
                            </div>

                            <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Téléphone du Gestionnaire:</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">038 23 612 23</span>
                            </div>
                            <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Nom du compte Mvola du Gestionnaire:</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RAKOTONJANAHARY Tina Eric</span>
                            </div>
                            <div className="flex justify-center items-center p-2">
                                <p className="italic text-center dark:text-blue-500/80 font-gothic">"Nous vous envoyerons un message de confirmation à votre compte Email ou  à votre numéro téléphone une fois la transaction est reçue et terminé avec succès."</p>
                            </div>
                        </div>
                    )}
                    {/* Informations supplémentaires selon la méthode de paiement */}
                    {formData.methodePaiement === "especes" && (
                        <div className="mt-4 rounded-lg flex justify-center p-3 space-x-1 text-blue-800 bg-blue-50  dark:text-blue-500 dark:bg-blue-800/5">
                                <MdInfoOutline size={20}/>
                                <span>Veuillez préparer le montant exact pour le livreur.</span>
                        </div>
                    )}

                    {/* Résumé des sélections */}
                    {(formData.methodeLivraison || formData.methodePaiement) && (
                        <div className=" bg-slate-50 px-6 py-4 dark:bg-slate-800 shadow-xl dark:shadow-slate-950 rounded-xl dark:bg-transparent">
                            <div className="py-2 flex items-center justify-center">
                                <span className="font-semibold text-gray-700  dark:text-gray-300">Résumé de vos sélections</span>
                            </div>
                            {formData.methodeLivraison && (
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Livraison :</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelLivraison()}</span>
                                </div>
                            )}

                            {formData.methodePaiement && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelPaiement()}</span>
                                </div>
                            )}

                            {/* Frais de livraison supplémentaires */}
                            {formData.methodeLivraison && getPrixLivraison() > 0 && (
                                <div className="mt-3 border-t border-gray-300 pt-2 dark:border-gray-600">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Frais de livraison supplémentaires :
                                        </span>
                                        <span className="text-sm font-bold text-primary">+{getPrixLivraison()}€</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Boutons de navigation */}
                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-outline btn-wide btn-accent disabled:text-gray-400 disabled:btn-ghost "
                            disabled={!formData.methodeLivraison || !formData.methodePaiement}
                        >
                            Continuer
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-2 h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormPaiement;

// import React, { useState, useEffect } from 'react';
// import {
//     Box,
//     Typography,
//     Button,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     Paper,
//     Alert
// } from '@mui/material';

// const FormPaiement = ({ initialData, onSubmitSuccess }) => {
//     const [formData, setFormData] = useState({
//         methodeLivraison: '',
//         methodePaiement: '',
//         ...initialData
//     });

//     const [errors, setErrors] = useState({});

//     // Options pour les méthodes de livraison
//     const methodesLivraison = [
//         { value: 'standard', label: 'Livraison Standard (3-5 jours)', prix: 0.00 },
//         { value: 'express', label: 'Livraison Express (24h)', prix: 9.99 },
//         { value: 'point-relais', label: 'Point Relais (2-3 jours)', prix: 0.00 },
//         { value: 'drive', label: 'Retrait en Drive', prix: 0.00 }
//     ];

//     // Options pour les méthodes de paiement
//     const methodesPaiement = [
//         { value: 'carte', label: 'Carte Bancaire' },
//         { value: 'paypal', label: 'PayPal' },
//         { value: 'virement', label: 'Virement Bancaire' },
//         { value: 'especes', label: 'Paiement en espèces à la livraison' }
//     ];

//     useEffect(() => {
//         if (initialData) {
//             setFormData(prev => ({
//                 ...prev,
//                 ...initialData
//             }));
//         }
//     }, [initialData]);

//     const handleChange = (field) => (event) => {
//         const value = event.target.value;
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));

//         // Effacer l'erreur du champ modifié
//         if (errors[field]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [field]: ''
//             }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.methodeLivraison) {
//             newErrors.methodeLivraison = 'Veuillez sélectionner une méthode de livraison';
//         }

//         if (!formData.methodePaiement) {
//             newErrors.methodePaiement = 'Veuillez sélectionner une méthode de paiement';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();

//         if (validateForm()) {
//             // Sauvegarder les données dans le localStorage
//             localStorage.setItem('methodeLivraison', formData.methodeLivraison);
//             localStorage.setItem('methodePaiement', formData.methodePaiement);

//             onSubmitSuccess(formData);
//         }
//     };

//     const getPrixLivraison = () => {
//         const methode = methodesLivraison.find(m => m.value === formData.methodeLivraison);
//         return methode ? methode.prix : 0;
//     };

//     return (
//         <Paper elevation={3} className="p-6 bg-white dark:bg-gray-800">
//             <Typography variant="h5" className="mb-4 font-bold text-gray-800 dark:text-white">
//                 Méthodes de Livraison et Paiement
//             </Typography>

//             <form onSubmit={handleSubmit}>
//                 {/* Méthode de Livraison */}
//                 <FormControl fullWidth className="mb-4" error={!!errors.methodeLivraison}>
//                     <InputLabel id="methode-livraison-label">
//                         Méthode de Livraison
//                     </InputLabel>
//                     <Select
//                         labelId="methode-livraison-label"
//                         value={formData.methodeLivraison}
//                         label="Méthode de Livraison"
//                         onChange={handleChange('methodeLivraison')}
//                     >
//                         {methodesLivraison.map((methode) => (
//                             <MenuItem key={methode.value} value={methode.value}>
//                                 {methode.label} {methode.prix > 0 ? `(+${methode.prix}€)` : '(Gratuit)'}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                     {errors.methodeLivraison && (
//                         <Alert severity="error" className="mt-2">
//                             {errors.methodeLivraison}
//                         </Alert>
//                     )}
//                 </FormControl>

//                 {/* Méthode de Paiement */}
//                 <FormControl fullWidth className="mb-6" error={!!errors.methodePaiement}>
//                     <InputLabel id="methode-paiement-label">
//                         Méthode de Paiement
//                     </InputLabel>
//                     <Select
//                         labelId="methode-paiement-label"
//                         value={formData.methodePaiement}
//                         label="Méthode de Paiement"
//                         onChange={handleChange('methodePaiement')}
//                     >
//                         {methodesPaiement.map((methode) => (
//                             <MenuItem key={methode.value} value={methode.value}>
//                                 {methode.label}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                     {errors.methodePaiement && (
//                         <Alert severity="error" className="mt-2">
//                             {errors.methodePaiement}
//                         </Alert>
//                     )}
//                 </FormControl>

//                 {/* Informations supplémentaires selon la méthode de paiement */}
//                 {formData.methodePaiement === 'especes' && (
//                     <Alert severity="info" className="mb-4">
//                         Veuillez préparer le montant exact pour le livreur.
//                     </Alert>
//                 )}

//                 {formData.methodePaiement === 'virement' && (
//                     <Alert severity="info" className="mb-4">
//                         Les coordonnées bancaires vous seront communiquées après validation de la commande.
//                     </Alert>
//                 )}

//                 {/* Résumé des frais supplémentaires */}
//                 {formData.methodeLivraison && getPrixLivraison() > 0 && (
//                     <Box className="mb-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/30">
//                         <Typography className="text-blue-700 dark:text-blue-300">
//                             Frais de livraison supplémentaires: +{getPrixLivraison()}€
//                         </Typography>
//                     </Box>
//                 )}

//                 {/* Boutons de navigation */}
//                 <Box className="flex justify-between mt-6">
//                     <Button
//                         type="button"
//                         variant="outlined"
//                         onClick={() => window.history.back()}
//                         className="border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
//                     >
//                         Retour
//                     </Button>

//                     <Button
//                         type="submit"
//                         variant="contained"
//                         className="bg-blue-600 text-white hover:bg-blue-700"
//                     >
//                         Continuer
//                     </Button>
//                 </Box>
//             </form>
//         </Paper>
//     );
// };

// export default FormPaiement;
