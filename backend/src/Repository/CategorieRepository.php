<?php

namespace App\Repository;

use App\Entity\Categorie;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CategorieRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Categorie::class);
    }
    public function findAvecNbrProduit(): array{
        return $this->createQueryBuilder('c')
        ->select('c.codeCategorie,c.libelleCategorie, c.descriptionCategorie,COUNT(p.numProduit) AS nbrProduit')
        ->leftJoin('c.produits', 'p') 
        ->groupBy('c.codeCategorie')             
        ->getQuery()
        ->getArrayResult();
    }

    public function dernierEnregistrement() : ?string 
    {
        $result = $this->createQueryBuilder('c')
            ->select('c.codeCategorie')
            ->orderBy('c.codeCategorie', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        
        // Assurez-vous que le résultat est une chaîne ou null
        return $result ? (string) $result['codeCategorie'] : null;
    }

    public function CodeSuivant(string $code): ?string
    {
        preg_match('/\d+$/', $code, $matches);
        $id = (isset($matches[0]) ? (int)$matches[0] : 0) + 1;
        
        // Génération du nouveau code avec une concaténation correcte
        $newCode = "CAT" . str_pad((string)$id, 4, '0', STR_PAD_LEFT);
        return $newCode;
    }

}