<?php
namespace App\Service;

use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeService
{
    public function __construct(string $secretKey)
    {
        // Initialiser Stripe avec la clé secrète
        Stripe::setApiKey($secretKey);
    }

    public function createCheckoutSession(array $lineItems, string $mode, string $successUrl, string $cancelUrl): Session
    {
        return Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => $mode, // 'payment' pour un achat unique ou 'subscription'
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}', // Ajouter l'ID pour la validation future
            'cancel_url' => $cancelUrl,
            // Optionnel : ajouter l'ID de votre commande interne
            // 'client_reference_id' => $internalOrderId,
        ]);
    }
}