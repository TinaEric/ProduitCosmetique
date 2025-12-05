<?php

namespace App\Service;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeService
{
    private string $secretKey;
    private string $webhookSecret;

    public function __construct(string $secretKey, string $webhookSecret)
    {
        $this->secretKey = $secretKey;
        $this->webhookSecret = $webhookSecret;
        Stripe::setApiKey($this->secretKey);
    }

    public function createPaymentIntent(int $amount, string $currency = 'eur', array $metadata = []): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $amount, // Montant en centimes (ex: 1000 = 10.00€)
            'currency' => $currency,
            'metadata' => $metadata,
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);
    }

    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return PaymentIntent::retrieve($paymentIntentId);
    }

    public function verifyWebhookSignature(string $payload, string $signature): \Stripe\Event
    {
        return Webhook::constructEvent($payload, $signature, $this->webhookSecret);
    }
}