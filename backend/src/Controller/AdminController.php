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
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use \DateTimeImmutable; // Pour la date de naissance (si elle est de type DateTimeImmutable)
use \DateTime;

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
        SerializerInterface $serializer,
        CommandeRepository $cmd,
        ClientRepository $cli,
        ProduitRepository $prod
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        
        try {
            $dateLimit = new \DateTime(self::NOTIFICATION_TIME_WINDOW); // date limite pour les notifications
            $recentOrders = $cmd->findRecentOrders($dateLimit);
            $recentClients = $cli->findRecentClient();
            $criticalProducts = $prod->findProduitStockAlerte();
            $outOfStockProducts = $prod->findProduitRuptureStock();
            $allProducts = array_merge($criticalProducts, $outOfStockProducts);  // Combiner les produits en alerte et en rupture

            $jsonContent = $serializer->serialize($recentClients, 'json', [
                'groups' => 'client:read'
            ]);
            $clientData = json_decode($jsonContent, true);
            foreach ($clientData as &$client) {
                $client['unread'] = true; 
            }

            // $ordersJson = $serializer->serialize($recentOrders, 'json', [
            //     'groups' => ['commande:read', 'client:read', 'paiement:read']
            // ]);
            
            // $ordersData = json_decode($ordersJson, true);
            
            // // Ajouter les flags supplémentaires
            // foreach ($ordersData as &$order) {
            //     $order['unread'] = true;
            //     // $order['type'] = 'nouvelle_commande';
            // }
            $data = $serializer->serialize($recentOrders, 'json', [
                'groups' => 'commande:read'
            ]);
            $orders = json_decode($data, true);
            foreach ($orders as &$order) {
                $order['unread'] = true; 
            }

            $notifications = [
                // 'commandeNotifie' =>$this->formatOrders($recentOrders),
                'commandeNotifie' => $orders,
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
            $client = $order->getClient();
            $adresse = $order->getAdresseLivraison();
            $adresseF = $order->getAdresseFacturation();
            $paiement = $order->getPaiement();
            $formatted[] = [
                'refCommande' => $order->getRefCommande(),
                'dateCommande' => $order->getDateCommande() ? $order->getDateCommande()->format('c') : null,
                'statutCommande' => $order->getStatutCommande(),
                'methodePaiement' => $order->getMethodePaiement(),
                'adresseLivraison' => $adresse ? [
                    'id' => $adresse->getRefAdresse(),
                    'quartier' => $adresse->getQuartier(),
                    'ville' => $adresse->getVille(),
                    'codePostal' => $adresse->getCodePostal(),
                    'lot' => $adresse->getLot(),
                    'labelle'  => $adresse->getLibelleAdresse(),
                    'complement'  => $adresse->getComplementAdresse(),
                ] : null,
                'adresseFacturation' => $adresseF ? [
                    'id' => $adresseF->getRefAdresse(),
                    'quartier' => $adresseF->getQuartier(),
                    'ville' => $adresseF->getVille(),
                    'codePostal' => $adresseF->getCodePostal(),
                    'lot' => $adresseF->getLot(),
                    'labelle'  => $adresseF->getLibelleAdresse(),
                    'complement'  => $adresseF->getComplementAdresse(),
                ] : null,
                'client' => $client ? [
                    'refClient' => $client->getRefClient(),
                    'nomClient' => $client->getNomClient(),
                    'prenomClient' => $client->getPrenomClient(),
                    'telephoneClient' => $client->getTelephoneClient(),
                    'civiliteClient' => $client->getCiviliteClient(),
                    'dateNaissance' => $client->getDateNaissance()?->format('Y-m-d'),
                    'dateInscription' => $client->getDateInscription()?->format('Y-m-d H:i:s'),
                    'user' => $client->getUser() ? [
                        'id' => $client->getUser()->getId(),
                        'nomUsers' => $client->getUser()->getNomUsers(),
                        'emailUsers' => $client->getUser()->getEmailUsers(),
                        'roleUsers' => $client->getUser()->getRoleUsers(),
                    ] : null,
                ]: null,
                'paiement' => $paiement ? [
                    
                ] : null,

                //plus
                'id' => $order->getRefCommande(),
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

    #[Route("/updateClient", name: "admin_update_client", methods: ["POST"])]
    public function updateClient(
        Request $request,
        SerializerInterface $serializer,
        EntityManagerInterface $em,
        ClientRepository $clientRepository,
        ValidatorInterface $validator
    ): JsonResponse {
        try {
            
            $data = json_decode($request->getContent(), true);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Invalid JSON body ' . $e->getMessage(),
                    'status' => 'error'
                ]], Response::HTTP_BAD_REQUEST);
        }

        // 2. Vérifier si la référence client (clé primaire) est présente
        if (!isset($data['refCLient'])) {
             // Si 'refCLient' n'est pas là, vérifier si l'ID utilisateur est là pour une recherche alternative
             if (!isset($data['id'])) {
                return new JsonResponse([
                    'error' => [
                        'code' => 500,
                        'message' => 'Client identifier (refCLient or id) is missing.',
                        'status' => 'error'
                    ]], Response::HTTP_BAD_REQUEST);
             }
             // Si 'refCLient' est absent mais 'id' est là, on doit faire une recherche par l'ID de l'utilisateur.
             // Cette recherche nécessite une méthode dans ClientRepository pour chercher par ID User.
             $client = $clientRepository->findOneByUserId($data['id']); // **ATTENTION : NÉCESSITE LA MÉTHODE SUIVANTE**
        } else {
             // Recherche standard par la clé primaire (refClient)
             $clientRef = $data['refCLient'];
             /** @var Client|null $client */
             $client = $clientRepository->find($clientRef);
        }

        if (!$client) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Client not found with the provided identifier.',
                    'status' => 'error'
                ]], Response::HTTP_NOT_FOUND);
        }

        // 3. Mettre à jour l'entité avec les nouvelles données
        
        // Mappage: JSON key -> Entité Setter
        
        // refCLient (si la référence peut être modifiée, sinon ce bloc est ignoré)
        if (isset($data['refCLient'])) {
            $client->setRefClient($data['refCLient']);
        }

        // Nom
        if (isset($data['nom'])) {
            $client->setNomClient($data['nom']);
        }
        
        // Prénom
        if (isset($data['prenom'])) {
            $client->setPrenomClient($data['prenom']);
        }
        
        // Téléphone
        if (isset($data['telephone'])) {
            $client->setTelephoneClient($data['telephone']);
        }
        
        // Civilité
        if (isset($data['civilite'])) {
            $client->setCiviliteClient($data['civilite']);
        }
        
        // Email (il est lié à l'entité User, mais si le client a un getter/setter il faut l'utiliser.
        // Puisque 'email' est dans le payload mais n'est pas une propriété de Client, nous supposons qu'il faut mettre à jour l'entité User associée.
        if (isset($data['email']) && $client->getUser() !== null) {
            $client->getUser()->setEmailUsers($data['email']);
        }
        
        // Traitement de la date de naissance (DateTimeInterface)
        if (isset($data['dateNaissance']) && !empty($data['dateNaissance'])) {
            try {
                // Tenter de créer un objet DateTimeImmutable, ou DateTime si le format JSON le supporte
                $dateNaissance = new DateTimeImmutable($data['dateNaissance']);
                $client->setDateNaissance($dateNaissance);
            } catch (\Exception $e) {
                // Si DateTimeImmutable échoue, tenter DateTime
                try {
                    $dateNaissance = new DateTime($data['dateNaissance']);
                    $client->setDateNaissance($dateNaissance);
                } catch (\Exception $e) {
                    return new JsonResponse(['error' =>  [
                        'code' => 500,
                        'message' => 'Invalid date format for dateNaissance.',
                        'status' => 'error'
                    ]
                    
                ], Response::HTTP_BAD_REQUEST);
                }
            }
        }
        
        // 4. Validation des données (Client et User lié)
        $errors = $validator->validate($client);
        // Si vous mettez à jour l'utilisateur, vous devriez aussi le valider :
        if ($client->getUser() !== null) {
             $errors->addAll($validator->validate($client->getUser()));
        }

        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = [
                    'property' => $error->getPropertyPath(),
                    'value' => $error->getInvalidValue(),
                    'message' => $error->getMessage(),
                ];
            }
            return new JsonResponse(['error' =>  [
                'code' => 500,
                'message' => 'Validation Error : ' . $errorMessages,
                'status' => 'error'
            ]
        ], Response::HTTP_BAD_REQUEST);
        }

        // 5. Persister les changements dans la base de données
        try {
            // Le flush va sauvegarder Client ET User grâce au cascade persist
            $em->flush(); 
        } catch (\Exception $e) {
            return new JsonResponse(['error' =>  [
                'code' => 500,
                'message' => 'An error occurred while saving changes to the database: ' . $e->getMessage(),
                'status' => 'error'
            ]
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // 6. Retourner une réponse de succès
        // Utilisation du groupe 'client:read' pour serialiser la réponse
        $updatedClientJson = $serializer->serialize($client, 'json', ['groups' => 'client:read']); 
        
        return new JsonResponse(
            [
                'message' => 'Client updated successfully', 
                'data' => [
                    'client' => json_decode($updatedClientJson)
                ],
                'status' => 'success',
            ],Response::HTTP_OK
        );
    }

    // #[Route('/dashboard/chartData', name: 'admin_chart_data', methods: ['GET'])]
    // public function getChartData(EntityManagerInterface $em): JsonResponse
    // {
      
    //         $monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
    //                     'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            
    //         $today = new \DateTime();
            
    //         $months = [];
    //         for ($i = 4; $i >= 0; $i--) {
    //             $monthDate = clone $today;
    //             $monthDate->modify("-$i months");
                
    //             $monthNum = (int)$monthDate->format('n');
    //             $year = (int)$monthDate->format('Y');
                
    //             $months[] = [
    //                 'name' => $monthsFr[$monthNum - 1],
    //                 'number' => $monthNum,
    //                 'year' => $year,
    //                 'start' => $monthDate->format('Y-m-01'),
    //                 'end' => $monthDate->format('Y-m-t')
    //             ];
    //         }
            
    //         $result = [];
            
    //         foreach ($months as $month) {
    //             // Calculer les ventes pour ce mois
    //             $qb = $em->createQueryBuilder();
    //             $qb->select('COALESCE(SUM(c.montantTotal), 0) as ventes, COALESCE(COUNT(c.refCommande), 0) as commandes')
    //                 ->from(Commande::class, 'c')
    //                 ->where('c.dateCommande BETWEEN :start AND :end')
    //                 ->andWhere('c.statutCommande = :statut')
    //                 ->setParameter('start', $month['start'] . ' 00:00:00')
    //                 ->setParameter('end', $month['end'] . ' 23:59:59')
    //                 ->setParameter('statut', 'LIVREE');
                
    //             $data = $qb->getQuery()->getSingleResult();
                
    //             $result[] = [
    //                 'mois' => $month['name'],
    //                 'ventes' => (float)$data['ventes'],
    //                 'commandes' => (int)$data['commandes']
    //             ];
    //         }
            
    //         return $this->json([
    //             'success' => true,
    //             'data' => $result
    //         ]);
    // }
    #[Route('/dashboard/chartData', name: 'admin_chart_data', methods: ['GET'])]
public function getChartData(EntityManagerInterface $em): JsonResponse
{
    $monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 
                'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    $today = new \DateTime();
    
    $months = [];
    for ($i = 4; $i >= 0; $i--) {
        $monthDate = clone $today;
        $monthDate->modify("-$i months");
        
        $monthNum = (int)$monthDate->format('n');
        $year = (int)$monthDate->format('Y');
        
        $months[] = [
            'name' => $monthsFr[$monthNum - 1],
            'number' => $monthNum,
            'year' => $year,
            'start' => $monthDate->format('Y-m-01'),
            'end' => $monthDate->format('Y-m-t')
        ];
    }
    
    $result = [];
    
    foreach ($months as $month) {
        $qb = $em->createQueryBuilder();
        $qb->select('COALESCE(SUM(c.montantTotal), 0) as ventes, COALESCE(COUNT(c.refCommande), 0) as commandes')
            ->from(Commande::class, 'c')
            ->innerJoin('c.paiement', 'p')
            ->where('c.dateCommande BETWEEN :start AND :end')
            ->andWhere('p.statutPaiment = :statutPaiement')
            ->setParameter('start', $month['start'] . ' 00:00:00')
            ->setParameter('end', $month['end'] . ' 23:59:59')
            ->setParameter('statutPaiement', 'PAYEE');
        
        $data = $qb->getQuery()->getSingleResult();
        
        $result[] = [
            'mois' => $month['name'],
            'ventes' => (float)$data['ventes'],
            'commandes' => (int)$data['commandes']
        ];
    }
    
    return $this->json([
        'success' => true,
        'data' => $result
    ]);
}
}