import React from "react";
import { AiOutlineSlack } from "react-icons/ai";
import { BiSolidEditAlt } from "react-icons/bi";
import { FaSackDollar } from "react-icons/fa6";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";

const CardClient = ({ id, img, titre, prix, addPanier, onInfos, categorie, produit }) => {
    const imagePath = `/image/${img}`;
    const defaultImage = "/image/image.png";

    return (
            <div
                data-aos="fade-up"
                key={id} //max-h-[350px] w-[200px] 
                className="
                    max-h-[30rem] w-[150px]
                    m-5 flex-1 
                    space-y-2 bg-white 
                    rounded-xl
                    transition-all duration-200 hover:-translate-y-2 
                    hover:shadow-lg hover:shadow-slate-500 dark:bg-[#0F172A] dark:shadow-black"
                    // shadow-lg shadow-slate-800 
            >
                <img
                    onClick={() => onInfos(produit)}
                    src={imagePath}
                    alt={titre}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }} //h-[200px] w-[280px]
                    className=" h-[130px] w-[150px] rounded-md object-cover"
                />
                <div className="gap-2 px-2">
                    <h3
                        className="text-[14px] font-semibold text-slate-900 dark:text-white"
                        onClick={() => onInfos(produit)}
                    >
                        {titre}
                    </h3>

                    <div
                        className=" flex items-center gap-2"
                        onClick={() => onInfos(produit)}
                    >
                        <FaSackDollar className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-slate-800 dark:text-slate-300"> {prix}</span>
                    </div>
                </div>
                <div className=" flex justify-center items-center">
                    <button
                        onClick={() => addPanier(produit)}
                        className="btn  btn-ghost p-2 m-2 text-slate-700 dark:text-slate-300 hover:text-slate-800 hover:bg-slate-300 dark:hover:bg-slate-800"
                    >
                        <FaCartShopping
                            className=""
                            size={15}
                        />
                        <span className= "text-[11px] font-gothic">Ajouter au panier</span>
                    </button>
                </div>
            </div>
    );
};

export default CardClient;
