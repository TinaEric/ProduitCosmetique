import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios'; // Ou fetch

// 1. Chargez Stripe une seule fois en dehors du composant (avec votre clé publique)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutButton = ({ cartItems }) => {
  const stripe = useStripe();

  const handleCheckout = async () => {
    if (!stripe) {
      console.error("Stripe n'est pas encore chargé.");
      return;
    }

    try {
      // 2. Appel à l'API Symfony pour créer la session
      const response = await axios.post('/api/create-checkout-session', {
        items: cartItems.map(item => ({ 
            price: item.priceId, // Utilisez l'ID de prix créé dans Stripe
            quantity: item.quantity 
        })),
      });

      const { sessionId } = response.data;

      // 3. Redirection de l'utilisateur vers la page Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        console.error(result.error.message);
        // Gérer l'erreur côté UI
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
    }
  };

  return (
    <button 
        onClick={handleCheckout} 
        disabled={!stripe}
        className="button-primary"
    >
      Payer avec Stripe
    </button>
  );
};

export default CheckoutButton;