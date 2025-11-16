<?php

namespace App\Entity;

use App\Repository\ProduitRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProduitRepository::class)]
class Produit
{
    #[ORM\Id]
    #[ORM\Column(name: 'NUM_PRODUIT',type: Types::INTEGER)]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[Groups(['product:read'])]
    private ?int $numProduit = null;

    #[ORM\ManyToOne(targetEntity: Categorie::class, inversedBy: 'produits')]
    #[ORM\JoinColumn(name: 'CODE_CATEGORIE', referencedColumnName: 'CODE_CATEGORIE', nullable: false ,onDelete:'CASCADE')]
    private ?Categorie $categorie = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)]
    #[Groups(['product:read'])]
    private ?string $nomProduit = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    #[Groups(['product:read'])]
    private ?string $prixProduit = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    #[Groups(['product:read'])]
    private ?int $stockProduit = null;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    #[Groups(['product:read'])]
    private ?string $imageUrlProduit = null;
    
    #[ORM\Column(name: 'description_produit', type: Types::STRING, length: 255, nullable: true)]
    #[Groups(['category:read', 'groupe:write'])]
    private ?string $descriptionProduit = null;
    
    #[ORM\Column(type: Types::STRING, length: 10, nullable: true)]
    #[Groups(['product:read'])]
    private ?string $codePromos = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeInterface $dateMiseAJourProduit = null;


    #[ORM\OneToMany(mappedBy: 'produit', targetEntity: Panier::class)]
    private Collection $paniers;

    public function isProdutActif():bool
    {
        return $this->stockProduit > 10;
    }
    public function __construct()
    {
        $this->paniers = new ArrayCollection();
    }
    
    public function getDateMiseAJourProduit(): ?\DateTimeInterface
    {
        return $this->dateMiseAJourProduit;
    }

    public function setDateMiseAJourProduit(?\DateTimeInterface $dateMiseAJour): static
    {
        $this->dateMiseAJourProduit = $dateMiseAJour;
        return $this;
    }
    public function mettreAjourDate(): self 
    {
        $this->dateMiseAJourProduit = new DateTimeImmutable();
        return $this;
    }

    public function getNumProduit(): ?int
    {
        return $this->numProduit;
    }

    public function setNumProduit(int $numProduit): static
    {
        $this->numProduit = $numProduit;
        return $this;
    }

    public function getCategorie(): ?Categorie
    {
        return $this->categorie;
    }

    
    public function getDescriptionProduit(): ?string
    {
        return $this->descriptionProduit;
    }

    public function setDescriptionProduit(?string $description): static
    {
        $this->descriptionProduit = $description;
        return $this;
    }

    public function setCategorie(?Categorie $categorie): static
    {
        $this->categorie = $categorie;
        return $this;
    }

    public function getNomProduit(): ?string
    {
        return $this->nomProduit;
    }

    public function setNomProduit(?string $nomProduit): static
    {
        $this->nomProduit = $nomProduit;
        return $this;
    }

    public function getPrixProduit(): ?string
    {
        return $this->prixProduit;
    }

    public function setPrixProduit(?string $prixProduit): static
    {
        $this->prixProduit = $prixProduit;
        return $this;
    }

    public function getStockProduit(): ?int
    {
        return $this->stockProduit;
    }

    public function setStockProduit(?int $stockProduit): static
    {
        $this->stockProduit = $stockProduit;
        return $this;
    }

    public function getImageUrlProduit(): ?string
    {
        return $this->imageUrlProduit;
    }

    public function setImageUrlProduit(?string $imageUrlProduit): static
    {
        $this->imageUrlProduit = $imageUrlProduit;
        return $this;
    }

    public function getCodePromos(): ?string
    {
        return $this->codePromos;
    }

    public function setCodePromos(?string $codePromos): static
    {
        $this->codePromos = $codePromos;
        return $this;
    }

    /**
     * @return Collection<int, Panier>
     */
    public function getPaniers(): Collection
    {
        return $this->paniers;
    }

    public function addPanier(Panier $panier): static
    {
        if (!$this->paniers->contains($panier)) {
            $this->paniers->add($panier);
            $panier->setProduit($this);
        }
        return $this;
    }

    public function removePanier(Panier $panier): static
    {
        if ($this->paniers->removeElement($panier)) {
            if ($panier->getProduit() === $this) {
                $panier->setProduit(null);
            }
        }
        return $this;
    }
}
