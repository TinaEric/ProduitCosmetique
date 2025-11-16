import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../hook/useAuth';

function ClientLoginPage() {
  const { user, login, isAuthenticated, isClient } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailUsers  , setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/";

  // Redirection si déjà authentifié en tant que client
  useEffect(() => {
    if (isAuthenticated && isClient) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isClient, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    
    try {
      const result = await login(emailUsers  , password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || "Erreur de connexion inconnue.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage(err.message || "Erreur de connexion inconnue.");
      setLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner text-accent"></span>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="flex flex-col rounded-2xl p-5 gap-4 bg-slate-800">
        <h2 className="text-accent">Connexion Client</h2>
        {errorMessage && <p className="text-error">{errorMessage}</p>}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center w-full gap-4"
        >
          <input
            className='
            text-white
            p-2 rounded-full 
            border border-gray-300
            focus:outline-none focus:border-1 focus:border-[#2563EB]
            dark:border-gray-500 bg-[#161B2A]'
            type="email"
            placeholder="Email"
            value={emailUsers  }
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
          <input
            className='
            text-white
            p-2 rounded-full 
            border border-gray-300
            focus:outline-none focus:border-1 focus:border-[#2563EB]
            dark:border-gray-500 bg-[#161B2A]'
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />

          <button className="btn btn-outline btn-primary" type="submit" disabled={loading}>
            {loading ? ( 
              <div className="flex flex-row justify-center items-center gap-2">
                <span className="loading loading-spinner text-primary"></span>
                <span>Connexion en cours...</span>
              </div> 
            ) : "Se Connecter"}
          </button>
          
          <p className="text-sm text-gray-400">
            Pas encore de compte ? <a href="/register" className="text-primary hover:underline">S'inscrire</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ClientLoginPage;