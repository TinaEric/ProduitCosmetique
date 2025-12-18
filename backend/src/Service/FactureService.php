<?php

namespace App\Service;

use Dompdf\Dompdf;
use Dompdf\Options;
use App\Entity\Commande;
use Twig\Environment;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelInterface;

class FactureService
{
    private Environment $twig;
    private string $projectDir;
    private Dompdf $dompdf;

    public function __construct(Environment $twig, KernelInterface $kernel)
    {
        $this->twig = $twig;
        $this->projectDir = $kernel->getProjectDir();
        $this->dompdf = $this->createDompdf();
    }

    private function createDompdf(): Dompdf
    {
        $pdfOptions = new Options();
        $pdfOptions->set('defaultFont', 'Arial');
        $pdfOptions->set('isRemoteEnabled', true);
        $pdfOptions->set('isHtml5ParserEnabled', true);
        $pdfOptions->set('isPhpEnabled', true);
        $pdfOptions->set('defaultPaperSize', 'A4');
        $pdfOptions->set('defaultPaperOrientation', 'portrait');

        return new Dompdf($pdfOptions);
    }

    public function genererFacturePdf(Commande $commande): string
    {
        // Configuration entreprise (à externaliser éventuellement dans un fichier config/services.yaml)
        $entreprise = [
            'nom' => 'MaBeauté - Produit Cosmetique',
            'adresse' => 'Imandry',
            'ville' => 'Fianarantsoa',
            'codePostal' => '301',
            'telephone' => '+261 38 01 001 11',
            'email' => 'tinarakotonjanahary@gmail.com',
            'siteWeb' => 'www.produitCosmetique.mg',
            'tva' => 'N/A - Article 293 B du CGI',
            'siret' => '123 456 789 00012',
            'logo' => $this->projectDir.'/public/logoBleu.png'
        ];

        // Calcul des totaux
        $totalProduits = array_reduce(
            iterator_to_array($commande->getPaniers()),
            fn($carry, $panier) => $carry + $panier->getPrixUnitaire() * $panier->getQuantite(),
            0
        );

        $email =$commande->getClient()->getUser()->getEmailUsers();

        // Rendu HTML avec Twig
        $html = $this->twig->render('facture/facture.html.twig', [
            'commande' => $commande,
            'entreprise' => $entreprise,
            'client'=> $commande->getClient(),
            'paniers' => $commande->getPaniers(),
            'email' => $email,
            'total_produits' => $totalProduits,
            'date_emission' => new \DateTime(),
        ]);

        $this->dompdf->loadHtml($html);
        $this->dompdf->render();

        // Sauvegarde temporaire
        $output = $this->dompdf->output();
        $filename = sprintf('facture_%s.pdf', $commande->getRefCommande());
        $tempDir = $this->projectDir.'/var/factures/';

        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        $pdfPath = $tempDir.$filename;
        file_put_contents($pdfPath, $output);

        return $pdfPath;
    }

    public function getFactureResponse(string $pdfPath, string $filename): Response
    {
        if (!file_exists($pdfPath)) {
            return new Response('Fichier PDF introuvable', 404);
        }

        $response = new BinaryFileResponse($pdfPath);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $filename);
        $response->deleteFileAfterSend(true);

        return $response;
    }
}









// namespace App\Service;

// use Dompdf\Dompdf;
// use Dompdf\Options;
// use App\Entity\Commande;
// use Twig\Environment;
// use Symfony\Component\HttpFoundation\Response;
// use Symfony\Component\HttpFoundation\BinaryFileResponse;
// use Symfony\Component\HttpFoundation\ResponseHeaderBag;
// use Symfony\Component\HttpKernel\KernelInterface;

// class FactureService
// {
//     private $twig;
//     private $projectDir;

//     public function __construct(Environment $twig, KernelInterface $kernel)
//     {
//         $this->twig = $twig;
//         $this->projectDir = $kernel->getProjectDir();
//     }

//     public function genererFacturePdf(Commande $commande): string
//     {
//         // Configuration de Dompdf
//         $pdfOptions = new Options();
//         $pdfOptions->set('defaultFont', 'Arial');
//         $pdfOptions->set('isRemoteEnabled', true);
//         $pdfOptions->set('isHtml5ParserEnabled', true);
//         $pdfOptions->set('isPhpEnabled', true);
//         $pdfOptions->set('defaultPaperSize', 'A4');
//         $pdfOptions->set('defaultPaperOrientation', 'portrait');

//         $dompdf = new Dompdf($pdfOptions);

//         // Configuration entreprise (à adapter)
//         $entreprise = [
//             'nom' => 'MaBeauté - Produit Cosmetique',
//             'adresse' => 'Imandry',
//             'ville' => 'Fianarantsoa',
//             'codePostal' => '301',
//             'telephone' => '+261 38 01 001 11',
//             'email' => 'tinarakotonjanahary@gmail.com',
//             'siteWeb' => 'www.produitCosmetique.mg',
//             'tva' => 'N/A - Article 293 B du CGI',
//             'siret' => '123 456 789 00012',
//             'logo' => '/backend/public/logoBleu.png'
//         ];

//         // Calcul des totaux
//         $totalProduits = 0;
//         foreach ($commande->getPaniers() as $panier) {
//             $totalProduits += $panier->getPrixUnitaire() * $panier->getQuantite();
//         }

//         // Rendu HTML avec Twig
//         $html = $this->twig->render('facture/facture.html.twig', [
//             'commande' => $commande,
//             'entreprise' => $entreprise,
//             'total_produits' => $totalProduits,
//             'date_emission' => new \DateTime(),
//         ]);

//         $dompdf->loadHtml($html);
//         $dompdf->setPaper('A4', 'portrait');
//         $dompdf->render();

//         // Sauvegarde temporaire
//         $output = $dompdf->output();
//         $filename = sprintf('facture_%s.pdf', $commande->getRefCommande());
//         $tempDir = $this->projectDir . '/var/temp/factures/';
        
//         if (!is_dir($tempDir)) {
//             mkdir($tempDir, 0777, true);
//         }

//         $pdfPath = $tempDir . $filename;
//         file_put_contents($pdfPath, $output);

//         return $pdfPath;
//     }

//     public function getFactureResponse(string $pdfPath, string $filename): Response
//     {
//         if (!file_exists($pdfPath)) {
//             throw new \Exception('Fichier PDF non trouvé');
//         }

//         $response = new BinaryFileResponse($pdfPath);
//         $response->headers->set('Content-Type', 'application/pdf');
//         $response->setContentDisposition(
//             ResponseHeaderBag::DISPOSITION_ATTACHMENT,
//             $filename
//         );
        
//         // Supprimer le fichier après l'envoi
//         $response->deleteFileAfterSend(true);
        
//         return $response;
//     }
// }