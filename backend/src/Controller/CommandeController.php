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
    /**
     * Récupère la liste des commandes filtrées par statut.
     * @param Request $request La requête HTTP contenant le statut dans les query parameters.
     * @param CommandeRepository $commandeRepository Le repository pour accéder aux données des commandes.
     * @param SerializerInterface $serializer Le service de sérialisation.
     * @return JsonResponse
     */
    #[Route('/api/commandes', name: 'app_commandes_by_status', methods: ['GET'])]
    public function getOrdersByStatus(
        Request $request,
        CommandeRepository $commandeRepository,
        SerializerInterface $serializer
    ): JsonResponse {
        // 1. Récupération du statut depuis les query parameters (ex: /api/commandes?statut=EN_COURS)
        $statut = $request->query->get('statut');

        if (!$statut) {
            // Si aucun statut n'est fourni, on pourrait retourner toutes les commandes ou un message d'erreur.
            // Pour cet exemple, nous allons exiger un statut.
            return new JsonResponse(['error' => 'Le paramètre "statut" est manquant.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // 2. Recherche des commandes par statut
        // Assurez-vous d'avoir une méthode findByStatut dans votre CommandeRepository.
        $commandes = $commandeRepository->findBy(['statutCommande' => $statut], ['dateCommande' => 'DESC']);

        if (empty($commandes)) {
            return new JsonResponse([], JsonResponse::HTTP_OK);
        }

        // 3. Sérialisation des données en JSON
        // Nous utilisons les groupes de sérialisation pour contrôler les données envoyées au frontend
        // et éviter les boucles de référence infinies.
        
        // NOTE: Vous devez ajouter le groupe de sérialisation 'commande:read' à votre entité Commande,
        // et potentiellement d'autres entités comme Client, Adresse et Panier, pour que cela fonctionne.
        $jsonContent = $serializer->serialize($commandes, 'json', [
            AbstractNormalizer::ATTRIBUTES => [
                'refCommande',
                'dateCommande',
                'statutCommande',
                'fraisLivraison',
                'methodeLivraison',
                // Relations
                'client' => ['refClient', 'nom', 'prenom'], // Supposons que Client a refClient, nom, prenom
                'adresseLivraison' => ['rue', 'ville', 'codePostal'], // Supposons que Adresse a ces champs
                'paniers' => [
                    'refPanier',
                    // Inclure les détails du produit si nécessaire (ex: 'produit' => ['nom', 'prix'])
                ],
            ],
            // Vous pouvez aussi utiliser les groupes de sérialisation, c'est la méthode recommandée :
            // 'groups' => ['commande:read']
        ]);

        // 4. Retour de la réponse JSON
        return new JsonResponse($jsonContent, JsonResponse::HTTP_OK, [], true);
    }
}