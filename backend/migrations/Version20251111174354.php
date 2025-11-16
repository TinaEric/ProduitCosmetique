<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251111174354 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adresse ADD complement_adresse VARCHAR(100) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adresse DROP FOREIGN KEY FK_C35F0816B25D6CAC');
        $this->addSql('ALTER TABLE adresse DROP complement_adresse');
        $this->addSql('ALTER TABLE panier DROP FOREIGN KEY FK_24CC0DF2E8FD60FA');
        $this->addSql('ALTER TABLE panier DROP FOREIGN KEY FK_24CC0DF2ECA6F6CE');
        $this->addSql('ALTER TABLE paiement DROP FOREIGN KEY FK_B1DC7A1EE8FD60FA');
        $this->addSql('ALTER TABLE client DROP FOREIGN KEY FK_C7440455FA06E4D9');
        $this->addSql('ALTER TABLE commande DROP FOREIGN KEY FK_6EEAA67DB25D6CAC');
        $this->addSql('ALTER TABLE commande DROP FOREIGN KEY FK_6EEAA67D74B5BC6');
        $this->addSql('ALTER TABLE commande DROP FOREIGN KEY FK_6EEAA67DAF6B55CA');
        $this->addSql('ALTER TABLE produit DROP FOREIGN KEY FK_29A5EC27414DD7E1');
    }
}
