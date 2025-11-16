import React from 'react';

const Dialogue = ({id,titre,texte ,onDelete,tab}) => {
    return (
        <dialog id={id} className='modal'>
            <div className='modal-box'>
                <h3 className='font-bold text-lg'>{titre}</h3>
                <p className='py-4'>{texte}</p>
                <div className='modal-action'>
                    <form method='dialog'>
                        <button className='btn  btn-outline btn-success mr-3'>Fermer</button>
                        <button className='btn btn-outline btn-error' onClick={() => onDelete(tab)}>Supprimer</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default Dialogue;