import React, { useState, useEffect } from 'react';
import { FaEdit, FaUserCheck, FaUserLock } from 'react-icons/fa';
import { 
    MdClose, 
    MdSave, 
    MdCancel, 
    MdEmail, 
    MdPhone, 
    MdPerson,
    MdCalendarToday,
    MdLocationOn,
    MdInfoOutline
} from "react-icons/md";
import { RiKeyFill } from "react-icons/ri";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { InputValidate } from "@/components/InputValidate";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { MdOutlineEmail } from "react-icons/md";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { UpdateClient } from "@/services/ClientService";

const ProfilUser = ({ 
    onEdit,
    user, 
    size = "large",
    showStatus = true,
    showEditButton = true
}) => {
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialEmail, setInitialEmail] = useState('');
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

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

    const { avatar: avatarSize, text: textSize, status: statusSize } = sizeClasses[size];

    const getProfileImage = () => {
      const civilite = user?.civilite || user?.civiliteClient || formData.civilite || '';
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


  useEffect(() => {
}, [formData.civilite, user?.civilite, user?.civiliteClient]);


    // Initialiser les données du formulaire
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.idUsers || user.id || '',
                nom: user.nom || user.nomClient || '',
                prenom: user.prenom || user.prenomClient || '',
                email: user.email || user.emailUsers || '',
                telephone: user.telephone || user.telephoneClient || '',
                civilite: user.civilite || user.civiliteClient || '',
                dateNaissance: user.dateNaissance || '',
                emailIsModified: false
            });
            setInitialEmail(user.email || user.emailUsers || '');
        }
    }, [user]);

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
            tempErrors.dateNaissance = "Veuillez choisir votre date de naissance";
            isValid = false;
        }
        if (!formData.telephone || formData.telephone.trim() === "") {
            tempErrors.telephone = "Le numéro de téléphone est requis";
            isValid = false;
        } else if (!/^\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
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
        
        if (name === "email" && value !== initialEmail) {
            setFormData(prev => ({ ...prev, emailIsModified: true }));
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log("Profil à modifier: ", formData);
            
            // Préparer les données pour l'API
            const dataToSend = {
                id: formData.id,
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone,
                civilite: formData.civilite,
                dateNaissance: formData.dateNaissance,
                emailIsModified: formData.email !== initialEmail
            };

            const result = await UpdateClient(dataToSend);
            if (result.data) {
                setMessage({
                    ouvre: true,
                    texte: "Profil mis à jour avec succès",
                    statut: "success",
                });
                setOpen(true);
                
                // Mettre à jour le localStorage
                const updatedUser = result.data;
                localStorage.removeItem('user');
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Mettre à jour l'état local avec les nouvelles données
                setFormData({
                    id: updatedUser.idUsers,
                    nom: updatedUser.client?.nomClient || formData.nom,
                    prenom: updatedUser.client?.prenomClient || formData.prenom,
                    email: updatedUser.emailUsers || formData.email,
                    telephone: updatedUser.client?.telephoneClient || formData.telephone,
                    civilite: updatedUser.client?.civiliteClient || formData.civilite,
                    dateNaissance: updatedUser.client?.dateNaissance || formData.dateNaissance,
                    emailIsModified: false
                });
                
                setInitialEmail(updatedUser.emailUsers || formData.email);

                // Notifier le parent de la modification
                if (onEdit) {
                    onEdit({
                        nom: updatedUser.client?.nomClient || formData.nom,
                        prenom: updatedUser.client?.prenomClient || formData.prenom,
                        email: updatedUser.emailUsers || formData.email,
                        telephone: updatedUser.client?.telephoneClient || formData.telephone,
                        civilite: updatedUser.client?.civiliteClient || formData.civilite,
                        dateNaissance: updatedUser.client?.dateNaissance || formData.dateNaissance
                    });
                }
                    setOpenEditDialog(false);
                
            } else {
                setMessage({
                    ouvre: true,
                    texte: "Une erreur s'est produite lors de la mise à jour du profil",
                    statut: "error",
                });
                setOpen(true);
                console.log("Update Profil: ", result.error);
            }
        } catch (error) {
            setMessage({
                ouvre: true,
                texte: "Erreur lors de la mise à jour du profil",
                statut: "error",
            });
            setOpen(true);
            console.error("Erreur lors de la mise à jour:", error);
        }
        setLoading(false);
    };

    const handleCancel = () => {
      if (user) {
          setFormData({
              id: user.idUsers || user.id || '',
              nom: user.nom || user.nomClient || '',
              prenom: user.prenom || user.prenomClient || '',
              email: user.email || user.emailUsers || '',
              telephone: user.telephone || user.telephoneClient || '',
              civilite: user.civilite || user.civiliteClient || '',
              dateNaissance: user.dateNaissance || '',
              emailIsModified: false
          });
      }
      setErrors({});
      setOpenEditDialog(false);
  };

    const handleOpenEditDialog = () => {
      setOpenEditDialog(true);
      if (onEdit) {
          onEdit();
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
            {/* Carte de profil originale */}
            <div className="flex flex-col items-center gap-4 p-5 bg-transparent w-full hover:shadow-md transition-shadow duration-200">
                <div className="relative">
                    <img 
                        src={profileImage} 
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
                    {user.civilite} {user.nom} {user.prenom}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.email}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.telephone}</p>
                    
                    {showEditButton && (
                        <button 
                        className='btn btn-ghost btn-sm my-2 btn-accent px-4 items-center' 
                        onClick={handleOpenEditDialog}
                        >
                            <FaEdit />
                            <span className='text-sm font-gothic'>Modifier le Profil</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Message d'alerte */}
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

           {/* Modal de modification du profil */}
          <dialog
              id="edit_profile_modal"
              className={`modal ${openEditDialog ? "modal-open" : ""}`}
          >
              <div className="modal-box bg-slate-200 dark:bg-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
                  <form method="dialog">
                      <button
                          className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                          onClick={handleCancel}
                      >
                          ✕
                      </button>
                  </form>

                  <h3 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                      Modifier mon profil
                  </h3>

                  <form>
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Civilité */}
                              <FormControl component="fieldset" error={!!errors.civilite} className="w-full">
                                  <FormLabel component="legend" className="!text-gray-700 dark:!text-gray-300 !mb-3 !font-semibold">
                                      <div className="flex items-center gap-2">
                                          <MdPerson className="text-accent" />
                                          Civilité 
                                      </div>
                                  </FormLabel>
                                  <RadioGroup
                                      row
                                      name="civilite"
                                      value={formData.civilite || ''}
                                      onChange={handleChange}
                                      className="gap-4"
                                  >
                                      <FormControlLabel 
                                          value="Mr" 
                                          control={<Radio className="text-accent" />} 
                                          label="Mr" 
                                          className="!mx-0"
                                      />
                                      <FormControlLabel 
                                          value="Mme" 
                                          control={<Radio className="text-accent" />} 
                                          label="Mme" 
                                          className="!mx-0"
                                      />
                                      <FormControlLabel 
                                          value="Mlle" 
                                          control={<Radio className="text-accent" />} 
                                          label="Mlle" 
                                          className="!mx-0"
                                      />
                                  </RadioGroup>
                                  {errors.civilite && (
                                      <FormHelperText className="!text-red-500 !mt-2">
                                          {errors.civilite}
                                      </FormHelperText>
                                  )}
                              </FormControl>

                              {/* Date de naissance */}
                              <div>
                                  <InputValidate
                                      IconComponent={CalendarDateRangeIcon}
                                      type="date"
                                      title="Date de naissance"
                                      value={formData.dateNaissance || ''}
                                      onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
                                      error={!!errors.dateNaissance}
                                      helperText={errors.dateNaissance}
                                      placeholder="JJ/MM/AAAA"
                                      largeur="full"
                                      ClassIcone="text-accent"
                                  />
                              </div>

                              {/* Nom */}
                              <div>
                                  <InputValidate
                                      IconComponent={FaUserCheck}
                                      type="text"
                                      title="Nom"
                                      value={formData.nom || ''}
                                      onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
                                      error={!!errors.nom}
                                      helperText={errors.nom}
                                      placeholder="Votre nom"
                                      largeur="full"
                                      ClassIcone="text-accent"
                                  />
                              </div>

                              {/* Prénom */}
                              <div>
                                  <InputValidate
                                      IconComponent={FaUserLock}
                                      type="text"
                                      title="Prénom"
                                      value={formData.prenom || ''}
                                      onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
                                      error={!!errors.prenom}
                                      helperText={errors.prenom}
                                      placeholder="Votre prénom"
                                      largeur="full"
                                      ClassIcone="text-accent"
                                  />
                              </div>

                              {/* Email */}
                              <div className="md:col-span-2">
                                  <InputValidate
                                      IconComponent={MdOutlineEmail}
                                      type="email"
                                      title="Adresse email"
                                      value={formData.email || ''}
                                      onChange={(val) => handleChange({ target: { name: "email", value: val } })}
                                      error={!!errors.email}
                                      helperText={errors.email}
                                      placeholder="votre@email.com"
                                      largeur="full"
                                      ClassIcone="text-accent"
                                  />
                              </div>

                              {/* Téléphone */}
                              <div className="md:col-span-2">
                                  <InputValidate
                                      IconComponent={DevicePhoneMobileIcon}
                                      type="tel"
                                      title="Numéro de téléphone"
                                      value={formData.telephone || ''}
                                      onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
                                      error={!!errors.telephone}
                                      helperText={errors.telephone}
                                      placeholder="032 XX XXX XX"
                                      largeur="full"
                                      ClassIcone="text-accent"
                                  />
                              </div>
                          </div>

                          {/* Message d'information */}
                          <div className="bg-accent/10 p-4 rounded-xl">
                              <div className="flex items-start gap-3">
                                  <MdInfoOutline className="text-accent text-xl mt-1" />
                                  <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                          💡 Information
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                          Toutes les modifications seront appliquées immédiatement à votre compte.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="modal-action justify-center mt-8">
                          <button
                              type="button"
                              onClick={handleCancel}
                              className="btn btn-outline btn-error btn-wide"
                          >
                              Annuler
                          </button>
                          <button
                              type="button"
                              onClick={handleSave}
                              className="btn btn-accent btn-wide"
                          >
                              {loading ? (
                                  <div className="flex flex-row items-center justify-center gap-2">
                                      <span className="loading loading-spinner"></span>
                                      <span>Enregistrement...</span>
                                  </div>
                              ) : (
                                  "Enregistrer"
                              )}
                          </button>
                      </div>
                  </form>
              </div>

              {/* Backdrop pour fermer le modal */}
              <form method="dialog" className="modal-backdrop">
                  <button onClick={handleCancel}>Fermer</button>
              </form>
          </dialog>
        </div>
    );
};

