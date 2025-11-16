<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Doctrine\ORM\EntityManagerInterface;

class JWTResponseListener
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event)
    {
        $data = $event->getData();
        $user = $event->getUser();

        if (!$user instanceof User) {
            return;
        }

        // Récupérer l'utilisateur frais depuis la base de données
        $freshUser = $this->entityManager->getRepository(User::class)->find($user->getIdUsers());

        if (!$freshUser) {
            return;
        }

        // Ajouter les données utilisateur à la réponse
        $userData = [
            'idUsers' => $freshUser->getIdUsers(),
            'emailUsers' => $freshUser->getEmailUsers(),
            'nomUsers' => $freshUser->getNomUsers(),
            'roleUsers' => $freshUser->getRoleUsers(),
            'roles' => $freshUser->getRoles(),
        ];

        // Ajouter les données du client si elles existent
        if ($freshUser->getClient()) {
            $client = $freshUser->getClient();
            $userData['client'] = [
                'refClient' => $client->getRefClient(),
                'nomClient' => $client->getNomClient(),
                'prenomClient' => $client->getPrenomClient(),
                'telephoneClient' => $client->getTelephoneClient(),
                'civiliteClient' => $client->getCiviliteClient(),
                'dateNaissance' => $client->getDateNaissance() ? $client->getDateNaissance()->format('Y-m-d') : null,
            ];
        }

        $data['user'] = $userData;
        $event->setData($data);
    }
}