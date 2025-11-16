<?php

namespace App\Service;

use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\Panier;
use App\Entity\User;
use App\Repository\ClientRepository;
use App\Repository\ProduitRepository;
use App\Repository\UserRepository;
use App\Repository\AdresseRepository;
use App\Entity\Adresse;
use Doctrine\ORM\EntityManagerInterface;

Class CommandeServices
{
    private $entityManager;
    private $adresseRepos;
    private $produitRepository; 
    private $em;
    private $CliRepos; 

    public function __construct(
        EntityManagerInterface $entityManager, 
        EntityManagerInterface $em, 
        ClientRepository $CliRepos,
        ProduitRepository $produitRepository,
        AdresseRepository $adresseRepos
    )
    {
        $this->entityManager = $entityManager;
        $this->produitRepository = $produitRepository; 
        $this->em = $em;
        $this->CliRepos = $CliRepos; 
        $this->adresseRepos = $adresseRepos;
    }

    public function creerRecupererAdresse(
        array $adresseData, 
        Client $client, 
        EntityManagerInterface $em, 
        AdresseRepository $adresseRepos
    ): ?Adresse
    {
            if (isset($adresseData['refAdresse'])) {
                $adresseExistante = $adresseRepos->find($adresseData['refAdresse']);
                if ($adresseExistante) {
                    return $adresseExistante;
                }
            }
            $adresse = new Adresse();
            
            $refAdresse = $adresseRepos->RefAdresseSuivant();
            $adresse->setRefAdresse($refAdresse);
            $adresse->setClient($client);
            
            $adresse->setQuartier($adresseData['quartier']);
            $adresse->setVille($adresseData['ville']);
            $adresse->setCodePostal($adresseData['codePostal'] );
            $adresse->setLot($adresseData['lot'] );
            $adresse->setLibelleAdresse($adresseData['labelle']);
            $adresse->setComplementAdresse($adresseData['description']);
            
            $em->persist($adresse);
            $em->flush();
            return $adresse;
    }

    public function createPanierCommande (
        // array $panierItem, 
        Client $client,
        ProduitRepository $prodRepos,
        EntityManagerInterface $em, 
        ClientRepository $CliRepos,
        Adresse $adresseLivraison,
        Adresse $adresseFacturation,
    ): array
    {
        // $totalComplet = 0;
        $commande = new Commande();
        $commande->setClient($client);
        $commande->setStatutCommande('initialisée');
        $commande->setDateCommande(new \DateTimeImmutable());
    
        $refCommande = $CliRepos->RefCommandeSuivant($client->getRefClient());
        $commande->setRefCommande($refCommande);
        
        $commande->setAdresseLivraison($adresseLivraison);
        $commande->setAdresseFacturation($adresseFacturation);
        
        $em->persist($commande);

        // foreach ($panierItem as $item) {
        //     $produit = $prodRepos->find($item['idProduit']);
        //     $Quantite = $item['quantite'];
        //     if (!$produit){
        //         $Valeur = [
        //             'stockInsuffisant' => null,
        //             'ProdIntrouvable' =>  $item['idProduit'],
        //             'commandes' => null,
        //             'TotalPanier' => 0,
        //         ];
        //         return $Valeur;
        //     }
            
        //     $stock = $produit->getStockProduit();
        //     if ($stock - $Quantite <= 2){
        //         $Valeur = [
        //             'stockInsuffisant' => $produit->getNomProduit(),
        //             'ProdIntrouvable' => null,
        //             'commandes' => null,
        //             'TotalPanier' => 0,
        //         ];
        //         return $Valeur;
        //     }
            
        //     $prix = $produit->getPrixProduit();
        //     $subTotal = $prix * $Quantite;
        //     $panier = new Panier();
        //     $panier->setCommande($commande);
        //     $panier->setProduit($produit);
        //     $panier->setQuantite($Quantite);
        //     $em->persist($panier);
            
        //     $totalComplet += $subTotal; 
        // }
        // $em->flush();
        $Valeur = [
            // 'stockInsuffisant' => null,
            // 'ProdIntrouvable' => null,
            'commande' => $commande,
            // 'TotalPanier' => $totalComplet,
        ];
        return $Valeur;
    }

    public function MisAjourAdresse(
        array $adresseData, 
        Client $client, 
    ): ?Adresse
    {
        $adresse = $this->adresseRepos->findOneBy($adresseData['refAdresse']);
        if(!$adresse){
            return null;
        }
        $adresse->setQuartier($adresseData['quartier']);
        $adresse->setVille($adresseData['ville']);
        $adresse->setCodePostal($adresseData['codePostal'] );
        $adresse->setLot($adresseData['lot'] );
        $adresse->setLibelleAdresse($adresseData['labelle']);
        $adresse->setComplementAdresse($adresseData['description']);
        $this->em->flush();
        return $adresse;
    }

    // mis a jour Commande et l'adresse de livraison ()
    public function MisAjourCommande (
        array $data, 
        Client $client,
        string $refCommande
    ): array
    {
        $commande = $this->em->getRepository(Commande::class)->find($refCommande);
        if (!$commande){
            throw new \Exception("Commande introuvable.");
        };

        if ($commande->getClient()->getRefClient() !== $client->getRefClient()){
            throw new \Exception("Accèes refusé. La commande n'appartient à cet Utilisateur.");
        };



        return [];
    }
}