export default ProfilUser;


// import React, { useState, useEffect } from 'react';
// import { FaEdit } from 'react-icons/fa';
// import {
//     Dialog,
//     DialogContent,
//     DialogTitle,
//     IconButton,
//     Slide
// } from '@mui/material';
// import Alert from "@mui/material/Alert";
// import Snackbar from "@mui/material/Snackbar";
// import { MdClose, MdSave, MdCancel } from "react-icons/md";
// import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
// import { InputValidate } from "@/components/InputValidate";
// import { DevicePhoneMobileIcon } from "@heroicons/react/24/solid";
// import { FaUserCheck, FaUserLock } from "react-icons/fa6";
// import { MdOutlineEmail } from "react-icons/md";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormControl from "@mui/material/FormControl";
// import FormLabel from "@mui/material/FormLabel";
// import FormHelperText from "@mui/material/FormHelperText";
// import {UpdateClient} from "@/services/ClientService";

// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

// // Fonction de comparer l'email initial et l'email à modifier
// function IsChangedEmail(current, initial) {
//   if (!current && !initial) return false;
//   if (!current || !initial) return true;
//   return (
//       current !== initial
//   );
// }

// const ProfilUser = ({ 
//   onEdit,
//   user, 
//   size = "large",
//   showStatus = true 
// }) => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [loading, setLoading] = useState(false);   
//       const [initialEmail,  setInitiaEmail]= useState('');
//   const [open, setOpen] = useState(false);
//   const [message, setMessage] = useState({
//               ouvre: false,
//               texte: "vide",
//               statut: "success",
//           });
//   const [formData, setFormData] = useState({});
//   const [errors, setErrors] = useState({});

