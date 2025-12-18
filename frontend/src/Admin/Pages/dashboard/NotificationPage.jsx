import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getNotification } from '@/services/AdminService';
import { useSearch } from "../../contexts/SearchContext";

import {
  ShoppingCartIcon,
  UserPlusIcon,
  BellIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  TruckIcon,
  CubeIcon,
  ClockIcon,
  ChartBarIcon, 
  ExclamationCircleIcon,
  XMarkIcon, // Remplace XIcon
  FunnelIcon, // Remplace FilterIcon
  EllipsisVerticalIcon, // Remplace DotsVerticalIcon
  UserGroupIcon, // Remplace UsersIcon
  CubeTransparentIcon // Remplace PackageIcon
} from '@heroicons/react/24/outline'; // Notez le chemin '24/outline'

// Pour les icônes solides (si nécessaire)
import {
  CheckCircleIcon as CheckCircleSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid
} from '@heroicons/react/24/solid';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState({
    orders: [],
    users: [],
    produit: []
  });
  const { setNbrNotification } = useSearch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({
    ouvre: false,
    texte: "vide",
    statut: "success",
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const donnes = await getNotification();
      
      // Assurer que donnes.data et donnes.data.notifications existent
      const notificationsData = donnes?.data?.notifications;
      
      if (notificationsData) {
        setNotifications({
          // Utiliser || [] pour garantir que c'est un tableau
          orders: notificationsData.commandeNotifie || [],
          users: notificationsData.clientNotifie || [],
          produit: notificationsData.produitNotifie || []
        });
        
        // Sécuriser également le calcul de totalUnread
        const totalUnread = [
          ...(notificationsData.commandeNotifie || []).filter(n => n.unread),
          ...(notificationsData.clientNotifie || []).filter(n => n.unread),
          ...(notificationsData.produitNotifie || []).filter(n => n.unread),
        ].length;
        setUnreadCount(totalUnread);
        setNbrNotification(totalUnread);
      } else {
        setMessage({
          ouvre: true,
          texte: "Erreur de récupération des notifications ou données manquantes!",
          statut: "error",
        });
        setOpen(true);
        setError("Erreur de récupération des notifications ou format de données inattendu!");
        // En cas d'erreur de données, s'assurer que l'état local est vide, et non indéfini.
        setNotifications({ orders: [], users: [], produit: [] }); 
        setNbrNotification(0);
      }
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      console.error("Erreur lors du chargement des notifications", err);
      // S'assurer que l'état local est vide même en cas d'erreur réseau
      setNotifications({ orders: [], users: [], produit: [] });
      setNbrNotification(0);
    } finally {
      setLoading(false);
    }
  }, [setNbrNotification]);

  console.log("Notifications mises à jour: ", notifications);

  useEffect(() => {
    fetchNotifications();
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
      case 'EN_ATTENTE_PAIEMENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PAYEE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'EXPEDIEE': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'LIVREE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStockStatusColor = (stockStatus) => {
    switch(stockStatus?.toLowerCase()) {
      case 'rupture': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'critique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'alerte': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStockStatusText = (stockStatus) => {
    switch(stockStatus?.toLowerCase()) {
      case 'rupture': return 'Rupture de stock';
      case 'critique': return 'Stock critique';
      case 'alerte': return 'Stock faible';
      default: return stockStatus;
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return `Il y a ${diffDays} j`;
    } catch (e) {
      return "Date inconnue";
    }
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
};

  const NotificationItem = ({ item, type, index }) => {
    console.log("Rendu de l'élément de notification: ", type);
    const [hovered, setHovered] = useState(false);
    
    const getIcon = () => {
      switch(type) {
        case 'commande': return <TruckIcon className="h-6 w-6" />;
        case 'users': return <UserPlusIcon className="h-6 w-6" />;
        case 'produit': return <CubeTransparentIcon className="h-6 w-6" />;
        default: return <BellIcon className="h-6 w-6" />;
      }
    };

    const getAction = () => {
      switch(type) {
        case 'commande': return () => handleViewOrder(item);
        case 'users': return () => handleViewUser(item);
        case 'produit': return () => handleViewProduct(item);
        default: return () => {};
      }
    };

    return (
      <div
        className={`transform transition-all duration-300 ${
          hovered ? '-translate-y-1 scale-[1.02]' : ''
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`relative mb-4 rounded-2xl p-4 border transition-all duration-300 ${
            item.unread
              ? 	'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30'
              : 'dark:bg-gray-800/40 dark:border-gray-700 bg-white border-gray-200'
          } ${hovered ? 'shadow-xl border-blue-400/50' : 'shadow-md'}`}
        >
          {item.unread && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl animate-pulse" />
          )}
          
          <div className="flex items-start space-x-4">
            <div
              className={`flex-shrink-0 rounded-xl p-3 transition-all duration-300 ${
                item.unread
                  ? 'dark:bg-blue-600 bg-blue-500' 
                  : 'dark:bg-gray-700 bg-gray-200'
              } ${hovered ? 'scale-110' : ''}`}
            >
              <div className="text-white">
                {getIcon()}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {type === 'commande' && `Commande ${item.refCommande}`}
                    {type === 'users' && `${item.nomClient}`}
                    {type === 'produit' && `${item.nomProduit || item.nom}`}
                  </h4>
                  
                  {type === 'commande' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.statutCommande)}`}>
                      {item.statutCommande}
                    </span>
                  )}
                  
                  {type === 'produit' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.stockStatus)}`}>
                      {getStockStatusText(item.stockStatus)}
                    </span>
                  )}
                  
                  {item.unread && (
                    <div className="relative">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping absolute" />
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={getAction()}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Voir les détails"
                >
                  <ArrowRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {type === 'commande' && `${item.client?.prenomClient || "Tsisy"} ${item.client?.nomClient} • ${item.methodePaiement}`}
                {type === 'users' && `${item.user?.emailUsers}`}
                {type === 'produit' && `Référence: ${item.numProduit || item.reference} • Catégorie: ${item.categorie || 'Non spécifiée'}`}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      {formatTimeAgo(
                        type === 'commande' ? item.dateCommande :
                        type === 'users' ? item.dateInscription :
                        item.dateUpdate || item.updatedAt
                      )}
                    </span>
                  </div>
                  
                  {type === 'commande' && (
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                      {item.montantTotal} Ar
                    </span>
                  )}
                  
                  {type === 'produit' && item.stockProduit !== undefined && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {item.stockProduit}
                      </span>
                      {item.stockMinimum && (
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.stockProduit <= item.stockMinimum
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, (item.stockProduit / item.stockMinimum) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => markAsRead(type, item.id)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  Marquer comme lu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const tabs = [
    {
      name: 'Commandes',
      icon: ShoppingCartIcon,
      count: notifications.orders.filter(n => n.unread).length,
      data: notifications.orders
    },
    {
      name: 'Utilisateurs',
      icon: UserGroupIcon,
      count: notifications.users.filter(n => n.unread).length,
      data: notifications.users
    },
    {
      name: 'Produits',
      icon: CubeTransparentIcon,
      count: notifications.produit.filter(n => n.unread).length,
      data: notifications.produit
    }
  ];

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-gradient-to-br from-blue-50 to-gray-100 dark:text-white`}> {/* MODIFIÉ : Supprimé le `darkMode` conditionnel sur le texte blanc/sombre */}
      <div className="max-w-7xl mx-auto">
        {/* Snackbar pour les messages d'erreur/succès */}
        {open && (
          <div className={`fixed top-4 right-4 z-50 animate-slide-in ${
            message.statut === 'error' 
              ? 'bg-red-500' 
              : 'bg-green-500'
          } text-white rounded-xl shadow-2xl p-4 max-w-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {message.statut === 'error' ? (
                  <ExclamationCircleIcon className="h-6 w-6" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6" />
                )}
                <span>{message.texte}</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`p-4 rounded-2xl dark:bg-gray-800/50 dark:backdrop-blur-sm bg-white/80 backdrop-blur-sm shadow-xl`}> {/* MODIFIÉ */}
                  <BellIcon className="h-8 w-8 text-blue-500" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <div className="relative">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <div className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h1 className={`text-3xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 from-blue-600 to-purple-600 bg-clip-text text-transparent`}> {/* MODIFIÉ */}
                  Notifications
                </h1>
                <p className={`mt-1 dark:text-gray-400 text-gray-600`}> {/* MODIFIÉ */}
                  {unreadCount} notification(s) non lue(s)
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchNotifications}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 dark:bg-gray-800 dark:hover:bg-gray-700 bg-white hover:bg-gray-100 shadow-lg`}
                title="Rafraîchir"
              >
                <ArrowPathIcon className="h-5 w-5 text-blue-500" />
              </button>
              
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  unreadCount === 0
                    ? 'dark:bg-gray-700 dark:text-gray-500 bg-gray-200 text-gray-400 cursor-not-allowed' // MODIFIÉ (retiré le darkMode/else)
                    : `bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                      text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Tout marquer comme lu</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 animate-slide-down">
            <div className={`rounded-2xl p-4 border dark:bg-red-900/20 dark:border-red-700 bg-red-50 border-red-200`}> {/* MODIFIÉ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                  <span className='dark:text-red-300 text-red-800'> {/* MODIFIÉ */}
                    {error}
                  </span>
                </div>
                <button
                  onClick={fetchNotifications}
                  className={`px-3 py-1 rounded-lg text-sm font-medium dark:bg-red-700 dark:hover:bg-red-600 dark:text-white bg-red-100 hover:bg-red-200 text-red-800 transition-colors duration-200`} // MODIFIÉ (retiré le darkMode/else)
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="mb-8">
          <div className={`rounded-2xl p-1 dark:bg-gray-800/50 bg-white/80 backdrop-blur-sm shadow-lg`}> {/* MODIFIÉ */}
            <div className="flex space-x-1">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${
                    activeTab === index
                      ? 'dark:bg-gray-700 bg-white shadow-lg border dark:border-transparent border-gray-200' // MODIFIÉ
                      : 'hover:opacity-80'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 ${
                    activeTab === index
                      ? 'dark:text-blue-400 text-blue-600' // MODIFIÉ
                      : 'dark:text-gray-400 text-gray-500' // MODIFIÉ
                  }`} />
                  <span className={`font-semibold ${
                    activeTab === index
                      ? 'dark:text-white text-gray-900' // MODIFIÉ
                      : 'dark:text-gray-400 text-gray-600' // MODIFIÉ
                  }`}>
                    {tab.name}
                  </span>
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold dark:bg-red-500 dark:text-white bg-red-100 text-red-800`}> {/* MODIFIÉ */}
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm dark:bg-gradient-to-br dark:from-gray-800/60 dark:to-gray-900/60 dark:border dark:border-gray-700/30 bg-gradient-to-br from-white/90 to-gray-50/90 border border-white/50`}> {/* MODIFIÉ */}
          <div className="p-6">
            {/* En-tête de l'onglet */}
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-3 rounded-xl dark:bg-gray-700/50 bg-blue-50`}> {/* MODIFIÉ */}
                {React.createElement(tabs[activeTab].icon, {
                  className: `h-6 w-6 dark:text-blue-400 text-blue-600` // MODIFIÉ
                })}
              </div>
              <div>
                <h2 className={`text-xl font-bold dark:text-white text-gray-900`}> {/* MODIFIÉ */}
                  {tabs[activeTab].name === 'Commandes' && 'Nouvelles commandes'}
                  {tabs[activeTab].name === 'Utilisateurs' && 'Nouveaux utilisateurs'}
                  {tabs[activeTab].name === 'Produits' && 'Alertes Stock Produits'}
                </h2>
                <p className='dark:text-gray-400 text-gray-600'> {/* MODIFIÉ */}
                  {tabs[activeTab].data.length} notification(s)
                </p>
              </div>
            </div>

            {/* Contenu de l'onglet */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                  <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <p className={`mt-4 dark:text-gray-400 text-gray-600`}> {/* MODIFIÉ */}
                  Chargement des notifications...
                </p>
              </div>
            ) : tabs[activeTab].data.length === 0 ? (
              <div className={`rounded-2xl p-8 text-center dark:bg-gray-800/40 bg-gray-50`}> {/* MODIFIÉ */}
                <div className="inline-flex p-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                  <BellIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 dark:text-gray-300 text-gray-700`}> {/* MODIFIÉ */}
                  Aucune notification pour le moment
                </h3>
                <p className='dark:text-gray-400 text-gray-600'> {/* MODIFIÉ */}
                  {tabs[activeTab].name === 'Commandes' && 'Aucune nouvelle commande pour le moment'}
                  {tabs[activeTab].name === 'Utilisateurs' && 'Aucun nouvel utilisateur pour le moment'}
                  {tabs[activeTab].name === 'Produits' && 'Aucune alerte de stock pour le moment'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tabs[activeTab].data.map((item, index) => (
                  <NotificationItem
                    key={item.refCommande || index}
                    item={item}
                    type={tabs[activeTab].name.toLowerCase().slice(0, -1)}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Bouton "Voir tous" */}
            {tabs[activeTab].data.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (activeTab === 0) navigate('/admin/commande');
                      if (activeTab === 1) navigate('/admin/Users');
                      if (activeTab === 2) navigate('/admin/products');
                    }}
                    className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-md hover:shadow-lg`} // MODIFIÉ
                  >
                    <span>Voir tous</span>
                    <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className={`mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 dark:text-gray-400 text-gray-600`}> {/* MODIFIÉ */}
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span className="text-sm">
              Les notifications sont rafraîchies automatiquement toutes les 30 secondes
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full ${
              unreadCount > 0
                ? 'dark:bg-blue-900/30 dark:text-blue-300 dark:border dark:border-blue-700/50 bg-blue-100 text-blue-800 border border-blue-200' // MODIFIÉ
                : 'dark:bg-gray-800 dark:text-gray-500 bg-gray-100 text-gray-600' // MODIFIÉ
            } transition-all duration-300 ${unreadCount > 0 ? 'animate-pulse' : ''}`}>
              <span className="font-semibold">
                {unreadCount} notification(s) non lue(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPage;



// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { getNotification } from '@/services/AdminService';
// import { useSearch } from "../../contexts/SearchContext";

// // Icônes Heroicons (équivalentes à MUI)
// import {
//   ShoppingCartIcon,
//   UserAddIcon,
//   ExclamationIcon,
//   BellIcon,
//   CheckCircleIcon,
//   EyeIcon,
//   RefreshIcon,
//   ArrowRightIcon,
//   TruckIcon,
//   CubeIcon,
//   ClockIcon,
//   TrendingUpIcon,
//   ExclamationCircleIcon,
//   XIcon,
//   FilterIcon,
//   DotsVerticalIcon,
//   CircleIcon,
//   UsersIcon,
//   PackageIcon
// } from '@heroicons/react/outline';

// const NotificationPage = () => {
//   const [notifications, setNotifications] = useState({
//     orders: [],
//     users: [],
//     produit: []
//   });
//   const { setNbrNotification } = useSearch();
//   const [activeTab, setActiveTab] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [expandedId, setExpandedId] = useState(null);
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);
//   const [message, setMessage] = useState({
//     ouvre: false,
//     texte: "vide",
//     statut: "success",
//   });
//   const [darkMode, setDarkMode] = useState(false);

//   // Vérifier le thème système
//   useEffect(() => {
//     const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     setDarkMode(isDark);
    
//     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     const handleChange = (e) => setDarkMode(e.matches);
//     mediaQuery.addEventListener('change', handleChange);
    
//     return () => mediaQuery.removeEventListener('change', handleChange);
//   }, []);

//   const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const donnes = await getNotification();
      
//       if (donnes.data) {
//         setNotifications({
//           orders: donnes.data.notifications.commandeNotifie || [],
//           users: donnes.data.notifications.clientNotifie || [],
//           produit: donnes.data.notifications.produitNotifie || []
//         });
        
//         const totalUnread = [
//           ...(donnes.data.notifications.commandeNotifie || []).filter(n => n.unread),
//           ...(donnes.data.notifications.clientNotifie || []).filter(n => n.unread),
//           ...(donnes.data.notifications.produitNotifie || []).filter(n => n.unread),
//         ].length;
//         setUnreadCount(totalUnread);
//         setNbrNotification(totalUnread);
//       } else {
//         setMessage({
//           ouvre: true,
//           texte: "Erreur de récupération des notifications!",
//           statut: "error",
//         });
//         setOpen(true);
//         setError("Erreur de récupération des notifications!");
//       }
//     } catch (err) {
//       setError('Erreur lors du chargement des notifications');
//       console.error("Erreur lors du chargement des notifications", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [setNbrNotification]);

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [fetchNotifications]);

//   const markAsRead = (type, id) => {
//     setNotifications(prev => ({
//       ...prev,
//       [type]: prev[type].map(item => 
//         item.id === id ? { ...item, unread: false } : item
//       )
//     }));
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   const markAllAsRead = () => {
//     setNotifications(prev => ({
//       orders: prev.orders.map(item => ({ ...item, unread: false })),
//       users: prev.users.map(item => ({ ...item, unread: false })),
//       produit: prev.produit.map(item => ({ ...item, unread: false })),
//     }));
//     setUnreadCount(0);
//   };

//   const handleViewOrder = (commande) => {
//     markAsRead('orders', commande.id);
//     navigate("/admin/ficheCommande", { state: commande });
//   };

//   const handleViewUser = (user) => {
//     markAsRead('users', user.id);
//     navigate("/admin/Users", { state: user });
//   };

//   const handleViewProduct = (product) => {
//     markAsRead('produit', product.id);
//     navigate("/admin/products", { state: product });
//   };

//   const getStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'nouveau': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
//       case 'en traitement': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
//       case 'expédiée': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
//       case 'livrée': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
//       default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//     }
//   };

//   const getStockStatusColor = (stockStatus) => {
//     switch(stockStatus?.toLowerCase()) {
//       case 'rupture': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
//       case 'critique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
//       case 'alerte': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
//       default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//     }
//   };

//   const getStockStatusText = (stockStatus) => {
//     switch(stockStatus?.toLowerCase()) {
//       case 'rupture': return 'Rupture de stock';
//       case 'critique': return 'Stock critique';
//       case 'alerte': return 'Stock faible';
//       default: return stockStatus;
//     }
//   };

//   const formatTimeAgo = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);

//       if (diffMins < 1) return "À l'instant";
//       if (diffMins < 60) return `Il y a ${diffMins} min`;
//       if (diffHours < 24) return `Il y a ${diffHours} h`;
//       return `Il y a ${diffDays} j`;
//     } catch (e) {
//       return "Date inconnue";
//     }
//   };

//   const NotificationItem = ({ item, type, index }) => {
//     const [hovered, setHovered] = useState(false);
    
//     const getIcon = () => {
//       switch(type) {
//         case 'orders': return <TruckIcon className="h-6 w-6" />;
//         case 'users': return <UserAddIcon className="h-6 w-6" />;
//         case 'produit': return <PackageIcon className="h-6 w-6" />;
//         default: return <BellIcon className="h-6 w-6" />;
//       }
//     };

//     const getAction = () => {
//       switch(type) {
//         case 'orders': return () => handleViewOrder(item);
//         case 'users': return () => handleViewUser(item);
//         case 'produit': return () => handleViewProduct(item);
//         default: return () => {};
//       }
//     };

//     return (
//       <div
//         className={`transform transition-all duration-300 ${
//           hovered ? '-translate-y-1 scale-[1.02]' : ''
//         }`}
//         style={{ animationDelay: `${index * 100}ms` }}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//       >
//         <div
//           className={`relative mb-4 rounded-2xl p-4 border transition-all duration-300 ${
//             item.unread
//               ? darkMode
//                 ? 'bg-blue-900/20 border-blue-500/30'
//                 : 'bg-blue-50 border-blue-200'
//               : darkMode
//                 ? 'bg-gray-800/40 border-gray-700'
//                 : 'bg-white border-gray-200'
//           } ${hovered ? 'shadow-xl border-blue-400/50' : 'shadow-md'}`}
//         >
//           {item.unread && (
//             <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl animate-pulse" />
//           )}
          
//           <div className="flex items-start space-x-4">
//             <div
//               className={`flex-shrink-0 rounded-xl p-3 transition-all duration-300 ${
//                 item.unread
//                   ? darkMode ? 'bg-blue-600' : 'bg-blue-500'
//                   : darkMode ? 'bg-gray-700' : 'bg-gray-200'
//               } ${hovered ? 'scale-110' : ''}`}
//             >
//               <div className="text-white">
//                 {getIcon()}
//               </div>
//             </div>
            
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center space-x-3">
//                   <h4 className="font-semibold text-gray-900 dark:text-white truncate">
//                     {type === 'orders' && `Commande ${item.refCommande}`}
//                     {type === 'users' && `${item.nomClient}`}
//                     {type === 'produit' && `${item.nomProduit || item.nom}`}
//                   </h4>
                  
//                   {type === 'orders' && (
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.statutCommande)}`}>
//                       {item.statutCommande}
//                     </span>
//                   )}
                  
//                   {type === 'produit' && (
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.stockStatus)}`}>
//                       {getStockStatusText(item.stockStatus)}
//                     </span>
//                   )}
                  
//                   {item.unread && (
//                     <div className="relative">
//                       <div className="h-2 w-2 bg-blue-500 rounded-full animate-ping absolute" />
//                       <div className="h-2 w-2 bg-blue-500 rounded-full" />
//                     </div>
//                   )}
//                 </div>
                
//                 <button
//                   onClick={getAction()}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
//                   title="Voir les détails"
//                 >
//                   <ArrowRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                 </button>
//               </div>
              
//               <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
//                 {type === 'orders' && `${item.client?.prenomClient} ${item.client?.nomClient} • ${item.methodePaiement}`}
//                 {type === 'users' && `${item.user?.emailUsers}`}
//                 {type === 'produit' && `Référence: ${item.numProduit || item.reference} • Catégorie: ${item.categorie || 'Non spécifiée'}`}
//               </p>
              
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
//                     <ClockIcon className="h-4 w-4" />
//                     <span>
//                       {formatTimeAgo(
//                         type === 'orders' ? item.dateCommande :
//                         type === 'users' ? item.dateInscription :
//                         item.dateUpdate || item.updatedAt
//                       )}
//                     </span>
//                   </div>
                  
//                   {type === 'orders' && (
//                     <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
//                       {item.montantTotal}€
//                     </span>
//                   )}
                  
//                   {type === 'produit' && item.stockProduit !== undefined && (
//                     <div className="flex items-center space-x-2">
//                       <span className="text-sm text-gray-500 dark:text-gray-400">
//                         Stock: {item.stockProduit}
//                       </span>
//                       {item.stockMinimum && (
//                         <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
//                           <div
//                             className={`h-1.5 rounded-full ${
//                               item.stockProduit <= item.stockMinimum
//                                 ? 'bg-red-500'
//                                 : 'bg-yellow-500'
//                             }`}
//                             style={{ width: `${Math.min(100, (item.stockProduit / item.stockMinimum) * 100)}%` }}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
                
