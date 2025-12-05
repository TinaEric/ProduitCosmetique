import React, { useState, useEffect } from "react";
import { commandeService } from "@/services/CommandeService";
import { data } from "react-router-dom";
import { Construction, PencilLine, Trash, NotepadText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MdInfoOutline } from "react-icons/md";
const Commande = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCommande, setSelectedCommande] = useState(null);
    const [filterStatus, setFilterStatus] = useState("tous");
    const navigate = useNavigate();

    useEffect(() => {
        loadCommandes();
    }, []);

    const loadCommandes = async () => {
        try {
            setLoading(true);
            const result = await commandeService.getAllCommandes();
            console.log("resultat commande : ", result);
            if (result.data) {
                setCommandes(result.data);
            } else {
                setError("Erreur lors du chargement des commandes");
                console.log("Erreur commande : ", result.error);
            }
        } catch (err) {
            setError(err.message);
            console.log("Erreur cmd : ", err);
        } finally {
            setLoading(false);
        }
    };

    const afficheDetailCommande = (commande) => {
        navigate("/admin/ficheCommande",{state: commande});
    }

    const handleStatusChange = async (refCommande, newStatus) => {
        try {
            const result = await commandeService.updateStatut(refCommande, newStatus);
            if (result.success) {
                setCommandes((prevCommandes) =>
                    prevCommandes.map((commande) => (commande.refCommande === refCommande ? { ...commande, statutCommande: newStatus } : commande)),
                );

                // Mettre à jour aussi la commande sélectionnée si c'est la même
                if (selectedCommande && selectedCommande.refCommande === refCommande) {
                    setSelectedCommande((prev) => ({ ...prev, statutCommande: newStatus }));
                }
            }
        } catch (err) {
            alert(err.message);
        }
    };
    const statutTransforme = (status) => {
      switch (status) {
            case "inititalise":
              return "INITIALISE";
          case "livrée":
              return "LIVREE";
          case "payée":
              return "PAYÉE"; 
          case "en cours":
              return"EN_COURS";
          case "annulée":
              return "ANNULER";
          case "en attente":
              return "EN_ATTENTE_PAIEMENT";
          default:
              return "tous";
      }
  };

  const ExtractionDate = (dateTimeString, extract) => {
    const [date, fullTime] = dateTimeString.split('T');
    const time = fullTime.split('+')[0];
    if (extract === 'date') {
        return new Date(date).toLocaleDateString('fr-FR');
    } else if (extract === 'time') {
        return time;
    }
  }

  const Transformestatut = (status) => {
    switch (status) {
        case "INITIALISE":
            return "Inititalise";
        case "LIVREE":
            return "Livrée";
        case "PAYÉE":
            return "Payée"; 
        case "EN_COURS":
            return"En cours";
        case "ANNULER":
            return "Annulée";
        case "EN_ATTENTE_PAIEMENT":
            return "En attente paiement";
        default:
            return "Tous";
    }
};
    const getStatusBadgeClass = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";

        switch (status) {
            case "INITIALISE":
                return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
            case "LIVREE":
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            case "PAYÉE":
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-blue-600`;
            case "EN_COURS":
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
            case "ANNULER":
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            case "EN_ATTENTE_PAIEMENT":
                return `${baseClasses} bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-blue-200`;
        }
    };

    const filteredCommandes = filterStatus === "tous" ? commandes : commandes.filter((commande) => commande.statutCommande === filterStatus);

    return (
        <div className="">
            
            {error && (
                <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-400">
                    <MdInfoOutline size={20} />
                    <span>Une erreur de connexion s'est produit. Vérifier si le serveur est désactivé'</span>
                </div>
            )}
            {/* Filtres */}
            <div className="mb-3 rounded-lg transition-colors bg-white dark:bg-slate-900 p-4 shadow">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par statut :</span>
                    {["tous", "en attente","inititalise", "en cours", "payée", "livrée", "annulée"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(statutTransforme(status))}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                filterStatus === statutTransforme(status) ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-y-4 rounded-lg border border-slate-300 bg-white p-2 transition-colors dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-y-2 rounded-lg p-1">
                    <div className="relative h-[450px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className=" w-full text-slate-900 dark:text-slate-50">
                            <thead className="table-header">
                                <tr className="table-row text-gray-500 dark:text-gray-400">
                                    <th className="table-head">ID Commande</th>
                                    <th className="table-head">Nom Client</th>
                                    <th className="table-head">Date commande</th>
                                    <th className="table-head">Statut Commande</th>
                                    <th className="table-head">Livraison</th>
                                    <th className="table-head">Frais de Livraison</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="">
                              { filteredCommandes ? (
                                  filteredCommandes.map((commande) => (
                                        <tr
                                            key={commande.refCommande}
                                            className="table-row"
                                        >
                                            <td className="table-cell ">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{commande.refCommande}</div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {commande.client.nomClient} {commande.client.prenomClient}
                                                </div>
                                                <div className="text-sm text-gray-500">{commande.client.email}</div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">{ExtractionDate(commande.dateCommande,"date")}</div>
                                                <div className="text-sm text-gray-500">{ExtractionDate(commande.dateCommande,"time")}</div>
                                            </td>
                                            <td className="table-cell">
                                                <span className={getStatusBadgeClass(commande.statutCommande)}>{Transformestatut(commande.statutCommande)}</span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm font-medium text-gray-900 dark:text-slate-50">
                                                    {commande.methodeLivraison || "En cours..."}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm font-medium text-gray-900 dark:text-slate-50">
                                                  {commande.fraisLivraison || "En cours..."}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                    <button
                                                        onClick={() => afficheDetailCommande(commande)}
                                                        className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
                                                    >
                                                        Détails
                                                    </button>
                                            </td>
                                        </tr>
                                  ))
                                ) : (
                                    <tr key="vide">
                                          <td colSpan="7">
                                              <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
                                                  {loading ? (
                                                      <div className="flex flex-row  h-64 items-center  gap-2 justify-center">
                                                          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                                                          <span>Chargement des commandes...</span>
                                                      </div>
                                                  ) : (
                                                    <>

                                                    <div>
                                                        <Construction
                                                            strokeWidth={1}
                                                            className="h-40 w-40"
                                                        />
                                                        </div>
                                                        <p className="text-sm py-8 text-center">
                                                        {filteredCommandes === null ? (
                                                            <span className="text-gray-500">Aucun commande trouvé pour le moment.</span>
                                                        ) : (
                                                          searchTerm ? (
                                                              <p>
                                                                  {console.log("Aucun resulat")}
                                                                  Aucun commande correspond à{" "}
                                                                  <span className="font-bold">{searchTerm}</span>{" "}
                                                              </p>
                                                          ) : (
                                                              `Aucun commande trouvé pour le moment.`
                                                          )
                                                        )}
                                                            
                                                        </p>
                                                    </>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div> 
            </div>
    );
};

export default Commande;
