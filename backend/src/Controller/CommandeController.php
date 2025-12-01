<?php

namespace App\Controller;

use App\Entity\Commande;
use App\Entity\Client;
use App\Entity\User;
use App\Repository\CommandeRepository;
use App\Repository\ClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

class CommandeController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
    ) {}

    #[Route('/api/commandes/client/{refClient}', name: 'api_commandes_by_client', methods: ['GET'])]
    public function getCommandesByClient(string $refClient, CommandeRepository $commandeRepository): JsonResponse
    {
        try {
            // Vérification de l'authentification avec votre code
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();

            if (!$user instanceof User) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_UNAUTHORIZED,
                        'message' => 'Utilisateur non valide ou non connecté.',
                        'status' => 'error'
                    ]
                ], Response::HTTP_UNAUTHORIZED);
            }

            $client = $user->getClient();

            // Vérifier que l'utilisateur accède à ses propres commandes
            if ($client->getRefClient() !== $refClient) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_FORBIDDEN,
                        'message' => 'Accès interdit à ces commandes',
                        'status' => 'error'
                    ]
                ], Response::HTTP_FORBIDDEN);
            }

            // Récupérer les commandes du client
            $commandes = $commandeRepository->findBy(
                ['client' => $refClient],
                ['dateCommande' => 'DESC']
            );

            if (empty($commandes)) {
                return $this->json([
                    'data' => [],
                    'message' => 'Aucune commande trouvée pour ce client',
                    'status' => 'success'
                ], Response::HTTP_OK);
            }

            // Utiliser serialize au lieu de normalize
            $data = json_decode($this->serializer->serialize($commandes, 'json', [
                'groups' => ['commande:read'],
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object) {
                    return $object->getRefCommande();
                }
            ]), true);

            return $this->json([
                'data' => $data,
                'message' => 'Commandes récupérées avec succès',
                'status' => 'success'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => 'Erreur lors de la récupération des commandes: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/commandes/{refCommande}', name: 'api_commande_detail', methods: ['GET'])]
    public function getCommandeDetail(string $refCommande, CommandeRepository $commandeRepository): JsonResponse
    {
        try {
            // Vérification de l'authentification avec votre code
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();

            if (!$user instanceof User) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_UNAUTHORIZED,
                        'message' => 'Utilisateur non valide ou non connecté.',
                        'status' => 'error'
                    ]
                ], Response::HTTP_UNAUTHORIZED);
            }

            $client = $user->getClient();

            $commande = $commandeRepository->findOneBy(['refCommande' => $refCommande]);

            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_NOT_FOUND,
                        'message' => 'Commande non trouvée',
                        'status' => 'error'
                    ]
                ], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur accède à sa propre commande
            if ($client->getRefClient() !== $commande->getClient()->getRefClient()) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_FORBIDDEN,
                        'message' => 'Accès interdit à cette commande',
                        'status' => 'error'
                    ]
                ], Response::HTTP_FORBIDDEN);
            }

            // Utiliser serialize au lieu de normalize
            $data = json_decode($this->serializer->serialize($commande, 'json', [
                'groups' => ['commande:read'],
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object) {
                    return $object->getRefCommande();
                }
            ]), true);

            return $this->json([
                'data' => $data,
                'message' => 'Commande récupérée avec succès',
                'status' => 'success'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => 'Erreur lors de la récupération de la commande: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/commandes/{refCommande}/statut', name: 'api_commande_update_statut', methods: ['PATCH'])]
    public function updateStatutCommande(
        string $refCommande, 
        Request $request, 
        CommandeRepository $commandeRepository
    ): JsonResponse {
        try {
            // Vérification de l'authentification avec votre code
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();

            if (!$user instanceof User) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_UNAUTHORIZED,
                        'message' => 'Utilisateur non valide ou non connecté.',
                        'status' => 'error'
                    ]
                ], Response::HTTP_UNAUTHORIZED);
            }

            $client = $user->getClient();

            $commande = $commandeRepository->findOneBy(['refCommande' => $refCommande]);

            if (!$commande) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_NOT_FOUND,
                        'message' => 'Commande non trouvée',
                        'status' => 'error'
                    ]
                ], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur accède à sa propre commande
            if ($client->getRefClient() !== $commande->getClient()->getRefClient()) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_FORBIDDEN,
                        'message' => 'Accès interdit à cette commande',
                        'status' => 'error'
                    ]
                ], Response::HTTP_FORBIDDEN);
            }

            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['statut'])) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_BAD_REQUEST,
                        'message' => 'Le champ statut est requis',
                        'status' => 'error'
                    ]
                ], Response::HTTP_BAD_REQUEST);
            }

            $commande->setStatutCommande($data['statut']);
            $commande->setDateUpdate(new \DateTime());

            $this->entityManager->flush();

            return $this->json([
                'data' => [
                    'refCommande' => $commande->getRefCommande(),
                    'statut' => $commande->getStatutCommande(),
                    'dateUpdate' => $commande->getDateUpdate()
                ],
                'message' => 'Statut de la commande mis à jour avec succès',
                'status' => 'success'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => 'Erreur lors de la mise à jour du statut: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/commandes', name: 'api_commandes_list', methods: ['GET'])]
    public function getMesCommandes(CommandeRepository $commandeRepository): JsonResponse
    {
        try {
            // Vérification de l'authentification avec votre code
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();

            if (!$user instanceof User) {
                return $this->json([
                    'error' => [
                        'code' => Response::HTTP_UNAUTHORIZED,
                        'message' => 'Utilisateur non valide ou non connecté.',
                        'status' => 'error'
                    ]
                ], Response::HTTP_UNAUTHORIZED);
            }

            $client = $user->getClient();

            // Récupérer les commandes du client connecté
            $commandes = $commandeRepository->findBy(
                ['client' => $client->getRefClient()],
                ['dateCommande' => 'DESC']
            );

            if (empty($commandes)) {
                return $this->json([
                    'data' => [],
                    'message' => 'Aucune commande trouvée',
                    'status' => 'success'
                ], Response::HTTP_OK);
            }

            // Utiliser serialize au lieu de normalize
            $data = json_decode($this->serializer->serialize($commandes, 'json', [
                'groups' => ['commande:read'],
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object) {
                    return $object->getRefCommande();
                }
            ]), true);

            return $this->json([
                'data' => $data,
                'message' => 'Vos commandes ont été récupérées avec succès',
                'status' => 'success'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => 'Erreur lors de la récupération de vos commandes: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}