import React, { useState, useEffect } from "react";
import { MdInfoOutline } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import { InputValidate } from "@/components/InputValidate";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";

const FormPaiement = ({ initialData, onSubmitSuccess }) => {
    const [formData, setFormData] = useState({
        methodeLivraison: "",
        methodePaiement: "",
        dateLivraison: "", 
        ...initialData,
    });

    const [errors, setErrors] = useState({});

    // Options pour les méthodes de livraison
    const methodesLivraison = [
        { value: "", label: "Choisissez une méthode de livraison", disabled: true },
        { value: "standard", label: "Livraison Standard (3-5 jours) - 2000.0 Ar", prix: 2000.0 },
        { value: "express", label: "Livraison Express (24h) - 5000.0 Ar", prix: 5000.0 },
        { value: "magasin", label: "Point de vente - Gratuit", prix: 0.0 }, 
    ];

    const methodesPaiement = [
        { value: "", label: "Choisissez une méthode de paiement", disabled: true },
        { value: "stripe", label: "Carte bancaire (Stripe)", icon: "💳" },
        { value: "especes", label: "Paiement en espèces à la livraison" },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData((prev) => ({
                ...prev,
                ...initialData,
            }));
        }
    }, [initialData]);

    // Fonction pour calculer la date minimum (aujourd'hui + délai selon méthode)
    const getMinDeliveryDate = () => {
        const today = new Date();
        let minDate = new Date(today);
        
        if (formData.methodeLivraison === "standard") {
            minDate.setDate(today.getDate() + 3); // 3 jours minimum
        } else if (formData.methodeLivraison === "express") {
            minDate.setDate(today.getDate() + 1); // 1 jour minimum
        } else if (formData.methodeLivraison === "magasin") {
            minDate.setDate(today.getDate()); // Aujourd'hui pour point de vente
        }
        
        return minDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
    };

    const handleChange = (field, value = null) => {
        // Gestion pour les événements de input ou select
        const val = value !== null ? value : (field.target ? field.target.value : field);
        const fieldName = field.target ? field.target.name : field;
        
        setFormData((prev) => {
            const updated = {
                ...prev,
                [fieldName]: val,
            };
            
            // Si changement de méthode de livraison, mettre à jour les frais
            if (fieldName === "methodeLivraison") {
                updated.fraisLivraison = getPrixLivraison(val);
            }
            
            return updated;
        });

        if (errors[fieldName]) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: "",
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

        if (!formData.dateLivraison) {
            newErrors.dateLivraison = "Veuillez sélectionner une date de livraison";
        } else {
            // Validation de la date selon la méthode de livraison
            const deliveryDate = new Date(formData.dateLivraison);
            const today = new Date();
            const minDate = new Date(getMinDeliveryDate());
            
            if (deliveryDate < minDate) {
                if (formData.methodeLivraison === "standard") {
                    newErrors.dateLivraison = "La livraison standard nécessite au moins 3 jours";
                } else if (formData.methodeLivraison === "express") {
                    newErrors.dateLivraison = "La livraison express nécessite au moins 1 jour";
                } else {
                    newErrors.dateLivraison = "Date invalide";
                }
            }
            
            // Vérifier que la date n'est pas dans le passé
            today.setHours(0, 0, 0, 0);
            if (deliveryDate < today) {
                newErrors.dateLivraison = "La date de livraison ne peut pas être dans le passé";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validateForm()) {
            // Sauvegarder dans localStorage
            localStorage.setItem("methodeLivraison", formData.methodeLivraison);
            localStorage.setItem("methodePaiement", formData.methodePaiement);
            localStorage.setItem("dateLivraison", formData.dateLivraison);
            localStorage.setItem("fraisLivraison", formData.fraisLivraison || 0);
            
            console.log("formData : ", formData);
            onSubmitSuccess(formData);
        }
    };

    const getPrixLivraison = (methodeLivr = formData.methodeLivraison) => {
        const methode = methodesLivraison.find((m) => m.value === methodeLivr);
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

    // Formater la date pour l'affichage
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="bg-transparent p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Méthode de Livraison */}
                <fieldset className="fieldset mb-6 w-full">
                    <legend className="fieldset-legend text-gray-900 dark:text-slate-300">
                        Méthode de Livraison
                    </legend>
                    <select
                        name="methodeLivraison"
                        value={formData.methodeLivraison}
                        onChange={(e) => handleChange(e)}
                        className={`select border border-slate-400 ${errors.methodeLivraison ? "select-error" : ""} text-black dark:text-white mt-2 w-full bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
                    >
                        {methodesLivraison.map((methode) => (
                            <option key={methode.value} value={methode.value} disabled={methode.disabled}>
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
                    <legend className="fieldset-legend text-gray-900 dark:text-slate-300">
                        Méthode de Paiement
                    </legend>
                    <select
                        name="methodePaiement"
                        value={formData.methodePaiement}
                        onChange={(e) => handleChange(e)}
                        className={`select border border-slate-400 ${errors.methodePaiement ? "select-error" : ""} text-black dark:text-white mt-2 w-full bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
                    >
                        {methodesPaiement.map((methode) => (
                            <option key={methode.value} value={methode.value} disabled={methode.disabled}>
                                {methode.icon ? `${methode.icon} ${methode.label}` : methode.label}
                            </option>
                        ))}
                    </select>
                    {errors.methodePaiement && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.methodePaiement}</span>
                        </label>
                    )}
                </fieldset>

                {/* Date de Livraison */}
                <fieldset className="fieldset mb-6 w-full">
                    <div className="mt-2">
                        <InputValidate
                            IconComponent={CalendarDateRangeIcon}
                            type="date"
                            largeur="full"
                            placeholder="Sélectionnez la date de livraison..."
                            title="Date de Livraison"
                            name="dateLivraison"
                            value={formData.dateLivraison}
                            onChange={(val) => handleChange("dateLivraison", val)}
                            error={!!errors.dateLivraison}
                            helperText={errors.dateLivraison}
                            ClassIcone="text-accent"
                            margY="mb-2"
                        />
                        {formData.methodeLivraison && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {formData.methodeLivraison === "standard" && (
                                    <p>⚠️ Livraison sous 3-5 jours ouvrés. Choisissez une date dans au moins 3 jours.</p>
                                )}
                                {formData.methodeLivraison === "express" && (
                                    <p>⚡ Livraison en 24h. Choisissez une date dans au moins 1 jour.</p>
                                )}
                                {formData.methodeLivraison === "magasin" && (
                                    <p>🏪 Retrait en magasin disponible dès aujourd'hui.</p>
                                )}
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* INFO STRIPE */}
                {formData.methodePaiement === "stripe" && (
                    <div className="flex flex-col p-4 shadow-xl dark:shadow-slate-950 rounded-xl text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
                        <div className="mb-2 space-x-1 flex items-center justify-center">
                            <FaCreditCard size={20} />
                            <span className="font-semibold">Paiement sécurisé par Stripe</span>
                        </div>
                        <div className="flex justify-center items-center p-2">
                            <p className="italic text-center dark:text-blue-500/80 font-gothic">
                                "Vous serez redirigé vers une page sécurisée pour effectuer votre paiement par carte bancaire. Aucune information de paiement n'est stockée sur notre site."
                            </p>
                        </div>
                    </div>
                )}

                {/* INFO ESPÈCES */}
                {formData.methodePaiement === "especes" && (
                    <div className="mt-4 rounded-lg flex justify-center p-3 space-x-1 text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
                        <MdInfoOutline size={20} />
                        <span>Veuillez préparer le montant exact pour le livreur.</span>
                    </div>
                )}

                {/* Résumé des sélections */}
                {(formData.methodeLivraison || formData.methodePaiement || formData.dateLivraison) && (
                    <div className="bg-slate-50 px-6 py-4 dark:bg-slate-800 shadow-xl dark:shadow-slate-950 rounded-xl">
                        <div className="py-2 flex items-center justify-center">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Résumé de vos sélections</span>
                        </div>
                        
                        {formData.methodeLivraison && (
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Livraison :</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelLivraison()}</span>
                            </div>
                        )}
                        
                        {formData.methodePaiement && (
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelPaiement()}</span>
                            </div>
                        )}
                        
                        {formData.dateLivraison && (
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Date de livraison :</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatDateForDisplay(formData.dateLivraison)}
                                </span>
                            </div>
                        )}
                        
                        {formData.methodeLivraison && getPrixLivraison() > 0 && (
                            <div className="mt-3 border-t border-gray-300 pt-2 dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Frais de livraison supplémentaires :
                                    </span>
                                    <span className="text-sm font-bold text-primary">+{getPrixLivraison().toFixed(1)} Ar</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Boutons */}
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="btn btn-outline btn-wide btn-accent disabled:text-gray-400 disabled:btn-ghost"
                        disabled={!formData.methodeLivraison || !formData.methodePaiement || !formData.dateLivraison}
                    >
                        Continuer
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormPaiement;

// import React, { useState, useEffect } from "react";
// import { MdInfoOutline } from "react-icons/md";
// import { FaCreditCard } from "react-icons/fa";
// import { InputValidate } from "@/components/InputValidate";
// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";

// const FormPaiement = ({ initialData, onSubmitSuccess }) => {
//     const [formData, setFormData] = useState({
//         methodeLivraison: "",
//         methodePaiement: "",
//         dateLivraison: null,
//         ...initialData,
//     });

//     const [errors, setErrors] = useState({});

//     // Options pour les méthodes de livraison
//     const methodesLivraison = [
//         { value: "", label: "Choisissez une méthode de livraison", disabled: true },
//         { value: "standard", label: "Livraison à Standard (3-5 jours) - 2000.0 Ar", prix: 2000.0 },
//         { value: "express", label: "Livraison Express (24h) - 5000.0 Ar", prix: 5000.0 },
//         { value: "mangasin", label: "Point de vente - Gratuit", prix: 0.0 },
//     ];

//     const methodesPaiement = [
//         { value: "", label: "Choisissez une méthode de paiement", disabled: true },
//         { value: "stripe", label: "Carte bancaire (Stripe)", icon: "💳" },
//         { value: "especes", label: "Paiement en espèces à la livraison" },
//     ];
//             useEffect(() => {
//                 window.scrollTo(0,0);
//             },[])

//     useEffect(() => {
//         if (initialData) {
//             setFormData((prev) => ({
//                 ...prev,
//                 ...initialData,
//             }));
//         }
//     }, [initialData]);

//     const handleChange = (field) => (event) => {
//         const value = event.target.value;
//         setFormData((prev) => ({
//             ...prev,
//             [field]: value,
//             fraisLivraison: field === "methodeLivraison" ? getPrixLivraison(value) : prev.fraisLivraison,
//         }));

//         if (errors[field]) {
//             setErrors((prev) => ({
//                 ...prev,
//                 [field]: "",
//             }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.methodeLivraison) {
//             newErrors.methodeLivraison = "Veuillez sélectionner une méthode de livraison";
//         }

//         if (!formData.methodePaiement) {
//             newErrors.methodePaiement = "Veuillez sélectionner une méthode de paiement";
//         }

//         if (!formData.dateLivraison) {
//             newErrors.dateLivraison = "Veuillez rémplir la date de vos livraison";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();

//         if (validateForm()) {
//             localStorage.setItem("methodeLivraison", formData.methodeLivraison);
//             localStorage.setItem("methodePaiement", formData.methodePaiement);
//             localStorage.setItem("dateLivraison",formData.dateLivraison)
//             console.log("formData : ", formData);
//             onSubmitSuccess(formData);
//         }
//     };

//     const getPrixLivraison = (methodeLivr = formData.methodeLivraison) => {
//         const methode = methodesLivraison.find((m) => m.value === methodeLivr);
//         return methode ? methode.prix : 0;
//     };

//     const getLabelLivraison = () => {
//         const methode = methodesLivraison.find((m) => m.value === formData.methodeLivraison);
//         return methode ? methode.label : "";
//     };

//     const getLabelPaiement = () => {
//         const methode = methodesPaiement.find((m) => m.value === formData.methodePaiement);
//         return methode ? methode.label : "";
//     };

//     return (
//         <div className="bg-transparent p-4">
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Méthode de Livraison */}
//                 <fieldset className="fieldset mb-6 w-full">
//                     <legend className="fieldset-legend text-gray-900 dark:text-slate-300">
//                         Méthode de Livraison
//                     </legend>
//                     <select
//                         value={formData.methodeLivraison}
//                         onChange={handleChange("methodeLivraison")}
//                         className={`select border border-slate-400 ${errors.methodeLivraison ? "select-error" : ""} text-black dark:text-white mt-2 w-full bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
//                     >
//                         {methodesLivraison.map((methode) => (
//                             <option key={methode.value} value={methode.value} disabled={methode.disabled}>
//                                 {methode.label}
//                             </option>
//                         ))}
//                     </select>
//                     {errors.methodeLivraison && (
//                         <label className="label">
//                             <span className="label-text-alt text-error">{errors.methodeLivraison}</span>
//                         </label>
//                     )}
//                 </fieldset>

