<?php
// src/Service/EmailCommandeService.php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class EmailCommandeService
{
    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        private ParameterBagInterface $params
    ) {}

    public function sendEmailConfirmation(string $to, string $subject, array $commandeData): array
    {
        try {
            $projectDir = $this->params->get('kernel.project_dir');
            
            $email = (new TemplatedEmail())
                ->from('noreply@monsite.local')
                ->to($to)
                ->subject($subject)
                ->htmlTemplate('emails/confirmation_commande.html.twig')
                ->context([
                    'commande' => $commandeData,
                    'client' => $commandeData['client'] ?? [],
                    'items' => $commandeData['items'] ?? [],
                    'date' => new \DateTime(),
                ]);

            $this->mailer->send($email);

            // Sauvegarde debug
            $this->saveDebugEmail($projectDir, $to, $subject, $commandeData, null);

            return [
                'success' => true,
                'message' => 'Email envoyé avec succès'
            ];

        } catch (\Exception $e) {
            $projectDir = $this->params->get('kernel.project_dir');
            $this->saveDebugEmail($projectDir, $to, $subject, $commandeData, $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ];
        }
    }

    private function saveDebugEmail(string $projectDir, string $to, string $subject, array $commandeData, ?string $error): void
    {
        $debugData = [
            'to' => $to,
            'subject' => $subject,
            'commande' => $commandeData,
            'sent_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'error' => $error
        ];

        $filename = $projectDir . '/var/emails/commande_' . ($commandeData['reference'] ?? uniqid()) . '.json';
        
        if (!is_dir(dirname($filename))) {
            mkdir(dirname($filename), 0777, true);
        }

        file_put_contents($filename, json_encode($debugData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}