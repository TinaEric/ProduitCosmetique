import axios from 'axios';

const FACTURE_API_URL = 'http://localhost:8000/';

// Instance dédiée aux factures
const factureApi = axios.create({
  baseURL: FACTURE_API_URL,
});

// Ajout du token
factureApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Télécharger facture utilisateur
export const telechargerFacture = async (commandeId) => {
  try {
    const response = await factureApi({
      url: `/api/factures/commande/${commandeId}`,
      method: 'GET',
      responseType: 'blob',
      timeout: 60000,
    });
    return handleFactureResponse(response, commandeId);
  } catch (error) {
    handleFactureError(error);
  }
};

// Télécharger facture admin
export const telechargerFactureAdmin = async (commandeRef) => {
  try {
    const response = await factureApi({
      url: `/api/factures/adminFacture/${commandeRef}`,
      method: 'GET',
      responseType: 'blob',
      timeout: 60000,
    });
    return handleFactureResponse(response, commandeRef);
  } catch (error) {
    handleFactureError(error);
  }
};

// Vérifier disponibilité facture
export const verifierFactureDisponible = async (commandeId) => {
  try {
    const response = await factureApi.get(`/api/factures/commande/${commandeId}/disponible`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification de la facture:', error);
    throw error;
  }
};

// Gestion réponse PDF
const handleFactureResponse = (response, commandeId) => {
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/pdf',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  let filename = `facture_${commandeId}.pdf`;
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
  window.URL.revokeObjectURL(url);

  return { success: true, filename };
};

// Gestion erreurs
const handleFactureError = async (error) => {
  console.error('Erreur lors du téléchargement de la facture:', error);

  if (error.response) {
    switch (error.response.status) {
      case 400:
        throw new Error('Facture non disponible pour cette commande');
      case 403:
        throw new Error('Vous n\'avez pas accès à cette facture');
      case 404:
        throw new Error('Commande non trouvée');
      case 500:
        throw new Error('Erreur serveur lors de la génération de la facture');
      default:
        if (error.response.headers['content-type']?.includes('application/json')) {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Erreur lors du téléchargement');
        }
        throw new Error(`Erreur ${error.response.status}: ${error.response.statusText}`);
    }
  } else if (error.request) {
    console.log("FActure erro")
    throw new Error('Pas de réponse du serveur. Vérifiez votre connexion.');
  } else {
    throw new Error('Erreur de configuration de la requête');
  }
};
