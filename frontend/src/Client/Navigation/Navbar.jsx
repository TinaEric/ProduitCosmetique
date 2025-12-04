import React, { useEffect, useState } from "react";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import Logo from "../../image/Logo.png";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import logoBleu from "@/image/logoBleu.png";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import DarkMode from "./DarkMode";
import { LoginVerifier } from "@/services/ClientService";
import { Link } from "react-router-dom";
import { useNavbar } from "../context/NavbarContext";
import { MdOutlineStarRate } from "react-icons/md";
import Panier from "../Pages/Commande/Panier";
import { RiHome5Fill } from "react-icons/ri";
import { MdBookmarkBorder } from "react-icons/md";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Avatar, FormHelperText, Stack } from "@mui/material";
import Badge from "@mui/material/Badge";
import { usePanier } from "../context/PanierContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { InputValidate } from "@/components/InputValidate";
import { MdOutlineEmail } from "react-icons/md";
import { RiKeyFill } from "react-icons/ri";
import { FaUser, FaPhone, FaBirthdayCake } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";

const Navbar = () => {
    const { user, login, logout, isAuthenticated, register } = useAuthContext();
    const [ouvrePanier, setOuvrePanier] = useState(false);
    const [messageError, setMessageError] = useState(null);
    const [open, setOpen] = useState(false);
    const [IsProfil, setIsProfil] = useState(false);
    const [profil, setProfil] = useState({});
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const { items } = usePanier();
    const [loadingRegistre, setLoadingRegistre] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nomUserConncte, setNomUserConnecte] = useState("");
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
     const [dejaConnecte, setDejaConnecte] = useState(false);
    const [userProviseur, setUserProviseur] = useState(null);
    useEffect(() => {
            const chargementUser = () => {
                const local = localStorage.getItem('user');
                if (local) {
                    const parsedUser = JSON.parse(local);
                    if (parsedUser && parsedUser.client) {
                        setDejaConnecte(true);
                        setUserProviseur(parsedUser);
                        console.log("Utilisateur déjà connecté (Navbar), chargement des commandes: ", parsedUser);
                    }
                }
            };
            chargementUser();
        }, []);

    // États pour la connexion
    const [loginData, setLoginData] = useState({
        emailUser: "",
        passwordUser: "",
    });
    const [loginErrors, setLoginErrors] = useState({});

    // États pour l'inscription
    const [registerData, setRegisterData] = useState({
        civiliteClient: "",
        nomClient: "",
        prenomClient: "",
        email: "",
        password: "",
        telephoneClient: "",
        dateNaissance: "",
    });
    const [registerErrors, setRegisterErrors] = useState({});

    const { searchTerm, setSearchTerm, setOpenPanier } = useNavbar();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Gestion des changements pour la connexion
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prevData) => ({ ...prevData, [name]: value }));
        setLoginErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    // Gestion des changements pour l'inscription
    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData((prevData) => ({ ...prevData, [name]: value }));
        setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    // Validation email
    const validateEmailFormat = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    // Validation connexion
    const validateLogin = () => {
        let tempErrors = {};
        let isValid = true;

        if (!loginData.passwordUser || loginData.passwordUser.trim() === "") {
            tempErrors.passwordUser = "Le mot de passe est requis.";
            isValid = false;
        }
        if (!loginData.emailUser || !validateEmailFormat(loginData.emailUser)) {
            tempErrors.emailUser = "Une adresse email valide est requise.";
            isValid = false;
        }

        setLoginErrors(tempErrors);
        return isValid;
    };

    // Validation inscription
    const validateRegister = () => {
        let tempErrors = {};
        let isValid = true;

        if (!registerData.civiliteClient) {
            tempErrors.civiliteClient = "La civilité est requise.";
            isValid = false;
        }
        if (!registerData.dateNaissance) {
            tempErrors.dateNaissance = "Veuillez choisir votre date de naissance";
            isValid = false;
        }
        if (!registerData.nomClient || registerData.nomClient.trim() === "") {
            tempErrors.nomClient = "Le nom est requis.";
            isValid = false;
        }
        if (!registerData.prenomClient || registerData.prenomClient.trim() === "") {
            tempErrors.prenomClient = "Le prénom est requis.";
            isValid = false;
        }
        if (!registerData.password || registerData.password.trim() === "") {
            tempErrors.password = "Le mot de passe est requis.";
            isValid = false;
        }
        if (!registerData.email || !validateEmailFormat(registerData.email)) {
            tempErrors.email = "Une adresse email valide est requise.";
            isValid = false;
        }
        if (!registerData.telephoneClient || registerData.telephoneClient.trim() === "") {
            tempErrors.telephoneClient = "Le numéro de téléphone est requis.";
            isValid = false;
        } else if (!/\d+$/.test(registerData.telephoneClient) || registerData.telephoneClient.length > 10) {
            tempErrors.telephoneClient = "Numéro de téléphone invalide.";
            isValid = false;
        }

        setRegisterErrors(tempErrors);
        return isValid;
    };

    // Soumission connexion
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessageError(null)
        if (validateLogin()) {
            setLoading(true);
            const data = {
                email: loginData.emailUser,
                role: "ROLE_USER",
                password: loginData.passwordUser,
            };
            try {
                const response = await LoginVerifier(data);
                if (response.data) {
                    const infos = await login(loginData.emailUser, loginData.passwordUser);
                    if (infos.success) {
                        if (infos.user.roleUsers === "ROLE_USER") {
                            setMessage({
                                ouvre: true,
                                texte: "Connexion réussie.",
                                statut: "success",
                            });
                            setOpen(true);
                            console.log("Connexion avec:", loginData);
                            setIsLoginModalOpen(false);
                            setLoading(false);
                            setLoginData({ emailUser: "", passwordUser: "" });
                        }
                    } else {
                        setMessageError(infos.error || "Erreur de connexion.");
                        setMessage({
                            ouvre: true,
                            texte: infos.error || "Erreur de connexion.",
                            statut: "error",
                        });
                        setOpen(true);
                        console.log(infos.error);
                        setLoading(false);
                    }
                    setDonnes({});
                    setLoading(false);
                } else {
                    setMessageError(response.error);
                    setMessage({
                        ouvre: true,
                        texte: response.error || "Nous ne pouvons pas trouvé votre compte!",
                        statut: "error",
                    });
                    setOpen(true);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erreur de connexion:", error);
            }
        }
    };

    // Soumission inscription
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessageError(null)
        if (validateRegister()) {
            const NewUser = {
                nom: registerData.nomClient,
                prenom: registerData.prenomClient,
                telephone: registerData.telephoneClient,
                civilite: registerData.civiliteClient,
                dateNaissance: registerData.dateNaissance,
                email: registerData.email,
                password: registerData.password,
            };
            console.log("Nouvelle inscription: ", NewUser);
            setLoading(true);
            const dataVerifier = {
                email: NewUser.email,
                role: "ROLE_USER",
                password: NewUser.password,
            };
            setLoading(true);
            try {
                const response = await LoginVerifier(dataVerifier);
                if (!response.data) {
                    const enregistre = await register(NewUser);
                    if (enregistre.success) {
                        setMessage({
                            ouvre: true,
                            texte: "La création de votre Compte est réussie.",
                            statut: "success",
                        });
                        setRegisterData({
                            civiliteClient: "",
                            nomClient: "",
                            prenomClient: "",
                            email: "",
                            password: "",
                            telephoneClient: "",
                            dateNaissance: "",
                        });
                        setIsRegisterModalOpen(false);
                        setOpen(true);
                        setLoading(false);
                    } else {
                        setMessageError(enregistre.error || "Erreur de connexion.");
                        setMessage({
                            ouvre: true,
                            texte: enregistre.error || "Erreur de connexion.",
                            statut: "error",
                        });
                        setOpen(true);
                        console.log(enregistre.error);
                        setLoading(false);
                    }
                } else {
                    setMessageError("Votre email est utilisé par un autre compte");
                    setMessage({
                        ouvre: true,
                        texte: "Votre email est utilisé par un autre compte",
                        statut: "error",
                    });
                    setOpen(true);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erreur d'inscription:", error);
            }
        }
    };

    // Fonctions pour ouvrir/fermer les modals
    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setLoginErrors({});
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
        setLoginData({ emailUser: "", passwordUser: "" });
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setRegisterErrors({});
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
        setRegisterData({
            civiliteClient: "",
            nomClient: "",
            prenomClient: "",
            email: "",
            password: "",
            telephoneClient: "",
            dateNaissance: "",
        });
    };

    // Navigation entre modals
    const switchToRegister = () => {
        closeLoginModal();
        openRegisterModal();
    };

    const switchToLogin = () => {
        closeRegisterModal();
        openLoginModal();
    };

    useEffect(() => {
        if ((user && user.client) || (user && user.client)) {
            setNomUserConnecte(
                (user.client.nomClient + " " + user.client.prenomClient) || 
                (userProviseur.client.nomClient + " " + userProviseur.client.prenomClient)
            );
        } else {
            setNomUserConnecte("");
        }
    }, [user,userProviseur]);
    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };
    return (
        <nav className="fixed left-0 top-0 h-20 w-full md:h-16">
            <div className="z-100 relative bg-[#EDECF2] text-black shadow-md duration-200 dark:bg-[#0E121E] dark:text-white">
                <div>
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
                {/* Navbar Haut */}
                <div className="rounded-2xl bg-[#E1DFE7] px-10 py-2 shadow-sm shadow-gray-400 dark:bg-[#0E121E] dark:shadow-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Logo */}
                        <div className="w-1/2 md:w-auto">
                            <Link
                                to="/"
                                className="text-gradient-to-r flex gap-2 from-[#2563EB] to-[#313f58] text-2xl font-bold sm:text-3xl"
                            >
                                <img
                                    src={logoBleu}
                                    alt="Logo"
                                    className="w-10"
                                />
                                MaBeauté
                            </Link>
                        </div>

                        {/* search bar */}
                        <div className="flex w-full justify-start md:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Recherche..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="focus:border-1 w-[350px] rounded-full border border-gray-300 px-2 py-[5px] focus:border-[#2563EB] focus:outline-none dark:border-gray-500 dark:bg-[#161B2A]"
                                />
                                <IoMdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-gray-500 hover:text-[#2563EB]" />
                            </div>
                        </div>

                        {/* guide */}
                        <div className="flex items-center justify-between gap-2 max-md:hidden md:w-auto lg:gap-4">
                            {/* Panier */}
                            <button
                                onClick={() => setOpenPanier(true)}
                                className="flex items-center justify-end gap-3 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-[#161B2A]"
                            >
                                <span>Panier</span>
                                <Badge
                                    badgeContent={items.length}
                                    color="info"
                                >
                                    <FaCartShopping className="cursor-pointer text-xl dark:text-white" />
                                </Badge>
                            </button>

                            <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>

                            {/* Connexion / Profil */}
                            {(isAuthenticated && user?.roleUsers === "ROLE_USER") || (dejaConnecte && userProviseur.roleUsers === "ROLE_USER") ? (
                                <div className="dropdown dropdown-end">
                                    <label
                                        tabIndex={0}
                                        className="flex items-center justify-end gap-3 rounded-full px-4 py-1 text-white hover:bg-gray-300 dark:hover:bg-[#161B2A]"
                                    >
                                        <img
                                            src={"/public/image/user.png"}
                                            alt="avatar"
                                            className="h-6 w-6 flex-shrink-0 rounded-full"
                                        />
                                    </label>

                                    <ul
                                        tabIndex={0}
                                        className="menu dropdown-content rounded-box mt-2 w-40 bg-gray-300 p-2 text-black shadow dark:bg-gray-800 dark:text-white"
                                    >
                                        <li className="text-black hover:bg-gray-400 dark:text-white dark:hover:bg-gray-900">
                                            <Link to="/profile">
                                                <img
                                                    src={"/public/image/user.png"}
                                                    alt="avatar"
                                                    className="h-6 w-6 flex-shrink-0 rounded-full"
                                                />
                                                <span>{nomUserConncte}</span>
                                            </Link>
                                        </li>
                                        <li className="text-black hover:bg-gray-400 dark:text-white dark:hover:bg-gray-900">
                                            <button onClick={() => logout()}>Se déconnecter</button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={openLoginModal}
                                        className="flex items-center justify-end gap-3 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-[#161B2A]"
                                    >
                                        Se connecter
                                    </button>
                                </div>
                            )}

                            <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>

                            {/* Darkmode Switch */}
                            <div>
                                <DarkMode />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navbar Bas */}
                <div
                    data-aos="zoom-in"
                    className="items-center justify-center px-20 dark:bg-[#161B2A]"
                >
                    <div className="flex w-full items-center justify-end gap-2 py-3">
                        <div className="ml-4 flex items-center justify-between gap-8">
                            <button className="flex items-center justify-center gap-2 rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
                                <RiHome5Fill className="cursor-pointer" />
                                <Link to="/">Home</Link>
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
                                <MdOutlineStarRate className="cursor-pointer text-[#2563EB] dark:text-yellow-500" />
                                <Link to="/Produit">Nos Produits</Link>
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
                                <MdBookmarkBorder className="cursor-pointer" />
                                <Link to="/MesCommande">Mes Commandes</Link>
                            </button>
                        </div>
                    </div>
                </div>

                <Panier
                    open={ouvrePanier}
                    onclose={() => setOuvrePanier(false)}
                />
            </div>

            {/* Modal de Connexion */}
            <dialog
                id="login_modal"
                className={`modal ${isLoginModalOpen ? "modal-open" : ""}`}
            >
                <div className="modal-box bg-slate-200 dark:bg-gray-800">
                    <form method="dialog">
                        <button
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={closeLoginModal}
                        >
                            ✕
                        </button>
                    </form>

                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Connectez-vous à votre compte</h3>

                    <form onSubmit={handleLoginSubmit}>
                        <div className="mx-8 mb-5 flex flex-col items-center justify-center">
                            {messageError && (
                                <div className="flex w-full items-center justify-center">
                                    <Alert
                                        severity="error"
                                        className="w-full items-center justify-center bg-[#FDEDED] dark:bg-red-400 dark:bg-opacity-15 dark:text-white dark:text-opacity-100"
                                    >
                                        {messageError}
                                    </Alert>
                                </div>
                            )}
                            <InputValidate
                                IconComponent={MdOutlineEmail}
                                type="email"
                                largeur="full"
                                placeholder="Entrez votre Email..."
                                title="Email Utilisateur"
                                name="emailUser"
                                value={loginData.emailUser}
                                onChange={(val) => handleLoginChange({ target: { name: "emailUser", value: val } })}
                                error={!!loginErrors.emailUser}
                                helperText={loginErrors.emailUser}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                            <InputValidate
                                IconComponent={RiKeyFill}
                                type="password"
                                largeur="full"
                                placeholder="Entrez votre mot de passe..."
                                title="Mot de Passe"
                                name="passwordUser"
                                value={loginData.passwordUser}
                                onChange={(val) => handleLoginChange({ target: { name: "passwordUser", value: val } })}
                                error={!!loginErrors.passwordUser}
                                helperText={loginErrors.passwordUser}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                        </div>

                        <div className="mb-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Pas encore de compte ?{" "}
                                <button
                                    type="button"
                                    className="text-accent hover:underline"
                                    onClick={switchToRegister}
                                >
                                    Créer un compte
                                </button>
                            </p>
                        </div>

                        <div className="modal-action justify-center">
                            <button
                                type="submit"
                                className="btn btn-accent btn-outline btn-wide"
                            >
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <span className="loading loading-spinner text-accent"></span>
                                        <span>Connexion en cours...</span>
                                    </div>
                                ) : (
                                    "Se Connecter à mon compte"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Backdrop pour fermer le modal */}
                <form
                    method="dialog"
                    className="modal-backdrop"
                >
                    <button onClick={closeLoginModal}>Fermer</button>
                </form>
            </dialog>

            {/* Modal d'Inscription */}
            <dialog
                id="register_modal"
                className={`modal ${isRegisterModalOpen ? "modal-open" : ""}`}
            >
                <div className="modal-box max-w-2xl bg-slate-200 dark:bg-gray-800">
                    <form method="dialog">
                        <button
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={closeRegisterModal}
                        >
                            ✕
                        </button>
                    </form>

                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Créez votre compte</h3>

                    <form onSubmit={handleRegisterSubmit}>
                        <div className="mb-5 flex h-[400px] flex-col items-center justify-center overflow-y-auto px-4">
                            <div className="mt-4 w-2/3 items-start">
                                <FormControl error={!!registerErrors.civiliteClient}>
                                    <FormLabel
                                        id="choix-label"
                                        className="text-gray-600 dark:text-slate-300"
                                    >
                                        Civilité du Client
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="civiliteClient"
                                        value={registerData.civiliteClient || ""}
                                        className="gap-5 text-gray-600 dark:text-slate-300"
                                        onChange={handleRegisterChange}
                                    >
                                        <FormControlLabel
                                            value="Mr"
                                            control={<Radio />}
                                            label="Mr"
                                        />
                                        <FormControlLabel
                                            value="Mme"
                                            control={<Radio />}
                                            label="Mme"
                                        />
                                        <FormControlLabel
                                            value="Mlle"
                                            control={<Radio />}
                                            label="Mlle"
                                        />
                                    </RadioGroup>
                                    <FormHelperText>{registerErrors.civiliteClient}</FormHelperText>
                                </FormControl>
                            </div>

                            <InputValidate
                                IconComponent={FaUser}
                                type="text"
                                largeur="full"
                                placeholder="Votre nom..."
                                title="Nom"
                                name="nomClient"
                                value={registerData.nomClient}
                                onChange={(val) => handleRegisterChange({ target: { name: "nomClient", value: val } })}
                                error={!!registerErrors.nomClient}
                                helperText={registerErrors.nomClient}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                            <InputValidate
                                IconComponent={IoPerson}
                                type="text"
                                largeur="full"
                                placeholder="Votre prénom..."
                                title="Prénom"
                                name="prenomClient"
                                value={registerData.prenomClient}
                                onChange={(val) => handleRegisterChange({ target: { name: "prenomClient", value: val } })}
                                error={!!registerErrors.prenomClient}
                                helperText={registerErrors.prenomClient}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />

                            <InputValidate
                                IconComponent={FaPhone}
                                type="tel"
                                largeur="full"
                                placeholder="Votre numéro de téléphone..."
                                title="Téléphone"
                                name="telephoneClient"
                                value={registerData.telephoneClient}
                                onChange={(val) => handleRegisterChange({ target: { name: "telephoneClient", value: val } })}
                                error={!!registerErrors.telephoneClient}
                                helperText={registerErrors.telephoneClient}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />

                            <InputValidate
                                IconComponent={CalendarDateRangeIcon}
                                type="date"
                                largeur="full"
                                placeholder="Entrez votre date de naissance..."
                                title="Date de naissance"
                                value={registerData.dateNaissance || ""}
                                onChange={(val) => handleRegisterChange({ target: { name: "dateNaissance", value: val } })}
                                error={!!registerErrors.dateNaissance}
                                helperText={registerErrors.dateNaissance}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                            <InputValidate
                                IconComponent={MdOutlineEmail}
                                type="email"
                                largeur="full"
                                placeholder="Entrez votre Email..."
                                title="Email"
                                name="email"
                                value={registerData.email}
                                onChange={(val) => handleRegisterChange({ target: { name: "email", value: val } })}
                                error={!!registerErrors.email}
                                helperText={registerErrors.email}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />

                            <InputValidate
                                IconComponent={RiKeyFill}
                                type="password"
                                largeur="full"
                                placeholder="Créez votre mot de passe..."
                                title="Mot de Passe"
                                name="password"
                                value={registerData.password}
                                onChange={(val) => handleRegisterChange({ target: { name: "password", value: val } })}
                                error={!!registerErrors.password}
                                helperText={registerErrors.password}
                                ClassIcone="text-accent"
                                margY="my-2"
                            />
                        </div>

                        <div className="mb-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Déjà un compte ?{" "}
                                <button
                                    type="button"
                                    className="text-accent hover:underline"
                                    onClick={switchToLogin}
                                >
                                    Se connecter
                                </button>
                            </p>
                        </div>

                        <div className="modal-action justify-center">
                            <button
                                type="submit"
                                className="btn btn-accent btn-outline btn-wide"
                            >
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <span className="loading loading-spinner text-accent"></span>
                                        <span>Connexion en cours...</span>
                                    </div>
                                ) : (
                                    "S'inscrire à nouveau compte"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Backdrop pour fermer le modal */}
                <form
                    method="dialog"
                    className="modal-backdrop"
                >
                    <button onClick={closeRegisterModal}>close</button>
                </form>
            </dialog>
        </nav>
    );
};

