DROP DATABASE IF EXISTS db_ProduitCosmetique;

CREATE DATABASE IF NOT EXISTS db_ProduitCosmetique;
USE db_ProduitCosmetique;
# -----------------------------------------------------------------------------
#       TABLE : PAIEMENT
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS PAIEMENT
 (
   CODE_PAIEMENT VARCHAR(50) NOT NULL  ,
   REF_COMMANDE VARCHAR(100) NOT NULL  ,
   modePaiment VARCHAR(32) NULL  ,
   statutPaiment VARCHAR(32) NULL  ,
   datePaiment VARCHAR(32) NULL  ,
   referencePaiment VARCHAR(32) NULL  ,
   montantPaye DECIMAL(10,2) NULL  
   , PRIMARY KEY (CODE_PAIEMENT) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE PAIEMENT
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_PAIEMENT_COMMANDE
     ON PAIEMENT (REF_COMMANDE ASC);

# -----------------------------------------------------------------------------
#       TABLE : COMMANDE
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS COMMANDE
 (
   REF_COMMANDE VARCHAR(100) NOT NULL  ,
   REF_CLIENT VARCHAR(32) NOT NULL  ,
   REF_ADRESSE VARCHAR(50) NOT NULL  ,
   REF_ADRESSE_FACTURATION VARCHAR(50) NOT NULL  ,
   dateCommande DATE NULL  ,
   statutCommande VARCHAR(32) NULL  
   , PRIMARY KEY (REF_COMMANDE) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE COMMANDE
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_COMMANDE_CLIENT
     ON COMMANDE (REF_CLIENT ASC);

CREATE  INDEX I_FK_COMMANDE_ADRESSE
     ON COMMANDE (REF_ADRESSE ASC);

CREATE  INDEX I_FK_COMMANDE_ADRESSE1
     ON COMMANDE (REF_ADRESSE_FACTURATION ASC);

# -----------------------------------------------------------------------------
#       TABLE : ADRESSE
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ADRESSE
 (
   REF_ADRESSE VARCHAR(50) NOT NULL  ,
   REF_CLIENT VARCHAR(32) NOT NULL  ,
   ville VARCHAR(50) NULL  ,
   codePostal VARCHAR(10) NULL  ,
   quartier VARCHAR(50) NULL  ,
   lot VARCHAR(50) NULL  ,
   libelleAdresse VARCHAR(50) NULL  
   , PRIMARY KEY (REF_ADRESSE) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE ADRESSE
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_ADRESSE_CLIENT
     ON ADRESSE (REF_CLIENT ASC);

# -----------------------------------------------------------------------------
#       TABLE : CLIENT
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CLIENT
 (
   REF_CLIENT VARCHAR(32) NOT NULL  ,
   ID_USERS INT NOT NULL  ,
   nomClient VARCHAR(100) NULL  ,
   prenomClient VARCHAR(100) NULL  ,
   telephoneClient VARCHAR(10) NULL  ,
   civiliteClient VARCHAR(5) NULL  ,
   dateNaissance DATE NULL  
   , PRIMARY KEY (REF_CLIENT) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE CLIENT
# -----------------------------------------------------------------------------


CREATE UNIQUE INDEX I_FK_CLIENT_USERS
     ON CLIENT (ID_USERS ASC);

# -----------------------------------------------------------------------------
#       TABLE : PRODUIT
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS PRODUIT
 (
   NUM_PRODUIT INT NOT NULL  ,
   CODE_CATEGORIE VARCHAR(20) NOT NULL  ,
   nomProduit VARCHAR(50) NULL  ,
   prixProduit DECIMAL(10,2) NULL  ,
   stockProduit INT NULL  ,
   imageUrlProduit VARCHAR(255) NULL  ,
   codePromos VARCHAR(10) NULL  
   , PRIMARY KEY (NUM_PRODUIT) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE PRODUIT
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_PRODUIT_CATEGORIE
     ON PRODUIT (CODE_CATEGORIE ASC);

# -----------------------------------------------------------------------------
#       TABLE : CATEGORIE
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CATEGORIE
 (
   CODE_CATEGORIE VARCHAR(20) NOT NULL  ,
   libelleCategorie VARCHAR(100) NULL  ,
   descriptionCategorie VARCHAR(255) NULL  
   , PRIMARY KEY (CODE_CATEGORIE) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       TABLE : USERS
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS USERS
 (
   ID_USERS INT NOT NULL  ,
   nomUsers VARCHAR(100) NULL  ,
   passwordUsers VARCHAR(255) NULL  ,
   emailUsers VARCHAR(100) NULL  ,
   roleUsers VARCHAR(32) NULL  
   , PRIMARY KEY (ID_USERS) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       TABLE : PANIER
# -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS PANIER
 (
   REF_COMMANDE VARCHAR(100) NOT NULL  ,
   NUM_PRODUIT INT NOT NULL  ,
   quantite INT NULL  
   , PRIMARY KEY (REF_COMMANDE,NUM_PRODUIT) 
 ) 
 comment = "";

# -----------------------------------------------------------------------------
#       INDEX DE LA TABLE PANIER
# -----------------------------------------------------------------------------


CREATE  INDEX I_FK_PANIER_COMMANDE
     ON PANIER (REF_COMMANDE ASC);

CREATE  INDEX I_FK_PANIER_PRODUIT
     ON PANIER (NUM_PRODUIT ASC);


# -----------------------------------------------------------------------------
#       CREATION DES REFERENCES DE TABLE
# -----------------------------------------------------------------------------


ALTER TABLE PAIEMENT 
  ADD FOREIGN KEY FK_PAIEMENT_COMMANDE (REF_COMMANDE)
      REFERENCES COMMANDE (REF_COMMANDE) ;


ALTER TABLE COMMANDE 
  ADD FOREIGN KEY FK_COMMANDE_CLIENT (REF_CLIENT)
      REFERENCES CLIENT (REF_CLIENT) ;


ALTER TABLE COMMANDE 
  ADD FOREIGN KEY FK_COMMANDE_ADRESSE (REF_ADRESSE)
      REFERENCES ADRESSE (REF_ADRESSE) ;


ALTER TABLE COMMANDE 
  ADD FOREIGN KEY FK_COMMANDE_ADRESSE1 (REF_ADRESSE_FACTURATION)
      REFERENCES ADRESSE (REF_ADRESSE) ;


ALTER TABLE ADRESSE 
  ADD FOREIGN KEY FK_ADRESSE_CLIENT (REF_CLIENT)
      REFERENCES CLIENT (REF_CLIENT) ;


ALTER TABLE CLIENT 
  ADD FOREIGN KEY FK_CLIENT_USERS (ID_USERS)
      REFERENCES USERS (ID_USERS) ;


ALTER TABLE PRODUIT 
  ADD FOREIGN KEY FK_PRODUIT_CATEGORIE (CODE_CATEGORIE)
      REFERENCES CATEGORIE (CODE_CATEGORIE) ;


ALTER TABLE PANIER 
  ADD FOREIGN KEY FK_PANIER_COMMANDE (REF_COMMANDE)
      REFERENCES COMMANDE (REF_COMMANDE) ;


ALTER TABLE PANIER 
  ADD FOREIGN KEY FK_PANIER_PRODUIT (NUM_PRODUIT)
      REFERENCES PRODUIT (NUM_PRODUIT) ;

