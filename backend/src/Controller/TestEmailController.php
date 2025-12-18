<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;

class TestEmailController extends AbstractController
{
    #[Route('/test-email', name: 'test_email')]
    public function sendTestEmail(MailerInterface $mailer): JsonResponse
    {
        try {
            $email = (new TemplatedEmail())
                ->from(new Address("tinarakotonjanahary@gmail.com", "Produit cosmétique - service client"))
                ->to('tinarakotonjanahary@gmail.com') 
                ->subject('Test d\'envoi d\'e-mail')
                ->html('<p>Ceci est un test d\'envoi d\'e-mail depuis Symfony (tina ihany).</p>');

            $mailer->send($email);

            return new JsonResponse(['message' => 'E-mail envoyé avec succès !']);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}