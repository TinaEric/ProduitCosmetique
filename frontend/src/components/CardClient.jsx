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
        <div className="flex justify-evenly">
            <div
                data-aos="fade-up"
                key={id}
                className="
                     m-10 max-h-[350px] w-[200px] flex-1 
                    space-y-3 bg-white shadow-lg shadow-slate-800 
                    transition-all duration-200 hover:-translate-y-2 
                    hover:shadow-xl hover:shadow-slate-900 dark:bg-[#0F172A] dark:shadow-black"
            >
                <img
                    onClick={() => onInfos(produit)}
                    src={imagePath}
                    alt={titre}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }}
                    className="h-[200px] w-[280px] rounded-md object-cover"
                />
                <div className="gap-2 p-2">
                    <h3
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                        onClick={() => onInfos(produit)}
                    >
                        {titre}
                    </h3>

                    <div
                        className="py-2 flex items-center gap-2"
                        onClick={() => onInfos(produit)}
                    >
                        <FaSackDollar className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-slate-800 dark:text-slate-300"> {prix}</span>
                    </div>
                </div>
                <div className=" flex justify-end p-3 items-center">
                    <button
                        onClick={() => addPanier(produit)}
                        className="btn btn-ghost p-2  text-slate-700 dark:text-slate-300 hover:text-slate-800 hover:bg-slate-300 dark:hover:bg-slate-800"
                    >
                        <FaCartShopping
                            className=""
                            size={20}
                        />
                        <span>Ajouter au panier</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardClient;
