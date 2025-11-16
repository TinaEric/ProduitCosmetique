import React, {useState} from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { FaUserCheck, FaUserLock} from "react-icons/fa6";
import { InputValidate } from "@/components/InputValidate";
import { useAuth } from "../../../hook/useAuth";
import { FaUserCircle} from "react-icons/fa";
import { MdOutlineEmail, MdVerifiedUser } from "react-icons/md";
import { RiKeyFill } from "react-icons/ri";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";

const FormAdreesse = ({ initialData, onSubmitSuccess }) => {
    const { user, login, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [descriptionAdresse, setDescriptionAdresse] = useState('')
    const [errorInfos ,setErrorInfos] =useState(null)
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });

    const [data, setData] = React.useState(initialData);
    const [errors, setErrors] = React.useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        if (!data.ville || data.ville.trim() === "") {
            tempErrors.ville = "Obligatoire, Le nom du ville doit être existe.";
            isValid = false;
        }
        if (!data.codePostal || !/\d+$/.test(data.codePostal)) {
            tempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
            isValid = false;
        }

        if (!data.quartier || data.quartier.trim() === "") {
            tempErrors.quartier = "Nous ne pouvons livré votre produit sans quartier, cette champ est requis.";
            isValid = false;
        }
        if (!data.lot || data.lot.trim() === "") {
            tempErrors.lot = "Obligatoire, c'est important pour nous connaitre votre adresse précis";
            isValid = false;
        }
        if (!descriptionAdresse || descriptionAdresse.trim() === "") {
            setErrorInfos("La description doit contient au moins 4 caractères.")
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmitSuccess(data);
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
                <form
                    action=""
                    onSubmit={handleSubmit}
                >
                    
                    <div className="flex flex-col px-1">
                        <div className="flex items-center justify-center gap-4 text-xl">
                            <MdVerifiedUser className="text-accent" />
                            <span className="font-gothic text-black opacity-70 dark:text-white">Information sur votre Adresse</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                       
                            <InputValidate
                                IconComponent={FaUserCheck}
                                type="text"
                                largeur="2/3"
                                placeholder="Ex: Fianarantsoa..."
                                title="Ville"
                                value={data.ville}
                                onChange={(val) => handleChange({ target: { name: "ville", value: val } })}
                                error={!!errors.ville}
                                helperText={errors.ville}
                                ClassIcone="text-accent"
                                margY="my-4"
                            />
                            <InputValidate
                                IconComponent={FaUserLock}
                                type="number"
                                largeur="2/3"
                                placeholder="Ex: 301..."
                                title="Code Postal"
                                value={data.codePostal}
                                onChange={(val) => handleChange({ target: { name: "codePostal", value: val } })}
                                error={!!errors.codePostal}
                                helperText={errors.codePostal}
                                ClassIcone="text-accent"
                                margY="my-4"
                            />
                            <InputValidate
                                IconComponent={DevicePhoneMobileIcon}
                                type="text"
                                largeur="2/3"
                                placeholder="Ex: Imandry..."
                                title=" Quartier"
                                value={data.quartier}
                                onChange={(val) => handleChange({ target: { name: "quartier", value: val } })}
                                error={!!errors.quartier}
                                helperText={errors.quartier}
                                ClassIcone="text-accent"
                                margY="my-4"
                            />
                            <InputValidate
                                IconComponent={CalendarDateRangeIcon}
                                type="text"
                                largeur="2/3"
                                placeholder="Ex: AV13/3609..."
                                title="Lot d'Adresse "
                                value={data.lot}
                                onChange={(val) => handleChange({ target: { name: "lot", value: val } })}
                                error={!!errors.lot}
                                helperText={errors.lot}
                                ClassIcone="text-accent"
                                margY="mt-4 mb-8"
                            />
                            <InputValidate
                                IconComponent={CalendarDateRangeIcon}
                                type="text"
                                largeur="2/3"
                                optionel
                                placeholder="Ex: Chez moi..."
                                title="Labelle d'Adresse "
                                value={data.LabelleAdresse}
                                onChange={(val) => handleChange({ target: { name: "LabelleAdresse", value: val } })}
                                error={!!errors.LabelleAdresse}
                                helperText={errors.LabelleAdresse}
                                ClassIcone="text-accent"
                                margY="mt-4 mb-8"
                            />
                            <div className="w-full flex justify-center items-center">
                                <label className="mb-5 w-2/3 items-center justify-center">
                                    <div className="label">
                                        <span className={`label-text ${errorInfos ? "text-red-500" : "text-gray-800 dark:text-slate-300" } `}>Descriprion <span className="text-red-500">*</span></span>
                                    </div>
                                    <textarea
                                    // value={data.infosAd}
                                    // onChange={(val) => handleChange({ target: { name: "infosAd", value: val } })}
                                        value={descriptionAdresse}
                                        onChange={(e) =>{ setDescriptionAdresse(e.target.value); setErrorInfos(null)}}
                                        className={`textarea textarea-bordered h-[100px] w-full border ${errorInfos ? "border-red-500" : "border-slate-500 dark:border-slate-600" }  bg-transparent text-base text-black focus:border-blue-600  dark:text-white`}
                                        placeholder="Décrire plus d'information sur ce produit..."
                                    ></textarea>
                                    {errorInfos && <p className=" text-sm text-red-500">{errorInfos}</p>}
                                </label>
                            </div>
                            <div className="space-x-2">
                                <input type="checkbox"  id="val"/>
                                <label htmlFor="val">Utiliser cette adresse pour l'adresse de facturation</label>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-accent btn-outline btn-wide"
                        >
                            Continuer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormAdreesse;
