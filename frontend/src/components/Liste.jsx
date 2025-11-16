import React from 'react';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Liste = ({img,titre,sousTitre, onUpdate, onDelete,idListe}) => {
    return (
        <div className="list-row">
            <div>
                <img className="size-10 rounded-box" src={img}/></div>
            <div>
            <div>{titre}</div>
            <div className="text-xs uppercase font-semibold opacity-60">
                {sousTitre}
            </div>
            </div>
            <button className="btn btn-soft btn-accent gap-2" onClick={() => onUpdate(idListe)}>
                <FaEdit className='text-accent' />
                <span>Modifier</span>
            </button>
            <button className="btn btn-soft btn-error gap-2" onClick={() => onDelete(idListe)}>
                <MdDelete  className='text-error'/>
                <span>Supprimer</span>
            </button>
        </div>
    );
};

export default Liste;