export default Navbar;

// import React, { useEffect, useState } from "react";

// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import Logo from "../../image/Logo.png";
// import logoBleu from "@/image/logoBleu.png";
// import { IoMdSearch } from "react-icons/io";
// import { FaCartShopping } from "react-icons/fa6";
// import DarkMode from "./DarkMode";
// import { Link } from "react-router-dom";
// import { useNavbar } from "../context/NavbarContext";
// import { MdOutlineStarRate } from "react-icons/md";
// import Panier from "../Pages/Commande/Panier";
// import { RiHome5Fill } from "react-icons/ri";
// import { MdBookmarkBorder } from "react-icons/md";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import { Avatar, FormHelperText, Stack } from "@mui/material";
// import Badge from "@mui/material/Badge";
// import { usePanier } from "../context/PanierContext";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { InputValidate } from "@/components/InputValidate"; // Import de votre composant
// import { MdOutlineEmail } from "react-icons/md";
// import { RiKeyFill } from "react-icons/ri";
// import { FaUser, FaPhone, FaBirthdayCake } from "react-icons/fa";
// import { IoPerson } from "react-icons/io5";

// const Navbar = () => {
//     const { user, logout, isAuthenticated } = useAuthContext();
//     const [ouvrePanier, setOuvrePanier] = useState(false);
//     const { items } = usePanier();
//     const [nomUserConncte, setNomUserConnecte] = useState("");
//     const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//     const [activeTab, setActiveTab] = useState("connexion"); // "connexion" ou "inscription"