//   console.log("User dans ProfilUser :", user);
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

//   useEffect(() => {
//     if (user && openDialog) {
//       setFormData({
//         nom: user.nom || '',
//         prenom: user.prenom || '',
//         email: user.email || '',
//         telephone: user.telephone || '',
//         civilite: user.civilite || '',
//         dateNaissance: user.dateNaissance || '',
//         emailIsModified: false
//       });
//       setErrors({});
//       setInitiaEmail(user.emailUsers);
//       setMessage({ show: false, text: "", type: "success" });
//     }
//   }, [user, openDialog]);

//   const validateEmailFormat = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   const validateForm = () => {
//     let tempErrors = {};
//     let isValid = true;

//     if (!formData.civilite) {
//       tempErrors.civilite = "La civilité est requise";
//       isValid = false;
//     }
//     if (!formData.nom || formData.nom.trim() === "") {
//       tempErrors.nom = "Le nom est requis";
//       isValid = false;
//     }
//     if (!formData.prenom || formData.prenom.trim() === "") {
//       tempErrors.prenom = "Le prénom est requis";
//       isValid = false;
//     }
//     if (!formData.email || !validateEmailFormat(formData.email)) {
//       tempErrors.email = "Une adresse email valide est requise";
//       isValid = false;
//     }
//     if (!formData.dateNaissance) {
//       tempErrors.dateNaissance = "veuiller choisir votre date de naissance";
//       isValid = false;
//   }
//     if (!formData.telephone || formData.telephone.trim() === "") {
//       tempErrors.telephone = "Le numéro de téléphone est requis";
//       isValid = false;
//     } else if (!/\d+$/.test(formData.telephone) || formData.telephone.length > 10) {
//       tempErrors.telephone = "Numéro de téléphone invalide";
//       isValid = false;
//     }

//     setErrors(tempErrors);
//     return isValid;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setErrors(prev => ({ ...prev, [name]: "" }));
//     if (name === "email" && value !== initialEmail) {
//       setFormData(prev => ({ ...prev, emailIsModified: true }));
//     }
//   };

//   const handleSave = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       //  if (IsChangedEmail(formData.email,initialEmail)){
//       //                 setFormData(prev => ({ ...prev, emailIsModified : true }));
//       //             }
//                       console.log("Profil à modifier: ", formData)
//                       const result = await UpdateClient(formData);
//                       if (result.data){
//                           setMessage({
//                               ouvre: true,
//                               texte: "Profil mis à jour avec succès",
//                               statut: "success",
//                           });
//                           setOpen(true);
//                           console.log("Update avec succes: ",result.data)
//                           localStorage.removeItem('user');
//                           localStorage.setItem('user', JSON.stringify(result.data));
//                       }else{
//                           setMessage({
//                               ouvre: true,
//                               texte: "Une erreur s'est produit lors de mis à jour Profil",
//                               statut: "error",
//                           });
//                           setOpen(true);
//                           console.log("Update Profil: ", result.error)
//                       }
      
//       // Notifier le parent de la modification
//       if (onEdit) {
//         onEdit(formData);
//       }
      
