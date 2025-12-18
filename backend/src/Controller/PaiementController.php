<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Entity\Paiement;
use App\Repository\CommandeRepository;
use App\Repository\PaiementRepository;
use App\Service\CommandeEmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Stripe\Stripe;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Stripe\PaymentIntent;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/payment')]
class PaiementController extends AbstractController
{
    private MailerInterface $mailer;
    public function __construct(
        MailerInterface $mailer,
        private EntityManagerInterface $entityManager,
        private CommandeRepository $commandeRepository,
        private CommandeEmailService $emailService  
    ) {
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);
        $this->mailer = $mailer;
    }


    #[Route('/getAllPaiement', name: 'getAllPaiement', methods: ['GET'])]
    public function getAllPaiement(PaiementRepository $paie, SerializerInterface $serializer): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        try {
            $paiement = $paie->findAllWithCommande();

            if(!$paiement){
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Paiement non trouvé ',
                        'status' => 'error'
                    ],
                    'status' => 'error'
                ], 404);
            }

            $data = $serializer->serialize($paiement, 'json', [
                'groups' => ['paiement:read', 'commande:read'],
                'circular_reference_handler' => function ($object) {
                    return $object->getId();
                }
            ]);
            
            return new JsonResponse([
                'message' => 'ok, efa io aby',
                'data' =>  $paiement,
                'status' => 'success'
            ],200);
        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur lors du chargement des commandes details: ' .  $e->getMessage(),
                    'status' => 'error'
                ],
                'status' => 'error'
            ], 500);
        }
    }
    #[Route('/create-payment-intent', name: 'create_payment_intent', methods: ['POST'])]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Récupérer la commande
            $refCommande = $data['refCommande'] ?? null;
            $commande = $this->commandeRepository->find($refCommande);
            
            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Commande introuvable',
                        'status' => 'error'
                    ]
                ], 404);
            } 
            
            // Calculer le montant total (paniers + frais de livraison)
            $montantTotal = 0;
            foreach ($commande->getPaniers() as $panier) {
                $montantTotal += $panier->getQuantite() * $panier->getProduit()->getPrixProduit();
            }
            // calcule avec le frais de livraison
            if ($commande->getFraisLivraison()) {
                $montantTotal += floatval($commande->getFraisLivraison());
            }
            
            // Convertir en centimes pour Stripe
            $amountInCents = (int) ($montantTotal * 100);
            
            // Créer un Payment Intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'eur',
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'refCommande' => $refCommande,
                    'refClient' => $commande->getClient()->getRefClient(),
                ],
            ]);

            // Mettre à jour la commande
            $commande->setMethodePaiement('stripe');
            $commande->setStatutCommande('EN_ATTENTE_PAIEMENT');
            $commande->mettreAjourDate();
            $this->entityManager->flush();

            return $this->json([
                'status' => 'success',
                'message' => 'Payment Intent créé avec succès',
                'data' => [
                    'clientSecret' => $paymentIntent->client_secret,
                    'paymentIntentId' => $paymentIntent->id,
                    'amount' => $montantTotal
                ]
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur lors de la création paiement : ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/confirm-payment', name: 'confirm_payment', methods: ['POST'])]
    public function confirmPayment(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $paymentIntentId = $data['payment_intent_id'];
            $refCommande = $data['ref_commande'];

            // Récupérer le Payment Intent
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            
            // Récupérer la commande
            $commande = $this->commandeRepository->find($refCommande);
            
            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Commande introuvable',
                        'status' => 'error'
                    ]
                ], 404);
            }

            if ($paymentIntent->status === 'succeeded') {
                // Créer l'entité Paiement
                $paiement = new Paiement();
                $paiement->setCommande($commande);
                $paiement->setMontantPaye($paymentIntent->amount / 100);
                $paiement->setModePaiment('stripe');
                $paiement->setStatutPaiment('PAYEE');
                $paiement->mettreAjourDate();
                $paiement->setReferencePaiment($paymentIntentId);
                
                // Mettre à jour le statut de la commande
                $commande->setStatutCommande('EN_PREPARATION');
                $commande->mettreAjourDate();
                $commande->setMontantTotal($this->calculateTotal($commande));
                $this->entityManager->persist($paiement);
                $this->entityManager->flush();
                
                // Envoyer un email de confirmation de commande
                try {
                    // $this->emailService->sendCommandeConfirmation($commande);
                    $client = $commande->getClient();
                    $total = $this->calculateTotal($commande);
                    $emailUser = $client->getUser()->getEmailUsers();
                    $nom = $client->getNomClient() . " " . $client->getPrenomClient();
                    $email = (new TemplatedEmail())
                        ->from(new Address("tinarakotonjanahary@gmail.com", "Produit cosmétique - service client"))
                        ->to($emailUser)
                        ->subject('Confirmation de commande ' . $commande->getRefCommande())
                        ->htmlTemplate('emails/contenuEMail.html.twig')
                        ->context([
                            'commande' => $commande,
                            'client' => $client,
                            'paniers' => $commande->getPaniers(),
                            'total' => $total,
                            'fraisLivraison' => $commande->getFraisLivraison()
                        ]);
                    $this->mailer->send($email);
                    $emailSent = true;
                    $emailError = null;
                } catch (\Exception $e) {
                    $emailSent = false;
                    $emailError = $e->getMessage();
                    error_log('Erreur envoi email: ' . $e->getMessage());
                }
                
                return $this->json([
                    'status' => 'success',
                    'message' => 'Paiement confirmé avec succès',
                    'data' => [
                        'paiement_id' => $paiement->getIdPaiement(),
                        'montant_paye' => $paiement->getMontantPaye(),
                        'ref_commande' => $refCommande,
                        'email_sent' => $emailSent,
                        'email_error' => $emailError
                    ],
                ], 200);
            }
            
            return $this->json([
                'status' => 'success',
                'message' => 'Paiement en attente',
                'data' => [
                    'status' => 'pending',
                    'payment_intent_status' => $paymentIntent->status
                ],
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur lors de la confirmation paiement : ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    private function calculateTotal(Commande $commande): float
    {
        $total = 0;
        foreach ($commande->getPaniers() as $panier) {
            $prix = $panier->getProduit()->getPrixProduit();
            $total += $prix * $panier->getQuantite();
        }
        if ($commande->getFraisLivraison()) {
            $total += floatval($commande->getFraisLivraison());
        }
        
        return $total;
    }

    #[Route('/test-email-direct', name: 'test_email_direct', methods: ['GET'])]
public function testEmailDirect(): JsonResponse
{
    try {
        // Récupérer une commande existante
        $commande = $this->commandeRepository->findOneBy(['statutCommande' => 'PAYÉE']);
        
        if (!$commande) {
            return $this->json(['error' => 'Aucune commande trouvée'], 404);
        }
        
        // Tester l'envoi d'email
        $this->emailService->sendCommandeConfirmation($commande);
        
        return $this->json([
            'success' => true,
            'message' => 'Email envoyé avec succès',
            'ref_commande' => $commande->getRefCommande()
        ]);
        
    } catch (\Exception $e) {
        return $this->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}

    #[Route('/webhook', name: 'stripe_webhook', methods: ['POST'])]
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');
        $webhookSecret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '';

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            // Gérer les différents types d'événements
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event->data->object;
                    $refCommande = $paymentIntent->metadata->refCommande;
                    
                    $commande = $this->commandeRepository->find($refCommande);
                    if ($commande) {
                        // Vérifier si le paiement n'existe pas déjà
                        $paiementExiste = false;
                        foreach ($commande->getPaiements() as $p) {
                            if ($p->getReferencePaiment() === $paymentIntent->id) {
                                $paiementExiste = true;
                                break;
                            }
                        }
                        
                        if (!$paiementExiste) {
                            $paiement = new Paiement();
                            $paiement->setCommande($commande);
                            $paiement->setMontantPaye($paymentIntent->amount / 100);
                            $paiement->setModePaiment('stripe');
                            $paiement->setStatutPaiment('VALIDÉ');
                            $paiement->mettreAjourDate();
                            $paiement->setReferencePaiment($paymentIntent->id);
                            
                            $commande->setStatutCommande('PAYÉE');
                            $commande->mettreAjourDate();
                            
                            $this->entityManager->persist($paiement);
                            $this->entityManager->flush();
                            
                            // Envoie de l'email de conformation (via webhook)
                            try {
                                $this->emailService->sendCommandeConfirmation($commande);
                            } catch (\Exception $e) {
                                error_log('Erreur envoi email (webhook): ' . $e->getMessage());
                            }
                        }
                    }
                    break;
                
                case 'payment_intent.payment_failed':
                    $paymentIntent = $event->data->object;
                    $refCommande = $paymentIntent->metadata->refCommande;
                    
                    $commande = $this->commandeRepository->find($refCommande);
                    if ($commande) {
                        $commande->setStatutCommande('PAIEMENT_ÉCHOUÉ');
                        $commande->mettreAjourDate();
                        $this->entityManager->flush();
                    }
                    break;
            }

            return $this->json([
                'status' => 'success',
                'message' => 'Webhook traité avec succès'
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 400,
                    'message' => 'Erreur dans WEBHOOK : ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 400);
        }
    }
}
