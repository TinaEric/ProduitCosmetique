import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { usePanier } from "../../context/PanierContext";
import {CommandeAnnuler } from "@/services/ClientService";
import CheckoutForm from '@/Client/Pages/Paiement/CheckoutForm';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import { getcommandeDetails, createPaymentIntent } from '@/services/StripeService';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutStripe() {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [commandeData, setCommandeData] = useState(null);
  const { setItems } = usePanier();
  const [error, setError] = useState(null);
  
  const { refCommande } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!refCommande) {
      setError('Référence de commande manquante');
      setLoading(false);
      return;
    }

    const initPayment = async () => {
      try {
        const commandeResponse = await getcommandeDetails(refCommande);
        if (commandeResponse.data) {
          setCommandeData(commandeResponse.data);
        } else {
          setError('Aucune donnée de commande trouvée');
          console.log('Erreur dans Get Commande: ', commandeResponse);
        }
        const reference = {
          refCommande: refCommande
        }
        const paymentResponse = await createPaymentIntent(reference);

        if (paymentResponse.data) {
          setClientSecret(paymentResponse.data.clientSecret);
        } else {
          setError('Aucune donnée de paiement trouvée');
          console.log('Erreur dans Create Payement: ', paymentResponse);

        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger les informations de paiement');
        setLoading(false);
      }
    };

    initPayment();
  }, [refCommande]);

    
  useEffect(() => {
    // Si stripe.js n'a pas pu être chargé (timeout, réseau, etc.)
    stripePromise.catch(error => {
      console.error("Erreur de chargement de Stripe :", error);
      setError("Erreur de connexion. Veuillez vérifier votre réseau et réessayer.");
    })
  })

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0570de',
    }
  };

  const annulerPaiement = async () => {
    localStorage.removeItem('panier');
    localStorage.removeItem('RefCommande');
    localStorage.removeItem('DataAdresse');
    localStorage.removeItem('methodeLivraison');
    localStorage.removeItem('methodePaiement');
    localStorage.removeItem('dateLivraison')
    setItems([])
    const annule = await CommandeAnnuler(refCommande)
    console.log("Annulation Commande dans Strype:", annule)
    navigate('/Produit')
  }

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <Box className="flex min-h-screen gap-6 items-center justify-center bg-gray-100 dark:bg-slate-900">
        <CircularProgress />
        <Typography className="ml-4">Chargement du paiement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
          <span className='text-black dark:text-white'>{error}</span>
          <button 
            onClick={annulerPaiement}
            className="btn btn-outline btn-wide"
          >
            Annuler mes commandes
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4">
        <Typography variant="h4" className="mb-6 text-center font-bold text-gray-800 dark:text-white">
          Paiement sécurisé
        </Typography>

        {/* Récapitulatif commande */}
        <Box className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
          <Typography variant="h6" className="mb-4 font-bold">
            Récapitulatif de la commande
          </Typography>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Référence:</span>
              <span className="font-mono">{refCommande}</span>
            </div>
            {commandeData && (
              <>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">
                    {commandeData.montantTotal?.toFixed(2) || '0.00'} Ar
                  </span>
                </div>
              </>
            )}
          </div>
        </Box>

        {/* Formulaire Stripe */}
        {clientSecret && (
          <Box className="rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm refCommande={refCommande} />
            </Elements>
          </Box>
        )}
      </div>
    </div>
  );
}
