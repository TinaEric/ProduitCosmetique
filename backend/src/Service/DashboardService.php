<?php
namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;

class DashboardService
{
    private $entityManager;
    
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    
    public function getDashboardStats(): array
    {
        $connection = $this->entityManager->getConnection();
        
        // Totaux actuels
        $totalClient = $connection->executeQuery('SELECT COUNT(*) FROM client')->fetchOne();
        $totalProduit = $connection->executeQuery('SELECT COUNT(*) FROM produit')->fetchOne();
        $totalCommande = $connection->executeQuery('SELECT COUNT(*) FROM commande')->fetchOne();
        $totalRevenue = $connection->executeQuery("SELECT SUM(montant_total) FROM commande WHERE statut = 'LIVREE'")->fetchOne() ?? 0;
        
        // Taux de croissance (mois en cours vs mois précédent)
        $currentMonth = date('Y-m');
        $previousMonth = date('Y-m', strtotime('-1 month'));
        
        // Revenu croissance
        $revenueGrowth = $this->calculateMonthlyGrowth(
            'commande',
            'montant_total',
            "statut = 'LIVREE'"
        );
        
        // Client croissance
        $customerGrowth = $this->calculateMonthlyGrowth(
            'client',
            '1',
            "1=1"
        );
        
        // Commande croissance
        $orderGrowth = $this->calculateMonthlyGrowth(
            'commande',
            '1',
            "1=1"
        );
        
        // Produit croissance (nouvelles créations)
        $productGrowth = $this->calculateMonthlyGrowth(
            'produit',
            '1',
            "1=1"
        );
        
        return [
            'totalClient' => (int)$totalClient,
            'totalProduit' => (int)$totalProduit,
            'totalCommande' => (int)$totalCommande,
            'totalRevenue' => (float)$totalRevenue,
            'revenueGrowth' => $revenueGrowth,
            'customerGrowth' => $customerGrowth,
            'orderGrowth' => $orderGrowth,
            'productGrowth' => $productGrowth
        ];
    }
    
    private function calculateMonthlyGrowth(string $table, string $field, string $condition): float
    {
        $connection = $this->entityManager->getConnection();
        
        $sql = "
            WITH monthly_data AS (
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as mois,
                    SUM({$field}) as total
                FROM {$table}
                WHERE {$condition}
                AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY mois DESC
                LIMIT 2
            )
            SELECT 
                IFNULL(
                    ROUND(
                        (MAX(CASE WHEN rn = 1 THEN total END) - 
                         MAX(CASE WHEN rn = 2 THEN total END)) / 
                        NULLIF(MAX(CASE WHEN rn = 2 THEN total END), 0) * 100, 
                    2), 
                    0
                ) as growth_rate
            FROM (
                SELECT 
                    mois,
                    total,
                    ROW_NUMBER() OVER (ORDER BY mois DESC) as rn
                FROM monthly_data
            ) as ranked
        ";
        
        return (float)$connection->executeQuery($sql)->fetchOne();
    }
    
    public function getSalesData(int $months = 12): array
    {
        $connection = $this->entityManager->getConnection();
        
        $sql = "
            SELECT 
                DATE_FORMAT(c.date_commande, '%b') as mois,
                DATE_FORMAT(c.date_commande, '%m') as mois_num,
                COUNT(c.id) as commandes,
                COALESCE(SUM(c.montant_total), 0) as ventes
            FROM commande c
            WHERE c.date_commande >= DATE_SUB(NOW(), INTERVAL :months MONTH)
            AND c.statut = 'LIVREE'
            GROUP BY DATE_FORMAT(c.date_commande, '%Y-%m'), DATE_FORMAT(c.date_commande, '%b')
            ORDER BY DATE_FORMAT(c.date_commande, '%Y-%m')
        ";
        
        $result = $connection->executeQuery($sql, ['months' => $months])->fetchAllAssociative();
        
        // Transformer en format adapté pour le frontend
        $salesData = [];
        foreach ($result as $row) {
            $salesData[] = [
                'mois' => $this->translateMonth($row['mois']),
                'ventes' => (float)$row['ventes'],
                'commandes' => (int)$row['commandes']
            ];
        }
        
        return $salesData;
    }
    
    private function translateMonth(string $month): string
    {
        $translations = [
            'Jan' => 'Jan', 'Feb' => 'Fév', 'Mar' => 'Mar',
            'Apr' => 'Avr', 'May' => 'Mai', 'Jun' => 'Jun',
            'Jul' => 'Jul', 'Aug' => 'Aoû', 'Sep' => 'Sep',
            'Oct' => 'Oct', 'Nov' => 'Nov', 'Dec' => 'Déc'
        ];
        
        return $translations[$month] ?? $month;
    }
}