//     // États pour la connexion
//     const [loginData, setLoginData] = useState({
//         emailUser: "",
//         passwordUser: "",
//     });
//     const [loginErrors, setLoginErrors] = useState({});

//     // États pour l'inscription
//     const [registerData, setRegisterData] = useState({
//         civiliteClient: "",
//         nomClient: "",
//         prenomClient: "",
//         email: "",
//         password: "",
//         telephoneClient: "",
//         dateNaissance: "",
//     });
//     const [registerErrors, setRegisterErrors] = useState({});

//     const { searchTerm, setSearchTerm, setOpenPanier } = useNavbar();

//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     // Gestion des changements pour la connexion
//     const handleLoginChange = (e) => {
//         const { name, value } = e.target;
//         setLoginData((prevData) => ({ ...prevData, [name]: value }));
//         setLoginErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     };

//     // Gestion des changements pour l'inscription
//     const handleRegisterChange = (e) => {
//         const { name, value } = e.target;
//         setRegisterData((prevData) => ({ ...prevData, [name]: value }));
//         setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     };

//     // Validation email
//     const validateEmailFormat = (email) => {
//         return /\S+@\S+\.\S+/.test(email);
//     };

//     // Validation connexion
//     const validateLogin = () => {
//         let tempErrors = {};
//         let isValid = true;

