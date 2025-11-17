import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { useNavbar } from "../../context/NavbarContext";
import { usePanier } from "@/Client/context/PanierContext";
import { useNavigate } from 'react-router-dom'; 
import { FaCartShopping, FaClosedCaptioning, FaSackDollar } from "react-icons/fa6";
import { PiTagChevronBold, PiTagChevronFill } from "react-icons/pi";
import { SiShopify } from "react-icons/si";
import { MdCloseFullscreen, MdOutlineClose, MdRemoveShoppingCart } from "react-icons/md";

//Imdroplet
const PanierDrawer = ({children}) => {
    const { openPanier, setOpenPanier } = useNavbar();
    const {items, ajouteAuPanier,PlusQuantite,MoinsQuantite , setItems, supprimerDuPanier} = usePanier();
    const navigate = useNavigate();
    const panierRef = useRef();
    
    const total = items.reduce((acc,item)  => {
        return acc + item.prix * item.quantite;
    },0)
    
    useEffect(() => {
        if (panierRef.current) {
            panierRef.current.checked = openPanier;
        }
    }, [openPanier]);

    const closeDrawer = () => {
        document.getElementById("edit-drawer").checked = false;
        setOpenPanier(false);
    };

    const PasserCommande = () => {
        console.log(items)
        setOpenPanier(false)
        navigate("/passerCommande");
    }
    return (
        <div className="drawer drawer-end">
            {/* Checbox qui gerer la fermeture de Drawer */}
            <input
                id="edit-drawer"
                type="checkbox"
                className="drawer-toggle"
                ref={panierRef}
            />
            <div className="drawer-content ">
                {children}
            </div>
            <div className="drawer-side z-50">
                <label
                    htmlFor="edit-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                    onClick={() => setOpenPanier(false)}
                ></label>
                <div className="menu min-h-full w-[400px] bg-slate-50 p-5 text-base-content dark:bg-base-100">
                    <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-600 pb-2 mb-5">
                        <div className="w-full">
                            <button className="btn btn-ghost btn-error" onClick={closeDrawer}>
                                <MdOutlineClose className="text-xl" />
                            </button>
                        </div>
                        <div className="w-full flex justify-end text-yellow-600 dark:text-yellow-400  items-center gap-4">
                            <FaCartShopping className="text-xl cursor-pointer"/>
                            <h1 className="text-xl font-bold">Votre Panier</h1>
                        </div>
                    </div>
                    <div>
                        <div className="">
                            {items.length === 0 ? (
                                <div className="w-full flex-col flex h-[500px] text-slate-500 space-y-4 dark:text-slate-400 justify-center items-center">
                                    <MdRemoveShoppingCart  className="text-[70px] "/>
                                    <p className=" text-xl ">Votre panier est vide</p>
                                </div>
                            ) : (
                                <div className="space-y-4 ">
                                    <div className="border-b border-slate-300 dark:border-slate-600 pb-4 mb-4 space-y-4">
                                        {items.map((item) => (
                                            <div key={item.id}  className="flex flex-col mb-2 p-2 shadow-lg shadow-slate-500 dark:shadow-black  rounded-2xl transition-all duration-200 hover:-translate-x-2  bg-slate-200 bg-opacity-65 dark:bg-opacity-50 dark:bg-slate-800">
                                                <div className="flex justify-between items-center  rounded-lg">
                                                    <div className="flex justify-between w-full items-center pb-2 ">
                                                            <div className="flex items-center gap-2">
                                                                <PiTagChevronFill className="text-black dark:text-white"/>
                                                                <span className="text-slate-950 dark:text-white text-[14px] font-semibold">{item.nom}</span>
                                                            </div>
                                                            <div className="flex flex-row  justify-between items-center gap-5">
                                                                <span className="text-yellow-600 dark:text-yellow-400  text-[13px] font-bold">X {item.quantite}</span>
                                                                <div className=" flex items-center bg-slate-200 dark:bg-slate-800 rounded-full shadow-sm shadow-slate-500 dark:shadow-black justify-center gap-1 px-2">
                                                                    <span onClick={() => PlusQuantite(item.id)} className="text-3xl rounded-full font-bold px-3 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 text-green-700 dark:text-green-500 ">+</span>
                                                                    <span onClick={() => MoinsQuantite(item.id)} className="text-4xl rounded-full font-bold px-3 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 text-red-700 dark:text-red-500">-</span>
                                                                </div>
                                                            </div>
                                                    </div>
                                                   
                                                </div>
                                                <div className="w-full flex flex-row items-center justify-between ">
                                                    <div className="w-full flex justify-start items-center ml-8 mb-3 gap-4">
                                                        <FaSackDollar className="text-yellow-600 dark:text-yellow-400 "/>
                                                        <span className="text-slate-700 text-[13px] dark:text-slate-400">{item.prix} X {item.quantite}  =  {item.prix*item.quantite} </span>
                                                    </div>
                                                    <span className=" btn-error btn-ghost" onClick={() => supprimerDuPanier(item.id)}>
                                                        <MdOutlineClose className="text-xl" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className=" w-full flex justify-between items-center border-b border-slate-300 dark:border-slate-600 pt-1 pb-4 text-slate-900 dark:text-slate-200">
                                            <span> Total à payer </span>
                                            <span> {total} Ar</span>
                                    </div>
                                    <div className=" w-full flex justify-end items-end">
                                        <label onClick={PasserCommande} className="btn btn-accent btn-outline btn-wide"  > 
                                            <SiShopify />
                                            <span> Passer à la commande</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default PanierDrawer;
