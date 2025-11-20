<?php
namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups; // Import crucial


#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'user')] 
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(["user:read","client:read","commande:read"])] // Visible pour l'Admin via Client
    private ?int $idUsers = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    #[Groups(["user:read","client:read","commande:read"])] 
    private ?string $nomUsers = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $passwordUsers = null; // PAS de groupe de sérialisation pour le mot de passe !

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    #[Groups(["user:read","client:read","commande:read"])] // Exposer l'email pour l'Admin
    private ?string $emailUsers = null;

    #[ORM\Column(type: 'string', length: 32, nullable: true)]
    #[Groups(["user:read","commande:read"])] 
    private ?string $roleUsers = null; 

    #[ORM\OneToOne(mappedBy: 'user', targetEntity: Client::class, cascade: ['persist', 'remove'])]
    private ?Client $client = null;

    public function getIdUsers(): ?int
    {
        return $this->idUsers;
    }

    public function getNomUsers(): ?string
    {
        return $this->nomUsers;
    }

    public function setNomUsers(?string $nomUsers): static
    {
        $this->nomUsers = $nomUsers;
        return $this;
    }

    public function getPasswordUsers(): ?string
    {
        return $this->passwordUsers;
    }

    public function setPasswordUsers(?string $passwordUsers): static
    {
        $this->passwordUsers = $passwordUsers;
        return $this;
    }

    public function getEmailUsers(): ?string
    {
        return $this->emailUsers;
    }

    public function setEmailUsers(?string $emailUsers): static
    {
        $this->emailUsers = $emailUsers;
        return $this;
    }

    public function getRoleUsers(): ?string
    {
        return $this->roleUsers;
    }

    public function setRoleUsers(?string $roleUsers): static
    {
        $this->roleUsers = $roleUsers;
        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        if ($client !== null && $client->getUser() !== $this) {
            $client->setUser($this);
        }

        $this->client = $client;
        return $this;
    }

    /**
     * Implémentation de PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->passwordUsers;
    }

    public function getRoles(): array
    {
        // Votre logique pour gérer les rôles est correcte, mais utilisez la propriété `roleUsers` 
        // comme base si elle stocke le rôle principal.
        $roles = [$this->roleUsers ?? 'ROLE_USER'];
        
        // Garantit que chaque utilisateur a au moins ROLE_USER
        if (!in_array('ROLE_USER', $roles)) {
            $roles[] = 'ROLE_USER';
        }
        
        return array_unique($roles);
    }

    /**
     * Implémentation de UserInterface
     */
    public function eraseCredentials(): void
    {
        // Vide les données sensibles non persistantes.
    }

    /**
     * Implémentation de UserInterface: l'identifiant unique
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->emailUsers;
    }


    /**
     * Méthode alternative pour getUserIdentifier (pour compatibilité)
     * @deprecated since Symfony 5.3, use getUserIdentifier() instead
     */
    public function getUsername(): string
    {
        return $this->getUserIdentifier();
    }
}