//         if (!loginData.passwordUser || loginData.passwordUser.trim() === "") {
//             tempErrors.passwordUser = "Le mot de passe est requis.";
//             isValid = false;
//         }
//         if (!loginData.emailUser || !validateEmailFormat(loginData.emailUser)) {
//             tempErrors.emailUser = "Une adresse email valide est requise.";
//             isValid = false;
//         }

//         setLoginErrors(tempErrors);
//         return isValid;
//     };

//     // Validation inscription
//     const validateRegister = () => {
//         let tempErrors = {};
//         let isValid = true;

//         if (!registerData.civiliteClient) {
//             tempErrors.civiliteClient = "La civilité est requise.";
//             isValid = false;
//         }
//         if (!registerData.dateNaissance) {
//             tempErrors.dateNaissance = "Veuillez choisir votre date de naissance";
//             isValid = false;
//         }
//         if (!registerData.nomClient || registerData.nomClient.trim() === "") {
//             tempErrors.nomClient = "Le nom est requis.";
//             isValid = false;
//         }
//         if (!registerData.prenomClient || registerData.prenomClient.trim() === "") {
//             tempErrors.prenomClient = "Le prénom est requis.";
//             isValid = false;
//         }
//         if (!registerData.password || registerData.password.trim() === "") {
//             tempErrors.password = "Le mot de passe est requis.";
//             isValid = false;
//         }
//         if (!registerData.email || !validateEmailFormat(registerData.email)) {
//             tempErrors.email = "Une adresse email valide est requise.";
//             isValid = false;
//         }
//         if (!registerData.telephoneClient || registerData.telephoneClient.trim() === "") {
//             tempErrors.telephoneClient = "Le numéro de téléphone est requis.";
//             isValid = false;
//         } else if (!/\d+$/.test(registerData.telephoneClient) || registerData.telephoneClient.length > 10) {
//             tempErrors.telephoneClient = "Numéro de téléphone invalide.";
//             isValid = false;
//         }

