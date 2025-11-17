<?php

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Commande;
use App\Entity\Panier;
use App\Entity\User;
use App\Service\CommandeServices;
use App\Repository\ClientRepository;
use App\Repository\ProduitRepository;
use App\Repository\UserRepository;
use App\Repository\AdresseRepository;
use App\Entity\Adresse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Throwable;

final class ClientController extends AbstractController
{
    
    #[Route('/api/client', name: 'api_clients_list', methods: ['GET'])]
    public function listClients(ClientRepository $repository, SerializerInterface $serializer): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        try {
            $clients = $repository->findAll();

            if (empty($clients)) { 
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Aucun client trouvé dans l'enregistrement!",
                        'status' => 'error'
                    ]
                ], 404);
            }
            
            // Étape 1: Sérialisation des objets Client (avec la relation User) en JSON String
            // Le groupe "client:read" assure l'inclusion des infos User et l'exclusion du mot de passe.
            $jsonContent = $serializer->serialize($clients, 'json', [
                'groups' => 'client:read'
            ]);

            return $this->json([
                'data' => json_decode($jsonContent, true), 
                'status' => 'success'
            ], 200);

        } catch (Throwable $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/profile', name: 'client_profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse([
                'error' => 'Utilisateur non valide ou non connecté.'
            ], 401);
        }

        $client = $user->getClient();
        
        if (!$client) {
            return $this->json([
                'error' => [
                    'code' => 404,
                    'message' => "Vous n'avez pas de profil",
                    'status' => 'error'
                    ]
                ],201) ;
        }
        
        return new JsonResponse([
            'data' => [
                'idUsers' => $user->getIdUsers(),
                'emailUsers' => $user->getEmailUsers(),
                'nomUsers' => $user->getNomUsers(),
                'roleUsers' => $user->getRoleUsers(),
                'profil'  => [
                    'refClient' => $client->getRefClient(),
                    'nomClient' => $client->getNomClient(),
                    'prenomClient' => $client->getPrenomClient(),
                    'telephoneClient' => $client->getTelephoneClient(),
                    'civiliteClient' => $client->getCiviliteClient(),
                    'dateNaissance' => $client->getDateNaissance()?->format('Y-m-d'),
                ]
                ],
            'message'   => "OK, Profil d'Utilisateur trouvé ",
            'status' => 'success' 
        ],200);
    }
     
    #[Route('/api/client/loginVerifier', name: 'client_verifier', methods: ['POST','GET'])]
    public function loginVerification(Request $request, UserRepository $userRepository,UserPasswordHasherInterface $passwordHasher,): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (empty($data['email']) || empty($data['role']) || empty($data['password'])) {
                return $this->json([
                    'error' => [
                        'code' => 422,
                        'message' => 'Les champs vides ne sont pas autorisés',
                        'status' => 'error'
                    ]
                    ],422) ;
            }
            $user = $userRepository->findUserLoginVerifier($data['email'], $data['role']);
            if ($user) {
                $isValid = $passwordHasher->isPasswordValid(
                    $user,
                    $data['password']
                );
                if(!$isValid){
                    return $this->json([
                        'error' => [
                                'code' => 201,
                                'message' => 'Votre mot de passe est incorrect',
                                'status' => 'error'
                        ]
                    ], 201);
                }

                return new JsonResponse([
                    'data' => $user ,
                    'message'   => 'OK, Utilisateur trouvé ',
                    'status' => 'success'
                ],200);
                   
            } 
            return $this->json([
                'error' => [
                        'code' => 201,
                        'message' => 'Nous ne pouvons pas trouvé votre compte!',
                        'status' => 'error'
                ]
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

    #[Route('/profile/update', name: 'client_profile_update', methods: ['PUT'])]
    public function updateProfile(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $user = $this->getUser();

        // Vérification du type d'utilisateur
        if (!$user instanceof User) {
            return new JsonResponse([
                'error' => 'Utilisateur non valide ou non connecté.'
            ], 401);
        }

        $client = $user->getClient();
        if (!$client) {
            return new JsonResponse(['error' => 'Client non trouvé'], 404);
        }
        
        $data = json_decode($request->getContent(), true);

        // Mettre à jour les informations du client
        if (isset($data['nomClient'])) {
            $client->setNomClient($data['nomClient']);
        }
        if (isset($data['prenomClient'])) {
            $client->setPrenomClient($data['prenomClient']);
        }
        if (isset($data['telephoneClient'])) {
            $client->setTelephoneClient($data['telephoneClient']);
        }
        if (isset($data['civiliteClient'])) {
            $client->setCiviliteClient($data['civiliteClient']);
        }
        if (isset($data['dateNaissance'])) {
            $client->setDateNaissance(new \DateTime($data['dateNaissance']));
        }
        
        $em->flush();
        
        return new JsonResponse([
            'message' => 'Profil mis à jour avec succès',
            'client' => [
                'refClient' => $client->getRefClient(),
                'nomClient' => $client->getNomClient(),
                'prenomClient' => $client->getPrenomClient(),
                'telephoneClient' => $client->getTelephoneClient(),
                'civiliteClient' => $client->getCiviliteClient(),
                'dateNaissance' => $client->getDateNaissance()?->format('Y-m-d'),
            ]
        ]);
    }

    #[Route('/api/client/initialeCommande', name: 'initialise_commande', methods: ['POST'])]
    public function createCommandePanier(
        EntityManagerInterface $em, 
        Request $request,
        ClientRepository $CliRepos,
        ProduitRepository $prodRepos,
        AdresseRepository $adresseRepos,
        CommandeServices $cmdService
    ): JsonResponse
    {
        try {
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();
    
            if (!$user instanceof User) {
                return new JsonResponse([
                    'error' => 'Utilisateur non valide ou non connecté.'
                ], 401);
            }
    
            $client = $user->getClient();
            
            $data = json_decode($request->getContent(), true);
            
            // $panierItem = $data['panier'] ?? [];
            $adresseData = $data['adresse'] ?? [];
            $adresseDifferent = $data['AdresseDifferent'] ?? [];
            
            // if(empty($panierItem)){
            //     return $this->json([
            //         'error' => [
            //             'code' => 400,
            //             'message' => 'Le panier est vide',
            //             'status' => 'error'
            //         ]
            //     ], 400);
            // }
    
            if (empty($adresseData)) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Les données d\'adresse sont obligatoires',
                        'status' => 'error'
                    ]
                ], 400);
            }
    
            if (!$client) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Client associé non trouvé',
                        'status' => 'error'
                    ]
                ], 404);
            }
    
            if (!isset($adresseData['adresseLivraison']) || !isset($adresseData['adresseFacturation'])) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Les données d\'adresse de livraison et de facturation sont obligatoires',
                        'status' => 'error'
                    ]
                ], 400);
            }

            $livraison = $adresseData['adresseLivraison'];
            $facturation = $adresseData['adresseFacturation'];
            
            $adresseLivraison = $cmdService->creerRecupererAdresse($livraison, $client, $em, $adresseRepos);

            if (!$adresseLivraison) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Erreur lors de la création de l\'adresse de livraison',
                        'status' => 'error'
                    ]
                ], 400);
            }
            if ($adresseDifferent){
                $adresseFacturation = $cmdService->creerRecupererAdresse($facturation, $client, $em, $adresseRepos);
                if (!$adresseFacturation) {
                    return $this->json([
                        'error' => [
                            'code' => 400,
                            'message' => 'Erreur lors de la création de l\'adresse de facturation',
                            'status' => 'error'
                        ]
                    ], 400);
                }
            }else{
                $adresseFacturation = $adresseLivraison;
            }
    
            $result = $cmdService->createPanierCommande($client,$adresseLivraison,$adresseFacturation);
            // if ($result['ProdIntrouvable']){
            //     return $this->json([
            //         'error' => [
            //             'code' => 404,
            //             'message' => "Produit " . $result['ProdIntrouvable'] . " introuvable!",
            //             'status' => 'error'
            //         ]
            //     ], 404);
            // }
            // if ($result['stockInsuffisant']){
            //     return $this->json([
            //         'error' => [
            //             'code' => 400,
            //             'message' => "La quantité du Produit " . $result['stockInsuffisant'] . " est insuffisante pour cette commande!",
            //             'status' => 'error'
            //         ]
            //     ], 400);
            // }
            $Order = $result['commande'];
            return new JsonResponse([
                'data' => [
                    'refCommande' => $Order->getRefCommande(),
                    'StatutCommande' => $Order->getStatutCommande(),
                    'adresse' => [
                        'adresseLivraison' => $Order->getAdresseLivraison(),
                        'adresseFacturation' => $Order->getAdresseFacturation(),
                    ]
                ],
                'message' => 'La création de la commande est réussie',
                'status' => 'success'
            ], 200);
            
        } catch (Throwable $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }
    
    #[Route('/api/client/updateCommande', name: 'Update_commande', methods: ['PUT'])]
    public function updateCommande(
        EntityManagerInterface $em, 
        Request $request,
        ClientRepository $CliRepos,
        ProduitRepository $prodRepos,
        AdresseRepository $adresseRepos,
        CommandeServices $cmdService
    ): JsonResponse
    {
        try {
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();
    
            if (!$user instanceof User) {
                return new JsonResponse([
                    'error' => 'Utilisateur non valide ou non connecté.'
                ], 401);
            }
    
            $client = $user->getClient();
            
            $data = json_decode($request->getContent(), true);
            
            $adresseData = $data['adresse'] ?? [];
            $refCommande = $data['refCommande'] ?? null;
            $adresseDifferent = $data['AdresseDifferent'] ?? false;
    
            if (empty($adresseData)) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Les données d\'adresse sont obligatoires',
                        'status' => 'error'
                    ]
                ], 400);
            }
            
            if (empty($refCommande)) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => "La référence commande non trouvé",
                        'status' => 'error'
                    ]
                ], 400);
            }
            
            if (!$client) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Client associé non trouvé',
                        'status' => 'error'
                    ]
                ], 404);
            }
            
            if (!isset($adresseData['adresseLivraison']) || !isset($adresseData['adresseFacturation'])) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Les données d\'adresse de livraison et de facturation sont obligatoires',
                        'status' => 'error'
                    ]
                ], 400);
            }
            
            $livraison = $adresseData['adresseLivraison'];
            $facturation = $adresseData['adresseFacturation'];
            
            // CORRECTION : Recherche par refCommande
            $commande = $em->getRepository(Commande::class)->findOneBy(['refCommande' => $refCommande]);
            
            if (!$commande){
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Commande avec la référence '$refCommande' non trouvée",
                        'status' => 'error'
                    ]
                ], 404);
            }
    
            // Vérification de sécurité
            if ($commande->getClient() !== $client) {
                return $this->json([
                    'error' => [
                        'code' => 403,
                        'message' => "Accès non autorisé à cette commande! Client: " . $commande->getClient()->getNomClient(),
                        'status' => 'error'
                    ]
                ], 403);
            }
    
            // Le reste de votre code reste inchangé...
            // Gestion adresse livraison
            if ($livraison['estAdresseExistante']) {
                $id = $livraison['refAdresse'];
                $adresse = $em->getRepository(Adresse::class)->find($id);
                if(!$adresse){
                    return $this->json([
                        'error' => [
                            'code' => 404,
                            'message' => "ID d'adresse de livraison non trouvé",
                            'status' => 'error'
                        ]
                    ], 404);
                }
                $commande->setAdresseLivraison($adresse);
            } else {
                $adresseLivraison = $cmdService->MisAjourAdresse($livraison, $client);
                if (!$adresseLivraison) {
                    return $this->json([
                        'error' => [
                            'code' => 400,
                            'message' => 'Erreur lors de la création de l\'adresse de livraison',
                            'status' => 'error'
                        ]
                    ], 400);
                }
                $commande->setAdresseLivraison($adresseLivraison);
            }
    
            // Gestion adresse facturation
            if ($adresseDifferent) {
                if ($facturation['estAdresseExistante']) {
                    $id = $facturation['refAdresse'];
                    $adresse = $em->getRepository(Adresse::class)->find($id);
                    if(!$adresse){
                        return $this->json([
                            'error' => [
                                'code' => 404,
                                'message' => "ID d'adresse de facturation non trouvé",
                                'status' => 'error'
                            ]
                        ], 404);
                    }
                    $commande->setAdresseFacturation($adresse);
                } else {
                    $adresseFacturation = $cmdService->MisAjourAdresse($facturation, $client);
                    if (!$adresseFacturation) {
                        return $this->json([
                            'error' => [
                                'code' => 400,
                                'message' => 'Erreur lors de la création de l\'adresse de facturation',
                                'status' => 'error'
                            ]
                        ], 400);
                    }
                    $commande->setAdresseFacturation($adresseFacturation);
                }
            } else {
                $commande->setAdresseFacturation($commande->getAdresseLivraison());
            }
    
            $em->flush();
            
            return new JsonResponse([
                'data' => [
                    'refCommande' => $commande->getRefCommande(),
                    'StatutCommande' => $commande->getStatutCommande(),
                    'adresse' => [
                        'adresseLivraison' => $commande->getAdresseLivraison(),
                        'adresseFacturation' => $commande->getAdresseFacturation(),
                    ]
                ],
                'message' => 'La mis à jour de la commande est réussie',
                'status' => 'success'
            ], 200);
            
        } catch (Throwable $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

    #[Route('/api/client/adresse', name: 'client_addresses', methods: ['GET'])]
    public function getAddresses(): JsonResponse
    {

        try{

        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse([
                'error' => 'Utilisateur non valide ou non connecté.'
            ], 401);
        }

        $client = $user->getClient();
        
        if (!$client) {
            return new JsonResponse(['error' => 'Client non trouvé'], 404);
        }
        
        $adresses = $client->getAdresses();
        
        $addressesData = [];
        foreach ($adresses as $adresse) {
            $addressesData[] = [
                'id' => $adresse->getRefAdresse(),
                'quartier' => $adresse->getQuartier(),
                'ville' => $adresse->getVille(),
                'codePostal' => $adresse->getCodePostal(),
                'lot' => $adresse->getLot(),
                'labelle'  => $adresse->getLibelleAdresse(),
                'complement'  => $adresse->getComplementAdresse(),
            ];
        }
        
        return new JsonResponse(['adresse' => $addressesData]);
        }catch (Throwable $e) {
            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne du serveur: ' . $e->getMessage() . 'Erreur Complet : ' . $e,
                    'status' => 'error'
                ]
            ], 500);
        }
    }
    
    #[Route('/api/client/adresse/update', name: 'client_address_update', methods: ['PUT'])]
    public function updateAddress(Request $request, EntityManagerInterface $em, AdresseRepository $adresseRepos): JsonResponse
    {
    try {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Utilisateur non valide'], 401);
        }

        $client = $user->getClient();
        if (!$client) {
            return new JsonResponse(['error' => 'Client non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        // Vérifier que l'adresse existe et appartient au client
        $adresse = $adresseRepos->find($data['id']);
        if (!$adresse || $adresse->getClient() !== $client) {
            return $this->json(['error' => 'Adresse non trouvée'], 404);
        }

        // Mettre à jour les champs
        $adresse->setQuartier($data['quartier'] ?? $adresse->getQuartier());
        $adresse->setVille($data['ville'] ?? $adresse->getVille());
        $adresse->setCodePostal($data['codePostal'] ?? $adresse->getCodePostal());
        $adresse->setLot($data['lot'] ?? $adresse->getLot());
        $adresse->setLibelleAdresse($data['labelle'] ?? $adresse->getLibelleAdresse());
        $adresse->setComplementAdresse($data['complement'] ?? $adresse->getComplementAdresse());

        $em->flush();

        return $this->json([
            'message' => 'Adresse mise à jour avec succès',
            'adresse' => [
                'id' => $adresse->getRefAdresse(),
                'quartier' => $adresse->getQuartier(),
                'ville' => $adresse->getVille(),
                'codePostal' => $adresse->getCodePostal(),
                'lot' => $adresse->getLot(),
                'labelle' => $adresse->getLibelleAdresse(),
                'complement' => $adresse->getComplementAdresse(),
            ]
        ]);

    } catch (\Exception $e) {
        return $this->json([
            'error' => 'Erreur interne du serveur: ' . $e->getMessage()
        ], 500);
    }
}
}
