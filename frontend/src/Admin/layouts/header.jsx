import { useTheme } from "../hooks/use-theme";
import {CircleUser,  ChevronsLeft, Moon, Search, Sun } from "lucide-react";
import profileImg from "../assets/profile-image.jpg";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { useLocation } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { MdAdminPanelSettings, MdOutlineAdminPanelSettings } from "react-icons/md";

const Filtres = {
    TOUS: "Tous",
    DERNIER_A_JOUR: "Dernier à Jour",
    ALPHABETIQUE: "Alphabetique",
    CATEGORIE: "Categorie",
};

// Définition des valeurs pour le filtre de stock
const FiltreStockValues = {
    TOUS: "Tous",
    EN_STOCK: "enStock", 
    RUPTURE: "rupture",
    ALERTE: "alerte"
};

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const [User, setUser] = useState(null);
    const { searchTerm, setSearchTerm, filterValue, filtreStock, setFiltreStock, setFilterValue } = useSearch();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterValue(e.target.value);
    };

   useEffect(() => {
       const storedUser = localStorage.getItem("user");
       if (storedUser) {
           setUser(JSON.parse(storedUser));
       }
   }, []);
   
   const location = useLocation();
   const currentPath = location.pathname;
   const [path,setPath] = useState("/admin/olo")
   
    return (
        <header className={cn("relative z-10 flex pr-6 items-center flex-col p-4 bg-white px-4 shadow-md transition-colors dark:bg-slate-900", (currentPath === '/admin/products' || currentPath === '/admin/categorie') ? "h-[150px]" : " h-[70px]")}>
            <div className=" w-full justify-between flex">
                <div className="flex items-center gap-x-3">
                    <button
                        className="btn-ghost size-10"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronsLeft className={collapsed && "rotate-180"} />
                    </button>
                        <div className="input border border-slate-500 dark:border-slate-600 bg-[#FDFEFF] dark:bg-[#020617]">
                            <Search
                                size={20}
                                className="text-slate-400"
                            />
                            <input
                                type="text"
                                name="search"
                                id="search"
                                value={searchTerm} 
                                onChange={handleSearchChange}
                                placeholder="Recherche..."
                                className="w-full  bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
                            />
                        </div>
                </div>
                <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden text-accent"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block text-accent"
                    />
                </button>
                
                    {User ? (
                    <div className="flex items-center gap-x-4">
                        <span className="text-[#b9bbc5] font-bold">{User.emailUsers}</span>
                        <button className=" size-10overflow-hidden rounded-full">
                        <MdOutlineAdminPanelSettings  className="size-10 text-accent"/>
                        </button>
                    </div>
                    ):(
                    <div className="flex items-center gap-x-2">
                        <span className="text-[#6D6F79] font-bold">Admin Compte</span>
                        <button className="size-10 overflow-hidden rounded-full">
                        <CircleUser />
                        </button>
                    </div>
                    )}
                    
                </div>
            </div>
            {(currentPath === '/admin/products' || currentPath === '/admin/categorie') && ( <div className="divider"></div>)}
            {(currentPath === '/admin/products' || currentPath === '/admin/categorie') && (
                    <div className={`flex w-full`}>
                        <div className="flex items-center gap-4">
                            <button
                                className={`btn btn-sm ${filtreStock === FiltreStockValues.TOUS ? "btn-accent " : "btn-ghost"}`}
                                onClick={() => setFiltreStock(FiltreStockValues.TOUS)}
                            >
                                Tous
                            </button>
                            <button
                                className={`btn btn-sm ${filtreStock === FiltreStockValues.EN_STOCK ? "btn-accent" : "btn-ghost"}`}
                                onClick={() => setFiltreStock(FiltreStockValues.EN_STOCK)}
                            >
                                En stock
                            </button>
                            <button
                                className={`btn btn-sm ${filtreStock === FiltreStockValues.RUPTURE ? "btn-accent" : "btn-ghost"}`}
                                onClick={() => setFiltreStock(FiltreStockValues.RUPTURE)}
                            >
                                Rupture
                            </button>
                            <button
                                className={`btn btn-sm ${filtreStock === FiltreStockValues.ALERTE ? "btn-accent" : "btn-ghost"}`}
                                onClick={() => setFiltreStock(FiltreStockValues.ALERTE)}
                            >
                                Alerte
                            </button>
                        </div>
                        <div className="flex items-center gap-4 justify-end w-full text-slate-950 dark:text-gray-200">
                            <label className="label">
                                <span className="label-text  text-slate-950 dark:text-gray-200">Trié par :</span>
                            </label>
                            <select
                                className="select w-1/4 rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
                                value={filterValue}
                                onChange={handleFilterChange}
                            >
                                <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
                                <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
                                <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
                            </select>
                        </div>
                     </div>  
            )}
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};

// import { useTheme } from "../hooks/use-theme";
// import {CircleUser,  ChevronsLeft, Moon, Search, Sun } from "lucide-react";
// import profileImg from "../assets/profile-image.jpg";
// import PropTypes from "prop-types";
// import { useEffect, useState } from "react";
// import { cn } from "../utils/cn";
// import { useLocation } from 'react-router-dom';
// import { useSearch } from '../contexts/SearchContext';
// import { MdAdminPanelSettings, MdOutlineAdminPanelSettings } from "react-icons/md";

// const Filtres = {
//     TOUS: "Tous",
//     DERNIER_A_JOUR: "Dernier à Jour",
//     ALPHABETIQUE: "Alphabetique",
//     CATEGORIE: "Categorie",
// };

