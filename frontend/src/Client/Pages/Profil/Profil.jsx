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

const Profil = () => {
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
    const [data, setData] = useState({});
    const [donnes, setDonnes] = useState({});
    const [errors, setErrors] = useState({});
    
        useEffect(() => {
            if (isUserConnected) {
                setIsNonInscrit(false);
            }
        }, [isUserConnected]);

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
        
    return (
        <div>
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
        </div>
    );
};

export default Profil;