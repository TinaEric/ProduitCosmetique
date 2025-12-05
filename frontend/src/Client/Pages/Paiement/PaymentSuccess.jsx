import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card } from '@mui/material';
import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refCommande = searchParams.get('ref');

  useEffect(() => {
    // Nettoyer le localStorage après paiement réussi
    localStorage.removeItem('panier');
    localStorage.removeItem('RefCommande');
    localStorage.removeItem('DataAdresse');
    localStorage.removeItem('methodeLivraison');
    localStorage.removeItem('methodePaiement');
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
      <Card className="max-w-md p-8 text-center shadow-2xl">
        <FaCheckCircle className="mx-auto mb-4 text-6xl text-green-500" />
        
        <Typography variant="h4" className="mb-4 font-bold text-gray-800 dark:text-white">
          Paiement réussi !
        </Typography>
        
        <Typography className="mb-6 text-gray-600 dark:text-gray-300">
          Votre commande <strong>{refCommande}</strong> a été confirmée.
          Un email de confirmation vous a été envoyé.
        </Typography>

        <Box className="space-y-3">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/MesCommande')}
          >
            Voir mes commandes
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Card>
      </div>
  );
}