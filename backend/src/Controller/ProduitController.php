<?php

namespace App\Controller;

use App\Entity\Produit;
use App\Form\ProduitType;
use App\Repository\CategorieRepository;
use App\Repository\ProduitRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/produit')]
final class ProduitController extends AbstractController
{
    private $entityManager;
    private $produitRepository; // Renommé pour plus de clarté
    private $serializer;
    private $categorieRepository;

    public function __construct(
        EntityManagerInterface $entityManager, 
        CategorieRepository $categorieRepository, 
        ProduitRepository $produitRepository, // Utilisation du nouveau nom
        SerializerInterface $serializer
    )
    {
        $this->entityManager = $entityManager;
        $this->produitRepository = $produitRepository; // Affectation du nouveau nom
        $this->serializer = $serializer;
        $this->categorieRepository = $categorieRepository;
    }

    // Liste des produits
    #[Route(name: 'app_produit_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $produit = $this->produitRepository->findAll();
        
        if (empty($produit)) {
            return new JsonResponse([], JsonResponse::HTTP_OK); 
        }
        $jsonContent = $this->serializer->serialize($produit, 'json', ['groups' => ['category:read']]);
        return new JsonResponse($jsonContent, JsonResponse::HTTP_OK, [], true);
    }

    // Produit grouper par categorie
    #[Route('/ProduitGroupe', name: 'app_produitGoupe_index', methods: ['GET'])]
    public function ProduitParCategorie(Request $request): JsonResponse
    {
        $codeCategorie = $request->query->get('categorie'); 
        $produit = $this->produitRepository->findProduitsGroupesParCategorie($codeCategorie);

        if (empty($produit)) {
            return new JsonResponse([], JsonResponse::HTTP_OK); 
        }
        $jsonContent = $this->serializer->serialize($produit, 'json', ['groups' => ['category:read']]);
        return new JsonResponse($jsonContent, JsonResponse::HTTP_OK, [], true);
    }

    // Créer produit
    #[Route('/create', name: 'nouveau_Produit', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try{
            $data = json_decode($request->getContent(), true);
            
            if (!is_array($data)){
                return new JsonResponse([
                    'statut' => 'warning', 
                    'message' => "Format de données JSON invalide",
                ], Response::HTTP_BAD_REQUEST);
            }
            
            if (empty($data['nom']) || empty($data['prix']) || empty($data['stock']) || 
                empty($data['codePromo']) || empty($data['image']) || empty($data['description']) || 
                empty($data['codeCategory'])) {
                return new JsonResponse([
                    'statut' => 'error', 
                    'message' => "Tous les champs sont obligatoires."
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $existe = $this->produitRepository->findBy(['nomProduit' => $data['nom']]);
            if ($existe){
                return new JsonResponse([
                    'statut' => 'warning', 
                    'message' => "Ce produit existe déjà dans l'enregistrement."
                ], Response::HTTP_CONFLICT);
            }

            $categorie = $this->categorieRepository->find($data['codeCategory']);
            if (!$categorie) {
                return new JsonResponse([
                    'statut' => 'warning', 
                    'message' => "Catégorie non trouvée."
                ], Response::HTTP_NOT_FOUND);
            }

            $produit = new Produit();
            $produit->setNomProduit($data['nom']);
            $produit->setPrixProduit($data['prix']);
            $produit->setStockProduit($data['stock']);
            $produit->setImageUrlProduit($data['image']);
            $produit->setCodePromos($data['codePromo']); 
            $produit->setDescriptionProduit($data['description']);
            $produit->setCategorie($categorie);
            $produit->mettreAjourDate();

            $this->entityManager->persist($produit);
            $this->entityManager->flush();

            return new JsonResponse([
                'statut' => 'success', 
                'message' => 'Un produit a été enregistré avec succès',
            ], 
            Response::HTTP_CREATED 
            );
        }
        catch (\Throwable $e)
        {
            return new JsonResponse([
                'statut' => 'error', 
                'message' => "Erreur interne du serveur: " . $e->getMessage() // Afficher le message d'erreur en DEV
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'app_produit_edit', methods: ['PUT'])]
    public function updateProduit(Request $request, string $id ): Response
    {
        $produit = $this->produitRepository->findOneBy(['numProduit' => $id]); // Utilisation de $this->produitRepository

        if (!$produit) {
            return new JsonResponse([
                'statut' => 'warning', 
                'message' => 'Produit non trouvée.'
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) {
            $produit->setNomProduit($data['nom']);
        }
        if (isset($data['prix'])) {
            $produit->setPrixProduit($data['prix']);
        }
        if (isset($data['stock'])) {
            $produit->setStockProduit($data['stock']);
        }
        if (isset($data['description'])) {
            $produit->setDescriptionProduit($data['description']);
        }
        if (isset($data['image'])) {
            $produit->setImageUrlProduit($data['image']);
        }
        // Utilisation de setCodePromos, en assumant que la méthode dans l'entité est correcte
        if (isset($data['codePromo'])) {
            $produit->setCodePromos($data['codePromo']);
        }
        if (isset($data['codeCategory'])) {
            // Correction de l'utilisation du Repository pour la Catégorie
            $categorie = $this->categorieRepository->find($data['codeCategory']);
            if ($categorie) {
                $produit->setCategorie($categorie);
            }
        }
        $produit->mettreAjourDate();

        $this->entityManager->flush();
        // Retrait de l'objet Produit de la réponse pour éviter les problèmes de sérialisation
        return new JsonResponse([
            'statut' => 'success', 
            'message' => 'Un produit a été modifié avec succès',
        ], 
        Response::HTTP_OK
        );
    }

    
    #[Route('/{code}', name: 'supp_Produit', methods: ['DELETE'])]
    public function deleteProduit(string $code): Response
    {
        $produit = $this->produitRepository->findOneBy(['numProduit' => $code]); // Utilisation de $this->produitRepository

        if (!$produit) {
            return new JsonResponse([
                'statut' => 'warning', 
                'message' => 'produit non trouvée.'
            ], Response::HTTP_NOT_FOUND);
        }
        $this->entityManager->remove($produit);
        $this->entityManager->flush();
        return new JsonResponse([
            'message' => " Un Produit a été supprimées avec succès.",
            'statut' => 'success'], 
            Response::HTTP_OK
        );
    }
}