import { BiSolidEditAlt } from "react-icons/bi";
import { FaSackDollar } from "react-icons/fa6";
import {  MdOutlineDeleteOutline } from "react-icons/md";

const Card = ({id,img, titre,stock,prix ,onDelete, onUpdate,categorie, produit}) => {
    const imagePath = `/image/${img}`;
    const defaultImage = "/image/image.png"; 
  
    return (
        <div className="flex justify-evenly">
            <div
                data-aos="fade-up"
                // data-aos-delay={aosDelay}
                key={id}
                className="relative m-4 max-h-[50rem] w-[180px] flex-1 space-y-3 bg-white shadow-lg shadow-slate-800 transition-all duration-200 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-900 dark:bg-[#0F172A] dark:shadow-black"
            >
                <img
                    onClick={() => onUpdate(categorie,produit)}
                    src={imagePath}
                    alt={titre}
                    onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage; 
                    }}// h-[150px] w-auto
                    className="h-[150px] w-[180px] rounded-md object-cover"
                />
                <div className="p-2 gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white" onClick={() => onUpdate(categorie,produit)}>{titre}</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-400" onClick={() => onUpdate(categorie,produit)}> {stock} stock restant</p>
                    <div className="flex flex-row items-center justify-between">
                        <div className="my-2 flex items-center gap-1" onClick={() => onUpdate(categorie,produit)}>
                            <FaSackDollar className="text-yellow-400" />
                            <span className="text-slate-800 dark:text-slate-300"> {prix}</span>
                        </div>
                        <div className="mr-2 flex gap-2">
                            <button 
                                onClick={() => onUpdate(categorie,produit)}
                              className=" group relative rounded-full p-1 hover:bg-slate-300 dark:hover:bg-slate-800">
                                <BiSolidEditAlt
                                    className="
                                    text-blue-600 hover:text-blue-800 
                                    dark:text-blue-800 dark:hover:text-blue-600"
                                    size={20}
                                />
                                <span className="
                                  absolute -top-full left-1/2 z-10 
                                  hidden -translate-x-1/2 -translate-y-1 
                                  transform whitespace-nowrap rounded-md 
                                  bg-gray-700 px-2 py-1 text-xs 
                                  text-white group-hover:block">
                                    Modifier
                                </span>
                            </button>
                            <button 
                                onClick={() => onDelete(id, titre)}
                              className=" group relative rounded-full p-1 hover:bg-slate-300 dark:hover:bg-slate-800">
                                <MdOutlineDeleteOutline
                                    className="
                                      text-red-500 hover:text-red-700 
                                      dark:text-red-500 dark:hover:text-red-700"
                                    size={20}
                                />
                                <span className="
                                  absolute -top-full left-1/2 z-10 
                                  hidden -translate-x-1/2 -translate-y-1 
                                  transform whitespace-nowrap rounded-md 
                                  bg-gray-700 px-2 py-1 text-xs 
                                  text-white group-hover:block">
                                    Supprimer
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;