//                 {/* Méthode de Paiement */}
//                 <fieldset className="fieldset mb-6 w-full">
//                     <legend className="fieldset-legend text-gray-900 dark:text-slate-300">
//                         Méthode de Paiement
//                     </legend>
//                     <select
//                         value={formData.methodePaiement}
//                         onChange={handleChange("methodePaiement")}
//                         className={`select border border-slate-400 ${errors.methodePaiement ? "select-error" : ""} text-black dark:text-white mt-2 w-full bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
//                     >
//                         {methodesPaiement.map((methode) => (
//                             <option key={methode.value} value={methode.value} disabled={methode.disabled}>
//                                 {methode.icon ? `${methode.icon} ${methode.label}` : methode.label}
//                             </option>
//                         ))}
//                     </select>
//                     {errors.methodePaiement && (
//                         <label className="label">
//                             <span className="label-text-alt text-error">{errors.methodePaiement}</span>
//                         </label>
//                     )}
//                 </fieldset>

//                  <InputValidate
//                                                     IconComponent={CalendarDateRangeIcon}
//                                                     type="date"
//                                                     largeur="full"
//                                                     placeholder="Entrez la date de Livraison..."
//                                                     title="Date de Livraison"
//                                                     value={formData.dateLivraison}
//                                                     onChange={(val) => handleChange({ target: { name: "dateLivraison", value: val } })}
//                                                     error={!!errors.dateLivraison}
//                                                     helperText={errors.dateLivraison}
//                                                     ClassIcone="text-accent"
//                                                     margY="mt-4 mb-8"
//                                                 />

