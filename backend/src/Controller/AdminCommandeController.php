<?php
namespace App\Controller;

use App\Entity\Commande;
use App\Repository\CommandeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;

#[Route('/api/admin/commandes')]
class AdminCommandeController extends AbstractController
{
    #[Route('/', name: 'admin_commandes_index', methods: ['GET'])]
    public function index(CommandeRepository $commandeRepository, Request $request, SerializerInterface $serializer): JsonResponse
    {
        try {
            $commandes = $commandeRepository->findAllWithDetails();
            
            if(!$commandes){
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Commande non trouvé ',
                        'status' => 'error'
                    ],
                    'status' => 'error'
                ], 404);
            }

            $context = (new ObjectNormalizerContextBuilder())
                ->withGroups(['commande:read'])
                ->toArray();

            $data = $serializer->serialize($commandes, 'json', $context);

            return new JsonResponse([
                'data' => json_decode($data, true),
                'status' => 'success'
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur lors du chargement des commandes details: ' .  $e->getMessage(),
                    'status' => 'error'
                ],
                'status' => 'error'
            ], 500);
        }
    }

    #[Route('/{refCommande}', name: 'admin_commandes_show', methods: ['GET'])]
    public function show(Request $request, Commande $commande = null): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        try {
            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Commande non trouvée',
                        'status' => 'error'
                    ]
                ], 404);
            }

            return $this->json([
                'data' => $this->serializeCommande($commande),
                'status' => 'success'
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur lors de la récupération de la commande: '.$e->getMessage(),
                    'details' => $this->getParameter('kernel.debug') ? $e->getMessage() : null
                ],
                'status' => 'error'
            ], 500);
        }
    }

    #[Route('/statut/{status}', name: 'admin_commandes_by_status', methods: ['GET', 'OPTIONS'])]
    public function getByStatus(Request $request, string $status, CommandeRepository $commandeRepository): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');


        try {
            $commandes = $commandeRepository->findByStatus($status);
            
            $data = [];
            foreach ($commandes as $commande) {
                $data[] = $this->serializeCommande($commande);
            }

            return $this->json([
                'data' => $data,
                'status' => 'success'
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur lors du filtrage des commandes par statut: '.$e->getMessage() ,
                    'details' => $this->getParameter('kernel.debug') ? $e->getMessage() : null
                ],
                'status' => 'error'
            ], 500);
        }
    }

    #[Route('/{refCommande}/statut', name: 'admin_commandes_update_status', methods: ['PUT', 'OPTIONS'])]
    public function updateStatus(Request $request, Commande $commande = null, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        try {
            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Commande non trouvée',
                        'status' => 'error'
                    ]
                ], 404);
            }

            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['statutCommande'])) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_BAD_REQUEST,
                        'message' => 'Le champ statutCommande est requis',
                        'status' => 'error'
                    ]
                ], Response::HTTP_BAD_REQUEST);
            }

            $commande->setStatutCommande($data['statutCommande']);
            $commande->setDateUpdate(new \DateTime());
            $entityManager->flush();

            return $this->json([
                'data' => $this->serializeCommande($commande),
                'status' => 'success'
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => 'Erreur lors de la mise à jour du statut:'.$e->getMessage(),
                    'details' => $this->getParameter('kernel.debug') ? $e->getMessage() : null
                ],
                'status' => 'error'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function serializeCommande(Commande $commande): array
    {
        try {
            $total = 0;
            $articles = [];
            
            foreach ($commande->getPaniers() as $panier) {
                $produit = $panier->getProduit();
                $prixArticle = $produit->getPrixProduit() * $panier->getQuantite();
                $total += $prixArticle;
                
                $articles[] = [
                    'produit' => $produit->getNomProduit(),
                    'quantite' => $panier->getQuantite(),
                    'prixUnitaire' => $produit->getPrixProduit(),
                    'prixTotal' => $prixArticle
                ];
            }

            $client = $commande->getClient();
            $user = $client->getUser();

            return [
                'refCommande' => $commande->getRefCommande(),
                'client' => [
                    'refClient' => $client->getRefClient(),
                    'nom' => $client->getNomClient(),
                    'prenom' => $client->getPrenomClient(),
                    'email' => $user ? $user->getEmailUsers() : 'Email non disponible',
                ],
                'adresseLivraison' => $this->serializeAdresse($commande->getAdresseLivraison()),
                'adresseFacturation' => $this->serializeAdresse($commande->getAdresseFacturation()),
                'dateCommande' => $commande->getDateCommande()->format('Y-m-d H:i:s'),
                'dateUpdate' => $commande->getDateUpdate() ? $commande->getDateUpdate()->format('Y-m-d H:i:s') : null,
                'methodeLivraison' => $commande->getMethodeLivraison(),
                'fraisLivraison' => $commande->getFraisLivraison(),
                'statutCommande' => $commande->getStatutCommande(),
                'articles' => $articles,
                'totalCommande' => $total + (float) ($commande->getFraisLivraison() ?? 0)
            ];

        } catch (\Exception $e) {
            // En cas d'erreur lors de la sérialisation, retourner une structure minimale
            return [
                'refCommande' => $commande->getRefCommande(),
                'error' => 'Erreur lors de la sérialisation des données',
                'statutCommande' => $commande->getStatutCommande()
            ];
        }
    }

    private function serializeAdresse($adresse): array
    {
        if (!$adresse) {
            return [
                'rue' => 'Non spécifiée',
                'ville' => 'Non spécifiée', 
                'codePostal' => 'Non spécifié',
                'pays' => 'Non spécifié'
            ];
        }

        try {
            return [
                'rue' => $adresse->getRue() ?? 'Non spécifiée',
                'ville' => $adresse->getVille() ?? 'Non spécifiée',
                'codePostal' => $adresse->getCodePostal() ?? 'Non spécifié',
                'pays' => $adresse->getPays() ?? 'Non spécifié'
            ];
        } catch (\Exception $e) {
            return [
                'rue' => 'Erreur de lecture',
                'ville' => 'Erreur de lecture',
                'codePostal' => 'Erreur de lecture',
                'pays' => 'Erreur de lecture'
            ];
        }
    }
}

