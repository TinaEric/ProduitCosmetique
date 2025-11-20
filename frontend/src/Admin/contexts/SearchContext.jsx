import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState('Tous');
    const [filtreCat, setFiltreCat] = useState('Tous');
    const [filtreStock, setFiltreStock] = useState("Tous")
    const value = {
        searchTerm,
        setSearchTerm,
        filterValue,
        setFilterValue,
        filtreCat,
        setFiltreCat,
        filtreStock,
        setFiltreStock
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};