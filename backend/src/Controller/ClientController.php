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
            $clients = $repository->getClientUser();

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
                    'dateInscription' => $client->getDateInscription()?->format('Y-m-d H:i:s'),
                ]
                ],
            'message'   => "OK, Profil d'Utilisateur trouvé ",
            'status' => 'success' 
        ],200);
    }

    #[Route('/api/client/registreVerifier', name: 'client_registreverifier', methods: ['POST','GET'])]
    public function registreVerification(Request $request, UserRepository $userRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (empty($data['email']) || empty($data['role'])) {
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
                return $this->json([
                    'error' => [
                            'code' => 201,
                            'message' => 'Votre Adresse Email est déjà utilisé par un autre compte!',
                            'status' => 'error'
                    ]
                ], 201);   
            } 
            return new JsonResponse([
                'data' => "OK" ,
                'message'   => 'OK, Création Utilisateur Autorisé ',
                'status' => 'success'
            ],200);

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
    #[Route('/api/client/loginVerifier', name: 'client_loginverifier', methods: ['POST','GET'])]
    public function loginVerification(Request $request, UserRepository $userRepository,UserPasswordHasherInterface $passwordHasher): JsonResponse
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

    #[Route('/api/client/profile/update', name: 'client_profile_update', methods: ['POST','GET'])]
    public function updateProfile(Request $request, EntityManagerInterface $em, UserRepository $us): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        try{

       
        // $user = $us->findBy(['id' => $idUser]);
        $user = $this->getUser();

        // Vérification du type d'utilisateur
        if (!$user instanceof User) {
            return $this->json([
                'error' => [
                    'code' => 404,
                    'message' =>'Utilisateur non valide ou non connecté.',
                    'status' => 'error'
                ]
            ], 404);
        }

        $client = $user->getClient();
        if (!$client) {
            return $this->json([
                'error' => [
                    'code' => 404,
                    'message' =>'Client non trouvé',
                    'status' => 'error'
                ]
            ], 404);
        }
        
        $data = json_decode($request->getContent(), true);

        // Mettre à jour les informations du client
        if (isset($data['nom'])) {
            $client->setNomClient($data['nom']);
        }
        if (isset($data['prenom'])) {
            $client->setPrenomClient($data['prenom']);
            $user->setNomUsers($data['prenom']);
        }
        if (isset($data['telephone'])) {
            $client->setTelephoneClient($data['telephone']);
        }
        if (isset($data['civilite'])) {
            $client->setCiviliteClient($data['civilite']);
        }
        if (!empty($data['dateNaissance'])) {
            try {
                $client->setDateNaissance(new \DateTimeImmutable($data['dateNaissance']));
            } catch (\Exception $e) {
                error_log("Invalid dateNaissance format provided during registration: " . $data['dateNaissance']);
                $client->setDateNaissance(null);
            }
        }
        
        if (isset($data['emailIsModified'])) {
            $IsModifier =  $data['emailIsModified'];
            if (isset($data['email']) && $IsModifier) {
                $verifierEmail = $us->findByEmail($data['email']);
                if($verifierEmail){
                    return $this->json([
                        'error' => [
                            'code' => 409,
                            'message' => 'Votre nouveau Email est déjà utiliser par un autre compte',
                            'status' => 'error'
                        ]
                    ], 409);
                }
                $user->setEmailUsers($data['email']);
                
            }
        }
        $em->flush();
        
        return new JsonResponse([
            'message' => 'Profil mis à jour avec succès',
            'data' => [
                'idUsers' => $user->getIdUsers(),
                'nomUsers' => $user->getNomUsers(),
                'roleUsers' => $user->getRoleUsers(),
                'emailUsers' => $user->getEmailUsers(),
                'client'  => [
                    'refClient' => $client->getRefClient(),
                    'nomClient' => $client->getNomClient(),
                    'prenomClient' => $client->getPrenomClient(),
                    'telephoneClient' => $client->getTelephoneClient(),
                    'civiliteClient' => $client->getCiviliteClient(),
                    'dateNaissance' => $client->getDateNaissance()?->format('Y-m-d'),
                    'dateInscription' => $client->getDateInscription()?->format('Y-m-d H:i:s'),
                ]
            ],
            'status' => "success"
        ]);
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

    #[Route('/api/client/initialeCommande', name: 'initialise_commande', methods: ['POST'])]
    public function createCommande(
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
            $adresseDifferent = $data['AdresseDifferent'] ?? [];
            
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
    
    #[Route('/api/client/updateAdresseCommande', name: 'Update_commande', methods: ['PUT'])]
    public function updateCommandeAdresse(
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
            $commande->mettreAjourDate();
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

    #[Route('/api/client/updatePanierCommande', name: 'update_commande_panierPaiement', methods: ['PUT'])]
    public function updateCommandePanier(
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
            $fraisLivraison = $data['fraisLivraison'] ?? null;
            $methodeLivraison = $data['methodeLivraison'] ?? null;
            $panierItem = $data['panier'] ?? [];
            $methodePaiement = $data['methodePaiement'] ?? null;
            $refCommande = $data['refCommande'] ?? null;
            $dateLivraison = $data['dateLivraison'];
            if(empty($panierItem)){
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Le panier est vide',
                        'status' => 'error'
                    ]
                ], 400);
            }
            if( empty($methodeLivraison) || empty($methodePaiement)){
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => "Votre transaction n'est pas complete",
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
    
            if (empty($dateLivraison)) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => "La date de livraison est vide",
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

            $result = $cmdService->MisAjourCommande($panierItem,$client,$refCommande,$fraisLivraison,$methodeLivraison,$methodePaiement, $dateLivraison);

            if (isset($result['ProdIntrouvable'])) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Produit(s) " . $result['ProdIntrouvable'] . " introuvable(s)!",
                        'status' => 'error'
                    ]
                ], 404);
            }

            if (isset($result['stockInsuffisant'])) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => "Stock insuffisant pour: " . $result['stockInsuffisant'],
                        'status' => 'error'
                    ]
                ], 400);
            }

            $Order = $result['commande'];
            $email = $result['email'];
          

            return new JsonResponse([
                'data' => [
                    'email' => $email,
                    'refCommande' => $Order->getRefCommande(),
                    'StatutCommande' => $Order->getStatutCommande(),
                    'adresse' => [
                        'adresseLivraison' => $Order->getAdresseLivraison(),
                        'adresseFacturation' => $Order->getAdresseFacturation(),
                    ],
                    'panier' => array_map(function($panier) {
                        return [
                            'produit' => $panier->getProduit()->getNumProduit(),
                            'quantite' => $panier->getQuantite(),
                            'nomProduit' => $panier->getProduit()->getNomProduit(),
                            'prix' => $panier->getProduit()->getPrixProduit()
                        ];
                    }, $Order->getPaniers()->toArray())
                ],
                'message' => $result['message'] ?? 'La mise à jour de la commande est réussie',
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

    #[Route('/api/client/CommandeAnnuler', name: 'update_commande_annuler', methods: ['PUT'])]
    public function CommandeAnnuler (
        EntityManagerInterface $entityManager, 
        Request $request,
        ClientRepository $CliRepos,
        ProduitRepository $prodRepos,
        AdresseRepository $adresseRepos,
        CommandeServices $cmdService
    ){
        try {
            $this->denyAccessUnlessGranted('ROLE_USER');
            
            $user = $this->getUser();
    
            if (!$user instanceof User) {
                return new JsonResponse([
                    'error' => 'Utilisateur non valide ou non connecté.'
                ], 401);
            }
            $data = json_decode($request->getContent(), true);
            $refCommande = $data['refCommande'];
            if(empty($refCommande)){
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Reference commande non trouvé!',
                        'status' => 'error'
                    ]
                ], 404);
            }

            $commande = $entityManager->getRepository(Commande::class)->findOneBy(['refCommande' => $refCommande]);
            if (!$commande){
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Commande non trouvé dans l'enregistrement!",
                        'status' => 'error'
                    ]
                ], 404);
            };
            $commande->setStatutCommande('ANNULER');
            $commande->setFraisLivraison(0.00);
            $commande->setMethodeLivraison("annuler");
            $commande->mettreAjourDate();
            $entityManager->flush();
            return new JsonResponse([
                'data' => [
                    'refCommande' => $commande->getRefCommande(),
                    'StatutCommande' => $commande->getStatutCommande(),
                ],
                'message' => "Commande annulé avec succès",
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
        
        $adresses = $client->getAdresses()->filter(fn($adrs) => $adrs->isActif());
        
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

    #[Route('/api/client/topProduit', name: 'Client_topProduit', methods: ['GET'])]
    public function topProduit(ProduitRepository $produit): JsonResponse
    {
        try {
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

    #[Route('/api/client/getAllProduit',name: 'client_getallProduit', methods: ['GET'])]
    public function getAllProduits(ProduitRepository $produit): JsonResponse
    {
        try {
            $topProduit = $produit->getAllProduit();
            return new JsonResponse([
                'message' => 'ok, efa io aby',
                'data' => [
                    'allProduit' => $topProduit,
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

    #[Route('/api/client/supprimer', name: 'supp_Tous_Client', methods: ['POST'])]
    public function supprimeAll(Request $request,ClientRepository $repository,AdresseRepository $adresseRepos,  EntityManagerInterface $entityManager): JsonResponse
    {
        try {
        $data = json_decode($request->getContent(),true);
        $codes = $data['codes'] ?? []; 
        $count = 0;

        if (empty($codes)) {
            return $this->json([
                'error' => [
                    'code' => 404,
                    'message' => 'Aucun Reference CLient fourni pour la suppression.',
                    'status' => 'error'
                ]
                ],404) ;
        }

        foreach ($codes as $code) {
            $client = $repository->findOneBy(['refClient' => $code]);
            if ($client) {
                $adresses = $adresseRepos->findByClient($client) || [];
                // foreach($adresses as $ad){

                // }

                $entityManager->remove($client);
                $count++;
            }
        }

        $entityManager->flush();
        return $this->json([
            'data' => $count,
            'status' => 'success',
            'message' => "$count catégories supprimées avec succès.",
            ],200) ;

        } catch (\Throwable $e) {

            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' =>  $e->getMessage(),
                    'status' => 'error'
                ]
                ],500) ;
        }
    }

    
    #[Route('/api/client/createAdresse', name: 'create_new_adresse', methods: ['POST'])]
    public function createAdresse(Request $request,AdresseRepository $adresseRepos,  EntityManagerInterface $entityManager): JsonResponse
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
            if (empty($adresseData)) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Aucun données d'adresse trouvé",
                        'status' => 'error'
                    ]
                    ],404) ;
            }

            $adresse = new Adresse();
            $refAdresse = $adresseRepos->RefAdresseSuivant();
            $adresse->setRefAdresse($refAdresse);
            $adresse->setClient($client);
            
            $adresse->setQuartier($adresseData['quartier'] ?? '');
            $adresse->setVille($adresseData['ville'] ?? '');
            $adresse->setCodePostal($adresseData['codePostal'] ?? '');
            $adresse->setLot($adresseData['lot'] ?? '');
            $adresse->setLibelleAdresse($adresseData['labelle'] ?? '');
            $adresse->setComplementAdresse($adresseData['description'] ?? '');
            
            $entityManager->persist($adresse);
            $entityManager->flush();

                return $this->json([
                    'data' => [
                        'newAdresse' => [
                            'refAdresse' => $adresse->getRefAdresse(),
                            'quartier' => $adresse->getQuartier(),
                            'ville' => $adresse->getVille(),
                            'codePostal' => $adresse->getCodePostal(),
                            'lot' => $adresse->getLot(),
                            'libelle' => $adresse->getLibelleAdresse(),
                            'complement' => $adresse->getComplementAdresse(),
                        ],
                    ],
                    'status' => 'success',
                    'message' => "Une nouvelle adresse est détectée",
                ], 200);
                

        } catch (\Throwable $e) {

            return $this->json([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne de CREATION NEW ADRESSE' . $e->getMessage(),
                    'status' => 'error'
                ]
                ],500) ;
        }
    }

    #[Route('/api/client/{refClient}/deleteAdresse/{refAdresse}', name: 'client_delete_adresse', methods: ['PUT'])]
    public function DeleteADresse(string $refClient,string $refAdresse, EntityManagerInterface $em, ClientRepository $clientRepos , AdresseRepository $adresseRepos): JsonResponse
    {
        try {
        $client = $clientRepos->findOneBy(['refClient' => $refClient]);
            if (!$client) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Client associé non trouvé',
                        'status' => 'error'
                    ]
                ], 404);
            }
            $adresse = $adresseRepos->findOneBy([
                'client' => $client,
                'refAdresse' => $refAdresse
            ]);
            if (!$adresse) {
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => 'Adresse associé non trouvé',
                        'status' => 'error'
                    ]
                ], 404);
            }
            $countCmdLivraison = $adresse->getCommandesLivraison()->count();
            $countCmdFacturation = $adresse->getCommandesFacturation()->count();
            if ($countCmdLivraison > 0 || $countCmdFacturation > 0){
                $adresse->DeleteAdresse();
            }else{
                $em->remove($adresse);
            }
            $em->flush();
        
            return new JsonResponse([
                'message' => 'Adresse supprimé avec avec succès',
                'data' => [
                    'nombreCommandeLié'  => $countCmdLivraison,
                    'isActif' => $adresse->isActif()
                ],
                'status' => 'success'
            ],200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => [
                    'code' => 500,
                    'message' => 'Erreur interne de SUPPRESSION ADRESSE: ' . $e->getMessage(),
                    'status' => 'error'
                ]
            ], 500);
        }
    }

}