// namespace App\Controller;

// use App\Entity\Commande;
// use App\Repository\CommandeRepository;
// use Doctrine\ORM\EntityManagerInterface;
// use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
// use Symfony\Component\HttpFoundation\JsonResponse;
// use Symfony\Component\HttpFoundation\Request;
// use Symfony\Component\HttpFoundation\Response;
// use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Serializer\SerializerInterface;

// #[Route('/api/admin/commandes')]
// class AdminCommandeController extends AbstractController
// {
//     #[Route('/', name: 'admin_commandes_index', methods: ['GET'])]
//     public function index(CommandeRepository $commandeRepository): JsonResponse
//     {
//         $commandes = $commandeRepository->findAllWithDetails();
        
//         $data = [];
//         foreach ($commandes as $commande) {
//             $data[] = $this->serializeCommande($commande);
//         }

//         return $this->json([
//             'success' => true,
//             'data' => $data
//         ]);
//     }

//     #[Route('/{refCommande}', name: 'admin_commandes_show', methods: ['GET'])]
//     public function show(Commande $commande): JsonResponse
//     {
//         return $this->json([
//             'success' => true,
//             'data' => $this->serializeCommande($commande)
//         ]);
//     }

//     #[Route('/statut/{status}', name: 'admin_commandes_by_status', methods: ['GET'])]
//     public function getByStatus(string $status, CommandeRepository $commandeRepository): JsonResponse
//     {
//         $commandes = $commandeRepository->findByStatus($status);
        
//         $data = [];
//         foreach ($commandes as $commande) {
//             $data[] = $this->serializeCommande($commande);
//         }

//         return $this->json([
//             'success' => true,
//             'data' => $data
//         ]);
//     }

//     #[Route('/{refCommande}/statut', name: 'admin_commandes_update_status', methods: ['PUT'])]
//     public function updateStatus(Request $request, Commande $commande,EntityManagerInterface $entityManager): JsonResponse
//     {
//         $data = json_decode($request->getContent(), true);
        
//         if (!isset($data['statutCommande'])) {
//             return $this->json([
//                 'success' => false,
//                 'message' => 'Statut manquant'
//             ], Response::HTTP_BAD_REQUEST);
//         }

//         $commande->setStatutCommande($data['statutCommande']);
//         $commande->setDateUpdate(new \DateTime());
//         $entityManager->flush();

//         return $this->json([
//             'success' => true,
//             'message' => 'Statut mis à jour',
//             'data' => $this->serializeCommande($commande)
//         ]);
//     }

//     private function serializeCommande(Commande $commande): array
//     {
//         $total = 0;
//         $articles = [];
        
//         foreach ($commande->getPaniers() as $panier) {
//             // Supposons que votre entité Panier ait des méthodes getPrix() et getQuantite()
//             // Adaptez selon votre structure réelle
//             $prixArticle = $panier->getProduit()->getPrixProduit() * $panier->getQuantite();
//             $total += $prixArticle;
            
//             $articles[] = [
//                 'produit' => $panier->getProduit()->getNomProduit(), // Adaptez selon votre structure
//                 'quantite' => $panier->getQuantite(),
//                 'prixUnitaire' => $panier->getProduit()->getPrixProduit(),
//                 'prixTotal' => $prixArticle
//             ];
//         }

//         return [
//             'refCommande' => $commande->getRefCommande(),
//             'client' => [
//                 'refClient' => $commande->getClient()->getRefClient(),
//                 'nom' => $commande->getClient()->getNomClient(),
//                 'prenom' => $commande->getClient()->getPrenomClient(),
//                 'email' => $commande->getClient()->getUser()->getEmailUsers(),
//             ],
//             'adresseLivraison' => $this->serializeAdresse($commande->getAdresseLivraison()),
//             'adresseFacturation' => $this->serializeAdresse($commande->getAdresseFacturation()),
//             'dateCommande' => $commande->getDateCommande()->format('Y-m-d H:i:s'),
//             'dateUpdate' => $commande->getDateUpdate() ? $commande->getDateUpdate()->format('Y-m-d H:i:s') : null,
//             'methodeLivraison' => $commande->getMethodeLivraison(),
//             'fraisLivraison' => $commande->getFraisLivraison(),
//             'statutCommande' => $commande->getStatutCommande(),
//             'articles' => $articles,
//             'totalCommande' => $total + (float) $commande->getFraisLivraison()
//         ];
//     }

//     private function serializeAdresse($adresse): array
//     {
//         if (!$adresse) {
//             return [];
//         }

//         return [
//             'rue' => $adresse->getRue(),
//             'ville' => $adresse->getVille(),
//             'codePostal' => $adresse->getCodePostal(),
//             'pays' => $adresse->getPays()
//         ];
//     }
// }