<?php

namespace App\Controller;

use App\Entity\Adresse;
use App\Entity\Client;
use App\Entity\User;
use App\Repository\AdresseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/adresses')]
class AdresseController extends AbstractController
{
    public function __construct(
        private AdresseRepository $adresseRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

   
    #[Route('/{id}', name: 'api_adresse_update', methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_CLIENT')]
    public function update(Request $request, int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse([
                'error' => 'Utilisateur non valide ou non connecté.'
            ], 401);
        }

        $client = $user->getClient();
        
        // Trouver l'adresse appartenant au client
        $adresse = $this->adresseRepository->findOneByClientAndId($client, $id);
        
        if (!$adresse) {
            return $this->json([
                'status' => 'error',
                'message' => 'Adresse non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return $this->json([
                'status' => 'error',
                'message' => 'Format JSON invalide'
            ], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['labelle'])) {
            $adresse->setLibelleAdresse($data['labelle']);
        }
        if (isset($data['ville'])) {
            $adresse->setVille($data['ville']);
        }
        if (isset($data['codePostal'])) {
            $adresse->setCodePostal($data['codePostal']);
        }
        if (isset($data['quartier'])) {
            $adresse->setQuartier($data['quartier']);
        }
        if (isset($data['lot'])) {
            $adresse->setLot($data['lot']);
        }
        if (isset($data['complement'])) {
            $adresse->setComplementAdresse($data['complement']);
        }
        // if (isset($data['description'])) {
        //     $adresse->set($data['description']);
        // }

        $errors = $this->validator->validate($adresse);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }

            return $this->json([
                'status' => 'error',
                'message' => 'Données invalides',
                'errors' => $errorMessages
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // $adresse->setd(new \DateTimeImmutable());
            
            $this->entityManager->flush();

            return $this->json([
                'status' => 'success',
                'message' => 'Adresse mise à jour avec succès',
                'adresse' => [
                    'id' => $adresse->getRefAdresse(),
                    'labelle' => $adresse->getLibelleAdresse(),
                    'ville' => $adresse->getVille(),
                    'codePostal' => $adresse->getCodePostal(),
                    'quartier' => $adresse->getQuartier(),
                    'lot' => $adresse->getLot(),
                    'complement' => $adresse->getComplementAdresse(),
                ]
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour de l\'adresse'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'api_adresse_patch', methods: ['PATCH'])]
    #[IsGranted('ROLE_CLIENT')]
    public function patch(Request $request, int $id): JsonResponse
    {
        return $this->update($request, $id);
    }
} 