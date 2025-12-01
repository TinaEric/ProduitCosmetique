<?php

namespace App\Repository;

use App\Entity\Panier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PanierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Panier::class);
    }

    public function getTotalRevenus()
    {
        $result = $this->createQueryBuilder('p')
        ->join('p.produit','prod')
        ->addSelect('SUM(p.quantite*prod.prixProduit) As totalRevenus')
        ->getQuery()
        ->getResult();
        return $result;
    }
    
    public function findTopProduit(int $limit = 5): array
    {
        return $this->createQueryBuilder('p') 
            ->leftJoin('p.produit', 'prod')
            ->select('prod')
            ->addSelect('SUM(p.quantite) AS total_ventes')
            ->groupBy('prod') 
            ->orderBy('total_ventes', 'DESC')
            ->setMaxResults($limit) 
            ->getQuery()
            ->getArrayResult(); 
    }
}