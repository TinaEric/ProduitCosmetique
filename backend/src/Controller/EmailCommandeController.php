<?php

namespace App\Controller;

use App\Service\EmailCommandeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/email')]
class EmailCommandeController extends AbstractController
{
    #[Route('/confirmation-commande', name: 'api_email_confirmation_commande', methods: ['POST'])]
    public function sendConfirmationCommande(
        Request $request,
        EmailCommandeService $emailService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validation des données requises
        if (!isset($data['to']) || !isset($data['commande'])) {
            return $this->json([
                'success' => false,
                'message' => 'Données manquantes: "to" (email destinataire) et "commande" sont requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $subject = $data['subject'] ?? 'Confirmation de votre commande';
            
            $result = $emailService->sendEmailConfirmation(
                $data['to'],
                $subject,
                $data['commande']
            );

            return $this->json($result);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/debug/emails', name: 'api_email_debug', methods: ['GET'])]
    public function debugEmails(EmailCommandeService $emailService): JsonResponse
    {
        try {
            $projectDir = $this->getParameter('kernel.project_dir');
            
            // Lire les emails de debug
            $emailFiles = glob($projectDir . '/var/emails/*.json');
            $emails = [];
            
            foreach ($emailFiles as $file) {
                $content = json_decode(file_get_contents($file), true);
                $emails[] = [
                    'file' => basename($file),
                    'content' => $content,
                    'modified' => date('Y-m-d H:i:s', filemtime($file))
                ];
            }
            
            // Trier par date (plus récent en premier)
            usort($emails, function($a, $b) {
                return strtotime($b['modified']) - strtotime($a['modified']);
            });

            // Lire les emails envoyés
            $mailFiles = glob($projectDir . '/var/mail/*.eml');
            $mailCount = count($mailFiles);

            return $this->json([
                'success' => true,
                'debug_emails_count' => count($emails),
                'sent_emails_count' => $mailCount,
                'debug_emails' => $emails,
                'last_emails' => array_slice($emails, 0, 5) // 5 derniers seulement
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des emails: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/test', name: 'api_email_test', methods: ['GET'])]
    public function testEmail(EmailCommandeService $emailService): JsonResponse
    {
        try {
            // Données de test
            $commandeData = [
                'reference' => 'TEST-' . date('Ymd-His'),
                'items' => [
                    [
                        'nom' => 'Produit Test 1',
                        'quantite' => 2,
                        'prix' => 25000
                    ],
                    [
                        'nom' => 'Produit Test 2',
                        'quantite' => 1,
                        'prix' => 15000
                    ]
                ],
                'livraison' => 'express',
                'paiement' => 'orange-money',
                'total' => 65000,
                'fraisLivraison' => 5000,
                'client' => [
                    'nom' => 'Test',
                    'prenom' => 'Utilisateur',
                    'email' => 'test@example.com',
                    'telephoneClient' => '034 12 345 67'
                ],
                'adresseLivraison' => [
                    'labelle' => 'Adresse de test, Antananarivo'
                ]
            ];

            $result = $emailService->sendEmailConfirmation(
                'test@example.com',
                'TEST - Confirmation de commande',
                $commandeData
            );

            return $this->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'test_data' => $commandeData
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors du test: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}