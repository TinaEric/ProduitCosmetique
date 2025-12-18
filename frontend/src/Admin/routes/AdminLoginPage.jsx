import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { InputValidate } from "@/components/InputValidate";
import { MdOutlineEmail, MdLockOutline, MdAdminPanelSettings } from "react-icons/md";
import { RiKeyFill, RiShieldCheckLine } from "react-icons/ri";
import { LoginVerifier } from "@/services/ClientService";
import { BiError } from "react-icons/bi";

function AdminLoginPage() {
    const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    const from = location.state?.from?.pathname || "/admin/";

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
            tempErrors.password = "Le mot de passe est requis.";
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
                password: data.password
            };
            setLoading(true);
            try {
                const response = await LoginVerifier(dataVerifier);
                if (response.data) {
                    const result = await login(data.email, data.password);
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
                        setLoading(false);
                    }
                } else {
                    setErrorMessage(response.error);
                    setMessage({
                        ouvre: true,
                        texte: "Nous ne pouvons pas trouver votre compte!",
                        statut: "error",
                    });
                    setOpen(true);
                }
                setLoading(false);
            } catch (err) {
                setErrorMessage("Erreur de connexion au serveur");
                setMessage({
                    ouvre: true,
                    texte: "Erreur de connexion au serveur",
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
            <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-700 to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                    <p className="text-white">Vérification des accès...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-600 to-slate-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
                <div className="absolute -right-4 bottom-1/4 h-72 w-72 animate-pulse rounded-full bg-blue-500 opacity-20 blur-3xl" style={{ animationDelay: '1s' }}></div>
                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-900 opacity-10 blur-3xl" style={{ animationDelay: '2s' }}></div>
            </div>
                {/* Snackbar */}
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

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
                    {/* Header */}
                     <div className="mb-8 text-center"> {/* bg-gradient-to-r from-[#2563EB] to-[#1E40AF]  / from-blue-600 to-purple-600 */}
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-slate-700">
                            <RiShieldCheckLine className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="mb-2 bg-gradient-to-r from-blue-200 to-purple-300 bg-clip-text text-3xl font-bold text-transparent">
                            Admin Access
                        </h2>
                        <p className="text-sm text-gray-300">Espace réservé au personnel autorisé</p>
                    </div>

                

                    {/* Error Alert */}
                    {errorMessage && (
                        <div className="mb-6 animate-shake">
                            <div className=" flex justify-center space-x-1 rounded-lg p-2 text-red-800 bg-red-600/10">
                                 <BiError size={20} />
                                <span>{errorMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4 text-white" >
                            <InputValidate
                                IconComponent={MdOutlineEmail}
                                type="email"
                                placeholder="admin@example.com"
                                title="Email"
                                value={data.email}
                                onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                                error={!!errors.email}
                                helperText={errors.email}
                                ClassIcone="text-blue-200"
                                login="admin"
                            />
                            <InputValidate
                                IconComponent={RiKeyFill}
                                type="password"
                                placeholder="••••••••"
                                title="Mot de passe"
                                value={data.password}
                                onChange={(val) => handleChange({ target: { name: "password", value: val } })}
                                error={!!errors.password}
                                helperText={errors.password}
                                ClassIcone="text-blue-200"
                                login="admin"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        <span>Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdAdminPanelSettings className="h-5 w-5" />
                                        <span>Accéder au panel</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 border-t border-white/10 pt-6 text-center">
                        <a
                            href="/"
                            className="group inline-flex items-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:text-white"
                        >
                            <svg 
                                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Retour à l'accueil</span>
                        </a>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        🔒 Connexion sécurisée et chiffrée
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;

// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation, data } from "react-router-dom";
// import { useAuth } from "../../hook/useAuth";
// import { InputText } from "@/components/InputGrp";
// import { MdEmail, MdOutlinePassword, MdPassword } from "react-icons/md";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { InputValidate } from "@/components/InputValidate";
// import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
// import { RiKeyFill } from "react-icons/ri";
// import { LoginVerifier } from "@/services/ClientService";

// function AdminLoginPage() {
//     const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [data, setData] = useState({});
//     const [errors, setErrors] = useState({});
//     const [errorMessage, setErrorMessage] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [emailUsers, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [messageError, setMessageError] = useState(false);
//     const [open, setOpen] = useState(false);
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });

//     const from = location.state?.from?.pathname || "/admin/";

//     // Redirection si déjà authentifié en tant qu'admin
//     useEffect(() => {
//         if (isAuthenticated) {
//             if (isAdmin) {
//                 navigate(from, { replace: true });
//             } else {
//                 navigate("/", { replace: true });
//             }
//         }
//     }, [isAuthenticated, isAdmin, navigate, from]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setData((prevData) => ({ ...prevData, [name]: value }));
//         setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//     };

//     const validate = () => {
//         let tempErrors = {};
//         let isValid = true;
//         if (!data.password || data.password.trim() === "") {
//             tempErrors.password = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
//             isValid = false;
//         }
//         if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
//             tempErrors.email = "Une adresse email valide est requise.";
//             isValid = false;
//         }
//         setErrors(tempErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setErrorMessage("");

//         if (validate()) {
//             const dataVerifier = {
//                 email: data.email,
//                 role: "ROLE_ADMIN",
//                 'password': data.password
//             };
//             setLoading(true);
//             try {
//                 const response = await LoginVerifier(dataVerifier);
//                 console.log(response);
//                 if (response.data) {
//                     const result = await login(data.email, data.password);
//                     console.log("Compte :", result);
//                     if (result.success) {
//                         if (result.user.roleUsers === "ROLE_ADMIN") {
//                             // La redirection se fera via le useEffect
//                         } else {
//                             setErrorMessage("Accès refusé : compte non administrateur");
//                             setMessage({
//                                 ouvre: true,
//                                 texte: "Accès refusé : compte non administrateur",
//                                 statut: "error",
//                             });
//                             setOpen(true);
//                             setLoading(false);
//                             setTimeout(() => {
//                                 logout();
//                             }, 2000);
//                         }
//                     } else {
//                         setErrorMessage(result.error || "Erreur de connexion.");
//                         setMessage({
//                             ouvre: true,
//                             texte: result.error || "Erreur de connexion.",
//                             statut: "error",
//                         });
//                         setOpen(true);
//                         console.log(result.error);
//                         setLoading(false);
//                     }
//                     setOpen(true);
//                     setDonnes({});
//                 } else {
//                     setErrorMessage(response.error)
//                     setMessage({
//                         ouvre: true,
//                         texte: "Nous ne pouvons pas trouvé votre compte!",
//                         statut: "error",
//                     });
//                     setOpen(true);
//                 }
//                 setLoading(false);
//             } catch (err) {
//                 setErrorMessage("Erreur de connexion au serveur");
//                 setMessage({
//                     ouvre: true,
//                     texte: "Erreur de connexion au serveur : ",
//                     err,
//                     statut: "error",
//                 });
//                 setOpen(true);
//                 setLoading(false);
//             }
//         }
//     };
//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     if (user === undefined) {
//         return (
//             <div className="flex h-screen w-full items-center justify-center">
//                 <div className="flex flex-col items-center gap-4">
//                     <span className="loading loading-spinner text-accent"></span>
//                     <p>Vérification des accès...</p>
//                 </div>
//             </div>
//         );
//     }
// // border border-slate-700
//     return (
//         <div className="flex h-screen w-full items-center justify-center bg-white  dark:bg-gray-900">
//             <div className="flex flex-col gap-6 rounded-2xl  bg-transparent p-8 shadow-2xl">
//                 <div className="text-center">
//                     <h2 className="mb-2 text-2xl font-bold text-accent">Espace Administrateur</h2>
//                     <p className="text-sm text-gray-400">Accès réservé au personnel autorisé</p>
//                 </div>
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
                
//                 { errorMessage && (
//                     <div className="flex w-full items-center justify-center">
//                         <Alert
//                             severity="error"
//                             className="w-full items-center justify-center bg-[#FDEDED] dark:bg-red-400 dark:bg-opacity-15 dark:text-white dark:text-opacity-100"
//                         >
//                             {errorMessage}
//                         </Alert>
//                     </div>
//                 )}
//                 <form
//                     onSubmit={handleSubmit}
//                     className="flex w-80 flex-col gap-4"
//                 >
//                     <div className="flex flex-col items-center text-white justify-center">
//                         <InputValidate
//                             IconComponent={MdOutlineEmail}
//                             type="email"
//                             // largeur="2/3"
//                             placeholder="Entrez votre Email..."
//                             title="Email Utilisateur"
//                             value={data.email}
//                             onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                             error={!!errors.email}
//                             helperText={errors.email}
//                             ClassIcone="text-accent"
//                         />
//                         <InputValidate
//                             IconComponent={RiKeyFill}
//                             type="password"
//                             // largeur="2/3"
//                             placeholder="Créer votre mot de passe..."
//                             title="Mot de Passe"
//                             value={data.password}
//                             onChange={(val) => handleChange({ target: { name: "password", value: val } })}
//                             error={!!errors.password}
//                             helperText={errors.password}
//                             ClassIcone="text-accent"
//                         />
//                     </div>
//                     <div className="mb-4 flex items-center justify-center">
//                             <button
//                                 type="submit"
//                                 className="btn btn-accent btn-outline btn-wide"
//                             >
//                                  {loading ? ( 
//                                     <div className="flex flex-row justify-center items-center gap-2">
//                                         <span className="loading loading-spinner text-accent"></span>
//                                         <span>Connexion en cours...</span></div>
//                                  ) : "Se Connecter à mon compte"}
                               
//                             </button>
//                         </div>
//                     {/* <button
//                         className="btn btn-accent mt-4 w-full"
//                         type="submit"
//                         disabled={loading}
//                     >
//                         {loading ? (
//                             <div className="flex items-center gap-2">
//                                 <span className="loading loading-spinner"></span>
//                                 <span>Authentification...</span>
//                             </div>
//                         ) : (
//                             "Accéder au panel admin"
//                         )}
//                     </button> */}
//                 </form>

//                 <div className="border-t border-slate-700 pt-4 text-center">
//                     <a
//                         href="/"
//                         className="text-sm text-gray-400 transition-colors hover:text-slate-900 dark:hover:text-white"
//                     >
//                         ← Retour à l'accueil public
//                     </a>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AdminLoginPage;
