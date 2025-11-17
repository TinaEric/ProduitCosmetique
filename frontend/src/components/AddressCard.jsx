import React, { useState ,useEffect } from "react";
import { MdBusiness, MdEdit } from "react-icons/md";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { InputValidate } from "@/components/InputValidate";
import { MdLocationOn, MdAddLocation, MdHome } from "react-icons/md";

const AddressCard = ({ address, isSelected, onSelect, onEdit }) => {
    const [openEdit, setOpenEdit] = useState(false);
    const [editedAddress, setEditedAddress] = useState(address);
    const [errors, setErrors] = useState({});

    const handleEditClick = (e) => {
        e.stopPropagation();
        setOpenEdit(true);
    };

      // Mettre à jour l'état local quand l'adresse change
      useEffect(() => {
        setEditedAddress(address);
    }, [address]);


    const validate = () => {
        let tempErrors = {};
        let isValid = true;
            if (!editedAddress.labelle || editedAddress.labelle.trim() === "") {
                tempErrors.labelle = "Mentionner le labelle de votre adresse, Ce champ est requis.";
                isValid = false;
            }
            if (!editedAddress.ville || editedAddress.ville.trim() === "") {
                tempErrors.ville = "Obligatoire, Le nom du ville doit être existe.";
                isValid = false;
            }
            if (!editedAddress.codePostal || !/\d+$/.test(editedAddress.codePostal)) {
                tempErrors.codePostal = "Valeur vide n'est pas autorisé, Le code Postal doit être un nombre et contient 3 chiffres";
                isValid = false;
            }
            if (!editedAddress.quartier || editedAddress.quartier.trim() === "") {
                tempErrors.quartier = "Nous ne pouvons livré votre produit sans quartier, cette champ est requis.";
                isValid = false;
            }
            if (!editedAddress.lot || editedAddress.lot.trim() === "") {
                tempErrors.lot = "Obligatoire, c'est important pour nous connaitre votre adresse précis";
                isValid = false;
            }
            // if (!descriptionAdresse || descriptionAdresse.trim() === "") {
            //     setErrorInfos("La description doit contient au moins 4 caractères.");
            //     isValid = false;
            // }
            setErrors(tempErrors);
        return isValid;
    };

    const handleSaveEdit = () => {
        onEdit(editedAddress);
        setOpenEdit(false);
    };

    const handleCancelEdit = () => {
        setEditedAddress(address);
        setOpenEdit(false);
    };
    const handleCardClick = () => {
        if (!openEdit) { // Ne sélectionner que si le dialogue n'est pas ouvert
            onSelect(address);
        }
    };

    return (
        <>
            <div
                className={`w-full cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                }`}
                onClick={handleCardClick}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdBusiness className="text-blue-500" />
                        <span className="font-semibold">{address.labelle}</span>
                    </div>
                    <button
                        onClick={handleEditClick}
                        type="button"
                        className="rounded p-1 text-blue-500 hover:text-blue-700"
                    >
                        <MdEdit size={20} />
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {address.lot}, {address.quartier}, {address.ville} {address.codePostal}
                </p>
                <p className="text-sm italic text-gray-500">{address.complement}</p>
            </div>

            {/* Dialogue de modification */}
            <Dialog
                open={openEdit}
                onClose={handleCancelEdit}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Modifier l'adresse</DialogTitle>
                <DialogContent>
                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <TextField
                            label="Ville"
                            value={editedAddress.ville || ""}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, ville: e.target.value }))}
                            fullWidth
                            margin="normal"
                        />
                        {/* <InputValidate
                            IconComponent={MdLocationOn}
                            type="text"
                            largeur="2/3"
                            placeholder="Ex: Ville..."
                            title="Ville"
                            name="Ville"
                            
                            value={editedAddress.ville || ""}
                            // onChange={(val) => setEditedAddress({ target: { name: "ville", value: val } })}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, ville: e.target.value }))}
                            error={!!errors.quartier}
                            helperText={errors.quartier}
                            ClassIcone="text-accent"
                        /> */}
                        <TextField
                            label="Code Postal"
                            value={editedAddress.codePostal || ""}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, codePostal: e.target.value }))}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Lot"
                            value={editedAddress.lot || ""}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, lot: e.target.value }))}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Quartier"
                            value={editedAddress.quartier || ""}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, quartier: e.target.value }))}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Labelle"
                            value={editedAddress.labelle || ""}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, labelle: e.target.value }))}
                            fullWidth
                            margin="normal"
                            className="md:col-span-2"
                        />
                        <TextField
                            label="Complément d'adresse"
                            value={editedAddress.complement || ""}
                            onChange={(e) => setEditedAddress((prev) => ({ ...prev, complement: e.target.value }))}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                            className="md:col-span-2"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}  type="button">Annuler</Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        color="primary"
                         type="button"
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddressCard;

