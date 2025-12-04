<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Entity\User;
use App\Entity\Produit;
use App\Repository\ClientRepository;
use App\Repository\CommandeRepository;
use App\Repository\UserRepository;
use App\Repository\ProduitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

class NotificationController extends AbstractController
{
    private const NOTIFICATION_TIME_WINDOW = '24 hours ago'; // Fenêtre temporelle pour les notifications

    public function __construct(
        private SerializerInterface $serializer
    ) {}

    #[Route('/api/adminNotifie/notifications', name: 'api_admin_notifications', methods: ['GET'])]
    public function getNotifications(
        Request $request,
        CommandeRepository $commandeRepository,
        ClientRepository $userRepository,
        ProduitRepository $produitRepository
    ): JsonResponse {
        // Vérifier que l'utilisateur est admin
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        // Récupérer la date limite pour les notifications
        $dateLimit = new \DateTime(self::NOTIFICATION_TIME_WINDOW);

        $recentOrders = $commandeRepository->findRecentOrders($dateLimit);
        $recentUsers = $userRepository->findRecentUsers($dateLimit);
        $criticalProducts = $produitRepository->findProductsWithLowStock();

        // Formater les données
        $notifications = [
            'commandeNotifie' => $this->formatOrders($recentOrders),
            'clientNotifie' => $this->formatClients($recentUsers),
            'produitNotifie' => $this->formatProducts($criticalProducts),
        ];

        return new JsonResponse([
            'status' => 'success',
            'data' => [
                'notifications' => $notifications,
                'timestamp' => new \DateTime(),
            ],
            'message' => 'Notifications récupérées avec succès'
        ]);
    }

    #[Route('/notifications/mark-read/{type}/{id}', name: 'api_admin_mark_notification_read', methods: ['POST'])]
    public function markNotificationRead(
        Request $request,
        string $type,
        int $id
    ): JsonResponse {
        // Cette méthode pourrait être utilisée pour marquer une notification comme lue en base de données
        // Pour l'instant, nous retournons simplement un succès
        
        // Logique à implémenter selon vos besoins :
        // - Soit vous avez un champ "is_read" dans vos entités
        // - Soit vous gérez cela en session/frontend

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
        $formatted = [];
        
        foreach ($orders as $order) {
            $formatted[] = [
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
                'unread' => true, // Par défaut, toutes les nouvelles commandes sont non lues
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
        $formatted = [];
        
        foreach ($clients as $client) {
            $user = $client->getUser();
            $formatted[] = [
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
        $formatted = [];
        
        foreach ($products as $product) {
            $stockStatus = $this->determineStockStatus($product->getStockProduit());
            
            if ($stockStatus !== 'normal') {
                $formatted[] = [
                    'numProduit' => $product->getNumProduit(),
                    'nomProduit' => $product->getNomProduit(),
                    'stockProduit' => $product->getStockProduit(),
                    'stockMinimum' => 5,
                    'stockStatus' => $stockStatus,
                    'categorie' => $product->getCategorie() ? $product->getCategorie()->getLibelleCategorie() : 'Non catégorisé',
                    'dateUpdate' => $product->getDateMiseAJourProduit() ? $product->getDateMiseAJourProduit()->format('c') : null,
                    'unread' => true,
                    'priority' => $stockStatus === 'rupture' ? 'high' : ($stockStatus === 'alerte' ? 'medium' : 'low'),
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
        // calcule total à partir des paniers
        if (method_exists($order, 'getPaniers') && !$order->getPaniers()->isEmpty()) {
            $total = '0.00';
            foreach ($order->getPaniers() as $panier) {
                if (method_exists($panier, 'getSousTotal')) {
                    $total = bcadd($total, $panier->getSousTotal(), 2);
                }
            }
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
        
        if ($currentStock <= 10 && $currentStock  > 0 ) {
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
}