//       // Fermer automatiquement après 2 secondes en cas de succès
//       setTimeout(() => {
//         setOpenDialog(false);
//       }, 2000);
      
//     } catch (error) {
//       setMessage({
//         show: true,
//         text: "Erreur lors de la mise à jour du profil",
//         type: "error"
//       });
//     }
//     setLoading(false);
//   };

//   const handleCancel = () => {
//     setFormData({
//       nom: user.nom || '',
//       prenom: user.prenom || '',
//       email: user.email || '',
//       telephone: user.telephone || '',
//       civilite: user.civilite || '',
//       dateNaissance: user.dateNaissance || '',
//       emailIsModified: false
//     });
//     setErrors({});
//     setOpenDialog(false);
//   };

//   const handleOpenDialog = () => {
//     setOpenDialog(true);
//     if (onEdit) {
//       onEdit(); // Notifier le parent que l'édition commence
//     }
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setErrors({});
//     setMessage({ show: false, text: "", type: "success" });
//   };

  
//   const handleClose = (event, reason) => {
//     if (reason === "clickaway") {
//         return;
//     }
//     setOpen(false);
// };

//   return (
//     <>
//       {/* Carte de profil originale */}
//       <div className="flex flex-col items-center gap-4 p-5 bg-transparent w-full hover:shadow-md transition-shadow duration-200">
//         <div className="relative">
//           <img 
//             src={defaultImage} 
//             alt={`${user.nom} ${user.prenom}`} 
//             className={`${avatarSize} rounded-full object-cover border-2 border-white shadow-md`}
//           />
//           {showStatus && (
//             <span 
//               className={`absolute ${statusSize} rounded-full border-2 border-white bg-green-500`}
//             ></span>
//           )}
//         </div>
//           {/* Message d'alerte */}
//                         <div>
//                                         {message.ouvre && (
//                                             <Snackbar
//                                                 open={open}
//                                                 autoHideDuration={5000}
//                                                 onClose={handleClose}
//                                             >
//                                                 <Alert
//                                                     onClose={handleClose}
//                                                     severity={message.statut}
//                                                     variant="filled"
//                                                     sx={{ width: "100%" }}
//                                                 >
//                                                     {message.texte}
//                                                 </Alert>
//                                             </Snackbar>
//                                         )}
//                                     </div>
//         <div className="flex flex-col items-center text-center">
//           <h2 className={`font-semibold text-gray-800 dark:text-white ${textSize}`}>
//             {user.nom} {user.prenom}
//           </h2>
//           <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.email}</p>
//           <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.telephone}</p>
//           <button 
//             className='btn btn-ghost btn-sm my-2 btn-accent px-4 items-center' 
//             onClick={handleOpenDialog}
//           >
//             <FaEdit />
//             <span className='text-sm font-gothic'>Modifier le Profil</span>
//           </button>
//         </div>
//       </div>
//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         TransitionComponent={Transition}
//         maxWidth="md"
//         fullWidth
//         className="rounded-lg"
//       >
//         {/* <DialogTitle className="bg-gradient-to-r from-accent to-accent text-white dark:from-gray-800 dark:to-gray-700">
          
//         </DialogTitle> */}

