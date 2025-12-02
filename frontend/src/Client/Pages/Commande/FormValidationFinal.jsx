import React from 'react';
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdLocalShipping,
  MdPayment,
  MdCheckCircle,
  MdBusiness,
  MdInfo,
  MdAttachMoney
} from "react-icons/md";

const FormValidationFinal = ({
  formData,
  commandeExistante,
  calculerTotal,
  prixlivr,
  NetPayer,
  loading
}) => {
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl border border-base-300 dark:border-gray-700">
      <div className="card-body p-6 md:p-8">
        {/* En-tête avec icône et titre */}
        <div className="text-center mb-8">
          <div className="avatar placeholder mb-4">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
              <MdCheckCircle className="text-3xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Vérifiez vos informations
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Veuillez vérifier l'exactitude de vos informations avant de finaliser la commande
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section Informations Personnelles */}
          <div className="card bg-base-100 border border-base-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                  <MdPerson className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                  Informations Personnelles
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-36">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nom & Prénom
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {`${formData.etape1.nom || formData.etape1.nomClient || "Non spécifié"} ${formData.etape1.prenom || formData.etape1.prenomClient || ""}`}
                    </p>
                  </div>
                </div>
                
                <div className="divider my-2"></div>
                
                <div className="flex items-start">
                  <div className="w-36 flex items-center">
                    <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {formData.etape1.email || "Non spécifié"}
                    </p>
                  </div>
                </div>
                
                {formData.etape1.telephoneClient && (
                  <>
                    <div className="divider my-2"></div>
                    <div className="flex items-start">
                      <div className="w-36 flex items-center">
                        <MdPhone className="mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Téléphone
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {formData.etape1.telephoneClient}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section Adresse de Livraison */}
          <div className="card bg-base-100 border border-base-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                  <MdLocationOn className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                  Adresse de Livraison
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {formData.etape2.adresseLivraison?.labelle || "Non spécifiée"}
                  </p>
                  {(formData.etape2.adresseLivraison?.ville || formData.etape2.adresseLivraison?.codePostal) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {`${formData.etape2.adresseLivraison?.ville || ""} ${formData.etape2.adresseLivraison?.codePostal || ""}`.trim()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section Adresse de Facturation (si différente) */}
          {formData.etape2.AdresseDifferent && (
            <div className="card bg-base-100 border border-base-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-5">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-3">
                    <MdBusiness className="text-amber-600 dark:text-amber-400 text-xl" />
                  </div>
                  <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                    Adresse de Facturation
                  </h4>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {formData.etape2.adresseFacturation?.labelle || "Non spécifiée"}
                    </p>
                    {(formData.etape2.adresseFacturation?.ville || formData.etape2.adresseFacturation?.codePostal) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {`${formData.etape2.adresseFacturation?.ville || ""} ${formData.etape2.adresseFacturation?.codePostal || ""}`.trim()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Livraison & Paiement */}
          <div className={`card bg-base-100 border border-base-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${formData.etape2.AdresseDifferent ? 'md:col-span-2' : ''}`}>
            <div className="card-body p-5">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                  <MdLocalShipping className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                  Options de Livraison & Paiement
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MdLocalShipping className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Livraison
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white text-lg">
                    {formData.etape3.methodeLivraison ? 
                      capitalizeFirstLetter(formData.etape3.methodeLivraison) 
                      : "Non spécifiée"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Frais : {prixlivr(formData.etape3.methodeLivraison).toFixed(2)} Ar
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MdPayment className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Paiement
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white text-lg">
                    {formData.etape3.methodePaiement ? 
                      capitalizeFirstLetter(formData.etape3.methodePaiement) 
                      : "Non spécifiée"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Total */}
        <div className="card bg-gradient-to-r from-base-100 to-base-50 dark:from-gray-900 dark:to-gray-800 border border-base-300 dark:border-gray-700 mt-8">
          <div className="card-body p-6">
            <h4 className="card-title text-lg font-bold text-gray-800 dark:text-white mb-4">
              Récapitulatif du Montant
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  Sous-total
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {calculerTotal().toFixed(2)} Ar
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">
                  Frais de livraison
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  + {prixlivr(formData.etape3.methodeLivraison).toFixed(2)} Ar
                </span>
              </div>
              
              <div className="divider my-2"></div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MdAttachMoney className="text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    Total à payer
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {NetPayer().toFixed(2)} Ar
                </span>
              </div>
            </div>
          </div>
        </div>

        {commandeExistante && (
          <div role="alert" className="alert alert-info mt-6">
            <MdInfo className="text-xl" />
            <span>Vous avez déjà une commande en cours de traitement.</span>
          </div>
        )}

        {/* Indicateur de chargement */}
        {loading && (
          <div className="mt-6 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="loading loading-spinner loading-md text-blue-600 dark:text-blue-400 mr-3"></div>
            <span className="text-blue-600 dark:text-blue-400">
              Vérification en cours...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormValidationFinal;