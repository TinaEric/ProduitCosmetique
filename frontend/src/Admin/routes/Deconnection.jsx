import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Deconnection = () => {
    const navigate = useNavigate();
    const [openModal, setOpenModal] = useState(false);
    useEffect(() => {
        console.log("modal open")
         setOpenModal(true)
    }, []);

    const deconeky = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('panier');
        localStorage.removeItem('RefCommande');
        localStorage.removeItem('DataAdresse');
        localStorage.removeItem('methodeLivraison');
        localStorage.removeItem('methodePaiement');
        localStorage.removeItem('dateLivraison')
        navigate("/")
    }
    const closeModal = () => {
        setOpenModal(false);
        navigate(-1)
    }
  return (
    <div>
          <dialog id="login_modal" className={`modal ${openModal ? "modal-open" : ''}`}>
                        <div className="modal-box bg-slate-200 dark:bg-gray-800">
                            <form method="dialog">
                                <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" onClick={closeModal}>✕</button>
                            </form>
                            <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">Déconnexion</h3>
                            <p className="text-black items-center text-center">
                                Voulez vous vraiment déconncté ?
                            </p>
                            <div className="mt-5 flex justify-end items-center gap-4">
                                <button  onClick={closeModal} className="btn btn-accent btn-outline">
                                    Annuler
                                </button>
                                <button  onClick={deconeky} className="btn btn-error">
                                    Déconnecter
                                </button>
                            </div>
                        </div>
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={closeModal}>Fermer</button>
                        </form>
            </dialog>
        
    </div>
  )
}
export default  Deconnection;
