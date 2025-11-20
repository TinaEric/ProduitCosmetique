import { Link } from "react-router-dom";
import home from "../../../image/home.png"
import { FaCartShopping, FaArrowDown, FaStar } from "react-icons/fa6";
import { useEffect, useState } from "react";

// Importe tes images de catalogue - remplace par tes vraies images
import prod1 from "@/image/prod1.png";
import prod2 from "@/image/prod2.png";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCatalogueIndex, setCurrentCatalogueIndex] = useState(0);

  // Images du catalogue
  const catalogueImages = [
    { src: prod1, title: "Soins Visage", description: "Naturels & Doux" },
    { src: prod2, title: "Maquillage", description: "Éclat Naturel" },
    { src: prod1, title: "Corps & Bain", description: "Détente Absolue" },
    { src: prod2, title: "Cheveux", description: "Brillance Naturelle" },
    { src: prod1, title: "Parfums", description: "Fragrances Uniques" },
    { src: prod2, title: "Accessoires", description: "Élégance & Style" },
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Animation automatique du carrousel
    const interval = setInterval(() => {
      setCurrentCatalogueIndex((prev) => 
        prev === catalogueImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="Home" className="
        bg-[#EDECF2] dark:bg-[#0E121E] 
        text-black dark:text-white
        flex flex-col justify-center items-center 
        min-h-screen
        gap-16
        relative
        overflow-hidden
    ">
      {/* Section principale */}
      <div className="flex flex-col-reverse md:flex-row justify-center items-center pt-14 pb-5">
        <div className={`flex flex-col transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
          <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left mt-4 md:mt-0">
            Produit de qualité, <br /> 100% Naturels avec {" "}
            Ma<span className="text-[#2563EB]">Beauté</span>
          </h1>

          <p className="my-4 text-md text-center md:text-left">
            Découvrez notre univers beauté: <br />
            raffinée de cosmétiques naturels, innovants<br /> et éthiques, 
            pensés pour sublimer chaque peau.
          </p>
          
          <Link 
            to="/Produit"  
            className="btn btn-outline btn-accent font-bold py-2 px-4 mb-5 md:w-fit transform hover:scale-105 transition-transform duration-300"
          >
            <span>Commandez Maintenant</span>
            <FaCartShopping className="cursor-pointer" />
          </Link>
        </div>

        <div className="md:ml-60">
          <img 
            src={home} 
            alt="" 
            className={`
                            w-96 h-96 
                            object-cover 
                            border-8 border-[#2563EB] 
                            shadow-xl 
                            transition-all duration-1000 ease-out
                            ${
                        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                      }`}
            style={{
              borderRadius: "30% 70% 70% 30% / 67% 62% 38% 33%"
            }}
          />
        </div>
      </div>
      {/* Section Catalogue Animée */}
      <div className={`w-full max-w-6xl mx-auto px-4 py-4 transition-all duration-1000 delay-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-4xl font-bold text-center mb-4">
          Explorez Notre <span className="text-[#2563EB]">Produit</span>
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Découvrez notre collection exclusive de produits de beauté naturels, 
          soigneusement sélectionnés pour votre bien-être.
        </p>

        {/* Grille du catalogue */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {catalogueImages.map((item, index) => (
            <div
              key={index}
              className={`
                group relative overflow-hidden rounded-2xl shadow-lg
                transform transition-all duration-700 ease-out
                hover:scale-105 hover:shadow-2xl
                ${index === currentCatalogueIndex ? 'ring-4 ring-[#2563EB] scale-105' : 'scale-95'}
              `}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: index === currentCatalogueIndex ? 'pulse 2s infinite' : 'none'
              }}
              onMouseEnter={() => setCurrentCatalogueIndex(index)}
            >
              {/* Image de fond */}
              <div 
                className="w-full h-32 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.src})` }}
              />
              
              {/* Overlay avec informations */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3">
                <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-gray-300 text-xs">{item.description}</p>
              </div>
              
              {/* Indicateur de sélection */}
              {index === currentCatalogueIndex && (
                <div className="absolute top-2 right-2">
                  <FaStar className="text-yellow-400 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Points indicateurs */}
        <div className="flex justify-center space-x-3 ">
          {catalogueImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCatalogueIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentCatalogueIndex 
                  ? 'bg-[#2563EB] scale-125' 
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Section produit mis en avant (carrousel automatique) */}
      <div className={`w-full max-w-4xl mx-auto px-4 transition-all duration-1000 delay-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-center mb-6">
            Produit du Moment 
            <span className="text-[#2563EB] ml-2">
              {catalogueImages[currentCatalogueIndex]?.title}
            </span>
          </h3>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div 
                className="w-full h-64 bg-cover bg-center rounded-2xl shadow-lg animate-pulse-slow"
                style={{ 
                  backgroundImage: `url(${catalogueImages[currentCatalogueIndex]?.src})`,
                  animation: 'pulse 3s ease-in-out infinite'
                }}
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-bold mb-3">
                {catalogueImages[currentCatalogueIndex]?.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {catalogueImages[currentCatalogueIndex]?.description} - 
                Découvrez notre collection exclusive pour une beauté naturelle et rayonnante.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="text-yellow-400 text-sm" />
                ))}
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">(4.9/5)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton Voir les produits */}
      <div className={`mt-8 transition-all duration-1000 delay-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <Link 
          to="/Produit" 
          className="
            group
            bg-gradient-to-r from-[#2563EB] to-[#1E40AF] 
            hover:from-[#1E40AF] hover:to-[#1E3A8A]
            text-white 
            font-bold 
            py-4 px-8 
            rounded-full 
            shadow-2xl 
            shadow-blue-500/30
            transform 
            hover:scale-110 
            hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)]
            transition-all 
            duration-500 
            ease-in-out
            flex 
            items-center 
            gap-3
            animate-pulse
          "
        >
          <span>Voir tous les produits</span>
          <FaArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
        </Link>
      </div>
      
      {/* Section services */}
      <div className={`w-full flex justify-center items-center gap-4 p-2 mb-5 transition-all duration-1000 delay-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <span>Agence Commerciale</span>
        <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
        <span>Service Client</span>
        <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
        <span>Livraison</span>
        <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
        <span>Paiement Rapide</span>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// import { Link } from "react-router-dom";
// import home from "../../../image/home.png"
// import { FaCartShopping, FaArrowDown } from "react-icons/fa6";
// import { useEffect, useState } from "react";

// export default function Home() {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   return (
//     <div id="Home" className="
//         bg-[#EDECF2] dark:bg-[#0E121E] 
//         text-black dark:text-white
//         flex flex-col justify-center items-center 
//         min-h-screen
//         gap-16
//         relative
//         overflow-hidden
//     ">
//       {/* Section principale */}
//       <div className="flex flex-col-reverse md:flex-row justify-center items-center pb-5">
//         <div className={`flex flex-col transition-all duration-1000 ease-out ${
//           isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
//         }`}>
//           <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left mt-4 md:mt-0">
//             Produit de qualité, <br /> 100% Naturels avec {" "}
//             Ma<span className="text-[#2563EB]">Beauté</span>
//           </h1>

//           <p className="my-4 text-md text-center md:text-left">
//             Découvrez notre univers beauté: <br />
//             raffinée de cosmétiques naturels, innovants<br /> et éthiques, 
//             pensés pour sublimer chaque peau.
//           </p>
          
//           <Link 
//             to="/produit"  
//             className="btn btn-outline btn-accent btn-wide font-bold py-2 px-4 mb-5 md:w-fit transform hover:scale-105 transition-transform duration-300"
//           >
//             <span>Visitez Maintenant</span>
//             <FaCartShopping className="cursor-pointer" />
//           </Link>
//         </div>

//         <div className="md:ml-60">
//           <img 
//             src={home} 
//             alt="" 
//             className={`
//               w-96 h-96 
//               object-cover 
//               border-8 border-[#2563EB] 
//               shadow-xl 
//               transition-all duration-1000 ease-out
//               ${
//           isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
//         }`}
//             style={{
//               borderRadius: "30% 70% 70% 30% / 67% 62% 38% 33%"
//             }}
//           />
//         </div>
//       </div>
      
//       {/* Section services */}
//       <div className={`w-full flex justify-center items-center gap-4 p-2 mb-5 transition-all duration-1000 delay-300 ${
//         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//       }`}>
//         <span>Agence Commerciale</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Service Client</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Livraison</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Paiement Rapide</span>
//       </div>

//       {/* Bouton Voir les produits */}
//       <div className={`mt-8 transition-all duration-1000 delay-500 ${
//         isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//       }`}>
//         <Link 
//           to="/produit" 
//           className="
//             group
//             bg-gradient-to-r from-[#2563EB] to-[#1E40AF] 
//             hover:from-[#1E40AF] hover:to-[#1E3A8A]
//             text-white 
//             font-bold 
//             py-4 px-8 
//             rounded-full 
//             shadow-2xl 
//             shadow-blue-500/30
//             transform 
//             hover:scale-110 
//             hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)]
//             transition-all 
//             duration-500 
//             ease-in-out
//             flex 
//             items-center 
//             gap-3
//             animate-pulse
//           "
//         >
//           <span>Voir tous les produits</span>
//           <FaArrowDown className="group-hover:translate-y-1 transition-transform duration-300" />
//         </Link>
//       </div>
//     </div>
//   );
// }





// import { Link } from "react-router-dom";
// import home from "../../../image/home.png"
// import { FaCartShopping } from "react-icons/fa6";
// import Produit from "../Produit/Produit";
// import { useEffect } from "react";


// export default function Home() {
//   //  pt-20 md:pt-16 mt-10 md:mt8 gap-10 pb-5
 
//   return (
//     <div id="Home" className="
//         bg-[#EDECF2] dark:bg-[#0E121E] 
//        text-black dark:text-white
//          flex flex-col justify-center items-center 
//          min-h-screen
//          gap-16
//     ">
//     <div  className="  flex flex-col-reverse md:flex-row justify-center items-center  pb-5">
//       <div className="flex flex-col">
//           <h1 className="text-5xl md:text-6xl font-bold text-center md:text-left mt-4 md:mt-0">
//               Produit de qualité, <br /> 100% Naturels avec {" "}
//               Ma<span className="text-[#2563EB]">Beauté</span>
//           </h1>

//           <p className="my-4 text-md text-center md:text-left">
//               Découvrez notre univers beauté: <br />
//               raffinée de cosmétiques naturels, innovants<br /> et éthiques, 
//               pensés pour sublimer chaque peau.
//           </p>
          
//           <Link to="/produit"  className="btn btn-outline  btn-accent font-bold  py-2 px-4 mb-5 md:w-fit">
            
//             <span> Commandez Maintenant</span>
//             <FaCartShopping className=" cursor-pointer"/>
//           </Link>
          
//       </div>

//       <div className="md:ml-60">
//           <img src={home} alt="" className="w-96 h-96 object-cover border-8 border-[#2563EB] shadow-xl" 
//           style={{
//               borderRadius : "30% 70% 70% 30% / 67% 62% 38% 33%"
//           }}
//           />
//       </div>
//     </div>
    
//     <div className="w-full flex justify-center items-center gap-4 p-2 mb-5">
//         <span>Agence Commerciale</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Service Client</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Livraison</span>
//         <div className="h-6 w-px bg-gray-950/10 dark:bg-white/10"></div>
//         <span>Paiement Rapide</span>
//     </div>

//     </div>
//   );
// }
