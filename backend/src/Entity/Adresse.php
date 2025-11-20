<?php
// src/Entity/Adresse.php

namespace App\Entity;

use App\Repository\AdresseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types; // ✅ AJOUTER CET IMPORT
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AdresseRepository::class)]
class Adresse
{
    #[ORM\Id]
    #[ORM\Column(type: Types::STRING, length: 50)] // ✅ CORRIGER ICI
    #[ORM\GeneratedValue(strategy: "NONE")] // ✅ AJOUTER CETTE LIGNE
    #[Groups(["user:me", "commande:read"])]
    private ?string $refAdresse = null;

    #[ORM\ManyToOne(targetEntity: Client::class, inversedBy: 'adresses')]
    #[ORM\JoinColumn(name: 'ref_client', referencedColumnName: 'ref_client', nullable: false)]
    private ?Client $client = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)] // ✅ CORRIGER ICI
    #[Groups(["user:me", "commande:read"])]
    private ?string $ville = null;

    #[ORM\Column(type: Types::STRING, length: 10, nullable: true)] // ✅ CORRIGER ICI
    #[Groups(["user:me", "commande:read"])]
    private ?string $codePostal = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)] // ✅ CORRIGER ICI
    #[Groups(["user:me", "commande:read"])]
    private ?string $quartier = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)] // ✅ CORRIGER ICI
    #[Groups(["user:me", "commande:read"])]
    private ?string $lot = null;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: true)] // ✅ CORRIGER ICI
    #[Groups(["user:me", "commande:read"])]
    private ?string $libelleAdresse = null;

    #[ORM\Column(type: Types::STRING, length: 100, nullable: true)] // ✅ CORRIGER ICI
    #[Groups(["user:me", "commande:read"])]
    private ?string $complementAdresse = null;

    #[ORM\OneToMany(mappedBy: 'adresseLivraison', targetEntity: Commande::class)]
    private Collection $commandesLivraison;

    #[ORM\OneToMany(mappedBy: 'adresseFacturation', targetEntity: Commande::class)]
    private Collection $commandesFacturation;


    public function __construct()
    {
        $this->commandesLivraison = new ArrayCollection();
        $this->commandesFacturation = new ArrayCollection();
    }

    public function getRefAdresse(): ?string
    {
        return $this->refAdresse;
    }

    public function setRefAdresse(string $refAdresse): static
    {
        $this->refAdresse = $refAdresse;
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

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): static
    {
        $this->ville = $ville;
        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(?string $codePostal): static
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    public function getQuartier(): ?string
    {
        return $this->quartier;
    }

    public function setQuartier(?string $quartier): static
    {
        $this->quartier = $quartier;
        return $this;
    }

    public function getComplementAdresse(): ?string
    {
        return $this->complementAdresse;
    }

    public function setComplementAdresse(?string $complement): static
    {
        $this->complementAdresse = $complement;
        return $this;
    }

    public function getLot(): ?string
    {
        return $this->lot;
    }

    public function setLot(?string $lot): static
    {
        $this->lot = $lot;
        return $this;
    }

    public function getLibelleAdresse(): ?string
    {
        return $this->libelleAdresse;
    }

    public function setLibelleAdresse(?string $libelleAdresse): static
    {
        $this->libelleAdresse = $libelleAdresse;
        return $this;
    }

    /**
     * @return Collection<int, Commande>
     */
    public function getCommandesLivraison(): Collection
    {
        return $this->commandesLivraison;
    }

    public function addCommandesLivraison(Commande $commandesLivraison): static
    {
        if (!$this->commandesLivraison->contains($commandesLivraison)) {
            $this->commandesLivraison->add($commandesLivraison);
            $commandesLivraison->setAdresseLivraison($this);
        }
        return $this;
    }

    public function removeCommandesLivraison(Commande $commandesLivraison): static
    {
        if ($this->commandesLivraison->removeElement($commandesLivraison)) {
            if ($commandesLivraison->getAdresseLivraison() === $this) {
                $commandesLivraison->setAdresseLivraison(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Commande>
     */
    public function getCommandesFacturation(): Collection
    {
        return $this->commandesFacturation;
    }

    public function addCommandesFacturation(Commande $commandesFacturation): static
    {
        if (!$this->commandesFacturation->contains($commandesFacturation)) {
            $this->commandesFacturation->add($commandesFacturation);
            $commandesFacturation->setAdresseFacturation($this);
        }
        return $this;
    }

    public function removeCommandesFacturation(Commande $commandesFacturation): static
    {
        if ($this->commandesFacturation->removeElement($commandesFacturation)) {
            if ($commandesFacturation->getAdresseFacturation() === $this) {
                $commandesFacturation->setAdresseFacturation(null);
            }
        }
        return $this;
    }
}