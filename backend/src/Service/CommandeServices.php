<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\Panier;
use App\Entity\Adresse;
use App\Repository\ClientRepository;
use App\Repository\ProduitRepository;
use App\Repository\AdresseRepository;
use Doctrine\ORM\EntityManagerInterface;

class CommandeServices
{
    private $entityManager;
    private $adresseRepos;
    private $produitRepository; 
    private $CliRepos; 

    public function __construct(
        EntityManagerInterface $entityManager, 
        ClientRepository $CliRepos,
        ProduitRepository $produitRepository,
        AdresseRepository $adresseRepos
    )
    {
        $this->entityManager = $entityManager;
        $this->produitRepository = $produitRepository; 
        $this->CliRepos = $CliRepos; 
        $this->adresseRepos = $adresseRepos;
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
                // Création d'une nouvelle adresse
                $adresse = new Adresse();
                $adresse->setClient($client);
                
                // Générer le refAdresse
                $refAdresse = $this->adresseRepos->RefAdresseSuivant();
                $adresse->setRefAdresse($refAdresse);
                
                $this->entityManager->persist($adresse);
            }
            
            // Mettre à jour les champs
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
            $commande->setStatutCommande('initialisée');
            $commande->setDateCommande(new \DateTimeImmutable());

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
        string $refCommande
    ): array
    {
        $commande = $this->entityManager->getRepository(Commande::class)->findOneBy(['refCommande' => $refCommande]);
        if (!$commande){
            throw new \Exception("Commande introuvable.");
        };

        if ($commande->getClient()->getRefClient() !== $client->getRefClient()){
            throw new \Exception("Accèes refusé. La commande n'appartient à cet Utilisateur.");
        };

        return [];
    }
}