import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { ConfirmPaiement } from '@/services/StripeService';
import { Button, Alert, CircularProgress } from '@mui/material';

export default function CheckoutForm({ refCommande }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          const confirmData = {
            payment_intent_id: paymentIntent.id,
            ref_commande: refCommande
          }
          const result = await ConfirmPaiement(confirmData);
      
          if (result.data) {
            setMessage({ type: 'success', text: 'Paiement réussi ! Redirection...' });
            setTimeout(() => {
              window.location.href = `/payment-success?ref=${refCommande}`;
            }, 1500);
          } else {
            setMessage({ type: 'error', text: 'Erreur lors de la confirmation' });
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Erreur réseau' });
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