//         setRegisterErrors(tempErrors);
//         return isValid;
//     };

//     // Soumission connexion
//     const handleLoginSubmit = async (e) => {
//         e.preventDefault();
//         if (validateLogin()) {
//             try {
//                 // Appel à votre API de connexion
//                 console.log("Connexion avec:", loginData);
//                 // await login(loginData.emailUser, loginData.passwordUser);
//                 setIsLoginModalOpen(false);
//                 // Réinitialiser les données
//                 setLoginData({ emailUser: "", passwordUser: "" });
//             } catch (error) {
//                 console.error("Erreur de connexion:", error);
//             }
//         }
//     };

//     // Soumission inscription
//     const handleRegisterSubmit = async (e) => {
//         e.preventDefault();
//         if (validateRegister()) {
//             try {
//                 // Appel à votre API d'inscription
//                 console.log("Inscription avec:", registerData);
//                 // await register(registerData);
//                 setIsLoginModalOpen(false);
//                 // Réinitialiser les données
//                 setRegisterData({
//                     civiliteClient: "",
//                     nomClient: "",
//                     prenomClient: "",
//                     email: "",
//                     password: "",
//                     telephoneClient: "",
//                     dateNaissance: "",
//                 });
//             } catch (error) {
//                 console.error("Erreur d'inscription:", error);
//             }
//         }
//     };

//     // Réinitialiser les formulaires quand le modal s'ouvre/ferme
//     const handleModalToggle = (open) => {
//         setIsLoginModalOpen(open);
//         if (!open) {
//             setActiveTab("connexion");
//             setLoginErrors({});
//             setRegisterErrors({});
//         }
//     };

//     useEffect(() => {
//         if (user && user.client) {
//             setNomUserConnecte(user.client.nomClient + " " + user.client.prenomClient);
//         } else {
//             setNomUserConnecte("");
//         }
//     }, [user]);

//     return (
//         <nav className="fixed left-0 top-0 h-20 w-full md:h-16">
//             <div className="z-100 relative bg-[#EDECF2] text-black shadow-md duration-200 dark:bg-[#0E121E] dark:text-white">
//                 {/* Navbar Haut */}
//                 <div className="rounded-2xl bg-[#E1DFE7] px-10 py-2 shadow-sm shadow-gray-400 dark:bg-[#0E121E] dark:shadow-white/10">
//                     <div className="flex flex-wrap items-center justify-between gap-2">
//                         {/* Logo */}
//                         <div className="w-1/2 md:w-auto">
//                             <Link
//                                 to="/"
//                                 className="text-gradient-to-r flex gap-2 from-[#2563EB] to-[#313f58] text-2xl font-bold sm:text-3xl"
//                             >
//                                 <img
//                                     src={logoBleu}
//                                     alt="Logo"
//                                     className="w-10"
//                                 />
//                                 MaBeauté
//                             </Link>
//                         </div>

//                         {/* search bar */}
//                         <div className="flex w-full justify-start md:w-auto">
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     placeholder="Recherche..."
//                                     value={searchTerm}
//                                     onChange={handleSearchChange}
//                                     className="focus:border-1 w-[350px] rounded-full border border-gray-300 px-2 py-[5px] focus:border-[#2563EB] focus:outline-none dark:border-gray-500 dark:bg-[#161B2A]"
//                                 />
//                                 <IoMdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-gray-500 hover:text-[#2563EB]" />
//                             </div>
//                         </div>

//                         {/* guide */}
//                         <div className="flex items-center justify-between gap-2 max-md:hidden md:w-auto lg:gap-4">
//                             {/* Panier */}
//                             <button
//                                 onClick={() => setOpenPanier(true)}
//                                 className="flex items-center justify-end gap-3 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-[#161B2A]"
//                             >
//                                 <span>Panier</span>
//                                 <Badge
//                                     badgeContent={items.length}
//                                     color="info"
//                                 >
//                                     <FaCartShopping className="cursor-pointer text-xl dark:text-white" />
//                                 </Badge>
//                             </button>

//                             <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>

//                             {/* Connexion / Profil */}
//                             {isAuthenticated && user?.roleUsers === "ROLE_USER" ? (
//                                 <div className="dropdown dropdown-end">
//                                     <label
//                                         tabIndex={0}
//                                         className="flex items-center justify-end gap-3 rounded-full px-4 py-1 text-white hover:bg-gray-300 dark:hover:bg-[#161B2A]"
//                                     >
//                                         <img
//                                             src={"/public/image/user.png"}
//                                             alt="avatar"
//                                             className="h-6 w-6 flex-shrink-0 rounded-full"
//                                         />
//                                     </label>

//                                     <ul
//                                         tabIndex={0}
//                                         className="menu dropdown-content rounded-box mt-2 w-40 bg-gray-300 p-2 text-black shadow dark:bg-gray-800 dark:text-white"
//                                     >
//                                         <li className="text-black hover:bg-gray-400 dark:text-white dark:hover:bg-gray-900">
//                                             <Link to="/profile">
//                                                 <img
//                                                     src={"/public/image/user.png"}
//                                                     alt="avatar"
//                                                     className="h-6 w-6 flex-shrink-0 rounded-full"
//                                                 />
//                                                 <span>{nomUserConncte}</span>
//                                             </Link>
//                                         </li>
//                                         <li className="text-black hover:bg-gray-400 dark:text-white dark:hover:bg-gray-900">
//                                             <button onClick={() => logout()}>Se déconnecter</button>
//                                         </li>
//                                     </ul>
//                                 </div>
//                             ) : (
//                                 <button
//                                     onClick={() => handleModalToggle(true)}
//                                     className="flex items-center justify-end gap-3 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-[#161B2A]"
//                                 >
//                                     Se connecter
//                                 </button>
//                             )}

//                             <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>

