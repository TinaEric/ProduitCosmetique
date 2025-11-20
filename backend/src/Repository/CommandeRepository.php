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
}