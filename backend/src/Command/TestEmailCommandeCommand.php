<?php

namespace App\Command;

use App\Entity\Commande;
use App\Service\CommandeEmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:test-email-commande',
    description: 'Teste l\'envoi d\'email de confirmation pour une commande'
)]
class TestEmailCommandeCommand extends Command
{
    private EntityManagerInterface $em;
    private CommandeEmailService $emailService;
    
    public function __construct(
        EntityManagerInterface $em,
        CommandeEmailService $emailService
    ) {
        parent::__construct();
        $this->em = $em;
        $this->emailService = $emailService;
    }
    
    protected function configure(): void
    {
        $this->addArgument('refCommande', InputArgument::REQUIRED, 'Référence de la commande');
    }
    
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $refCommande = $input->getArgument('refCommande');
        
        $commande = $this->em->getRepository(Commande::class)->find($refCommande);
        
        if (!$commande) {
            $output->writeln('<error>Commande introuvable</error>');
            return Command::FAILURE;
        }
        
        $output->writeln('Envoi d\'email pour la commande : ' . $refCommande);
        
        try {
            $this->emailService->sendCommandeConfirmation($commande);
            $output->writeln('<info>✓ Email envoyé avec succès !</info>');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $output->writeln('<error>✗ Erreur : ' . $e->getMessage() . '</error>');
            return Command::FAILURE;
        }
    }
}