<?php
// src/Entity/Commande.php

namespace App\Entity;

use App\Repository\CommandeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CommandeRepository::class)]
class Commande
{
    #[ORM\Id]
    #[ORM\Column(type: Types::STRING, length: 100)]
    #[ORM\GeneratedValue(strategy: "NONE")]
    private ?string $refCommande = null;

    #[ORM\ManyToOne(targetEntity: Client::class, inversedBy: 'commandes')]
    #[ORM\JoinColumn(name: 'ref_client', referencedColumnName: 'ref_client', nullable: false)]
    private ?Client $client = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class, inversedBy: 'commandesLivraison')]
    #[ORM\JoinColumn(name: 'ref_adresse', referencedColumnName: 'ref_adresse', nullable: false)]
    private ?Adresse $adresseLivraison = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class, inversedBy: 'commandesFacturation')]
    #[ORM\JoinColumn(name: 'ref_adresse_facturation', referencedColumnName: 'ref_adresse', nullable: false)]
    private ?Adresse $adresseFacturation = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateCommande = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateUpdate = null;

    #[ORM\Column(type: Types::STRING, length: 32, nullable: true)]
    private ?string $methodeLivraison = null;

    #[ORM\Column(type: Types::STRING, length: 32, nullable: true)]
    private ?string $fraisLivraison = null;

    #[ORM\Column(type: Types::STRING, length: 32, nullable: true)]
    private ?string $statutCommande = null;

    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: Paiement::class)]
    private Collection $paiements;

    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: Panier::class)]
    private Collection $paniers;

    public function __construct()
    {
        $this->paiements = new ArrayCollection();
        $this->paniers = new ArrayCollection();
    }

    public function getRefCommande(): ?string
    {
        return $this->refCommande;
    }

    public function setRefCommande(string $refCommande): static
    {
        $this->refCommande = $refCommande;
        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;
        return $this;
    }

    public function getAdresseLivraison(): ?Adresse
    {
        return $this->adresseLivraison;
    }

    public function setAdresseLivraison(?Adresse $adresseLivraison): static
    {
        $this->adresseLivraison = $adresseLivraison;
        return $this;
    }

    public function getAdresseFacturation(): ?Adresse
    {
        return $this->adresseFacturation;
    }

    public function setAdresseFacturation(?Adresse $adresseFacturation): static
    {
        $this->adresseFacturation = $adresseFacturation;
        return $this;
    }

    public function getDateCommande(): ?\DateTimeInterface
    {
        return $this->dateCommande;
    }

    public function setDateCommande(?\DateTimeInterface $dateCommande): static
    {
        $this->dateCommande = $dateCommande;
        return $this;
    }

    public function getStatutCommande(): ?string
    {
        return $this->statutCommande;
    }

    public function setStatutCommande(?string $statutCommande): static
    {
        $this->statutCommande = $statutCommande;
        return $this;
    }

    /**
     * @return Collection<int, Paiement>
     */
    public function getPaiements(): Collection
    {
        return $this->paiements;
    }

    public function addPaiement(Paiement $paiement): static
    {
        if (!$this->paiements->contains($paiement)) {
            $this->paiements->add($paiement);
            $paiement->setCommande($this);
        }
        return $this;
    }

    public function removePaiement(Paiement $paiement): static
    {
        if ($this->paiements->removeElement($paiement)) {
            if ($paiement->getCommande() === $this) {
                $paiement->setCommande(null);
            }
        }
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
            $panier->setCommande($this);
        }
        return $this;
    }

    public function removePanier(Panier $panier): static
    {
        if ($this->paniers->removeElement($panier)) {
            if ($panier->getCommande() === $this) {
                $panier->setCommande(null);
            }
        }
        return $this;
    }
}
// src/Entity/Commande.php

// namespace App\Entity;

// use App\Repository\CommandeRepository;
// use Doctrine\Common\Collections\ArrayCollection;
// use Doctrine\Common\Collections\Collection;
// use Doctrine\DBAL\Types\Types; 
// use Doctrine\ORM\Mapping as ORM;

// #[ORM\Entity(repositoryClass: CommandeRepository::class)]
// class Commande
// {
//     #[ORM\Id]
//     #[ORM\Column(type: Types::STRING, length: 100)] 
//     #[ORM\GeneratedValue(strategy: "NONE")] 
//     private ?string $refCommande = null;

