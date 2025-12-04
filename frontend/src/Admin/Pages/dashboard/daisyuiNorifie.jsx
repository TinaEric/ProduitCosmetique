
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getNotification } from '@/services/AdminService';
import { useSearch } from "../../contexts/SearchContext";
import { 
  FaShoppingCart, 
  FaUserPlus, 
  FaBell, 
  FaCheckCircle, 
  FaEye, 
  FaSync, 
  FaArrowRight, 
  FaTruck, 
  FaCreditCard, 
  FaClock, 
  FaChartLine,
  FaExclamationTriangle,
  FaBox,
  FaWarehouse
} from 'react-icons/fa';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState({
    orders: [],
    users: [],
    produit: []
  });
  const { setNbrNotification } = useSearch();
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({
    ouvre: false,
    texte: "vide",
    statut: "success",
  });
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const donnes = await getNotification();
      
      if (donnes.data) {
        setNotifications({
          orders: donnes.data.commandeNotifie || [],
          users: donnes.data.clientNotifie || [],
          produit: donnes.data.produitNotifie || []
        });
        
        // Calculer le nombre de notifications non lues
        const totalUnread = [
          ...(donnes.data.commandeNotifie || []).filter(n => n.unread),
          ...(donnes.data.clientNotifie || []).filter(n => n.unread),
          ...(donnes.data.produitNotifie || []).filter(n => n.unread),
        ].length;
        setUnreadCount(totalUnread);
        setNbrNotification(totalUnread);
      } else {
        setMessage({
          ouvre: true,
          texte: "Erreur de récupération des notifications : " + donnes.error,
          statut: "error",
        });
        setOpen(true);
        console.log("Erreur de récupération des notifications : ", donnes.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      console.log("Erreur lors du chargement des notifications", err);
    } finally {
      setLoading(false);
    }
  }, [setNbrNotification]);

  useEffect(() => {
    fetchNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = (type, id) => {
    setNotifications(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === id ? { ...item, unread: false } : item
      )
    }));
    
    // Mettre à jour le compteur
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => ({
      orders: prev.orders.map(item => ({ ...item, unread: false })),
      users: prev.users.map(item => ({ ...item, unread: false })),
      produit: prev.produit.map(item => ({ ...item, unread: false })),
    }));
    setUnreadCount(0);
  };

  const handleViewOrder = (commande) => {
    markAsRead('orders', commande.id);
    navigate("/admin/ficheCommande", { state: commande });
  };

  const handleViewUser = (user) => {
    markAsRead('users', user.id);
    navigate("/admin/Users", { state: user });
  };

  const handleViewProduct = (product) => {
    markAsRead('produit', product.id);
    navigate("/admin/products", { state: product });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Nouveau': return 'badge-primary';
      case 'En traitement': return 'badge-warning';
      case 'Expédiée': return 'badge-info';
      case 'Livrée': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getStockStatusColor = (stockStatus) => {
    switch(stockStatus) {
      case 'rupture': return 'badge-error';
      case 'alerte': return 'badge-warning';
      case 'critique': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getStockStatusText = (stockStatus) => {
    switch(stockStatus) {
      case 'rupture': return 'Rupture de stock';
      case 'alerte': return 'Stock faible';
      case 'critique': return 'Stock critique';
      default: return stockStatus;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else {
      return `Il y a ${diffDays} j`;
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] dark:bg-gray-900">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        {message.ouvre && (
          <div className={`toast toast-top toast-end ${open ? 'block' : 'hidden'}`}>
            <div className={`alert alert-${message.statut}`}>
              <span>{message.texte}</span>
              <button className="btn btn-sm btn-circle" onClick={handleClose}>✕</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="indicator">
            {unreadCount > 0 && (
              <span className="indicator-item badge badge-error animate-pulse">
                {unreadCount}
              </span>
            )}
            <FaBell className="h-8 w-8 text-primary dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white">Notifications</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="btn btn-ghost btn-circle dark:bg-gray-800 dark:text-gray-300"
            onClick={fetchNotifications}
            title="Rafraîchir"
          >
            <FaSync />
          </button>
          <button
            className="btn btn-outline btn-primary dark:border-primary-400 dark:text-primary-400"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <FaCheckCircle className="mr-2" />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-error mb-4 shadow-lg">
          <div>
            <span>{error}</span>
            <button 
              className="btn btn-sm btn-outline ml-4" 
              onClick={fetchNotifications}
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Toast pour message */}
      {message.ouvre && (
        <div className={`toast toast-top toast-end ${open ? 'block' : 'hidden'}`}>
          <div className={`alert alert-${message.statut} shadow-lg`}>
            <span>{message.texte}</span>
            <button className="btn btn-sm btn-circle" onClick={handleClose}>✕</button>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="tabs tabs-boxed mb-6 bg-gray-100 dark:bg-gray-800">
        <button 
          className={`tab ${activeTab === 'orders' ? 'tab-active bg-white dark:bg-gray-700' : ''} dark:text-gray-300`}
          onClick={() => setActiveTab('orders')}
        >
          <div className="flex items-center gap-2">
            <FaShoppingCart />
            <span>Commandes</span>
            {notifications.orders.filter(n => n.unread).length > 0 && (
              <span className="badge badge-error ml-2">
                {notifications.orders.filter(n => n.unread).length}
              </span>
            )}
          </div>
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'tab-active bg-white dark:bg-gray-700' : ''} dark:text-gray-300`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center gap-2">
            <FaUserPlus />
            <span>Utilisateurs</span>
            {notifications.users.filter(n => n.unread).length > 0 && (
              <span className="badge badge-error ml-2">
                {notifications.users.filter(n => n.unread).length}
              </span>
            )}
          </div>
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'tab-active bg-white dark:bg-gray-700' : ''} dark:text-gray-300`}
          onClick={() => setActiveTab('products')}
        >
          <div className="flex items-center gap-2">
            <FaExclamationTriangle />
            <span>Produits</span>
            {notifications.produit.filter(n => n.unread).length > 0 && (
              <span className="badge badge-error ml-2">
                {notifications.produit.filter(n => n.unread).length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Contenu des notifications */}
      <div className="card bg-base-100 shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="card-body">
          {/* Onglet Commandes */}
          {activeTab === 'orders' && (
            <>
              <h2 className="card-title text-primary dark:text-primary-400 mb-4">
                <FaShoppingCart className="mr-2" />
                Nouvelles commandes ({notifications.orders.length})
              </h2>
              
              {notifications.orders.length === 0 ? (
                <div className="alert alert-info dark:bg-gray-700 dark:text-gray-300">
                  <span>Aucune nouvelle commande pour le moment</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.orders.map((order) => (
                    <div 
                      key={order.id}
                      className={`p-4 rounded-lg border ${order.unread ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`avatar ${order.unread ? 'online' : 'offline'}`}>
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center">
                              {order.unread ? (
                                <FaChartLine className="h-6 w-6" />
                              ) : (
                                <FaTruck className="h-6 w-6" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold dark:text-white">
                                Commande {order.refCommande}
                              </h3>
                              <span className={`badge ${getStatusColor(order.statutCommande)}`}>
                                {order.statutCommande}
                              </span>
                              {order.unread && (
                                <span className="badge badge-primary badge-outline">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {order.client?.prenomClient} {order.client?.nomClient} • {order.methodePaiement}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              {formatTimeAgo(order.dateCommande)} • Total: {order.montantTotal}€
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-ghost btn-sm dark:text-gray-300"
                            onClick={() => handleViewOrder(order)}
                            title="Voir les détails"
                          >
                            <FaEye />
                          </button>
                          {order.unread && (
                            <button 
                              className="btn btn-ghost btn-sm text-success dark:text-green-400"
                              onClick={() => markAsRead('orders', order.id)}
                              title="Marquer comme lu"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.orders.length > 0 && (
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-primary dark:bg-primary-600 dark:text-white"
                    onClick={() => navigate('/admin/commande')}
                  >
                    Voir toutes les commandes
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Onglet Utilisateurs */}
          {activeTab === 'users' && (
            <>
              <h2 className="card-title text-primary dark:text-primary-400 mb-4">
                <FaUserPlus className="mr-2" />
                Nouveaux utilisateurs ({notifications.users.length})
              </h2>
              
              {notifications.users.length === 0 ? (
                <div className="alert alert-info dark:bg-gray-700 dark:text-gray-300">
                  <span>Aucun nouvel utilisateur pour le moment</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.users.map((user) => (
                    <div 
                      key={user.id}
                      className={`p-4 rounded-lg border ${user.unread ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`avatar ${user.unread ? 'online' : 'offline'}`}>
                            <div className="w-12 h-12 rounded-full bg-success/10 text-success dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                              <FaUserPlus className="h-6 w-6" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold dark:text-white">
                                {user.nomUsers}
                              </h3>
                              <span className={`badge ${user.roleUsers === 'ROLE_ADMIN' ? 'badge-secondary' : 'badge-neutral'}`}>
                                {user.roleUsers === 'ROLE_ADMIN' ? 'Administrateur' : 'Client'}
                              </span>
                              {user.unread && (
                                <span className="badge badge-success badge-outline">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {user.emailUsers}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FaClock className="h-3 w-3" />
                              {formatTimeAgo(user.dateInscription)} • Inscrit le {format(new Date(user.dateInscription), 'dd/MM/yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-ghost btn-sm dark:text-gray-300"
                            onClick={() => handleViewUser(user)}
                            title="Voir le profil"
                          >
                            <FaEye />
                          </button>
                          {user.unread && (
                            <button 
                              className="btn btn-ghost btn-sm text-success dark:text-green-400"
                              onClick={() => markAsRead('users', user.id)}
                              title="Marquer comme lu"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.users.length > 0 && (
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-primary dark:bg-primary-600 dark:text-white"
                    onClick={() => navigate('/admin/Users')}
                  >
                    Voir tous les utilisateurs
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Onglet Produits */}
          {activeTab === 'products' && (
            <>
              <h2 className="card-title text-primary dark:text-primary-400 mb-4">
                <FaExclamationTriangle className="mr-2" />
                Alertes Stock Produits ({notifications.produit.length})
              </h2>
              
              {notifications.produit.length === 0 ? (
                <div className="alert alert-info dark:bg-gray-700 dark:text-gray-300">
                  <span>Aucune alerte de stock pour le moment</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.produit.map((product) => (
                    <div 
                      key={product.id}
                      className={`p-4 rounded-lg border ${product.unread ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`avatar ${product.unread ? 'online' : 'offline'}`}>
                            <div className="w-12 h-12 rounded-full bg-error/10 text-error dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center">
                              {product.stockStatus === 'rupture' ? (
                                <FaExclamationTriangle className="h-6 w-6" />
                              ) : (
                                <FaBox className="h-6 w-6" />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold dark:text-white">
                                {product.nomProduit || product.nom}
                              </h3>
                              <span className={`badge ${getStockStatusColor(product.stockStatus)}`}>
                                {getStockStatusText(product.stockStatus)}
                              </span>
                              {product.unread && (
                                <span className="badge badge-error badge-outline">
                                  Alerte
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              Référence: {product.refProduit || product.reference} • 
                              Catégorie: {product.categorie || 'Non spécifiée'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FaWarehouse className="h-3 w-3" />
                                Stock actuel: <span className="font-bold">{product.stockActuel || product.quantite}</span> unités
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <FaClock className="h-3 w-3" />
                                {formatTimeAgo(product.dateUpdate || product.updatedAt)}
                              </p>
                            </div>
                            {product.stockMinimum && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Stock minimum: {product.stockMinimum}</span>
                                  <progress 
                                    className="progress progress-error w-32" 
                                    value={product.stockActuel || 0} 
                                    max={Math.max(product.stockMinimum * 2, product.stockActuel || 0)}
                                  ></progress>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-ghost btn-sm dark:text-gray-300"
                            onClick={() => handleViewProduct(product)}
                            title="Voir le produit"
                          >
                            <FaEye />
                          </button>
                          {product.unread && (
                            <button 
                              className="btn btn-ghost btn-sm text-success dark:text-green-400"
                              onClick={() => markAsRead('produit', product.id)}
                              title="Marquer comme lu"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.produit.length > 0 && (
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-primary dark:bg-primary-600 dark:text-white"
                    onClick={() => navigate('/admin/products')}
                  >
                    Voir tous les produits
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pied de page */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        <span>Les notifications sont rafraîchies automatiquement toutes les 30 secondes</span>
        <span>{unreadCount} notification(s) non lue(s)</span>
      </div>
    </div>
  );
};

export default NotificationPage;