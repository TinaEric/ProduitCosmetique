import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/UserService";

const Inscription = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomUser: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      
      // 1. Appel du service qui contacte le backend Symfony
       const resultat =  await registerUser(formData);

      if (resultat.user){
        alert("Inscription réussie ! Veuillez vous connecter.");
        navigate("/login");
      }else{
        console.log("Inscription Erreur: ",resultat.error)
      }
    } catch (err) {
        
      setError("Une erreur est survenue lors de l'inscription.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div
        className="
        flex flex-col rounded-2xl p-5 gap-4
       bg-slate-800 "
      >
        <h2 className="text-accent">Connecter en tant que Administration</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center w-full gap-4"
        >
          <input
            className='
            text-black dark:text-white
              p-2  rounded-full bg-white
              border border-gray-300
              focus:outline-none focus:border-1 focus:border-[#259D09]
              dark:border-gray-500 dark:bg-[#161B2A]'
            type="text"
            name="nomUser"
            placeholder="Nom d'utilisateur"
            value={formData.nomUser}
            onChange={handleChange}
            required
            autoComplete="off"
          />
          <input
            className='
            text-black dark:text-white
              p-2  rounded-full bg-white
              border border-gray-300
              focus:outline-none focus:border-1 focus:border-[#babbba]
              dark:border-gray-500 dark:bg-[#161B2A]'
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="new-email"
          />
          <input
            className='
            text-black dark:text-white
            p-2  rounded-full bg-white
            border border-gray-300
            focus:outline-none focus:border-1 focus:border-[#259D09]
            dark:border-gray-500 dark:bg-[#161B2A]'
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
         
          <button className="btn btn-outline  btn-accent" type="submit">
            {loading ? ( <div className="flex flex-row justify-center items-center gap-2"><span className="loading loading-spinner text-accent"></span><span>Inscription en cours...</span></div> ) : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Inscription;