//     #[ORM\ManyToOne(targetEntity: Client::class, inversedBy: 'commandes')]
//     #[ORM\JoinColumn(name: 'ref_client', referencedColumnName: 'ref_client', nullable: false)]
//     private ?Client $client = null;

//     #[ORM\ManyToOne(targetEntity: Adresse::class, inversedBy: 'commandesLivraison')]
//     #[ORM\JoinColumn(name: 'ref_adresse', referencedColumnName: 'ref_adresse', nullable: false)]
//     private ?Adresse $adresseLivraison = null;

//     #[ORM\ManyToOne(targetEntity: Adresse::class, inversedBy: 'commandesFacturation')]
//     #[ORM\JoinColumn(name: 'ref_adresse_facturation', referencedColumnName: 'ref_adresse', nullable: false)]
//     private ?Adresse $adresseFacturation = null;

//     #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)] 
//     private ?\DateTimeInterface $dateCommande = null;

//     #[ORM\Column(type: Types::STRING, length: 32, nullable: true)]
//     private ?string $statutCommande = null;

//     #[ORM\OneToMany(mappedBy: 'commande', targetEntity: Paiement::class)]
//     private Collection $paiements;

//     #[ORM\OneToMany(mappedBy: 'commande', targetEntity: Panier::class)]
//     private Collection $paniers;

//     public function __construct()
//     {
//         $this->paiements = new ArrayCollection();
//         $this->paniers = new ArrayCollection();
//     }

//     public function getRefCommande(): ?string
//     {
//         return $this->refCommande;
//     }

//     public function setRefCommande(string $refCommande): static
//     {
//         $this->refCommande = $refCommande;
//         return $this;
//     }

//     public function getClient(): ?Client
//     {
//         return $this->client;
//     }

//     public function setClient(?Client $client): static
//     {
//         $this->client = $client;
//         return $this;
//     }

//     public function getAdresseLivraison(): ?Adresse
//     {
//         return $this->adresseLivraison;
//     }

//     public function setAdresseLivraison(?Adresse $adresseLivraison): static
//     {
//         $this->adresseLivraison = $adresseLivraison;
//         return $this;
//     }

//     public function getAdresseFacturation(): ?Adresse
//     {
//         return $this->adresseFacturation;
//     }

//     public function setAdresseFacturation(?Adresse $adresseFacturation): static
//     {
//         $this->adresseFacturation = $adresseFacturation;
//         return $this;
//     }

//     public function getDateCommande(): ?\DateTimeInterface
//     {
//         return $this->dateCommande;
//     }

//     public function setDateCommande(?\DateTimeInterface $dateCommande): static
//     {
//         $this->dateCommande = $dateCommande;
//         return $this;
//     }

//     public function getStatutCommande(): ?string
//     {
//         return $this->statutCommande;
//     }

//     public function setStatutCommande(?string $statutCommande): static
//     {
//         $this->statutCommande = $statutCommande;
//         return $this;
//     }

//     /**
//      * @return Collection<int, Paiement>
//      */
//     public function getPaiements(): Collection
//     {
//         return $this->paiements;
//     }

//     public function addPaiement(Paiement $paiement): static
//     {
//         if (!$this->paiements->contains($paiement)) {
//             $this->paiements->add($paiement);
//             $paiement->setCommande($this);
//         }
//         return $this;
//     }

//     public function removePaiement(Paiement $paiement): static
//     {
//         if ($this->paiements->removeElement($paiement)) {
//             if ($paiement->getCommande() === $this) {
//                 $paiement->setCommande(null);
//             }
//         }
//         return $this;
//     }

//     /**
//      * @return Collection<int, Panier>
//      */
//     public function getPaniers(): Collection
//     {
//         return $this->paniers;
//     }

//     public function addPanier(Panier $panier): static
//     {
//         if (!$this->paniers->contains($panier)) {
//             $this->paniers->add($panier);
//             $panier->setCommande($this);
//         }
//         return $this;
//     }

//     public function removePanier(Panier $panier): static
//     {
//         if ($this->paniers->removeElement($panier)) {
//             if ($panier->getCommande() === $this) {
//                 $panier->setCommande(null);
//             }
//         }
//         return $this;
//     }
// } 