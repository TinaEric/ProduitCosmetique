<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\Commande;
use App\Entity\User;
use App\Service\FactureService;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/factures')]
class FactureController extends AbstractController
{
    public function __construct(
        private FactureService $factureService,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/commande/{refCommande}', name: 'api_facture_commande', methods: ['GET'])]
    public function genererFactureCommande(string $refCommande): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        return $this->handleFactureGeneration($refCommande, false);
    }

    #[Route('/adminFacture/{refCommande}', name: 'api_admin_facture_commande', methods: ['GET'])]
    public function genererFactureCommandeAdmin(string $refCommande): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        return $this->handleFactureGeneration($refCommande, true);
    }

    #[Route('/commande/{refCommande}/disponible', name: 'api_facture_disponible', methods: ['GET'])]
    public function factureDisponible(string $refCommande): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        $commande = $this->entityManager->getRepository(Commande::class)->find($refCommande);

        if (!$commande) {
            return $this->errorResponse(404, 'Commande non trouvée');
        }

        $user = $this->getUser();
        if (!$user instanceof User || $commande->getClient()?->getRefClient() !== $user->getClient()?->getRefClient()) {
            return $this->errorResponse(403, 'Accès non autorisé');
        }

        $statutAutorise = $this->isStatutAutorise($commande->getStatutCommande());

        return new JsonResponse([
            'disponible' => $statutAutorise,
            'statut' => $commande->getStatutCommande(),
            'ref_commande' => $commande->getRefCommande(),
            'date_commande' => $commande->getDateCommande()->format('d/m/Y'),
            'montant_total' => $commande->getMontantTotal(),
        ]);
    }

    // Méthodes privées
    private function handleFactureGeneration(string $refCommande, bool $isAdmin): Response
    {
        try {
            $commande = $isAdmin
                ? $this->entityManager->getRepository(Commande::class)->findOneBy(['refCommande' => $refCommande])
                : $this->entityManager->getRepository(Commande::class)->find($refCommande);

            if (!$commande) {
                return $this->errorResponse(404, 'Commande non trouvée');
            }

            if (!$isAdmin) {
                $user = $this->getUser();
                if (!$user instanceof User || $commande->getClient()?->getRefClient() !== $user->getClient()?->getRefClient()) {
                    return $this->errorResponse(403, 'Accès non autorisé');
                }
            }

            if (!$this->isStatutAutorise($commande->getStatutCommande())) {
                return $this->errorResponse(400, 'Facture non disponible pour ce statut de commande');
            }

            $pdfPath = $this->factureService->genererFacturePdf($commande);
            $filename = sprintf('facture_%s.pdf', $commande->getRefCommande());

            return $this->factureService->getFactureResponse($pdfPath, $filename);

        } catch (\Exception $e) {
            return $this->errorResponse(500, 'Erreur lors de la génération de la facture', $e->getMessage());
        }
    }

    private function isStatutAutorise(string $statut): bool
    {
        return in_array($statut, ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE'], true);
    }

    private function errorResponse(int $code, string $message, ?string $details = null): JsonResponse
    {
        $error = [
            'error' => [
                'code' => $code,
                'message' => $message,
                'status' => 'error',
            ]
        ];

        if ($details) {
            $error['error']['details'] = $details;
        }

        return new JsonResponse($error, $code);
    }
}




// namespace App\Controller;

// use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
// use Symfony\Component\HttpFoundation\JsonResponse;
// use Symfony\Component\HttpFoundation\Response;
// use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;
// use App\Entity\Commande;
// use App\Entity\User;
// use App\Service\FactureService;
// use Doctrine\ORM\EntityManagerInterface;

// #[Route('/api/factures')]
// class FactureController extends AbstractController
// {
//     private $factureService;
//     private $entityManager;

//     public function __construct(FactureService $factureService, EntityManagerInterface $entityManager)
//     {
//         $this->factureService = $factureService;
//         $this->entityManager = $entityManager;
//     }

//     #[Route('/commande/{refCommande}', name: 'api_facture_commande', methods: ['GET'])]
//     #[IsGranted('ROLE_USER')]
//     public function genererFactureCommande(string $refCommande): Response
//     {
//         try {
//             $commande = $this->entityManager->getRepository(Commande::class)->find($refCommande);
            
//             if (!$commande) {
//                 return $this->json([
//                     'error' => [
//                         'code' => 404,
//                         'message' => 'Commande non trouvée dans BD',
//                         'status' => 'error'
//                         ]
//                     ],404) ;
//             }

//             $user = $this->getUser();

//             if (!$user instanceof User) {
//                 return $this->json([
//                     'error' => [
//                         'code' => 401,
//                         'message' => 'Utilisateur non valide ou non connecté.',
//                         'status' => 'error'
//                         ]
//                     ],401) ;
//             }

//             // Vérifier que l'utilisateur est le propriétaire de la commande
//             if ($commande->getClient() && $commande->getClient()->getRefClient() !== $user->getClient()->getRefClient()) {
//                 return $this->json([
//                     'error' => [
//                         'code' => 403,
//                         'message' => 'Accès non autorisé',
//                         'status' => 'error'
//                         ]
//                     ],403) ;
//             }

//             // Vérifier si le statut permet la génération de facture
//             $statutAutorise = in_array($commande->getStatutCommande(), [
//                 'EN_PREPARATION',
//                 'EXPEDIEE',
//                 'LIVREE'
//             ]);

//             if (!$statutAutorise) {
//                 return $this->json([
//                     'error' => [
//                         'code' => 400,
//                         'message' => 'Facture non disponible pour ce statut de commande',
//                         'status' => 'error'
//                         ]
//                     ],400) ;
//                 // return new JsonResponse([
//                 //     'error' => 'Facture non disponible pour ce statut de commande',
//                 //     'statut' => $commande->getStatutCommande(),
//                 //     'statuts_autorises' => ['EN_PREPARATION', 'EXPEDIEE', 'LIVREE']
//                 // ], 400);
//             }

