import React, { useEffect, useState } from "react";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import logoBleu from "@/image/logoBleu.png";
import { MdInfoOutline, MdOutlineEmail, MdOutlineStarRate, MdBookmarkBorder } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping, FaUser, FaPhone, FaQuestion } from "react-icons/fa6";
import DarkMode from "./DarkMode";
import { LoginVerifier, RegistreVerifier } from "@/services/ClientService";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNavbar } from "../context/NavbarContext";
import Panier from "../Pages/Commande/Panier";
import { RiHome5Fill, RiKeyFill } from "react-icons/ri";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { FormHelperText } from "@mui/material";
import Badge from "@mui/material/Badge";
import { usePanier } from "../context/PanierContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { InputValidate } from "@/components/InputValidate";
import { IoPerson } from "react-icons/io5";
import { useAuthModal } from "@/Client/context/AuthModalContext";

const Navbar = () => {
    const { 
        isLoginModalOpen, 
        isRegisterModalOpen,
        closeLoginModal,
        closeRegisterModal,
        switchToRegister,
        switchToLogin,
        openLoginModal
    } = useAuthModal();
    
    const { user, login, logout, isAuthenticated, register } = useAuthContext();
    const [ouvrePanier, setOuvrePanier] = useState(false);
    const [messageError, setMessageError] = useState(null);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const { items } = usePanier();
    const [loading, setLoading] = useState(false);
    const [nomUserConncte, setNomUserConnecte] = useState("");
    const [dejaConnecte, setDejaConnecte] = useState(false);
    const [registerErrors, setRegisterErrors] = useState({});
    const { searchTerm, setSearchTerm, setOpenPanier } = useNavbar();
    const [userProviseur, setUserProviseur] = useState(null);
    const location = useLocation();
    const currentPath = location.pathname;
    
    // États pour les animations
    const [prevItemsLength, setPrevItemsLength] = useState(0);
    const [cartAnimation, setCartAnimation] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Animation du panier quand items.length change
    useEffect(() => {
        if (items.length > prevItemsLength) {
            setCartAnimation(true);
            setTimeout(() => setCartAnimation(false), 600);
        }
        setPrevItemsLength(items.length);
    }, [items.length]);

    // Effet de scroll pour la navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (currentPath !== "/Produit"){
            navigate("/Produit")
        }
    }, [searchTerm]);

    useEffect(() => {
        const chargementUser = () => {
            const local = localStorage.getItem('user');
            if (local) {
                const parsedUser = JSON.parse(local);
                if (parsedUser && parsedUser.client) {
                    setDejaConnecte(true);
                    setUserProviseur(parsedUser);
                }
            }
        };
        chargementUser();
    }, []);

    useEffect(() => {
        if ((user && user.client) || (userProviseur && userProviseur.client)) {
            setNomUserConnecte(
                (user?.client?.nomClient + " " + user?.client?.prenomClient) || 
                (userProviseur?.client?.nomClient + " " + userProviseur?.client?.prenomClient)
            );
        } else {
            setNomUserConnecte("");
        }
    }, [user, userProviseur]);
    
    const [loginData, setLoginData] = useState({
        emailUser: "",
        passwordUser: "",
    });
    const [loginErrors, setLoginErrors] = useState({});

    const [registerData, setRegisterData] = useState({
        civiliteClient: "",
        nomClient: "",
        prenomClient: "",
        email: "",
        password: "",
        telephoneClient: "",
        dateNaissance: "",
    });

    const seDeconnecter = () => {
        logout();
        setDejaConnecte(false);
        setUserProviseur(null);
        navigate('/');
    };

    const getProfileImage = () => {
        const civilite = user?.client?.civiliteClient || userProviseur?.client?.civiliteClient || '';
        const defaultImage = "/image/image.png";
        
        switch(civilite.toLowerCase()) {
            case 'mr':
            case 'monsieur':
            case 'm.':
                return "/image/Mr.png";
            case 'mme':
            case 'madame':
            case 'mrs':
                return "/image/Mme.png";
            case 'mlle':
            case 'mademoiselle':
            case 'miss':
                return "/image/Mlle.png";
            default:
                return defaultImage;
        }
    };
    const profileImage = getProfileImage();
  
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prevData) => ({ ...prevData, [name]: value }));
        setLoginErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData((prevData) => ({ ...prevData, [name]: value }));
        setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const validateEmailFormat = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

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

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessageError(null);
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
                            closeLoginModal();
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
                    }
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
                setLoading(false);
            }
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessageError(null);
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
            setLoading(true);
            const dataVerifier = {
                email: NewUser.email,
                role: "ROLE_USER",
                password: NewUser.password,
            };
            try {
                const response = await RegistreVerifier(dataVerifier);
                if (response.data) {
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
                        closeRegisterModal();
                        setOpen(true);
                    } else {
                        setMessageError(enregistre.error);
                        setMessage({
                            ouvre: true,
                            texte: enregistre.error || "Erreur de connexion.",
                            statut: "error",
                        });
                        setOpen(true);
                    }
                } else {
                    setMessageError("Votre email est déjà utilisé par un autre compte");
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
                setLoading(false);
            }
        }
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    return (
        <>
            <style>{`
                @keyframes cartBounce {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.2) rotate(-10deg); }
                    50% { transform: scale(1.1) rotate(10deg); }
                    75% { transform: scale(1.15) rotate(-5deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .cart-animate {
                    animation: cartBounce 0.6s ease-in-out;
                }
                
                .badge-pulse {
                    animation: pulse 0.6s ease-in-out 3;
                }
                
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .navbar-enter {
                    animation: slideDown 0.3s ease-out;
                }
                
                .glass-effect {
                    backdrop-filter: blur(10px);
                    background: rgba(240, 240, 240, 0.8);
                }
                
                .glass-effect-dark {
                    backdrop-filter: blur(10px);
                    background: rgba(14, 18, 30, 0.9);
                }
                
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(37, 99, 235, 0.5); }
                    50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.8), 0 0 30px rgba(37, 99, 235, 0.6); }
                }
                
                .search-focus:focus {
                    animation: glow 2s ease-in-out infinite;
                }
                
                .nav-link {
                    position: relative;
                    transition: all 0.3s ease;
                }
                
                .nav-link::before {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(to right, #2563EB, #3B82F6);
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }
                
                .nav-link:hover::before {
                    width: 80%;
                }
                
                .nav-link:hover {
                    transform: translateY(-2px);
                }
            `}</style>
            
            <nav className={`fixed left-0 top-0 h-20 w-full md:h-16 z-50 navbar-enter transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
                <div className={`relative bg-[#EDECF2] dark:bg-[#0E121E] text-black shadow-md duration-200 dark:text-white transition-all`}>
                    <div>
                        {message.ouvre && (
                            <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
                                <Alert onClose={handleClose} severity={message.statut} variant="filled" sx={{ width: "100%" }}>
                                    {message.texte}
                                </Alert>
                            </Snackbar>
                        )}
                    </div>
                    
                    <div className=" bg-gradient-to-r from-[#E1DFE7] to-[#F5F4F8] dark:from-[#0E121E] dark:to-[#0E121E] px-10 py-2 shadow-sm shadow-gray-400 dark:shadow-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="w-1/2 md:w-auto transform transition-all duration-300 hover:scale-105">
                                <Link to="/" className="flex gap-2 items-center text-2xl font-bold sm:text-3xl group">
                                    <img src={logoBleu} alt="Logo" className="w-10 transform transition-transform duration-300 group-hover:rotate-12" />
                                    <span className=" font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        MaBeauté
                                    </span>
                                </Link>
                            </div>

                            <div className="flex w-full justify-start md:w-auto">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Recherche..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-[350px] rounded-full border-2 border-gray-300 px-4 py-[5px] search-focus focus:border-[#2563EB] focus:outline-none dark:border-gray-500 dark:bg-[#161B2A] transition-all duration-300 pl-10"
                                    />
                                    <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-gray-500 group-hover:text-[#2563EB] transition-colors duration-300" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 max-md:hidden md:w-auto lg:gap-4">
                                <button
                                    onClick={() => setOpenPanier(true)}
                                    className={`flex items-center justify-end gap-3 rounded-full px-4 py-2 hover:bg-gray-300 dark:hover:bg-[#161B2A] transition-all duration-300 transform hover:scale-105 ${cartAnimation ? 'cart-animate' : ''}`}
                                >
                                    <span className="font-medium">Panier</span>
                                    <Badge badgeContent={items.length} color="info" className={cartAnimation ? 'badge-pulse' : ''}>
                                        <FaCartShopping className="cursor-pointer text-xl dark:text-white" />
                                    </Badge>
                                </button>

                                <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent dark:via-white/20"></div>

                                {(isAuthenticated && user?.roleUsers === "ROLE_USER") || (dejaConnecte && userProviseur?.roleUsers === "ROLE_USER") ? (
                                    <div className="dropdown z-50 dropdown-end">
                                        <label tabIndex={0} className="flex items-center justify-end gap-3 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-[#161B2A] cursor-pointer transition-all duration-300 transform hover:scale-105">
                                            <img src={profileImage} alt="avatar" className="h-8 w-8 flex-shrink-0 rounded-full ring-2 ring-[#2563EB] ring-offset-2 dark:ring-offset-gray-800 transition-all duration-300 hover:ring-4" />
                                        </label>
                                        <ul tabIndex={0} className="menu dropdown-hover dropdown-content rounded-box mt-2 w-60 bg-white dark:bg-gray-800 p-2 shadow-xl border border-gray-200 dark:border-gray-700">
                                            <li className="text-black hover:text-accent  dark:text-white  rounded-lg transition-colors duration-200">
                                                <Link to="/profile" className="flex items-center gap-2">
                                                    <img src={profileImage} alt="avatar" className="h-6 w-6 flex-shrink-0 rounded-full" />
                                                    <span className="truncate">{nomUserConncte}</span>
                                                </Link>
                                            </li>
                                            <li className="text-black  dark:text-white hover:text-accent rounded-lg transition-colors duration-200">
                                                <button onClick={seDeconnecter}>Se déconnecter</button>
                                            </li>
                                        </ul>
                                    </div>
                                ) : (
                                    <button 
                                        // onClick={() => {
                                        //     const { openLoginModal } = useAuthModal();
                                        //     openLoginModal();
                                        // }}
                                        onClick={openLoginModal}
                                        className="flex items-center justify-end gap-3 rounded-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                                    >
                                        Se connecter
                                    </button>
                                )}

                                <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent dark:via-white/20"></div>
                                <div className="transform transition-all duration-300 hover:scale-110">
                                    <DarkMode />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="items-center justify-center px-20 bg-white/50 dark:bg-[#161B2A]/50 backdrop-blur-sm">
                        <div className="flex w-full items-center justify-end gap-2 py-3">
                            <div className="ml-4 flex items-center justify-between gap-8">
                                <Link to="/" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                                    <RiHome5Fill className="text-accent" />
                                    <span>Accueil</span>
                                </Link>
                                <Link to="/Produit" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                                    <MdOutlineStarRate className="text-[#2563EB] dark:text-yellow-400 text-xl" />
                                    <span>Nos Produits</span>
                                </Link>
                                {((isAuthenticated && user?.roleUsers === "ROLE_USER") || (dejaConnecte && userProviseur?.roleUsers === "ROLE_USER")) && (
                                    <Link to="/MesCommande" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                                        <MdBookmarkBorder className="text-accent" />
                                        <span>Mes Commandes</span>
                                    </Link>
                                )}
                                <Link to="/apropos" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
                                    <FaQuestion className="text-accent text-xl" />
                                    <span>A propos</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Panier open={ouvrePanier} onclose={() => setOuvrePanier(false)} />
                </div>
            </nav>

            {/* Modal de Connexion */}
            <dialog id="login_modal" className={`modal ${isLoginModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box bg-slate-200 dark:bg-gray-800">
                    <form method="dialog">
                        <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={closeLoginModal}>✕</button>
                    </form>
                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Connectez-vous à votre compte</h3>
                    <form onSubmit={handleLoginSubmit}>
                        {messageError && (
                            <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
                                <MdInfoOutline size={20} />
                                <span>{messageError}</span>
                            </div>
                        )} 
                        <div className="mx-8 mb-5 flex flex-col items-center justify-center">
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
                                <button type="button" className="text-accent hover:underline" onClick={switchToRegister}>
                                    Créer un compte
                                </button>
                            </p>
                        </div>
                        <div className="modal-action justify-center">
                            <button type="submit" className="btn btn-accent btn-outline btn-wide transform transition-all duration-300 hover:scale-105">
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
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeLoginModal}>Fermer</button>
                </form>
            </dialog>

            {/* Modal d'Inscription */}
            <dialog id="register_modal" className={`modal ${isRegisterModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box max-w-2xl bg-slate-200 dark:bg-gray-800">
                    <form method="dialog">
                        <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={closeRegisterModal}>✕</button>
                    </form>
                    <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Créez votre compte</h3>
                    <form onSubmit={handleRegisterSubmit}>
                        {messageError && (
                            <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
                                <MdInfoOutline size={20} />
                                <span>{messageError}</span>
                            </div>
                        )} 
                        <div className="mb-5 flex h-[400px] flex-col items-center justify-center overflow-y-auto px-4">
                            <div className="mt-4 w-2/3 items-start">
                                <FormControl error={!!registerErrors.civiliteClient}>
                                    <FormLabel id="choix-label" className="text-gray-600 dark:text-slate-300">
                                        Civilité du Client
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        name="civiliteClient"
                                        value={registerData.civiliteClient || ""}
                                        className="gap-5 text-gray-600 dark:text-slate-300"
                                        onChange={handleRegisterChange}
                                    >
                                        <FormControlLabel value="Mr" control={<Radio />} label="Mr" />
                                        <FormControlLabel value="Mme" control={<Radio />} label="Mme" />
                                        <FormControlLabel value="Mlle" control={<Radio />} label="Mlle" />
                                    </RadioGroup>
                                    <FormHelperText>{registerErrors.civiliteClient}</FormHelperText>
                                </FormControl>
                            </div>

                            <InputValidate
                                IconComponent={IoPerson}
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
                                className="btn btn-accent btn-outline btn-wide transform transition-all duration-300 hover:scale-105"
                            >
                                {loading ? (
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <span className="loading loading-spinner text-accent"></span>
                                        <span>Inscription en cours...</span>
                                    </div>
                                ) : (
                                    "S'inscrire à nouveau compte"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Backdrop pour fermer le modal */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={closeRegisterModal}>Fermer</button>
                </form>
            </dialog>
        </>
    );
};

export default Navbar;

// import React, { useEffect, useState } from "react";
// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import logoBleu from "@/image/logoBleu.png";
// import { MdInfoOutline, MdOutlineEmail, MdOutlineStarRate, MdBookmarkBorder } from "react-icons/md";
// import { IoMdSearch } from "react-icons/io";
// import { FaCartShopping, FaUser, FaPhone, FaQuestion } from "react-icons/fa6";
// import DarkMode from "./DarkMode";
// import { LoginVerifier, RegistreVerifier } from "@/services/ClientService";
// import { Link,useLocation, useNavigate } from "react-router-dom";
// import { useNavbar } from "../context/NavbarContext";
// import Panier from "../Pages/Commande/Panier";
// import { RiHome5Fill, RiKeyFill } from "react-icons/ri";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import { FormHelperText } from "@mui/material";
// import Badge from "@mui/material/Badge";
// import { usePanier } from "../context/PanierContext";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { InputValidate } from "@/components/InputValidate";
// import { IoPerson } from "react-icons/io5";

// const Navbar = () => {
//     const { user, login, logout, isAuthenticated, register } = useAuthContext();
//     const [ouvrePanier, setOuvrePanier] = useState(false);
//     const [messageError, setMessageError] = useState(null);
//     const [open, setOpen] = useState(false);
//     const navigate = useNavigate();
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });
//     const { items } = usePanier();
//     const [loading, setLoading] = useState(false);
//     const [nomUserConncte, setNomUserConnecte] = useState("");
//     const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//     const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
//     const [dejaConnecte, setDejaConnecte] = useState(false);
//     const [registerErrors, setRegisterErrors] = useState({});
//     const { searchTerm, setSearchTerm, setOpenPanier } = useNavbar();
//     const [userProviseur, setUserProviseur] = useState(null);
//    const location = useLocation();
//    const currentPath = location.pathname;
//     // États pour les animations
//     const [prevItemsLength, setPrevItemsLength] = useState(0);
//     const [cartAnimation, setCartAnimation] = useState(false);
//     const [scrolled, setScrolled] = useState(false);

//     // Animation du panier quand items.length change
//     useEffect(() => {
//         if (items.length > prevItemsLength) {
//             setCartAnimation(true);
//             setTimeout(() => setCartAnimation(false), 600);
//         }
//         setPrevItemsLength(items.length);
//     }, [items.length]);

//     // Effet de scroll pour la navbar
//     useEffect(() => {
//         const handleScroll = () => {
//             setScrolled(window.scrollY > 20);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     useEffect(() => {
//         if (currentPath === "/"){
//             navigate("/Produit")
//         }
//     }, [searchTerm]);

//     useEffect(() => {
//         const chargementUser = () => {
//             const local = localStorage.getItem('user');
//             if (local) {
//                 const parsedUser = JSON.parse(local);
//                 if (parsedUser && parsedUser.client) {
//                     setDejaConnecte(true);
//                     setUserProviseur(parsedUser);
//                 }
//             }
//         };
//         chargementUser();
//     }, []);

//     useEffect(() => {
//         if ((user && user.client) || (userProviseur && userProviseur.client)) {
//             setNomUserConnecte(
//                 (user?.client?.nomClient + " " + user?.client?.prenomClient) || 
//                 (userProviseur?.client?.nomClient + " " + userProviseur?.client?.prenomClient)
//             );
//         } else {
//             setNomUserConnecte("");
//         }
//     }, [user, userProviseur]);
    
//     const [loginData, setLoginData] = useState({
//         emailUser: "",
//         passwordUser: "",
//     });
//     const [loginErrors, setLoginErrors] = useState({});

//     const [registerData, setRegisterData] = useState({
//         civiliteClient: "",
//         nomClient: "",
//         prenomClient: "",
//         email: "",
//         password: "",
//         telephoneClient: "",
//         dateNaissance: "",
//     });


//     const seDeconnecter = () => {
//         logout();
//         setDejaConnecte(false);
//         setUserProviseur(null);
//         navigate('/');
//     };

//     const getProfileImage = () => {
//         const civilite = user?.client?.civiliteClient || userProviseur?.client?.civiliteClient || '';
//         const defaultImage = "/image/image.png";
        
//         switch(civilite.toLowerCase()) {
//             case 'mr':
//             case 'monsieur':
//             case 'm.':
//                 return "/image/Mr.png";
//             case 'mme':
//             case 'madame':
//             case 'mrs':
//                 return "/image/Mme.png";
//             case 'mlle':
//             case 'mademoiselle':
//             case 'miss':
//                 return "/image/Mlle.png";
//             default:
//                 return defaultImage;
//         }
//     };
//     const profileImage = getProfileImage();
  
//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     const handleLoginChange = (e) => {
//         const { name, value } = e.target;
//         setLoginData((prevData) => ({ ...prevData, [name]: value }));
//         setLoginErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     };

//     const handleRegisterChange = (e) => {
//         const { name, value } = e.target;
//         setRegisterData((prevData) => ({ ...prevData, [name]: value }));
//         setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     };

//     const validateEmailFormat = (email) => {
//         return /\S+@\S+\.\S+/.test(email);
//     };

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

//     const handleLoginSubmit = async (e) => {
//         e.preventDefault();
//         setMessageError(null);
//         if (validateLogin()) {
//             setLoading(true);
//             const data = {
//                 email: loginData.emailUser,
//                 role: "ROLE_USER",
//                 password: loginData.passwordUser,
//             };
//             try {
//                 const response = await LoginVerifier(data);
//                 if (response.data) {
//                     const infos = await login(loginData.emailUser, loginData.passwordUser);
//                     if (infos.success) {
//                         if (infos.user.roleUsers === "ROLE_USER") {
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "Connexion réussie.",
//                                 statut: "success",
//                             });
//                             setOpen(true);
//                             setIsLoginModalOpen(false);
//                             setLoginData({ emailUser: "", passwordUser: "" });
//                         }
//                     } else {
//                         setMessageError(infos.error || "Erreur de connexion.");
//                         setMessage({
//                             ouvre: true,
//                             texte: infos.error || "Erreur de connexion.",
//                             statut: "error",
//                         });
//                         setOpen(true);
//                     }
//                 } else {
//                     setMessageError(response.error);
//                     setMessage({
//                         ouvre: true,
//                         texte: response.error || "Nous ne pouvons pas trouvé votre compte!",
//                         statut: "error",
//                     });
//                     setOpen(true);
//                 }
//                 setLoading(false);
//             } catch (error) {
//                 console.error("Erreur de connexion:", error);
//                 setLoading(false);
//             }
//         }
//     };

//     const handleRegisterSubmit = async (e) => {
//         e.preventDefault();
//         setMessageError(null);
//         if (validateRegister()) {
//             const NewUser = {
//                 nom: registerData.nomClient,
//                 prenom: registerData.prenomClient,
//                 telephone: registerData.telephoneClient,
//                 civilite: registerData.civiliteClient,
//                 dateNaissance: registerData.dateNaissance,
//                 email: registerData.email,
//                 password: registerData.password,
//             };
//             setLoading(true);
//             const dataVerifier = {
//                 email: NewUser.email,
//                 role: "ROLE_USER",
//                 password: NewUser.password,
//             };
//             try {
//                 const response = await RegistreVerifier(dataVerifier);
//                 if (response.data) {
//                     const enregistre = await register(NewUser);
//                     if (enregistre.success) {
//                         setMessage({
//                             ouvre: true,
//                             texte: "La création de votre Compte est réussie.",
//                             statut: "success",
//                         });
//                         setRegisterData({
//                             civiliteClient: "",
//                             nomClient: "",
//                             prenomClient: "",
//                             email: "",
//                             password: "",
//                             telephoneClient: "",
//                             dateNaissance: "",
//                         });
//                         setIsRegisterModalOpen(false);
//                         setOpen(true);
//                     } else {
//                         setMessageError(enregistre.error);
//                         setMessage({
//                             ouvre: true,
//                             texte: enregistre.error || "Erreur de connexion.",
//                             statut: "error",
//                         });
//                         setOpen(true);
//                     }
//                 } else {
//                     setMessageError("Votre email est déjà utilisé par un autre compte");
//                     setMessage({
//                         ouvre: true,
//                         texte: "Votre email est utilisé par un autre compte",
//                         statut: "error",
//                     });
//                     setOpen(true);
//                 }
//                 setLoading(false);
//             } catch (error) {
//                 console.error("Erreur d'inscription:", error);
//                 setLoading(false);
//             }
//         }
//     };

//     const openLoginModal = () => {
//         setIsLoginModalOpen(true);
//         setLoginErrors({});
//         setMessageError(null);
//     };

//     const closeLoginModal = () => {
//         setIsLoginModalOpen(false);
//         setLoginData({ emailUser: "", passwordUser: "" });
//     };

//     const openRegisterModal = () => {
//         setIsRegisterModalOpen(true);
//         setRegisterErrors({});
//         setMessageError(null);
//     };

//     const closeRegisterModal = () => {
//         setIsRegisterModalOpen(false);
//         setRegisterData({
//             civiliteClient: "",
//             nomClient: "",
//             prenomClient: "",
//             email: "",
//             password: "",
//             telephoneClient: "",
//             dateNaissance: "",
//         });
//     };

//     const switchToRegister = () => {
//         closeLoginModal();
//         openRegisterModal();
//     };

//     const switchToLogin = () => {
//         closeRegisterModal();
//         openLoginModal();
//     };

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     return (
//         <>
//             <style>{`
//                 @keyframes cartBounce {
//                     0%, 100% { transform: scale(1) rotate(0deg); }
//                     25% { transform: scale(1.2) rotate(-10deg); }
//                     50% { transform: scale(1.1) rotate(10deg); }
//                     75% { transform: scale(1.15) rotate(-5deg); }
//                 }
                
//                 @keyframes pulse {
//                     0%, 100% { opacity: 1; }
//                     50% { opacity: 0.5; }
//                 }
                
//                 .cart-animate {
//                     animation: cartBounce 0.6s ease-in-out;
//                 }
                
//                 .badge-pulse {
//                     animation: pulse 0.6s ease-in-out 3;
//                 }
                
//                 @keyframes slideDown {
//                     from {
//                         transform: translateY(-100%);
//                         opacity: 0;
//                     }
//                     to {
//                         transform: translateY(0);
//                         opacity: 1;
//                     }
//                 }
                
//                 .navbar-enter {
//                     animation: slideDown 0.3s ease-out;
//                 }
                
//                 .glass-effect {
//                     backdrop-filter: blur(10px);
//                     background: rgba(240, 240, 240, 0.8);
//                 }
                
//                 .glass-effect-dark {
//                     backdrop-filter: blur(10px);
//                     background: rgba(14, 18, 30, 0.9);
//                 }
                
//                 @keyframes glow {
//                     0%, 100% { box-shadow: 0 0 5px rgba(37, 99, 235, 0.5); }
//                     50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.8), 0 0 30px rgba(37, 99, 235, 0.6); }
//                 }
                
//                 .search-focus:focus {
//                     animation: glow 2s ease-in-out infinite;
//                 }
                
//                 .nav-link {
//                     position: relative;
//                     transition: all 0.3s ease;
//                 }
                
//                 .nav-link::before {
//                     content: '';
//                     position: absolute;
//                     bottom: -2px;
//                     left: 50%;
//                     width: 0;
//                     height: 2px;
//                     background: linear-gradient(to right, #2563EB, #3B82F6);
//                     transition: all 0.3s ease;
//                     transform: translateX(-50%);
//                 }
                
//                 .nav-link:hover::before {
//                     width: 80%;
//                 }
                
//                 .nav-link:hover {
//                     transform: translateY(-2px);
//                 }
//             `}</style>
            
//             {/* <div className={`relative ${document.documentElement.classList.contains('dark') ? 'glass-effect-dark' : 'glass-effect'} text-black shadow-md duration-200 dark:text-white transition-all`}>
//                 <div className={`relative ${scrolled ? (document.documentElement.classList.contains('dark') ? 'glass-effect-dark' : 'glass-effect') : 'bg-[#EDECF2] dark:bg-[#0E121E]'} text-black shadow-md duration-200 dark:text-white transition-all`}>
            
//             </div> */}
//             <nav className={`fixed left-0 top-0 h-20 w-full md:h-16 z-50 navbar-enter transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
//                  <div className={`relative bg-[#EDECF2] dark:bg-[#0E121E] text-black shadow-md duration-200 dark:text-white transition-all`}>
            
//                     <div>
//                         {message.ouvre && (
//                             <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
//                                 <Alert onClose={handleClose} severity={message.statut} variant="filled" sx={{ width: "100%" }}>
//                                     {message.texte}
//                                 </Alert>
//                             </Snackbar>
//                         )}
//                     </div>
                    
//                     <div className=" bg-gradient-to-r from-[#E1DFE7] to-[#F5F4F8] dark:from-[#0E121E] dark:to-[#0E121E] px-10 py-2 shadow-sm shadow-gray-400 dark:shadow-white/10">
//                         <div className="flex flex-wrap items-center justify-between gap-2">
//                             <div className="w-1/2 md:w-auto transform transition-all duration-300 hover:scale-105">
//                                 <Link to="/" className="flex gap-2 items-center text-2xl font-bold sm:text-3xl group">
//                                     <img src={logoBleu} alt="Logo" className="w-10 transform transition-transform duration-300 group-hover:rotate-12" />
//                                     <span className=" font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                                         MaBeauté
//                                     </span>
//                                 </Link>
//                             </div>

//                             <div className="flex w-full justify-start md:w-auto">
//                                 <div className="relative group">
//                                     <input
//                                         type="text"
//                                         placeholder="Recherche..."
//                                         value={searchTerm}
//                                         onChange={handleSearchChange}
//                                         className="w-[350px] rounded-full border-2 border-gray-300 px-4 py-[5px] search-focus focus:border-[#2563EB] focus:outline-none dark:border-gray-500 dark:bg-[#161B2A] transition-all duration-300 pl-10"
//                                     />
//                                     <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-gray-500 group-hover:text-[#2563EB] transition-colors duration-300" />
//                                 </div>
//                             </div>

//                             <div className="flex items-center justify-between gap-2 max-md:hidden md:w-auto lg:gap-4">
//                                 <button
//                                     onClick={() => setOpenPanier(true)}
//                                     className={`flex items-center justify-end gap-3 rounded-full px-4 py-2 hover:bg-gray-300 dark:hover:bg-[#161B2A] transition-all duration-300 transform hover:scale-105 ${cartAnimation ? 'cart-animate' : ''}`}
//                                 >
//                                     <span className="font-medium">Panier</span>
//                                     <Badge badgeContent={items.length} color="info" className={cartAnimation ? 'badge-pulse' : ''}>
//                                         <FaCartShopping className="cursor-pointer text-xl dark:text-white" />
//                                     </Badge>
//                                 </button>

//                                 <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent dark:via-white/20"></div>

//                                 {(isAuthenticated && user?.roleUsers === "ROLE_USER") || (dejaConnecte && userProviseur?.roleUsers === "ROLE_USER") ? (
//                                     <div className="dropdown z-50 dropdown-end">
//                                         <label tabIndex={0} className="flex items-center justify-end gap-3 rounded-full px-4 py-1 hover:bg-gray-300 dark:hover:bg-[#161B2A] cursor-pointer transition-all duration-300 transform hover:scale-105">
//                                             <img src={profileImage} alt="avatar" className="h-8 w-8 flex-shrink-0 rounded-full ring-2 ring-[#2563EB] ring-offset-2 dark:ring-offset-gray-800 transition-all duration-300 hover:ring-4" />
//                                         </label>
//                                         <ul tabIndex={0} className="menu dropdown-hover dropdown-content rounded-box mt-2 w-60 bg-white dark:bg-gray-800 p-2 shadow-xl border border-gray-200 dark:border-gray-700">
//                                             <li className="text-black hover:text-accent  dark:text-white  rounded-lg transition-colors duration-200">
//                                                 <Link to="/profile" className="flex items-center gap-2">
//                                                     <img src={profileImage} alt="avatar" className="h-6 w-6 flex-shrink-0 rounded-full" />
//                                                     <span className="truncate">{nomUserConncte}</span>
//                                                 </Link>
//                                             </li>
//                                             <li className="text-black  dark:text-white hover:text-accent rounded-lg transition-colors duration-200">
//                                                 <button onClick={seDeconnecter}>Se déconnecter</button>
//                                             </li>
//                                         </ul>
//                                     </div>
//                                 ) : (
//                                     <button onClick={openLoginModal} className="flex items-center justify-end gap-3 rounded-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium">
//                                         Se connecter
//                                     </button>
//                                 )}

//                                 <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent dark:via-white/20"></div>
//                                 <div className="transform transition-all duration-300 hover:scale-110">
//                                     <DarkMode />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="items-center justify-center px-20 bg-white/50 dark:bg-[#161B2A]/50 backdrop-blur-sm">
//                         <div className="flex w-full items-center justify-end gap-2 py-3">
//                             <div className="ml-4 flex items-center justify-between gap-8">
//                                 <Link to="/" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
//                                     <RiHome5Fill className="text-accent" />
//                                     <span>Accueil</span>
//                                 </Link>
//                                 <Link to="/Produit" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
//                                     <MdOutlineStarRate className="text-[#2563EB] dark:text-yellow-400 text-xl" />
//                                     <span>Nos Produits</span>
//                                 </Link>
//                                 {((isAuthenticated && user?.roleUsers === "ROLE_USER") || (dejaConnecte && userProviseur?.roleUsers === "ROLE_USER")) && (
//                                     <Link to="/MesCommande" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
//                                         <MdBookmarkBorder className="text-accent" />
//                                         <span>Mes Commandes</span>
//                                     </Link>
//                                 )}
//                                 <Link to="/apropos" className="nav-link flex items-center justify-center gap-2 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
//                                     <FaQuestion className="text-accent text-xl" />
//                                     <span>A propos</span>
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>

//                     <Panier open={ouvrePanier} onclose={() => setOuvrePanier(false)} />
//                 </div>
//             </nav>

//             {/* Modal de Connexion */}
//             <dialog id="login_modal" className={`modal ${isLoginModalOpen ? "modal-open" : ""}`}>
//                 <div className="modal-box bg-slate-200 dark:bg-gray-800">
//                     <form method="dialog">
//                         <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={closeLoginModal}>✕</button>
//                     </form>
//                     <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Connectez-vous à votre compte</h3>
//                     <form onSubmit={handleLoginSubmit}>
//                         {messageError && (
//                             <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
//                                 <MdInfoOutline size={20} />
//                                 <span>{messageError}</span>
//                             </div>
//                         )} 
//                         <div className="mx-8 mb-5 flex flex-col items-center justify-center">
//                             <InputValidate
//                                 IconComponent={MdOutlineEmail}
//                                 type="email"
//                                 largeur="full"
//                                 placeholder="Entrez votre Email..."
//                                 title="Email Utilisateur"
//                                 name="emailUser"
//                                 value={loginData.emailUser}
//                                 onChange={(val) => handleLoginChange({ target: { name: "emailUser", value: val } })}
//                                 error={!!loginErrors.emailUser}
//                                 helperText={loginErrors.emailUser}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                             <InputValidate
//                                 IconComponent={RiKeyFill}
//                                 type="password"
//                                 largeur="full"
//                                 placeholder="Entrez votre mot de passe..."
//                                 title="Mot de Passe"
//                                 name="passwordUser"
//                                 value={loginData.passwordUser}
//                                 onChange={(val) => handleLoginChange({ target: { name: "passwordUser", value: val } })}
//                                 error={!!loginErrors.passwordUser}
//                                 helperText={loginErrors.passwordUser}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                         </div>
//                         <div className="mb-4 text-center">
//                             <p className="text-sm text-gray-600 dark:text-gray-300">
//                                 Pas encore de compte ?{" "}
//                                 <button type="button" className="text-accent hover:underline" onClick={switchToRegister}>
//                                     Créer un compte
//                                 </button>
//                             </p>
//                         </div>
//                         <div className="modal-action justify-center">
//                             <button type="submit" className="btn btn-accent btn-outline btn-wide transform transition-all duration-300 hover:scale-105">
//                                 {loading ? (
//                                     <div className="flex flex-row items-center justify-center gap-2">
//                                         <span className="loading loading-spinner text-accent"></span>
//                                         <span>Connexion en cours...</span>
//                                     </div>
//                                 ) : (
//                                     "Se Connecter à mon compte"
//                                 )}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//                 <form method="dialog" className="modal-backdrop">
//                     <button onClick={closeLoginModal}>Fermer</button>
//                 </form>
//             </dialog>

//             {/* Modal d'Inscription */}
//             <dialog id="register_modal" className={`modal ${isRegisterModalOpen ? "modal-open" : ""}`}>
//                 <div className="modal-box max-w-2xl bg-slate-200 dark:bg-gray-800">
//                     <form method="dialog">
//                         <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={closeRegisterModal}>✕</button>
//                     </form>
//                     <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Créez votre compte</h3>
//                     <form onSubmit={handleRegisterSubmit}>
//                         {messageError && (
//                             <div className="mt-4 flex justify-center space-x-1 rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-800/10 dark:text-red-500">
//                                 <MdInfoOutline size={20} />
//                                 <span>{messageError}</span>
//                             </div>
//                         )} 
//                         <div className="mb-5 flex h-[400px] flex-col items-center justify-center overflow-y-auto px-4">
//                             <div className="mt-4 w-2/3 items-start">
//                                 <FormControl error={!!registerErrors.civiliteClient}>
//                                     <FormLabel id="choix-label" className="text-gray-600 dark:text-slate-300">
//                                         Civilité du Client
//                                     </FormLabel>
//                                     <RadioGroup
//                                         row
//                                         name="civiliteClient"
//                                         value={registerData.civiliteClient || ""}
//                                         className="gap-5 text-gray-600 dark:text-slate-300"
//                                         onChange={handleRegisterChange}
//                                     >
//                                         <FormControlLabel value="Mr" control={<Radio />} label="Mr" />
//                                         <FormControlLabel value="Mme" control={<Radio />} label="Mme" />
//                                         <FormControlLabel value="Mlle" control={<Radio />} label="Mlle" />
//                                     </RadioGroup>
//                                     <FormHelperText>{registerErrors.civiliteClient}</FormHelperText>
//                                 </FormControl>
//                             </div>

//                             <InputValidate
//                                 IconComponent={IoPerson}
//                                 type="text"
//                                 largeur="full"
//                                 placeholder="Votre nom..."
//                                 title="Nom"
//                                 name="nomClient"
//                                 value={registerData.nomClient}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "nomClient", value: val } })}
//                                 error={!!registerErrors.nomClient}
//                                 helperText={registerErrors.nomClient}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                             <InputValidate
//                                 IconComponent={IoPerson}
//                                 type="text"
//                                 largeur="full"
//                                 placeholder="Votre prénom..."
//                                 title="Prénom"
//                                 name="prenomClient"
//                                 value={registerData.prenomClient}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "prenomClient", value: val } })}
//                                 error={!!registerErrors.prenomClient}
//                                 helperText={registerErrors.prenomClient}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />

//                             <InputValidate
//                                 IconComponent={FaPhone}
//                                 type="tel"
//                                 largeur="full"
//                                 placeholder="Votre numéro de téléphone..."
//                                 title="Téléphone"
//                                 name="telephoneClient"
//                                 value={registerData.telephoneClient}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "telephoneClient", value: val } })}
//                                 error={!!registerErrors.telephoneClient}
//                                 helperText={registerErrors.telephoneClient}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />

//                             <InputValidate
//                                 IconComponent={CalendarDateRangeIcon}
//                                 type="date"
//                                 largeur="full"
//                                 placeholder="Entrez votre date de naissance..."
//                                 title="Date de naissance"
//                                 value={registerData.dateNaissance || ""}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "dateNaissance", value: val } })}
//                                 error={!!registerErrors.dateNaissance}
//                                 helperText={registerErrors.dateNaissance}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                             <InputValidate
//                                 IconComponent={MdOutlineEmail}
//                                 type="email"
//                                 largeur="full"
//                                 placeholder="Entrez votre Email..."
//                                 title="Email"
//                                 name="email"
//                                 value={registerData.email}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "email", value: val } })}
//                                 error={!!registerErrors.email}
//                                 helperText={registerErrors.email}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />

//                             <InputValidate
//                                 IconComponent={RiKeyFill}
//                                 type="password"
//                                 largeur="full"
//                                 placeholder="Créez votre mot de passe..."
//                                 title="Mot de Passe"
//                                 name="password"
//                                 value={registerData.password}
//                                 onChange={(val) => handleRegisterChange({ target: { name: "password", value: val } })}
//                                 error={!!registerErrors.password}
//                                 helperText={registerErrors.password}
//                                 ClassIcone="text-accent"
//                                 margY="my-2"
//                             />
//                         </div>

//                         <div className="mb-4 text-center">
//                             <p className="text-sm text-gray-600 dark:text-gray-300">
//                                 Déjà un compte ?{" "}
//                                 <button
//                                     type="button"
//                                     className="text-accent hover:underline"
//                                     onClick={switchToLogin}
//                                 >
//                                     Se connecter
//                                 </button>
//                             </p>
//                         </div>

//                         <div className="modal-action justify-center">
//                             <button
//                                 type="submit"
//                                 className="btn btn-accent btn-outline btn-wide transform transition-all duration-300 hover:scale-105"
//                             >
//                                 {loading ? (
//                                     <div className="flex flex-row items-center justify-center gap-2">
//                                         <span className="loading loading-spinner text-accent"></span>
//                                         <span>Inscription en cours...</span>
//                                     </div>
//                                 ) : (
//                                     "S'inscrire à nouveau compte"
//                                 )}
//                             </button>
//                         </div>
//                     </form>
//                 </div>

//                 {/* Backdrop pour fermer le modal */}
//                 <form method="dialog" className="modal-backdrop">
//                     <button onClick={closeRegisterModal}>Fermer</button>
//                 </form>
//             </dialog>
//         </>
//     );
// };

// export default Navbar;
