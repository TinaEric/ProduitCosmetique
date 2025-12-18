import { UserMinusIcon } from '@heroicons/react/24/solid';
import { string } from 'prop-types';
import React, { useEffect } from "react";
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
  MdAttachMoney,
  MdBadge
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
          useEffect(() => {
              window.scrollTo(0,284);
          },[])

  const ExtractionDate = (dateTimeString) => {
    const mois = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
            const daty = new Date(dateTimeString);
            const jour = String(daty.getDate()).padStart(2, '0');
            const moisIndex = daty.getMonth();
            const annee = daty.getFullYear();
            return `${jour} ${mois[moisIndex]} ${annee}`;
  }

// bg-base-100
  return (
    <div className=" bg-transparent w-full">
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
          <div className="bg-slate-50 p-3 dark:bg-slate-800 shadow-sm dark:shadow-slate-950 rounded-xl w-full  hover:shadow-xl transition-shadow">
            <div className="card-body p-5">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                    <MdPerson className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                    Informations Personnelles
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <MdBadge className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nom et Prenom
                      </span>
                    </div>
                    <div className="flex">
                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                        {`${formData.etape1.civiliteClient} ${formData.etape1.nomClient} ${ formData.etape1.prenomClient}`}
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                        <div className=" flex ">
                          <MdPhone className="mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Téléphone
                          </span>
                        </div>
                        <div className="flex">
                          <p className="font-semibold text-gray-600 dark:text-gray-200">
                            {formData.etape1.telephoneClient}
                          </p>
                        </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date de naissance
                      </span>
                    </div>
                    <div className="flex">
                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                        {ExtractionDate(formData.etape1.dateNaissance,"date",true)}
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                  <div className=" flex">
                    <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </span>
                  </div>
                  <div className="flex">
                    <p className="font-semibold text-gray-600 dark:text-gray-200">
                      {formData.etape1.email || "Non spécifié"}
                    </p>
                  </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Section Adresse de Livraison */}
          <div className="bg-slate-50 px-3 py-2 dark:bg-slate-800 shadow-md dark:shadow-slate-950 rounded-xl w-full  hover:shadow-xl transition-shadow">
            <div className="card-body p-3">
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                  <MdLocationOn className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                  Adresse de Livraison
                </h4>
              </div>
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <MdBadge className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Ville
                      </span>
                    </div>
                    <div className="flex">
                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                      {formData.etape2.adresseLivraison.ville} - {formData.etape2.adresseLivraison.codePostal}
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                        <div className=" flex ">
                          <MdPhone className="mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Quartier
                          </span>
                        </div>
                        <div className="flex">
                          <p className="font-semibold text-gray-600 dark:text-gray-200">
                          {formData.etape2.adresseLivraison.lot} - {formData.etape2.adresseLivraison.quartier}
                          </p>
                        </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                       Labelle 
                      </span>
                    </div>
                    <div className="flex">
                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                      {formData.etape2.adresseLivraison.labelle}
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex flex-col space-y-2 w-full">
                    <div className=" flex">
                      <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </span>
                    </div>
                    <div className="flex justify-center  items-center">
                      <p className="italic font-gothic text-left text-gray-600 dark:text-gray-200">
                      {formData.etape2.adresseLivraison.complement}
                      </p>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Section Adresse de facturation */}
          <div className="bg-slate-50 px-3 py-2 dark:bg-slate-800 shadow-md dark:shadow-slate-950 rounded-xl w-full  hover:shadow-xl transition-shadow">
            <div className="card-body p-3">
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                  <MdBusiness className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                  Adresse de Facturation
                </h4>
              </div>
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <MdBadge className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Ville
                      </span>
                    </div>
                    <div className="flex">
                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                      {formData.etape2.adresseFacturation.ville} - {formData.etape2.adresseFacturation.codePostal}
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                        <div className=" flex ">
                          <MdPhone className="mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Quartier
                          </span>
                        </div>
                        <div className="flex">
                          <p className="font-semibold text-gray-600 dark:text-gray-200">
                          {formData.etape2.adresseFacturation.lot} - {formData.etape2.adresseFacturation.quartier}
                          </p>
                        </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                       Labelle 
                      </span>
                    </div>
                    <div className="flex">
                      <p className="font-semibold text-gray-600 dark:text-gray-200">
                      {formData.etape2.adresseFacturation.labelle}
                      </p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex flex-col space-y-2 w-full">
                    <div className=" flex">
                      <MdEmail className="mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </span>
                    </div>
                    <div className="flex justify-center  items-center">
                      <p className="italic font-gothic text-left text-gray-600 dark:text-gray-200">
                      {formData.etape2.adresseFacturation.complement}
                      </p>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Section Livraison & Paiement */}
          <div className={`bg-slate-50 px-3 py-2 dark:bg-slate-800 shadow-sm dark:shadow-slate-950 rounded-xl w-full hover:shadow-xl transition-shadow `}>
            <div className="card-body p-3">
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                  <MdLocalShipping className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h4 className="card-title text-lg font-semibold text-gray-800 dark:text-white">
                  Options de Livraison & Paiement
                </h4>
              </div>
              
              <div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MdLocalShipping className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Livraison
                    </span>
                  </div>
                  <p className="font-bold text-gray-600 dark:text-white text-lg">
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
                  <p className="font-bold text-gray-600 dark:text-white text-lg">
                    {formData.etape3.methodePaiement ? 
                      capitalizeFirstLetter(formData.etape3.methodePaiement) 
                      : "Non spécifiée"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Total : gradient-to-r from-base-100 to-base-50 / border border-base-300 dark:border-gray-700*/}
        <div className=" bg-slate-50 px-6 py-4 dark:bg-slate-800 shadow-sm dark:shadow-slate-950 rounded-xl w-full hover:shadow-xl transition-shadow  mt-8">
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