<?php

namespace App\Controller;

use App\Repository\CommandeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

class CommandeController extends AbstractController
{
    
    #[Route('/api/commandes', name: 'app_commandes_by_status', methods: ['GET'])]
    public function getOrdersByStatus(
        Request $request,
        CommandeRepository $commandeRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        $statut = $request->query->get('statut');

        if (!$statut) {
            return new JsonResponse(['error' => 'Le paramètre "statut" est manquant.'], JsonResponse::HTTP_BAD_REQUEST);
        }
        $commandes = $commandeRepository->findBy(['statutCommande' => $statut], ['dateCommande' => 'DESC']);

        if (empty($commandes)) {
            return new JsonResponse([], JsonResponse::HTTP_OK);
        }
        $jsonContent = $serializer->serialize($commandes, 'json', [
            AbstractNormalizer::ATTRIBUTES => [
                'refCommande',
                'dateCommande',
                'statutCommande',
                'fraisLivraison',
                'methodeLivraison',
                'client' => ['refClient', 'nom', 'prenom'],
                'adresseLivraison' => ['rue', 'ville', 'codePostal'],
                'paniers' => [
                    'refPanier',
                ],
            ],
        ]);
        return new JsonResponse($jsonContent, JsonResponse::HTTP_OK, [], true);
    }
}