// import React, { useEffect, useState } from "react";
// import { MdLocationOn, MdAddLocation, MdHome, MdBusiness } from "react-icons/md";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { Card, CardContent, Typography, Box, RadioGroup, FormControlLabel, Radio, Button } from "@mui/material";
// import { all } from "axios";

// const AddressCard = ({ address, isSelected, onSelect }) => {
//     return (
//         <div
//             className={`p-4 border-2 rounded-lg w-full cursor-pointer transition-all ${
//                 isSelected
//                     ?
//                      'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
//                     : 'border-gray-300 dark:border-gray-600'
//             }`}
//             onClick={() => onSelect(address)}
//         >
//             <div className="flex items-center gap-2">
//                 <MdBusiness className="text-blue-500" />
//                 <span className="font-semibold ">{address.labelle}</span>
//             </div>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//                 {address.lot}, {address.quartier}, {address.ville} {address.codePostal}
//             </p>
//             <Typography variant="body2" className="text-gray-500 italic">
//               {address.complement}
//             </Typography>
//         </div>
//     );
// };

// const AddressCard = ({ address, isSelected, onSelect }) => (
//     <Card
//     // transition-all duration-200 hover:-translate-x-2
//         sx={{
//             width : '100%',
//             transition: 'all 200ms ease-in-out', // 'transition-all duration-200'
//             border: '2px solid',
//             borderColor: isSelected ? '#3b82f6' : '#6b7280',
//             backgroundColor: 'transparent', // ✅ Fond transparent
//             background: 'transparent', // ✅ Double assurance
//             transition: 'all 0.3s ease',
//             cursor: 'pointer',
//             '&:hover': {
//                 borderColor: isSelected ? '#3b82f6' : '#6b7280',
//                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                 transform: 'translateX(-8px)'
//             },
//             marginBottom: '12px',
//             boxShadow: 'none',
//         }}
//         onClick={() => onSelect(address)}
//     >
//         <CardContent
//             sx={{
//                 width : '100%',
//                 padding: '16px',
//                 backgroundColor: 'transparent', // ✅ CardContent transparent aussi
//                 background: 'transparent',
//                 '&:last-child': {
//                     paddingBottom: '16px', // Éviter le padding réduit du dernier enfant
//                 }
//             }}
//         >
//             <div className="flex items-start gap-3">
//                 <div
//                     className={`p-2 rounded-full ${
//                         isSelected
//                             ? 'bg-[#3b82f6] text-white'
//                             : 'bg-gray-100 text-gray-600'
//                     }`}
//                 >
//                     {address.type === 'HOME' ? <MdHome /> : <MdBusiness />}
//                 </div>
//                 <div className="flex-1 w-full">
//                     <Typography variant="h6" className="font-bold text-black dark:text-white text-sm">
//                         {address.labelle  ? address.labelle : 'Adresse Personnelle'}
//                     </Typography>
//                     <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mt-1">
//                         {address.ville}, {address.codePostal}
//                     </Typography>
//                     <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
//                         {address.quartier}, {address.lot}
//                     </Typography>
//                     {address.complement && (
//                         <Typography variant="body2" className="text-gray-500 italic">
//                             {address.complement}
//                         </Typography>
//                     )}
//                 </div>
//                 {isSelected && (
//                     <div className="text-[#3b82f6]">
//                         <div className="w-4 h-4 rounded-full bg-[#3b82f6] flex items-center justify-center">
//                             <span className="text-white text-xs">✓</span>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </CardContent>
//     </Card>
// );
//  export default AddressCard;

// <ul className="list bg-base-100 rounded-box shadow-md">

//   <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>

//   <li className="list-row">
//     <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/1@94.webp"/></div>
//     <div>
//       <div>Dio Lupa</div>
//       <div className="text-xs uppercase font-semibold opacity-60">Remaining Reason</div>
//     </div>
//     <button className="btn btn-square btn-ghost">
//       <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
//     </button>
//     <button className="btn btn-square btn-ghost">
//       <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
//     </button>
//   </li>

//   <li className="list-row">
//     <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/4@94.webp"/></div>
//     <div>
//       <div>Ellie Beilish</div>
//       <div className="text-xs uppercase font-semibold opacity-60">Bears of a fever</div>
//     </div>
//     <button className="btn btn-square btn-ghost">
//       <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
//     </button>
//     <button className="btn btn-square btn-ghost">
//       <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
//     </button>
//   </li>

//   <li className="list-row">
//     <div><img className="size-10 rounded-box" src="https://img.daisyui.com/images/profile/demo/3@94.webp"/></div>
//     <div>
//       <div>Sabrino Gardener</div>
//       <div className="text-xs uppercase font-semibold opacity-60">Cappuccino</div>
//     </div>
//     <button className="btn btn-square btn-ghost">
//       <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>
//     </button>
//     <button className="btn btn-square btn-ghost">
//       <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>
//     </button>
//   </li>

// </ul>
