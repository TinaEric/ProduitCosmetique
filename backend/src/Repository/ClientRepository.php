<?php

namespace App\Repository;

use App\Entity\Client;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @extends ServiceEntityRepository<Client>
 *
 * @method Client|null find($id, $lockMode = null, $lockVersion = null)
 * @method Client|null findOneBy(array $criteria, array $orderBy = null)
 * @method Client[]    findAll()
 * @method Client[]    findBy(array $criteria, array $orderBy = null)
 */
class ClientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Client::class);
    }

    public function RefClientSuivant(): ?string
    {
        $result = $this->createQueryBuilder('c')
            ->select('c.refClient')
            ->orderBy('c.refClient', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        $code =  $result ? (string) $result['refClient'] : "CLI0000";

        preg_match('/\d+$/', $code, $matches);
        $id = (isset($matches[0]) ? (int)$matches[0] : 0) + 1;
        
        // Génération du nouveau code avec une concaténation correcte
        $newCode = "CLI" . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
        return $newCode;
    }

    public function getClientUser(){
        return $this->createQueryBuilder('c')
            ->leftJoin('c.user', 'u')
            ->leftJoin('c.adresses', 'a')
            ->addSelect('u')
            ->addSelect('a')
            ->getQuery()
            ->getResult();
    }
    
    public function RefCommandeSuivant(string $code): string
    {
        $now = new \DateTimeImmutable();
        $dateNow = $now->format('YmdHis');
        $random = random_int(1000, 9999);
        $newCode = "CMD" . $dateNow . $random . $code;
        return $newCode;
    }
    public function findRecentUsers(\DateTime $dateLimit): array
    {
        return $this->createQueryBuilder('c')
        ->leftJoin('c.user', 'user')
        ->addSelect('user')
        ->where('c.dateInscription >= :dateLimit')
        ->setParameter('dateLimit', $dateLimit)
        ->orderBy('c.dateInscription', 'DESC')
        ->getQuery()
        ->getResult();
    }

    public function findRecentClient(): array
    {
        return $this->createQueryBuilder('c')
            // ->leftJoin('c.user', 'u')
            // ->addSelect('u')
            ->select('c')   
            ->where("c.dateInscription >= DATE_SUB(CURRENT_TIMESTAMP(), 24, 'HOUR')")
            ->orderBy('c.dateInscription', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByUserId(string $userId): ?Client
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult();
    }

}