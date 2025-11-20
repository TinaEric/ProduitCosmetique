import React, { useEffect, useState, useCallback } from "react";
import { Construction, PencilLine, Trash, NotepadText } from "lucide-react";
import { UserListe,ListeCLient } from "../../../services/UserService";
import { Footer } from "../../layouts/footer";
import Dialogue from "@/Admin/components/Dialogue";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useSearch } from "../../contexts/SearchContext";
import { InputText } from "@/components/InputGrp";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { FaCheckCircle, FaTimesCircle, FaUserCheck } from "react-icons/fa";

const Filtres = {
  TOUS: "Tous",
  DERNIER_A_JOUR: "Dernier à Jour",
  ALPHABETIQUE: "Alphabetique",
};

const ListUsers = () => {
  const [Client, setClient] = useState([]);
  const [UserAdmin, setUserAdmin] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chekTab, setChekTab] = useState([]);
  const [checked, setChecked] = useState(false);
  const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();
  
  const [message, setMessage] = useState({
    ouvre: false,
    texte: "vide",
    statut: "success",
  });

  // Filtrer les clients vérifiés
  const clientsVerifies = Client.filter(client => 
    client.estVerifie === true || client.statut === "vérifié" || client.verified === true
  );

  const FetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const donnes = await ListeCLient();
      if (donnes.data) {
        setClient(donnes.data);
        console.log("Liste Client : ",donnes.data)
      } else {
        setMessage({
          ouvre: true,
          texte: donnes.error,
          statut: donnes.statut,
        });
        setOpen(true);
        console.log("Erreur liste client : ",donnes.error)
      }
    } catch (error) {
      console.error("Erreur de récupération :", error);
      setMessage({
        ouvre: true,
        texte: error.message,
        statut: "error",
      });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const FetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const donnes = await UserListe();
      if (donnes.data) {
        setUserAdmin(donnes.data);
        console.log(" liste user : ",donnes.data)
      } else {
        setMessage({
          ouvre: true,
          texte: donnes.error,
          statut: donnes.statut,
        });
        setOpen(true);
        console.log("Erreur liste user : ",donnes.error)
      }
    } catch (error) {
      console.error("Erreur de récupération :", error);
      setMessage({
        ouvre: true,
        texte: error.message,
        statut: "error",
      });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    FetchClient();
    FetchUser();
    setSearchTerm("");
    setFilterValue("Tous");
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // Fonction pour gérer la sélection des clients
  const clientSelectionner = (idClient) => {
    if (chekTab.includes(idClient)) {
      setChekTab(chekTab.filter(id => id !== idClient));
    } else {
      setChekTab([...chekTab, idClient]);
    }
  };

  // Fonction pour sélectionner/désélectionner tous les clients
  const toggleSelectAll = (e) => {
    setChecked(e.target.checked);
    if (e.target.checked) {
      setChekTab(Client.map(client => client.idClient || client.id));
    } else {
      setChekTab([]);
    }
  };

  return (
    <div className="drawer drawer-end min-h-screen">
      <input
        id="edit-drawer"
        type="checkbox"
        className="drawer-toggle"
      />

      <div className="drawer-content flex flex-col gap-5">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row justify-start gap-5">
            <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 text-info transition-colors dark:border-slate-700 dark:bg-slate-900">
              <span className="font-bold">Total Clients :</span>
              <span>{Client.length}</span>
            </div>
            <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 text-success transition-colors dark:border-slate-700 dark:bg-slate-900">
              <span className="font-bold">Vérifiés :</span>
              <span>{clientsVerifies.length}</span>
            </div>
            <div className="flex gap-2 rounded-lg border border-slate-300 bg-white p-2 text-warning transition-colors dark:border-slate-700 dark:bg-slate-900">
              <span className="font-bold">En attente :</span>
              <span>{Client.length - clientsVerifies.length}</span>
            </div>
          </div>
          <div>
            {chekTab.length > 0 && (
              <button
                className="top-13 btn btn-circle btn-error btn-outline btn-lg fixed right-10 z-50 shadow-xl"
                onClick={() => document.getElementById("all").showModal()}
              >
                <Trash size={15} />
                <span>({chekTab.length})</span>
              </button>
            )}
            <Dialogue
              id="all"
              titre="Suppression"
              texte={
                "Voulez vous vraiment supprimer " +
                (chekTab.length > 1 ? "ces " + chekTab.length + " clients" : "ce client") +
                " définitivement ?"
              }
              // onDelete={SupprimerTab}
              // tab={chekTab}
            />
          </div>
        </div>
        {message.ouvre && (
          <Snackbar
            open={open}
            autoHideDuration={5000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity={message.statut}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {message.texte}
            </Alert>
          </Snackbar>
        )}
        <div className="card">
          <div className="card-header">
            <p className="card-title font-bold flex items-center gap-2">
              <FaUserCheck className="text-green-500" />
              Liste des clients vérifiés
            </p>
          </div>
          <div className="card-body p-0">
            <div className="relative h-[480px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
              <table className="table">
                <thead className="table-header">
                  <tr className="table-row text-gray-500 dark:text-gray-400">
                    <th className="table-head">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={toggleSelectAll}
                        className="checkbox-secondary checkbox"
                      />
                    </th>
                    <th className="table-head">ID Client</th>
                    <th className="table-head">Nom & Prénom</th>
                    <th className="table-head">Email</th>
                    <th className="table-head">Téléphone</th>
                    <th className="table-head">Statut Vérification</th>
                    <th className="table-head">Date Inscription</th>
                    <th className="table-head">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {Client.length > 0 ? (
                    Client.map((client) => (
                      <tr
                        key={client.refClient || client.id}
                        className="table-row hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="table-cell">
                          <input
                            type="checkbox"
                            checked={chekTab.includes(client.refClient || client.id)}
                            onChange={() => clientSelectionner(client.refClient || client.id)}
                            className="checkbox-secondary checkbox"
                          />
                        </td>

                        <td className="table-cell font-mono text-sm">
                          {client.refClient || client.id || "N/A"}
                        </td>

                        <td className="table-cell">
                          <div className="flex max-w-xs flex-col whitespace-normal break-words">
                            <p className="font-semibold">
                              {client.nomClient || "Nom non renseigné"} {client.prenomClient || ""}
                            </p>
                            {client.emailUsers && (
                              <p className="font-normal text-slate-600 dark:text-slate-400 text-sm">
                                {client.adresse}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="table-cell">
                          <div className="flex items-center">
                            {client.email || "Email non renseigné"}
                          </div>
                        </td>

                        <td className="table-cell">
                          <div className="flex items-center">
                            {client.telephoneClient || "N/A"}
                          </div>
                        </td>

                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            <span className="badge-soft badge badge-success">Vérifié</span>
                          </div>
                        </td>

                        <td className="table-cell">
                          <div className="flex items-center text-sm">
                            {client.dateInscription ? 
                              new Date(client.dateInscription).toLocaleDateString('fr-FR') : 
                              "N/A"
                            }
                          </div>
                        </td>

                        <td className="table-cell">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              // onClick={() => modifierClient(client)}
                              className="btn btn-ghost btn-sm text-blue-500 hover:text-blue-700"
                              title="Modifier"
                            >
                              <PencilLine size={16} />
                            </button>
                            <button
                              // onClick={() => setClientASupprimer(client)}
                              className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
                              title="Supprimer"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key="vide">
                      <td colSpan="8">
                        <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
                          {loading ? (
                            <div className="flex flex-row items-center justify-center gap-2">
                              <span className="loading-xl loading loading-dots text-blue-600"></span>
                              <span>Chargement des clients...</span>
                            </div>
                          ) : (
                            <>
                              <div>
                                <Construction
                                  strokeWidth={1}
                                  className="h-40 w-40"
                                />
                              </div>
                              <p className="text-sm">
                                {searchTerm ? (
                                  <p>
                                    Aucun client vérifié correspond à{" "}
                                    <span className="font-bold">{searchTerm}</span>
                                  </p>
                                ) : (
                                  `Aucun client vérifié trouvé pour le moment.`
                                )}
                              </p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="edit-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        {/* Drawer pour modifier un client */}
        {/* <div className="min-h-full w-[400px] bg-slate-50 p-6 text-base-content dark:bg-base-100">
          {clientModifier ? (
            <form onSubmit={ModifierClientDB}>
              <div className="flex w-full items-center justify-center">
                <h2 className="mb-6 text-2xl font-bold text-accent">Modification d'un client</h2>
              </div>
              <div className="py-10">
                <InputText
                  type="text"
                  IconComponent={FaUser}
                  placeholder="Nom..."
                  title="Nom"
                  value={nomClient}
                  onChange={setNomClient}
                />
                <InputText
                  type="email"
                  IconComponent={FaEnvelope}
                  placeholder="Email..."
                  title="Email"
                  value={emailClient}
                  onChange={setEmailClient}
                />
                <InputText
                  type="tel"
                  IconComponent={FaPhone}
                  placeholder="Téléphone..."
                  title="Téléphone"
                  value={telephoneClient}
                  onChange={setTelephoneClient}
                />
                <label className="mb-5 w-full items-center justify-center">
                  <div className="label">
                    <span className="label-text text-gray-800 dark:text-slate-300">Adresse</span>
                  </div>
                  <textarea
                    value={adresseClient}
                    onChange={(e) => setAdresseClient(e.target.value)}
                    className="textarea textarea-bordered h-[100px] w-full border border-slate-500 bg-transparent text-base text-black focus:border-blue-600 dark:border-slate-600 dark:text-white"
                    placeholder="Adresse complète..."
                  ></textarea>
                </label>
              </div>
              <div className="flex w-full flex-row justify-end gap-4 px-2">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="btn btn-outline btn-error w-1/2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-accent w-1/2"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <span className="loading-xl loading loading-dots"></span>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default ListUsers;