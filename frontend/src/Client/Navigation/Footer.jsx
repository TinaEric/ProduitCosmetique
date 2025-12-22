import React from "react";
import logoBleu from "../../image/logoBleu.png";
import footer from "../../image/footer.jpg";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaLocationArrow,
  FaMobileAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const BannerImg = {
  backgroundImage: `url(${footer})`,
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  height: "50%",
  width: "100%",
};

const FooterLinks = [
  {
    title: "Accueil",
    link: "/",
  },
  {
    title: "A propos",
    link: "/apropos",
  },
  {
    title: "Nos Poduits",
    link: "/Produit",
  },
];

const Footer = () => {
  return (
    <div style={BannerImg} className="text-white">
      <div className="container">
        {/* <div data-aos="zoom-in" className="grid md:grid-cols-3 pb-7 pt-5"> */}
        <div className="flex justify-between items-center pb-7 pt-5">
          {/* company details */}
          <div className="py-8 px-4 w-1/3">
            <h1 className="sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3">
              <img src={logoBleu} alt="" className="max-w-[50px]" />
              MaBeauté
            </h1>
            <p >
              Livraison rapide, promos exclusives, et 
              des centaines de produits beauté à portée de 
              clic - Votre nouvelle adresse cosmétique est ici.
            </p>
          </div>

          {/* Footer Links */}
          {/* <div className="grid grid-cols-2 sm:grid-cols-3 col-span-2 md:pl-10"> */}
          {/* <div className="flex justify-between items-center"> */}
            <div>
              <div className="py-8 px-4">
                <h1 className="sm:text-xl text-xl font-bold sm:text-left text-justify mb-3">
                  Lien rapide
                </h1>
                <ul className="flex flex-col gap-3">
                  {FooterLinks.map((link) => (
                    <li
                      className="cursor-pointer hover:text-primary hover:translate-x-1 duration-300 text-gray-200"
                      key={link.title}
                    >
                     <Link to={link.link}>{link.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* reseau sociau */}

            <div>
              <div className="flex items-center gap-3 mt-6">
                <a href="https://www.instagram.com/">
                  <FaInstagram className="text-3xl" />
                </a>
                <a href="https://www.facebook.com/tinarakkael">
                  <FaFacebook className="text-3xl" />
                </a>
                <a href="https://www.linkedin.com/in/tina-rakotonjanahary-40310a383">
                  <FaLinkedin className="text-3xl" />
                </a>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <FaLocationArrow />
                  <p>Fianarantsoa, Imandry 301</p>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <FaMobileAlt />
                  <p>+261 38 01 002 03</p>
                </div>
              </div>
            </div>
          {/* </div> */}
        </div>
      </div>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by Cosmétique Service</p>
        </aside>
      </footer>
    </div>
  );
};

export default Footer;