//                 <button
//                   onClick={() => markAsRead(type, item.id)}
//                   className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
//                 >
//                   Marquer comme lu
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const tabs = [
//     {
//       name: 'Commandes',
//       icon: ShoppingCartIcon,
//       count: notifications.orders.filter(n => n.unread).length,
//       data: notifications.orders
//     },
//     {
//       name: 'Utilisateurs',
//       icon: UsersIcon,
//       count: notifications.users.filter(n => n.unread).length,
//       data: notifications.users
//     },
//     {
//       name: 'Produits',
//       icon: PackageIcon,
//       count: notifications.produit.filter(n => n.unread).length,
//       data: notifications.produit
//     }
//   ];
// // px-4 sm:px-6 lg:px-8
//   return (
//     <div className={`min-h-screen px-1 py-2 transition-colors duration-300 ${
//       darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-gray-100'
//     }`}>
//       <div className="">
//         {/* Snackbar pour les messages d'erreur/succès  max-w-7xl mx-auto*/}
//         {open && (
//           <div className={`fixed top-4 right-4 z-50 animate-slide-in ${
//             message.statut === 'error' 
//               ? 'bg-red-500' 
//               : 'bg-green-500'
//           } text-white rounded-xl shadow-2xl p-4 max-w-sm`}>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 {message.statut === 'error' ? (
//                   <ExclamationCircleIcon className="h-6 w-6" />
//                 ) : (
//                   <CheckCircleIcon className="h-6 w-6" />
//                 )}
//                 <span>{message.texte}</span>
//               </div>
//               <button onClick={() => setOpen(false)}>
//                 <XIcon className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* En-tête */}
//         <div className="mb-8 animate-fade-in">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <div className={`p-4 rounded-2xl ${
//                   darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
//                 } shadow-xl`}>
//                   <BellIcon className="h-8 w-8 text-blue-500" />
//                 </div>
//                 {unreadCount > 0 && (
//                   <div className="absolute -top-2 -right-2">
//                     <div className="relative">
//                       <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
//                       <div className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-xs font-bold text-white">
//                         {unreadCount}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <h1 className={`text-3xl font-bold bg-gradient-to-r ${
//                   darkMode 
//                     ? 'from-blue-400 to-purple-400' 
//                     : 'from-blue-600 to-purple-600'
//                 } bg-clip-text text-transparent`}>
//                   Notifications
//                 </h1>
//                 <p className={`mt-1 ${
//                   darkMode ? 'text-gray-400' : 'text-gray-600'
//                 }`}>
//                   {unreadCount} notification(s) non lue(s)
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={fetchNotifications}
//                 className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
//                   darkMode 
//                     ? 'bg-gray-800 hover:bg-gray-700' 
//                     : 'bg-white hover:bg-gray-100'
//                 } shadow-lg`}
//                 title="Rafraîchir"
//               >
//                 <RefreshIcon className="h-5 w-5 text-blue-500" />
//               </button>
              
//               <button
//                 onClick={markAllAsRead}
//                 disabled={unreadCount === 0}
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
//                   unreadCount === 0
//                     ? darkMode
//                       ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
//                       : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                     : `bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
//                        text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`
//                 }`}
//               >
//                 <div className="flex items-center space-x-2">
//                   <CheckCircleIcon className="h-5 w-5" />
//                   <span>Tout marquer comme lu</span>
//                 </div>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Message d'erreur */}
//         {error && (
//           <div className="mb-6 animate-slide-down">
//             <div className={`rounded-2xl p-4 border ${
//               darkMode 
//                 ? 'bg-red-900/20 border-red-700' 
//                 : 'bg-red-50 border-red-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
//                   <span className={darkMode ? 'text-red-300' : 'text-red-800'}>
//                     {error}
//                   </span>
//                 </div>
//                 <button
//                   onClick={fetchNotifications}
//                   className={`px-3 py-1 rounded-lg text-sm font-medium ${
//                     darkMode
//                       ? 'bg-red-700 hover:bg-red-600 text-white'
//                       : 'bg-red-100 hover:bg-red-200 text-red-800'
//                   } transition-colors duration-200`}
//                 >
//                   Réessayer
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Onglets */}
//         <div className="mb-8">
//           <div className={`rounded-2xl p-1 ${
//             darkMode ? 'bg-gray-800/50' : 'bg-white/80'
//           } backdrop-blur-sm shadow-lg`}>
//             <div className="flex space-x-1">
//               {tabs.map((tab, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setActiveTab(index)}
//                   className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${
//                     activeTab === index
//                       ? darkMode
//                         ? 'bg-gray-700 shadow-lg'
//                         : 'bg-white shadow-lg border border-gray-200'
//                       : 'hover:opacity-80'
//                   }`}
//                 >
//                   <tab.icon className={`h-5 w-5 ${
//                     activeTab === index
//                       ? darkMode ? 'text-blue-400' : 'text-blue-600'
//                       : darkMode ? 'text-gray-400' : 'text-gray-500'
//                   }`} />
//                   <span className={`font-semibold ${
//                     activeTab === index
//                       ? darkMode ? 'text-white' : 'text-gray-900'
//                       : darkMode ? 'text-gray-400' : 'text-gray-600'
//                   }`}>
//                     {tab.name}
//                   </span>
//                   {tab.count > 0 && (
//                     <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
//                       darkMode 
//                         ? 'bg-red-500 text-white' 
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Contenu principal */}
//         <div className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm ${
//           darkMode 
//             ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/30'
//             : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-white/50'
//         }`}>
//           <div className="p-6">
//             {/* En-tête de l'onglet */}
//             <div className="flex items-center space-x-3 mb-6">
//               <div className={`p-3 rounded-xl ${
//                 darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
//               }`}>
//                 {React.createElement(tabs[activeTab].icon, {
//                   className: `h-6 w-6 ${
//                     darkMode ? 'text-blue-400' : 'text-blue-600'
//                   }`
//                 })}
//               </div>
//               <div>
//                 <h2 className={`text-xl font-bold ${
//                   darkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   {tabs[activeTab].name === 'Commandes' && 'Nouvelles commandes'}
//                   {tabs[activeTab].name === 'Utilisateurs' && 'Nouveaux utilisateurs'}
//                   {tabs[activeTab].name === 'Produits' && 'Alertes Stock Produits'}
//                 </h2>
//                 <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
//                   {tabs[activeTab].data.length} notification(s)
//                 </p>
//               </div>
//             </div>

//             {/* Contenu de l'onglet */}
//             {loading ? (
//               <div className="flex flex-col items-center justify-center py-16">
//                 <div className="relative">
//                   <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
//                   <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
//                 </div>
//                 <p className={`mt-4 ${
//                   darkMode ? 'text-gray-400' : 'text-gray-600'
//                 }`}>
//                   Chargement des notifications...
//                 </p>
//               </div>
//             ) : tabs[activeTab].data.length === 0 ? (
//               <div className={`rounded-2xl p-8 text-center ${
//                 darkMode ? 'bg-gray-800/40' : 'bg-gray-50'
//               }`}>
//                 <div className="inline-flex p-4 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
//                   <BellIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
//                 </div>
//                 <h3 className={`text-lg font-semibold mb-2 ${
//                   darkMode ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Aucune notification pour le moment
//                 </h3>
//                 <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
//                   {tabs[activeTab].name === 'Commandes' && 'Aucune nouvelle commande pour le moment'}
//                   {tabs[activeTab].name === 'Utilisateurs' && 'Aucun nouvel utilisateur pour le moment'}
//                   {tabs[activeTab].name === 'Produits' && 'Aucune alerte de stock pour le moment'}
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {tabs[activeTab].data.map((item, index) => (
//                   <NotificationItem
//                     key={item.id || index}
//                     item={item}
//                     type={tabs[activeTab].name.toLowerCase().slice(0, -1)}
//                     index={index}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Bouton "Voir tous" */}
//             {tabs[activeTab].data.length > 0 && (
//               <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => {
//                       if (activeTab === 0) navigate('/admin/commande');
//                       if (activeTab === 1) navigate('/admin/Users');
//                       if (activeTab === 2) navigate('/admin/products');
//                     }}
//                     className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
//                       darkMode
//                         ? 'bg-gray-700 hover:bg-gray-600 text-white'
//                         : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
//                     } shadow-md hover:shadow-lg`}
//                   >
//                     <span>Voir tous</span>
//                     <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Pied de page */}
//         <div className={`mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${
//           darkMode ? 'text-gray-400' : 'text-gray-600'
//         }`}>
//           <div className="flex items-center space-x-2">
//             <ClockIcon className="h-5 w-5" />
//             <span className="text-sm">
//               Les notifications sont rafraîchies automatiquement toutes les 30 secondes
//             </span>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className={`px-4 py-2 rounded-full ${
//               unreadCount > 0
//                 ? darkMode
//                   ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
//                   : 'bg-blue-100 text-blue-800 border border-blue-200'
//                 : darkMode
//                   ? 'bg-gray-800 text-gray-500'
//                   : 'bg-gray-100 text-gray-600'
//             } transition-all duration-300 ${unreadCount > 0 ? 'animate-pulse' : ''}`}>
//               <span className="font-semibold">
//                 {unreadCount} notification(s) non lue(s)
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Styles CSS pour les animations */}
//       <style jsx>{`
//         @keyframes slide-in {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes slide-down {
//           from {
//             transform: translateY(-20px);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-slide-in {
//           animation: slide-in 0.3s ease-out;
//         }
        
//         .animate-slide-down {
//           animation: slide-down 0.3s ease-out;
//         }
        
//         .animate-fade-in {
//           animation: fade-in 0.5s ease-out;
//         }
        
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default NotificationPage;

// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Card, 
//   CardContent, 
//   Typography, 
//   List, 
//   ListItem, 
//   ListItemText, 
//   ListItemAvatar, 
//   Avatar, 
//   Badge, 
//   IconButton, 
//   Chip, 
//   Box, 
//   Tabs, 
//   Tab,
//   Paper,
//   Button,
//   Divider,
//   Tooltip,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   LinearProgress,
//   Container,
//   Fade,
//   Grow,
//   Zoom,
//   Slide,
//   alpha,
//   useTheme,
//   Collapse
// } from '@mui/material';
// import {
//   ShoppingCart,
//   PersonAdd,
//   Warning as WarningIcon,
//   Notifications as NotificationsIcon,
//   CheckCircle,
//   RemoveRedEye,
//   Refresh,
//   ArrowForward,
//   LocalShipping,
//   Inventory,
//   Schedule,
//   TrendingUp,
//   Error as ErrorIcon,
//   Close,
//   FilterList,
//   MoreVert,
//   Circle
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { getNotification } from '@/services/AdminService';
// import { useSearch } from "../../contexts/SearchContext";

// const NotificationPage = () => {
//   const [notifications, setNotifications] = useState({
//     orders: [],
//     users: [],
//     produit: []
//   });
//   const { setNbrNotification } = useSearch();
//   const [activeTab, setActiveTab] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [expandedId, setExpandedId] = useState(null);
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);
//   const [message, setMessage] = useState({
//     ouvre: false,
//     texte: "vide",
//     statut: "success",
//   });
//   const theme = useTheme();

//   const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const donnes = await getNotification();
      
//       if (donnes.data) {
//         setNotifications({
//           orders: donnes.data.notifications.commandeNotifie || [],
//           users: donnes.data.notifications.clientNotifie || [],
//           produit: donnes.data.notifications.produitNotifie || []
//         });
        
//         const totalUnread = [
//           ...(donnes.data.notifications.commandeNotifie || []).filter(n => n.unread),
//           ...(donnes.data.notifications.clientNotifie || []).filter(n => n.unread),
//           ...(donnes.data.notifications.produitNotifie || []).filter(n => n.unread),
//         ].length;
//         setUnreadCount(totalUnread);
//         setNbrNotification(totalUnread);
//       } else {
//         setMessage({
//           ouvre: true,
//           texte: "Erreur de récupération des notifications! ",
//           statut: donnes.statut || "error",
//         });
//         setOpen(true);
//         setError("Erreur de récupération des notifications!");
//       }
//     } catch (err) {
//       setError('Erreur lors du chargement des notifications');
//       console.error("Erreur lors du chargement des notifications(Try/Catch)", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [setNbrNotification]);

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [fetchNotifications]);

