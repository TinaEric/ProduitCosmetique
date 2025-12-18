<?php

namespace App\Service;

use App\Entity\Commande;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;

class CommandeEmailService
{
    private MailerInterface $mailer;
    
    public function __construct(
        MailerInterface $mailer,
    ) {
        $this->mailer = $mailer;
    }
    
    public function sendCommandeConfirmation(Commande $commande): void
    {
        try {
            $client = $commande->getClient();
            $total = $this->calculateTotal($commande);
            $emailUser = $client->getUser()->getEmailUsers();
            $nom = $client->getNomClient() . " " . $client->getPrenomClient();
            $email = (new TemplatedEmail())
                        ->from(new Address("tinarakotonjanahary@gmail.com", "Produit cosmétique - service client"))
                        ->to($emailUser)
                        ->subject('Confirmation de commande ' . $commande->getRefCommande())
                        // ->html('<p>Bonjour ' . $nom . '! Votre commande est en cours de preparation, Net à payé : ' .$total.'</p>');
                        ->htmlTemplate('emails/contenuEMail.html.twig') // Mise à jour du chemin du template
                            ->context([
                                'commande' => $commande,
                                'client' => $client,
                                'paniers' => $commande->getPaniers(),
                                'total' => $total,
                                'fraisLivraison' => $commande->getFraisLivraison()
                            ]);

            $this->mailer->send($email);
        } catch (\Exception $e) {
            // Log the error or handle it appropriately
            throw new \Exception('Erreur lors de l\'envoi de l\'email : ' . $e->getMessage());
        }
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