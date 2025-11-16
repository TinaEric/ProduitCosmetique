<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Throwable;


#[Route('/api/user')]
class UserController extends AbstractController
{
    #[Route('/registre', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository 
    ): JsonResponse {
        
        $data = json_decode($request->getContent(), true);
  
        // Validation des champs requis
        if (empty($data['email']) || empty($data['password']) || empty($data['username'])) {
            return new JsonResponse(['message' => 'Tous les champs sont obligatoires!'], 400);
        }

        // Vérifier si l'email existe déjà - CORRECTION: utiliser emailUsers au lieu de email
        if ($userRepository->findOneBy(['emailUsers' => $data['email']])) {
            return new JsonResponse(['message' => 'Cet email est déjà associé à un compte.'], 409);
        }

        $user = new User();
        $user->setEmailUsers($data['email']);
        $user->setRoleUsers('ROLE_USER'); 
        $user->setNomUsers($data['username']); 
        
        // Hachage du mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPasswordUsers($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        // SUPPRIMER la ligne qui lance une exception
        // throw new \Exception("erreur force: ");

        return new JsonResponse([
            'message' => 'Inscription réussie !',
            'user' => [
                'id' => $user->getIdUsers(),
                'email' => $user->getEmailUsers(),
                'username' => $user->getNomUsers()
            ]
        ], 201);
    }
    
    
    #[Route('/profile', name: 'api_profile', methods: ['GET'])]
    public function getProfile(Security $security): JsonResponse
    {
        $user = $security->getUser(); 

        if (!$user) {
            return new JsonResponse(['message' => 'Non authentifié'], 401);
        }

        if (!$user instanceof User) {
            return new JsonResponse([
                'message' => 'Type utilisateur inattendu',
                'user_type' => get_class($user),
            ], 500);
        }

        return new JsonResponse([
            'message' => 'Profil utilisateur',
            'user' => [
                'id' => $user->getIdUsers(),
                'email' => $user->getEmailUsers(),
                'username' => $user->getNomUsers(),
                'roles' => $user->getRoles(),
            ]
        ]);
    }

    #[Route('/userAdmin', name: 'api_users_non_clients', methods: ['GET'])]
    public function UserAdmin(UserRepository $userRepository, SerializerInterface $serializer): JsonResponse
    {
        // Sécurité : Seul un Administrateur peut voir la liste des utilisateurs non-clients.
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        try {
            // Appel de la méthode personnalisée du Repository
            $users = $userRepository->findNonClientUsers();

            if (empty($users)) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Aucun utilisateur sans profil client trouvé.",
                        'status' => 'error'
                    ]
                ], 404);
            }
            
            // Sérialisation en utilisant le groupe "client:read" (défini dans User.php pour exposer les infos)
            $jsonContent = $serializer->serialize($users, 'json', [
                'groups' => 'client:read'
            ]);

            // Retourner les données enveloppées dans la structure pour le Frontend.
            return $this->json([
                'data' => json_decode($jsonContent, true), 
                'status' => 'success'
            ], 200);

        } catch (Throwable $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }


    #[Route('/{id}', name: 'api_user_update', methods: ['PUT'])]
    public function updateUser(
        Request $request,
        User $user = null,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier les permissions
        $currentUser = $this->getUser();
        if ($currentUser !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['message' => 'Accès non autorisé'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['username'])) {
            $user->setNomUsers($data['username']);
        }

        if (isset($data['email'])) {
            // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
            $existingUser = $entityManager->getRepository(User::class)->findOneBy(['emailUsers' => $data['email']]);
            if ($existingUser && $existingUser->getIdUsers() !== $user->getIdUsers()) {
                return new JsonResponse(['message' => 'Cet email est déjà utilisé'], 409);
            }
            $user->setEmailUsers($data['email']);
        }

        if (isset($data['password'])) {
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPasswordUsers($hashedPassword);
        }

        // Seul un admin peut changer les rôles
        if (isset($data['role']) && $this->isGranted('ROLE_ADMIN')) {
            $user->setRoleUsers($data['role']);
        }

        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => [
                'id' => $user->getIdUsers(),
                'email' => $user->getEmailUsers(),
                'username' => $user->getNomUsers(),
                'roles' => $user->getRoles(),
            ]
        ]);
    }

    #[Route('/{id}', name: 'api_user_delete', methods: ['DELETE'])]
    public function deleteUser(User $user = null, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Seul un admin peut supprimer des utilisateurs, ou l'utilisateur peut se supprimer lui-même
        $currentUser = $this->getUser();
        if ($currentUser !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['message' => 'Accès non autorisé'], 403);
        }

        // Empêcher un utilisateur de se supprimer lui-même si c'est le seul admin
        if ($currentUser === $user && $this->isGranted('ROLE_ADMIN')) {
            $adminCount = $entityManager->getRepository(User::class)->count(['roleUsers' => 'ROLE_ADMIN']);
            if ($adminCount <= 1) {
                return new JsonResponse(['message' => 'Impossible de supprimer le seul administrateur'], 400);
            }
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur supprimé avec succès']);
    }
}