<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\Panier;
use App\Entity\Paiement;
use App\Entity\Adresse;
use App\Entity\Produit;
use App\Service\CommandeEmailService;
use App\Repository\ClientRepository;
use App\Repository\ProduitRepository;
use App\Repository\AdresseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;

class CommandeServices
{
    private $entityManager;
    private $adresseRepos;
    private $produitRepository; 
    private $CliRepos; 
    private $emailService;
    private MailerInterface $mailer;
    
    public function __construct(
        EntityManagerInterface $entityManager, 
        ClientRepository $CliRepos,
        MailerInterface $mailer,
        ProduitRepository $produitRepository,
        AdresseRepository $adresseRepos,
        CommandeEmailService $emailService  
    )
    {
        $this->entityManager = $entityManager;
        $this->produitRepository = $produitRepository; 
        $this->CliRepos = $CliRepos; 
        $this->adresseRepos = $adresseRepos;
        $this->emailService = $emailService;
        $this->mailer = $mailer;
    }

    public function creerRecupererAdresse(array $adresseData, Client $client): ?Adresse
    {
        try {
            if (isset($adresseData['refAdresse']) && $adresseData['refAdresse']) {
                $adresseExistante = $this->adresseRepos->find($adresseData['refAdresse']);
                if ($adresseExistante && $adresseExistante->getClient() === $client) {
                    return $adresseExistante;
                }
            }
            
            $adresse = new Adresse();
            $refAdresse = $this->adresseRepos->RefAdresseSuivant();
            $adresse->setRefAdresse($refAdresse);
            $adresse->setClient($client);
            
            $adresse->setQuartier($adresseData['quartier'] ?? '');
            $adresse->setVille($adresseData['ville'] ?? '');
            $adresse->setCodePostal($adresseData['codePostal'] ?? '');
            $adresse->setLot($adresseData['lot'] ?? '');
            $adresse->setLibelleAdresse($adresseData['labelle'] ?? '');
            $adresse->setComplementAdresse($adresseData['description'] ?? '');
            
            $this->entityManager->persist($adresse);
            $this->entityManager->flush();
            
            return $adresse;
        } catch (\Exception $e) {
            error_log("Erreur dans creerRecupererAdresse: " . $e->getMessage());
            return null;
        }
    }

    public function MisAjourAdresse(array $adresseData, Client $client): ?Adresse
    {
        try {
            // Vérifier si c'est une création ou mise à jour
            if (isset($adresseData['refAdresse']) && $adresseData['refAdresse']) {
                $adresse = $this->adresseRepos->find($adresseData['refAdresse']);
                if(!$adresse){
                    return null;
                }
                // Vérifier que l'adresse appartient au client
                if ($adresse->getClient() !== $client) {
                    return null;
                }
            } else {
                $adresse = new Adresse();
                $adresse->setClient($client);
                $refAdresse = $this->adresseRepos->RefAdresseSuivant();
                $adresse->setRefAdresse($refAdresse);
                
                $this->entityManager->persist($adresse);
            }
            
            $adresse->setQuartier($adresseData['quartier'] ?? '');
            $adresse->setVille($adresseData['ville'] ?? '');
            $adresse->setCodePostal($adresseData['codePostal'] ?? '');
            $adresse->setLot($adresseData['lot'] ?? '');
            $adresse->setLibelleAdresse($adresseData['labelle'] ?? '');
            $adresse->setComplementAdresse($adresseData['description'] ?? '');
            
            $this->entityManager->flush();
            return $adresse;
            
        } catch (\Exception $e) {
            error_log("Erreur dans MisAjourAdresse: " . $e->getMessage());
            return null;
        }
    }

    public function createPanierCommande(
        Client $client,
        Adresse $adresseLivraison,
        Adresse $adresseFacturation,
    ): array
    {
        try {
            $commande = new Commande();
            $commande->setClient($client);
            $commande->setStatutCommande('INITIALISE');
            $commande->setDateCommande(new \DateTimeImmutable());
            $commande->setDateUpdate(new \DateTimeImmutable());
            $refCommande = $this->CliRepos->RefCommandeSuivant($client->getRefClient());
            $commande->setRefCommande($refCommande);
            $commande->setAdresseLivraison($adresseLivraison);
            $commande->setAdresseFacturation($adresseFacturation);
            
            $this->entityManager->persist($commande);
            $this->entityManager->flush();
            
            return [
                'commande' => $commande,
            ];
        } catch (\Exception $e) {
            error_log("Erreur dans createPanierCommande: " . $e->getMessage());
            return [
                'commande' => null,
                'error' => $e->getMessage()
            ];
        }
    }

