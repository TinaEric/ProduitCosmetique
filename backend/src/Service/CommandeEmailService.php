<?php

namespace App\Service;

use App\Entity\Commande;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;

class CommandeEmailService
{
    private MailerInterface $mailer;
    // private string $fromEmail;
    // private string $fromName;
    
    public function __construct(
        MailerInterface $mailer,
        // string $fromEmail,
        // string $fromName
    ) {
        $this->mailer = $mailer;
        // $this->fromEmail = $fromEmail;
        // $this->fromName = $fromName;
    }
    
    public function sendCommandeConfirmation(Commande $commande): void
    {
        $client = $commande->getClient();
        
        if (!$client || !$client->getUser()) {
            throw new \Exception('Impossible d\'envoyer l\'email : client ou email manquant');
        }
        
        $total = $this->calculateTotal($commande);
        $emailUser = $client->getUser()->getEmailUsers();
        $email = (new TemplatedEmail())
            // ->from(new Address($this->fromEmail, $this->fromName))
            ->from(new Address("tinarakotonjanahary@gmail.com","Produit cosmétique - service client"))
            ->to($emailUser)
            ->subject('Confirmation de commande ' . $commande->getRefCommande())
            ->htmlTemplate('emails/commande_confirmation.html.twig')
            ->context([
                'commande' => $commande,
                'client' => $client,
                'paniers' => $commande->getPaniers(),
                'total' => $total,
                'fraisLivraison' => $commande->getFraisLivraison()
            ]);
        
        $this->mailer->send($email);
    }
    
    //Fonction pour calculer le total de la commande pour chaque panier
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
}