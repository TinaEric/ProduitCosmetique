import { createContext, useContext, useState } from "react";

const UsersContext = createContext();

export const useUsers = () => useContext(UsersContext);

export function UsersProvider({children}){
    const [client, setClient] = useState([])
    
    const value = {
        client,
        setClient
    }
    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    )
}
