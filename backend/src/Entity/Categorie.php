<?php

namespace App\Entity;

use App\Repository\CategorieRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types; // 🟢 NOUVEL IMPORT : Correction de l'erreur "Could not resolve type"
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CategorieRepository::class)]
class Categorie
{
    #[ORM\Id]
    #[ORM\Column(name: 'CODE_CATEGORIE', type: Types::STRING, length: 20)]
    #[Groups(['category:read', 'groupe:write'])]
    private ?string $codeCategorie = null;

    #[ORM\Column(name: 'libelle_categorie', type: Types::STRING, length: 100, nullable: true)]
    #[Groups(['category:read', 'groupe:write'])]
    private ?string $libelleCategorie = null;

    #[ORM\Column(name: 'description_categorie', type: Types::STRING, length: 255, nullable: true)]
    #[Groups(['category:read', 'groupe:write'])]
    private ?string $descriptionCategorie = null;
    
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeInterface $dateMiseAJourCategorie = null;

    #[ORM\OneToMany(mappedBy: 'categorie', targetEntity: Produit::class,cascade: ['remove'],orphanRemoval:true)]
    private Collection $produits;

    public function __construct()
    {
        $this->dateMiseAJourCategorie = new \DateTimeImmutable();
        $this->produits = new ArrayCollection();
    }

    #[Groups(['category:read'])]
    public function getNombreProduits(): int
    {
        return $this->produits->count();
    }

    public function getCodeCategorie(): ?string
    {
        return $this->codeCategorie;
    }

    public function setCodeCategorie(string $codeCategorie): static
    {
        $this->codeCategorie = $codeCategorie;
        return $this;
    }

    public function getLibelleCategorie(): ?string
    {
        return $this->libelleCategorie;
    }

    public function getDateMiseAJourCategorie(): ?\DateTimeInterface
    {
        return $this->dateMiseAJourCategorie;
    }

    public function mettreAjourDate(): self 
    {
        $this->dateMiseAJourCategorie = new DateTimeImmutable();
        return $this;
    }
    public function setLibelleCategorie(?string $libelleCategorie): static
    {
        $this->libelleCategorie = $libelleCategorie;
        return $this;
    }

    public function getDescriptionCategorie(): ?string
    {
        return $this->descriptionCategorie;
    }

    public function setDescriptionCategorie(?string $descriptionCategorie): static
    {
        $this->descriptionCategorie = $descriptionCategorie;
        return $this;
    }

    /**
     * @return Collection<int, Produit>
     */
    public function getProduits(): Collection
    {
        return $this->produits;
    }

    public function addProduit(Produit $produit): static
    {
        if (!$this->produits->contains($produit)) {
            $this->produits->add($produit);
            $produit->setCategorie($this);
        }
        return $this;
    }

    public function removeProduit(Produit $produit): static
    {
        if ($this->produits->removeElement($produit)) {
            // set the owning side to null (unless already changed)
            if ($produit->getCategorie() === $this) {
                $produit->setCategorie(null);
            }
        }
        return $this;
    }
}
