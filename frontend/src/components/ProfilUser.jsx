import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Slide,
    Alert
} from '@mui/material';
import { MdClose, MdSave, MdCancel } from "react-icons/md";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { InputValidate } from "@/components/InputValidate";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
import { FaUserCheck, FaUserLock } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProfilUser = ({ 
  onEdit,
  user, 
  size = "large",
  showStatus = true 
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: "", type: "success" });
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  console.log("User dans ProfilUser :", user);
  // Tailles configurables
  const sizeClasses = {
    small: {
      avatar: "w-12 h-12",
      text: "text-sm",
      status: "w-2 h-2 bottom-0 right-0"
    },
    medium: {
      avatar: "w-16 h-16",
      text: "text-base",
      status: "w-3 h-3 bottom-1 right-1"
    },
    large: {
      avatar: "w-20 h-20",
      text: "text-lg",
      status: "w-4 h-4 bottom-1 right-1"
    }
  };

  const defaultImage = "/image/image.png";

  const { avatar: avatarSize, text: textSize, status: statusSize } = sizeClasses[size];

  useEffect(() => {
    if (user && openDialog) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        civilite: user.civilite || '',
        dateNaissance: user.dateNaissance || ''
      });
      setErrors({});
      setMessage({ show: false, text: "", type: "success" });
    }
  }, [user, openDialog]);

  const validateEmailFormat = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.civilite) {
      tempErrors.civilite = "La civilité est requise";
      isValid = false;
    }
    if (!formData.nom || formData.nom.trim() === "") {
      tempErrors.nom = "Le nom est requis";
      isValid = false;
    }
    if (!formData.prenom || formData.prenom.trim() === "") {
      tempErrors.prenom = "Le prénom est requis";
      isValid = false;
    }
    if (!formData.email || !validateEmailFormat(formData.email)) {
      tempErrors.email = "Une adresse email valide est requise";
      isValid = false;
    }
    if (!formData.dateNaissance) {
      tempErrors.dateNaissance = "veuiller choisir votre date de naissance";
      isValid = false;
  }
    if (!formData.telephone || formData.telephone.trim() === "") {
      tempErrors.telephone = "Le numéro de téléphone est requis";
      isValid = false;
    } else if (!/\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
      tempErrors.telephone = "Numéro de téléphone invalide";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Ici, vous appelleriez votre service de mise à jour
      // const result = await updateUserProfile(formData);
      
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        show: true,
        text: "Profil mis à jour avec succès",
        type: "success"
      });
      
      // Notifier le parent de la modification
      if (onEdit) {
        onEdit(formData);
      }
      
      // Fermer automatiquement après 2 secondes en cas de succès
      setTimeout(() => {
        setOpenDialog(false);
      }, 2000);
      
    } catch (error) {
      setMessage({
        show: true,
        text: "Erreur lors de la mise à jour du profil",
        type: "error"
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      civilite: user.civilite || '',
      dateNaissance: user.dateNaissance || ''
    });
    setErrors({});
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    if (onEdit) {
      onEdit(); // Notifier le parent que l'édition commence
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({});
    setMessage({ show: false, text: "", type: "success" });
  };

  return (
    <>
      {/* Carte de profil originale */}
      <div className="flex flex-col items-center gap-4 p-5 bg-transparent w-full hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          <img 
            src={defaultImage} 
            alt={`${user.nom} ${user.prenom}`} 
            className={`${avatarSize} rounded-full object-cover border-2 border-white shadow-md`}
          />
          {showStatus && (
            <span 
              className={`absolute ${statusSize} rounded-full border-2 border-white bg-green-500`}
            ></span>
          )}
        </div>
        
        <div className="flex flex-col items-center text-center">
          <h2 className={`font-semibold text-gray-800 dark:text-white ${textSize}`}>
            {user.nom} {user.prenom}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.email}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.telephone}</p>
          <button 
            className='btn btn-ghost btn-sm my-2 btn-accent px-4 items-center' 
            onClick={handleOpenDialog}
          >
            <FaEdit />
            <span className='text-sm font-gothic'>Modifier le Profil</span>
          </button>
        </div>
      </div>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        className="rounded-lg"
      >
        {/* <DialogTitle className="bg-gradient-to-r from-accent to-accent text-white dark:from-gray-800 dark:to-gray-700">
          
        </DialogTitle> */}

        <DialogContent className="bg-white dark:bg-gray-800 p-6">
          {/* Message d'alerte */}
          {message.show && (
            <Alert 
              severity={message.type} 
              className="mb-6"
              onClose={() => setMessage(prev => ({ ...prev, show: false }))}
            >
              {message.text}
            </Alert>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xl text-black dark:text-white font-bold">Modifier mon profil</span>
            <IconButton
              onClick={handleCloseDialog}
              className="text-white hover:bg-white hover:bg-opacity-20"
              size="large"
            >
              <MdClose />
            </IconButton>
          </div>
          {/* Formulaire d'édition */}
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl error={!!errors.civilite} className="w-full">
              <FormLabel className="text-gray-600 dark:text-slate-300 mb-3">
                Civilité *
              </FormLabel>
              <RadioGroup
                row
                name="civilite"
                value={formData.civilite || ""}
                onChange={handleChange}
                className="gap-4"
              >
                <FormControlLabel
                  value="Mr"
                  control={<Radio />}
                  label="Mr"
                  className="text-gray-600 dark:text-slate-300"
                />
                <FormControlLabel
                  value="Mme"
                  control={<Radio />}
                  label="Mme"
                  className="text-gray-600 dark:text-slate-300"
                />
                <FormControlLabel
                  value="Mlle"
                  control={<Radio />}
                  label="Mlle"
                  className="text-gray-600 dark:text-slate-300"
                />
              </RadioGroup>
              <FormHelperText>{errors.civilite}</FormHelperText>
            </FormControl>
            <InputValidate
              IconComponent={DevicePhoneMobileIcon}
              type="text"
              placeholder="Votre numéro de téléphone..."
              title="Téléphone *"
              name="telephone"
              value={formData.telephone || ""}
              onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
              error={!!errors.telephone}
              helperText={errors.telephone}
              ClassIcone="text-accent"
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputValidate
                IconComponent={FaUserCheck}
                type="text"
                placeholder="Votre nom..."
                title="Nom *"
                name="nom"
                value={formData.nom || ""}
                onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
                error={!!errors.nom}
                helperText={errors.nom}
                ClassIcone="text-accent"
              />

              <InputValidate
                IconComponent={FaUserLock}
                type="text"
                placeholder="Votre prénom..."
                title="Prénom *"
                name="prenom"
                value={formData.prenom || ""}
                onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
                error={!!errors.prenom}
                helperText={errors.prenom}
                ClassIcone="text-accent"
              />
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputValidate
                  IconComponent={MdOutlineEmail}
                  type="email"
                  placeholder="Votre email..."
                  title="Email *"
                  name="email"
                  value={formData.email || ""}
                  onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                  error={!!errors.email}
                  helperText={errors.email}
                  ClassIcone="text-accent"
                />
             <InputValidate
                                                IconComponent={CalendarDateRangeIcon}
                                                type="date"
                                                placeholder="Votre date de naissance..."
                                                title="Date de naissance"
                                                value={formData.dateNaissance || ""}
                                                onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
                                                error={!!errors.dateNaissance}
                                                helperText={errors.dateNaissance}
                                                ClassIcone="text-accent"
                                            />

            </div>
            

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleCancel}
                className="btn btn-outline btn-error flex items-center gap-2"
                disabled={loading}
              >
                <MdCancel className="text-lg" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-accent flex items-center gap-2"
              >
                <MdSave className="text-lg" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilUser;


// import React from 'react';
// import { FaEdgeLegacy, FaEdit, FaUserEdit } from 'react-icons/fa';

// const ProfilUser = ({ 
//   onEdit,
//   user, 
//   size = "large",
//   showStatus = true 
// }) => {

//   // Tailles configurables
//   const sizeClasses = {
//     small: {
//       avatar: "w-12 h-12",
//       text: "text-sm",
//       status: "w-2 h-2 bottom-0 right-0"
//     },
//     medium: {
//       avatar: "w-16 h-16",
//       text: "text-base",
//       status: "w-3 h-3 bottom-1 right-1"
//     },
//     large: {
//       avatar: "w-20 h-20",
//       text: "text-lg",
//       status: "w-4 h-4 bottom-1 right-1"
//     }
//   };

//   const defaultImage = "/image/image.png";

//   const { avatar: avatarSize, text: textSize, status: statusSize } = sizeClasses[size];

//   return (
//     <div className="flex flex-col items-center gap-4 p-5 bg-transparent w-full hover:shadow-md transition-shadow duration-200">
//       <div className="relative">
//         <img 
//           src={defaultImage} 
//           alt={`${user.nom} ${user.prenom}`} 
//           className={`${avatarSize} rounded-full object-cover border-2 border-white shadow-md`}
//         />
//         {showStatus && (
//           <span 
//             className={`absolute ${statusSize} rounded-full border-2 border-white bg-green-500
//             }`}
//           ></span>
//         )}
//       </div>
      
//       <div className=" flex flex-col items-center text-center">
//         <h2 className={`font-semibold text-gray-800 dark:text-white ${textSize}`}>
//           {user.nom} {user.prenom}
//         </h2>
//         <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.email}</p>
//         <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.telephone}</p>
//         <button className='btn btn-ghost btn-sm my-2 btn-accent px-4 items-center' onClick={() => onEdit()}>
//           <FaEdit />
//           <span className='text-sm font-gothic '>Modifier le Profil</span>
//         </button>
//       </div>
     
//     </div>
//   );
// };

// export default ProfilUser;