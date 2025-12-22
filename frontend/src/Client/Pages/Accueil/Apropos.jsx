import { Sparkles, Heart, Shield, Truck, Star, Award, Users } from 'lucide-react';
import { Link } from "react-router-dom";
import { FaCartShopping, FaArrowDown, FaStar, FaFire } from "react-icons/fa6";
import { useAuthModal } from '@/Client/context/AuthModalContext'

export default function Apropos() {
  // UTILISATION DU CONTEXTE AUTHMODAL
  const { openLoginModal, openRegisterModal } = useAuthModal();

  const stats = [
    { number: "10K+", label: "Clients Satisfaits" },
    { number: "500+", label: "Produits" },
    { number: "98%", label: "Satisfaction" },
    { number: "5 ans", label: "D'Expérience" }
  ];

  const values = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Qualité Premium",
      description: "Nous sélectionnons rigoureusement nos produits cosmétiques pour garantir excellence et efficacité."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion Beauté",
      description: "Notre équipe partage une passion commune pour la beauté naturelle et le bien-être."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sécurité Garantie",
      description: "Tous nos produits sont certifiés, testés dermatologiquement et sans substances nocives."
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Livraison Rapide",
      description: "Expédition sous 24h avec suivi en temps réel pour tous vos achats."
    }
  ];

  
  const imagePath = `/image/prod2.png`;
  const defaultImage = "/image/image.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="card shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{backgroundImage: "url('/image/prod1.png')"}}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Marque de Confiance</span>
            </div>
            <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold mb-6">
              À Propos de Nous
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Votre partenaire beauté pour révéler votre éclat naturel
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-pink-50 dark:from-gray-900"></div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card bg-slate-50 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="card-body items-center text-center p-6">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="badge badge-lg badge-accent mb-4">Notre Histoire</div>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Une Vision de Beauté Authentique
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Fondée avec une passion pour la beauté naturelle, notre boutique en ligne s'est donnée pour mission de rendre accessible des produits cosmétiques de haute qualité à tous.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Nous croyons que chaque personne mérite de se sentir belle et confiante. C'est pourquoi nous sélectionnons minutieusement chaque produit, en privilégiant l'efficacité, la sécurité et le respect de l'environnement.
            </p>
            <div className="flex gap-4">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
            </div>
          </div>
         
          <div className="order-1 md:order-2">
            <div className="relative w-4/5 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                {/* <Users className="w-full h-64 text-blue-600 " /> */}
                <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                    src={imagePath}
                    alt="Notre équipe"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                </div>
                </div>
            </div>
        </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge badge-lg badge-secondary mb-4">Nos Valeurs</div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Ce Qui Nous Distingue
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des principes fondamentaux qui guident chacune de nos actions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group">
                <div className="card bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 h-full">
                  <div className="card-body items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                      {value.icon}
                    </div>
                    <h3 className="card-title text-xl mb-3 text-gray-800 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="card shadow-2xl relative overflow-hidden bg-cover bg-center"
          style={{backgroundImage: "url('/image/Zial.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="card-body p-12 text-center text-white relative z-10">
            <h2 className="text-4xl font-bold mb-6">Notre Mission</h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Offrir à chacun l'accès à des produits cosmétiques de qualité professionnelle, tout en promouvant une beauté responsable et respectueuse de l'environnement. Nous nous engageons à être votre partenaire de confiance dans votre quête de beauté et de bien-être.
            </p>
            <div className="text-center">
              <Link
                to="/Produit"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Découvrir tous nos produits</span>
                <FaArrowDown className="relative z-10 transition-transform duration-300 group-hover:translate-y-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - MODIFIÉE */}
      <div className="bg-gradient-to-r from-slate-100 to-purple-300 dark:from-gray-800 dark:to-gray-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Rejoignez Notre Communauté
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Des milliers de clients nous font confiance chaque jour
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={openRegisterModal}
              className="btn btn-outline btn-accent btn-lg hover:scale-105 transition-transform duration-300 hover:shadow-lg group"
            >
              <span className="group-hover:text-white">Créer un Compte</span>
            </button>
            <button 
              onClick={openLoginModal}
              className="btn btn-soft btn-accent btn-lg hover:scale-105 transition-transform duration-300 hover:shadow-lg group"
            >
              <span className="group-hover:text-white">Se connecter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { Sparkles, Heart, Shield, Truck, Star, Award, Users } from 'lucide-react';
// import { Link } from "react-router-dom";
// import { FaCartShopping, FaArrowDown, FaStar, FaFire } from "react-icons/fa6";
// export default function Apropos() {
//   const stats = [
//     { number: "10K+", label: "Clients Satisfaits" },
//     { number: "500+", label: "Produits" },
//     { number: "98%", label: "Satisfaction" },
//     { number: "5 ans", label: "D'Expérience" }
//   ];

//   const values = [
//     {
//       icon: <Sparkles className="w-8 h-8" />,
//       title: "Qualité Premium",
//       description: "Nous sélectionnons rigoureusement nos produits cosmétiques pour garantir excellence et efficacité."
//     },
//     {
//       icon: <Heart className="w-8 h-8" />,
//       title: "Passion Beauté",
//       description: "Notre équipe partage une passion commune pour la beauté naturelle et le bien-être."
//     },
//     {
//       icon: <Shield className="w-8 h-8" />,
//       title: "Sécurité Garantie",
//       description: "Tous nos produits sont certifiés, testés dermatologiquement et sans substances nocives."
//     },
//     {
//       icon: <Truck className="w-8 h-8" />,
//       title: "Livraison Rapide",
//       description: "Expédition sous 24h avec suivi en temps réel pour tous vos achats."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
//       {/* Hero Section */}
//       <div className="card shadow-2xl relative overflow-hidden bg-cover bg-center"
//         style={{backgroundImage: "url('/image/prod1.png')"}}>
//         <div className="absolute inset-0 bg-black opacity-10"></div>
//         <div className="container mx-auto px-4 py-24 relative z-10">
//           <div className="text-center text-white">
//             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
//               <Award className="w-5 h-5" />
//               <span className="font-semibold">Marque de Confiance</span>
//             </div>
//             <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold mb-6">
//               À Propos de Nous
//             </h1>
//             <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
//               Votre partenaire beauté pour révéler votre éclat naturel
//             </p>
//           </div>
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-pink-50 dark:from-gray-900"></div>
//       </div>

//       {/* Stats Section */}
//       <div className="container mx-auto px-4 -mt-8 relative z-20">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {stats.map((stat, index) => (
//             <div key={index} className="card bg-slate-50 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
//               <div className="card-body items-center text-center p-6">
//                 <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   {stat.number}
//                 </h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Story Section */}
//       <div className="container mx-auto px-4 py-20">
//         <div className="grid md:grid-cols-2 gap-12 items-center">
//           <div className="order-2 md:order-1">
//             <div className="badge badge-lg badge-accent mb-4">Notre Histoire</div>
//             <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
//               Une Vision de Beauté Authentique
//             </h2>
//             <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
//               Fondée avec une passion pour la beauté naturelle, notre boutique en ligne s'est donnée pour mission de rendre accessible des produits cosmétiques de haute qualité à tous.
//             </p>
//             <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
//               Nous croyons que chaque personne mérite de se sentir belle et confiante. C'est pourquoi nous sélectionnons minutieusement chaque produit, en privilégiant l'efficacité, la sécurité et le respect de l'environnement.
//             </p>
//             <div className="flex gap-4">
//               <Star className="w-6 h-6 text-yellow-500 fill-current" />
//               <Star className="w-6 h-6 text-yellow-500 fill-current" />
//               <Star className="w-6 h-6 text-yellow-500 fill-current" />
//               <Star className="w-6 h-6 text-yellow-500 fill-current" />
//               <Star className="w-6 h-6 text-yellow-500 fill-current" />
//             </div>
//           </div>
//           <div className="order-1 md:order-2">
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-3"></div>
//               <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
//                 <Users className="w-full h-64 text-blue-600 " />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Values Section */}
//       <div className="bg-white dark:bg-gray-800 py-20">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <div className="badge badge-lg badge-secondary mb-4">Nos Valeurs</div>
//             <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
//               Ce Qui Nous Distingue
//             </h2>
//             <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//               Des principes fondamentaux qui guident chacune de nos actions
//             </p>
//           </div>
          
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {values.map((value, index) => (
//               <div key={index} className="group">
//                 <div className="card bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 h-full">
//                   <div className="card-body items-center text-center">
//                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
//                       {value.icon}
//                     </div>
//                     <h3 className="card-title text-xl mb-3 text-gray-800 dark:text-white">
//                       {value.title}
//                     </h3>
//                     <p className="text-gray-600 dark:text-gray-300">
//                       {value.description}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

 
//       {/* Mission Section */}
//     <div className="container mx-auto px-4 py-20">
//     <div className="card shadow-2xl relative overflow-hidden bg-cover bg-center"
//         style={{backgroundImage: "url('/image/Zial.jpg')"}}>
//         <div className="absolute inset-0 bg-black opacity-10"></div>
//         <div className="card-body p-12 text-center text-white relative z-10">
//         <h2 className="text-4xl font-bold mb-6">Notre Mission</h2>
//         <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8">
//             Offrir à chacun l'accès à des produits cosmétiques de qualité professionnelle, tout en promouvant une beauté responsable et respectueuse de l'environnement. Nous nous engageons à être votre partenaire de confiance dans votre quête de beauté et de bien-être.
//         </p>
//         <div className="text-center">
//             <Link
//             to="/Produit"
//             className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
//             >
//             <span className="relative z-10">Découvrir tous nos produits</span>
//             <FaArrowDown className="relative z-10 transition-transform duration-300 group-hover:translate-y-1" />
//             <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
//             </Link>
//         </div>
//         </div>
//     </div>
//     </div>

//       {/* CTA Section */}
//       <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 py-16">
//         <div className="container mx-auto px-4 text-center">
//           <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
//             Rejoignez Notre Communauté
//           </h3>
//           <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
//             Des milliers de clients nous font confiance chaque jour
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button className="btn btn-outline btn-accent btn-lg">Créer un Compte</button>
//             <button className="btn btn-soft btn-accent btn-lg">
//               Se connecter
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }