import React, { useEffect, useState, useCallback }from "react";
import { ChevronsLeft } from "lucide-react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { CategorieListe } from "../../services/CategorieService";
import ListeSimple from "@/components/ListeSimple";


const SideBar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [catTab, setCatTab] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        ouvre: false,
        texte: "vide",
        statut: "success",
    });
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const donnes = await CategorieListe();
            if (donnes.data) {
                setCatTab(donnes.data);
            } else {
                setCatTab([]);
            }
        } catch (error) {
            console.error("Erreur de récupération :", error);
            setMessage({
                ouvre: true,
                texte: error.message,
                statut: "error",
            });
            setOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    const AffcheProduit = (categorie)  => {
        console.log(categorie)
    }

    return (
        <div className={`min-h-screen flex-col  transition-[margin] duration-300 ${collapsed ? "w-[40px] pt-4" : "p-4 w-[280px]"}  text-white`}>
            <div className={`flex flex-row text-black dark:text-white items-center  ${collapsed ? "gap-10" : "gap-6 mr-10"} `}>
                {!collapsed && <h1 className="text-lg font-bold">Catégorie de produit</h1>}
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
            </div>
            <div className="w-full">
                {!collapsed && (
                    <ul className="list text-black dark:text-white bg-transparent">
                        {loading ? (
                            <li key="charge">Chargement des categorie...</li>
                        ) : (
                            catTab.map((liste) => (
                                <ListeSimple
                                key={liste.codeCategorie}
                                labelle={liste.libelleCategorie}
                                categorie={liste}
                                AffcheProduit={AffcheProduit}
                                />
                            ))
                        )}
                    </ul>
                )}
            </div>
            {message.ouvre && (
                <Snackbar
                    open={open}
                    autoHideDuration={5000}
                    onClose={handleClose}
                >
                    <Alert
                        onClose={handleClose}
                        severity={message.statut}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {message.texte}
                    </Alert>
                </Snackbar>
            )}
        </div>
    );
};

export default SideBar;
