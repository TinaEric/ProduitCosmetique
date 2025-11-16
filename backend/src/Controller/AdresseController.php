 <?php
// src/Controller/Api/AdresseController.php

// namespace App\Controller;

// use App\Entity\Adresse;
// use App\Entity\Client;
// use App\Repository\AdresseRepository;
// use Doctrine\ORM\EntityManagerInterface;
// use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
// use Symfony\Component\HttpFoundation\JsonResponse;
// use Symfony\Component\HttpFoundation\Request;
// use Symfony\Component\HttpFoundation\Response;
// use Symfony\Component\Routing\Annotation\Route;
// use Symfony\Component\Security\Http\Attribute\IsGranted;
// use Symfony\Component\Serializer\SerializerInterface;
// use Symfony\Component\Validator\Validator\ValidatorInterface;

// #[Route('/api/adresses')]
// class AdresseController extends AbstractController
// {
//     public function __construct(
//         private AdresseRepository $adresseRepository,
//         private EntityManagerInterface $entityManager,
//         private SerializerInterface $serializer,
//         private ValidatorInterface $validator
//     ) {}

//     /**
//      * Met à jour une adresse existante
//      */
//     #[Route('/{id}', name: 'api_adresse_update', methods: ['PUT', 'PATCH'])]
//     #[IsGranted('ROLE_CLIENT')]
//     public function update(Request $request, int $id): JsonResponse
//     {
//         /** @var Client $client */
//         $client = $this->getUser()->getClient();
        
        // Trouver l'adresse appartenant au client
        // $adresse = $this->adresseRepository->findOneByClientAndId($client, $id);
        
        // if (!$adresse) {
        //     return $this->json([
        //         'status' => 'error',
        //         'message' => 'Adresse non trouvée'
        //     ], Response::HTTP_NOT_FOUND);
        // }

        // // Désérialiser les données de la requête
        // try {
        //     $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        // } catch (\JsonException $e) {
        //     return $this->json([
        //         'status' => 'error',
        //         'message' => 'Format JSON invalide'
        //     ], Response::HTTP_BAD_REQUEST);
        // }

        // Mettre à jour les champs de l'adresse
        // if (isset($data['labelle'])) {
        //     $adresse->setLabelle($data['labelle']);
        // }
        // if (isset($data['ville'])) {
        //     $adresse->setVille($data['ville']);
        // }
        // if (isset($data['codePostal'])) {
        //     $adresse->setCodePostal($data['codePostal']);
        // }
        // if (isset($data['quartier'])) {
        //     $adresse->setQuartier($data['quartier']);
        // }
        // if (isset($data['lot'])) {
        //     $adresse->setLot($data['lot']);
        // }
        // if (isset($data['complement'])) {
        //     $adresse->setComplement($data['complement']);
        // }
        // if (isset($data['description'])) {
        //     $adresse->setDescription($data['description']);
        // }

        // // Valider l'entité
        // $errors = $this->validator->validate($adresse);
        // if (count($errors) > 0) {
        //     $errorMessages = [];
        //     foreach ($errors as $error) {
        //         $errorMessages[$error->getPropertyPath()] = $error->getMessage();
        //     }

        //     return $this->json([
        //         'status' => 'error',
        //         'message' => 'Données invalides',
        //         'errors' => $errorMessages
        //     ], Response::HTTP_BAD_REQUEST);
        // }

        // try {
            // Mettre à jour la date de modification
    //         $adresse->setUpdatedAt(new \DateTimeImmutable());
            
    //         $this->entityManager->flush();

    //         return $this->json([
    //             'status' => 'success',
    //             'message' => 'Adresse mise à jour avec succès',
    //             'adresse' => [
    //                 'id' => $adresse->getId(),
    //                 'labelle' => $adresse->getLabelle(),
    //                 'ville' => $adresse->getVille(),
    //                 'codePostal' => $adresse->getCodePostal(),
    //                 'quartier' => $adresse->getQuartier(),
    //                 'lot' => $adresse->getLot(),
    //                 'complement' => $adresse->getComplement(),
    //                 'description' => $adresse->getDescription()
    //             ]
    //         ], Response::HTTP_OK);

    //     } catch (\Exception $e) {
    //         return $this->json([
    //             'status' => 'error',
    //             'message' => 'Erreur lors de la mise à jour de l\'adresse'
    //         ], Response::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    // }

    /**
     * Met à jour partiellement une adresse (PATCH)
     */
    // #[Route('/{id}', name: 'api_adresse_patch', methods: ['PATCH'])]
    // #[IsGranted('ROLE_CLIENT')]
    // public function patch(Request $request, int $id): JsonResponse
    // {
    //     return $this->update($request, $id);
    // }
// } 