<?php
// src/Entity/Paiement.php

namespace App\Entity;

use App\Repository\PaiementRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PaiementRepository::class)]
class Paiement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?string $idPaiement = null;
    
    #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'paiements')]
    #[ORM\JoinColumn(name: 'ref_commande', referencedColumnName: 'ref_commande', nullable: false)]
    private ?Commande $commande = null;

    #[ORM\Column(type: 'string', length: 32, nullable: true)]
    private ?string $modePaiment = null;

    #[ORM\Column(type: 'string', length: 32, nullable: true)]
    private ?string $statutPaiment = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $datePaiment = null;

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    private ?string $referencePaiment = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    private ?string $montantPaye = null;

    public function getIdPaiement(): ?string
    {
        return $this->idPaiement;
    }


    public function getCommande(): ?Commande
    {
        return $this->commande;
    }

    public function setCommande(?Commande $commande): static
    {
        $this->commande = $commande;
        return $this;
    }

    public function getModePaiment(): ?string
    {
        return $this->modePaiment;
    }

    public function setModePaiment(?string $modePaiment): static
    {
        $this->modePaiment = $modePaiment;
        return $this;
    }

    public function getStatutPaiment(): ?string
    {
        return $this->statutPaiment;
    }

    public function setStatutPaiment(?string $statutPaiment): static
    {
        $this->statutPaiment = $statutPaiment;
        return $this;
    }

    public function getDatePaiment(): ?string
    {
        return $this->datePaiment;
    }

    public function setDatePaiment(?string $datePaiment): static
    {
        $this->datePaiment = $datePaiment;
        return $this;
    }

    public function getReferencePaiment(): ?string
    {
        return $this->referencePaiment;
    }

    public function setReferencePaiment(?string $referencePaiment): static
    {
        $this->referencePaiment = $referencePaiment;
        return $this;
    }

    public function getMontantPaye(): ?string
    {
        return $this->montantPaye;
    }

    public function setMontantPaye(?string $montantPaye): static
    {
        $this->montantPaye = $montantPaye;
        return $this;
    }
}