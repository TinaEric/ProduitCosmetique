import { createContext, useContext,useState ,useEffect} from "react";

const PanierContext = createContext();

export function PanierProvider({children}){
    const [items, setItems] = useState([])
     const [Ismessage, setIsMessage] = useState(false);
    
    useEffect(() => {
        const panier = JSON.parse(localStorage.getItem('panier')) || []
        setItems(panier)
    }, [])
    
    const ajouteAuPanier = (produit) => {
        setItems((prev) => {
            const IsExist = prev.find((item) => item.id === produit.id);
            let newItems;
            
            if(IsExist){
                newItems = prev.map((item) => 
                    item.id === produit.id 
                    ? {...item, quantite: item.quantite + 1}
                    : item
                )
            } else {
                let qte = produit.quantite ? produit.quantite : 1;
                newItems = [...prev, {...produit, quantite: qte}]
            }
            
            localStorage.setItem('panier', JSON.stringify(newItems))
            return newItems
        })
    }

    const ajoutePanierModal = (produit) => {
        setItems((prev) => {
            const IsExist = prev.find((item) => item.id === produit.id);
            let newItems;
            const qte = produit.quantite ? produit.quantite : 1;

            if(IsExist){
                newItems = prev.map((item) => 
                    item.id === produit.id 
                    ? {...item, quantite: qte}
                    : item
                )
            } else {
                newItems = [...prev, {...produit, quantite: qte}]
            }
            
            localStorage.setItem('panier', JSON.stringify(newItems))
            return newItems
        })
    }
    
    const PlusQuantite = (id,stock,quantite) => {
        if (quantite < stock){
            setItems((prev) => {
                const newItems = prev.map((item) => 
                    item.id === id 
                    ? {...item, quantite: item.quantite + 1} 
                    : item
                )
                localStorage.setItem('panier', JSON.stringify(newItems))
                return newItems
            })
        }else{
            setIsMessage(true)
        }
    }

    const getQuantite = (id) => {
        const itemTrouve = items.find((item) => item.id === id);
        if (itemTrouve) {
            return itemTrouve.quantite;
        } else {
            return 1;
        }
    };
    
    const MoinsQuantite = (id) => {
        setItems((prev) => {
            const newItems = prev.map((item) => 
                item.id === id && item.quantite > 1
                ? {...item, quantite: item.quantite - 1}
                : item
            ).filter(item => item.quantite > 0)
            
            localStorage.setItem('panier', JSON.stringify(newItems))
            return newItems
        })
    }

    const supprimerDuPanier = (id) => {
        setItems((prev) => {
            const newItems = prev.filter((item) => item.id !== id)
            localStorage.setItem('panier', JSON.stringify(newItems))
            return newItems
        })
    }
    const value = {
        Ismessage,
        items,
        setItems,
        PlusQuantite,
        MoinsQuantite,
        ajouteAuPanier,
        supprimerDuPanier,
        setIsMessage,
        getQuantite,
        ajoutePanierModal
    }
    return (
        <PanierContext.Provider value={value}>
            {children}
        </PanierContext.Provider>
    )
}
export function usePanier(){
    return useContext(PanierContext)
}