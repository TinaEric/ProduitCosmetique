<?php

namespace App\Entity;

use App\Repository\ClientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ClientRepository::class)]
class Client
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 32)]
    #[Groups(["user:me", "client:read"])]
    private ?string $refClient = null;

    // CRITIQUE : Suppression du groupe pour casser la référence circulaire !
    #[ORM\OneToOne(inversedBy: 'client', targetEntity: User::class, cascade: ['persist'])]
    #[ORM\JoinColumn(name: 'id_users', referencedColumnName: 'id_users', nullable: false)]
    private ?User $user = null; 

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    #[Groups(["user:me", "client:read"])] 
    private ?string $nomClient = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    #[Groups(["user:me", "client:read"])]
    private ?string $prenomClient = null;

    #[ORM\Column(type: 'string', length: 10, nullable: true)]
    #[Groups(["user:me", "client:read"])]
    private ?string $telephoneClient = null;

    #[ORM\Column(type: 'string', length: 5, nullable: true)]
    #[Groups(["user:me", "client:read"])]
    private ?string $civiliteClient = null;

    #[ORM\Column(type: 'date', nullable: true)]
    #[Groups(["user:me", "client:read"])]
    private ?\DateTimeInterface $dateNaissance = null;

    // Les collections Adresses et Commandes sont par défaut exclues car elles n'ont pas de groupe.

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Adresse::class)]
    #[Groups(["user:me"])]
    private Collection $adresses;

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Commande::class)]
    private Collection $commandes;
    
    // ... (Constructeur, Getters et Setters)

    public function __construct()
    {
        $this->adresses = new ArrayCollection();
        $this->commandes = new ArrayCollection();
    }
    
    public function getRefClient(): ?string
    {
        return $this->refClient;
    }

    public function setRefClient(string $refClient): static
    {
        $this->refClient = $refClient;
        return $this;
    }
    
    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }
    // ... (Autres getters et setters)
    public function getNomClient(): ?string
    {
        return $this->nomClient;
    }

    public function setNomClient(?string $nomClient): static
    {
        $this->nomClient = $nomClient;
        return $this;
    }
    public function getPrenomClient(): ?string
    {
        return $this->prenomClient;
    }

    public function setPrenomClient(?string $prenomClient): static
    {
        $this->prenomClient = $prenomClient;
        return $this;
    }
    public function getTelephoneClient(): ?string
    {
        return $this->telephoneClient;
    }

    public function setTelephoneClient(?string $telephoneClient): static
    {
        $this->telephoneClient = $telephoneClient;
        return $this;
    }
    public function getCiviliteClient(): ?string
    {
        return $this->civiliteClient;
    }

    public function setCiviliteClient(?string $civiliteClient): static
    {
        $this->civiliteClient = $civiliteClient;
        return $this;
    }
    public function getDateNaissance(): ?\DateTimeInterface
    {
        return $this->dateNaissance;
    }

    public function setDateNaissance(?\DateTimeInterface $dateNaissance): static
    {
        $this->dateNaissance = $dateNaissance;
        return $this;
    }

    /**
     * @return Collection<int, Adresse>
     */
    public function getAdresses(): Collection
    {
        return $this->adresses;
    }

    public function addAdresse(Adresse $adresse): static
    {
        if (!$this->adresses->contains($adresse)) {
            $this->adresses->add($adresse);
            $adresse->setClient($this);
        }
        return $this;
    }

    public function removeAdresse(Adresse $adresse): static
    {
        if ($this->adresses->removeElement($adresse)) {
            if ($adresse->getClient() === $this) {
                $adresse->setClient(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Commande>
     */
    public function getCommandes(): Collection
    {
        return $this->commandes;
    }

    public function addCommande(Commande $commande): static
    {
        if (!$this->commandes->contains($commande)) {
            $this->commandes->add($commande);
            $commande->setClient($this);
        }
        return $this;
    }

    public function removeCommande(Commande $commande): static
    {
        if ($this->commandes->removeElement($commande)) {
            if ($commande->getClient() === $this) {
                $commande->setClient(null);
            }
        }
        return $this;
    }
}