import React from 'react';
import { HiOutlineChevronDoubleRight } from "react-icons/hi";

const ListeSimple = ({labelle, cle, AffcheProduit ,categorie}) => {
    return (
            <li key={cle} 
                onClick={() => AffcheProduit(categorie)} 
                className="list-row flex justify-start cursor-pointer items-center gap-6 hover:divide-y w-full hover:divide-y-reverse p-2 m-2">
                    <div>
                    <HiOutlineChevronDoubleRight /> 
                    </div>
                    <div>
                    {labelle}
                    </div>
            </li>
    );
};

export default ListeSimple;