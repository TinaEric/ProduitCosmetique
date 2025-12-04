import api from './api'; 
import {verifierReponse} from './verifierReponse';

export const ConfirmPaiement = async (confirmData) => {
    return await verifierReponse(() =>  api.post('/api/payment/confirm-payment', confirmData));
}
export const getcommandeDetails = async (refCommande) => {
    return await verifierReponse(() =>  api.get(`/api/commandes/${refCommande}`));
}
export const createPaymentIntent = async (refCommande) => {
    return await verifierReponse(() =>  api.post('/api/payment/create-payment-intent', refCommande ));
}