//                             {/* Darkmode Switch */}
//                             <div>
//                                 <DarkMode />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Navbar Bas */}
//                 <div
//                     data-aos="zoom-in"
//                     className="items-center justify-center px-20 dark:bg-[#161B2A]"
//                 >
//                     <div className="flex w-full items-center justify-end gap-2 py-3">
//                         <div className="ml-4 flex items-center justify-between gap-8">
//                             <button className="flex items-center justify-center gap-2 rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
//                                 <RiHome5Fill className="cursor-pointer" />
//                                 <Link to="/">Home</Link>
//                             </button>
//                             <button className="flex items-center justify-center gap-2 rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
//                                 <MdOutlineStarRate className="cursor-pointer text-[#2563EB] dark:text-yellow-500" />
//                                 <Link to="/Produit">Nos Produits</Link>
//                             </button>
//                             <button className="flex items-center justify-center gap-2 rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
//                                 <MdBookmarkBorder className="cursor-pointer" />
//                                 <Link to="/MesCommande">Mes Commandes</Link>
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <Panier
//                     open={ouvrePanier}
//                     onclose={() => setOuvrePanier(false)}
//                 />
//             </div>

//             {/* Modal de connexion/inscription DaisyUI */}
//             <dialog
//                 id="login_modal"
//                 className={`modal ${isLoginModalOpen ? "modal-open" : ""}`}
//             >
//                 <div className="modal-box  bg-white dark:bg-gray-800">
//                     <form method="dialog">
//                         <button
//                             className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
//                             onClick={() => handleModalToggle(false)}
//                         >
//                             ✕
//                         </button>
//                     </form>

//                     {/* Tabs pour Connexion/Inscription */}
//                     <div className="tabs-boxed tabs mb-6 justify-center bg-transparent">
//                         <button
//                             className={`tab tab-lg ${activeTab === "connexion" ? "tab-active" : ""}`}
//                             onClick={() => setActiveTab("connexion")}
//                         >
//                             Connexion
//                         </button>
//                         <button
//                             className={`tab tab-lg ${activeTab === "inscription" ? "tab-active" : ""}`}
//                             onClick={() => setActiveTab("inscription")}
//                         >
//                             Inscription
//                         </button>
//                     </div>

//                     {/* Formulaire de Connexion */}
//                     {activeTab === "connexion" && (
//                         <div>
//                             <h3 className="mb-4 text-center text-lg font-bold text-gray-900 dark:text-white">Connectez-vous à votre compte</h3>

//                             <form onSubmit={handleLoginSubmit}>
//                                 <div className="mb-5 flex flex-col items-center justify-center">
//                                     <InputValidate
//                                         IconComponent={MdOutlineEmail}
//                                         type="email"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre Email..."
//                                         title="Email Utilisateur"
//                                         name="emailUser"
//                                         value={loginData.emailUser}
//                                         onChange={(val) => handleLoginChange({ target: { name: "emailUser", value: val } })}
//                                         error={!!loginErrors.emailUser}
//                                         helperText={loginErrors.emailUser}
//                                         ClassIcone="text-accent"
//                                         margY="my-4"
//                                     />
//                                     <InputValidate
//                                         IconComponent={RiKeyFill}
//                                         type="password"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre mot de passe..."
//                                         title="Mot de Passe"
//                                         name="passwordUser"
//                                         value={loginData.passwordUser}
//                                         onChange={(val) => handleLoginChange({ target: { name: "passwordUser", value: val } })}
//                                         error={!!loginErrors.passwordUser}
//                                         helperText={loginErrors.passwordUser}
//                                         ClassIcone="text-accent"
//                                         margY="my-4"
//                                     />
//                                 </div>

//                                 <div className="modal-action justify-center">
//                                     <button
//                                         type="submit"
//                                         className="btn btn-primary"
//                                     >
//                                         Se connecter
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     )}

//                     {/* Formulaire d'Inscription */}
//                     {activeTab === "inscription" && (
//                         <div>
//                             <h3 className="mb-4 text-center text-lg font-bold text-gray-900 dark:text-white">Créez votre compte</h3>

//                             <form onSubmit={handleRegisterSubmit}>
//                                 <div className="mb-5 flex  flex-col items-center justify-center ">

//                                     <div className="mt-4 w-2/3 items-start">
//                                         <FormControl error={!!registerErrors.civiliteClient}>
//                                             <FormLabel
//                                                 id="choix-label"
//                                                 className="text-gray-600 dark:text-slate-300"
//                                             >
//                                                 Civilité du Client
//                                             </FormLabel>
//                                             <RadioGroup
//                                                 row
//                                                 aria-labelledby="demo-row-radio-buttons-group-label"
//                                                 name="civiliteClient"
//                                                 value={registerData.civiliteClient || ""}
//                                                 className="gap-5 text-gray-600 dark:text-slate-300"
//                                                 onChange={handleRegisterChange}
//                                             >
//                                                 <FormControlLabel
//                                                     value="Mr"
//                                                     control={<Radio />}
//                                                     label="Mr"
//                                                 />
//                                                 <FormControlLabel
//                                                     value="Mme"
//                                                     control={<Radio />}
//                                                     label="Mme"
//                                                 />
//                                                 <FormControlLabel
//                                                     value="Mlle"
//                                                     control={<Radio />}
//                                                     label="Mlle"
//                                                 />
//                                             </RadioGroup>
//                                             <FormHelperText>{registerErrors.civiliteClient}</FormHelperText>
//                                         </FormControl>
//                                     </div>
//                                     <div className="flex w-full gap-4 justify-center items-center">
//                                     <InputValidate
//                                         IconComponent={FaUser}
//                                         type="text"
//                                         largeur="full"
//                                         placeholder="Votre nom..."
//                                         title="Nom"
//                                         name="nomClient"
//                                         value={registerData.nomClient}
//                                         onChange={(val) => handleRegisterChange({ target: { name: "nomClient", value: val } })}
//                                         error={!!registerErrors.nomClient}
//                                         helperText={registerErrors.nomClient}
//                                         ClassIcone="text-accent"
//                                         margY="my-2"
//                                     />
//                                     <InputValidate
//                                         IconComponent={IoPerson}
//                                         type="text"
//                                         largeur="full"
//                                         placeholder="Votre prénom..."
//                                         title="Prénom"
//                                         name="prenomClient"
//                                         value={registerData.prenomClient}
//                                         onChange={(val) => handleRegisterChange({ target: { name: "prenomClient", value: val } })}
//                                         error={!!registerErrors.prenomClient}
//                                         helperText={registerErrors.prenomClient}
//                                         ClassIcone="text-accent"
//                                         margY="my-2"
//                                     />
//                                     </div>

