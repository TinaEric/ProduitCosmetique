<?php

namespace App\Repository;

use App\Entity\Paiement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PaiementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Paiement::class);
    }

    public function findAllWithCommande(): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.commande', 'c')
            ->leftJoin('c.client', 'cl')
            ->addSelect('c')
            ->addSelect('cl')
            ->orderBy('p.datePaiment', 'DESC')
            ->getQuery()
            ->getResult();
    }
}