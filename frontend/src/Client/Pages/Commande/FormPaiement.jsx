import React, { useState, useEffect } from "react";
import { MdInfoOutline } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";

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

    // ✅ AJOUT DE STRIPE dans les options de paiement
    const methodesPaiement = [
        { value: "", label: "Choisissez une méthode de paiement", disabled: true },
        { value: "stripe", label: "Carte bancaire (Stripe)", icon: "💳" },
        { value: "mvola", label: "MVola Avance" },
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
            fraisLivraison: field === "methodeLivraison" ? getPrixLivraison(value) : prev.fraisLivraison,
        }));

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
            localStorage.setItem("methodeLivraison", formData.methodeLivraison);
            localStorage.setItem("methodePaiement", formData.methodePaiement);
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

    return (
        <div className="bg-transparent p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Méthode de Livraison */}
                <fieldset className="fieldset mb-6 w-full">
                    <legend className="fieldset-legend text-gray-900 dark:text-slate-300">
                        Méthode de Livraison
                    </legend>
                    <select
                        value={formData.methodeLivraison}
                        onChange={handleChange("methodeLivraison")}
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
                        value={formData.methodePaiement}
                        onChange={handleChange("methodePaiement")}
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

                {/* ✅ INFO STRIPE */}
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

                {/* INFO MVOLA */}
                {formData.methodePaiement === "mvola" && (
                    <div className="flex flex-col p-4 shadow-xl dark:shadow-slate-950 rounded-xl text-blue-800 bg-blue-50 dark:text-blue-500 dark:bg-blue-800/5">
                        <div className="mb-2 space-x-1 flex items-center justify-center">
                            <MdInfoOutline size={20} />
                            <span className="font-semibold">Informations sur notre compte Mvola</span>
                        </div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Téléphone du Gestionnaire:</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">038 23 612 23</span>
                        </div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Nom du compte Mvola:</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RAKOTONJANAHARY Tina Eric</span>
                        </div>
                        <div className="flex justify-center items-center p-2">
                            <p className="italic text-center dark:text-blue-500/80 font-gothic">
                                "Nous vous enverrons un message de confirmation une fois la transaction reçue."
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
                {(formData.methodeLivraison || formData.methodePaiement) && (
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
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelPaiement()}</span>
                            </div>
                        )}
                        {formData.methodeLivraison && getPrixLivraison() > 0 && (
                            <div className="mt-3 border-t border-gray-300 pt-2 dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Frais de livraison supplémentaires :
                                    </span>
                                    <span className="text-sm font-bold text-primary">+{getPrixLivraison()} Ar</span>
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
                        disabled={!formData.methodeLivraison || !formData.methodePaiement}
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
// import { Typography, Alert } from "@mui/material";
// import { FaCircleInfo, FaInfo } from "react-icons/fa6";
// import { MdInfoOutline } from "react-icons/md";

// const FormPaiement = ({ initialData, onSubmitSuccess }) => {
//     const [formData, setFormData] = useState({
//         methodeLivraison: "",
//         methodePaiement: "",
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

//     // Options pour les méthodes de paiement
//     const methodesPaiement = [
//         { value: "", label: "Choisissez une méthode de paiement", disabled: true },
//         { value: "mvola", label: "MVola Avance" },
//         { value: "especes", label: "Paiement en espèces à la livraison" },
//     ];

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
//             fraisLivraison: getPrixLivraison(),
//         }));

//         // Effacer l'erreur du champ modifié
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

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();

//         if (validateForm()) {
//             // Sauvegarder les données dans le localStorage
//             localStorage.setItem("methodeLivraison", formData.methodeLivraison);
//             localStorage.setItem("methodePaiement", formData.methodePaiement);
//             console.log("formData : ",formData)
//             onSubmitSuccess(formData);
//         }
//     };

//     const getPrixLivraison = () => {
//         const methode = methodesLivraison.find((m) => m.value === formData.methodeLivraison);
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
//             <div className="">
//                 <form
//                     onSubmit={handleSubmit}
//                     className="space-y-6"
//                 >
//                     {/* Méthode de Livraison */}
//                         <fieldset className="fieldset mb-6 w-full">
//                             <legend
//                                 className={`fieldset-legend text-gray-900 dark:text-slate-300`}
//                             >
//                                 Méthode de Livraison
//                             </legend>
//                             <select
//                                  value={formData.methodeLivraison}
//                                  onChange={handleChange("methodeLivraison")}
//                                 className={`select border border-slate-400 ${errors.methodeLivraison ? "select-error" : ""} text-black dark:text-white mt-2 w-full  bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
//                             >
//                                 {methodesLivraison.map((methode) => (
//                                 <option
//                                     key={methode.value}
//                                     value={methode.value}
//                                     disabled={methode.disabled}
//                                 >
//                                     {methode.label}
//                                 </option>
//                             ))}
//                             </select>
//                             {errors.methodeLivraison && (
//                             <label className="label">
//                                 <span className="label-text-alt text-error">{errors.methodeLivraison}</span>
//                             </label>
//                         )}
//                         </fieldset>
                  

//                     {/* Méthode de Paiement */}
//                     <fieldset className="fieldset mb-6 w-full">
//                             <legend
//                                 className={`fieldset-legend text-gray-900 dark:text-slate-300`}
//                             >
//                                 Méthode de Paiement
//                             </legend>
//                             <select
//                                  value={formData.methodePaiement}
//                                  onChange={handleChange("methodePaiement")}
//                                 className={`select border border-slate-400 ${errors.methodePaiement ? "select-error" : ""} text-black dark:text-white mt-2 w-full  bg-transparent dark:border-slate-500 dark:bg-[#0F172A]`}
//                             >
//                                 {methodesPaiement.map((methode) => (
//                                 <option
//                                     key={methode.value}
//                                     value={methode.value}
//                                     disabled={methode.disabled}
//                                 >
//                                     {methode.label}
//                                 </option>
//                             ))}
//                             </select>
//                             {errors.methodePaiement && (
//                             <label className="label">
//                                 <span className="label-text-alt text-error">{errors.methodePaiement}</span>
//                             </label>
//                         )}
//                         </fieldset>

//                     {formData.methodePaiement === "mvola" && ( // bg-slate-50 dark:bg-transparent"
//                         <div className="flex flex-col  p-4 shadow-xl dark:shadow-slate-950 rounded-xl  text-blue-800 bg-blue-50  dark:text-blue-500 dark:bg-blue-800/5 " >
//                             <div className="mb-2 space-x-1 flex items-center justify-center">
//                                  <MdInfoOutline size={20}/>
//                                 <span className=" font-semibold ">Informations sur nos compte Mvola</span>
//                             </div>

//                             <div className="mb-2 flex items-center justify-between">
//                                     <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Téléphone du Gestionnaire:</span>
//                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">038 23 612 23</span>
//                             </div>
//                             <div className="mb-2 flex items-center justify-between">
//                                     <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Nom du compte Mvola du Gestionnaire:</span>
//                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RAKOTONJANAHARY Tina Eric</span>
//                             </div>
//                             <div className="flex justify-center items-center p-2">
//                                 <p className="italic text-center dark:text-blue-500/80 font-gothic">"Nous vous envoyerons un message de confirmation à votre compte Email ou  à votre numéro téléphone une fois la transaction est reçue et terminé avec succès."</p>
//                             </div>
//                         </div>
//                     )}
//                     {/* Informations supplémentaires selon la méthode de paiement */}
//                     {formData.methodePaiement === "especes" && (
//                         <div className="mt-4 rounded-lg flex justify-center p-3 space-x-1 text-blue-800 bg-blue-50  dark:text-blue-500 dark:bg-blue-800/5">
//                                 <MdInfoOutline size={20}/>
//                                 <span>Veuillez préparer le montant exact pour le livreur.</span>
//                         </div>
//                     )}

//                     {/* Résumé des sélections */}
//                     {(formData.methodeLivraison || formData.methodePaiement) && (
//                         <div className=" bg-slate-50 px-6 py-4 dark:bg-slate-800 shadow-xl dark:shadow-slate-950 rounded-xl dark:bg-transparent">
//                             <div className="py-2 flex items-center justify-center">
//                                 <span className="font-semibold text-gray-700  dark:text-gray-300">Résumé de vos sélections</span>
//                             </div>
//                             {formData.methodeLivraison && (
//                                 <div className="mb-2 flex items-center justify-between">
//                                     <span className="text-sm text-gray-600 dark:text-gray-400">Livraison :</span>
//                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelLivraison()}</span>
//                                 </div>
//                             )}

//                             {formData.methodePaiement && (
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-sm text-gray-600 dark:text-gray-400">Paiement :</span>
//                                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLabelPaiement()}</span>
//                                 </div>
//                             )}

//                             {/* Frais de livraison supplémentaires */}
//                             {formData.methodeLivraison && getPrixLivraison() > 0 && (
//                                 <div className="mt-3 border-t border-gray-300 pt-2 dark:border-gray-600">
//                                     <div className="flex items-center justify-between">
//                                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                                             Frais de livraison supplémentaires :
//                                         </span>
//                                         <span className="text-sm font-bold text-primary">+{getPrixLivraison()}€</span>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Boutons de navigation */}
//                     <div className="mt-8 flex justify-end">
//                         <button
//                             type="submit"
//                             className="btn btn-outline btn-wide btn-accent disabled:text-gray-400 disabled:btn-ghost "
//                             disabled={!formData.methodeLivraison || !formData.methodePaiement}
//                         >
//                             Continuer
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="ml-2 h-5 w-5"
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                             >
//                                 <path
//                                     fillRule="evenodd"
//                                     d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
//                                     clipRule="evenodd"
//                                 />
//                             </svg>
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default FormPaiement;
