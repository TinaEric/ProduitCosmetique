import { Link } from "react-router-dom";
import home from "../../../image/home.png"
import { FaCartShopping } from "react-icons/fa6";
import Produit from "../Produit/Produit";
import { useEffect } from "react";


export default function Home() {
  //  pt-20 md:pt-16 mt-10 md:mt8 gap-10 pb-5
 
  return (
    <div id="Home" className="
        bg-[#EDECF2] dark:bg-[#0E121E] 
       text-black dark:text-white
         flex flex-col justify-center items-center 
         min-h-screen
         gap-16
    ">
    <div  className="  flex flex-col-reverse md:flex-row justify-center items-center  pb-5">
      <div className="flex flex-col">
          <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left mt-4 md:mt-0">
              Produit de qualité, <br /> 100% Naturels avec {" "}
              Ma<span className="text-[#2563EB]">Beauté</span>
          </h1>

          <p className="my-4 text-md text-center md:text-left">
              Découvrez notre univers beauté: <br />
              raffinée de cosmétiques naturels, innovants<br /> et éthiques, 
              pensés pour sublimer chaque peau.
          </p>
          
          <Link to="/produit"  className="btn btn-outline  btn-accent font-bold  py-2 px-4 mb-5 md:w-fit">
            
            <span> Commandez Maintenant</span>
            <FaCartShopping className=" cursor-pointer"/>
          </Link>
          
      </div>

      <div className="md:ml-60">
          <img src={home} alt="" className="w-96 h-96 object-cover border-8 border-[#2563EB] shadow-xl" 
          style={{
              borderRadius : "30% 70% 70% 30% / 67% 62% 38% 33%"
          }}
          />
      </div>
    </div>
    
    <div className="w-full flex justify-center items-center gap-4 p-2 mb-5">
        <span>Agence Commerciale</span>
        <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
        <span>Service Client</span>
        <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
        <span>Livraison</span>
        <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
        <span>Paiement Rapide</span>
    </div>

    </div>
  );
}
