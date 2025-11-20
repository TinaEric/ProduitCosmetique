import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { FaUserCheck, FaUserLock } from "react-icons/fa6";
import { InputValidate } from "@/components/InputValidate";
import { useAuth } from "../../../hook/useAuth";
import { LoginVerifier,NewClient} from '@/services/ClientService'
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
import { RiKeyFill } from "react-icons/ri";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
import ProfilUser from "@/components/ProfilUser";
import { Avatar, FormHelperText, Stack } from "@mui/material";
import { Badge } from "lucide-react";

const FormInfosPersonnel = ({ initialData, onSubmitSuccess }) => {
    const { user, login, logout ,register} = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageError, setMessageError] = useState(null)
    const [IsProfil, setIsProfil] = useState(false)
    const [profil, setProfil] = useState({});
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [isNonInscrit, setIsNonInscrit] = useState(false);
    const [data, setData] = useState(initialData);
    const [donnes, setDonnes] = useState({});
    const [errors, setErrors] = useState({});
    const [isDark , setIsDark] = useState(
        (localStorage.getItem("theme") === "dark") ? true : false
    )

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const isUserConnected = user && (user.emailUsers || user.email);
    
 

    useEffect(() => {
        if (isUserConnected && user.client) {
            setProfil({
                nom: user.client.nomClient,
                prenom: user.client.prenomClient,
                email: user.emailUsers,
                telephone : user.client.telephoneClient
            });
            setIsProfil(true);
        }
    }, [isUserConnected, user]);

    useEffect(() => {
        if (isUserConnected) {
            setIsNonInscrit(false);
        }
    }, [isUserConnected]);

    const ContinuerAvecCeCompte = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userData = {
          nom: user.client.nomClient,
          email: user.emailUsers,
          refClient:user.client.refClient,
          nomClient: user.client.nomClient,
          prenomClient: user.client.prenomClient,
          telephoneClient: user.client.telephoneClient,
          dateNaissance: user.client.dateNaissance,
          civiliteClient: user.client.civiliteClient
        };
        onSubmitSuccess(userData);
    }

    const CreerNouveauCompte = () => {
        // Déconnecter l'utilisateur pour créer un nouveau compte
        logout();
        setIsProfil(false);
        setIsNonInscrit(false);
        setData({});
        setErrors({});
    }
    
    useEffect(() => {
        if (isDark) {
            setIsDark(true)
        } else {
            setIsDark(false)
        }
    }, [isDark]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isNonInscrit) {
            setDonnes((prevData) => ({ ...prevData, [name]: value }));
            setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        } else {
            setData((prevData) => ({ ...prevData, [name]: value }));
            setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        }
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        if (isNonInscrit) {
            if (!donnes.passwordUser || donnes.passwordUser.trim() === "") {
                tempErrors.passwordUser = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
                isValid = false;
            }
            if (!donnes.emailUser || !/\S+@\S+\.\S+/.test(donnes.emailUser)) {
                tempErrors.emailUser = "Une adresse email valide est requise.";
                isValid = false;
            }
        } else {
            if (!data.civiliteClient) {
                tempErrors.civiliteClient = "la civilité est requise,  Veuillez choisir un civilité.";
                isValid = false;
            }
            if (!data.dateNaissance) {
                tempErrors.dateNaissance = "veuiller choisir votre date de naissance";
                isValid = false;
            }
            if (!data.nomClient || data.nomClient.trim() === "") {
                tempErrors.nomClient = "Le nom du client vide n'est pas autorisé,ce champ est requis.";
                isValid = false;
            }
            if (!data.prenomClient || data.prenomClient.trim() === "") {
                tempErrors.prenomClient = "Le prenom du client vide n'est pas autorisé,ce champ est requis.";
                isValid = false;
            }
            if (!isUserConnected && (!data.password || data.password.trim() === "")) {
                tempErrors.password = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
                isValid = false;
            }
            if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
                tempErrors.email = "Une adresse email valide est requise.";
                isValid = false;
            }
            if (!data.telephoneClient || data.telephoneClient.trim() === "") {
                tempErrors.telephoneClient = "Numéro téléphone vide n'est pas autorisé,ce champ est requis.";
                isValid = false;
            } else if (!/\d+$/.test(data.telephoneClient) || data.telephoneClient.length > 10) {
                tempErrors.telephoneClient = "Numéro téléphone n'est pas valide, verifier bien votre numéro";
                isValid = false;
            }
        }
        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessageError(null)
        if (validate()) {
            if (isNonInscrit) {
                const data = {
                    'email': donnes.emailUser,
                    'role' : 'ROLE_USER',
                    'password': donnes.passwordUser
                }
                setLoading(true);
                try {
                    const response = await LoginVerifier(data)
                    if (response.data){
                        const infos =  await login(donnes.emailUser, donnes.passwordUser);
                        if (infos.success) {
                            if (infos.user.roleUsers === "ROLE_USER") {
                                setProfil({
                                    nom: infos.user.client.nomClient,
                                    prenom: infos.user.client.prenomClient,
                                    email: infos.user.emailUsers
                                })
                                setIsProfil(true)
                                setMessage({
                                    ouvre: true,
                                    texte: "Connexion réussie.",
                                    statut: "success",
                                });
                                setOpen(true);
                            }
                        } else {
                            setMessageError(infos.error || "Erreur de connexion.")
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
                    } else {
                        setMessageError(response.error)
                        setMessage({
                            ouvre: true,
                            texte: "Nous ne pouvons pas trouvé votre compte!",
                            statut: "error",
                        });
                        setOpen(true);
                    }
                    setLoading(false);
                } catch (error) {
                    console.log("Erreur de connexion:", error);
                    setMessageError(`Échec de la connexion. Vérifiez vos identifiants.`)
                    setMessage({
                        ouvre: true,
                        texte: `Échec de la connexion. Vérifiez vos identifiants.`, 
                        statut: "error",
                    });
                    setOpen(true);
                    setLoading(false);
                }
            } else {
                const dataToSend = {
                    ...data,
                    nom: data.nomClient,
                    email: data.email,
                    prenom: data.prenomClient
                };
                const NewUser = {
                    nom : dataToSend.nomClient,
                    prenom : dataToSend.prenomClient,
                    telephone : dataToSend.telephoneClient,
                    civilite : dataToSend.civiliteClient,
                    dateNaissance : dataToSend.dateNaissance,
                    email : dataToSend.email,
                    password : dataToSend.password
                }
                console.log("Nouvelle User: ",NewUser)
                setLoading(true);
                const dataVerifier = {
                    'email': NewUser.email,
                    'role' : 'ROLE_USER',
                    'password': NewUser.password
                }
                try {
                    const response = await LoginVerifier(dataVerifier)
                    if (!response.data){
                        const enregistre = await register(NewUser)
                        if (enregistre.success) {
                             
                             setProfil({
                                nom: enregistre.user.client.nomClient,
                                prenom: enregistre.user.client.prenomClient,
                                email: enregistre.user.emailUsers
                            })
                            setIsProfil(true)
                                setMessage({
                                    ouvre: true,
                                    texte: "La création de votre Compte est réussie.",
                                    statut: "success",
                                });
                                setOpen(true);
                        } else {
                            setMessageError(enregistre.error || "Erreur de connexion.")
                            setMessage({
                                ouvre: true,
                                texte: enregistre.error || "Erreur de connexion.",
                                statut: "error",
                            });
                            setOpen(true);
                            console.log(infos.error);
                            setLoading(false);
                        }
                           
                    } else {
                        setMessageError("Votre email est utilisé par un autre compte")
                        setMessage({
                            ouvre: true,
                            texte: "Votre email est utilisé par un autre compte",
                            statut: "error",
                        });
                        setOpen(true);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Erreur de connexion:", error);
                    setMessageError(`Échec de la connexion. Vérifiez vos identifiants.`)
                    setMessage({
                        ouvre: true,
                        texte: `Échec de la connexion. Vérifiez vos identifiants.`, 
                        statut: "error",
                    });
                    setOpen(true);
                    setLoading(false);
                }
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
        <div>
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
           
            <div className="bg-transparent">            
                {IsProfil ? (
                    <div className="flex px-1 flex-col space-y-6 justify-center items-center w-full"> 
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 text-xl mb-4">
                                <MdVerifiedUser className="text-accent" />
                                <span className="font-gothic text-black opacity-70 dark:text-white">
                                    {isUserConnected ? "Votre profil" : "Connexion réussie !"}
                                </span>
                            </div>
                            {!isUserConnected && (
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Vous êtes connecté avec le compte suivant :
                                </p>
                            )}
                        </div>
                        
                        <ProfilUser user={profil} />
                        <div className="flex justify-center items-center  w-full ">
                            <button 
                                className="btn btn-accent btn-outline btn-wide"
                                onClick={ContinuerAvecCeCompte}>
                                 Continuer avec ce compte
                            </button>
                        </div>

                        <div className="w-full mt-6">
                            <div className="flex w-full items-center justify-center">
                                <div className="divider w-[300px]">Ou</div>
                            </div>
                            <div className="flex items-center justify-center text-lg mt-4">
                                <button 
                                    onClick={CreerNouveauCompte}
                                    className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
                                >
                                    Créer un nouveau compte
                                </button>
                            </div>
                        </div>
                    </div>
                ) : isNonInscrit ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col px-1"> 
                            <div className="flex items-center justify-center gap-4 text-xl">
                                <MdVerifiedUser className="text-accent" />
                                <span className="font-gothic text-black opacity-70 dark:text-white">Connecter à votre compte</span>
                            </div>
                            {messageError && (
                                <div className="flex items-center justify-center w-full">
                                    <Alert severity="error" 
                                        className="w-full bg-[#FDEDED] dark:bg-red-400 justify-center items-center dark:text-white dark:text-opacity-100 dark:bg-opacity-15">
                                        {messageError}
                                    </Alert>
                                </div>
                            )}
                            <div className="mb-5 flex flex-col items-center justify-center">
                                <InputValidate
                                    IconComponent={MdOutlineEmail}
                                    type="email"
                                    largeur="2/3"
                                    placeholder="Entrez votre Email..."
                                    title="Email Utilisateur"
                                    value={donnes.emailUser}
                                    onChange={(val) => handleChange({ target: { name: "emailUser", value: val } })}
                                    error={!!errors.emailUser}
                                    helperText={errors.emailUser}
                                    ClassIcone="text-accent"
                                    margY="my-4"
                                />
                                <InputValidate
                                    IconComponent={RiKeyFill}
                                    type="password"
                                    largeur="2/3"
                                    placeholder="Entrez votre mot de passe..."
                                    title="Mot de Passe"
                                    value={donnes.passwordUser}
                                    onChange={(val) => handleChange({ target: { name: "passwordUser", value: val } })}
                                    error={!!errors.passwordUser}
                                    helperText={errors.passwordUser}
                                    ClassIcone="text-accent"
                                    margY="my-4"
                                />
                            </div>
                            <div className="mb-4 flex items-center justify-center">
                                <button
                                    type="submit"
                                    className="btn btn-accent btn-outline btn-wide">
                                    {loading ? ( 
                                        <div className="flex flex-row justify-center items-center gap-2">
                                            <span className="loading loading-spinner text-accent"></span>
                                            <span>Connexion en cours...</span>
                                        </div>
                                    ) : "Se Connecter à mon compte"}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col px-1">
                            <div className="flex items-center justify-center gap-4 text-xl">
                                <MdVerifiedUser className="text-accent" />
                                <span className="font-gothic text-black opacity-70 dark:text-white">
                                    Information sur votre Profil
                                </span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <div className="mt-4 w-2/3 items-start">
                                    <FormControl error={!!errors.civiliteClient}>
                                        <FormLabel
                                            id="choix-label"
                                            className="text-gray-600 dark:text-slate-300">
                                            Civilité du Client
                                        </FormLabel>
                                        <RadioGroup
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="civiliteClient"
                                            value={data.civiliteClient || ""}
                                            className="gap-5 text-gray-600 dark:text-slate-300"
                                            onChange={handleChange}>
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
                                        <FormHelperText>{errors.civiliteClient}</FormHelperText>
                                    </FormControl>
                                </div>
                                <InputValidate
                                    IconComponent={FaUserCheck}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Entrez votre nom...."
                                    title="Nom Client"
                                    value={data.nomClient || ""}
                                    onChange={(val) => handleChange({ target: { name: "nomClient", value: val } })}
                                    error={!!errors.nomClient}
                                    helperText={errors.nomClient}
                                    ClassIcone="text-accent"
                                    margY="my-4"
                                />
                                <InputValidate
                                    IconComponent={FaUserLock}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Entrez votre prenon..."
                                    title="Prenon Client"
                                    value={data.prenomClient || ""}
                                    onChange={(val) => handleChange({ target: { name: "prenomClient", value: val } })}
                                    error={!!errors.prenomClient}
                                    helperText={errors.prenomClient}
                                    ClassIcone="text-accent"
                                    margY="my-4"
                                />
                                <InputValidate
                                    IconComponent={DevicePhoneMobileIcon}
                                    type="text"
                                    largeur="2/3"
                                    placeholder="Entrez votre numéro téléphone..."
                                    title="Téléphone Client"
                                    value={data.telephoneClient || ""}
                                    onChange={(val) => handleChange({ target: { name: "telephoneClient", value: val } })}
                                    error={!!errors.telephoneClient}
                                    helperText={errors.telephoneClient}
                                    ClassIcone="text-accent"
                                    margY="my-4"
                                />
                                <InputValidate
                                    IconComponent={CalendarDateRangeIcon}
                                    type="date"
                                    largeur="2/3"
                                    placeholder="Entrez votre date de naissance..."
                                    title="Date de naissance"
                                    value={data.dateNaissance || ""}
                                    onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
                                    error={!!errors.dateNaissance}
                                    helperText={errors.dateNaissance}
                                    ClassIcone="text-accent"
                                    margY="mt-4 mb-8"
                                />
                            </div>
                            <div className="flex flex-col w-full px-1"> 
                                <div className="flex items-center justify-center gap-4 text-xl">
                                    <MdVerifiedUser className="text-accent" />
                                    <span className="font-gothic text-black opacity-70 dark:text-white">
                                        Information sur votre compte
                                    </span>
                                </div>
                                
                                <div className="mb-5 flex flex-col items-center w-full justify-center">
                                    <InputValidate
                                        IconComponent={MdOutlineEmail}
                                        type="email"
                                        largeur="2/3"
                                        placeholder="Entrez votre Email..."
                                        title="Email Utilisateur"
                                        value={data.email || ""}
                                        onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        ClassIcone="text-accent"
                                        margY="my-4"
                                    />
                                    <InputValidate
                                        IconComponent={RiKeyFill}
                                        type="password"
                                        largeur="2/3"
                                        placeholder="Créez votre mot de passe..."
                                        title="Mot de Passe"
                                        value={data.password || ""}
                                        onChange={(val) => handleChange({ target: { name: "password", value: val } })}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        ClassIcone="text-accent"
                                        margY="my-4"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4 flex items-center justify-center">
                            <button
                                type="submit"
                                className="btn btn-accent btn-outline btn-wide">
                                
                                {loading ? ( 
                                        <div className="flex flex-row justify-center items-center gap-2">
                                            <span className="loading loading-spinner text-accent"></span>
                                            <span>Connexion en cours...</span>
                                        </div>
                                    ) : "S'inscrire à nouveau compte"}
                            </button>
                        </div>
                    </form>
                )}
                 
                {!isUserConnected && !IsProfil && (
                    <>
                        <div className=" flex w-full items-center justify-center">
                            <div className="divider w-[300px]">Ou</div>
                        </div>
                        <div className="flex items-center justify-center text-lg">
                            {isNonInscrit ? (
                                <label
                                    onClick={() => {
                                        setIsNonInscrit(false);
                                        setDonnes({});
                                        setErrors({})
                                    }}
                                    className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
                                >
                                    Creer un nouveau compte ?
                                </label>
                            ) : (
                                <label
                                    onClick={() => {
                                        setIsNonInscrit(true);
                                        setData({});
                                        setErrors({})
                                    }}
                                    className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
                                >
                                    Avez vous déjà un compte ?
                                </label>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default FormInfosPersonnel;





// import React, { useEffect, useState } from "react";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { FaUserCheck, FaUserLock } from "react-icons/fa6";
// import { InputValidate } from "@/components/InputValidate";
// import { useAuth } from "../../../hook/useAuth";
// import { LoginVerifier} from '@/services/ClientService'
// import { FaUserCircle } from "react-icons/fa";
// import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
// import { RiKeyFill } from "react-icons/ri";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
// import ProfilUser from "@/components/ProfilUser";
// import { Avatar, FormHelperText, Stack } from "@mui/material";
// import { Badge } from "lucide-react";

// const FormInfosPersonnel = ({ initialData, onSubmitSuccess }) => {
//     const { user, login, logout } = useAuth();
//     const [open, setOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [messageError, setMessageError] = useState(false)
//     const [IsProfil, setIsProfil] = useState(false)
//     const [profil, setProfil] = useState({});
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });
//     const [isNonInscrit, setIsNonInscrit] = useState(false);
//     const [data, setData] = useState(initialData);
//     const [donnes, setDonnes] = useState({});
//     const [errors, setErrors] = useState({});
//     const [isDark , setIsDark] = useState(
//         (localStorage.getItem("theme") === "dark") ? true : false
//     )

//     useEffect(() => {
//         setData(initialData);
//     }, [initialData]);

//     const isUserConnected = user && (user.emailUsers || user.email);
    
//     useEffect(() => {
//         if (isUserConnected) {
//             setIsNonInscrit(false);
//         }
//     }, [isUserConnected]);

//     const Continuer = () => {
//         const user = JSON.parse(localStorage.getItem('user'));
//         const userData = {
//           nom: user.client.nomClient,
//           email: user.emailUsers,
//           nomClient: user.client.nomClient,
//           prenomClient: user.client.prenomClient,
//           telephoneClient: user.client.telephoneClient,
//           dateNaissance: user.client.dateNaissance,
//           civiliteClient: user.client.civiliteClient
//         };
//         onSubmitSuccess(userData);
//         setIsProfil(false);
//     }
    
//     useEffect(() => {
//         if (isDark) {
//             setIsDark(true)
//         } else {
//             setIsDark(false)
//         }
//     }, [isDark]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         if (isNonInscrit) {
//             setDonnes((prevData) => ({ ...prevData, [name]: value }));
//             setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//         } else {
//             setData((prevData) => ({ ...prevData, [name]: value }));
//             setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//         }
//     };

//     const validate = () => {
//         let tempErrors = {};
//         let isValid = true;

//         if (isNonInscrit) {
//             if (!donnes.passwordUser || donnes.passwordUser.trim() === "") {
//                 tempErrors.passwordUser = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!donnes.emailUser || !/\S+@\S+\.\S+/.test(donnes.emailUser)) {
//                 tempErrors.emailUser = "Une adresse email valide est requise.";
//                 isValid = false;
//             }
//         } else {
//             if (!data.civiliteClient) {
//                 tempErrors.civiliteClient = "la civilité est requise,  Veuillez choisir un civilité.";
//                 isValid = false;
//             }
//             if (!data.dateNaissance) {
//                 tempErrors.dateNaissance = "veuiller choisir votre date de naissance";
//                 isValid = false;
//             }
//             if (!data.nomClient || data.nomClient.trim() === "") {
//                 tempErrors.nomClient = "Le nom du client vide n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!data.prenomClient || data.prenomClient.trim() === "") {
//                 tempErrors.prenomClient = "Le prenom du client vide n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!isUserConnected && (!data.password || data.password.trim() === "")) {
//                 tempErrors.password = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
//                 tempErrors.email = "Une adresse email valide est requise.";
//                 isValid = false;
//             }
//             if (!data.telephoneClient || data.telephoneClient.trim() === "") {
//                 tempErrors.telephoneClient = "Numéro téléphone vide n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             } else if (!/\d+$/.test(data.telephoneClient) || data.telephoneClient.length > 10) {
//                 tempErrors.telephoneClient = "Numéro téléphone n'est pas valide, verifier bien votre numéro";
//                 isValid = false;
//             }
//         }
//         setErrors(tempErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessageError(false)
//         if (validate()) {
//             if (isNonInscrit) {
//                 const data = {
//                     'email': donnes.emailUser,
//                     'role' : 'ROLE_USER'
//                 }
//                 setLoading(true);
//                 try {
//                     const response = await LoginVerifier(data)
//                     if (response.data){
//                         const infos =  await login(donnes.emailUser, donnes.passwordUser);
//                         if (infos.success) {
//                             if (infos.user.roleUsers === "ROLE_USER") {
//                                 setProfil({
//                                     nom: infos.user.client.nomClient,
//                                     prenom: infos.user.client.prenomClient,
//                                     email: infos.user.emailUsers,
//                                     telephone: infos.user.client.telephoneClient
//                                 })
//                                 setIsProfil(true)
                                
//                                 setMessage({
//                                     ouvre: true,
//                                     texte: "Connexion réussie.",
//                                     statut: "success",
//                                 });
//                                 setOpen(true);
//                             }
//                         } else {
//                             setMessage({
//                                 ouvre: true,
//                                 texte: infos.error || "Erreur de connexion.",
//                                 statut: "error",
//                             });
//                             setOpen(true);
//                             console.log(infos.error);
//                             setLoading(false);
//                         }
//                         setDonnes({});
//                     } else {
//                         setMessageError(true)
//                         setMessage({
//                             ouvre: true,
//                             texte: "Nous ne pouvons pas trouvé votre compte!",
//                             statut: "error",
//                         });
//                         setOpen(true);
//                     }
//                     setLoading(false);
//                 } catch (error) {
//                     console.error("Erreur de connexion:", error);
//                     setMessage({
//                         ouvre: true,
//                         texte: `Échec de la connexion. Vérifiez vos identifiants.`, 
//                         statut: "error",
//                     });
//                     setOpen(true);
//                     setLoading(false);
//                 }
//             } else {
//                 const dataToSend = {
//                     ...data,
//                     nom: data.nomClient,
//                     email: data.email,
//                     prenom: data.prenomClient
//                 };
//                 onSubmitSuccess(dataToSend);
//             }
//         }
//     };

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };

//     return (
//         <div>
//             <div>
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
           
//             <div className="bg-transparent">
               
//                 {IsProfil ? (
//                     <div className="flex px-1 flex-col space-y-3 justify-center items-center w-full"> 
//                         <ProfilUser user={profil} />
//                         <button className="btn btn-outline btn-accent btn-wide" onClick={Continuer}>
//                             Continuer avec mon compte
//                         </button>
//                     </div>
//                 ) : isNonInscrit ? (
//                     <form onSubmit={handleSubmit}>
//                         <div className="flex flex-col px-1"> 
//                             <div className="flex items-center justify-center gap-4 text-xl">
//                                 <MdVerifiedUser className="text-accent" />
//                                 <span className="font-gothic text-black opacity-70 dark:text-white">Connecter à votre compte</span>
//                             </div>
//                             {messageError && (
//                                 <div className="flex items-center justify-center w-full">
//                                     <Alert severity="error" 
//                                         className="w-full bg-[#FDEDED] dark:bg-red-400 justify-center items-center dark:text-white dark:text-opacity-100 dark:bg-opacity-15">
//                                         Nous ne pouvons pas trouvé votre compte!
//                                     </Alert>
//                                 </div>
//                             )}
//                             <div className="mb-5 flex flex-col items-center justify-center">
//                                 <InputValidate
//                                     IconComponent={MdOutlineEmail}
//                                     type="email"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre Email..."
//                                     title="Email Utilisateur"
//                                     value={donnes.emailUser}
//                                     onChange={(val) => handleChange({ target: { name: "emailUser", value: val } })}
//                                     error={!!errors.emailUser}
//                                     helperText={errors.emailUser}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={RiKeyFill}
//                                     type="password"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre mot de passe..."
//                                     title="Mot de Passe"
//                                     value={donnes.passwordUser}
//                                     onChange={(val) => handleChange({ target: { name: "passwordUser", value: val } })}
//                                     error={!!errors.passwordUser}
//                                     helperText={errors.passwordUser}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                             </div>
//                             <div className="mb-4 flex items-center justify-center">
//                                 <button
//                                     type="submit"
//                                     className="btn btn-accent btn-outline btn-wide">
//                                     {loading ? ( 
//                                         <div className="flex flex-row justify-center items-center gap-2">
//                                             <span className="loading loading-spinner text-accent"></span>
//                                             <span>Connexion en cours...</span>
//                                         </div>
//                                     ) : "Se Connecter à mon compte"}
//                                 </button>
//                             </div>
//                         </div>
//                     </form>
//                 ) : (
//                     // Formulaire d'inscription (nouveau compte)
//                     <form onSubmit={handleSubmit}>
//                         <div className="flex flex-col px-1">
//                             <div className="flex items-center justify-center gap-4 text-xl">
//                                 <MdVerifiedUser className="text-accent" />
//                                 <span className="font-gothic text-black opacity-70 dark:text-white">
//                                     {isUserConnected ? "Vos informations personnelles" : "Information sur votre Profil"}
//                                 </span>
//                             </div>
//                             <div className="flex flex-col items-center justify-center">
//                                 <div className="mt-4 w-2/3 items-start">
//                                     <FormControl error={!!errors.civiliteClient}>
//                                         <FormLabel
//                                             id="choix-label"
//                                             className="text-gray-600 dark:text-slate-300">
//                                             Civilité du Client
//                                         </FormLabel>
//                                         <RadioGroup
//                                             row
//                                             aria-labelledby="demo-row-radio-buttons-group-label"
//                                             name="civiliteClient"
//                                             value={data.civiliteClient || ""}
//                                             className="gap-5 text-gray-600 dark:text-slate-300"
//                                             onChange={handleChange}>
//                                             <FormControlLabel
//                                                 value="Mr"
//                                                 control={<Radio />}
//                                                 label="Mr"
//                                             />
//                                             <FormControlLabel
//                                                 value="Mme"
//                                                 control={<Radio />}
//                                                 label="Mme"
//                                             />
//                                             <FormControlLabel
//                                                 value="Mlle"
//                                                 control={<Radio />}
//                                                 label="Mlle"
//                                             />
//                                         </RadioGroup>
//                                         <FormHelperText>{errors.civiliteClient}</FormHelperText>
//                                     </FormControl>
//                                 </div>
//                                 <InputValidate
//                                     IconComponent={FaUserCheck}
//                                     type="text"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre nom...."
//                                     title="Nom Client"
//                                     value={data.nomClient || ""}
//                                     onChange={(val) => handleChange({ target: { name: "nomClient", value: val } })}
//                                     error={!!errors.nomClient}
//                                     helperText={errors.nomClient}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={FaUserLock}
//                                     type="text"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre prenon..."
//                                     title="Prenon Client"
//                                     value={data.prenomClient || ""}
//                                     onChange={(val) => handleChange({ target: { name: "prenomClient", value: val } })}
//                                     error={!!errors.prenomClient}
//                                     helperText={errors.prenomClient}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={DevicePhoneMobileIcon}
//                                     type="text"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre numéro téléphone..."
//                                     title="Téléphone Client"
//                                     value={data.telephoneClient || ""}
//                                     onChange={(val) => handleChange({ target: { name: "telephoneClient", value: val } })}
//                                     error={!!errors.telephoneClient}
//                                     helperText={errors.telephoneClient}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={CalendarDateRangeIcon}
//                                     type="date"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre date de naissance..."
//                                     title="Date de naissance"
//                                     value={data.dateNaissance || ""}
//                                     onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
//                                     error={!!errors.dateNaissance}
//                                     helperText={errors.dateNaissance}
//                                     ClassIcone="text-accent"
//                                     margY="mt-4 mb-8"
//                                 />
//                             </div>
//                             <div className="flex flex-col w-full px-1"> 
//                                 <div className="flex items-center justify-center gap-4 text-xl">
//                                     <MdVerifiedUser className="text-accent" />
//                                     <span className="font-gothic text-black opacity-70 dark:text-white">
//                                         {isUserConnected ? "Votre compte" : "Information sur votre compte"}
//                                     </span>
//                                 </div>
                                
//                                 <div className="mb-5 flex flex-col items-center w-full justify-center">
//                                     <InputValidate
//                                         IconComponent={MdOutlineEmail}
//                                         type="email"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre Email..."
//                                         title="Email Utilisateur"
//                                         value={data.email || ""}
//                                         onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                                         error={!!errors.email}
//                                         helperText={errors.email}
//                                         ClassIcone="text-accent"
//                                         margY="my-4"
//                                     />
//                                     {!isUserConnected && (
//                                         <InputValidate
//                                             IconComponent={RiKeyFill}
//                                             type="password"
//                                             largeur="2/3"
//                                             placeholder="Entrez votre mot de passe..."
//                                             title="Mot de Passe"
//                                             value={data.password || ""}
//                                             onChange={(val) => handleChange({ target: { name: "password", value: val } })}
//                                             error={!!errors.password}
//                                             helperText={errors.password}
//                                             ClassIcone="text-accent"
//                                             margY="my-4"
//                                         />
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="mb-4 flex items-center justify-center">
//                             <button
//                                 type="submit"
//                                 className="btn btn-accent btn-outline btn-wide">
//                                 {isUserConnected ? "Continuer avec mes informations" : "S'inscrire à nouveau compte"}
//                             </button>
//                         </div>
//                     </form>
//                 )}
                 
//                 {/* Afficher la section "Ou" seulement si l'utilisateur n'est pas connecté ET on n'est pas en mode profil */}
//                 {!isUserConnected && !IsProfil && (
//                     <>
//                         <div className=" flex w-full items-center justify-center">
//                             <div className="divider w-[300px]">Ou</div>
//                         </div>
//                         <div className="flex items-center justify-center text-lg">
//                             {isNonInscrit ? (
//                                 <label
//                                     onClick={() => {
//                                         setIsNonInscrit(false);
//                                         setDonnes({});
//                                         setErrors({})
//                                     }}
//                                     className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
//                                 >
//                                     Creer un nouveau compte ?
//                                 </label>
//                             ) : (
//                                 <label
//                                     onClick={() => {
//                                         setIsNonInscrit(true);
//                                         setData({});
//                                         setErrors({})
//                                     }}
//                                     className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
//                                 >
//                                     Avez vous déjà un compte ?
//                                 </label>
//                             )}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };
// export default FormInfosPersonnel;


// import React, { useEffect, useState } from "react";
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { FaUserCheck, FaUserLock } from "react-icons/fa6";
// import { InputValidate } from "@/components/InputValidate";
// import { useAuth } from "../../../hook/useAuth";
// import { LoginVerifier} from '@/services/ClientService'
// import { FaUserCircle } from "react-icons/fa";
// import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
// import { RiKeyFill } from "react-icons/ri";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
// import ProfilUser from "@/components/ProfilUser";
// import { Avatar, FormHelperText, Stack } from "@mui/material";
// import { Badge } from "lucide-react";

// const FormInfosPersonnel = ({ initialData, onSubmitSuccess }) => {
//     const { user, login, logout } = useAuth();
//     const [open, setOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [messageError, setMessageError] = useState(false)
//     const [IsProfil, setIsProfil] = useState(false)
//     const [profil, setProfil] = useState({});
//     const [message, setMessage] = useState({
//         ouvre: false,
//         texte: "vide",
//         statut: "success",
//     });
//     const [isNonInscrit, setIsNonInscrit] = useState(false);
//     const [data, setData] = useState(initialData);
//     const [donnes, setDonnes] = useState({});
//     const [errors, setErrors] = useState({});
//     const [isDark , setIsDark] = useState(
//         (localStorage.getItem("theme") === "dark") ? true : false
//     )

//     useEffect(() => {
//         setData(initialData);
//     }, [initialData]);

//     const isUserConnected = user && (user.emailUsers || user.email);
    
//     useEffect(() => {
//         if (isUserConnected) {
//             setIsNonInscrit(false);
//         }
//     }, [isUserConnected]);

//     const Continuer = () => {
//         const user = JSON.parse(localStorage.getItem('user'));
//         const userData = {
//           nom: user.client.nomClient,
//           email: user.emailUsers,
//           nomClient: user.client.nomClient,
//           prenomClient: user.client.prenomClient,
//           telephoneClient: user.client.telephoneClient,
//           dateNaissance: user.client.dateNaissance,
//           civiliteClient: user.client.civiliteClient
//         };
//         onSubmitSuccess(userData);
//         setIsProfil(false);
//       }
    
//     useEffect(() => {
//         if (isDark) {
//             setIsDark(true)
//         } else {
//             setIsDark(false)
//         }
//       }, [isDark]);


      
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         if (isNonInscrit) {
//             setDonnes((prevData) => ({ ...prevData, [name]: value }));
//             setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//         } else {
//             setData((prevData) => ({ ...prevData, [name]: value }));
//             setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
//         }
//     };

//     const validate = () => {
//         let tempErrors = {};
//         let isValid = true;

//         if (isNonInscrit) {
//             if (!donnes.passwordUser || donnes.passwordUser.trim() === "") {
//                 tempErrors.passwordUser = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!donnes.emailUser || !/\S+@\S+\.\S+/.test(donnes.emailUser)) {
//                 tempErrors.emailUser = "Une adresse email valide est requise.";
//                 isValid = false;
//             }
//         } else {
//             if (!data.civiliteClient) {
//                 tempErrors.civiliteClient = "la civilité est requise,  Veuillez choisir un civilité.";
//                 isValid = false;
//             }
//             if (!data.dateNaissance) {
//                 tempErrors.dateNaissance = "veuiller choisir votre date de naissance";
//                 isValid = false;
//             }
//             if (!data.nomClient || data.nomClient.trim() === "") {
//                 tempErrors.nomClient = "Le nom du client vide n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!data.prenomClient || data.prenomClient.trim() === "") {
//                 tempErrors.prenomClient = "Le prenom du client vide n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!isUserConnected && (!data.password || data.password.trim() === "")) {
//                 tempErrors.password = "Le mot de passe mal formé n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             }
//             if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
//                 tempErrors.email = "Une adresse email valide est requise.";
//                 isValid = false;
//             }
//             if (!data.telephoneClient || data.telephoneClient.trim() === "") {
//                 tempErrors.telephoneClient = "Numéro téléphone vide n'est pas autorisé,ce champ est requis.";
//                 isValid = false;
//             } else if (!/\d+$/.test(data.telephoneClient) || data.telephoneClient.length > 10) {
//                 tempErrors.telephoneClient = "Numéro téléphone n'est pas valide, verifier bien votre numéro";
//                 isValid = false;
//             }
//         }
//         setErrors(tempErrors);
//         return isValid;
//     };



//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessageError(false)
//         if (validate()) {
//             if (isNonInscrit) {
//                 const data = {
//                     'email': donnes.emailUser,
//                     'role' : 'ROLE_USER'
//                 }
//                 setLoading(true);
//                 try {
//                     const response = await LoginVerifier(data)
//                     if (response.data){
//                         const infos =  await login(donnes.emailUser, donnes.passwordUser);
//                         if (infos.success) {
//                             if (infos.user.roleUsers === "ROLE_USER") {
//                                 setProfil({
//                                     nom: infos.user.client.nomClient,
//                                     prenom: infos.user.client.prenomClient,
//                                     email: infos.user.emailUsers
//                                 })
//                                 setIsProfil(true)
//                             }
//                         } else {
//                             setMessage({
//                                 ouvre: true,
//                                 texte: infos.error || "Erreur de connexion.",
//                                 statut: "error",
//                             });
//                             setOpen(true);
//                             console.log(infos.error);
//                             setLoading(false);
//                         }
//                         setOpen(true);
//                         setDonnes({});
//                         console.log('OK :' ,response.message)
                        
//                         setMessage({
//                             ouvre: true,
//                             texte: "Connexion réussie.",
//                             statut: "success",
//                         });
//                         setOpen(true);
//                         setDonnes({});
//                     }else {
//                         setMessageError(true)
//                         setMessage({
//                             ouvre: true,
//                             texte: "Nous ne pouvons pas trouvé votre compte!",
//                             statut: "error",
//                         });
//                         setOpen(true);
//                     }
//                     setLoading(false);
//                 } catch (error) {
//                     console.error("Erreur de connexion:", error);
//                     setMessage({
//                         ouvre: true,
//                         texte: `Échec de la connexion. Vérifiez vos identifiants.`, 
//                         statut: "error",
//                     });
//                     setOpen(true);
//                     setLoading(false);
//                 }
//             } else {
//                 const dataToSend = {
//                     ...data,
//                     nom: data.nomClient,
//                     email: data.email,
//                     prenom: data.prenomClient
//                 };
//                 onSubmitSuccess(dataToSend);
//             }
//             // console.log("Donnee envoyer : ", data);
//         }
//     };

//     const handleClose = (event, reason) => {
//         if (reason === "clickaway") {
//             return;
//         }
//         setOpen(false);
//     };
//     return (
//         <div>
//             <div>
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
           
//             <div className="bg-transparent">
               
//                 {isNonInscrit ? (
//                     IsProfil ? (
//                         <div className="flex px-1 flex-col space-y-3 justify-center items-center w-full"> 
//                             <ProfilUser
//                                 user={profil}
//                              />
//                              <button className="btn btn-outline btn-accent btn-wide" onClick={Continuer}>Passer</button>
//                         </div>
//                     ) : (
//                         <form onSubmit={handleSubmit}>
//                             <div className="flex flex-col px-1"> 
//                                 <div className="flex items-center justify-center gap-4 text-xl">
//                                     <MdVerifiedUser className="text-accent" />
//                                     <span className="font-gothic text-black opacity-70 dark:text-white">Connecter à votre compte</span>
//                                 </div>
//                                 {messageError && (
//                                     <div className="flex items-center justify-center w-full">
//                                         <Alert severity="error" 
//                                             className="w-full bg-[#FDEDED] dark:bg-red-400 justify-center items-center dark:text-white dark:text-opacity-100 dark:bg-opacity-15">
//                                             Nous ne pouvons pas trouvé votre compte!
//                                         </Alert>
//                                     </div>
//                                 )}
//                                 <div className="mb-5 flex flex-col items-center justify-center">
//                                     <InputValidate
//                                         IconComponent={MdOutlineEmail}
//                                         type="email"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre Email..."
//                                         title="Email Utilisateur"
//                                         value={donnes.emailUser}
//                                         onChange={(val) => handleChange({ target: { name: "emailUser", value: val } })}
//                                         error={!!errors.emailUser}
//                                         helperText={errors.emailUser}
//                                         ClassIcone="text-accent"
//                                         margY="my-4"
//                                     />
//                                     <InputValidate
//                                         IconComponent={RiKeyFill}
//                                         type="password"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre mot de passe..."
//                                         title="Mot de Passe"
//                                         value={donnes.passwordUser}
//                                         onChange={(val) => handleChange({ target: { name: "passwordUser", value: val } })}
//                                         error={!!errors.passwordUser}
//                                         helperText={errors.passwordUser}
//                                         ClassIcone="text-accent"
//                                         margY="my-4"
//                                     />
//                                 </div>
//                                 <div className="mb-4 flex items-center justify-center">
//                                     <button
//                                         type="submit"
//                                         className="btn btn-accent btn-outline btn-wide">
//                                         {loading ? ( 
//                                             <div className="flex flex-row justify-center items-center gap-2">
//                                                 <span className="loading loading-spinner text-accent"></span>
//                                                 <span>Connexion en cours...</span>
//                                             </div>
//                                         ) : "Se Connecter à mon compte"}
//                                     </button>
//                                 </div>
//                             </div>
//                         </form>
//                     )
//                 ) : (
//                     <form onSubmit={handleSubmit}>
//                         <div className="flex flex-col px-1">
//                             <div className="flex items-center justify-center gap-4 text-xl">
//                                 <MdVerifiedUser className="text-accent" />
//                                 <span className="font-gothic text-black opacity-70 dark:text-white">Information sur votre Profil</span>
//                             </div>
//                             <div className="flex flex-col items-center justify-center">
//                                 <div className="mt-4 w-2/3 items-start">
//                                     <FormControl error={!!errors.civiliteClient}>
//                                         <FormLabel
//                                             id="choix-label"
//                                             className="text-gray-600 dark:text-slate-300">
//                                             Civilité du Client
//                                         </FormLabel>
//                                         <RadioGroup
//                                             row
//                                             aria-labelledby="demo-row-radio-buttons-group-label"
//                                             name="civiliteClient"
//                                             value={data.civiliteClient || ""}
//                                             className="gap-5 text-gray-600 dark:text-slate-300"
//                                             onChange={handleChange}>
//                                             <FormControlLabel
//                                                 value="Mr"
//                                                 control={<Radio />}
//                                                 label="Mr"
//                                             />
//                                             <FormControlLabel
//                                                 value="Mme"
//                                                 control={<Radio />}
//                                                 label="Mme"
//                                             />
//                                             <FormControlLabel
//                                                 value="Mlle"
//                                                 control={<Radio />}
//                                                 label="Mlle"
//                                             />
//                                         </RadioGroup>
//                                         <FormHelperText>{errors.civiliteClient}</FormHelperText>
//                                     </FormControl>
//                                 </div>
//                                 <InputValidate
//                                     IconComponent={FaUserCheck}
//                                     type="text"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre nom...."
//                                     title="Nom Client"
//                                     value={data.nomClient}
//                                     onChange={(val) => handleChange({ target: { name: "nomClient", value: val } })}
//                                     error={!!errors.nomClient}
//                                     helperText={errors.nomClient}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={FaUserLock}
//                                     type="text"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre prenon..."
//                                     title="Prenon Client"
//                                     value={data.prenomClient}
//                                     onChange={(val) => handleChange({ target: { name: "prenomClient", value: val } })}
//                                     error={!!errors.prenomClient}
//                                     helperText={errors.prenomClient}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={DevicePhoneMobileIcon}
//                                     type="text"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre numéro téléphone..."
//                                     title="Téléphone Client"
//                                     value={data.telephoneClient}
//                                     onChange={(val) => handleChange({ target: { name: "telephoneClient", value: val } })}
//                                     error={!!errors.telephoneClient}
//                                     helperText={errors.telephoneClient}
//                                     ClassIcone="text-accent"
//                                     margY="my-4"
//                                 />
//                                 <InputValidate
//                                     IconComponent={CalendarDateRangeIcon}
//                                     type="date"
//                                     largeur="2/3"
//                                     placeholder="Entrez votre date de naissance..."
//                                     title="Date de naissance"
//                                     value={data.dateNaissance}
//                                     onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
//                                     error={!!errors.dateNaissance}
//                                     helperText={errors.dateNaissance}
//                                     ClassIcone="text-accent"
//                                     margY="mt-4 mb-8"
//                                 />
//                                  </div>
//                                  <div className="flex flex-col w-full px-1"> 
//                                 <div className="flex items-center justify-center gap-4 text-xl">
//                                     <MdVerifiedUser className="text-accent" />
//                                     <span className="font-gothic text-black opacity-70 dark:text-white">
//                                         {isUserConnected ? "Votre compte" : "Information sur votre compte"}
//                                         </span>
//                                 </div>
                                
//                                 <div className="mb-5 flex flex-col items-center w-full justify-center">
//                                     <InputValidate
//                                         IconComponent={MdOutlineEmail}
//                                         type="email"
//                                         largeur="2/3"
//                                         placeholder="Entrez votre Email..."
//                                         title="Email Utilisateur"
//                                         value={data.email}
//                                         onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                                         error={!!errors.email}
//                                         helperText={errors.email}
//                                         ClassIcone="text-accent"
//                                         margY="my-4"
//                                     />
//                                     {!isUserConnected && (
//                                         <InputValidate
//                                             IconComponent={RiKeyFill}
//                                             type="password"
//                                             largeur="2/3"
//                                             placeholder="Entrez votre mot de passe..."
//                                             title="Mot de Passe"
//                                             value={data.password}
//                                             onChange={(val) => handleChange({ target: { name: "password", value: val } })}
//                                             error={!!errors.password}
//                                             helperText={errors.password}
//                                             ClassIcone="text-accent"
//                                             margY="my-4"
//                                         />
//                                     )}
                                   
//                                 </div>
                           
//                             </div>
//                         </div>
//                         <div className="mb-4 flex items-center justify-center">
//                             <button
//                                 type="submit"
//                                 className="btn btn-accent btn-outline btn-wide">
//                                  {isUserConnected ? "Continuer avec mes informations" : "S'inscrire à nouveau compte"}
//                             </button>
//                         </div>
//                     </form>
//                 )}
//                  {!isUserConnected && (
//                     <>
//                         <div className=" flex w-full items-center justify-center">
//                             <div className="divider w-[300px]">Ou</div>
//                         </div>
//                         <div className="flex items-center justify-center text-lg">
//                             {isNonInscrit ? (
//                                 <label
//                                     onClick={() => {
//                                         setIsNonInscrit(false);
//                                         setDonnes({});
//                                         setErrors({})
//                                     }}
//                                     className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
//                                 >
//                                     Creer un nouveau compte ?
//                                 </label>
//                             ) : (
//                                 <label
//                                     onClick={() => {
//                                         setIsNonInscrit(true);
//                                         setData({});
//                                         setErrors({})
//                                     }}
//                                     className="cursor-pointer text-slate-500 hover:underline dark:text-slate-400"
//                                 >
//                                     Avez vous déjà un compte ?
//                                 </label>
//                             )}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };
// export default FormInfosPersonnel;

