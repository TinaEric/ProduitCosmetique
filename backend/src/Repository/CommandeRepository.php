<?php

namespace App\Repository;

use App\Entity\Commande;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CommandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Commande::class);
    }
    public function findAllWithDetails()
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.client', 'client')
            ->leftJoin('c.adresseLivraison', 'adresseLiv')
            ->leftJoin('c.adresseFacturation', 'adresseFact')
            ->leftJoin('c.paniers', 'paniers')
            ->addSelect('client')
            ->addSelect('adresseLiv')
            ->addSelect('adresseFact')
            ->addSelect('paniers')
            ->orderBy('c.dateCommande', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findAllWithRelations()
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.client', 'client')
            ->leftJoin('c.adresseLivraison', 'adresseLivraison')
            ->leftJoin('c.adresseFacturation', 'adresseFacturation')
            ->leftJoin('c.paniers', 'paniers')
            ->leftJoin('paniers.produit', 'produit')
            ->leftJoin('c.paiements', 'paiements')
            ->addSelect('client')
            ->addSelect('adresseLivraison')
            ->addSelect('adresseFacturation')
            ->addSelect('paniers')
            ->addSelect('produit')
            ->addSelect('paiements')
            ->getQuery()
            ->getResult();
    }
    
    public function findByStatus(string $status)
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.client', 'client')
            ->andWhere('c.statutCommande = :status')
            ->setParameter('status', $status)
            ->orderBy('c.dateCommande', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function recentCommande()
    {
        $results = $this->createQueryBuilder('c')
            ->leftJoin('c.client', 'client')
            ->leftJoin('c.adresseLivraison', 'adresseLiv')
            // ->leftJoin('App\Entity\Panier', 'p', 'WITH', 'p.commande = c.refCommande')
            ->leftJoin('c.paniers', 'p')
            ->leftJoin('p.produit', 'prod')
            ->addSelect('client')
            ->addSelect('adresseLiv')
            ->addSelect('COALESCE(SUM(p.quantite * prod.prixProduit), 0) as montant')
            ->andWhere('c.statutCommande = :status')
            ->setParameter('status', "EN_ATTENTE_PAIEMENT")
            ->groupBy('c.refCommande, client.refClient, adresseLiv.refAdresse') 
            ->orderBy('c.dateCommande', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            // ->getResult();
            ->getArrayResult();
    
        $formattedResults = [];
        
        // foreach ($results as $row) {
        //     $commande = $row[0];
        //     $client = $row['client'] ?? null; 
        //     $adresseLiv = $row['adresseLiv'] ?? null; 
        //     $montant = $row['montant'] ?? 0;
        //     $formattedResults[] = [
        //         'refCommande' => $commande->getRefCommande(),
        //         'dateCommande' => $commande->getDateCommande()->format('Y-m-d H:i:s'),
        //         'statutCommande' => $commande->getStatutCommande(),
        //         'client' => [
        //             'refClient' => $client->getRefClient() ,
        //             'nomClient' => $client->getNomClient(),
        //             'prenomClient' => $client->getPrenomClient(),
        //         ],
        //         'adresseLivraison' => [
        //             'refAdresse' => $adresseLiv->getRefAdresse(),
        //             'ville' => $adresseLiv->getVille(),
        //             'codePostal' => $adresseLiv->getCodePostal(),
        //             'quartier' => $adresseLiv->getQuartier(),
        //         ],
        //         'fraisLivraison' => (float) $commande->getFraisLivraison(),
        //         'methodPaiement' => $commande->getMethodPaiement(),
        //         'montant' => (float)$montant
        //     ];
        // }
        
        return $results;
    }
   
}