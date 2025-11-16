import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();

export const useNavbar = () => useContext(NavbarContext);

export const NavBarProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValue, setFilterValue] = useState('Tous');
    const [openPanier, setOpenPanier] = useState(false);
    const [nouveauteBtn, setNouveauteBtn] = useState(false);

    const value = {
        searchTerm,
        setSearchTerm,
        filterValue,
        setFilterValue,
        openPanier,
        setOpenPanier,
        nouveauteBtn,
        setNouveauteBtn
    };

    return (
        <NavbarContext.Provider value={value}>
            {children}
        </NavbarContext.Provider>
    );
};