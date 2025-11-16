<?php
// src/Controller/AuthController.php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Entity\Client;
use App\Repository\ClientRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Throwable;

class AuthController extends AbstractController
{
    #[Route('/api/auth/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Cette méthode doit exister mais peut être vide
        // LexikJWT gère l'authentification automatiquement via le firewall
        return new JsonResponse(['message' => 'Login handled by JSON login']);
    }


    #[Route('/api/auth/register', name: 'api_Client_register', methods: ['POST'])]
    public function register(
        Request $request,
        JWTTokenManagerInterface $jwtManager,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ClientRepository $CliRepos
    ): JsonResponse {


        try {

            $data = json_decode($request->getContent(), true);
            
            if (
                empty($data['email']) || empty($data['password']) ||
                empty($data['prenom']) || empty($data['nom']) || empty($data['dateNaissance']) ||
                empty($data['telephone']) || empty($data['civilite'])
            ) {
                return $this->json([
                    'error' => [
                        'code' => 422,
                        'message' => 'Les champs vides ne sont pas autorisés',
                        'status' => 'error'
                    ]
                ], 422);
            }
            $user = new User();
            $user->setEmailUsers($data['email']);
            $user->setNomUsers($data['prenom']);
            $user->setRoleUsers('ROLE_USER');
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPasswordUsers($hashedPassword);

            $client = new Client();
            $client->setRefClient($CliRepos->RefClientSuivant());
            $client->setNomClient($data['nom']);
            $client->setPrenomClient($data['prenom']);
            $client->setTelephoneClient($data['telephone']);
            $client->setCiviliteClient($data['civilite']);

            if (!empty($data['dateNaissance'])) {
                try {
                    $client->setDateNaissance(new \DateTimeImmutable($data['dateNaissance']));
                } catch (\Exception $e) {
                    error_log("Invalid dateNaissance format provided during registration: " . $data['dateNaissance']);
                    $client->setDateNaissance(null);
                }
            }

            // $user->setClient($client);
            $client->setUser($user);

            $entityManager->persist($user);
            $entityManager->persist($client);
            $entityManager->flush();

            $token = $jwtManager->create($user);

            return new JsonResponse([
                'message' => 'Votre compte a été créé avec succés.',
                'token' => $token,
                'user' => [
                    'idUsers' => $user->getIdUsers(),
                    'emailUsers' => $user->getEmailUsers(),
                    'nomUsers' => $user->getNomUsers(),
                    'roleUsers' => $user->getRoleUsers(),
                    'client' => [
                        'refClient' => $client->getRefClient(),
                        'nomClient' => $client->getNomClient(),
                        'prenomClient' => $client->getPrenomClient(),
                        'telephoneClient' => $client->getTelephoneClient(),
                        'civiliteClient' => $client->getCiviliteClient(),
                        'dateNaissance' => $client->getDateNaissance()?->format('Y-m-d'),
                    ]
                    ],
            ], 201);
        } catch (Throwable $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage() . 'Erreur Complet : ' . $e,
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/api/auth/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return new JsonResponse([
                'status' => 'error',
                'error' => 'Utilisateur non authentifié.',
                'data' => null
            ], 401);
        }

        // Utilisation de la fonction d'extraction manuelle
        $userData = $this->formatUserData($user);

        return new JsonResponse([
            'status' => 'success',
            'data' => $userData,
            'error' => null
        ]);
    }

    private function formatUserData(User $user): array
    {
        $client = $user->getClient();

        // 1. Formatage des données des Adresses
        $adressesData = [];
        if ($client && $client->getAdresses()->count() > 0) {
            /** @var Adresse $adresse */
            foreach ($client->getAdresses() as $adresse) {
                // Construction manuelle du tableau pour chaque adresse
                $adressesData[] = [
                    'refAdresse' => $adresse->getRefAdresse(),
                    'ville' => $adresse->getVille(),
                    'codePostal' => $adresse->getCodePostal(),
                    'quartier' => $adresse->getQuartier(),
                    'lot' => $adresse->getLot(),
                    'libelleAdresse' => $adresse->getLibelleAdresse(),
                ];
            }
        }

        // 2. Formatage des données du Client
        $clientData = null;
        if ($client) {
            $clientData = [
                'refClient' => $client->getRefClient(),
                'nomClient' => $client->getNomClient(),
                'prenomClient' => $client->getPrenomClient(),
                'telephoneClient' => $client->getTelephoneClient(),
                'civiliteClient' => $client->getCiviliteClient(),
                'dateNaissance' => $client->getDateNaissance() ? $client->getDateNaissance()->format('Y-m-d') : null,
                'adresses' => $adressesData, // Inclusion des adresses formatées
            ];
        }

        // 3. Formatage des données de l'Utilisateur
        $userData = [
            'idUsers' => $user->getIdUsers(),
            'emailUsers' => $user->getEmailUsers(),
            'roles' => $user->getRoles(),
            'client' => $clientData, // Inclusion des données client formatées
        ];

        return $userData;
    }

    #[Route('/api/auth/admin/register', name: 'api_register_admin', methods: ['POST'])]
    public function registerAdmin(
        Request $request,
        JWTTokenManagerInterface $jwtManager,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {


            $data = json_decode($request->getContent(), true);

            // Vérifier si l'utilisateur actuel est admin
            // $this->denyAccessUnlessGranted('ROLE_ADMIN'); // Décommenter si l'accès doit être protégé

            $user = new User();
            $user->setEmailUsers($data['email']);
            $user->setNomUsers($data['nomUser']);

            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPasswordUsers($hashedPassword);
            $user->setRoleUsers('ROLE_ADMIN');

            $entityManager->persist($user);
            $entityManager->flush();

            return new JsonResponse([
                'message' => 'Admin created successfully',
                'user' => [
                    'idUser' => $user->getIdUsers(),
                    'email' => $user->getEmailUsers(),
                    'nomUser' => $user->getNomUsers(),
                    'roleUser' => $user->getRoleUsers(),
                ]
            ], 201);
        } catch (\Throwable $e) {

            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' =>  $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }
}
