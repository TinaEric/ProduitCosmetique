DROP DATABASE IF EXISTS PRODUITCOSMETIQUE;

CREATE DATABASE IF NOT EXISTS PRODUITCOSMETIQUE;
USE PRODUITCOSMETIQUE;
# -----------------------------------------------------------------------------
#       TABLE : PAIEMENT
# -----------------------------------------------------------------------------
 
CREATE TABLE IF NOT EXISTS PAIEMENT
 (
   CODE_Paiement VARCHAR(50) NOT NULL  ,
   REF_Commande VARCHAR(100) NOT NULL  ,
   modePaiement VARCHAR(32) NULL  ,
   statutPaiement VARCHAR(32) NULL  ,
   datePaiement VARCHAR(32) NULL  ,
   referencePaiement VARCHAR(32) NULL  ,
   montantPaye DECIMAL(10,2) NULL  
   , PRIMARY KEY (CODE_Paiement) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE PAIEMENT
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_PAIEMENT_COMMANDE
     ON PAIEMENT (REF_Commande ASC);

# -----------------------------------------------------------------------------
#       TABLE : COMMANDE
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS COMMANDE
 (
   REF_Commande VARCHAR(100) NOT NULL  ,
   LOT VARCHAR(50) NOT NULL  ,
   REF_Client VARCHAR(32) NOT NULL  ,
   dateCommande DATE NULL  ,
   montantTotal DECIMAL(10,2) NULL  ,
   statutCommande VARCHAR(32) NULL  
   , PRIMARY KEY (REF_Commande) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE COMMANDE
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_COMMANDE_ADRESSE
     ON COMMANDE (LOT ASC);

CREATE  INDEX I_FK_COMMANDE_CLIENT
     ON COMMANDE (REF_Client ASC);

# -----------------------------------------------------------------------------
#       TABLE : ADRESSE
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ADRESSE
 (
   LOT VARCHAR(50) NOT NULL  ,
   REF_Client VARCHAR(32) NULL  ,
   ville VARCHAR(32) NULL  ,
   codePostal VARCHAR(32) NULL  ,
   quartier VARCHAR(32) NULL  
   , PRIMARY KEY (LOT) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE ADRESSE
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_ADRESSE_CLIENT
     ON ADRESSE (REF_Client ASC);

# -----------------------------------------------------------------------------
#       TABLE : CLIENT
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CLIENT
 (
   REF_Client VARCHAR(32) NOT NULL  ,
   ID_Users INT NOT NULL  ,
   nomClient VARCHAR(100) NULL  ,
   prenomClient VARCHAR(100) NULL  ,
   telephone VARCHAR(10) NULL  ,
   civilite VARCHAR(5) NULL  ,
   dateNaissance DATE NULL  
   , PRIMARY KEY (REF_Client) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE CLIENT
# -----------------------------------------------------------------------------


CREATE UNIQUE INDEX I_FK_CLIENT_USERS
     ON CLIENT (ID_Users ASC);

# -----------------------------------------------------------------------------
#       TABLE : PRODUIT
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS PRODUIT
 (
   NUM_Produit INT NOT NULL  ,
   CODE_Categorie VARCHAR(20) NOT NULL  ,
   nomProduit VARCHAR(50) NULL  ,
   prixProduit DECIMAL(10,2) NULL  ,
   stock INT NULL  ,
   imageUrl VARCHAR(255) NULL  
   , PRIMARY KEY (NUM_Produit) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE PRODUIT
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_PRODUIT_CATEGORIE
     ON PRODUIT (CODE_Categorie ASC);

# -----------------------------------------------------------------------------
#       TABLE : CATEGORIE
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CATEGORIE
 (
   CODE_Categorie VARCHAR(20) NOT NULL  ,
   Titre VARCHAR(100) NULL  ,
   description VARCHAR(255) NULL  
   , PRIMARY KEY (CODE_Categorie) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       TABLE : USERS
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS USERS
 (
   ID_Users INT NOT NULL  ,
   nomUsers VARCHAR(100) NULL  ,
   passwordUsers VARCHAR(255) NULL  ,
   emailUsers VARCHAR(100) NULL  ,
   roleUsers VARCHAR(32) NULL  
   , PRIMARY KEY (ID_Users) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       TABLE : PANIER
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS PANIER
 (
   REF_Commande VARCHAR(100) NOT NULL  ,
   NUM_Produit INT NOT NULL  ,
   Quantite INT NULL  ,
   subTotal DECIMAL(10,2) NULL  
   , PRIMARY KEY (REF_Commande,NUM_Produit) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE PANIER
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_PANIER_COMMANDE
     ON PANIER (REF_Commande ASC);

CREATE  INDEX I_FK_PANIER_PRODUIT
     ON PANIER (NUM_Produit ASC);


# -----------------------------------------------------------------------------
#       CREATION DES REFERENCES DE TABLE
# -----------------------------------------------------------------------------


ALTER TABLE PAIEMENT 
  ADD FOREIGN KEY FK_PAIEMENT_COMMANDE (REF_Commande)
      REFERENCES COMMANDE (REF_Commande) ;


ALTER TABLE COMMANDE 
  ADD FOREIGN KEY FK_COMMANDE_ADRESSE (LOT)
      REFERENCES ADRESSE (LOT) ;


ALTER TABLE COMMANDE 
  ADD FOREIGN KEY FK_COMMANDE_CLIENT (REF_Client)
      REFERENCES CLIENT (REF_Client) ;


ALTER TABLE ADRESSE 
  ADD FOREIGN KEY FK_ADRESSE_CLIENT (REF_Client)
      REFERENCES CLIENT (REF_Client) ;


ALTER TABLE CLIENT 
  ADD FOREIGN KEY FK_CLIENT_USERS (ID_Users)
      REFERENCES USERS (ID_Users) ;


ALTER TABLE PRODUIT 
  ADD FOREIGN KEY FK_PRODUIT_CATEGORIE (CODE_Categorie)
      REFERENCES CATEGORIE (CODE_Categorie) ;


ALTER TABLE PANIER 
  ADD FOREIGN KEY FK_PANIER_COMMANDE (REF_Commande)
      REFERENCES COMMANDE (REF_Commande) ;


ALTER TABLE PANIER 
  ADD FOREIGN KEY FK_PANIER_PRODUIT (NUM_Produit)
      REFERENCES PRODUIT (NUM_Produit) ;

