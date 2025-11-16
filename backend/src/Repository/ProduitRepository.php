<?php

namespace App\Repository;

use App\Entity\Produit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProduitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Produit::class);
    }

    public function findProduitsGroupesParCategorie(?string $codeCategorie = null): array
{
    $qb = $this->createQueryBuilder('p')
        ->join('p.categorie', 'c')
        ->addSelect('c')
        ->orderBy('c.libelleCategorie', 'ASC');

    if ($codeCategorie) {
        $qb->andWhere('c.CODE_CATEGORIE = :cat')
           ->setParameter('cat', $codeCategorie);
    }

    $result = $qb->getQuery()->getResult();

    $grouped = [];

    foreach ($result as $produit) {
        $catCode = $produit->getCategorie()->getCODECATEGORIE();
        $catLibelle = $produit->getCategorie()->getLibelleCategorie();

        if (!isset($grouped[$catCode])) {
            $grouped[$catCode] = [
                'codeCategorie' => $catCode,
                'libelle' => $catLibelle,
                'produits' => []
            ];
        }

        $grouped[$catCode]['produits'][] = [
            'id' => $produit->getNUMPRODUIT(),
            'nom' => $produit->getNomProduit(),
            'prix' => $produit->getPrixProduit(),
            'stock' => $produit->getStockProduit(),
            'image' => $produit->getImageUrlProduit(),
            'codePromo' => $produit->getCodePromos(),
            'description' => $produit->getDescriptionProduit(),
            'idCategory'=> $produit->getCategorie(),
        ];
    }

    return array_values($grouped);
}

}