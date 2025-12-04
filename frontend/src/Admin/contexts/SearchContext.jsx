import { use } from 'react';
import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState('Tous');
    const [filtreCat, setFiltreCat] = useState('Tous');
    const [filtreStock, setFiltreStock] = useState("Tous")
    const [filterStatus,setFilterStatus] = useState('tous')
    const [nbrNotification,setNbrNotification] = useState(0)
    const value = {
        searchTerm,
        setSearchTerm,
        filterValue,
        setFilterValue,
        filtreCat,
        setFiltreCat,
        filtreStock,
        setFiltreStock,
        filterStatus,
        setFilterStatus,
        nbrNotification,
        setNbrNotification
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};