//             // Générer le PDF
//             $pdfPath = $this->factureService->genererFacturePdf($commande);
            
//             // Créer le nom de fichier
//             $filename = sprintf('facture_%s.pdf', $commande->getRefCommande());
            
//             // Retourner le PDF
//             return $this->factureService->getFactureResponse($pdfPath, $filename);
            
//         } catch (\Exception $e) {
//             return $this->json([
//                 'error' => [
//                     'code' => 500,
//                     'message' =>'Erreur lors de la génération de la facture' .  $e->getMessage() . '\n Trace: ' . $e->getTraceAsString(),
//                     'status' => 'error'
//                     ]
//                 ],500) ;
//         }
//     }

//     #[Route('/adminFacture/{ref}', name: 'api_admin_facture_commande', methods: ['GET'])]
//     #[IsGranted('ROLE_ADMIN')]
//     public function genererFactureCommandeAdmin(string $ref): Response
//     {
//         try {
//             $commande = $this->entityManager->getRepository(Commande::class)->findOneBy([
//                 'refCommande' => $ref
//             ]);
            
//             if (!$commande) {
//                 return new JsonResponse(['error' => 'Commande non trouvée'], 404);
//             }

//             // Vérifier si le statut permet la génération de facture
//             $statutAutorise = in_array($commande->getStatutCommande(), [
//                 'EN_PREPARATION',
//                 'EXPEDIEE',
//                 'LIVREE'
//             ]);

//             if (!$statutAutorise) {
//                 return new JsonResponse([
//                     'error' => 'Facture non disponible pour ce statut de commande',
//                     'statut' => $commande->getStatutCommande()
//                 ], 400);
//             }

//             // Générer le PDF
//             $pdfPath = $this->factureService->genererFacturePdf($commande);
            
//             // Créer le nom de fichier
//             $filename = sprintf('facture_%s.pdf', $commande->getRefCommande());
            
//             // Retourner le PDF
//             return $this->factureService->getFactureResponse($pdfPath, $filename);
            
//         } catch (\Exception $e) {
//             return new JsonResponse([
//                 'error' => 'Erreur lors de la génération de la facture',
//                 'message' => $e->getMessage()
//             ], 500);
//         }
//     }

//     #[Route('/commande/{refCommande}/disponible', name: 'api_facture_disponible', methods: ['GET'])]
//     #[IsGranted('ROLE_USER')]
//     public function factureDisponible(string $refCommande): JsonResponse
//     {
//         try {
//             $commande = $this->entityManager->getRepository(Commande::class)->find($refCommande);
            
//             if (!$commande) {
//                 return new JsonResponse(['error' => 'Commande non trouvée'], 404);
//             }
//             $user = $this->getUser();

//             if (!$user instanceof User) {
//                 return $this->json([
//                     'error' => [
//                         'code' => 401,
//                         'message' => 'Utilisateur non valide ou non connecté.',
//                         'status' => 'error'
//                         ]
//                     ],401) ;
//             }

//             // Vérifier que l'utilisateur est le propriétaire de la commande
//             if ($commande->getClient() && $commande->getClient()->getRefClient() !== $user->getClient()->getRefClient()) {
//                 return new JsonResponse(['error' => 'Accès non autorisé'], 403);
//             }

//             $statutAutorise = in_array($commande->getStatutCommande(), [
//                 'EN_PREPARATION',
//                 'EXPEDIEE',
//                 'LIVREE'
//             ]);

//             return new JsonResponse([
//                 'disponible' => $statutAutorise,
//                 'statut' => $commande->getStatutCommande(),
//                 'ref_commande' => $commande->getRefCommande(),
//                 'date_commande' => $commande->getDateCommande()->format('d/m/Y'),
//                 'montant_total' => $commande->getMontantTotal(),
//             ]);
            
//         } catch (\Exception $e) {
//             return new JsonResponse([
//                 'error' => 'Erreur lors de la vérification',
//                 'message' => $e->getMessage()
//             ], 500);
//         }
//     }

//     #[Route('/test/{id}', name: 'api_facture_test', methods: ['GET'])]
//     #[IsGranted('ROLE_USER')]
//     public function testFacture(int $id): JsonResponse
//     {
//         $commande = $this->entityManager->getRepository(Commande::class)->find($id);
      
//         if (!$commande) {
//             return $this->json([
//                 'error' => [
//                     'code' => 404,
//                     'message' => 'Commande non trouvée',
//                     'status' => 'error'
//                     ]
//                 ],404) ;
//         }

//         return new JsonResponse([
//             'id' => $commande->getRefCommande(),
//             'ref_commande' => $commande->getRefCommande(),
//             'statut' => $commande->getStatutCommande(),
//             'montant_total' => $commande->getMontantTotal(),
//             'frais_livraison' => $commande->getFraisLivraison(),
//             'date_commande' => $commande->getDateCommande()->format('Y-m-d H:i:s'),
//             'client' => $commande->getClient() ? [
//                 'id' => $commande->getClient()->getRefClient(),
//                 'nom' => $commande->getClient()->getNomClient(),
//                 'prenom' => $commande->getClient()->getPrenomClient(),
//                 'telephone' => $commande->getClient()->getTelephoneClient(),
//             ] : null,
//             'paniers_count' => $commande->getPaniers()->count(),
//             'adresse_livraison' => $commande->getAdresseLivraison() ? [
//                 'ville' => $commande->getAdresseLivraison()->getVille(),
//                 'quartier' => $commande->getAdresseLivraison()->getQuartier(),
//             ] : null,
//         ]);
//     }

// }