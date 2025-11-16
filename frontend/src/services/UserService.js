import api from './api'; 
import {verifierReponse} from './verifierReponse';



export const registerUser = async (userData) => {
  try {
    console.log(userData)
    const response = await api.post('/api/auth/admin/register', userData); 
    if (response.data){
      return response.data;
    }
    return response.error;

  } catch (error) {
    console.log(" Loza : " + error.message)
    console.log("Trop be :  " + response.data)
    throw error; 
  }
};

export const UserListe = async () => {
  return await verifierReponse(() => api.get('/api/user/userAdmin'));
}