//                 {/* INFO STRIPE */}
//                 {formData.methodePaiement === "stripe" && (
//                     <div className="flex flex-col p-4 shadow-xl dark:shadow-slate-950 rounded-xl text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
//                         <div className="mb-2 space-x-1 flex items-center justify-center">
//                             <FaCreditCard size={20} />
//                             <span className="font-semibold">Paiement sécurisé par Stripe</span>
//                         </div>
//                         <div className="flex justify-center items-center p-2">
//                             <p className="italic text-center dark:text-blue-500/80 font-gothic">
//                                 "Vous serez redirigé vers une page sécurisée pour effectuer votre paiement par carte bancaire. Aucune information de paiement n'est stockée sur notre site."
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* INFO MVOLA */}
//                 {formData.methodePaiement === "mvola" && (
//                     <div className="flex flex-col p-4 shadow-xl dark:shadow-slate-950 rounded-xl text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
//                         <div className="mb-2 space-x-1 flex items-center justify-center">
//                             <MdInfoOutline size={20} />
//                             <span className="font-semibold">Informations sur notre compte Mvola</span>
//                         </div>
//                         <div className="mb-2 flex items-center justify-between">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Téléphone du Gestionnaire:</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">038 23 612 23</span>
//                         </div>
//                         <div className="mb-2 flex items-center justify-between">
//                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Nom du compte Mvola:</span>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RAKOTONJANAHARY Tina Eric</span>
//                         </div>
//                         <div className="flex justify-center items-center p-2">
//                             <p className="italic text-center dark:text-blue-500/80 font-gothic">
//                                 "Nous vous enverrons un message de confirmation une fois la transaction reçue."
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {/* INFO ESPÈCES */}
//                 {formData.methodePaiement === "especes" && (
//                     <div className="mt-4 rounded-lg flex justify-center p-3 space-x-1 text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
//                         <MdInfoOutline size={20} />
//                         <span>Veuillez préparer le montant exact pour le livreur.</span>
//                     </div>
//                 )}

