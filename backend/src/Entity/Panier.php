<?php
// src/Entity/Panier.php

namespace App\Entity;

use App\Repository\PanierRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PanierRepository::class)]
#[ORM\UniqueConstraint(name: 'primary_key', columns: ['ref_commande', 'num_produit'])]
class Panier
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['commande:read'])]
    private ?int $id = null;

     #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'paniers')]
     #[ORM\JoinColumn(name: 'ref_commande', referencedColumnName: 'ref_commande', nullable: false)]
     private ?Commande $commande = null;
 
     #[ORM\ManyToOne(targetEntity: Produit::class, inversedBy: 'paniers')]
     #[ORM\JoinColumn(name: 'num_produit', referencedColumnName: 'NUM_PRODUIT', nullable: false)]
     #[Groups(['commande:read'])]
     private ?Produit $produit = null;
 

     #[ORM\Column(type: Types::INTEGER, nullable: true)]
     #[Groups(['commande:read'])]
     private ?int $quantite = null;

    public function getCommande(): ?Commande
    {
        return $this->commande;
    }
    public function getIdPanier():  ?int
    {
        return $this->id;
    }
    public function setCommande(?Commande $commande): static
    {
        $this->commande = $commande;
        return $this;
    }

    public function getProduit(): ?Produit
    {
        return $this->produit;
    }

    public function setProduit(?Produit $produit): static
    {
        $this->produit = $produit;
        return $this;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(?int $quantite): static
    {
        $this->quantite = $quantite;
        return $this;
    }
}