import React, { useEffect ,useState} from "react";
import Logo from "../../image/Logo.png";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import DarkMode from "./DarkMode";
import { Link, Navigate } from "react-router-dom";
import { useNavbar } from "../context/NavbarContext";
import { useAuth } from '../../hook/useAuth';
// import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
// import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { MdOutlineStarRate } from "react-icons/md";
import Panier from "../Pages/Commande/Panier"
import { RiHome5Fill } from "react-icons/ri";
import { MdBookmarkBorder } from "react-icons/md";
import Badge from '@mui/material/Badge';
import { usePanier } from "../context/PanierContext";
import { useAuthContext } from '@/contexts/AuthContext';

const people = [
  { id: 1, name: 'Tom Cook' },
  { id: 2, name: 'Wade Cooper' },
  { id: 3, name: 'Tanya Fox' },
  { id: 4, name: 'Arlene Mccoy' },
  { id: 5, name: 'Devon Webb' },
]
const Navbar = () => {
  // const { user, logout, isAuthenticated} = useAuth(); 
  const { user, logout, isAuthenticated} = useAuthContext();
  const [ouvrePanier,setouvrePanier] = useState(false);
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(people[1])
  const {items} = usePanier();
  const [nomUserConncte, setNomUserConnecte] = useState('')
  const { searchTerm, setSearchTerm, filterValue, setFilterValue,openPanier ,setOpenPanier,setNouveauteBtn} = useNavbar();

  const filteredPeople =
    query === ''
      ? people
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase())
        })
      
       
    // console.log("NAVBAR = isAuthenticated :",isAuthenticated , "user :",user)

    useEffect(() => {
      if (user && user.client) {
          setNomUserConnecte(user.client.nomClient + ' ' + user.client.prenomClient);
      } else {
          setNomUserConnecte('');
      }
  }, [user]);
   
       
  return (
    <nav className="fixed top-0 left-0 w-full h-20 md:h-16">
    <div className="shadow-md bg-[#EDECF2] dark:bg-[#0E121E] text-black dark:text-white duration-200 relative z-100">
      {/* Navbar Haut */}
      <div className="px-10 py-2 bg-[#E1DFE7] dark:bg-[#0E121E]  rounded-2xl shadow-sm shadow-gray-400 dark:shadow-white/10">
        
        <div className=" flex flex-wrap justify-between items-center gap-2">
        {/* Logo */}
          <div className="w-1/2 md:w-auto">
            <Link to="/" className="font-bold text-gradient-to-r from-[#2563EB] to-[#313f58] text-2xl sm:text-3xl flex gap-2">
              <img src={Logo} alt="Logo" className="w-10" />
              MaBeauté
            </Link>
          </div>
          {/* search bar */}
          <div className="w-full flex justify-start md:w-auto ">
            <div className="relative">
              <input
                type="text"
                placeholder="Recherche..."
                className="
                 w-[350px]
                 rounded-full
                 border border-gray-300 px-2 py-[5px]
                 focus:outline-none focus:border-1 focus:border-[#2563EB]
                 dark:border-gray-500 dark:bg-[#161B2A]  "
            />
              {/* sm:group-hover:w-[160px] */}
              <IoMdSearch className="text-gray-500 text-2xl hover:text-[#2563EB] absolute top-1/2 -translate-y-1/2 right-3" />
            </div>
          </div>
          
          {/* guide */}
          <div className="flex justify-between md:w-auto items-center gap-2 max-md:hidden lg:gap-4">
              {/*  Panier */}
              <button 
                onClick={() => setOpenPanier(true)}
                className="
                hover:bg-gray-300
                dark:hover:bg-[#161B2A]

                rounded-full py-1 px-4  
                flex justify-end items-center gap-3"
              >
                <span >
                  Panier
                </span>
                <Badge badgeContent={items.length} color="info">
                  <FaCartShopping
                    className="
                  text-xl dark:text-white 
                  cursor-pointer"
                  />
                </Badge>
                
               
              </button>

              <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
             
              {/* se connecter */}
              {isAuthenticated && user.roleUsers === "ROLE_USER" ? (
                // Utilisateur connecté
                <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="
                  hover:bg-gray-300
                  dark:hover:bg-[#161B2A]
                    rounded-full text-white  py-1 px-4  
                    flex justify-end items-center gap-3"
                >
                  <img
                    src={user.avatar || "/public/image/user.png"}
                    alt="avatar"
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                </label>
      
                {/* Liste déroulante */}
                <ul
                  tabIndex={0}
                  className="
                  
                  bg-gray-300 dark:bg-gray-800
                  text-black dark:text-white
                  dropdown-content menu p-2 shadow 
                  rounded-box w-40 mt-2"
                >
                  <li className=" text-black  dark:text-white dark:hover:bg-gray-900 hover:bg-gray-400">
                    <Link to="/profile" >
                     
                      {/* Avatar à droite */}
                      <img
                        src={user.avatar || "/public/image/user.png"}
                        alt="avatar"
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                       <span
                        
                      >
                       {nomUserConncte}
                      </span>
          
                    </Link>
                  </li>
                  <li className="text-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-400">
                    <button onClick={() => logout() }>Se déconnecter</button>
                  </li>
                </ul>
              </div>
              ) : (
                // Utilisateur non connecté
                <Link
                to="/Inscription"
                className="
                 hover:bg-gray-300
                dark:hover:bg-[#161B2A]
                
                rounded-full py-1 px-4  
                flex justify-end items-center gap-3"
                >
                  Se connecter
                </Link>
              )}

                <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
              
              {/* Darkmode Switch */}
              <div>
                <DarkMode />
              </div>
          </div>
        </div>
      </div>

      {/*  Navbar BAs  */}
      <div data-aos="zoom-in" className="justify-center items-center px-20 dark:bg-[#161B2A]">
        <div className="flex w-full justify-end items-center py-3 gap-2 " >
          <div className="flex justify-between items-center ml-4  gap-8">
            <button 
             className=" flex justify-center gap-2 items-center rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
              <RiHome5Fill className="cursor-pointer" />
              <Link to="/">Home</Link>
            </button>
            <button
             className=" flex justify-center gap-2 items-center rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
              <MdOutlineStarRate className="cursor-pointer text-[#2563EB] dark:text-yellow-500" />
              <Link to="/Produit">Nouveauté</Link>
            </button>
            <button
             className=" flex justify-center gap-2 items-center rounded-full px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-800">
              <MdBookmarkBorder className="cursor-pointer"/>
              <Link to="/MesCommande">Mes Commandes</Link>
            </button>
          </div>
        </div>
      
      </div>
      <Panier open={ouvrePanier} onclose={() => setouvrePanier(false)}/>
    </div>
    </nav>
  );
};

export default Navbar;

// <div className="flex justify-center items-center gap-2">
// <span className="font-bold">Catégorie</span>

// <Combobox value={selected} onChange={setSelected} className="relative w-56">
//   <div className="relative">
//     <ComboboxInput
//       className="w-full 
//                 sm:w-[2/3] 
//                 md:w-[1/2]
//                  h-8 rounded-md border border-gray-300 bg-white text-gray-900 
//                 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200
//                 pl-3 pr-8 text-sm focus:outline-none"
//       displayValue={(person) => person?.name}
//       onChange={(event) => setQuery(event.target.value)}
//     />
//     <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
//       <ChevronDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
//     </ComboboxButton>

//     <ComboboxOptions
//       className="absolute z-10 mt-1 w-full max-h-60 overflow-auto
//                 rounded-md bg-white text-gray-900 shadow-lg
//                 dark:bg-gray-800 dark:text-gray-200"
//     >
//       {filteredPeople.map((person) => (
//         <ComboboxOption
//           key={person.id}
//           value={person}
//           className="relative cursor-pointer select-none py-2 pl-3 pr-9
//                     hover:bg-gray-100 dark:hover:bg-gray-700"
//         >
//           {({ selected }) => (
//             <>
//               <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
//                 {person.name}
//               </span>
//               {selected && (
//                 <CheckIcon className="absolute inset-y-0 right-0 h-5 w-5 mr-3 text-[#2563EB]" />
//               )}
//             </>
//           )}
//         </ComboboxOption>
//       ))}
//     </ComboboxOptions>
//   </div>
// </Combobox>
// </div>