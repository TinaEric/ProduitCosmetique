<?php
// src/Test/TestEmailCommand.php

namespace App\Test;

use App\Service\EmailCommandeService;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class TestEmailCommand extends Command
{
    protected static $defaultName = 'app:test-email';
    protected static $defaultDescription = 'Test email sending functionality';

    public function __construct(
        private EmailCommandeService $emailService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Test email sending functionality')
            ->setHelp('This command tests the email sending functionality for order confirmations');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Testing Email System');

        try {
            // Données de test
            $commandeData = [
                'reference' => 'CMD-TEST-' . date('Ymd-His'),
                'items' => [
                    [
                        'nom' => 'Crème hydratante',
                        'quantite' => 2,
                        'prix' => 25000
                    ],
                    [
                        'nom' => 'Gel douche', 
                        'quantite' => 1,
                        'prix' => 15000
                    ]
                ],
                'livraison' => 'express',
                'paiement' => 'orange-money',
                'total' => 65000,
                'fraisLivraison' => 5000,
                'client' => [
                    'nom' => 'Rakoto',
                    'prenom' => 'Jean',
                    'email' => 'test@example.com',
                    'telephoneClient' => '034 12 345 67'
                ],
                'adresseLivraison' => [
                    'labelle' => 'Lot ABC, Rue XYZ, Antananarivo 101'
                ]
            ];

            $io->section('Sending test email...');

            $result = $this->emailService->sendEmailConfirmation(
                'test@example.com',
                'TEST - Confirmation de commande',
                $commandeData
            );

            if ($result['success']) {
                $io->success('✅ Email sent successfully!');
                $io->text([
                    '📧 Email saved in: var/mail/',
                    '📄 Debug info in: var/emails/',
                    '🔗 Reference: ' . $commandeData['reference'],
                    '👤 Client: ' . $commandeData['client']['prenom'] . ' ' . $commandeData['client']['nom'],
                    '💰 Total: ' . number_format($commandeData['total'], 0, ',', ' ') . ' Ar'
                ]);
            } else {
                $io->error('❌ Error: ' . $result['message']);
            }

        } catch (\Exception $e) {
            $io->error('💥 Exception: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}