//         <DialogContent className="bg-white dark:bg-gray-800 p-6">
//           {/* Message d'alerte */}
//           {message.show && (
//             <Alert 
//               severity={message.type} 
//               className="mb-6"
//               onClose={() => setMessage(prev => ({ ...prev, show: false }))}
//             >
//               {message.text}
//             </Alert>
//           )}
//           <div className="flex justify-between items-center">
//             <span className="text-xl text-black dark:text-white font-bold">Modifier mon profil</span>
//             <IconButton
//               onClick={handleCloseDialog}
//               className="text-white hover:bg-white hover:bg-opacity-20"
//               size="large"
//             >
//               <MdClose />
//             </IconButton>
//           </div>
//           {/* Formulaire d'édition */}
//           <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <FormControl error={!!errors.civilite} className="w-full">
//               <FormLabel className="text-gray-600 dark:text-slate-300 mb-3">
//                 Civilité *
//               </FormLabel>
//               <RadioGroup
//                 row
//                 name="civilite"
//                 value={formData.civilite || ""}
//                 onChange={handleChange}
//                 className="gap-4"
//               >
//                 <FormControlLabel
//                   value="Mr"
//                   control={<Radio />}
//                   label="Mr"
//                   className="text-gray-600 dark:text-slate-300"
//                 />
//                 <FormControlLabel
//                   value="Mme"
//                   control={<Radio />}
//                   label="Mme"
//                   className="text-gray-600 dark:text-slate-300"
//                 />
//                 <FormControlLabel
//                   value="Mlle"
//                   control={<Radio />}
//                   label="Mlle"
//                   className="text-gray-600 dark:text-slate-300"
//                 />
//               </RadioGroup>
//               <FormHelperText>{errors.civilite}</FormHelperText>
//             </FormControl>
//             <InputValidate
//               IconComponent={DevicePhoneMobileIcon}
//               type="text"
//               placeholder="Votre numéro de téléphone..."
//               title="Téléphone *"
//               name="telephone"
//               value={formData.telephone || ""}
//               onChange={(val) => handleChange({ target: { name: "telephone", value: val } })}
//               error={!!errors.telephone}
//               helperText={errors.telephone}
//               ClassIcone="text-accent"
//             />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <InputValidate
//                 IconComponent={FaUserCheck}
//                 type="text"
//                 placeholder="Votre nom..."
//                 title="Nom *"
//                 name="nom"
//                 value={formData.nom || ""}
//                 onChange={(val) => handleChange({ target: { name: "nom", value: val } })}
//                 error={!!errors.nom}
//                 helperText={errors.nom}
//                 ClassIcone="text-accent"
//               />

//               <InputValidate
//                 IconComponent={FaUserLock}
//                 type="text"
//                 placeholder="Votre prénom..."
//                 title="Prénom *"
//                 name="prenom"
//                 value={formData.prenom || ""}
//                 onChange={(val) => handleChange({ target: { name: "prenom", value: val } })}
//                 error={!!errors.prenom}
//                 helperText={errors.prenom}
//                 ClassIcone="text-accent"
//               />
//             </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <InputValidate
//                   IconComponent={MdOutlineEmail}
//                   type="email"
//                   placeholder="Votre email..."
//                   title="Email *"
//                   name="email"
//                   value={formData.email || ""}
//                   onChange={(val) => handleChange({ target: { name: "email", value: val } })}
//                   error={!!errors.email}
//                   helperText={errors.email}
//                   ClassIcone="text-accent"
//                 />
//              <InputValidate
//                                                 IconComponent={CalendarDateRangeIcon}
//                                                 type="date"
//                                                 placeholder="Votre date de naissance..."
//                                                 title="Date de naissance"
//                                                 value={formData.dateNaissance || ""}
//                                                 onChange={(val) => handleChange({ target: { name: "dateNaissance", value: val } })}
//                                                 error={!!errors.dateNaissance}
//                                                 helperText={errors.dateNaissance}
//                                                 ClassIcone="text-accent"
//                                             />

//             </div>
            

//             {/* Boutons d'action */}
//             <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
//               <button
//                 onClick={handleCancel}
//                 className="btn btn-outline btn-error flex items-center gap-2"
//                 disabled={loading}
//               >
//                 <MdCancel className="text-lg" />
//                 Annuler
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className="btn btn-accent flex items-center gap-2"
//               >
//                 <MdSave className="text-lg" />
//                 {loading ? "Sauvegarde..." : "Sauvegarder"}
//               </button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default ProfilUser;