// export const Header = ({ collapsed, setCollapsed }) => {
//     const { theme, setTheme } = useTheme();
//     const [User, setUser] = useState(null);
//     const { searchTerm, setSearchTerm, filterValue,filtreStock,setFiltreStock, setFilterValue } = useSearch();

//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     const handleFilterChange = (e) => {
//         setFilterValue(e.target.value);
//     };

//    useEffect(() => {
//        const storedUser = localStorage.getItem("user");
//        if (storedUser) {
//            setUser(JSON.parse(storedUser));
//        }
//    }, []);
//    const location = useLocation();
//    const currentPath = location.pathname;
//    const [path,setPath] = useState("/admin/olo")
//     return (
//         <header className={cn("relative z-10 flex pr-6 items-center flex-col p-4 bg-white px-4 shadow-md transition-colors dark:bg-slate-900", (currentPath === '/admin/products' || currentPath === '/admin/categorie') ? "h-[150px]" : " h-[70px]")}>
//             <div className=" w-full justify-between flex">
//                 <div className="flex items-center gap-x-3">
//                     <button
//                         className="btn-ghost size-10"
//                         onClick={() => setCollapsed(!collapsed)}
//                     >
//                         <ChevronsLeft className={collapsed && "rotate-180"} />
//                     </button>
//                         <div className="input border border-slate-500 dark:border-slate-600 bg-[#FDFEFF] dark:bg-[#020617]">
//                             <Search
//                                 size={20}
//                                 className="text-slate-400"
//                             />
//                             <input
//                                 type="text"
//                                 name="search"
//                                 id="search"
//                                 value={searchTerm} 
//                                 onChange={handleSearchChange}
//                                 placeholder="Recherche..."
//                                 className="w-full  bg-transparent text-slate-900 outline-0 placeholder:text-slate-500 dark:text-slate-50"
//                             />
//                         </div>
//                 </div>
//                 <div className="flex items-center gap-x-3">
//                 <button
//                     className="btn-ghost size-10"
//                     onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//                 >
//                     <Sun
//                         size={20}
//                         className="dark:hidden text-accent"
//                     />
//                     <Moon
//                         size={20}
//                         className="hidden dark:block text-accent"
//                     />
//                 </button>
                
//                     {User ? (
//                     <div className="flex items-center gap-x-4">
//                         <span className="text-[#b9bbc5] font-bold">{User.emailUsers}</span>
//                         <button className=" size-10overflow-hidden rounded-full">
//                         <MdOutlineAdminPanelSettings  className="size-10 text-accent"/>
//                         </button>
//                     </div>
//                     ):(
//                     <div className="flex items-center gap-x-2">
//                         <span className="text-[#6D6F79] font-bold">Admin Compte</span>
//                         <button className="size-10 overflow-hidden rounded-full">
//                         <CircleUser />
//                         </button>
//                     </div>
//                     )}
                    
//                 </div>
//             </div>
//             {(currentPath === '/admin/products' || currentPath === '/admin/categorie') && ( <div className="divider"></div>)}
//             {(currentPath === '/admin/products' || currentPath === '/admin/categorie') && (
//             // <div className="flex  justify-center items-center flex-col px-4">
//                     //<div className="flex w-full justify-end mb-0"> 
//                     <div className={`flex w-full`}>
//                         <div className="flex items-center gap-4">
//                             <button
//                                 className={`btn btn-sm ${filtreStock === "Tous" ? "btn-accent " : "btn-ghost"}`}
//                                 onClick={() => setFiltreStock("Tous")}
//                             >
//                                 {/* Tous ({totalCount}) */}
//                                 Tous
//                             </button>
//                             <button
//                                 className={`btn btn-sm ${filtreStock === "enStock" ? "btn-accent" : "btn-ghost"}`}
//                                 onClick={() => setFiltreStock("enStock")}
//                             >
//                                 {/* Urgente ({urgentCount}) */}
//                                 En stock
//                             </button>
//                             <button
//                                 className={`btn btn-sm ${filtreStock === "rupture" ? "btn-accent" : "btn-ghost"}`}
//                                 onClick={() => setFiltreStock("rupture")}
//                             >
//                                 {/* Moyenne ({mediumCount}) */}
//                                 Rupture
//                             </button>
//                             <button
//                                 className={`btn btn-sm ${filtreStock === "alerte" ? "btn-accent" : "btn-ghost"}`}
//                                 onClick={() => setFiltreStock("alerte")}
//                             >
//                                 {/* Basse ({lowCount}) */}
//                                 Alerte
//                             </button>
//                         </div>
//                         <div className="flex items-center gap-4 justify-end w-full text-slate-950 dark:text-gray-200">
//                             <label className="label">
//                                 <span className="label-text  text-slate-950 dark:text-gray-200">Trié par :</span>
//                             </label>
//                             <select
//                                 className="select w-1/4 rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
//                                 value={filterValue}
//                                 onChange={handleFilterChange}
//                             >
//                                 <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
//                                 <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
//                                 <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
//                                 {/* {currentPath === '/admin/products' && <option value={Filtres.CATEGORIE}>{Filtres.CATEGORIE}</option>} */}
//                             </select>
//                         </div>
//                      </div>  
//             // </div>
//             )}
//         </header>
//     );
// };

// Header.propTypes = {
//     collapsed: PropTypes.bool,
//     setCollapsed: PropTypes.func,
// };
