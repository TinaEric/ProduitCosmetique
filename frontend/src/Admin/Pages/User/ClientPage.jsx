import { ClientListe, creerClient, suppClient } from "@/services/UserService";
import { Footer } from "../../layouts/footer";
import Dialogue from "@/Admin/components/Dialogue";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import { useSearch } from "../../contexts/SearchContext";
import { InputText } from "@/components/InputGrp";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { FaCheckCircle, FaTimesCircle, FaUserCheck } from "react-icons/fa";
import React, { useEffect, useState, useCallback } from "react";
import { Construction, PencilLine, Trash, Plus, Search, Eye, Lock, AtSign, Filter, UserPlus, Mail, Phone, Calendar, User } from "lucide-react";

const Filtres = {
    TOUS: "Tous",
    DERNIER_A_JOUR: "Dernier à Jour",
    ALPHABETIQUE: "Alphabetique",
};

const ClientPage = () => {
    const [ClientTab, setClientTab] = useState([]);
    const [filtreClient, setFiltreClient] = useState(null);
    const [totalFiltre, setTotalFiltre] = useState(0);
    const [loading, setLoading] = useState(false);
    const [chekTab, setChekTab] = useState([]);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();

    const [clientToDelete, setClientToDelete] = useState(null);
    const [dialogOpen, setDialogOpen] = useState({ type: null, open: false });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const clientSelectionner = (idClient) => {
        if (chekTab.includes(idClient)) {
            setChekTab(chekTab.filter((id) => id !== idClient));
        } else {
            setChekTab([...chekTab, idClient]);
        }
    };

    const [newClientData, setNewClientData] = useState({
        nomClient: "",
        prenomClient: "",
        email: "",
        telephoneClient: "",
        civiliteClient: "M.", // Valeur par défaut
        dateNaissance: "",
        password: "", // Champ Mot de passe
        roles: "ROLE_CLIENT", // Champ Rôle par défaut
    });
    const [isCreating, setIsCreating] = useState(false); // Pour le loading du bouton de création

    const creerNouveauClient = () => {
        setDialogOpen({ type: "create", open: true });
    };

    const handleNewClientChange = (e) => {
        setNewClientData({ ...newClientData, [e.target.name]: e.target.value });
    };

    const handleCreateClientSubmit = async () => {
        setIsCreating(true);
        try {
            const donnes = await creerClient(newClientData);

            if (donnes.data || donnes.refClient) {
                setSnackbar({
                    open: true,
                    message: `Client ${donnes.refClient || ""} créé avec succès.`,
                    severity: "success",
                });
                setDialogOpen({ type: null, open: false });
                setNewClientData({
                    // Réinitialiser le formulaire
                    nomClient: "",
                    prenomClient: "",
                    email: "",
                    telephoneClient: "",
                    civiliteClient: "M.",
                    dateNaissance: "",
                    password: "",
                    roles: "ROLE_CLIENT",
                });
                await FetchClient(); // Recharger la liste
            } else {
                setSnackbar({
                    open: true,
                    message: donnes.error || "Échec de la création du client.",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Erreur de création :", error);
            setSnackbar({
                open: true,
                message: error.message || "Une erreur inattendue est survenue.",
                severity: "error",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const afficheDetailClient = (Client) => {
        navigate("/admin/ficheClient", { state: Client });
    };

    const modifierClient = (client) => {
        alert(`Modification du client ${client.nomClient} ${client.prenomClient}`);
    };

    const FetchClient = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await ClientListe();
            if (donnes.data) {
                setClientTab(donnes.data);
            }
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setSnackbar({
                open: true,
                message: error.message,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const SupprimerUnClient = async (refClient) => {
        try {
            const donnes = await suppClient([refClient]);
            if (donnes.data) {
                setSnackbar({
                    open: true,
                    message: "Client supprimé avec succès",
                    severity: "success",
                });
            } else {
                setSnackbar({
                    open: true,
                    message: "Une Probleme de suppression  s'est produit",
                    severity: "success",
                });
                console.log("Erreur Suppression Un CLient: ", donnes.error);
            }
            await FetchClient();
        } catch (error) {
            console.error("Erreur de suppression :", error);
            setSnackbar({
                open: true,
                message: error.message,
                severity: "error",
            });
        }
        setDialogOpen({ type: null, open: false });
    };

    const SupprimerTab = async (tab) => {
        try {
            const donnes = await suppClient(tab);
            if (donnes.data) {
                setSnackbar({
                    open: true,
                    message: donnes.message,
                    severity: "success",
                });
            } else {
                setSnackbar({
                    open: true,
                    message: "Une Probleme de suppression  s'est produit",
                    severity: "success",
                });
                console.log("Erreur Suppression Tab CLient: ", donnes.error);
            }
            setChekTab([]);
            await FetchClient();
        } catch (error) {
            console.error("Erreur de suppression :", error);
            setSnackbar({
                open: true,
                message: error.message,
                severity: "error",
            });
        }
        setDialogOpen({ type: null, open: false });
    };

    const SupprimerTous = async () => {
        const tousLesIds = filtreClient.map((client) => client.refClient || client.id);
        await SupprimerTab(tousLesIds);
    };

    useEffect(() => {
        FetchClient();
    }, []);

    const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
        if (dateTimeString == null || dateTimeString === "") {
            return "date non renseignée";
        }
        const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const [date, fullTime] = dateTimeString.split("T");
        const time = fullTime.split("+")[0];
        if (extract === "date") {
            if (format) {
                const daty = new Date(dateTimeString);
                const jour = String(daty.getDate()).padStart(2, "0");
                const moisIndex = daty.getMonth();
                const annee = daty.getFullYear();
                return `${jour} ${mois[moisIndex]} ${annee}`;
            }
            return new Date(date).toLocaleDateString("fr-FR");
        } else if (extract === "time") {
            return time;
        } else {
            return new Date(date).toLocaleDateString("fr-FR");
        }
    };

    useEffect(() => {
        let resultat = [...ClientTab];

        if (searchTerm) {
            const terme = searchTerm.toLowerCase();
            resultat = resultat.filter(
                (client) => client.nomClient.toLowerCase().includes(terme) || client.prenomClient.toLowerCase().includes(terme),
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

    const toggleSelectAll = (e) => {
        setChecked(e.target.checked);
        if (e.target.checked) {
            setChekTab(filtreClient.map((client) => client.refClient || client.id));
        } else {
            setChekTab([]);
        }
    };

    useEffect(() => {
        setFilterValue("Tous");
        setSearchTerm("");
    }, []);
    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

    // Composant Dialog personnalisé
    const Dialog = ({ open, onClose, onConfirm, title, message }) => {
        if (!open) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">{message}</p>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-all hover:bg-red-700"
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const CreationClientDialog = ({ open, onClose, data, onChange, onSubmit, isSubmitting }) => {
        if (!open) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
                    <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        <UserPlus
                            size={24}
                            className="mr-2 inline-block"
                        />
                        Créer un nouveau client
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Nom et Prénom */}
                        <InputText
                            label="Nom"
                            name="nomClient"
                            value={data.nomClient}
                            onChange={onChange}
                            icon={<User size={18} />}
                            placeholder="Nom de famille"
                            required
                        />
                        <InputText
                            label="Prénom"
                            name="prenomClient"
                            value={data.prenomClient}
                            onChange={onChange}
                            icon={<User size={18} />}
                            placeholder="Prénom"
                            required
                        />

                        {/* Email et Mot de passe */}
                        <InputText
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={onChange}
                            icon={<AtSign size={18} />}
                            placeholder="Email (Identifiant)"
                            required
                        />
                        <InputText
                            label="Mot de Passe"
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={onChange}
                            icon={<Lock size={18} />}
                            placeholder="Mot de passe"
                            required
                        />

                        {/* Téléphone et Civilité */}
                        <InputText
                            label="Téléphone"
                            name="telephoneClient"
                            value={data.telephoneClient}
                            onChange={onChange}
                            icon={<Phone size={18} />}
                            placeholder="0612345678"
                        />
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Civilité</label>
                            <select
                                name="civiliteClient"
                                value={data.civiliteClient}
                                onChange={onChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-all focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="M.">M.</option>
                                <option value="Mme">Mme</option>
                                <option value="Mlle">Mlle</option>
                            </select>
                        </div>

                        {/* Date de Naissance et Rôle */}
                        <InputText
                            label="Date de Naissance"
                            name="dateNaissance"
                            type="date"
                            value={data.dateNaissance}
                            onChange={onChange}
                            icon={<Calendar size={18} />}
                        />
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rôle (User)</label>
                            <select
                                name="roles"
                                value={data.roles}
                                onChange={onChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-all focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="ROLE_CLIENT">Client</option>
                                <option value="ROLE_ADMIN">Admin</option>
                                <option value="ROLE_COMMERCIAL">Commercial</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onSubmit}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle size={18} />
                                    Créer le client
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    // Composant Snackbar personnalisé
    const SnackbarComponent = ({ open, message, severity, onClose }) => {
        if (!open) return null;

        const bgColor = severity === "success" ? "bg-green-600" : "bg-red-600";

        return (
            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-[slideUp_0.3s_ease-out]">
                <div className={`${bgColor} flex items-center gap-3 rounded-lg px-6 py-4 text-white shadow-2xl`}>
                    <span>{message}</span>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 dark:from-slate-950 dark:to-slate-900">
            {/* En-tête avec actions */}
            {/* <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Clients</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {totalFiltre} client{totalFiltre > 1 ? 's' : ''} trouvé{totalFiltre > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={creerNouveauClient}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                >
                    <UserPlus size={20} />
                    Nouveau Client
                </button>
            </div> */}

            {/* Boutons d'actions flottants */}
            <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
                {chekTab.length > 0 && (
                    <button
                        onClick={() => setDialogOpen({ type: "selected", open: true })}
                        className="hover:shadow-3xl flex items-center gap-2 rounded-full bg-red-600 px-6 py-4 font-semibold text-white shadow-2xl transition-all hover:bg-red-700"
                    >
                        <Trash size={20} />
                        Supprimer ({chekTab.length})
                    </button>
                )}
            </div>

            {/* Dialogues */}
            <Dialog
                open={dialogOpen.type === "selected" && dialogOpen.open}
                onClose={() => setDialogOpen({ type: null, open: false })}
                onConfirm={() => SupprimerTab(chekTab)}
                title="Suppression multiple"
                message={`Voulez-vous vraiment supprimer ${chekTab.length > 1 ? `ces ${chekTab.length} clients` : "ce client"} définitivement ?`}
            />

            <Dialog
                open={dialogOpen.type === "one" && dialogOpen.open}
                onClose={() => setDialogOpen({ type: null, open: false })}
                onConfirm={() => SupprimerUnClient(clientToDelete)}
                title="Supprimer le client"
                message="Voulez-vous vraiment supprimer ce client définitivement ?"
            />

            <Dialog
                open={dialogOpen.type === "all" && dialogOpen.open}
                onClose={() => setDialogOpen({ type: null, open: false })}
                onConfirm={SupprimerTous}
                title="Supprimer tous les clients"
                message={`Voulez-vous vraiment supprimer TOUS les ${totalFiltre} clients définitivement ? Cette action est irréversible.`}
            />

            <SnackbarComponent
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />

            <CreationClientDialog
                open={dialogOpen.type === "create" && dialogOpen.open}
                onClose={() => setDialogOpen({ type: null, open: false })}
                data={newClientData}
                onChange={handleNewClientChange}
                onSubmit={handleCreateClientSubmit}
                isSubmitting={isCreating}
            />

            {/* Barre de filtres et recherche */}
            <div className="mb-3 rounded-2xl bg-white px-6 py-3 shadow-lg dark:bg-slate-800">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="input border border-slate-500 bg-[#FDFEFF] dark:border-slate-600 dark:bg-[#020617]">
                            <Search
                                size={20}
                                className="text-slate-400"
                            />
                            <input
                                type="text"
                                name="search"
                                id="search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Recherche..."
                                className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
                            />
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {totalFiltre} client{totalFiltre > 1 ? "s" : ""} trouvé{totalFiltre > 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Filtre */}
                        <div className="flex items-center gap-3">
                            <Filter
                                size={20}
                                className="text-slate-600 dark:text-slate-400"
                            />
                            <select
                                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-all hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                value={filterValue}
                                onChange={handleFilterChange}
                            >
                                <option value={Filtres.TOUS}>Tous les clients</option>
                                <option value={Filtres.ALPHABETIQUE}>Ordre alphabétique</option>
                                <option value={Filtres.DERNIER_A_JOUR}>Plus récents</option>
                            </select>
                        </div>

                        {/* <button
                            onClick={creerNouveauClient}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                        >
                            <UserPlus size={20} />
                            Nouveau Client
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Tableau des clients */}
            <div className="rounded-2xl bg-white shadow-xl dark:bg-slate-800">
                <div className="relative h-[460px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={toggleSelectAll}
                                        className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Référence
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Naissance
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Inscription
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-20"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"></div>
                                            <p className="text-slate-600 dark:text-slate-400">Chargement des clients...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtreClient && filtreClient.length > 0 ? (
                                filtreClient.map((client) => (
                                    <tr
                                        key={client.refClient}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={chekTab.includes(client.refClient || client.id)}
                                                onChange={() => clientSelectionner(client.refClient || client.id)}
                                                className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 transition-all focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {client.refClient}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                                                    {client.nomClient.charAt(0)}
                                                    {client.prenomClient.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {client.civiliteClient} {client.nomClient} {client.prenomClient}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Mail size={14} />
                                                    {client.user.emailUsers}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Phone size={14} />
                                                    {client.telephoneClient}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Calendar size={14} />
                                                {ExtractionDate(client.dateNaissance, "date", true)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900 dark:text-white">
                                                {ExtractionDate(client.dateInscription, "date", true)}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {ExtractionDate(client.dateInscription, "time")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => afficheDetailClient(client)}
                                                    className="flex gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                                                    title="Voir les détails"
                                                >
                                                    <Eye size={16} />
                                                    Détails
                                                </button>
                                                {/* <button
                                                    onClick={() => {
                                                        setClientToDelete(client.refClient || client.id);
                                                        setDialogOpen({ type: "one", open: true });
                                                    }}
                                                    className="rounded-lg bg-red-600 p-2 text-white transition-all hover:bg-red-700"
                                                    title="Supprimer"
                                                >
                                                    <Trash size={18} />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-20"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Construction
                                                className="h-32 w-32 text-slate-300 dark:text-slate-600"
                                                strokeWidth={1}
                                            />
                                            <p className="text-center text-slate-600 dark:text-slate-400">
                                                {searchTerm ? (
                                                    <>
                                                        Aucun client ne correspond à <span className="font-bold">"{searchTerm}"</span>
                                                    </>
                                                ) : (
                                                    "Aucun client trouvé pour le moment."
                                                )}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translate(-50%, 100px);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ClientPage;

// import { Construction, PencilLine, Trash, NotepadText } from "lucide-react";
// import { ClientListe, suppClient } from "@/services/UserService";
// import { Footer } from "../../layouts/footer";
// import Dialogue from "@/Admin/components/Dialogue";
// import Alert from "@mui/material/Alert";
// import { useNavigate } from "react-router-dom";
// import Snackbar from "@mui/material/Snackbar";
// import { useSearch } from "../../contexts/SearchContext";
// import { InputText } from "@/components/InputGrp";
// import { BiSolidCategoryAlt } from "react-icons/bi";
// import { FaCheckCircle, FaTimesCircle, FaUserCheck } from "react-icons/fa";

// const Filtres = {
//     TOUS: "Tous",
//     DERNIER_A_JOUR: "Dernier à Jour",
//     ALPHABETIQUE: "Alphabetique",
// };
// const ClientPage = () => {
//     const [ClientTab, setClientTab] = useState([]);
//     const [UserAdmin, setUserAdmin] = useState([]);
//     const [filtreClient, setFiltreClient] = useState(null);
//     const [totalFiltre, setTotalFiltre] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const [chekTab, setChekTab] = useState([]);
//       const navigate = useNavigate();
//     const [checked, setChecked] = useState(false);
//     const { searchTerm, setSearchTerm, filterValue, setFilterValue } = useSearch();
//     const [open, setOpen] = useState(false);
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });

//     // Fonction pour gérer la sélection des clients
//     const clientSelectionner = (idClient) => {
//         if (chekTab.includes(idClient)) {
//             setChekTab(chekTab.filter((id) => id !== idClient));
//         } else {
//             setChekTab([...chekTab, idClient]);
//         }
//     };

//     const afficheDetailClient = (Client) => {
//         navigate("/admin/ficheClient",{state: Client});
//     }

//     const FetchClient = useCallback(async () => {
//         setLoading(true);
//         try {
//             const donnes = await ClientListe();
//             if (donnes.data) {
//                 setClientTab(donnes.data);
//                 console.log("Data Client : ", donnes.data);
//             } else {
//                 setMessage({
//                     ouvre: true,
//                     texte: donnes.error,
//                     statut: donnes.statut,
//                 });
//                 setOpen(true);
//                 console.log("Erreur liste client : ", donnes.error);
//             }
//         } catch (error) {
//             console.error("Erreur de récupération :", error);
//             setMessage({
//                 ouvre: true,
//                 texte: error.message,
//                 statut: "error",
//             });
//             setOpen(true);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//         const SupprimerTab = async (tab) => {
//             console.log("Selectionner : ", tab);
//             try {
//                 const donnes = await suppClient(tab);
//                 if (donnes.data){
//                     setMessage({
//                         ouvre: true,
//                         texte: donnes.message,
//                         statut: donnes.statut,
//                     });
//                     setOpen(true);
//                     console.log("resultat: ", donnes.message);
//                 }else{
//                     setMessage({
//                         ouvre: true,
//                         texte: donnes.error,
//                         statut: donnes.statut,
//                     });
//                     setOpen(true);
//                     console.log("resultat: ", donnes.error);
//                 }

//                 setChekTab([]);
//                 await FetchClient();
//             } catch (error) {
//                 console.error("Erreur de suppression :", error);
//                 setMessage({
//                     ouvre: true,
//                     texte: error.message,
//                     statut: "error",
//                 });
//                 setOpen(true);
//             }
//         };

//     useEffect(() => {
//         FetchClient();
//         setSearchTerm("");
//         setFilterValue("Tous");
//     }, []);

//     const ExtractionDate = (dateTimeString, extract = "date", format = false) => {
//         if(dateTimeString == null || dateTimeString === ''){
//             return 'date non renseignée';
//         }
//         const mois = [
//             'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
//             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
//           ];
//         const [date, fullTime] = dateTimeString.split('T');
//         const time = fullTime.split('+')[0];
//         if (extract === 'date') {
//             if (format) {
//                 const daty = new Date(dateTimeString);
//                 const jour = String(daty.getDate()).padStart(2, '0');
//                 const moisIndex = daty.getMonth();
//                 const annee = daty.getFullYear();
//                 return `${jour} ${mois[moisIndex]} ${annee}`;
//             }
//             return new Date(date).toLocaleDateString('fr-FR');

//         } else if (extract === 'time') {
//             return time;
//         }else{
//             return new Date(date).toLocaleDateString('fr-FR');
//         }

//       }

//         useEffect(() => {
//             let resultat = [...ClientTab];

//             if (searchTerm) {
//                 const terme = searchTerm.toLowerCase();
//                 resultat = resultat.filter(
//                     (client) => client.nomClient.toLowerCase().includes(terme) || client.prenomClient.toLowerCase().includes(terme), // includes(): nom produit mis an lay terme
//                 );
//             }

//             if (filterValue && filterValue !== Filtres.TOUS) {
//                 switch (filterValue) {
//                     case Filtres.ALPHABETIQUE:
//                         resultat = resultat.sort((a, b) => a.nomClient.localeCompare(b.nomClient));
//                         break;
//                     case Filtres.DERNIER_A_JOUR:
//                         resultat = resultat.sort((a, b) => new Date(b.dateInscription) - new Date(a.dateInscription));
//                         break;
//                 }
//             }

//             setFiltreClient(resultat);
//             setTotalFiltre(resultat.length);

//         }, [ClientTab, searchTerm, filterValue]);

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     // Fonction pour sélectionner/désélectionner tous les clients
//     const toggleSelectAll = (e) => {
//         setChecked(e.target.checked);
//         if (e.target.checked) {
//             setChekTab(Client.map((client) => client.refClient || client.id));
//         } else {
//             setChekTab([]);
//         }
//     };

//     const handleFilterChange = (e) => {
//         setFilterValue(e.target.value);
//     };
//     return (
//         <div className="">
//             <div>
//                 {chekTab.length > 0 && (
//                     <button
//                         className="top-13 btn btn-circle btn-error btn-outline btn-lg fixed right-10 z-50 shadow-xl"
//                         onClick={() => document.getElementById("all").showModal()}
//                     >
//                         <Trash size={15} />
//                         <span>({chekTab.length})</span>
//                     </button>
//                 )}
//                 <Dialogue
//                     id="all"
//                     titre="Suppression"
//                     texte={
//                         "Voulez vous vraiment supprimer " +
//                         (chekTab.length > 1 ? "ces " + chekTab.length + " élements" : "cet élement") +
//                         "  definitivement et les produits associés ?"
//                     }
//                     onDelete={SupprimerTab}
//                     tab={chekTab}
//                 />
//                 {message.ouvre && (
//                     <Snackbar
//                         open={open}
//                         autoHideDuration={5000}
//                         onClose={handleClose}
//                     >
//                         <Alert
//                             onClose={handleClose}
//                             severity={message.statut}
//                             variant="filled"
//                             sx={{ width: "100%" }}
//                         >
//                             {message.texte}
//                         </Alert>
//                     </Snackbar>
//                 )}
//             </div>
//             <div className="flex justify-between rounded-lg bg-white px-4 py-2 shadow transition-colors dark:bg-slate-900">
//                 <div className="flex w-full flex-row items-center gap-4">
//                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trié par :</span>
//                     {["tous", "inactive", "à enrichir", "standard"].map((status) => (
//                         <button
//                             key={status}
//                             // onClick={() => setFilterStatus(status)}
//                             className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
//                                 filtreClient === status
//                                     ? "bg-blue-500 text-white"
//                                     : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
//                             }`}
//                         >
//                             {status.charAt(0).toUpperCase() + status.slice(1)}
//                         </button>
//                     ))}
//                 </div>
//                 <div className="flex w-full items-center justify-end gap-4 text-slate-950 dark:text-gray-200">
//                     <label className="label">
//                         <span className="label-text text-slate-950 dark:text-gray-200">Trié par :</span>
//                     </label>
//                     <select
//                         className="select select-sm rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
//                         value={filterValue}
//                         onChange={handleFilterChange}
//                     >
//                         <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
//                         <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
//                         <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
//                     </select>
//                 </div>
//             </div>
//             <div className="flex flex-col gap-y-4 rounded-lg border border-slate-300 bg-white p-2 transition-colors dark:border-slate-700 dark:bg-slate-900">
//                 <div className="flex flex-col gap-y-2 rounded-lg p-1">
//                     <div className="relative h-[450px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
//                         <table className="w-full text-slate-900 dark:text-slate-50">
//                             <thead className="table-header">
//                                 <tr className="table-row text-gray-500 dark:text-gray-400">
//                                     <th className="table-head">
//                                         <input
//                                             type="checkbox"
//                                             checked={checked}
//                                             onChange={toggleSelectAll}
//                                             className="checkbox-secondary checkbox"
//                                         />
//                                     </th>
//                                     <th className="table-head">Référence Client</th>
//                                     <th className="table-head">Civilité</th>
//                                     <th className="table-head">Nom Client</th>
//                                     <th className="table-head">Email Client</th>
//                                     <th className="table-head">Téléphone</th>
//                                     <th className="table-head">Date de Naissance</th>
//                                     <th className="table-head">Date d'incription</th>
//                                     <th className="table-head">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="">
//                                 {filtreClient ? (
//                                     filtreClient.map((client) => (
//                                         <tr
//                                             key={client.refClient}
//                                             className="table-row"
//                                         >
//                                             <td className="table-cell">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={chekTab.includes(client.refClient || client.id)}
//                                                     onChange={() => clientSelectionner(client.refClient || client.id)}
//                                                     className="checkbox-secondary checkbox"
//                                                 />
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
//                                                     {client.refClient}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {client.civiliteClient}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {client.nomClient} {client.prenomClient}
//                                                 </div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {client.user.emailUsers }
//                                                 </div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {client.telephoneClient}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {ExtractionDate(client.dateNaissance, "date", true)}
//                                                 </div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <div className="text-sm text-gray-900 dark:text-slate-50">
//                                                     {ExtractionDate(client.dateInscription, "date", true)}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">{ExtractionDate(client.dateInscription,"time")}</div>
//                                             </td>
//                                             <td className="table-cell">
//                                                 <button
//                                                     onClick={() => afficheDetailClient(client)}
//                                                     className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
//                                                 >
//                                                     Détails
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr key="vide">
//                                         <td colSpan="8">
//                                             <div className="flex flex-col items-center justify-center p-5 text-gray-500 dark:text-gray-500">
//                                                 {loading ? (
//                                                     <div className="flex h-64 flex-row items-center justify-center gap-2">
//                                                         <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
//                                                         <span>Chargement de liste des Clients...</span>
//                                                     </div>
//                                                 ) : (
//                                                     <>
//                                                         <div>
//                                                             <Construction
//                                                                 strokeWidth={1}
//                                                                 className="h-40 w-40"
//                                                             />
//                                                         </div>
//                                                         <p className="py-8 text-center text-sm">
//                                                             {filtreClient === null ? (
//                                                                 <span className="text-gray-500">Aucun Client trouvé pour le moment.</span>
//                                                             ) : searchTerm ? (
//                                                                 <p>
//                                                                     {console.log("Aucun resulat")}
//                                                                     Aucun Client correspond à <span className="font-bold">{searchTerm}</span>{" "}
//                                                                 </p>
//                                                             ) : (
//                                                                 `Aucun Client trouvé pour le moment.`
//                                                             )}
//                                                         </p>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ClientPage;