//   const markAsRead = (type, id) => {
//     setNotifications(prev => ({
//       ...prev,
//       [type]: prev[type].map(item => 
//         item.id === id ? { ...item, unread: false } : item
//       )
//     }));
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   const markAllAsRead = () => {
//     setNotifications(prev => ({
//       orders: prev.orders.map(item => ({ ...item, unread: false })),
//       users: prev.users.map(item => ({ ...item, unread: false })),
//       produit: prev.produit.map(item => ({ ...item, unread: false })),
//     }));
//     setUnreadCount(0);
//   };

//   const handleViewOrder = (commande) => {
//     markAsRead('orders', commande.id);
//     navigate("/admin/ficheCommande", { state: commande });
//   };

//   const handleViewUser = (user) => {
//     markAsRead('users', user.id);
//     navigate("/admin/Users", { state: user });
//   };

//   const handleViewProduct = (product) => {
//     markAsRead('produit', product.id);
//     navigate("/admin/products", { state: product });
//   };

//   const getStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'nouveau': return 'primary';
//       case 'en traitement': return 'warning';
//       case 'expédiée': return 'info';
//       case 'livrée': return 'success';
//       default: return 'default';
//     }
//   };

//   const getStockStatusColor = (stockStatus) => {
//     switch(stockStatus?.toLowerCase()) {
//       case 'rupture': return 'error';
//       case 'critique': return 'error';
//       case 'alerte': return 'warning';
//       default: return 'default';
//     }
//   };

//   const getStockStatusText = (stockStatus) => {
//     switch(stockStatus?.toLowerCase()) {
//       case 'rupture': return 'Rupture de stock';
//       case 'critique': return 'Stock critique';
//       case 'alerte': return 'Stock faible';
//       default: return stockStatus;
//     }
//   };

//   const formatTimeAgo = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);

//       if (diffMins < 1) {
//         return "À l'instant";
//       } else if (diffMins < 60) {
//         return `Il y a ${diffMins} min`;
//       } else if (diffHours < 24) {
//         return `Il y a ${diffHours} h`;
//       } else {
//         return `Il y a ${diffDays} j`;
//       }
//     } catch (e) {
//       return "Date inconnue";
//     }
//   };

//   const handleClose = (event, reason) => {
//     if (reason === "clickaway") return;
//     setOpen(false);
//   };

//   const NotificationItem = ({ item, type, index }) => {
//     const [hovered, setHovered] = useState(false);
//     const [pulsing, setPulsing] = useState(item.unread);
    
//     const getIcon = () => {
//       switch(type) {
//         case 'orders': return <LocalShipping />;
//         case 'users': return <PersonAdd />;
//         case 'produit': return <Inventory />;
//         default: return <NotificationsIcon />;
//       }
//     };

//     const getAction = () => {
//       switch(type) {
//         case 'orders': return () => handleViewOrder(item);
//         case 'users': return () => handleViewUser(item);
//         case 'produit': return () => handleViewProduct(item);
//         default: return () => {};
//       }
//     };

//     // Effet de pulsation pour les notifications non lues
//     useEffect(() => {
//       if (item.unread) {
//         const interval = setInterval(() => {
//           setPulsing(prev => !prev);
//         }, 2000);
//         return () => clearInterval(interval);
//       }
//     }, [item.unread]);

//     return (
//       <Grow in={true} timeout={index * 100}>
//         <Box
//           onMouseEnter={() => setHovered(true)}
//           onMouseLeave={() => setHovered(false)}
//           sx={{
//             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//             transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
//           }}
//         >
//           <ListItem
//             alignItems="flex-start"
//             sx={{
//               bgcolor: item.unread 
//                 ? theme.palette.mode === 'dark' 
//                   ? alpha(theme.palette.primary.main, 0.1)
//                   : alpha(theme.palette.primary.main, 0.08)
//                 : theme.palette.mode === 'dark'
//                   ? alpha(theme.palette.background.paper, 0.4)
//                   : 'transparent',
//               borderRadius: 2,
//               mb: 2,
//               p: 2,
//               border: `1px solid ${
//                 theme.palette.mode === 'dark'
//                   ? alpha(theme.palette.divider, 0.3)
//                   : alpha(theme.palette.divider, 0.1)
//               }`,
//               transition: 'all 0.3s ease',
//               position: 'relative',
//               boxShadow: hovered 
//                 ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`
//                 : 'none',
//               '&:hover': {
//                 borderColor: theme.palette.primary.main,
//               },
//             }}
//             secondaryAction={
//               <Box display="flex" gap={1}>
//                 <Tooltip title="Voir les détails">
//                   <IconButton 
//                     edge="end" 
//                     onClick={getAction()}
//                     sx={{
//                       bgcolor: theme.palette.mode === 'dark'
//                         ? alpha(theme.palette.primary.main, 0.2)
//                         : alpha(theme.palette.primary.main, 0.1),
//                       transition: 'transform 0.2s',
//                       '&:hover': {
//                         transform: 'scale(1.1)',
//                         bgcolor: theme.palette.mode === 'dark'
//                           ? alpha(theme.palette.primary.main, 0.3)
//                           : alpha(theme.palette.primary.main, 0.2),
//                       },
//                     }}
//                   >
//                     <ArrowForward />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//             }
//           >
//             {item.unread && (
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   left: 0,
//                   top: 0,
//                   bottom: 0,
//                   width: 4,
//                   bgcolor: pulsing ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.7),
//                   borderTopLeftRadius: 8,
//                   borderBottomLeftRadius: 8,
//                   transition: 'all 1s ease',
//                   animation: pulsing ? 'pulse 2s infinite' : 'none',
//                 }}
//               />
//             )}
            
//             <ListItemAvatar>
//               <Avatar
//                 sx={{
//                   bgcolor: item.unread
//                     ? theme.palette.primary.main
//                     : theme.palette.mode === 'dark'
//                       ? theme.palette.grey[700]
//                       : theme.palette.grey[300],
//                   transition: 'all 0.3s ease',
//                   transform: hovered ? 'scale(1.1)' : 'scale(1)',
//                 }}
//               >
//                 {getIcon()}
//               </Avatar>
//             </ListItemAvatar>
            
//             <ListItemText
//               primary={
//                 <Box display="flex" alignItems="center" gap={2} mb={1}>
//                   <Typography variant="subtitle1" component="span" fontWeight="600">
//                     {type === 'orders' && `Commande ${item.refCommande}`}
//                     {type === 'users' && `${item.nomClient}`}
//                     {type === 'produit' && `${item.nomProduit || item.nom}`}
//                   </Typography>
                  
//                   {type === 'orders' && (
//                     <Chip
//                       label={item.statutCommande}
//                       size="small"
//                       color={getStatusColor(item.statutCommande)}
//                       sx={{ borderRadius: 1 }}
//                     />
//                   )}
                  
//                   {type === 'produit' && (
//                     <Chip
//                       label={getStockStatusText(item.stockStatus)}
//                       size="small"
//                       color={getStockStatusColor(item.stockStatus)}
//                       sx={{ borderRadius: 1 }}
//                     />
//                   )}
                  
//                   {item.unread && (
//                     <Circle 
//                       sx={{ 
//                         fontSize: 8, 
//                         color: pulsing ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.7),
//                         transition: 'all 1s ease',
//                         animation: pulsing ? 'pulse 2s infinite' : 'none',
//                       }} 
//                     />
//                   )}
//                 </Box>
//               }
//               secondary={
//                 <Box>
//                   <Typography variant="body2" color="text.secondary" paragraph>
//                     {type === 'orders' && `${item.client?.prenomClient} ${item.client?.nomClient} • ${item.methodePaiement}`}
//                     {type === 'users' && `${item.user?.emailUsers}`}
//                     {type === 'produit' && `Référence: ${item.numProduit || item.reference} • Catégorie: ${item.categorie || 'Non spécifiée'}`}
//                   </Typography>
                  
//                   <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//                     <Box display="flex" alignItems="center" gap={0.5}>
//                       <Schedule fontSize="small" sx={{ opacity: 0.7 }} />
//                       <Typography variant="caption" color="text.secondary">
//                         {formatTimeAgo(
//                           type === 'orders' ? item.dateCommande :
//                           type === 'users' ? item.dateInscription :
//                           item.dateUpdate || item.updatedAt
//                         )}
//                       </Typography>
//                     </Box>
                    
//                     {type === 'orders' && (
//                       <Typography variant="caption" fontWeight="600" color="primary">
//                         {item.montantTotal}€
//                       </Typography>
//                     )}
                    
//                     {type === 'produit' && item.stockProduit !== undefined && (
//                       <Box display="flex" alignItems="center" gap={1}>
//                         <Typography variant="caption" color="text.secondary">
//                           Stock: {item.stockProduit}
//                         </Typography>
//                         {item.stockMinimum && (
//                           <LinearProgress 
//                             variant="determinate" 
//                             value={Math.min(100, (item.stockProduit / item.stockMinimum) * 100)} 
//                             color={item.stockProduit <= item.stockMinimum ? "error" : "warning"}
//                             sx={{ 
//                               width: 60, 
//                               height: 4, 
//                               borderRadius: 2,
//                               transition: 'all 0.3s ease',
//                             }}
//                           />
//                         )}
//                       </Box>
//                     )}
//                   </Box>
//                 </Box>
//               }
//             />
//           </ListItem>
//         </Box>
//       </Grow>
//     );
//   };

//   return (
//     <Container maxWidth="lg" sx={{
//        py: 1 ,
//        px: 0,


//     }}>
//       <Fade in={true} timeout={500}>
//         <Paper 
//           elevation={0}
//           sx={{
//             borderRadius: 3,
//             p: 3,
//             background: theme.palette.mode === 'dark'
//               ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
//               : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
//             backdropFilter: 'blur(10px)',
//             border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//             boxShadow: theme.palette.mode === 'dark'
//               ? `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`
//               : `0 8px 32px ${alpha(theme.palette.grey[300], 0.3)}`,
//           }}
//         >
//           <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
//             <Fade in={true} timeout={800}>
//               <Box display="flex" alignItems="center" gap={3}>
//                 <Badge 
//                   badgeContent={unreadCount} 
//                   color="error"
//                   sx={{
//                     '& .MuiBadge-badge': {
//                       animation: 'pulse 2s infinite',
//                     },
//                   }}
//                 >
//                   <Avatar
//                     sx={{
//                       width: 56,
//                       height: 56,
//                       bgcolor: theme.palette.primary.main,
//                       boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
//                       transition: 'transform 0.3s',
//                       '&:hover': {
//                         transform: 'rotate(10deg)',
//                       },
//                     }}
//                   >
//                     <NotificationsIcon fontSize="large" />
//                   </Avatar>
//                 </Badge>
//                 <Box>
//                   <Typography variant="h4" component="h1" fontWeight="700" sx={{ 
//                     background: theme.palette.mode === 'dark'
//                       ? 'linear-gradient(45deg, #90caf9, #ce93d8)'
//                       : 'linear-gradient(45deg, #1976d2, #7b1fa2)',
//                     WebkitBackgroundClip: 'text',
//                     WebkitTextFillColor: 'transparent',
//                     backgroundClip: 'text',
//                   }}>
//                     Notifications
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     {unreadCount} notification(s) non lue(s)
//                   </Typography>
//                 </Box>
//               </Box>
//             </Fade>
            
//             <Box display="flex" gap={1}>
//               <Tooltip title="Rafraîchir">
//                 <IconButton 
//                   onClick={fetchNotifications}
//                   sx={{
//                     bgcolor: theme.palette.mode === 'dark'
//                       ? alpha(theme.palette.background.paper, 0.5)
//                       : alpha(theme.palette.primary.main, 0.1),
//                     transition: 'transform 0.3s',
//                     '&:hover': {
//                       transform: 'rotate(180deg)',
//                       bgcolor: theme.palette.mode === 'dark'
//                         ? alpha(theme.palette.primary.main, 0.2)
//                         : alpha(theme.palette.primary.main, 0.2),
//                     },
//                   }}
//                 >
//                   <Refresh />
//                 </IconButton>
//               </Tooltip>
              
//               <Button
//                 variant="contained"
//                 startIcon={<CheckCircle />}
//                 onClick={markAllAsRead}
//                 disabled={unreadCount === 0}
//                 sx={{
//                   borderRadius: 2,
//                   textTransform: 'none',
//                   fontWeight: 600,
//                   px: 3,
//                   transition: 'all 0.3s',
//                   '&:hover': {
//                     transform: 'translateY(-2px)',
//                     boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
//                   },
//                 }}
//               >
//                 Tout marquer comme lu
//               </Button>
//             </Box>
//           </Box>

//           <Snackbar
//             open={open}
//             autoHideDuration={5000}
//             onClose={handleClose}
//             anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//             TransitionComponent={Slide}
//           >
//             <Alert 
//               onClose={handleClose} 
//               severity={message.statut} 
//               variant="filled"
//               sx={{ 
//                 borderRadius: 2,
//                 boxShadow: `0 4px 20px ${alpha(theme.palette[message.statut].main, 0.3)}`,
//               }}
//             >
//               {message.texte}
//             </Alert>
//           </Snackbar>

//           {error && (
//             <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
//               <Alert 
//                 severity="error" 
//                 sx={{ 
//                   mb: 3, 
//                   borderRadius: 2,
//                   border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
//                   boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.1)}`,
//                 }}
//                 action={
//                   <Button 
//                     onClick={fetchNotifications} 
//                     color="inherit" 
//                     size="small"
//                     sx={{ fontWeight: 600 }}
//                   >
//                     Réessayer
//                   </Button>
//                 }
//               >
//                 {error}
//               </Alert>
//             </Slide>
//           )}

//           <Tabs 
//             value={activeTab} 
//             onChange={(e, newValue) => setActiveTab(newValue)} 
//             sx={{ 
//               mb: 4,
//               '& .MuiTabs-indicator': {
//                 height: 3,
//                 borderRadius: 3,
//                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//               }
//             }}
//           >
//             <Tab 
//               icon={
//                 <Badge 
//                   badgeContent={notifications.orders.filter(n => n.unread).length} 
//                   color="error"
//                   sx={{ mr: 1 }}
//                 >
//                   <ShoppingCart />
//                 </Badge>
//               }
//               label={
//                 <Typography sx={{ ml: 1, fontWeight: 600 }}>
//                   Commandes
//                 </Typography>
//               }
//               sx={{
//                 borderRadius: 2,
//                 mx: 0.5,
//                 textTransform: 'none',
//                 transition: 'all 0.3s',
//                 '&:hover': {
//                   bgcolor: alpha(theme.palette.primary.main, 0.1),
//                 },
//               }}
//             />
//             <Tab 
//               icon={
//                 <Badge 
//                   badgeContent={notifications.users.filter(n => n.unread).length} 
//                   color="error"
//                   sx={{ mr: 1 }}
//                 >
//                   <PersonAdd />
//                 </Badge>
//               }
//               label={
//                 <Typography sx={{ ml: 1, fontWeight: 600 }}>
//                   Utilisateurs
//                 </Typography>
//               }
//               sx={{
//                 borderRadius: 2,
//                 mx: 0.5,
//                 textTransform: 'none',
//                 transition: 'all 0.3s',
//                 '&:hover': {
//                   bgcolor: alpha(theme.palette.primary.main, 0.1),
//                 },
//               }}
//             />
//             <Tab 
//               icon={
//                 <Badge 
//                   badgeContent={notifications.produit.filter(n => n.unread).length} 
//                   color="error"
//                   sx={{ mr: 1 }}
//                 >
//                   <WarningIcon />
//                 </Badge>
//               }
//               label={
//                 <Typography sx={{ ml: 1, fontWeight: 600 }}>
//                   Produits
//                 </Typography>
//               }
//               sx={{
//                 borderRadius: 2,
//                 mx: 0.5,
//                 textTransform: 'none',
//                 transition: 'all 0.3s',
//                 '&:hover': {
//                   bgcolor: alpha(theme.palette.primary.main, 0.1),
//                 },
//               }}
//             />
//           </Tabs>

//           <Card 
//             variant="outlined"
//             sx={{
//               borderRadius: 3,
//               border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//               background: theme.palette.mode === 'dark'
//                 ? alpha(theme.palette.background.paper, 0.4)
//                 : 'white',
//               overflow: 'hidden',
//               transition: 'all 0.3s',
//               '&:hover': {
//                 boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
//               },
//             }}
//           >
//             <CardContent>
//               {/* Onglet Commandes */}
//               <Slide direction="right" in={activeTab === 0} mountOnEnter unmountOnExit>
//                 <div>
//                   <Typography 
//                     variant="h6" 
//                     gutterBottom 
//                     sx={{ 
//                       display: 'flex', 
//                       alignItems: 'center', 
//                       gap: 1,
//                       mb: 3,
//                       color: theme.palette.primary.main,
//                     }}
//                   >
//                     <ShoppingCart /> 
//                     Nouvelles commandes ({notifications.orders.length})
//                   </Typography>
                  
//                   {loading ? (
//                     <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//                       <CircularProgress />
//                       <Typography sx={{ ml: 2 }}>Chargement des notifications...</Typography>
//                     </Box>
//                   ) : notifications.orders.length === 0 ? (
//                     <Fade in={true}>
//                       <Alert 
//                         severity="info"
//                         sx={{
//                           borderRadius: 2,
//                           border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
//                         }}
//                       >
//                         Aucune nouvelle commande pour le moment
//                       </Alert>
//                     </Fade>
//                   ) : (
//                     <List sx={{ p: 0 }}>
//                       {notifications.orders.map((order, index) => (
//                         <NotificationItem
//                           key={order.refCommande}
//                           item={order}
//                           type="orders"
//                           index={index}
//                         />
//                       ))}
//                     </List>
//                   )}
                  
//                   {notifications.orders.length > 0 && (
//                     <Box display="flex" justifyContent="flex-end" mt={3}>
//                       <Button
//                         variant="outlined"
//                         endIcon={<ArrowForward />}
//                         onClick={() => navigate('/admin/commande')}
//                         sx={{ 
//                           borderRadius: 2, 
//                           textTransform: 'none',
//                           fontWeight: 600,
//                           transition: 'all 0.3s',
//                           '&:hover': {
//                             transform: 'translateX(5px)',
//                             bgcolor: alpha(theme.palette.primary.main, 0.1),
//                           },
//                         }}
//                       >
//                         Voir toutes les commandes
//                       </Button>
//                     </Box>
//                   )}
//                 </div>
//               </Slide>

//               {/* Onglet Utilisateurs */}
//               <Slide direction="right" in={activeTab === 1} mountOnEnter unmountOnExit>
//                 <div>
//                   <Typography 
//                     variant="h6" 
//                     gutterBottom 
//                     sx={{ 
//                       display: 'flex', 
//                       alignItems: 'center', 
//                       gap: 1,
//                       mb: 3,
//                       color: theme.palette.primary.main,
//                     }}
//                   >
//                     <PersonAdd /> 
//                     Nouveaux utilisateurs ({notifications.users.length})
//                   </Typography>
                  
//                   {notifications.users.length === 0 ? (
//                     <Fade in={true}>
//                       <Alert 
//                         severity="info"
//                         sx={{
//                           borderRadius: 2,
//                           border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
//                         }}
//                       >
//                         Aucun nouvel utilisateur pour le moment
//                       </Alert>
//                     </Fade>
//                   ) : (
//                     <List sx={{ p: 0 }}>
//                       {notifications.users.map((user, index) => (
//                         <NotificationItem
//                           key={user.refClient}
//                           item={user}
//                           type="users"
//                           index={index}
//                         />
//                       ))}
//                     </List>
//                   )}
                  
//                   {notifications.users.length > 0 && (
//                     <Box display="flex" justifyContent="flex-end" mt={3}>
//                       <Button
//                         variant="outlined"
//                         endIcon={<ArrowForward />}
//                         onClick={() => navigate('/admin/Users')}
//                         sx={{ 
//                           borderRadius: 2, 
//                           textTransform: 'none',
//                           fontWeight: 600,
//                           transition: 'all 0.3s',
//                           '&:hover': {
//                             transform: 'translateX(5px)',
//                             bgcolor: alpha(theme.palette.primary.main, 0.1),
//                           },
//                         }}
//                       >
//                         Voir tous les utilisateurs
//                       </Button>
//                     </Box>
//                   )}
//                 </div>
//               </Slide>

//               {/* Onglet Produits */}
//               <Slide direction="right" in={activeTab === 2} mountOnEnter unmountOnExit>
//                 <div>
//                   <Typography 
//                     variant="h6" 
//                     gutterBottom 
//                     sx={{ 
//                       display: 'flex', 
//                       alignItems: 'center', 
//                       gap: 1,
//                       mb: 3,
//                       color: theme.palette.primary.main,
//                     }}
//                   >
//                     <WarningIcon /> 
//                     Alertes Stock Produits ({notifications.produit.length})
//                   </Typography>
                  
//                   {notifications.produit.length === 0 ? (
//                     <Fade in={true}>
//                       <Alert 
//                         severity="info"
//                         sx={{
//                           borderRadius: 2,
//                           border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
//                         }}
//                       >
//                         Aucune alerte de stock pour le moment
//                       </Alert>
//                     </Fade>
//                   ) : (
//                     <List sx={{ p: 0 }}>
//                       {notifications.produit.map((product, index) => (
//                         <NotificationItem
//                           key={product.numProduit || product.reference}
//                           item={product}
//                           type="produit"
//                           index={index}
//                         />
//                       ))}
//                     </List>
//                   )}
                  
//                   {notifications.produit.length > 0 && (
//                     <Box display="flex" justifyContent="flex-end" mt={3}>
//                       <Button
//                         variant="outlined"
//                         endIcon={<ArrowForward />}
//                         onClick={() => navigate('/admin/products')}
//                         sx={{ 
//                           borderRadius: 2, 
//                           textTransform: 'none',
//                           fontWeight: 600,
//                           transition: 'all 0.3s',
//                           '&:hover': {
//                             transform: 'translateX(5px)',
//                             bgcolor: alpha(theme.palette.primary.main, 0.1),
//                           },
//                         }}
//                       >
//                         Voir tous les produits
//                       </Button>
//                     </Box>
//                   )}
//                 </div>
//               </Slide>
//             </CardContent>
//           </Card>

//           <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
//             <Typography variant="body2" color="text.secondary">
//               <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Schedule fontSize="small" />
//                 Les notifications sont rafraîchies automatiquement
//               </Box>
//             </Typography>
            
//             <Chip
//               label={`${unreadCount} non lue(s)`}
//               color={unreadCount > 0 ? "primary" : "default"}
//               variant={unreadCount > 0 ? "filled" : "outlined"}
//               sx={{ 
//                 fontWeight: 600,
//                 animation: unreadCount > 0 ? 'pulse 3s infinite' : 'none',
//               }}
//             />
//           </Box>
//         </Paper>
//       </Fade>

//       <style>
//         {`
//           @keyframes pulse {
//             0% { 
//               transform: scale(1); 
//               opacity: 1;
//             }
//             50% { 
//               transform: scale(1.05); 
//               opacity: 0.8;
//             }
//             100% { 
//               transform: scale(1); 
//               opacity: 1;
//             }
//           }
          
//           .MuiBadge-badge {
//             animation: pulse 2s infinite;
//           }
//         `}
//       </style>
//     </Container>
//   );
// };

// export default NotificationPage;
// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Card, 
//   CardContent, 
//   Typography, 
//   List, 
//   ListItem, 
//   ListItemText, 
//   ListItemAvatar, 
//   Avatar, 
//   Badge, 
//   IconButton, 
//   Chip, 
//   Box, 
//   Tabs, 
//   Tab,
//   Paper,
//   Button,
//   Divider,
//   Tooltip,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   LinearProgress
// } from '@mui/material';
// import {
//   ShoppingCart,
//   PersonAdd,
//   Warning as WarningIcon,
//   Notifications as NotificationsIcon,
//   CheckCircle,
//   RemoveRedEye,
//   Refresh,
//   ArrowForward,
//   LocalShipping,
//   Inventory,
//   Schedule,
//   TrendingUp,
//   Error as ErrorIcon
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { getNotification } from '@/services/AdminService';
// import { useSearch } from "../../contexts/SearchContext";

// const NotificationPage = () => {
//   const [notifications, setNotifications] = useState({
//     orders: [],
//     users: [],
//     produit: []
//   });
//   const { setNbrNotification } = useSearch();
//   const [activeTab, setActiveTab] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);
//   const [message, setMessage] = useState({
//     ouvre: false,
//     texte: "vide",
//     statut: "success",
//   });

//   const fetchNotifications = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const donnes = await getNotification();
      
//       if (donnes.data) {
//         console.log("Notification reçue: ",donnes.data)
//         setNotifications({
//           orders: donnes.data.notifications.commandeNotifie || [],
//           users: donnes.data.notifications.clientNotifie || [],
//           produit: donnes.data.notifications.produitNotifie || []
//         });
        
//         // Calculer le nombre de notifications non lues
//         const totalUnread = [
//           ...(donnes.data.notifications.commandeNotifie || []).filter(n => n.unread),
//           ...(donnes.data.notifications.clientNotifie || []).filter(n => n.unread),
//           ...(donnes.data.notifications.produitNotifie || []).filter(n => n.unread),
//         ].length;
//         setUnreadCount(totalUnread);
//         setNbrNotification(totalUnread);
//         setLoading(false);
//       } else {
//         setMessage({
//           ouvre: true,
//           texte: "Erreur de récupération des notifications! ",
//           statut: donnes.statut || "error",
//         });
//         console.log("Erreur de récupération des notifications : " + donnes.error,)
//         setOpen(true);
//         setError("Erreur de récupération des notifications! ")
//         setLoading(false);
//       }
//       setLoading(false);
//     } catch (err) {
//       setError('Erreur lors du chargement des notifications');
//       console.error("Erreur lors du chargement des notifications(Try/Catch)", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [setNbrNotification]);

//   // useEffect(() => {
//   //   fetchNotifications();
    
//   //   // Rafraîchir toutes les 30 secondes
//   //   const interval = setInterval(fetchNotifications, 30000);
    
//   //   return () => clearInterval(interval);
//   // }, [fetchNotifications]);

//       useEffect(() => {
//         fetchNotifications();
//       }, []);

//   const markAsRead = (type, id) => {
//     setNotifications(prev => ({
//       ...prev,
//       [type]: prev[type].map(item => 
//         item.id === id ? { ...item, unread: false } : item
//       )
//     }));
    
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   const markAllAsRead = () => {
//     setNotifications(prev => ({
//       orders: prev.orders.map(item => ({ ...item, unread: false })),
//       users: prev.users.map(item => ({ ...item, unread: false })),
//       produit: prev.produit.map(item => ({ ...item, unread: false })),
//     }));
//     setUnreadCount(0);
//   };

//   const handleViewOrder = (commande) => {
//     markAsRead('orders', commande.id);
//     navigate("/admin/ficheCommande", { state: commande });
//   };

//   const handleViewUser = (user) => {
//     markAsRead('users', user.id);
//     navigate("/admin/Users", { state: user });
//   };

//   const handleViewProduct = (product) => {
//     markAsRead('produit', product.id);
//     navigate("/admin/products", { state: product });
//   };

//   const getStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'nouveau': return 'primary';
//       case 'en traitement': return 'warning';
//       case 'expédiée': return 'info';
//       case 'livrée': return 'success';
//       default: return 'default';
//     }
//   };

//   const getStockStatusColor = (stockStatus) => {
//     switch(stockStatus?.toLowerCase()) {
//       case 'rupture': return 'error';
//       case 'critique': return 'error';
//       case 'alerte': return 'warning';
//       default: return 'default';
//     }
//   };

//   const getStockStatusText = (stockStatus) => {
//     switch(stockStatus?.toLowerCase()) {
//       case 'rupture': return 'Rupture de stock';
//       case 'critique': return 'Stock critique';
//       case 'alerte': return 'Stock faible';
//       default: return stockStatus;
//     }
//   };

//   const formatTimeAgo = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);

//       if (diffMins < 60) {
//         return `Il y a ${diffMins} min`;
//       } else if (diffHours < 24) {
//         return `Il y a ${diffHours} h`;
//       } else {
//         return `Il y a ${diffDays} j`;
//       }
//     } catch (e) {
//       return "Date inconnue";
//     }
//   };

//   const handleClose = (event, reason) => {
//     if (reason === "clickaway") {
//       return;
//     }
//     setOpen(false);
//   };

  

//   return (
//     <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box display="flex" alignItems="center" gap={2}>
//           <Badge badgeContent={unreadCount} color="error">
//             <NotificationsIcon color="primary" fontSize="large" />
//           </Badge>
//           <Typography variant="h4" component="h1">
//             Notifications
//           </Typography>
//         </Box>
        
//         <Box display="flex" gap={1}>
//           <Tooltip title="Rafraîchir">
//             <IconButton onClick={fetchNotifications}>
//               <Refresh />
//             </IconButton>
//           </Tooltip>
//           <Button
//             variant="outlined"
//             startIcon={<CheckCircle />}
//             onClick={markAllAsRead}
//             disabled={unreadCount === 0}
//           >
//             Tout marquer comme lu
//           </Button>
//         </Box>
//       </Box>

//       <Snackbar
//         open={open}
//         autoHideDuration={5000}
//         onClose={handleClose}
//       >
//         <Alert onClose={handleClose} severity={message.statut} variant="filled">
//           {message.texte}
//         </Alert>
//       </Snackbar>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//           <Button onClick={fetchNotifications} sx={{ ml: 2 }} size="small">
//             Réessayer
//           </Button>
//         </Alert>
//       )}
//         <Tabs 
//           value={activeTab} 
//           onChange={(e, newValue) => setActiveTab(newValue)} 
//           sx={{ mb: 3 }}
//         >
//           <Tab 
//             label={
//               <Badge badgeContent={notifications.orders.filter(n => n.unread).length} color="error">
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <ShoppingCart />
//                   <span>Commandes</span>
//                 </Box>
//               </Badge>
//             } 
//           />
//           <Tab 
//             label={
//               <Badge badgeContent={notifications.users.filter(n => n.unread).length} color="error">
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <PersonAdd />
//                   <span>Utilisateurs</span>
//                 </Box>
//               </Badge>
//             } 
//           />
//           <Tab 
//             label={
//               <Badge badgeContent={notifications.produit.filter(n => n.unread).length} color="error">
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <WarningIcon />
//                   <span>Produits</span>
//                 </Box>
//               </Badge>
//             } 
//           />
//         </Tabs>

//       <Card variant="outlined">
//         <CardContent>
//           {/* Onglet Commandes */}
//           {activeTab === 0 && (
//             <>
//               <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <ShoppingCart /> Nouvelles commandes ({notifications.orders.length})
//               </Typography>
              
//             {loading ? (
//               <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//                 <CircularProgress />
//                 <span className='ml-4'> Chargement des notifications...</span>
//               </Box>
//             ) : (
//               notifications.orders.length === 0 ? (
//                 <Alert severity="info">
//                   Aucune nouvelle commande pour le moment
//                 </Alert>
//               ) : (
//                 <List>
//                   {notifications.orders.map((order) => (
//                     <React.Fragment key={order.refCommande}>
//                       <ListItem
//                         alignItems="flex-start"
//                         sx={{
//                           bgcolor: order.unread ? 'action.hover' : 'transparent',
//                           borderRadius: 1,
//                           mb: 1
//                         }}
//                         secondaryAction={
//                           <Box display="flex" gap={1}>
//                             <Tooltip title="Voir les détails">
//                               <IconButton edge="end" onClick={() => handleViewOrder(order)}>
//                                 <RemoveRedEye />
//                               </IconButton>
//                             </Tooltip>
//                             {order.unread && (
//                               <Tooltip title="Marquer comme lu">
//                                 <IconButton edge="end" onClick={() => markAsRead('orders', order.refCommande)}>
//                                   <CheckCircle />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </Box>
//                         }
//                       >
//                         <ListItemAvatar>
//                           <Avatar sx={{ bgcolor: order.unread ? 'primary.main' : 'grey.400' }}>
//                             {order.unread ? <TrendingUp /> : <LocalShipping />}
//                           </Avatar>
//                         </ListItemAvatar>
//                         <ListItemText
//                           primary={
//                             <Box display="flex" alignItems="center" gap={2}>
//                               <Typography variant="subtitle1" component="span" fontWeight="bold">
//                                 Commande {order.refCommande}
//                               </Typography>
//                               <Chip
//                                 label={order.statutCommande}
//                                 size="small"
//                                 color={getStatusColor(order.statutCommande)}
//                               />
//                               {order.unread && (
//                                 <Chip label="Nouveau" size="small" color="primary" variant="outlined" />
//                               )}
//                             </Box>
//                           }
//                           secondary={
//                             <>
//                               <Typography component="span" variant="body2" color="text.primary">
//                                 {order.client?.prenomClient} {order.client?.nomClient} • {order.methodePaiement}
//                               </Typography>
//                               <br />
//                               <Typography component="span" variant="body2" color="text.secondary">
//                                 <Box component="span" display="flex" alignItems="center" gap={0.5}>
//                                   <Schedule fontSize="small" />
//                                   {formatTimeAgo(order.dateCommande)} • Total: {order.montantTotal}€
//                                 </Box>
//                               </Typography>
//                             </>
//                           }
//                         />
//                       </ListItem>
//                       <Divider variant="inset" component="li" />
//                     </React.Fragment>
//                   ))}
//                 </List>
//               )
//             )}
              
//               {notifications.orders.length > 0 && (
//                 <Box display="flex" justifyContent="flex-end" mt={2}>
//                   <Button
//                     endIcon={<ArrowForward />}
//                     onClick={() => navigate('/admin/commande')}
//                   >
//                     Voir toutes les commandes
//                   </Button>
//                 </Box>
//               )}
//             </>
//           )}

//           {/* Onglet Utilisateurs */}
//           {activeTab === 1 && (
//             <>
//               <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <PersonAdd /> Nouveaux utilisateurs ({notifications.users.length})
//               </Typography>
              
//               {notifications.users.length === 0 ? (
//                 <Alert severity="info">
//                   Aucun nouvel utilisateur pour le moment
//                 </Alert>
//               ) : (
//                 <List>
//                   {notifications.users.map((user) => (
//                     <React.Fragment key={user.refClient}>
//                       <ListItem
//                         alignItems="flex-start"
//                         sx={{
//                           bgcolor: user.unread ? 'action.hover' : 'transparent',
//                           borderRadius: 1,
//                           mb: 1
//                         }}
//                         secondaryAction={
//                           <Box display="flex" gap={1}>
//                             <Tooltip title="Voir le profil">
//                               <IconButton edge="end" onClick={() => handleViewUser(user)}>
//                                 <RemoveRedEye />
//                               </IconButton>
//                             </Tooltip>
//                             {user.unread && (
//                               <Tooltip title="Marquer comme lu">
//                                 <IconButton edge="end" onClick={() => markAsRead('users', user.refClient)}>
//                                   <CheckCircle />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </Box>
//                         }
//                       >
//                         <ListItemAvatar>
//                           <Avatar sx={{ bgcolor: user.unread ? 'success.main' : 'grey.400' }}>
//                             <PersonAdd />
//                           </Avatar>
//                         </ListItemAvatar>
//                         <ListItemText
//                           primary={
//                             <Box display="flex" alignItems="center" gap={2}>
//                               <Typography variant="subtitle1" component="span" fontWeight="bold">
//                                 {user.nomClient}
//                               </Typography>
//                               <Chip
//                                 label={user.user.roleUsers === 'ROLE_ADMIN' ? 'Administrateur' : 'Client'}
//                                 size="small"
//                                 color={user.user.roleUsers === 'ROLE_ADMIN' ? 'secondary' : 'default'}
//                               />
//                               {user.unread && (
//                                 <Chip label="Nouveau" size="small" color="success" variant="outlined" />
//                               )}
//                             </Box>
//                           }
//                           secondary={
//                             <>
//                               <Typography component="span" variant="body2" color="text.primary">
//                                 {user.user.emailUsers}
//                               </Typography>
//                               <br />
//                               <Typography component="span" variant="body2" color="text.secondary">
//                                 <Box component="span" display="flex" alignItems="center" gap={0.5}>
//                                   <Schedule fontSize="small" />
//                                   {formatTimeAgo(user.dateInscription)} • Inscrit le {format(new Date(user.dateInscription), 'dd/MM/yyyy', { locale: fr })}
//                                 </Box>
//                               </Typography>
//                             </>
//                           }
//                         />
//                       </ListItem>
//                       <Divider variant="inset" component="li" />
//                     </React.Fragment>
//                   ))}
//                 </List>
//               )}
              
//               {notifications.users.length > 0 && (
//                 <Box display="flex" justifyContent="flex-end" mt={2}>
//                   <Button
//                     endIcon={<ArrowForward />}
//                     onClick={() => navigate('/admin/Users')}
//                   >
//                     Voir tous les utilisateurs
//                   </Button>
//                 </Box>
//               )}
//             </>
//           )}

//           {/* Onglet Produits */}
//           {activeTab === 2 && (
//             <>
//               <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <WarningIcon /> Alertes Stock Produits ({notifications.produit.length})
//               </Typography>
              
//               {notifications.produit.length === 0 ? (
//                 <Alert severity="info">
//                   Aucune alerte de stock pour le moment
//                 </Alert>
//               ) : (
//                 <List>
//                   {notifications.produit.map((product) => (
//                     <React.Fragment key={product.numProduit}>
//                       <ListItem
//                         alignItems="flex-start"
//                         sx={{
//                           bgcolor: product.unread ? 'white' : 'transparent',
//                           borderRadius: 1,
//                           mb: 1
//                         }}
//                         secondaryAction={
//                           <Box display="flex" gap={1}>
//                             <Tooltip title="Voir le produit">
//                               <IconButton edge="end" onClick={() => handleViewProduct(product)}>
//                                 <RemoveRedEye />
//                               </IconButton>
//                             </Tooltip>
//                             {product.unread && (
//                               <Tooltip title="Marquer comme lu">
//                                 <IconButton edge="end" onClick={() => markAsRead('produit', product.numProduit)}>
//                                   <CheckCircle />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </Box>
//                         }
//                       >
//                         <ListItemAvatar>
//                           <Avatar sx={{ bgcolor: getStockStatusColor(product.stockStatus) }}>
//                             {product.stockStatus === 'rupture' ? <ErrorIcon /> : <WarningIcon />}
//                           </Avatar>
//                         </ListItemAvatar>
//                         <ListItemText
//                           primary={
//                             <Box display="flex" alignItems="center" gap={2}>
//                               <Typography variant="subtitle1" component="span" fontWeight="bold">
//                                 {product.nomProduit || product.nom}
//                               </Typography>
//                               <Chip
//                                 label={getStockStatusText(product.stockStatus)}
//                                 size="small"
//                                 color={getStockStatusColor(product.stockStatus)}
//                               />
//                               {product.unread && (
//                                 <Chip label="Alerte" size="small" color="error" variant="outlined" />
//                               )}
//                             </Box>
//                           }
//                           secondary={
//                             <>
//                               <Typography component="span" variant="body2" color="text.primary">
//                                 Référence: {product.numProduit || product.reference} • 
//                                 Catégorie: {product.categorie || 'Non spécifiée'}
//                               </Typography>
//                               <br />
//                               <Box component="span" display="flex" flexDirection="column" gap={1}>
//                                 <Typography component="span" variant="body2" color="text.secondary">
//                                   <Box component="span" display="flex" alignItems="center" gap={0.5}>
//                                     <Inventory fontSize="small" />
//                                     Stock actuel: <strong>{product.stockProduit}</strong> unités
//                                     {product.stockMinimum && ` (Minimum: ${product.stockMinimum})`}
//                                   </Box>
//                                 </Typography>
//                                 {product.stockMinimum && product.stockProduit && (
//                                   <LinearProgress 
//                                     variant="determinate" 
//                                     value={Math.min(100, (product.stockProduit / product.stockMinimum) * 100)} 
//                                     color={product.stockProduit <= product.stockMinimum ? "error" : "warning"}
//                                     sx={{ width: '100px' }}
//                                   />
//                                 )}
//                                 <Typography component="span" variant="body2" color="text.secondary">
//                                   <Box component="span" display="flex" alignItems="center" gap={0.5}>
//                                     <Schedule fontSize="small" />
//                                     {formatTimeAgo(product.dateUpdate || product.updatedAt)}
//                                   </Box>
//                                 </Typography>
//                               </Box>
//                             </>
//                           }
//                         />
//                       </ListItem>
//                       <Divider variant="inset" component="li" />
//                     </React.Fragment>
//                   ))}
//                 </List>
//               )}
              
//               {notifications.produit.length > 0 && (
//                 <Box display="flex" justifyContent="flex-end" mt={2}>
//                   <Button
//                     endIcon={<ArrowForward />}
//                     onClick={() => navigate('/admin/products')}
//                   >
//                     Voir tous les produits
//                   </Button>
//                 </Box>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>

//       <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="body2" color="text.secondary">
//           Les notifications sont rafraîchies automatiquement toutes les 30 secondes
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           {unreadCount} notification(s) non lue(s)
//         </Typography>
//       </Box>
//     </Paper>
//   );
// };

// export default NotificationPage;

// // import React, { useState, useEffect, useCallback } from 'react';
// // import { 
// //   Card, 
// //   CardContent, 
// //   Typography, 
// //   List, 
// //   ListItem, 
// //   ListItemText, 
// //   ListItemAvatar, 
// //   Avatar, 
// //   Badge, 
// //   IconButton, 
// //   Chip, 
// //   Box, 
// //   Tabs, 
// //   Tab,
// //   Paper,
// //   Button,
// //   Divider,
// //     FaExclamationTriangle,
// //   Tooltip,
// //   CircularProgress,
// //   Alert
// // } from '@mui/material';
// // import {
// //   ShoppingCart,
// //   PersonAdd,
// //   Notifications as NotificationsIcon,
// //   CheckCircle,
// //   RemoveRedEye,
// //   Refresh,
// //   ArrowForward,
// //   LocalShipping,
// //   Payment,
// //   Schedule,
// //   TrendingUp
// // } from '@mui/icons-material';
// // import { useNavigate } from 'react-router-dom';
// // import { format } from 'date-fns';
// // import { fr } from 'date-fns/locale';
// // import { getNotification} from '@/services/AdminService';
// // import { useSearch } from "../../contexts/SearchContext";

// // const simulatedOrders = [
// //   {
// //     id: 1,
// //     refCommande: 'CMD-2024-001',
// //     client: {
// //       nomClient: 'Dupont',
// //       prenomClient: 'Jean',
// //       telephoneClient: '0123456789'
// //     },
// //     dateCommande: new Date(Date.now() - 3600000), // 1 heure ago
// //     statutCommande: 'Nouveau',
// //     methodePaiement: 'Carte Bancaire',
// //     montantTotal: '249.99',
// //     unread: true
// //   },
// //   {
// //     id: 2,
// //     refCommande: 'CMD-2024-002',
// //     client: {
// //       nomClient: 'Martin',
// //       prenomClient: 'Sophie',
// //       telephoneClient: '0987654321'
// //     },
// //     dateCommande: new Date(Date.now() - 7200000), // 2 heures ago
// //     statutCommande: 'En traitement',
// //     methodePaiement: 'PayPal',
// //     montantTotal: '149.50',
// //     unread: true
// //   },
// //   {
// //     id: 3,
// //     refCommande: 'CMD-2024-003',
// //     client: {
// //       nomClient: 'Leroy',
// //       prenomClient: 'Pierre',
// //       telephoneClient: '0678901234'
// //     },
// //     dateCommande: new Date(Date.now() - 86400000), // 1 jour ago
// //     statutCommande: 'Nouveau',
// //     methodePaiement: 'Virement',
// //     montantTotal: '89.99',
// //     unread: false
// //   }
// // ];

// // const simulatedUsers = [
// //   {
// //     id: 1,
// //     nomUsers: 'Bernard',
// //     emailUsers: 'bernard@email.com',
// //     dateInscription: new Date(Date.now() - 3600000), // 1 heure ago
// //     roleUsers: 'ROLE_CLIENT',
// //     unread: true
// //   },
// //   {
// //     id: 2,
// //     nomUsers: 'Petit',
// //     emailUsers: 'petit@email.com',
// //     dateInscription: new Date(Date.now() - 10800000), // 3 heures ago
// //     roleUsers: 'ROLE_CLIENT',
// //     unread: true
// //   },
// //   {
// //     id: 3,
// //     nomUsers: 'Robert',
// //     emailUsers: 'robert@email.com',
// //     dateInscription: new Date(Date.now() - 172800000), // 2 jours ago
// //     roleUsers: 'ROLE_ADMIN',
// //     unread: false
// //   }
// // ];

// // const NotificationPage = () => {
// //   const [notifications, setNotifications] = useState({
// //     orders: [],
// //     users: [],
// //     produit: []
// //   });
// //   const { setNbrNotification} = useSearch();
// //   const [activeTab, setActiveTab] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [unreadCount, setUnreadCount] = useState(0);
// //   const navigate = useNavigate();
// //       const [open, setOpen] = useState(false);
// //       const [message, setMessage] = useState({
// //           ouvre: false,
// //           texte: "vide",
// //           statut: "success",
// //       });

  
// //   const fetchNotifications = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);
// //       const donnes = await getNotification()
// //       if(donnes.data){
// //         setNotifications({
// //           orders: donnes.data.commandeNotifie,
// //           users: donnes.data.clientNotifie,
// //           produit: donnes.data.produitNotifie
// //         });
// //         // Calculer le nombre de notifications non lues
// //         const totalUnread = [
// //           ...donnes.data.commandeNotifie.filter(n => n.unread),
// //           ...donnes.data.clientNotifie.filter(n => n.unread),
// //           ...donnes.data.produitNotifie.filter(n => n.unread),
// //         ].length;
// //         setUnreadCount(totalUnread);
// //         setNbrNotification(totalUnread)
// //       }else{
// //         setMessage({
// //           ouvre: true,
// //           texte: "Erreur de recuperation des notification : "+ donnes.error,
// //           statut: donnes.statut,
// //          });
// //         setOpen(true);
// //         console.log("Erreur de recuperation des notification : ", donnes.error);
// //       }
// //       setLoading(false)
// //     } catch (err) {
// //       setError('Erreur lors du chargement des notifications');
// //       console.log("Erreur lors du chargement des notifications",err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchNotifications();
    
// //     // Rafraîchir toutes les 30 secondes pour de nouvelles notifications
// //     const interval = setInterval(fetchNotifications, 30000);
    
// //     return () => clearInterval(interval);
// //   }, [fetchNotifications]);

// //   const markAsRead = (type, id) => {
// //     setNotifications(prev => ({
// //       ...prev,
// //       [type]: prev[type].map(item => 
// //         item.id === id ? { ...item, unread: false } : item
// //       )
// //     }));
    
// //     // Mettre à jour le compteur
// //     setUnreadCount(prev => Math.max(0, prev - 1));
// //   };

// //   const markAllAsRead = () => {
// //     setNotifications(prev => ({
// //       orders: prev.orders.map(item => ({ ...item, unread: false })),
// //       users: prev.users.map(item => ({ ...item, unread: false })),
// //       produit: prev.produit.map(item => ({ ...item, unread: false })),
// //     }));
// //     setUnreadCount(0);
// //   };

// //   const handleViewOrder = (commande) => {
// //     markAsRead('orders', commande);
// //     navigate("/admin/ficheCommande",{state: commande});
// //   };

// //   const handleViewUser = (userId) => {
// //     markAsRead('users', userId);
// //     navigate(`admin/Users`,{state: userId});
// //   };

// //   const getStatusColor = (status) => {
// //     switch(status) {
// //       case 'Nouveau': return 'primary';
// //       case 'En traitement': return 'warning';
// //       case 'Expédiée': return 'info';
// //       case 'Livrée': return 'success';
// //       default: return 'default';
// //     }
// //   };

// //   const formatTimeAgo = (date) => {
// //     const now = new Date();
// //     const diffMs = now - date;
// //     const diffMins = Math.floor(diffMs / 60000);
// //     const diffHours = Math.floor(diffMs / 3600000);
// //     const diffDays = Math.floor(diffMs / 86400000);

// //     if (diffMins < 60) {
// //       return `Il y a ${diffMins} min`;
// //     } else if (diffHours < 24) {
// //       return `Il y a ${diffHours} h`;
// //     } else {
// //       return `Il y a ${diffDays} j`;
// //     }
// //   };

// //   const handleClose = (event, reason) => {
// //     if (reason === "clickaway") {
// //         return;
// //     }
// //     setOpen(false);
// // };

// //   if (loading) {
// //     return (
// //       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
// //         <CircularProgress />
// //         {message.ouvre && (
// //                             <Snackbar
// //                                 open={open}
// //                                 autoHideDuration={5000}
// //                                 onClose={handleClose}
// //                             >
// //                                 <Alert
// //                                     onClose={handleClose}
// //                                     severity={message.statut}
// //                                     variant="filled"
// //                                     sx={{ width: "100%" }}
// //                                 >
// //                                     {message.texte}
// //                                 </Alert>
// //                             </Snackbar>
// //                         )}
// //       </Box>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <Alert severity="error" sx={{ mb: 2 }}>
// //         {error}
// //         <Button onClick={fetchNotifications} sx={{ ml: 2 }} size="small">
// //           Réessayer
// //         </Button>

// //       </Alert>
// //     );
// //   }

// //   return (
// //     <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
// //       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
// //         <Box display="flex" alignItems="center" gap={2}>
// //           <Badge badgeContent={unreadCount} color="error">
// //             <NotificationsIcon color="primary" fontSize="large" />
// //           </Badge>
// //           <Typography variant="h4" component="h1">
// //             Notifications
// //           </Typography>
// //         </Box>
        
// //         <Box display="flex" gap={1}>
// //           <Tooltip title="Rafraîchir">
// //             <IconButton onClick={fetchNotifications}>
// //               <Refresh />
// //             </IconButton>
// //           </Tooltip>
// //           <Button
// //             variant="outlined"
// //             startIcon={<CheckCircle />}
// //             onClick={markAllAsRead}
// //             disabled={unreadCount === 0}
// //           >
// //             Tout marquer comme lu
// //           </Button>
// //         </Box>
// //       </Box>
// //     {message.ouvre && (
// //                         <Snackbar
// //                             open={open}
// //                             autoHideDuration={5000}
// //                             onClose={handleClose}
// //                         >
// //                             <Alert
// //                                 onClose={handleClose}
// //                                 severity={message.statut}
// //                                 variant="filled"
// //                                 sx={{ width: "100%" }}
// //                             >
// //                                 {message.texte}
// //                             </Alert>
// //                         </Snackbar>
// //                     )}
// //       <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
// //         <Tab 
// //           label={
// //             <Badge badgeContent={notifications.orders.filter(n => n.unread).length} color="error">
// //               <Box display="flex" alignItems="center" gap={1}>
// //                 <ShoppingCart />
// //                 <span>Commandes</span>
// //               </Box>
// //             </Badge>
// //           } 
// //         />
// //         <Tab 
// //           label={
// //             <Badge badgeContent={notifications.users.filter(n => n.unread).length} color="error">
// //               <Box display="flex" alignItems="center" gap={1}>
// //                 <PersonAdd />
// //                 <span>Utilisateurs</span>
// //               </Box>
// //             </Badge>
// //           } 
// //         />
// //         <Tab 
// //           label={
// //             <Badge badgeContent={notifications.produit.filter(n => n.unread).length} color="error">
// //               <Box display="flex" alignItems="center" gap={1}>
// //                 <FaExclamationTriangle />
// //                 <span>Produits</span>
// //               </Box>
// //             </Badge>
// //           } 
// //         />
// //       </Tabs>

// //       <Card variant="outlined">
// //         <CardContent>
// //         {activeTab === 'orders' && (
// //             <>
// //               <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 <ShoppingCart /> Nouvelles commandes ({notifications.orders.length})
// //               </Typography>
              
// //               {notifications.orders.length === 0 ? (
// //                 <Alert severity="info">
// //                   Aucune nouvelle commande pour le moment
// //                 </Alert>
// //               ) : (
// //                 <List>
// //                   {notifications.orders.map((order) => (
// //                     <React.Fragment key={order.id}>
// //                       <ListItem
// //                         alignItems="flex-start"
// //                         sx={{
// //                           bgcolor: order.unread ? 'action.hover' : 'transparent',
// //                           borderRadius: 1,
// //                           mb: 1
// //                         }}
// //                         secondaryAction={
// //                           <Box display="flex" gap={1}>
// //                             <Tooltip title="Voir les détails">
// //                               <IconButton edge="end" onClick={() => handleViewOrder(order.id)}>
// //                                 <RemoveRedEye />
// //                               </IconButton>
// //                             </Tooltip>
// //                             {order.unread && (
// //                               <Tooltip title="Marquer comme lu">
// //                                 <IconButton edge="end" onClick={() => markAsRead('orders', order.id)}>
// //                                   <CheckCircle />
// //                                 </IconButton>
// //                               </Tooltip>
// //                             )}
// //                           </Box>
// //                         }
// //                       >
// //                         <ListItemAvatar>
// //                           <Avatar sx={{ bgcolor: order.unread ? 'primary.main' : 'grey.400' }}>
// //                             {order.unread ? (
// //                               <TrendingUp />
// //                             ) : (
// //                               <LocalShipping />
// //                             )}
// //                           </Avatar>
// //                         </ListItemAvatar>
// //                         <ListItemText
// //                           primary={
// //                             <Box display="flex" alignItems="center" gap={2}>
// //                               <Typography variant="subtitle1" component="span" fontWeight="bold">
// //                                 Commande {order.refCommande}
// //                               </Typography>
// //                               <Chip
// //                                 label={order.statutCommande}
// //                                 size="small"
// //                                 color={getStatusColor(order.statutCommande)}
// //                               />
// //                               {order.unread && (
// //                                 <Chip
// //                                   label="Nouveau"
// //                                   size="small"
// //                                   color="primary"
// //                                   variant="outlined"
// //                                 />
// //                               )}
// //                             </Box>
// //                           }
// //                           secondary={
// //                             <>
// //                               <Typography component="span" variant="body2" color="text.primary">
// //                                 {order.client.prenomClient} {order.client.nomClient} • {order.methodePaiement}
// //                               </Typography>
// //                               <br />
// //                               <Typography component="span" variant="body2" color="text.secondary">
// //                                 <Box component="span" display="flex" alignItems="center" gap={0.5}>
// //                                   <Schedule fontSize="small" />
// //                                   {formatTimeAgo(order.dateCommande)} • Total: {order.montantTotal}€
// //                                 </Box>
// //                               </Typography>
// //                             </>
// //                           }
// //                         />
// //                       </ListItem>
// //                       <Divider variant="inset" component="li" />
// //                     </React.Fragment>
// //                   ))}
// //                 </List>
// //               )}
              
// //               {notifications.orders.length > 0 && (
// //                 <Box display="flex" justifyContent="flex-end" mt={2}>
// //                   <Button
// //                     endIcon={<ArrowForward />}
// //                     onClick={() => navigate('/admin/commande')}
// //                   >
// //                     Voir toutes les commandes
// //                   </Button>
// //                 </Box>
// //               )}
// //             </>
// //         )}
// //         {activeTab === 'users' && (
// //             <>
// //               <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                 <PersonAdd /> Nouveaux utilisateurs ({notifications.users.length})
// //               </Typography>
              
// //               {notifications.users.length === 0 ? (
// //                 <Alert severity="info">
// //                   Aucun nouvel utilisateur pour le moment
// //                 </Alert>
// //               ) : (
// //                 <List>
// //                   {notifications.users.map((user) => (
// //                     <React.Fragment key={user.id}>
// //                       <ListItem
// //                         alignItems="flex-start"
// //                         sx={{
// //                           bgcolor: user.unread ? 'action.hover' : 'transparent',
// //                           borderRadius: 1,
// //                           mb: 1
// //                         }}
// //                         secondaryAction={
// //                           <Box display="flex" gap={1}>
// //                             <Tooltip title="Voir le profil">
// //                               <IconButton edge="end" onClick={() => handleViewUser(user.id)}>
// //                                 <RemoveRedEye />
// //                               </IconButton>
// //                             </Tooltip>
// //                             {user.unread && (
// //                               <Tooltip title="Marquer comme lu">
// //                                 <IconButton edge="end" onClick={() => markAsRead('users', user.id)}>
// //                                   <CheckCircle />
// //                                 </IconButton>
// //                               </Tooltip>
// //                             )}
// //                           </Box>
// //                         }
// //                       >
// //                         <ListItemAvatar>
// //                           <Avatar sx={{ bgcolor: user.unread ? 'success.main' : 'grey.400' }}>
// //                             <PersonAdd />
// //                           </Avatar>
// //                         </ListItemAvatar>
// //                         <ListItemText
// //                           primary={
// //                             <Box display="flex" alignItems="center" gap={2}>
// //                               <Typography variant="subtitle1" component="span" fontWeight="bold">
// //                                 {user.nomUsers}
// //                               </Typography>
// //                               <Chip
// //                                 label={user.roleUsers === 'ROLE_ADMIN' ? 'Administrateur' : 'Client'}
// //                                 size="small"
// //                                 color={user.roleUsers === 'ROLE_ADMIN' ? 'secondary' : 'default'}
// //                               />
// //                               {user.unread && (
// //                                 <Chip
// //                                   label="Nouveau"
// //                                   size="small"
// //                                   color="success"
// //                                   variant="outlined"
// //                                 />
// //                               )}
// //                             </Box>
// //                           }
// //                           secondary={
// //                             <>
// //                               <Typography component="span" variant="body2" color="text.primary">
// //                                 {user.emailUsers}
// //                               </Typography>
// //                               <br />
// //                               <Typography component="span" variant="body2" color="text.secondary">
// //                                 <Box component="span" display="flex" alignItems="center" gap={0.5}>
// //                                   <Schedule fontSize="small" />
// //                                   {formatTimeAgo(user.dateInscription)} • Inscrit le {format(user.dateInscription, 'dd/MM/yyyy', { locale: fr })}
// //                                 </Box>
// //                               </Typography>
// //                             </>
// //                           }
// //                         />
// //                       </ListItem>
// //                       <Divider variant="inset" component="li" />
// //                     </React.Fragment>
// //                   ))}
// //                 </List>
// //               )}
              
// //               {notifications.users.length > 0 && (
// //                 <Box display="flex" justifyContent="flex-end" mt={2}>
// //                   <Button
// //                     endIcon={<ArrowForward />}
// //                     onClick={() => navigate('/admin/Users')}
// //                   >
// //                     Voir tous les utilisateurs
// //                   </Button>
// //                 </Box>
// //               )}
// //             </>
// //         )}
// //         {activeTab === 'produit' && (
// //              <>
            
// //             </>
// //         )}
// //         </CardContent>
// //       </Card>

// //       <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
// //         <Typography variant="body2" color="text.secondary">
// //           Les notifications sont rafraîchies automatiquement toutes les 30 secondes
// //         </Typography>
// //         <Typography variant="body2" color="text.secondary">
// //           {unreadCount} notification(s) non lue(s)
// //         </Typography>
// //       </Box>
// //     </Paper>
// //   );
// // };

// // export default NotificationPage;
