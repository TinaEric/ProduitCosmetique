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
        $qb->andWhere('c.codeCategorie = :cat')
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

    public function findProdCatPanier(?string $codeCategorie = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->join('p.categorie', 'c')
            ->leftJoin('p.paniers', 'pan')
            ->addSelect('c')
            ->addSelect('SUM(pan.quantite) as ventes') 
            ->groupBy('p.numProduit') 
            ->orderBy('c.libelleCategorie', 'ASC');

        if ($codeCategorie) {
            $qb->andWhere('c.codeCategorie = :cat')
            ->setParameter('cat', $codeCategorie);
        }

        $result = $qb->getQuery()->getResult();

        $grouped = [];

        foreach ($result as $row) {
            $produit = $row[0]; 
            $ventes = (int) $row['ventes'] ?? 0; 
            
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
                'id' => $produit->getNumProduit(),
                'nom' => $produit->getNomProduit(),
                'prix' => $produit->getPrixProduit(),
                'stock' => $produit->getStockProduit(),
                'image' => $produit->getImageUrlProduit(),
                'codePromo' => $produit->getCodePromos(),
                'description' => $produit->getDescriptionProduit(),
                'idCategory' => $produit->getCategorie(),
                'ventes' => $ventes, // Ajout du nombre de ventes
            ];
        }

        return array_values($grouped);
    }

    public function findTopProduit(int $limit = 5): array
    {
        return $this->createQueryBuilder('prod')
            ->leftJoin('prod.paniers', 'p')
            ->select('prod.numProduit, prod.nomProduit, prod.prixProduit, prod.stockProduit, prod.imageUrlProduit, prod.descriptionProduit')
            ->addSelect('SUM(p.quantite) AS total_ventes')
            ->groupBy('prod.numProduit')
            ->orderBy('total_ventes', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getAllProduit(): array
    {
        return $this->createQueryBuilder('prod')
            ->leftJoin('prod.paniers', 'p')
            ->select('prod.numProduit, prod.nomProduit, prod.prixProduit, prod.stockProduit, prod.imageUrlProduit, prod.descriptionProduit')
            ->addSelect('SUM(p.quantite) AS total_ventes')
            ->groupBy('prod.numProduit')
            ->orderBy('total_ventes', 'DESC')
            ->getQuery()
            ->getResult();
    }

    
    public function findProduitStockAlerte():array
    {
        return $this->createQueryBuilder('p')
        ->leftJoin('p.categorie', 'categorie')
        ->addSelect('categorie')
        ->where('p.stockProduit < 10')
        ->andWhere('p.stockProduit > 0')
        ->orderBy('p.stockProduit', 'ASC')
        ->getQuery()
        ->getResult();
    }
    public function findProduitRuptureStock():array
    {
        return $this->createQueryBuilder('p')
        ->leftJoin('p.categorie', 'categorie')
        ->addSelect('categorie')
        ->where('p.stockProduit <= 0')
        ->orderBy('p.dateMiseAJourProduit', 'DESC')
        ->getQuery()
        ->getResult();
    }

    public function findProduitsSimilaires(int $produitId, ?string $codeCategorie): array
    {
        $qb = $this->createQueryBuilder('p')
            ->join('p.categorie', 'c')
            ->leftJoin('p.paniers', 'pan') 
            ->addSelect('c')
            ->addSelect('COALESCE(SUM(pan.quantite), 0) as ventes')
            ->where('p.numProduit != :produitId')
            ->setParameter('produitId', $produitId)
            ->groupBy('p.numProduit')
            ->orderBy('ventes', 'DESC') 
            ->addOrderBy('p.dateMiseAJourProduit', 'DESC');

        if ($codeCategorie) {
            $qb->andWhere('c.codeCategorie = :categorie')
            ->setParameter('categorie', $codeCategorie);
        }

        $result = $qb->getQuery()->getResult();
        
        $produitsSimilaires = [];
        
        foreach ($result as $row) {
            $produit = $row[0];
            $ventes = (int) $row['ventes'];
            
            $produitsSimilaires[] = [
                'id' => $produit->getNUMPRODUIT(),
                'nom' => $produit->getNomProduit(),
                'prix' => $produit->getPrixProduit(),
                'stock' => $produit->getStockProduit(),
                'image' => $produit->getImageUrlProduit(),
                'codePromo' => $produit->getCodePromos(),
                'description' => $produit->getDescriptionProduit(),
                'ventes' => $ventes,
                'idCategory'=> $produit->getCategorie(),
                'categorie' => [
                    'codeCategorie' => $produit->getCategorie()->getCODECATEGORIE(),
                    'libelleCategorie' => $produit->getCategorie()->getLibelleCategorie(),
                ]
            ];
        }
        
        return $produitsSimilaires;
    }
}