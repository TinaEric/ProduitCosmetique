import React, { useEffect, useState, useCallback } from "react";
import { Construction, PencilLine, Trash, NotepadText } from "lucide-react";
import { ClientListe, suppClient } from "@/services/UserService";
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
const ClientPage = () => {
    const [ClientTab, setClientTab] = useState([]);
    const [UserAdmin, setUserAdmin] = useState([]);
    const [filtreClient, setFiltreClient] = useState(null);
    const [totalFiltre, setTotalFiltre] = useState(0);
    const [loading, setLoading] = useState(false);
    const [chekTab, setChekTab] = useState([]);
    const [checked, setChecked] = useState(false);
    const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    // Fonction pour gérer la sélection des clients
    const clientSelectionner = (idClient) => {
        if (chekTab.includes(idClient)) {
            setChekTab(chekTab.filter((id) => id !== idClient));
        } else {
            setChekTab([...chekTab, idClient]);
        }
    };

    const FetchClient = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await ClientListe();
            if (donnes.data) {
                setClientTab(donnes.data);
                console.log("Data Client : ", donnes.data);
            } else {
                setMessage({
                    ouvre: true,
                    texte: donnes.error,
                    statut: donnes.statut,
                });
                setOpen(true);
                console.log("Erreur liste client : ", donnes.error);
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

        const SupprimerTab = async (tab) => {
            console.log("Selectionner : ", tab);
            try {
                const donnes = await suppClient(tab);
                if (donnes.data){
                    setMessage({
                        ouvre: true,
                        texte: donnes.message,
                        statut: donnes.statut,
                    });
                    setOpen(true);
                    console.log("resultat: ", donnes.message);
                }else{
                    setMessage({
                        ouvre: true,
                        texte: donnes.error,
                        statut: donnes.statut,
                    });
                    setOpen(true);
                    console.log("resultat: ", donnes.error);
                }
                
                setChekTab([]);
                await FetchClient();
            } catch (error) {
                console.error("Erreur de suppression :", error);
                setMessage({
                    ouvre: true,
                    texte: error.message,
                    statut: "error",
                });
                setOpen(true);
            }
        };

    useEffect(() => {
        FetchClient();
        setSearchTerm("");
        setFilterValue("Tous");
    }, []);

    const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
        if(dateTimeString == null || dateTimeString === ''){
            return 'date non renseignée';
        }
        const mois = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ];
        const [date, fullTime] = dateTimeString.split('T');
        const time = fullTime.split('+')[0];
        if (extract === 'date') {
            if (format) {
                const daty = new Date(dateTimeString);
                const jour = String(daty.getDate()).padStart(2, '0');
                const moisIndex = daty.getMonth();
                const annee = daty.getFullYear();
                return `${jour} ${mois[moisIndex]} ${annee}`;
            }
            return new Date(date).toLocaleDateString('fr-FR');

        } else if (extract === 'time') {
            return time;
        }else{
            return new Date(date).toLocaleDateString('fr-FR');
        }

      }

        useEffect(() => {
            let resultat = [...ClientTab];
    
    
            if (searchTerm) {
                const terme = searchTerm.toLowerCase();
                resultat = resultat.filter(
                    (client) => client.nomClient.toLowerCase().includes(terme) || client.prenomClient.toLowerCase().includes(terme), // includes(): nom produit mis an lay terme
                );
            }
    
            if (filterValue && filterValue !== Filtres.TOUS) {
                switch (filterValue) {
                    case Filtres.ALPHABETIQUE:
                        resultat = resultat.sort((a, b) => a.nomClient.localeCompare(b.nomClient));
                        break;
                    case Filtres.DERNIER_A_JOUR:
                        resultat = resultat.sort((a, b) => new Date(b.dateInscription) - new Date(a.dateInscription));
                        break;
                }
            }
    
            setFiltreClient(resultat);
            setTotalFiltre(resultat.length);
    
        }, [ClientTab, searchTerm, filterValue]);
    

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    // Fonction pour sélectionner/désélectionner tous les clients
    const toggleSelectAll = (e) => {
        setChecked(e.target.checked);
        if (e.target.checked) {
            setChekTab(Client.map((client) => client.refClient || client.id));
        } else {
            setChekTab([]);
        }
    };

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };
    return (
        <div className="">
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
                        (chekTab.length > 1 ? "ces " + chekTab.length + " élements" : "cet élement") +
                        "  definitivement et les produits associés ?"
                    }
                    onDelete={SupprimerTab}
                    tab={chekTab}
                />
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
            </div>
            <div className="flex justify-between rounded-lg bg-white px-4 py-2 shadow transition-colors dark:bg-slate-900">
                <div className="flex w-full flex-row items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trié par :</span>
                    {["tous", "inactive", "à enrichir", "standard"].map((status) => (
                        <button
                            key={status}
                            // onClick={() => setFilterStatus(status)}
                            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                filtreClient === status
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex w-full items-center justify-end gap-4 text-slate-950 dark:text-gray-200">
                    <label className="label">
                        <span className="label-text text-slate-950 dark:text-gray-200">Trié par :</span>
                    </label>
                    <select
                        className="select select-sm rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
                        value={filterValue}
                        onChange={handleFilterChange}
                    >
                        <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
                        <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
                        <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-col gap-y-4 rounded-lg border border-slate-300 bg-white p-2 transition-colors dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-y-2 rounded-lg p-1">
                    <div className="relative h-[450px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="w-full text-slate-900 dark:text-slate-50">
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
                                    <th className="table-head">Référence Client</th>
                                    <th className="table-head">Civilité</th>
                                    <th className="table-head">Nom Client</th>
                                    <th className="table-head">Email Client</th>
                                    <th className="table-head">Téléphone</th>
                                    <th className="table-head">Date de Naissance</th>
                                    <th className="table-head">Date d'incription</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {filtreClient ? (
                                    filtreClient.map((client) => (
                                        <tr
                                            key={client.refClient}
                                            className="table-row"
                                        >
                                            <td className="table-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={chekTab.includes(client.refClient || client.id)}
                                                    onChange={() => clientSelectionner(client.refClient || client.id)}
                                                    className="checkbox-secondary checkbox"
                                                />
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                                    {client.refClient}</div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {client.civiliteClient}</div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {client.nomClient} {client.prenomClient}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {client.user.emailUsers }
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {client.telephoneClient}</div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {ExtractionDate(client.dateNaissance, "date", true)}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="text-sm text-gray-900 dark:text-slate-50">
                                                    {ExtractionDate(client.dateInscription, "date", true)}
                                                </div>
                                                <div className="text-sm text-gray-500">{ExtractionDate(client.dateInscription,"time")}</div>
                                            </td>
                                            <td className="table-cell">
                                                <button
                                                    // onClick={() => afficheDetailCommande(commande)}
                                                    className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
                                                >
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr key="vide">
                                        <td colSpan="8">
                                            <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
                                                {loading ? (
                                                    <div className="flex h-64 flex-row items-center justify-center gap-2">
                                                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                                                        <span>Chargement de liste des Clients...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <Construction
                                                                strokeWidth={1}
                                                                className="h-40 w-40"
                                                            />
                                                        </div>
                                                        <p className="py-8 text-center text-sm">
                                                            {filtreClient === null ? (
                                                                <span className="text-gray-500">Aucun Client trouvé pour le moment.</span>
                                                            ) : searchTerm ? (
                                                                <p>
                                                                    {console.log("Aucun resulat")}
                                                                    Aucun Client correspond à <span className="font-bold">{searchTerm}</span>{" "}
                                                                </p>
                                                            ) : (
                                                                `Aucun Client trouvé pour le moment.`
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
        </div>
    );
};

export default ClientPage;
