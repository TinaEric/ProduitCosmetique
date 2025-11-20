

 // urlAxios : fonction mi- appeler anle axios ex: api.post('api/produit/)

export async function verifierReponse(urlAxios) {
    try{
        const response = await urlAxios();

        if (response.status === 200 && response.data?.data){
            return {data : response.data.data, error : null, statut : "success" , message :response.data.message }
        }
        if (response.data.error.code === 201 && response.data?.error.message){
            return { data: null, error: response.data.error.message || "Email non trouvé", statut : response.data.error.status };
        }

        if (response.status === 404 && response.data?.error?.message) {
            return { data: null, error: response.data.error.message, statut : response.data.error.status };
        }

        if (!response.data?.data && !response.data?.error) {
            return { data: null, error: 'Format de réponse invalide', statut : "error" };
        }

        if (response.status === 400 && response.data?.error?.message){
            return { data: null, error: 'Le format json envoyé est invalid' || response.data?.error?.message, statut : response.data.error.status };
        }
        
        if (response.status === 500) {
            return { data: null, error: " Une erreur serveur s'est produit! " . response  };
          }

          if (response.status === 409 && response.data?.error?.message) {
            return { data: null, error: response.data.error.message, statut : response.data.error.status };
          }
        
        if (response.status === 422 && response.data?.error?.message ) {
            return { data: null, error: response.data.error.message, statut : response.data.error.status};
          }
        return {data : null, error :`Reponse inattendue du serveur! code : ${response.data.error.code} message : ${response.data.error.message} `, statut :"error"}
    }
    catch(erreur){
        const status = erreur.response?.status;
        const message = erreur.response?.data?.error?.message || `Erreur inconnue:  ${erreur}`
         
        if(!erreur.response){
            return {data : null, error : "Erreur de réseau ou serveur inaccessible :" + erreur}
        }

        if (status === 401) {
            return { data: null, error: 'Accès non autorisé', statut : "error" };
          }

        return {data : null, error : message, statut : "error"}
        
    } 
}

// 200 : success
// 404 : donne non trouve
// 400 :  format json invalide
// 409 : donne existe deja
// 500 : server error
// 401 : access non autorise : authentification
// 422 : champ vide ou erreur de validation




