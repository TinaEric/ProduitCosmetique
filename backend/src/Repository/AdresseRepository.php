<?php

namespace App\Repository;

use App\Entity\Adresse;
use App\Entity\Client;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class AdresseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Adresse::class);
    }

    public function RefAdresseSuivant(): ?string
    {
        $result = $this->createQueryBuilder('a')
            ->select('a.refAdresse')
            ->orderBy('a.refAdresse', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        $code =  $result ? (string) $result['refAdresse'] : "ADR0000";
        preg_match('/\d+$/', $code, $matches);
        $id = (isset($matches[0]) ? (int)$matches[0] : 0) + 1;
        
        // Génération du nouveau code avec une concaténation correcte
        $newCode = "ADR" . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
        return $newCode;
    }

       /**
     * Trouve toutes les adresses d'un client
     */
    public function findByClient(Client $client): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.client = :client')
            ->setParameter('client', $client)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve une adresse spécifique d'un client
     */
    public function findOneByClientAndId(Client $client, int $adresseId): ?Adresse
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.client = :client')
            ->andWhere('a.id = :id')
            ->setParameter('client', $client)
            ->setParameter('id', $adresseId)
            ->getQuery()
            ->getOneOrNullResult();
    }

}