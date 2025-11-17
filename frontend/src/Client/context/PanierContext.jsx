import { createContext, useContext,useState ,useEffect} from "react";

const PanierContext = createContext();

export function PanierProvider({children}){
    const [items, setItems] = useState([])
    
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
                newItems = [...prev, {...produit, quantite: 1}]
            }
            
            localStorage.setItem('panier', JSON.stringify(newItems))
            return newItems
        })
    }
    
    const PlusQuantite = (id) => {
        setItems((prev) => {
            const newItems = prev.map((item) => 
                item.id === id 
                ? {...item, quantite: item.quantite + 1}
                : item
            )
            localStorage.setItem('panier', JSON.stringify(newItems))
            return newItems
        })
    }
    
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
        items,
        setItems,
        PlusQuantite,
        MoinsQuantite,
        ajouteAuPanier,
        supprimerDuPanier
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