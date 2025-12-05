<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\Panier;
use App\Entity\Produit;
use App\Repository\ClientRepository;
use App\Repository\CommandeRepository;
use App\Repository\PanierRepository;
use App\Repository\ProduitRepository;
use App\Service\DashboardService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    private const NOTIFICATION_TIME_WINDOW = '24 hours ago';

    public function __construct(
        private SerializerInterface $serializer
    ) {}

    #[Route('/notifications', name: 'api_admin_notifications', methods: ['GET'])]
    public function getNotifications(
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        try {
            $dateLimit = new \DateTime(self::NOTIFICATION_TIME_WINDOW); // date limite pour les notifications
            $recentOrders = $em->getRepository(Commande::class)->findRecentOrders($dateLimit);
            $recentClients = $em->getRepository(Client::class)->findRecentClient();
            $criticalProducts = $em->getRepository(Produit::class)->findProduitStockAlerte();
            $outOfStockProducts = $em->getRepository(Produit::class)->findProduitRuptureStock();
            $allProducts = array_merge($criticalProducts, $outOfStockProducts);  // Combiner les produits en alerte et en rupture

            $jsonContent = $serializer->serialize($recentClients, 'json', [
                'groups' => 'client:read'
            ]);
            $clientData = json_decode($jsonContent, true);
            foreach ($clientData as &$client) {
                $client['unread'] = true; // Ajout de la valeur unread=true pour chaque élément
            }

            $notifications = [
                'commandeNotifie' => $this->formatOrders($recentOrders),
                // 'clientNotifie' => $this->formatClients($recentClients),
                'clientNotifie' => $clientData,
                'produitNotifie' => $this->formatProducts($allProducts),
            ];

            return new JsonResponse([
                'status' => 'success',
                'data' => [
                    'notifications' => $notifications,
                    'timestamp' => (new \DateTime())->format('c')
                ] ,
                'message' => 'Notifications récupérées avec succès',
            ], 200);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur SERVEUR NOTIFICATION: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/notifications/mark-read/{type}/{id}', name: 'api_admin_mark_notification_read', methods: ['POST'])]
    public function markNotificationRead(
        Request $request,
        string $type,
        int $id
    ): JsonResponse {
        return new JsonResponse([
            'status' => 'success',
            'message' => 'Notification marquée comme lue',
            'type' => $type,
            'id' => $id
        ]);
    }

    /**
     * Formate les commandes pour les notifications
     */
    private function formatOrders(array $orders): array
    {
        if (empty($orders)){
            return [];
        }
        
        $formatted = [];
        
        foreach ($orders as $order) {
            $formatted[] = [
                'id' => $order->getRefCommande(),
                'refCommande' => $order->getRefCommande(),
                'client' => $order->getClient() ? [
                    'nomClient' => $order->getClient()->getNomClient(),
                    'prenomClient' => $order->getClient()->getPrenomClient(),
                    'telephoneClient' => $order->getClient()->getTelephoneClient(),
                ] : null,
                'dateCommande' => $order->getDateCommande() ? $order->getDateCommande()->format('c') : null,
                'statutCommande' => $order->getStatutCommande(),
                'methodePaiement' => $order->getMethodePaiement(),
                'montantTotal' => $this->calculateOrderTotal($order),
                'unread' => true,
                'priority' => $this->getOrderPriority($order->getStatutCommande()),
            ];
        }
        
        return $formatted;
    }

    /**
     * Formate les clients pour les notifications
     */
    private function formatClients(array $clients): array
    {
        if (empty($client)){
            return [];
        }

        $formatted = [];
        
        foreach ($clients as $client) {
            $user = $client->getUser();
            $formatted[] = [
                'id' => $client->getRefClient(),
                'refClient' => $client->getRefClient(),
                'nomClient' => $client->getNomClient(),
                'prenomClient' => $client->getPrenomClient(),
                'dateInscription' => $client->getDateInscription() ? $client->getDateInscription()->format('c') : null,
                'telephoneClient' => $client->getTelephoneClient(),
                'civiliteClient' => $client->getCiviliteClient(),
                'user' => $user ? [
                    'id' => $user->getId(),
                    'nomUsers' => $user->getNomUsers(),
                    'emailUsers' => $user->getEmailUsers(),
                    'roleUsers' => $user->getRoleUsers(),
                ] : null,
                'unread' => true,
            ];
        }
        
        return $formatted;
    }

    /**
     * Formate les produits pour les notifications
     */
    private function formatProducts(array $products): array
    {
        if (empty($products)){
            return [];
        }

        $formatted = [];
        
        foreach ($products as $product) {
            if (!$product instanceof Produit) {
                continue; // ou logger une erreur
            }
            $stockStatus = $this->determineStockStatus($product->getStockProduit());
            
            if ($stockStatus !== 'normal') {
                $formatted[] = [
                    'id' => $product->getNumProduit(),
                    'numProduit' => $product->getNumProduit(),
                    'nomProduit' => $product->getNomProduit(),
                    'stockProduit' => $product->getStockProduit(),
                    'stockMinimum' => 10, // Valeur par défaut
                    'stockStatus' => $stockStatus,
                    'categorie' => $product->getCategorie() ? $product->getCategorie()->getLibelleCategorie() : 'Non catégorisé',
                    'dateUpdate' => $product->getDateMiseAJourProduit() ? $product->getDateMiseAJourProduit()->format('c') : null,
                    'unread' => true,
                    'priority' => $stockStatus === 'rupture' ? 'high' : 'medium',
                ];
            }
        }
        
        return $formatted;
    }

    /**
     * Calcule le total d'une commande
     */
    private function calculateOrderTotal(Commande $order): string
    {
        $total = '0.00';
        
        // Calculer le total à partir des paniers
        $paniers = $order->getPaniers();
        if (!$paniers->isEmpty()) {
            foreach ($paniers as $panier) {
                // Vérifiez que la méthode getSousTotal existe
                if (method_exists($panier, 'getSousTotal')) {
                    $sousTotal = $panier->getSousTotal();
                    $total = bcadd($total, $sousTotal, 2);
                }
            }
        }
        
        // Ajouter les frais de livraison si disponibles
        $fraisLivraison = $order->getFraisLivraison();
        if ($fraisLivraison) {
            $total = bcadd($total, $fraisLivraison, 2);
        }
        
        return $total;
    }

    /**
     * Détermine le statut du stock
     */
    private function determineStockStatus(?int $currentStock): string
    {
        if ($currentStock === null) {
            return 'normal';
        }
        
        if ($currentStock <= 0) {
            return 'rupture';
        }
        
        if ($currentStock <= 10) {
            return 'alerte';
        }
        
        return 'normal';
    }

    /**
     * Détermine la priorité d'une commande
     */
    private function getOrderPriority(?string $status): string
    {
        return match($status) {
            'INITIALISE' => 'high',
            'EN_ATTENTE_PAIEMENT' => 'high',
            'EN_PREPARATION' => 'medium',
            'EXPEDIEE' => 'low',
            'LIVREE' => 'low',
            default => 'low',
        };
    }

    #[Route('/dashboard/stats', name: 'admin_dashboard_stats', methods: ['GET'])]
    public function getDashboard(DashboardService $dashboardService): JsonResponse
    {
        try {
            $stats = $dashboardService->getDashboardStats();
            
            return $this->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    #[Route('/dashboard/sales', name: 'admin_dashboard_sales', methods: ['GET'])]
    public function getSalesData(DashboardService $dashboardService): JsonResponse
    {
        try {
            $salesData = $dashboardService->getSalesData();
            
            return $this->json([
                'success' => true,
                'data' => $salesData
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    #[Route('/statHome', name: 'admin_statHome_dashboard', methods: ['GET'])]
    public function getDashboardStats(
        EntityManagerInterface $entityManager,

    ): JsonResponse
    {
        try {
            $totalClient = $entityManager->getRepository(Client::class)->count([]);
            $totalProduit = $entityManager->getRepository(Produit::class)->count([]);
            $commandeRepo = $entityManager->getRepository(Commande::class);
            $totalCommande = $commandeRepo->count([]);
            $totalRevenue = $commandeRepo->getTotalRevenue();

            $stats = [
                'totalClient' => $totalClient,
                'totalProduit' => $totalProduit,
                'totalCommande' => $totalCommande,
                'totalRevenue' => (float) $totalRevenue,
            ];

            return new JsonResponse([
                'message' => 'Statistiques du tableau de bord récupérées avec succès.',
                'data' => $stats,
                'status' => 'success'
            ], 200);

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