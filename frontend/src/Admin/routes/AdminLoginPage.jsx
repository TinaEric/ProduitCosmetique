import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, data } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import { InputText } from "@/components/InputGrp";
import { MdEmail, MdOutlinePassword, MdPassword } from "react-icons/md";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { InputValidate } from "@/components/InputValidate";
import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
import { RiKeyFill } from "react-icons/ri";
import { LoginVerifier } from "@/services/ClientService";

function AdminLoginPage() {
    const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailUsers, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [messageError, setMessageError] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    const from = location.state?.from?.pathname || "/admin/";

    // Redirection si déjà authentifié en tant qu'admin
    useEffect(() => {
        if (isAuthenticated) {
            if (isAdmin) {
                navigate(from, { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, isAdmin, navigate, from]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!data.password || data.password.trim() === "") {
            tempErrors.password = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
            isValid = false;
        }
        if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
            tempErrors.email = "Une adresse email valide est requise.";
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (validate()) {
            const dataVerifier = {
                email: data.email,
                role: "ROLE_ADMIN",
                'password': data.password
            };
            setLoading(true);
            try {
                const response = await LoginVerifier(dataVerifier);
                console.log(response);
                if (response.data) {
                    const result = await login(data.email, data.password);
                    console.log("Compte :", result);
                    if (result.success) {
                        if (result.user.roleUsers === "ROLE_ADMIN") {
                            // La redirection se fera via le useEffect
                        } else {
                            setErrorMessage("Accès refusé : compte non administrateur");
                            setMessage({
                                ouvre: true,
                                texte: "Accès refusé : compte non administrateur",
                                statut: "error",
                            });
                            setOpen(true);
                            setLoading(false);
                            setTimeout(() => {
                                logout();
                            }, 2000);
                        }
                    } else {
                        setErrorMessage(result.error || "Erreur de connexion.");
                        setMessage({
                            ouvre: true,
                            texte: result.error || "Erreur de connexion.",
                            statut: "error",
                        });
                        setOpen(true);
                        console.log(result.error);
                        setLoading(false);
                    }
                    setOpen(true);
                    setDonnes({});
                } else {
                    setErrorMessage(response.error)
                    setMessage({
                        ouvre: true,
                        texte: "Nous ne pouvons pas trouvé votre compte!",
                        statut: "error",
                    });
                    setOpen(true);
                }
                setLoading(false);
            } catch (err) {
                setErrorMessage("Erreur de connexion au serveur");
                setMessage({
                    ouvre: true,
                    texte: "Erreur de connexion au serveur : ",
                    err,
                    statut: "error",
                });
                setOpen(true);
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

    if (user === undefined) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner text-accent"></span>
                    <p>Vérification des accès...</p>
                </div>
            </div>
        );
    }
// border border-slate-700
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white  dark:bg-gray-900">
            <div className="flex flex-col gap-6 rounded-2xl  bg-transparent p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="mb-2 text-2xl font-bold text-accent">Espace Administrateur</h2>
                    <p className="text-sm text-gray-400">Accès réservé au personnel autorisé</p>
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
                
                { errorMessage && (
                    <div className="flex w-full items-center justify-center">
                        <Alert
                            severity="error"
                            className="w-full items-center justify-center bg-[#FDEDED] dark:bg-red-400 dark:bg-opacity-15 dark:text-white dark:text-opacity-100"
                        >
                            {errorMessage}
                        </Alert>
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="flex w-80 flex-col gap-4"
                >
                    <div className="flex flex-col items-center text-white justify-center">
                        <InputValidate
                            IconComponent={MdOutlineEmail}
                            type="email"
                            // largeur="2/3"
                            placeholder="Entrez votre Email..."
                            title="Email Utilisateur"
                            value={data.email}
                            onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                            error={!!errors.email}
                            helperText={errors.email}
                            ClassIcone="text-accent"
                        />
                        <InputValidate
                            IconComponent={RiKeyFill}
                            type="password"
                            // largeur="2/3"
                            placeholder="Créer votre mot de passe..."
                            title="Mot de Passe"
                            value={data.password}
                            onChange={(val) => handleChange({ target: { name: "password", value: val } })}
                            error={!!errors.password}
                            helperText={errors.password}
                            ClassIcone="text-accent"
                        />
                    </div>
                    <div className="mb-4 flex items-center justify-center">
                            <button
                                type="submit"
                                className="btn btn-accent btn-outline btn-wide"
                            >
                                 {loading ? ( 
                                    <div className="flex flex-row justify-center items-center gap-2">
                                        <span className="loading loading-spinner text-accent"></span>
                                        <span>Connexion en cours...</span></div>
                                 ) : "Se Connecter à mon compte"}
                               
                            </button>
                        </div>
                    {/* <button
                        className="btn btn-accent mt-4 w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <span className="loading loading-spinner"></span>
                                <span>Authentification...</span>
                            </div>
                        ) : (
                            "Accéder au panel admin"
                        )}
                    </button> */}
                </form>

                <div className="border-t border-slate-700 pt-4 text-center">
                    <a
                        href="/"
                        className="text-sm text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                        ← Retour à l'accueil public
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;
