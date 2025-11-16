<?php

namespace App\Controller;

use App\Entity\Categorie;
use App\Repository\CategorieRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/categorie')]
class CategorieController extends AbstractController
{
    private $entityManager;
    private $repository;
    private $serializer;

    public function __construct(EntityManagerInterface $entityManager, CategorieRepository $repository, SerializerInterface $serializer)
    {
        $this->entityManager = $entityManager;
        $this->repository = $repository;
        $this->serializer = $serializer;
    }
    
    #[Route('', name: 'app_categorie_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        try{

            $categories = $this->repository->findAvecNbrProduit();

            if (!$categories) { 
                return $this->json([
                    'error' => [
                        'code' => 404,
                        'message' => "Aucun catégorie trouvé dans l'enregistrement!",
                        'status' => 'error'
                    ]
                    ],404) ;
            }
            return $this->json([
                'data' => $categories,
                'status' => 'success'

                ],200) ;
        }
        catch (\Throwable $e) {
                return $this->json([
                    'error' => [
                        'code' => 500,
                        'message' =>  $e->getMessage(),
                        'status' => 'error'
                    ]
                    ],500) ;
        };
    }

    
    #[Route('/newCategorie', name: 'nouveau_categorie', methods: ['POST'])]
    public function newCategory(Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!is_array($data)) {
                return $this->json([
                    'error' => [
                        'code' => 400,
                        'message' => 'Format de données JSON invalide',
                        'status' => 'error'
                    ]
                    ],400) ;
            }

            if (empty($data['labelle']) || empty($data['description'])) {
                return $this->json([
                    'error' => [
                        'code' => 422,
                        'message' => 'Les champs vides ne sont pas autorisés',
                        'status' => 'error'
                    ]
                    ],422) ;
            }

            $existe = $this->repository->findBy(['libelleCategorie' => $data['labelle']]);
            if ($existe) {
                return $this->json([
                    'error' => [
                        'code' => 409,
                        'message' => "Cette catégorie existe déjà dans l'enregistrement",
                        'status' => 'error'
                    ]
                    ],409) ;
            }

            $newCode = "CAT0001";
            $dernier = $this->repository->dernierEnregistrement();
            if ($dernier) {
                $newCode = $this->repository->CodeSuivant($dernier); 
            }

            $categorie = new Categorie();
            $categorie->setCodeCategorie($newCode);
            $categorie->setLibelleCategorie($data['labelle']);
            $categorie->setDescriptionCategorie($data['description']);

            $this->entityManager->persist($categorie);
            $this->entityManager->flush();

            return $this->json([
                'data' => $newCode,
                'status' => 'success',
                'message' => 'Un Catégorie créée avec succès.',
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

    #[Route('/{code}', name: 'app_categorie_edit', methods: ['PUT'])]
    public function update(Request $request, string $code): Response
    {
        try {
        $categorie = $this->repository->findOneBy(['codeCategorie' => $code]);

        if (!$categorie) {
            return $this->json([
                'error' => [
                    'code' => 404,
                    'message' => "Catégorie non trouvé dans l'enregistrement!",
                    'status' => 'error'
                ]
                ],404) ;
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['labelle'])) {
            $categorie->setLibelleCategorie($data['labelle']);
        }
        if (isset($data['description'])) {
            $categorie->setDescriptionCategorie($data['description']);
        }
        $this->entityManager->flush();
        return $this->json([
            'data' => $data,
            'status' => 'success',
            'message' => 'Un Catégorie est modifiée avec succès',
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

    #[Route('/deleteAll', name: 'supp_tous', methods: ['POST'])]
    public function supprimeAll(Request $request,  EntityManagerInterface $entityManager): Response
    {
        try {
        $data = json_decode($request->getContent(),true);
        $codes = $data['codes'] ?? []; 
        $count = 0;

        if (empty($codes)) {
            return $this->json([
                'error' => [
                    'code' => 404,
                    'message' => 'Aucun code de catégorie fourni pour la suppression.',
                    'status' => 'error'
                ]
                ],404) ;
        }

        foreach ($codes as $code) {
            $categorie = $this->repository->findOneBy(['codeCategorie' => $code]);
            if ($categorie) {
                $this->entityManager->remove($categorie);
                $count++;
            }
        }

        $this->entityManager->flush();
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
}
