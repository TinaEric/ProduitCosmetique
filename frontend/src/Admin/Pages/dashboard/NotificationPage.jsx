import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Badge, 
  IconButton, 
  Chip, 
  Box, 
  Tabs, 
  Tab,
  Paper,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import {
  ShoppingCart,
  PersonAdd,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  CheckCircle,
  RemoveRedEye,
  Refresh,
  ArrowForward,
  LocalShipping,
  Inventory,
  Schedule,
  TrendingUp,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getNotification } from '@/services/AdminService';
import { useSearch } from "../../contexts/SearchContext";

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
      
      if (donnes.data) {
        console.log("Notification reçue: ",donnes.data)
        setNotifications({
          orders: donnes.data.notifications.commandeNotifie || [],
          users: donnes.data.notifications.clientNotifie || [],
          produit: donnes.data.notifications.produitNotifie || []
        });
        
        // Calculer le nombre de notifications non lues
        const totalUnread = [
          ...(donnes.data.notifications.commandeNotifie || []).filter(n => n.unread),
          ...(donnes.data.notifications.clientNotifie || []).filter(n => n.unread),
          ...(donnes.data.notifications.produitNotifie || []).filter(n => n.unread),
        ].length;
        setUnreadCount(totalUnread);
        setNbrNotification(totalUnread);
        setLoading(false);
      } else {
        setMessage({
          ouvre: true,
          texte: "Erreur de récupération des notifications! ",
          statut: donnes.statut || "error",
        });
        console.log("Erreur de récupération des notifications : " + donnes.error,)
        setOpen(true);
        setError("Erreur de récupération des notifications! ")
        setLoading(false);
      }
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      console.error("Erreur lors du chargement des notifications(Try/Catch)", err);
    } finally {
      setLoading(false);
    }
  }, [setNbrNotification]);

  // useEffect(() => {
  //   fetchNotifications();
    
  //   // Rafraîchir toutes les 30 secondes
  //   const interval = setInterval(fetchNotifications, 30000);
    
  //   return () => clearInterval(interval);
  // }, [fetchNotifications]);

      useEffect(() => {
        fetchNotifications();
      }, []);

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
    switch(status?.toLowerCase()) {
      case 'nouveau': return 'primary';
      case 'en traitement': return 'warning';
      case 'expédiée': return 'info';
      case 'livrée': return 'success';
      default: return 'default';
    }
  };

  const getStockStatusColor = (stockStatus) => {
    switch(stockStatus?.toLowerCase()) {
      case 'rupture': return 'error';
      case 'critique': return 'error';
      case 'alerte': return 'warning';
      default: return 'default';
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

      if (diffMins < 60) {
        return `Il y a ${diffMins} min`;
      } else if (diffHours < 24) {
        return `Il y a ${diffHours} h`;
      } else {
        return `Il y a ${diffDays} j`;
      }
    } catch (e) {
      return "Date inconnue";
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon color="primary" fontSize="large" />
          </Badge>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Tooltip title="Rafraîchir">
            <IconButton onClick={fetchNotifications}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<CheckCircle />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Tout marquer comme lu
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={message.statut} variant="filled">
          {message.texte}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchNotifications} sx={{ ml: 2 }} size="small">
            Réessayer
          </Button>
        </Alert>
      )}

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)} 
        sx={{ mb: 3 }}
      >
        <Tab 
          label={
            <Badge badgeContent={notifications.orders.filter(n => n.unread).length} color="error">
              <Box display="flex" alignItems="center" gap={1}>
                <ShoppingCart />
                <span>Commandes</span>
              </Box>
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={notifications.users.filter(n => n.unread).length} color="error">
              <Box display="flex" alignItems="center" gap={1}>
                <PersonAdd />
                <span>Utilisateurs</span>
              </Box>
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={notifications.produit.filter(n => n.unread).length} color="error">
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon />
                <span>Produits</span>
              </Box>
            </Badge>
          } 
        />
      </Tabs>

      <Card variant="outlined">
        <CardContent>
          {/* Onglet Commandes */}
          {activeTab === 0 && (
            <>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart /> Nouvelles commandes ({notifications.orders.length})
              </Typography>
              
              {notifications.orders.length === 0 ? (
                <Alert severity="info">
                  Aucune nouvelle commande pour le moment
                </Alert>
              ) : (
                <List>
                  {notifications.orders.map((order) => (
                    <React.Fragment key={order.refCommande}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: order.unread ? 'action.hover' : 'transparent',
                          borderRadius: 1,
                          mb: 1
                        }}
                        secondaryAction={
                          <Box display="flex" gap={1}>
                            <Tooltip title="Voir les détails">
                              <IconButton edge="end" onClick={() => handleViewOrder(order)}>
                                <RemoveRedEye />
                              </IconButton>
                            </Tooltip>
                            {order.unread && (
                              <Tooltip title="Marquer comme lu">
                                <IconButton edge="end" onClick={() => markAsRead('orders', order.refCommande)}>
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: order.unread ? 'primary.main' : 'grey.400' }}>
                            {order.unread ? <TrendingUp /> : <LocalShipping />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="subtitle1" component="span" fontWeight="bold">
                                Commande {order.refCommande}
                              </Typography>
                              <Chip
                                label={order.statutCommande}
                                size="small"
                                color={getStatusColor(order.statutCommande)}
                              />
                              {order.unread && (
                                <Chip label="Nouveau" size="small" color="primary" variant="outlined" />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {order.client?.prenomClient} {order.client?.nomClient} • {order.methodePaiement}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                  <Schedule fontSize="small" />
                                  {formatTimeAgo(order.dateCommande)} • Total: {order.montantTotal}€
                                </Box>
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              {notifications.orders.length > 0 && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/admin/commande')}
                  >
                    Voir toutes les commandes
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* Onglet Utilisateurs */}
          {activeTab === 1 && (
            <>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAdd /> Nouveaux utilisateurs ({notifications.users.length})
              </Typography>
              
              {notifications.users.length === 0 ? (
                <Alert severity="info">
                  Aucun nouvel utilisateur pour le moment
                </Alert>
              ) : (
                <List>
                  {notifications.users.map((user) => (
                    <React.Fragment key={user.refClient}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: user.unread ? 'action.hover' : 'transparent',
                          borderRadius: 1,
                          mb: 1
                        }}
                        secondaryAction={
                          <Box display="flex" gap={1}>
                            <Tooltip title="Voir le profil">
                              <IconButton edge="end" onClick={() => handleViewUser(user)}>
                                <RemoveRedEye />
                              </IconButton>
                            </Tooltip>
                            {user.unread && (
                              <Tooltip title="Marquer comme lu">
                                <IconButton edge="end" onClick={() => markAsRead('users', user.refClient)}>
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: user.unread ? 'success.main' : 'grey.400' }}>
                            <PersonAdd />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="subtitle1" component="span" fontWeight="bold">
                                {user.nomClient}
                              </Typography>
                              <Chip
                                label={user.user.roleUsers === 'ROLE_ADMIN' ? 'Administrateur' : 'Client'}
                                size="small"
                                color={user.user.roleUsers === 'ROLE_ADMIN' ? 'secondary' : 'default'}
                              />
                              {user.unread && (
                                <Chip label="Nouveau" size="small" color="success" variant="outlined" />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {user.user.emailUsers}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                  <Schedule fontSize="small" />
                                  {formatTimeAgo(user.dateInscription)} • Inscrit le {format(new Date(user.dateInscription), 'dd/MM/yyyy', { locale: fr })}
                                </Box>
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              {notifications.users.length > 0 && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/admin/Users')}
                  >
                    Voir tous les utilisateurs
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* Onglet Produits */}
          {activeTab === 2 && (
            <>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon /> Alertes Stock Produits ({notifications.produit.length})
              </Typography>
              
              {notifications.produit.length === 0 ? (
                <Alert severity="info">
                  Aucune alerte de stock pour le moment
                </Alert>
              ) : (
                <List>
                  {notifications.produit.map((product) => (
                    <React.Fragment key={product.numProduit}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: product.unread ? 'white' : 'transparent',
                          borderRadius: 1,
                          mb: 1
                        }}
                        secondaryAction={
                          <Box display="flex" gap={1}>
                            <Tooltip title="Voir le produit">
                              <IconButton edge="end" onClick={() => handleViewProduct(product)}>
                                <RemoveRedEye />
                              </IconButton>
                            </Tooltip>
                            {product.unread && (
                              <Tooltip title="Marquer comme lu">
                                <IconButton edge="end" onClick={() => markAsRead('produit', product.numProduit)}>
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStockStatusColor(product.stockStatus) }}>
                            {product.stockStatus === 'rupture' ? <ErrorIcon /> : <WarningIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="subtitle1" component="span" fontWeight="bold">
                                {product.nomProduit || product.nom}
                              </Typography>
                              <Chip
                                label={getStockStatusText(product.stockStatus)}
                                size="small"
                                color={getStockStatusColor(product.stockStatus)}
                              />
                              {product.unread && (
                                <Chip label="Alerte" size="small" color="error" variant="outlined" />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                Référence: {product.numProduit || product.reference} • 
                                Catégorie: {product.categorie || 'Non spécifiée'}
                              </Typography>
                              <br />
                              <Box component="span" display="flex" flexDirection="column" gap={1}>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                    <Inventory fontSize="small" />
                                    Stock actuel: <strong>{product.stockProduit}</strong> unités
                                    {product.stockMinimum && ` (Minimum: ${product.stockMinimum})`}
                                  </Box>
                                </Typography>
                                {product.stockMinimum && product.stockProduit && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min(100, (product.stockProduit / product.stockMinimum) * 100)} 
                                    color={product.stockProduit <= product.stockMinimum ? "error" : "warning"}
                                    sx={{ width: '100px' }}
                                  />
                                )}
                                <Typography component="span" variant="body2" color="text.secondary">
                                  <Box component="span" display="flex" alignItems="center" gap={0.5}>
                                    <Schedule fontSize="small" />
                                    {formatTimeAgo(product.dateUpdate || product.updatedAt)}
                                  </Box>
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              {notifications.produit.length > 0 && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/admin/products')}
                  >
                    Voir tous les produits
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Les notifications sont rafraîchies automatiquement toutes les 30 secondes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {unreadCount} notification(s) non lue(s)
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationPage;

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
//     FaExclamationTriangle,
//   Tooltip,
//   CircularProgress,
//   Alert
// } from '@mui/material';
// import {
//   ShoppingCart,
//   PersonAdd,
//   Notifications as NotificationsIcon,
//   CheckCircle,
//   RemoveRedEye,
//   Refresh,
//   ArrowForward,
//   LocalShipping,
//   Payment,
//   Schedule,
//   TrendingUp
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { getNotification} from '@/services/AdminService';
// import { useSearch } from "../../contexts/SearchContext";

// const simulatedOrders = [
//   {
//     id: 1,
//     refCommande: 'CMD-2024-001',
//     client: {
//       nomClient: 'Dupont',
//       prenomClient: 'Jean',
//       telephoneClient: '0123456789'
//     },
//     dateCommande: new Date(Date.now() - 3600000), // 1 heure ago
//     statutCommande: 'Nouveau',
//     methodePaiement: 'Carte Bancaire',
//     montantTotal: '249.99',
//     unread: true
//   },
//   {
//     id: 2,
//     refCommande: 'CMD-2024-002',
//     client: {
//       nomClient: 'Martin',
//       prenomClient: 'Sophie',
//       telephoneClient: '0987654321'
//     },
//     dateCommande: new Date(Date.now() - 7200000), // 2 heures ago
//     statutCommande: 'En traitement',
//     methodePaiement: 'PayPal',
//     montantTotal: '149.50',
//     unread: true
//   },
//   {
//     id: 3,
//     refCommande: 'CMD-2024-003',
//     client: {
//       nomClient: 'Leroy',
//       prenomClient: 'Pierre',
//       telephoneClient: '0678901234'
//     },
//     dateCommande: new Date(Date.now() - 86400000), // 1 jour ago
//     statutCommande: 'Nouveau',
//     methodePaiement: 'Virement',
//     montantTotal: '89.99',
//     unread: false
//   }
// ];

// const simulatedUsers = [
//   {
//     id: 1,
//     nomUsers: 'Bernard',
//     emailUsers: 'bernard@email.com',
//     dateInscription: new Date(Date.now() - 3600000), // 1 heure ago
//     roleUsers: 'ROLE_CLIENT',
//     unread: true
//   },
//   {
//     id: 2,
//     nomUsers: 'Petit',
//     emailUsers: 'petit@email.com',
//     dateInscription: new Date(Date.now() - 10800000), // 3 heures ago
//     roleUsers: 'ROLE_CLIENT',
//     unread: true
//   },
//   {
//     id: 3,
//     nomUsers: 'Robert',
//     emailUsers: 'robert@email.com',
//     dateInscription: new Date(Date.now() - 172800000), // 2 jours ago
//     roleUsers: 'ROLE_ADMIN',
//     unread: false
//   }
// ];

// const NotificationPage = () => {
//   const [notifications, setNotifications] = useState({
//     orders: [],
//     users: [],
//     produit: []
//   });
//   const { setNbrNotification} = useSearch();
//   const [activeTab, setActiveTab] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const navigate = useNavigate();
//       const [open, setOpen] = useState(false);
//       const [message, setMessage] = useState({
//           ouvre: false,
//           texte: "vide",
//           statut: "success",
//       });

  
//   const fetchNotifications = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const donnes = await getNotification()
//       if(donnes.data){
//         setNotifications({
//           orders: donnes.data.commandeNotifie,
//           users: donnes.data.clientNotifie,
//           produit: donnes.data.produitNotifie
//         });
//         // Calculer le nombre de notifications non lues
//         const totalUnread = [
//           ...donnes.data.commandeNotifie.filter(n => n.unread),
//           ...donnes.data.clientNotifie.filter(n => n.unread),
//           ...donnes.data.produitNotifie.filter(n => n.unread),
//         ].length;
//         setUnreadCount(totalUnread);
//         setNbrNotification(totalUnread)
//       }else{
//         setMessage({
//           ouvre: true,
//           texte: "Erreur de recuperation des notification : "+ donnes.error,
//           statut: donnes.statut,
//          });
//         setOpen(true);
//         console.log("Erreur de recuperation des notification : ", donnes.error);
//       }
//       setLoading(false)
//     } catch (err) {
//       setError('Erreur lors du chargement des notifications');
//       console.log("Erreur lors du chargement des notifications",err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchNotifications();
    
//     // Rafraîchir toutes les 30 secondes pour de nouvelles notifications
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
    
//     // Mettre à jour le compteur
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
//     markAsRead('orders', commande);
//     navigate("/admin/ficheCommande",{state: commande});
//   };

//   const handleViewUser = (userId) => {
//     markAsRead('users', userId);
//     navigate(`admin/Users`,{state: userId});
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'Nouveau': return 'primary';
//       case 'En traitement': return 'warning';
//       case 'Expédiée': return 'info';
//       case 'Livrée': return 'success';
//       default: return 'default';
//     }
//   };

//   const formatTimeAgo = (date) => {
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 60) {
//       return `Il y a ${diffMins} min`;
//     } else if (diffHours < 24) {
//       return `Il y a ${diffHours} h`;
//     } else {
//       return `Il y a ${diffDays} j`;
//     }
//   };

//   const handleClose = (event, reason) => {
//     if (reason === "clickaway") {
//         return;
//     }
//     setOpen(false);
// };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//         {message.ouvre && (
//                             <Snackbar
//                                 open={open}
//                                 autoHideDuration={5000}
//                                 onClose={handleClose}
//                             >
//                                 <Alert
//                                     onClose={handleClose}
//                                     severity={message.statut}
//                                     variant="filled"
//                                     sx={{ width: "100%" }}
//                                 >
//                                     {message.texte}
//                                 </Alert>
//                             </Snackbar>
//                         )}
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Alert severity="error" sx={{ mb: 2 }}>
//         {error}
//         <Button onClick={fetchNotifications} sx={{ ml: 2 }} size="small">
//           Réessayer
//         </Button>

//       </Alert>
//     );
//   }

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
//     {message.ouvre && (
//                         <Snackbar
//                             open={open}
//                             autoHideDuration={5000}
//                             onClose={handleClose}
//                         >
//                             <Alert
//                                 onClose={handleClose}
//                                 severity={message.statut}
//                                 variant="filled"
//                                 sx={{ width: "100%" }}
//                             >
//                                 {message.texte}
//                             </Alert>
//                         </Snackbar>
//                     )}
//       <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
//         <Tab 
//           label={
//             <Badge badgeContent={notifications.orders.filter(n => n.unread).length} color="error">
//               <Box display="flex" alignItems="center" gap={1}>
//                 <ShoppingCart />
//                 <span>Commandes</span>
//               </Box>
//             </Badge>
//           } 
//         />
//         <Tab 
//           label={
//             <Badge badgeContent={notifications.users.filter(n => n.unread).length} color="error">
//               <Box display="flex" alignItems="center" gap={1}>
//                 <PersonAdd />
//                 <span>Utilisateurs</span>
//               </Box>
//             </Badge>
//           } 
//         />
//         <Tab 
//           label={
//             <Badge badgeContent={notifications.produit.filter(n => n.unread).length} color="error">
//               <Box display="flex" alignItems="center" gap={1}>
//                 <FaExclamationTriangle />
//                 <span>Produits</span>
//               </Box>
//             </Badge>
//           } 
//         />
//       </Tabs>

//       <Card variant="outlined">
//         <CardContent>
//         {activeTab === 'orders' && (
//             <>
//               <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <ShoppingCart /> Nouvelles commandes ({notifications.orders.length})
//               </Typography>
              
//               {notifications.orders.length === 0 ? (
//                 <Alert severity="info">
//                   Aucune nouvelle commande pour le moment
//                 </Alert>
//               ) : (
//                 <List>
//                   {notifications.orders.map((order) => (
//                     <React.Fragment key={order.id}>
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
//                               <IconButton edge="end" onClick={() => handleViewOrder(order.id)}>
//                                 <RemoveRedEye />
//                               </IconButton>
//                             </Tooltip>
//                             {order.unread && (
//                               <Tooltip title="Marquer comme lu">
//                                 <IconButton edge="end" onClick={() => markAsRead('orders', order.id)}>
//                                   <CheckCircle />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </Box>
//                         }
//                       >
//                         <ListItemAvatar>
//                           <Avatar sx={{ bgcolor: order.unread ? 'primary.main' : 'grey.400' }}>
//                             {order.unread ? (
//                               <TrendingUp />
//                             ) : (
//                               <LocalShipping />
//                             )}
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
//                                 <Chip
//                                   label="Nouveau"
//                                   size="small"
//                                   color="primary"
//                                   variant="outlined"
//                                 />
//                               )}
//                             </Box>
//                           }
//                           secondary={
//                             <>
//                               <Typography component="span" variant="body2" color="text.primary">
//                                 {order.client.prenomClient} {order.client.nomClient} • {order.methodePaiement}
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
//               )}
              
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
//         )}
//         {activeTab === 'users' && (
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
//                     <React.Fragment key={user.id}>
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
//                               <IconButton edge="end" onClick={() => handleViewUser(user.id)}>
//                                 <RemoveRedEye />
//                               </IconButton>
//                             </Tooltip>
//                             {user.unread && (
//                               <Tooltip title="Marquer comme lu">
//                                 <IconButton edge="end" onClick={() => markAsRead('users', user.id)}>
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
//                                 {user.nomUsers}
//                               </Typography>
//                               <Chip
//                                 label={user.roleUsers === 'ROLE_ADMIN' ? 'Administrateur' : 'Client'}
//                                 size="small"
//                                 color={user.roleUsers === 'ROLE_ADMIN' ? 'secondary' : 'default'}
//                               />
//                               {user.unread && (
//                                 <Chip
//                                   label="Nouveau"
//                                   size="small"
//                                   color="success"
//                                   variant="outlined"
//                                 />
//                               )}
//                             </Box>
//                           }
//                           secondary={
//                             <>
//                               <Typography component="span" variant="body2" color="text.primary">
//                                 {user.emailUsers}
//                               </Typography>
//                               <br />
//                               <Typography component="span" variant="body2" color="text.secondary">
//                                 <Box component="span" display="flex" alignItems="center" gap={0.5}>
//                                   <Schedule fontSize="small" />
//                                   {formatTimeAgo(user.dateInscription)} • Inscrit le {format(user.dateInscription, 'dd/MM/yyyy', { locale: fr })}
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
//         )}
//         {activeTab === 'produit' && (
//              <>
            
//             </>
//         )}
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
