<?php
namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Doctrine\Common\Collections\ArrayCollection;

class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPasswordUsers($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Trouve un utilisateur par email
     */
    public function findByEmail(string $email): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.emailUsers = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Trouve un utilisateur par nom d'utilisateur
     */
    public function findByUsername(string $username): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.nomUsers = :username')
            ->setParameter('username', $username)
            ->getQuery()
            ->getOneOrNullResult();
    }
    
    public function findNonClientUsers(): array
    {
        return $this->createQueryBuilder('u')
            // 'u.client' fait référence à la propriété $client (OneToOne) dans l'entité User.
            // La condition IS NULL filtre les utilisateurs pour lesquels cette relation n'existe pas.
            ->where('u.client IS NULL') 
            ->getQuery()
            ->getResult()
        ;
    }

    public function findUserLoginVerifier(string $email, string $role): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.emailUsers = :email')
            ->andWhere('u.roleUsers = :role')
            ->setParameter('email', $email)
            ->setParameter('role', $role)
            ->getQuery()
            ->getOneOrNullResult();
    }
}