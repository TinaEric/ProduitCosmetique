import React, { useState, useEffect } from 'react';
import { Typography, Alert } from "@mui/material";

const FormPaiement = ({ initialData, onSubmitSuccess }) => {
    const [formData, setFormData] = useState({
        methodeLivraison: '',
        methodePaiement: '',
        ...initialData
    });

    const [errors, setErrors] = useState({});

    // Options pour les méthodes de livraison
    const methodesLivraison = [
        { value: '', label: 'Choisissez une méthode de livraison', disabled: true },
        { value: 'standard', label: 'Livraison Standard (3-5 jours) - Gratuit', prix: 0.00 },
        { value: 'express', label: 'Livraison Express (24h) - 9.99€', prix: 9.99 },
        { value: 'point-relais', label: 'Point Relais (2-3 jours) - Gratuit', prix: 0.00 },
        { value: 'drive', label: 'Retrait en Drive - Gratuit', prix: 0.00 }
    ];

    // Options pour les méthodes de paiement
    const methodesPaiement = [
        { value: '', label: 'Choisissez une méthode de paiement', disabled: true },
        { value: 'carte', label: 'Carte Bancaire' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'virement', label: 'Virement Bancaire' },
        { value: 'especes', label: 'Paiement en espèces à la livraison' }
    ];

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Effacer l'erreur du champ modifié
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.methodeLivraison) {
            newErrors.methodeLivraison = 'Veuillez sélectionner une méthode de livraison';
        }

        if (!formData.methodePaiement) {
            newErrors.methodePaiement = 'Veuillez sélectionner une méthode de paiement';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (validateForm()) {
            // Sauvegarder les données dans le localStorage
            localStorage.setItem('methodeLivraison', formData.methodeLivraison);
            localStorage.setItem('methodePaiement', formData.methodePaiement);
            
            onSubmitSuccess(formData);
        }
    };

    const getPrixLivraison = () => {
        const methode = methodesLivraison.find(m => m.value === formData.methodeLivraison);
        return methode ? methode.prix : 0;
    };

    const getLabelLivraison = () => {
        const methode = methodesLivraison.find(m => m.value === formData.methodeLivraison);
        return methode ? methode.label : '';
    };

    const getLabelPaiement = () => {
        const methode = methodesPaiement.find(m => m.value === formData.methodePaiement);
        return methode ? methode.label : '';
    };

    return (
        <div className="p-4 bg-transparent dark:bg-gray-800">
            <div className="">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Méthode de Livraison */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-semibold text-gray-700 dark:text-gray-300">
                                Méthode de Livraison
                            </span>
                        </label>
                        
                        <select 
                            className={`select bg-transparent select-bordered w-full ${errors.methodeLivraison ? 'select-error' : ''}`}
                            value={formData.methodeLivraison}
                            onChange={handleChange('methodeLivraison')}
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
                    </div>

                    {/* Méthode de Paiement */}
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-semibold text-gray-700 dark:text-gray-300">
                                Méthode de Paiement
                            </span>
                        </label>
                        
                        <select 
                            className={`select bg-transparent select-bordered w-full ${errors.methodePaiement ? 'select-error' : ''}`}
                            value={formData.methodePaiement}
                            onChange={handleChange('methodePaiement')}
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
                    </div>

                    {/* Informations supplémentaires selon la méthode de paiement */}
                    {formData.methodePaiement === 'especes' && (
                        <div className="alert alert-info shadow-lg">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>Veuillez préparer le montant exact pour le livreur.</span>
                            </div>
                        </div>
                    )}

                    {formData.methodePaiement === 'virement' && (
                        <div className="alert alert-info shadow-lg">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Les coordonnées bancaires vous seront communiquées après validation de la commande.</span>
                            </div>
                        </div>
                    )}

                    {/* Résumé des sélections */}
                    {(formData.methodeLivraison || formData.methodePaiement) && (
                        <div className="bg-transparent rounded-lg p-4 dark:bg-gray-700">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Résumé de vos sélections :</h4>
                            
                            {formData.methodeLivraison && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Livraison :</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {getLabelLivraison()}
                                    </span>
                                </div>
                            )}
                            
                            {formData.methodePaiement && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {getLabelPaiement()}
                                    </span>
                                </div>
                            )}

                            {/* Frais de livraison supplémentaires */}
                            {formData.methodeLivraison && getPrixLivraison() > 0 && (
                                <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Frais de livraison supplémentaires :
                                        </span>
                                        <span className="text-sm font-bold text-primary">
                                            +{getPrixLivraison()}€
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Boutons de navigation */}
                    <div className="flex justify-end mt-8">
                       
                        
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!formData.methodeLivraison || !formData.methodePaiement}
                        >
                            Continuer
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
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