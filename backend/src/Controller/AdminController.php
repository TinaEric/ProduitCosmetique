<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\Panier;
use App\Entity\Produit;
use App\Repository\CommandeRepository;
use App\Repository\PanierRepository;
use App\Repository\ProduitRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    #[Route('/statHome', name: 'admin_dashboard', methods: ['GET'])]
    public function dashboard(EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        try {
        // Vérification de l'utilisateur connecté
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse([
                'error' => [
                    'code' => JsonResponse::HTTP_UNAUTHORIZED,
                    'message' => 'Utilisateur non connecté ou non autorisé.',
                    'status' => 'error'
                ]
               ,
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Vérification du type d'utilisateur
        if (!$currentUser instanceof User) {
            return new JsonResponse([
                'error' => [
                    'code' => JsonResponse::HTTP_UNAUTHORIZED,
                    'message' => 'Utilisateur non valide ou non connecté.',
                    'status' => 'error'
                ]
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Statistiques pour le dashboard
        $commandeCount = $em->getRepository(Commande::class)->count([]);
        $clientCount = $em->getRepository(Client::class)->count([]);
        $produitCount = $em->getRepository(Produit::class)->count([]);
        $totalRevenus = $em->getRepository(Panier::class)->getTotalRevenus();
        
            return new JsonResponse([
                'message' => 'ok, efa io aby',
                'data' => [
                    'totalProduit'  => $produitCount,
                    'totalCommande'  => $commandeCount,
                    'totalClient'  => $clientCount,
                    'totalRevenus'  => $totalRevenus
                ],
                'status' => 'success'
            ],200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/recentCommande', name: 'admnin_recentCommande', methods: ['GET'])]
    public function recentCommande(CommandeRepository $cmd): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        try {
        // Vérification de l'utilisateur connecté
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse([
                'error' => [
                    'code' => JsonResponse::HTTP_UNAUTHORIZED,
                    'message' => 'Utilisateur non connecté ou non autorisé.',
                    'status' => 'error'
                ]
               ,
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Vérification du type d'utilisateur
        if (!$currentUser instanceof User) {
            return new JsonResponse([
                'error' => [
                    'code' => JsonResponse::HTTP_UNAUTHORIZED,
                    'message' => 'Utilisateur non valide ou non connecté.',
                    'status' => 'error'
                ]
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }
        $recentCommande = $cmd->recentCommande();

        return new JsonResponse([
            'message' => 'ok, efa io aby',
            'data' => [
                'recentCommande' => $recentCommande,
            ],
            'status' => 'success'
        ],200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/topProduit', name: 'admin_topProduit', methods: ['GET'])]
    public function topProduit(ProduitRepository $produit): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        try {
        // Vérification de l'utilisateur connecté
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse([
                'error' => [
                    'code' => JsonResponse::HTTP_UNAUTHORIZED,
                    'message' => 'Utilisateur non connecté ou non autorisé.',
                    'status' => 'error'
                ]
               ,
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Vérification du type d'utilisateur
        if (!$currentUser instanceof User) {
            return new JsonResponse([
                'error' => [
                    'code' => JsonResponse::HTTP_UNAUTHORIZED,
                    'message' => 'Utilisateur non valide ou non connecté.',
                    'status' => 'error'
                ]
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }
       
        $topProduit = $produit->findTopProduit(5);

        return new JsonResponse([
            'message' => 'ok, efa io aby',
            'data' => [
                'topProduit' => $topProduit,
            ],
            'status' => 'success'
        ],200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }
    
    #[Route('/users', name: 'admin_users', methods: ['GET'])]
    public function getUsers(EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $users = $em->getRepository(User::class)->findAll();
        
        $usersData = [];
        foreach ($users as $user) {
            $userData = [
                'idUsers' => $user->getIdUsers(),
                'nomUsers' => $user->getNomUsers(),
                'emailUsers' => $user->getEmailUsers(),
                'roleUsers' => $user->getRoleUsers(),
            ];
            
            if ($user->getClient()) {
                $client = $user->getClient();
                $userData['client'] = [
                    'refClient' => $client->getRefClient(),
                    'nomClient' => $client->getNomClient(),
                    'prenomClient' => $client->getPrenomClient(),
                ];
            }
            
            $usersData[] = $userData;
        }
        
        return new JsonResponse(['users' => $usersData]);
    }

    #[Route('/clients', name: 'admin_clients', methods: ['GET'])]
    public function getClients(EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $clients = $em->getRepository(Client::class)->findAll();
        
        $clientsData = [];
        foreach ($clients as $client) {
            $user = $client->getUser();
            $clientsData[] = [
                'refClient' => $client->getRefClient(),
                'nomClient' => $client->getNomClient(),
                'prenomClient' => $client->getPrenomClient(),
                'telephoneClient' => $client->getTelephoneClient(),
                'civiliteClient' => $client->getCiviliteClient(),
                'dateNaissance' => $client->getDateNaissance()?->format('Y-m-d'),
                'user' => [
                    'idUsers' => $user->getIdUsers(),
                    'emailUsers' => $user->getEmailUsers(),
                    'nomUsers' => $user->getNomUsers(),
                ]
            ];
        }
        
        return new JsonResponse(['clients' => $clientsData]);
    }

    #[Route('/user/create', name: 'admin_user_create', methods: ['POST'])]
    public function createUser(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        $data = json_decode($request->getContent(), true);
        
        $user = new User();
        $user->setEmailUsers($data['emailUsers']);
        $user->setNomUsers($data['nomUsers']);
        $user->setRoleUsers($data['roleUsers'] ?? 'ROLE_CLIENT');
        
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPasswordUsers($hashedPassword);
        
        $em->persist($user);
        $em->flush();
        
        return new JsonResponse([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'idUsers' => $user->getIdUsers(),
                'emailUsers' => $user->getEmailUsers(),
                'nomUsers' => $user->getNomUsers(),
                'roleUsers' => $user->getRoleUsers(),
            ]
        ]);
    }
}