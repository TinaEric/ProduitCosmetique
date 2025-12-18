<?php
namespace App\Controller;

use App\Entity\Commande;
use App\Repository\CommandeRepository;
use App\Repository\PaiementRepository;
use App\Repository\PanierRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Core\Security;

#[Route('/api/admin/commandes')]
class AdminCommandeController extends AbstractController
{

    private $entityManager;
    private $serializer;
    private $validator;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        ValidatorInterface $validator,
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->validator = $validator;
    }

    #[Route('/', name: 'admin_commandes_index', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager, SerializerInterface $serializer,CommandeRepository $cmd): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        try {
            $commandes = $cmd->findAllWithRelations();

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
            return new JsonResponse([
                'message' => 'ok, efa io aby',
                'data' =>  $commandes,
                'status' => 'success'
            ],200);
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

    #[Route('/test', name: 'admin_commandes_test', methods: ['GET'])]
    public function test(CommandeRepository $commandeRepository): JsonResponse
    {
        try {
            // Test 1: Simple find
            $simple = $commandeRepository->findAll();
            
            // Test 2: Avec une seule relation
            $qb = $commandeRepository->createQueryBuilder('c')
                ->leftJoin('c.client', 'client')
                ->addSelect('client')
                ->setMaxResults(1);
            
            $withClient = $qb->getQuery()->getResult();
            
            // Test 3: Avec toutes les relations (copie de findAllWithRelations)
            $withAll = $commandeRepository->findAllWithRelations();
            
            return $this->json([
                'test1_simple_count' => $simple,
                'test2_with_client' => $withClient ? 'OK' : 'ERROR',
                'test3_with_all' => $withAll ? 'OK' : 'ERROR',
                'first_commande_ref' => $simple[0]->getRefCommande() ?? 'none'
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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

    #[Route('/{refCommande}/statut', name: 'admin_commande_update_statut', methods: ['PUT'])]
    public function updateStatut(
        Request $request,
        string $refCommande,
        CommandeRepository $commandeRepository
    ): JsonResponse {
        try {
            $user = $this->getUser();
            if (!$user || !in_array('ROLE_ADMIN', $user->getRoles())) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_UNAUTHORIZED,
                        'message' => 'Acces non autorisé',
                        'status' => 'error'
                    ]
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Récupérer les données de la requête
            $data = json_decode($request->getContent(), true);
            $nouveauStatut = $data['statutCommande'] ?? null;

            // Validation du statut
            if (!$nouveauStatut) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_BAD_REQUEST,
                        'message' => 'Donné recue vide!',
                        'status' => 'error'
                    ]
                ], Response::HTTP_BAD_REQUEST);
            }

            // Liste des statuts autorisés
            $statutsAutorises = [
                'INITIALISE',
                'EN_ATTENTE_PAIEMENT',
                'EN_PREPARATION',
                'EXPEDIEE',
                'LIVREE',
                'ANNULER'
            ];

            if (!in_array($nouveauStatut, $statutsAutorises)) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_BAD_REQUEST,
                        'message' => 'Le status recue non autorisé!',
                        'status' => 'error'
                    ]
                ], Response::HTTP_BAD_REQUEST);
            }

            // Trouver la commande
            $commande = $commandeRepository->findOneBy(['refCommande' => $refCommande]);
            
            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_NOT_FOUND,
                        'message' => 'Commande Associé non trouvé',
                        'status' => 'error'
                    ]
                ], Response::HTTP_NOT_FOUND);
            }

            // Sauvegarder l'ancien statut
            $ancienStatut = $commande->getStatutCommande();

            // Mettre à jour le statut
            $commande->setStatutCommande($nouveauStatut);
            $paiement = $commande->getPaiement();
            $paiement->getStatutPaiment("PAYEE");
            $commande->mettreAjourDate();

            // Si le statut est "ANNULER", remettre les produits en stock
            if ($ancienStatut !== 'ANNULER' && $nouveauStatut === 'ANNULER') {
                $commandeRepository->restaurerStockCommande($commande);
            }

            // Si le statut est "LIVREE", mettre à jour la date de livraison
            if ($nouveauStatut === 'LIVREE') {
                $commande->setDateLivraison(new \DateTimeImmutable());
            }

            // Valider les modifications
            $errors = $this->validator->validate($commande);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_BAD_REQUEST,
                        'message' => 'Erreur de validation: ' . $errorMessages ,
                        'status' => 'error'
                    ]
                ], Response::HTTP_BAD_REQUEST);
            }

            // Persister les changements
            $this->entityManager->flush();
            // Préparer la réponse
            $commandeData = $this->serializer->serialize($commande, 'json', [
                'groups' => ['commande:read', 'client:read', 'panier:read', 'produit:read']
            ]);

            return new JsonResponse([
                'success' => true,
                'message' => 'Statut de la commande mis à jour avec succès',
                'data' => [
                    'commande' => json_decode($commandeData, true),
                    'modifications' => [
                        'ancienStatut' => $ancienStatut,
                        'nouveauStatut' => $nouveauStatut,
                        'dateModification' => $commande->getDateUpdate()
                    ]
                ]
            ], Response::HTTP_OK);

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
    

    #[Route('/deleteComamnde', name: 'admin_deleteComamnde', methods: ['POST'])]
    public function deleteComamnde(
        Request $request,
        CommandeRepository $repository,
        PaiementRepository $paimentRepo, 
        PanierRepository $panierRepos,
        EntityManagerInterface $entityManager
    ): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        try {

            $data = json_decode($request->getContent(),true);
            if (!is_array($data) || !isset($data['refCommande'])) {
                return $this->json([
                   'error' => [
                       'code' => 400,
                       'message' => 'Format de données invalide ou référence de commande manquante.',
                       'status' => 'error'
                   ]
               ], Response::HTTP_BAD_REQUEST) ;
           }

            $refCommande = $data['refCommande']; 
            $commande = $repository->findOneBy(['refCommande' => $refCommande]);
            
            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Commande non trouvée.',
                        'status' => 'error'
                    ]
                    ], Response::HTTP_NOT_FOUND) ;
            }
            $paniers = $panierRepos->findBy(['commande' => $commande]);
            if (!empty($paniers)) {
                foreach($paniers as $panier){
                    $entityManager->remove($panier);
                }
            }

            $paiement = $paimentRepo->findOneBy(['commande' => $commande]);
            if ($paiement) {
                $entityManager->remove($paiement);
            }
            $entityManager->remove($commande);
            $entityManager->flush();

            return new JsonResponse([
                'status' => "succes",
                'message' => 'La suppression est terminés avec succès!',
                'data' => "OK ,SUPPRESSION SUCCES",
            ],200);
            
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

    #[Route('/{refCommande}/statut', name: 'admin_commandes_update_status', methods: ['PUT'])]
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
