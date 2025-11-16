<?php

namespace App\Repository;

use App\Entity\Client;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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

    
    public function RefCommandeSuivant(string $code): string
    {
        $now = new \DateTimeImmutable();
        $dateNow = $now->format('YmdHis');
        $random = random_int(1000, 9999);
        $newCode = "CMD" . $dateNow . $random . $code;
        return $newCode;
    }
}