//                 {/* Résumé des sélections */}
//                 {(formData.methodeLivraison || formData.methodePaiement) && (
//                     <div className="bg-slate-50 px-6 py-4 dark:bg-slate-800 shadow-xl dark:shadow-slate-950 rounded-xl">
//                         <div className="py-2 flex items-center justify-center">
//                             <span className="font-semibold text-gray-700 dark:text-gray-300">Résumé de vos sélections</span>
//                         </div>
//                         {formData.methodeLivraison && (
//                             <div className="mb-2 flex items-center justify-between">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Livraison :</span>
//                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelLivraison()}</span>
//                             </div>
//                         )}
//                         {formData.methodePaiement && (
//                             <div className="flex items-center justify-between">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
//                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelPaiement()}</span>
//                             </div>
//                         )}
//                         {formData.methodeLivraison && getPrixLivraison() > 0 && (
//                             <div className="mt-3 border-t border-gray-300 pt-2 dark:border-gray-600">
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                                         Frais de livraison supplémentaires :
//                                     </span>
//                                     <span className="text-sm font-bold text-primary">+{getPrixLivraison()} Ar</span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Boutons */}
//                 <div className="mt-8 flex justify-end">
//                     <button
//                         type="submit"
//                         className="btn btn-outline btn-wide btn-accent disabled:text-gray-400 disabled:btn-ghost"
//                         disabled={!formData.methodeLivraison || !formData.methodePaiement}
//                     >
//                         Continuer
//                         <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default FormPaiement;

