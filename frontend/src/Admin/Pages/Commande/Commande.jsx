import React, { useState, useEffect } from 'react';
import { commandeService } from '@/services/CommandeService';
import { data } from 'react-router-dom';

const Commande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [filterStatus, setFilterStatus] = useState('tous');

  useEffect(() => {
    loadCommandes();
  }, []);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const result = await commandeService.getAllCommandes();
       console.log("resultat commande : ", result)
      if (result.data) {
        setCommandes(result.data);
      } else {
       setError('Erreur lors du chargement des commandes');
        console.log("Erreur commande : ", result.error)
      }
    } catch (err) {
      setError(err.message);
       console.log("Erreur cmd : ", err)
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (refCommande, newStatus) => {
    try {
      const result = await commandeService.updateStatut(refCommande, newStatus);
      if (result.success) {
        setCommandes(prevCommandes =>
          prevCommandes.map(commande =>
            commande.refCommande === refCommande
              ? { ...commande, statutCommande: newStatus }
              : commande
          )
        );
        
        // Mettre à jour aussi la commande sélectionnée si c'est la même
        if (selectedCommande && selectedCommande.refCommande === refCommande) {
          setSelectedCommande(prev => ({ ...prev, statutCommande: newStatus }));
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
    
    switch (status) {
      case 'livrée':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'expédiée':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'en cours':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'annulée':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'en attente':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredCommandes = filterStatus === 'tous' 
    ? commandes 
    : commandes.filter(commande => commande.statutCommande === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Commandes</h1>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
      )}
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filtrer par statut :</span>
          {['tous', 'en attente', 'en cours', 'expédiée', 'livrée', 'annulée'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Liste des commandes */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCommandes.map((commande) => (
                    <tr key={commande.refCommande} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {commande.refCommande}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {commande.client.prenomClient} {commande.client.nomClient}
                        </div>
                        <div className="text-sm text-gray-500">
                          {commande.client.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(commande.dateCommande).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(commande.dateCommande).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {/* {commande.totalCommande.toFixed(2)} € */}200 ar
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadgeClass(commande.statutCommande)}>
                          {commande.statutCommande}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={commande.statutCommande}
                            onChange={(e) => handleStatusChange(commande.refCommande, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="en attente">En attente</option>
                            <option value="en cours">En cours</option>
                            <option value="expédiée">Expédiée</option>
                            <option value="livrée">Livrée</option>
                            <option value="annulée">Annulée</option>
                          </select>
                          <button
                            onClick={() => setSelectedCommande(commande)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCommandes === null && (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Détails de la commande sélectionnée */}
        <div className="xl:col-span-1">
          {selectedCommande ? (
            <div className="bg-white rounded-lg shadow sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Commande {selectedCommande.refCommande}
                  </h3>
                  <button
                    onClick={() => setSelectedCommande(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2">
                  <span className={getStatusBadgeClass(selectedCommande.statutCommande)}>
                    {selectedCommande.statutCommande}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Informations client */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Informations client
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Nom :</span> {selectedCommande.client.prenom} {selectedCommande.client.nom}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email :</span> {selectedCommande.client.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Référence :</span> {selectedCommande.client.refClient}
                    </p>
                  </div>
                </div>

                {/* Adresses */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Livraison
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>{selectedCommande.adresseLivraison.rue}</p>
                      <p>{selectedCommande.adresseLivraison.codePostal} {selectedCommande.adresseLivraison.ville}</p>
                      <p>{selectedCommande.adresseLivraison.pays}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Facturation
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>{selectedCommande.adresseFacturation.rue}</p>
                      <p>{selectedCommande.adresseFacturation.codePostal} {selectedCommande.adresseFacturation.ville}</p>
                      <p>{selectedCommande.adresseFacturation.pays}</p>
                    </div>
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    {/* Articles ({selectedCommande.articles.length}) */}  Produit 2
                  </h4>
                  <div className="space-y-3">
                    {selectedCommande.articles.map((article, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{article.produit}</p>
                          <p className="text-sm text-gray-500">Qté: {article.quantite}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{article.prixTotal.toFixed(2)} €</p>
                          <p className="text-sm text-gray-500">{article.prixUnitaire.toFixed(2)} € × {article.quantite}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total :</span>
                      <span>{(selectedCommande.totalCommande - parseFloat(selectedCommande.fraisLivraison || 0)).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frais de livraison :</span>
                      <span>{selectedCommande.fraisLivraison} €</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                      <span>Total :</span>
                      <span>{selectedCommande.totalCommande.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande sélectionnée</h3>
              <p className="text-gray-500">Cliquez sur "Détails" pour voir les informations d'une commande</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Commande;