import React, { useState,useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CommandeAnnuler } from "@/services/ClientService";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ConfirmPaiement } from '@/services/StripeService';
import { Button, Alert, CircularProgress } from '@mui/material';

export default function CheckoutForm({ refCommande }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


 const annulerPaiement = async () => {
    localStorage.removeItem('panier');
    localStorage.removeItem('RefCommande');
    localStorage.removeItem('DataAdresse');
    localStorage.removeItem('methodeLivraison');
    localStorage.removeItem('methodePaiement');
    localStorage.removeItem('dateLivraison')
    // setItems([]);
    const annule = await CommandeAnnuler(refCommande)
    console.log("Annulation Commande dans Strype:", annule)
    navigate('/Produit')
  }

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!stripe || !elements) {
        return;
      }
      setIsLoading(true);
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?ref=${refCommande}`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
        console.log( "Erreur dans PaimentIntent: ",error)
        setIsLoading(false);
         await CommandeAnnuler(refCommande)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          try {
            const confirmData = {
              payment_intent_id: paymentIntent.id,
              ref_commande: refCommande
            }
            console.log("Data Envoyer au backend pour Confirm Commande: ", confirmData)
            const result = await ConfirmPaiement(confirmData);
            if (result.data) {
              setMessage({ type: 'success', text: 'Paiement réussi ! Redirection...' });
              console.log("Confirm paiement TERMINE!")
              console.log('✓ Email envoyé:', result.data.email_sent);
              console.log('✓ Email Eror:', result.data.email_error);
              setTimeout(() => {
                navigate(`/payment-success?ref=${refCommande}`)
              }, 2000);
            } else {
              console.log("Erreur dans Confirme Paiemt: ",result.error)
              setMessage({ type: 'error', text: 'Erreur lors de la confirmation' });
            }
          } catch (err) {
            setMessage({ type: 'error', text: 'Erreur réseau' });
            console.log("Erreur pour la confirm Paiement (Try/Catch) :", err)
          }
        setIsLoading(false);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <PaymentElement />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isLoading || !stripe || !elements}
        className="h-12 text-lg"
      >
        {isLoading ? (
          <>
            <CircularProgress size={20} className="mr-2" />
            Traitement...
          </>
        ) : (
          'Payer maintenant'
        )}
      </Button>

      
      {message && (
        <Alert severity={message.type}>
          {message.text}
        </Alert>
      )}

      <div className="text-center text-sm text-gray-500">
        🔒 Paiement 100% sécurisé par Stripe
      </div>
    </form>
  );
}