//                                     {/* Email */}
//                                     <InputValidate
//                                         IconComponent={MdOutlineEmail}
//                                         type="email"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre Email..."
//                                         title="Email"
//                                         name="email"
//                                         value={registerData.email}
//                                         onChange={(val) => handleRegisterChange({ target: { name: "email", value: val } })}
//                                         error={!!registerErrors.email}
//                                         helperText={registerErrors.email}
//                                         ClassIcone="text-accent"
//                                         margY="my-2"
//                                     />

//                                     {/* Mot de passe */}
//                                     <InputValidate
//                                         IconComponent={RiKeyFill}
//                                         type="password"
//                                         largeur="2/3"
//                                         placeholder="Créez votre mot de passe..."
//                                         title="Mot de Passe"
//                                         name="password"
//                                         value={registerData.password}
//                                         onChange={(val) => handleRegisterChange({ target: { name: "password", value: val } })}
//                                         error={!!registerErrors.password}
//                                         helperText={registerErrors.password}
//                                         ClassIcone="text-accent"
//                                         margY="my-2"
//                                     />

//                                     {/* Téléphone */}
//                                     <InputValidate
//                                         IconComponent={FaPhone}
//                                         type="tel"
//                                         largeur="2/3"
//                                         placeholder="Votre numéro de téléphone..."
//                                         title="Téléphone"
//                                         name="telephoneClient"
//                                         value={registerData.telephoneClient}
//                                         onChange={(val) => handleRegisterChange({ target: { name: "telephoneClient", value: val } })}
//                                         error={!!registerErrors.telephoneClient}
//                                         helperText={registerErrors.telephoneClient}
//                                         ClassIcone="text-accent"
//                                         margY="my-2"
//                                     />
//                                  <InputValidate
//                                     IconComponent={CalendarDateRangeIcon}
//                                     type="date"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre date de naissance..."
//                                     title="Date de naissance"
//                                     value={registerData.dateNaissance || ""}
//                                     onChange={(val) => handleRegisterChange({ target: { name: "dateNaissance", value: val } })}
//                                     error={!!registerErrors.dateNaissance}
//                                     helperText={registerErrors.dateNaissance}
//                                     ClassIcone="text-accent"
//                                     margY="mt-4 mb-8"
//                                 />
//                                     {/* Date de naissance
//                                     <div className="mb-4 w-2/3">
//                                         <label className="label">
//                                             <span className="label-text flex items-center gap-2 text-gray-700 dark:text-gray-300">
//                                                 <FaBirthdayCake className="text-accent" />
//                                                 Date de naissance
//                                             </span>
//                                         </label>
//                                         <input
//                                             type="date"
//                                             name="dateNaissance"
//                                             value={registerData.dateNaissance}
//                                             onChange={handleRegisterChange}
//                                             className={`input input-bordered w-full bg-white text-gray-900 dark:bg-gray-700 dark:text-white ${
//                                                 registerErrors.dateNaissance ? "input-error" : ""
//                                             }`}
//                                         />
//                                         {registerErrors.dateNaissance && <p className="mt-1 text-sm text-error">{registerErrors.dateNaissance}</p>}
//                                     </div> */}
//                                 </div>

//                                 <div className="modal-action justify-center">
//                                     <button
//                                         type="submit"
//                                         className="btn btn-primary"
//                                     >
//                                         S'inscrire
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     )}
//                 </div>

//                 {/* Backdrop pour fermer le modal */}
//                 <form
//                     method="dialog"
//                     className="modal-backdrop"
//                 >
//                     <button onClick={() => handleModalToggle(false)}>close</button>
//                 </form>
//             </dialog>
//         </nav>
//     );
// };

// export default Navbar;

// import React, { useEffect ,useState} from "react";
// import Logo from "../../image/Logo.png";
// import  logoBleu from "@/image/logoBleu.png"
// import { IoMdSearch } from "react-icons/io";
// import { FaCartShopping } from "react-icons/fa6";
// import DarkMode from "./DarkMode";
// import { Link, Navigate } from "react-router-dom";
// import { useNavbar } from "../context/NavbarContext";
// import { useAuth } from '../../hook/useAuth';
// // import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
// // import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
// import { MdOutlineStarRate } from "react-icons/md";
// import Panier from "../Pages/Commande/Panier"
// import { RiHome5Fill } from "react-icons/ri";
// import { MdBookmarkBorder } from "react-icons/md";
// import Badge from '@mui/material/Badge';
// import { usePanier } from "../context/PanierContext";
// import { useUsers } from "../context/UserContext";
// import { useAuthContext } from '@/contexts/AuthContext';

// const Navbar = () => {
//   //  const { client} = useUsers();
//   const { user, logout, isAuthenticated} = useAuthContext();
//   const [ouvrePanier,setouvrePanier] = useState(false);
//   const {items} = usePanier();
//   const [nomUserConncte, setNomUserConnecte] = useState('')
//   const { searchTerm, setSearchTerm, filterValue, setFilterValue,openPanier ,setOpenPanier,setNouveauteBtn} = useNavbar();

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   console.log("NAVBAR ETAT: \n \t isAuthenticated :",isAuthenticated , "\n \t user :",user)

//     useEffect(() => {
//       if (user && user.client) {
//           setNomUserConnecte(user.client.nomClient + ' ' + user.client.prenomClient);
//       } else {
//           setNomUserConnecte('');
//       }
//   }, [user]);

//   useEffect(() => {

//     if (user && user.client) {
//         setNomUserConnecte(user.client.nomClient + ' ' + user.client.prenomClient);
//     } else {
//         setNomUserConnecte('');
//     }
// }, [user]);

//   return (
//     <nav className="fixed top-0 left-0 w-full h-20 md:h-16">
//     <div className="shadow-md bg-[#EDECF2] dark:bg-[#0E121E] text-black dark:text-white duration-200 relative z-100">
//       {/* Navbar Haut */}
//       <div className="px-10 py-2 bg-[#E1DFE7] dark:bg-[#0E121E]  rounded-2xl shadow-sm shadow-gray-400 dark:shadow-white/10">

