import React from 'react';
import { HiOutlineChevronDoubleRight } from "react-icons/hi";

// Dans ton composant ListeSimple
const ListeSimple = ({ labelle, categorie, AffcheProduit, isSelected }) => {
    return (
        <li
            onClick={() => AffcheProduit(categorie.codeCategorie)}
            className={`
                list-row m-2 flex w-full cursor-pointer items-center justify-start gap-6 p-2 
                transition-all duration-300 ease-in-out
                hover:bg-blue-50 hover:dark:bg-blue-900/20 
                ${isSelected ? 
                    'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400 font-bold scale-105' : 
                    'hover:divide-y hover:divide-y-reverse'
                }
            `}
        >
            <div>
                <HiOutlineChevronDoubleRight />
            </div>
            <div className={isSelected ? 'text-lg transition-all duration-300' : ''}>
                {labelle}
            </div>
        </li>
    );
};
// const ListeSimple = ({labelle, cle, AffcheProduit ,categorie}) => {
//     return (
//             <li key={cle} 
//                 onClick={() => AffcheProduit(categorie.codeCategorie)} 
//                 className="list-row flex justify-start cursor-pointer items-center gap-6 hover:divide-y w-full hover:divide-y-reverse p-2 m-2">
//                     <div>
//                     <HiOutlineChevronDoubleRight /> 
//                     </div>
//                     <div>
//                     {labelle}
//                     </div>
//             </li>
//     );
// };

export default ListeSimple;