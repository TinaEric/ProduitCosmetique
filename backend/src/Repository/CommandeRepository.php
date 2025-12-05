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
            ->leftJoin('c.adresseFacturation', 'adresseFacturation')
            ->leftJoin('c.paniers', 'p')
            ->leftJoin('p.produit', 'prod')
            ->leftJoin('c.paiements', 'paiements')
            ->addSelect('client')
            ->addSelect('adresseLiv')
            ->addSelect('adresseFacturation')
            ->addSelect('p')
            ->addSelect('prod')
            ->addSelect('paiements')
            ->addSelect('COALESCE(SUM(p.quantite * prod.prixProduit), 0) as montant')
            ->andWhere('c.statutCommande != :status')
            ->setParameter('status', "INITIALISE")
            ->groupBy('c.refCommande, client.refClient, adresseLiv.refAdresse') 
            ->orderBy('c.dateCommande', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
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
   
    public function findRecentOrders(\DateTime $dateLimit): array
    {
        return $this->createQueryBuilder('c')
        ->leftJoin('c.client', 'client')
        ->addSelect('client')
        ->where('c.dateCommande >= :dateLimit')
        ->setParameter('dateLimit', $dateLimit)
        // ->andWhere('c.statutCommande IN (:statuses)')
        // ->setParameter('statuses', ['INITIALISE', 'EN_ATTENTE_PAIEMENT'])
        ->orderBy('c.dateCommande', 'DESC')
        ->getQuery()
        ->getResult();
    }

    public function getTotalRevenue(): float
    {
        $sansFrais = $this->createQueryBuilder('c')
            ->leftJoin('c.paniers', 'p')
            ->leftJoin('p.produit', 'prod') 
            ->where('c.statutCommande IN (:status_traitee)')
            ->setParameter('status_traitee', ['PAYÉE', 'EN_COURS'])
            ->select('COALESCE(SUM(p.quantite * prod.prixProduit), 0)');
        $productRevenue = $sansFrais->getQuery()->getSingleScalarResult();

        $avecFrais = $this->createQueryBuilder('c2')
            ->where('c2.statutCommande IN (:status_traitee)')
            ->setParameter('status_traitee', ['PAYÉE', 'EN_COURS'])
            ->select('COALESCE(SUM(c2.fraisLivraison), 0)');
        $totalFrais = $avecFrais->getQuery()->getSingleScalarResult();

        return (float) $productRevenue + (float) $totalFrais;
    
    }
}