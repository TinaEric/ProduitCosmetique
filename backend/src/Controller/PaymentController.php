<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use App\Service\StripeService;

class PaymentController extends AbstractController
{
    #[Route('/api/create-checkout-session', name: 'create_checkout_session', methods: ['POST'])]
    public function createCheckoutSession(Request $request, StripeService $stripeService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $items = $data['items'] ?? []; // Ex: [{ price_id: 'price_xyz', quantity: 1 }]

        // NOTE : Il est crucial de valider et déterminer le prix des produits
        // Côté Symfony pour éviter la manipulation des prix côté client !

        $successUrl = $this->generateUrl('payment_success_route', [], UrlGeneratorInterface::ABSOLUTE_URL);
        $cancelUrl = $this->generateUrl('payment_cancel_route', [], UrlGeneratorInterface::ABSOLUTE_URL);

        try {
            $session = $stripeService->createCheckoutSession($items, 'payment', $successUrl, $cancelUrl);

            // Retourner l'ID de la session au frontend
            return new JsonResponse(['sessionId' => $session->id]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    // Créez des routes "dummy" pour les URLs de redirection de Stripe (elles seront gérées par React)
    #[Route('/payment/success', name: 'payment_success_route')]
    public function paymentSuccess(): JsonResponse { return new JsonResponse(['status' => 'success']); }

    #[Route('/payment/cancel', name: 'payment_cancel_route')]
    public function paymentCancel(): JsonResponse { return new JsonResponse(['status' => 'cancel']); }
}