//         <div className=" flex flex-wrap justify-between items-center gap-2">
//         {/* Logo */}
//           <div className="w-1/2 md:w-auto">
//             <Link to="/" className="font-bold text-gradient-to-r from-[#2563EB] to-[#313f58] text-2xl sm:text-3xl flex gap-2">
//               <img src={logoBleu} alt="Logo" className="w-10" />
//               MaBeauté
//             </Link>
//           </div>
//           {/* search bar */}
//           <div className="w-full flex justify-start md:w-auto ">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Recherche..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 className="
//                  w-[350px]
//                  rounded-full
//                  border border-gray-300 px-2 py-[5px]
//                  focus:outline-none focus:border-1 focus:border-[#2563EB]
//                  dark:border-gray-500 dark:bg-[#161B2A]  "
//             />
//               {/* sm:group-hover:w-[160px] */}
//               <IoMdSearch className="text-gray-500 text-2xl hover:text-[#2563EB] absolute top-1/2 -translate-y-1/2 right-3" />
//             </div>
//           </div>

//           {/* guide */}
//           <div className="flex justify-between md:w-auto items-center gap-2 max-md:hidden lg:gap-4">
//               {/*  Panier */}
//               <button
//                 onClick={() => setOpenPanier(true)}
//                 className="
//                 hover:bg-gray-300
//                 dark:hover:bg-[#161B2A]

//                 rounded-full py-1 px-4
//                 flex justify-end items-center gap-3"
//               >
//                 <span >
//                   Panier
//                 </span>
//                 <Badge badgeContent={items.length} color="info">
//                   <FaCartShopping
//                     className="
//                   text-xl dark:text-white
//                   cursor-pointer"
//                   />
//                 </Badge>

//               </button>

//               <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>

//               {/* se connecter   || (user && user.roleUsers === "ROLE_USER")  */}
//               {(user && user.roleUsers === "ROLE_USER")? (
//                 // Utilisateur connecté
//                 <div className="dropdown dropdown-end">
//                 <label
//                   tabIndex={0}
//                   className="
//                   hover:bg-gray-300
//                   dark:hover:bg-[#161B2A]
//                     rounded-full text-white  py-1 px-4
//                     flex justify-end items-center gap-3"
//                 >
//                   <img
//                     src={"/public/image/user.png"}
//                     alt="avatar"
//                     className="w-6 h-6 rounded-full flex-shrink-0"
//                   />
//                 </label>

//                 {/* Liste déroulante */}
//                 <ul
//                   tabIndex={0}
//                   className="

//                   bg-gray-300 dark:bg-gray-800
//                   text-black dark:text-white
//                   dropdown-content menu p-2 shadow
//                   rounded-box w-40 mt-2"
//                 >
//                   <li className=" text-black  dark:text-white dark:hover:bg-gray-900 hover:bg-gray-400">
//                     <Link to="/profile" >

//                       {/* Avatar à droite */}
//                       <img
//                         src={"/public/image/user.png"}
//                         alt="avatar"
//                         className="w-6 h-6 rounded-full flex-shrink-0"
//                       />
//                        <span

//                       >
//                        {user.client.nomClient + " " + user.client.prenomClient}
//                       </span>

//                     </Link>
//                   </li>
//                   <li className="text-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-400">
//                     <button onClick={() => logout() }>Se déconnecter</button>
//                   </li>
//                 </ul>
//               </div>
//               ) : (
//                 // Remplacer ce Link en bouton qui affiche un modal pour l'inscription/connexion
//                 <Link
//                 to="/Inscription"
//                 className="
//                  hover:bg-gray-300
//                 dark:hover:bg-[#161B2A]

//                 rounded-full py-1 px-4
//                 flex justify-end items-center gap-3"
//                 >
//                   Se connecter
//                 </Link>
//               )}

//                 <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>

//               {/* Darkmode Switch */}
//               <div>
//                 <DarkMode />
//               </div>
//           </div>
//         </div>
//       </div>

//       {/*  Navbar BAs  */}
//       <div data-aos="zoom-in" className="justify-center items-center px-20 dark:bg-[#161B2A]">
//         <div className="flex w-full justify-end items-center py-3 gap-2 " >
//           <div className="flex justify-between items-center ml-4  gap-8">
//             <button
//              className=" flex justify-center gap-2 items-center rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
//               <RiHome5Fill className="cursor-pointer" />
//               <Link to="/">Home</Link>
//             </button>
//             <button
//              className=" flex justify-center gap-2 items-center rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
//               <MdOutlineStarRate className="cursor-pointer text-[#2563EB] dark:text-yellow-500" />
//               <Link to="/Produit">Nos Produits</Link>
//             </button>
//             <button
//              className=" flex justify-center gap-2 items-center rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
//               <MdBookmarkBorder className="cursor-pointer"/>
//               <Link to="/MesCommande">Mes Commandes</Link>
//             </button>
//           </div>
//         </div>

//       </div>
//       <Panier open={ouvrePanier} onclose={() => setouvrePanier(false)}/>
//     </div>
//     </nav>
//   );
// };

// export default Navbar;

// // <div className="flex justify-center items-center gap-2">
// // <span className="font-bold">Catégorie</span>

// // <Combobox value={selected} onChange={setSelected} className="relative w-56">
// //   <div className="relative">
// //     <ComboboxInput
// //       className="w-full
// //                 sm:w-[2/3]
// //                 md:w-[1/2]
// //                  h-8 rounded-md border border-gray-300 bg-white text-gray-900
// //                 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200
// //                 pl-3 pr-8 text-sm focus:outline-none"
// //       displayValue={(person) => person?.name}
// //       onChange={(event) => setQuery(event.target.value)}
// //     />
// //     <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
// //       <ChevronDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
// //     </ComboboxButton>

// //     <ComboboxOptions
// //       className="absolute z-10 mt-1 w-full max-h-60 overflow-auto
// //                 rounded-md bg-white text-gray-900 shadow-lg
// //                 dark:bg-gray-800 dark:text-gray-200"
// //     >
// //       {filteredPeople.map((person) => (
// //         <ComboboxOption
// //           key={person.id}
// //           value={person}
// //           className="relative cursor-pointer select-none py-2 pl-3 pr-9
// //                     hover:bg-gray-100 dark:hover:bg-gray-700"
// //         >
// //           {({ selected }) => (
// //             <>
// //               <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
// //                 {person.name}
// //               </span>
// //               {selected && (
// //                 <CheckIcon className="absolute inset-y-0 right-0 h-5 w-5 mr-3 text-[#2563EB]" />
// //               )}
// //             </>
// //           )}
// //         </ComboboxOption>
// //       ))}
// //     </ComboboxOptions>
// //   </div>
// // </Combobox>
// // </div>