    public function MisAjourCommande(
        array $data, 
        Client $client,
        string $refCommande,
        string $fraisLivraison,
        string $methodeLivraison,
        string $methodePaiement,
        string $dateLivraison
    ): array
    {
        $commande = $this->entityManager->getRepository(Commande::class)->findOneBy(['refCommande' => $refCommande]);
        if (!$commande){
            throw new \Exception("Commande introuvable.");
        };

        if ($commande->getClient()->getRefClient() !== $client->getRefClient()){
            throw new \Exception("Accès refusé. La commande n'appartient pas à cet utilisateur.");
        };

        $produitsIntrouvables = [];
        $stocksInsuffisants = [];
        $paniersAMettreAJour = [];

        foreach ($data as $item) {
            $produit = $this->entityManager->getRepository(Produit::class)->findOneBy(['numProduit' => $item['produit']]);
            if (!$produit) {
                $produitsIntrouvables[] = $item['produit'];
                continue;
            }

            $quantite = $item['quantite'];
            $stock = $produit->getStockProduit();
            
            if ($stock < $quantite) {
                $stocksInsuffisants[] = [
                    'produit' => $produit->getNumProduit(),
                    'nom' => $produit->getNomProduit(),
                    'stock_disponible' => $stock,
                    'quantite_demandee' => $quantite
                ];
                continue;
            }

            $paniersAMettreAJour[] = [
                'produit' => $produit,
                'quantite' => $quantite
            ];
        }

        // Retourner les erreurs si nécessaire
        if (!empty($produitsIntrouvables)) {
            return ['ProdIntrouvable' => implode(', ', $produitsIntrouvables)];
        }

        if (!empty($stocksInsuffisants)) {
            $messages = [];
            foreach ($stocksInsuffisants as $stockInsuffisant) {
                $messages[] = sprintf("%s (stock: %d, demandé: %d)",
                    $stockInsuffisant['nom'],
                    $stockInsuffisant['stock_disponible'],
                    $stockInsuffisant['quantite_demandee']
                );
            }
            return ['stockInsuffisant' => implode('; ', $messages)];
        }

        $this->entityManager->beginTransaction();
        try {

            foreach ($paniersAMettreAJour as $item) {
                $produit =  $this->entityManager->getRepository(Produit::class)->findOneBy(['numProduit' => $item['produit']]);;
                $quantite = $item['quantite'];
                $panier = new Panier();
                $panier->setCommande($commande);
                $panier->setProduit($produit);
                $panier->setQuantite($quantite);
                $panier->initPrixUnitaireFromProduit();
                $this->entityManager->persist($panier);
                $stock = $produit->getStockProduit();
                $nouveauStock = $stock - $quantite;
                $produit->setStockProduit($nouveauStock);
                
                
                $produit->setDateMiseAJourProduit(new \DateTimeImmutable());
            }
            $commande->setMethodeLivraison($methodeLivraison);
            $commande->setFraisLivraison($fraisLivraison);
            $commande->setMethodePaiement($methodePaiement);
            $totalPanier = $this->calculateTotal($commande);
            $commande->setMontantTotal($totalPanier);
            $commande->setDateLivraison(new \DateTimeImmutable($dateLivraison));
            $emailSent = true;
            $emailError = null;
            if ($methodePaiement === "especes") {
                $commande->setStatutCommande('EN_PREPARATION');
                $montantTotal = 0;
                foreach ($commande->getPaniers() as $panier) {
                    $montantTotal += $panier->getQuantite() * $panier->getProduit()->getPrixProduit();
                }
                if ($commande->getFraisLivraison()) {
                    $montantTotal += floatval($commande->getFraisLivraison());
                }
                
                $paiement = new Paiement();
                $paiement->setCommande($commande);
                $paiement->setMontantPaye($montantTotal);
                $paiement->setModePaiment('especes');
                $paiement->setStatutPaiment('EN_ATTENTE_LIVRAISON');
                $paiement->mettreAjourDate();
                $paiement->setReferencePaiment("Via Especes-".uniqid());
                $this->entityManager->persist($paiement);

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
            }else{
                $commande->setStatutCommande('EN_ATTENTE_PAIEMENT');
            }
            $commande->mettreAjourDate();
            

            $this->entityManager->flush();
            $this->entityManager->commit();

            return [
                'email'=> [
                    'emailSent'  => $emailSent,
                    'emailError' => $emailError
                ],
                'commande' => $commande,
                'message' => 'Commande et panier mis à jour avec succès'
            ];

        } catch (\Exception $e) {
            $this->entityManager->rollback();
            throw new \Exception("Erreur lors de la mise à jour de la commande: " . $e->getMessage());
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